import React, { useEffect, useRef, useState } from 'react';
import { Loader2, Mic, Square } from 'lucide-react';

interface VoiceDictationButtonProps {
  mode: 'journal' | 'poem';
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

type DictationStatus = 'idle' | 'recording' | 'transcribing';

const MAX_RECORDING_SECONDS = 180;

function pickSupportedAudioMimeType(): string {
  if (typeof MediaRecorder === 'undefined') return '';
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg;codecs=opus',
  ];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) ?? '';
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('Could not read recorded audio.'));
        return;
      }
      const commaIndex = reader.result.indexOf(',');
      resolve(
        commaIndex >= 0 ? reader.result.slice(commaIndex + 1) : reader.result
      );
    };
    reader.onerror = () => reject(new Error('Failed to read audio recording.'));
    reader.readAsDataURL(blob);
  });
}

export const VoiceDictationButton: React.FC<VoiceDictationButtonProps> = ({
  mode,
  onTranscript,
  disabled = false,
}) => {
  const [status, setStatus] = useState<DictationStatus>('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isUnmountedRef = useRef(false);
  const modeRef = useRef(mode);
  const onTranscriptRef = useRef(onTranscript);

  useEffect(() => {
    modeRef.current = mode;
    onTranscriptRef.current = onTranscript;
  }, [mode, onTranscript]);

  function stopTracksAndTimer() {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  }

  useEffect(() => {
    isUnmountedRef.current = false;
    return () => {
      isUnmountedRef.current = true;
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== 'inactive'
      ) {
        try {
          mediaRecorderRef.current.stop();
        } catch {
          // Ignore stop errors during unmount
        }
      }
      stopTracksAndTimer();
    };
  }, []);

  async function transcribeAudioBlob(blob: Blob, fallbackMimeType: string) {
    if (isUnmountedRef.current) return;

    if (blob.size === 0) {
      setStatus('idle');
      setErrorMessage('No audio was captured. Please try again.');
      return;
    }

    setStatus('transcribing');
    setErrorMessage(null);

    try {
      const audioBase64 = await blobToBase64(blob);
      const mimeType = blob.type || fallbackMimeType || 'audio/webm';

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64,
          mimeType,
          mode: modeRef.current,
        }),
      });

      const data = (await response.json()) as {
        transcript?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(
          data.error || 'Voice transcription could not be completed.'
        );
      }

      const transcript = (data.transcript ?? '').trim();
      if (!transcript) {
        setErrorMessage(
          'No speech was detected. Try speaking slightly closer to the microphone.'
        );
      } else {
        onTranscriptRef.current(transcript);
      }
    } catch (error) {
      if (!isUnmountedRef.current) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Unable to transcribe audio right now.'
        );
      }
    } finally {
      if (!isUnmountedRef.current) {
        setStatus('idle');
        setElapsedSeconds(0);
      }
    }
  }

  async function startRecording() {
    setErrorMessage(null);

    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === 'undefined'
    ) {
      setErrorMessage(
        'Voice recording is not supported in this browser.'
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (isUnmountedRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      mediaStreamRef.current = stream;
      chunksRef.current = [];

      const mimeType = pickSupportedAudioMimeType();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const recordedBlob = new Blob(chunksRef.current, {
          type: recorder.mimeType || mimeType || 'audio/webm',
        });
        chunksRef.current = [];
        stopTracksAndTimer();
        void transcribeAudioBlob(recordedBlob, mimeType);
      };

      recorder.start(250);
      setStatus('recording');
      setElapsedSeconds(0);

      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => {
          const next = prev + 1;
          if (next >= MAX_RECORDING_SECONDS) {
            stopRecording();
          }
          return next;
        });
      }, 1000);
    } catch (error) {
      stopTracksAndTimer();
      const isPermissionDenied =
        error instanceof DOMException &&
        (error.name === 'NotAllowedError' ||
          error.name === 'PermissionDeniedError');
      setErrorMessage(
        isPermissionDenied
          ? 'Microphone access was blocked. Allow microphone permission to dictate.'
          : 'Could not access the microphone. Check your audio input device.'
      );
      setStatus('idle');
    }
  }

  function stopRecording() {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive'
    ) {
      mediaRecorderRef.current.stop();
    } else {
      stopTracksAndTimer();
      setStatus('idle');
    }
  }

  function handleClick() {
    if (status === 'recording') {
      stopRecording();
    } else if (status === 'idle') {
      void startRecording();
    }
  }

  const mins = Math.floor(elapsedSeconds / 60);
  const secs = String(elapsedSeconds % 60).padStart(2, '0');

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || status === 'transcribing'}
        aria-pressed={status === 'recording'}
        aria-label={
          status === 'recording'
            ? 'Stop voice recording and transcribe'
            : status === 'transcribing'
              ? 'Transcribing voice recording'
              : `Speak ${mode} with microphone`
        }
        className={`min-h-[38px] px-3.5 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-all cursor-pointer disabled:opacity-65 disabled:cursor-wait ${
          status === 'recording'
            ? 'bg-[#991B1B] hover:bg-[#7F1D1D] text-[#FCF9F0] shadow-sm'
            : status === 'transcribing'
              ? 'bg-[#1D3E6E] text-[#FCF9F0]'
              : 'bg-[#FCF9F0] text-[#145252] border border-[#12233B]/15 hover:border-[#145252]/50'
        }`}
      >
        {status === 'recording' ? (
          <>
            <Square className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
            <span className="font-mono tabular-nums">
              Stop · {mins}:{secs}
            </span>
          </>
        ) : status === 'transcribing' ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
            <span>Transcribing…</span>
          </>
        ) : (
          <>
            <Mic className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Speak</span>
          </>
        )}
      </button>

      {errorMessage && (
        <p
          role="status"
          className="text-[11px] text-[#991B1B] text-right max-w-[260px]"
        >
          {errorMessage}
        </p>
      )}
    </div>
  );
};

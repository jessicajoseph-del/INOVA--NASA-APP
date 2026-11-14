import React, { useEffect, useRef, useState } from 'react';
import {
  BookOpen,
  Check,
  Download,
  Feather,
  Mic,
  Pencil,
  Square,
  Trash2,
} from 'lucide-react';
import { PartBEntry } from '../types/assessment';
import { VoiceDictationButton } from './VoiceDictationButton';

interface ReflectionsViewProps {
  entries: PartBEntry[];
  currentDraftDay: number;
  onSaveReflection: (type: 'journal' | 'poem', text: string) => void;
  onEditDayReflection: (day: number) => void;
  onDeleteReflection: (day: number) => void;
  onGoToDaily: () => void;
  onExportJson: () => void;
  onClearAllData: () => void;
}

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionEventLike extends Event {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: SpeechRecognitionResultLike;
  };
}

interface SpeechRecognitionErrorEventLike extends Event {
  error: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null;
  const win = window as Window & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return win.SpeechRecognition ?? win.webkitSpeechRecognition ?? null;
}

export const ReflectionsView: React.FC<ReflectionsViewProps> = ({
  entries,
  currentDraftDay,
  onSaveReflection,
  onEditDayReflection,
  onDeleteReflection,
  onGoToDaily,
  onExportJson,
  onClearAllData,
}) => {
  const [confirmClear, setConfirmClear] = useState(false);
  const [composerType, setComposerType] = useState<'journal' | 'poem'>('journal');
  const [composerText, setComposerText] = useState('');
  const [interimText, setInterimText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [savedNoticeDay, setSavedNoticeDay] = useState<number | null>(null);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const isListeningRef = useRef(false);
  const composerTypeRef = useRef(composerType);

  useEffect(() => {
    composerTypeRef.current = composerType;
  }, [composerType]);

  const webSpeechSupported = getSpeechRecognitionConstructor() !== null;

  const reflections = [...entries]
    .filter((e) => e.reflection && e.reflection.trim().length > 0)
    .sort((a, b) => b.day - a.day);

  const appendSpokenText = (
    base: string,
    spoken: string,
    mode: 'journal' | 'poem'
  ): string => {
    const clean = spoken.trim();
    if (!clean) return base;
    if (!base.trim()) return clean.slice(0, 10000);
    if (mode === 'poem' || base.endsWith('\n')) {
      const separator = base.endsWith('\n') ? '' : '\n';
      return `${base}${separator}${clean}`.slice(0, 10000);
    }
    const separator = base.endsWith(' ') ? '' : ' ';
    return `${base}${separator}${clean}`.slice(0, 10000);
  };

  const stopWebSpeech = () => {
    isListeningRef.current = false;
    setIsListening(false);
    setInterimText('');
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore stop errors if already ended
      }
      recognitionRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      isListeningRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Ignore abort errors on unmount
        }
        recognitionRef.current = null;
      }
    };
  }, []);

  const toggleWebSpeech = () => {
    setSpeechError(null);

    if (isListeningRef.current) {
      stopWebSpeech();
      return;
    }

    const RecognitionCtor = getSpeechRecognitionConstructor();
    if (!RecognitionCtor) {
      setSpeechError(
        'Web Speech API is not supported in this browser. Try Chrome, Edge, or Safari.'
      );
      return;
    }

    try {
      const recognition = new RecognitionCtor();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang =
        (typeof navigator !== 'undefined' && navigator.language) || 'en-US';

      recognition.onresult = (event) => {
        let finalizedChunk = '';
        let interimChunk = '';

        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const result = event.results[i];
          const transcript = result?.[0]?.transcript ?? '';
          if (result?.isFinal) {
            finalizedChunk = finalizedChunk
              ? `${finalizedChunk} ${transcript.trim()}`
              : transcript.trim();
          } else {
            interimChunk += transcript;
          }
        }

        if (finalizedChunk) {
          setComposerText((prev) =>
            appendSpokenText(prev, finalizedChunk, composerTypeRef.current)
          );
        }
        setInterimText(interimChunk.trim());
      };

      recognition.onerror = (event) => {
        if (event.error === 'aborted' && !isListeningRef.current) {
          return;
        }
        if (
          event.error === 'not-allowed' ||
          event.error === 'service-not-allowed'
        ) {
          setSpeechError(
            'Microphone access was blocked. Allow microphone permission to dictate.'
          );
        } else if (event.error === 'no-speech') {
          setSpeechError('No speech detected. Speak clearly and try again.');
        } else if (event.error === 'network') {
          setSpeechError(
            'Browser speech recognition network error. Check your connection.'
          );
        } else {
          setSpeechError(`Speech recognition error (${event.error}).`);
        }
        isListeningRef.current = false;
        setIsListening(false);
        setInterimText('');
        recognitionRef.current = null;
      };

      recognition.onend = () => {
        isListeningRef.current = false;
        setIsListening(false);
        setInterimText('');
        recognitionRef.current = null;
      };

      recognitionRef.current = recognition;
      isListeningRef.current = true;
      setIsListening(true);
      recognition.start();
    } catch {
      isListeningRef.current = false;
      setIsListening(false);
      setSpeechError('Could not start microphone dictation.');
    }
  };

  const handleAppendGeminiTranscript = (transcript: string) => {
    setComposerText((prev) =>
      appendSpokenText(prev, transcript, composerTypeRef.current)
    );
  };

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (isListeningRef.current) {
      stopWebSpeech();
    }
    const trimmed = composerText.trim();
    if (!trimmed) return;
    onSaveReflection(composerType, trimmed);
    setComposerText('');
    setInterimText('');
    setSavedNoticeDay(currentDraftDay);
    setTimeout(() => setSavedNoticeDay(null), 2600);
  };

  const displayedComposerValue = interimText
    ? appendSpokenText(composerText, interimText, composerType)
    : composerText;

  return (
    <div className="space-y-6">
      {/* Main Oat Yellow Reflections Card */}
      <div className="bg-[#F7F0DC] text-[#12233B] rounded-[28px] p-5 sm:p-8 shadow-2xl shadow-[#060E1B]/45 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="text-xs text-[#4A5C75]">
              CrewMind · Expressive Space
            </div>
            <h2 className="font-display text-2xl sm:text-[28px] font-bold tracking-tight text-[#12233B]">
              Journal &amp; Poetry
            </h2>
            <p className="text-xs sm:text-sm text-[#4A5C75] leading-relaxed max-w-2xl">
              Write or speak your reflections. Writing is never scored, analyzed, or used to assign a clinical label.
            </p>
          </div>

          <button
            type="button"
            onClick={onGoToDaily}
            className="min-h-[42px] px-4 py-2 rounded-full bg-[#FCF9F0] border border-[#12233B]/15 hover:border-[#1D3E6E]/45 text-[#1D3E6E] text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Feather className="w-3.5 h-3.5" />
            <span>Open Full Daily Check</span>
          </button>
        </div>

        {/* Grounding trio from CrewMind (Pause / Express / Connect) */}
        <div className="pt-4 border-t border-[#12233B]/10 grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            [
              'Pause',
              'Take a moment to notice what you are feeling, without judging it.',
            ],
            [
              'Express',
              'Write plainly, speak aloud, or use poetry. Your words do not have to be polished.',
            ],
            [
              'Connect',
              'If you want support, consider speaking with someone you trust.',
            ],
          ].map(([title, copy]) => (
            <div key={title} className="space-y-1">
              <h3 className="text-sm font-semibold text-[#1D3E6E]">{title}</h3>
              <p className="text-xs sm:text-sm text-[#4A5C75] leading-relaxed">
                {copy}
              </p>
            </div>
          ))}
        </div>

        {/* Voice & Text Reflection Composer */}
        <form
          onSubmit={handleSaveEntry}
          className="rounded-2xl bg-[#FCF9F0] border border-[#12233B]/12 p-4 sm:p-5 space-y-3.5"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              {(['journal', 'poem'] as const).map((type) => {
                const active = composerType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setComposerType(type)}
                    className={`min-h-[38px] px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all cursor-pointer ${
                      active
                        ? 'bg-[#1D3E6E] text-[#FCF9F0]'
                        : 'bg-[#F7F0DC] text-[#365073] border border-[#12233B]/12'
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
              <span className="text-xs font-mono tabular-nums text-[#566A86] pl-1">
                FD {currentDraftDay}
              </span>
            </div>

            <div className="flex flex-col items-end gap-1">
              {webSpeechSupported ? (
                <button
                  type="button"
                  onClick={toggleWebSpeech}
                  aria-pressed={isListening}
                  aria-label={
                    isListening
                      ? 'Stop voice dictation'
                      : `Dictate ${composerType} with microphone`
                  }
                  className={`min-h-[38px] px-3.5 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                    isListening
                      ? 'bg-[#991B1B] hover:bg-[#7F1D1D] text-[#FCF9F0] shadow-sm'
                      : 'bg-[#F7F0DC] text-[#145252] border border-[#12233B]/15 hover:border-[#145252]/50'
                  }`}
                >
                  {isListening ? (
                    <>
                      <Square className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                      <span>Listening · Stop</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Dictate</span>
                    </>
                  )}
                </button>
              ) : (
                <VoiceDictationButton
                  mode={composerType}
                  onTranscript={handleAppendGeminiTranscript}
                />
              )}

              {speechError && (
                <p
                  role="status"
                  className="text-[11px] text-[#991B1B] text-right max-w-[260px]"
                >
                  {speechError}
                </p>
              )}
            </div>
          </div>

          <label
            htmlFor="gallery-reflection-input"
            className="block text-xs text-[#4A5C75]"
          >
            {composerType === 'journal'
              ? 'What did today feel like? Tap the microphone to dictate live into the box, or type below.'
              : 'If your feelings were a landscape, what would it look like? Tap the microphone to dictate, or write below.'}
          </label>

          <textarea
            id="gallery-reflection-input"
            rows={4}
            maxLength={10000}
            value={displayedComposerValue}
            onChange={(e) => {
              if (isListening) {
                stopWebSpeech();
              }
              setComposerText(e.target.value);
            }}
            placeholder={
              composerType === 'journal'
                ? 'Something that stayed with me today...'
                : 'Between the quiet stars...'
            }
            className={`w-full rounded-2xl bg-[#F7F0DC]/55 border p-3.5 text-sm text-[#12233B] placeholder:text-[#6B7E98] leading-relaxed focus:outline-none focus:ring-2 transition-colors ${
              isListening
                ? 'border-[#145252] focus:border-[#145252] focus:ring-[#145252]/20'
                : 'border-[#12233B]/15 focus:border-[#1D3E6E] focus:ring-[#1D3E6E]/15'
            } ${composerType === 'poem' ? 'font-serif text-base' : ''}`}
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-[11px] font-mono tabular-nums text-[#566A86]">
              {composerText.length.toLocaleString()}/10,000 characters
              {isListening && (
                <span className="ml-3 font-sans font-medium text-[#145252]">
                  {interimText ? 'Transcribing live…' : 'Listening for speech…'}
                </span>
              )}
              {savedNoticeDay !== null && (
                <span className="ml-3 font-sans font-semibold text-[#145252] inline-flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                  Saved to Flight Day {savedNoticeDay}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={!composerText.trim()}
              className="min-h-[42px] px-5 py-2 rounded-full bg-[#145252] hover:bg-[#0F3F3F] disabled:opacity-45 disabled:cursor-not-allowed text-[#FCF9F0] text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Feather className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Save to Flight Day {currentDraftDay}</span>
            </button>
          </div>
        </form>

        {/* Reflections Gallery */}
        <div className="pt-5 border-t border-[#12233B]/10">
          {reflections.length === 0 ? (
            <div className="rounded-2xl bg-[#FCF9F0] border border-dashed border-[#12233B]/20 p-8 text-center space-y-3">
              <BookOpen className="w-6 h-6 text-[#566A86] mx-auto" />
              <p className="text-sm text-[#4A5C75]">
                No reflections saved yet. Speak or write one above, or add a reflection inside your Daily Check.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reflections.map((entry) => {
                const isPoem = entry.reflectionType === 'poem';
                return (
                  <article
                    key={entry.day}
                    className="rounded-2xl bg-[#FCF9F0] border border-[#12233B]/10 p-5 flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-[#566A86]">
                        <span className="capitalize font-semibold text-[#145252]">
                          {entry.reflectionType ?? 'journal'}
                        </span>
                        <span className="font-mono tabular-nums">
                          Flight Day {entry.day}
                        </span>
                      </div>

                      <p
                        className={`whitespace-pre-wrap break-words text-[#12233B] leading-relaxed ${
                          isPoem ? 'font-serif text-base sm:text-lg' : 'text-sm'
                        }`}
                      >
                        {entry.reflection}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#12233B]/8 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => onEditDayReflection(entry.day)}
                        className="min-h-[36px] text-xs font-semibold text-[#1D3E6E] hover:underline inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Edit in Daily Check</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteReflection(entry.day)}
                        aria-label={`Delete reflection for Day ${entry.day}`}
                        className="min-h-[36px] px-2.5 text-xs text-[#566A86] hover:text-[#991B1B] inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* CrewMind Data Control Footer (Export JSON & Clear Browser Data) */}
        <div className="pt-5 border-t border-[#12233B]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-xs text-[#566A86] leading-relaxed max-w-xl">
            Local prototype · No cloud sync. Entries stay in this browser profile only. Exported JSON files contain your check-ins, reflections, and PVT sessions—handle them carefully.
          </p>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onExportJson}
              className="min-h-[42px] px-4 py-2 rounded-full bg-[#FCF9F0] border border-[#12233B]/15 hover:border-[#1D3E6E]/45 text-xs font-semibold text-[#1D3E6E] inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>

            {!confirmClear ? (
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                className="min-h-[42px] px-4 py-2 rounded-full bg-[#FCF9F0] border border-[#12233B]/15 hover:border-[#991B1B]/45 text-xs font-semibold text-[#991B1B] inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Local Data</span>
              </button>
            ) : (
              <div className="inline-flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    onClearAllData();
                    setConfirmClear(false);
                  }}
                  className="min-h-[42px] px-4 py-2 rounded-full bg-[#991B1B] text-[#FCF9F0] text-xs font-semibold cursor-pointer"
                >
                  Confirm Clear
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="min-h-[42px] px-3 py-2 rounded-full bg-[#FCF9F0] border border-[#12233B]/15 text-xs font-medium text-[#4A5C75] cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

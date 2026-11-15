import { useEffect, useRef } from 'react';

const MODEL_URL = `${import.meta.env.BASE_URL}models`;
const ANALYSIS_INTERVAL_MS = 1000;

export interface ExpressionSample {
  expression: string;
  probability: number;
}

export interface ExpressionSummary {
  expression: string;
  sampleCount: number;
  frequency: number;
  averageProbability: number;
}

interface ExpressionMonitorProps {
  enabled: boolean;
  onSample: (sample: ExpressionSample) => void;
  onMonitoringChange: (active: boolean) => void;
  onError: (message: string) => void;
  onStreamChange?: (stream: MediaStream | null) => void;
  onCameraStateChange?: (state: 'starting' | 'active' | 'stopped' | 'error') => void;
}

let faceApiLoadPromise: Promise<any> | null = null;

function loadFaceApi() {
  if (!faceApiLoadPromise) {
    faceApiLoadPromise = (async () => {
      if (typeof window !== 'undefined' && (window as any).faceapi) {
        return (window as any).faceapi;
      }
      try {
        const mod = await import(/* @vite-ignore */ 'face-api.js');
        return mod.default || mod;
      } catch {
        if (typeof window !== 'undefined' && (window as any).faceapi) {
          return (window as any).faceapi;
        }
        throw new Error('Facial expression detection module is offline.');
      }
    })()
      .then(async (faceapi) => {
        try {
          await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
            faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
          ]);
        } catch (error) {
          console.error('Local expression model loading failed.', error);
          throw new Error(
            `Local expression model loading failed. Confirm the model files are deployed under ${MODEL_URL}.`
          );
        }
        return faceapi;
      })
      .catch((error: unknown) => {
        faceApiLoadPromise = null;
        throw error;
      });
  }
  return faceApiLoadPromise;
}

function getCameraErrorMessage(error: unknown) {
  if (!(error instanceof Error)) return 'Camera analysis failed. Please retry.';
  if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
    return 'Camera permission was denied. Allow camera access in your browser settings, then retry.';
  }
  if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
    return 'No camera was found on this device.';
  }
  if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
    return 'The camera is already in use by another application.';
  }
  if (error.message.includes('Local expression model loading failed')) {
    return `The local expression models could not be loaded. Confirm the model files are deployed under ${MODEL_URL}.`;
  }
  return error.message || 'Camera analysis failed. Please retry.';
}

export function summarizeExpressionSamples(
  samples: ExpressionSample[]
): ExpressionSummary | null {
  if (samples.length === 0) return null;

  const grouped = new Map<string, { count: number; probabilityTotal: number }>();
  for (const sample of samples) {
    const current = grouped.get(sample.expression) ?? {
      count: 0,
      probabilityTotal: 0,
    };
    current.count += 1;
    current.probabilityTotal += sample.probability;
    grouped.set(sample.expression, current);
  }

  const [expression, result] = [...grouped.entries()].sort(
    ([, left], [, right]) => right.count - left.count
  )[0];

  return {
    expression,
    sampleCount: samples.length,
    frequency: result.count / samples.length,
    averageProbability: result.probabilityTotal / result.count,
  };
}

export function ExpressionMonitor({
  enabled,
  onSample,
  onMonitoringChange,
  onError,
  onStreamChange,
  onCameraStateChange,
}: ExpressionMonitorProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    let stream: MediaStream | null = null;
    let analysisTimer: number | null = null;
    let reportedActive = false;
    let reportedStream = false;
    onCameraStateChange?.('starting');

    const setMonitoring = (active: boolean) => {
      if (reportedActive === active) return;
      reportedActive = active;
      onMonitoringChange(active);
    };

    const stopStream = () => {
      stream?.getTracks().forEach((track) => track.stop());
      stream = null;
    };

    const fail = (error: unknown) => {
      if (cancelled) return;
      console.error('On-device expression analysis failed.', error);
      if (analysisTimer !== null) window.clearTimeout(analysisTimer);
      stopStream();
      if (reportedStream) {
        reportedStream = false;
        onStreamChange?.(null);
      }
      if (videoRef.current) videoRef.current.srcObject = null;
      setMonitoring(false);
      onCameraStateChange?.('error');
      onError(getCameraErrorMessage(error));
    };

    const startAnalysis = async () => {
      try {
        const faceapi = await loadFaceApi();
        if (cancelled) return;

        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('Camera access requires HTTPS or localhost.');
        }

        stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: 'user' },
        });
        if (cancelled) {
          stopStream();
          return;
        }
        reportedStream = true;
        onStreamChange?.(stream);

        const video = videoRef.current;
        if (!video) throw new Error('The local camera capture could not be initialized.');
        video.srcObject = stream;
        await video.play();
        setMonitoring(true);
        onCameraStateChange?.('active');

        const analyzeFrame = async () => {
          if (cancelled || !stream?.active) return;
          if (video.readyState < 2) {
            analysisTimer = window.setTimeout(analyzeFrame, 250);
            return;
          }

          try {
            const result = await faceapi
              .detectSingleFace(
                video,
                new faceapi.TinyFaceDetectorOptions({
                  inputSize: 224,
                  scoreThreshold: 0.5,
                })
              )
              .withFaceExpressions();

            if (cancelled) return;
            if (result) {
              const bestExpression = result.expressions.asSortedArray()[0];
              if (bestExpression) {
                onSample({
                  expression: bestExpression.expression,
                  probability: bestExpression.probability,
                });
              }
            }
          } catch (analysisError) {
            fail(analysisError);
            return;
          }

          analysisTimer = window.setTimeout(analyzeFrame, ANALYSIS_INTERVAL_MS);
        };

        await analyzeFrame();
      } catch (cameraError) {
        fail(cameraError);
      }
    };

    void startAnalysis();

    return () => {
      cancelled = true;
      if (analysisTimer !== null) window.clearTimeout(analysisTimer);
      stopStream();
      if (reportedStream) onStreamChange?.(null);
      if (videoRef.current) videoRef.current.srcObject = null;
      if (reportedActive) onMonitoringChange(false);
      onCameraStateChange?.('stopped');
    };
  }, [enabled, onCameraStateChange, onError, onMonitoringChange, onSample, onStreamChange]);

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      aria-hidden="true"
      tabIndex={-1}
      className="hidden"
    />
  );
}

import React from 'react';
import { Camera, ShieldCheck, X } from 'lucide-react';

export interface ExpressionConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgree: () => void;
  onSkip: () => void;
  onStop: () => void;
  status: 'idle' | 'starting' | 'active' | 'error' | 'skipped';
  enabled: boolean;
  error?: string;
}

export const ExpressionConsentModal: React.FC<ExpressionConsentModalProps> = ({
  isOpen,
  onClose,
  onAgree,
  onSkip,
  onStop,
  status,
  enabled,
  error,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="expression-consent-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-3xl bg-[#FCF9F0] border border-[#12233B]/20 p-6 sm:p-7 shadow-2xl text-[#12233B] space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-5 right-5 p-1.5 rounded-full text-[#4A5C75] hover:text-[#12233B] hover:bg-[#12233B]/8 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon + Title */}
        <div className="flex items-center gap-3 pr-8">
          <div className="w-10 h-10 rounded-2xl bg-[#12233B]/10 flex items-center justify-center text-[#12233B] shrink-0">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#145252]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Privacy-First Biometrics</span>
            </div>
            <h2
              id="expression-consent-title"
              className="font-display text-xl font-bold text-[#12233B]"
            >
              Optional private expression check
            </h2>
          </div>
        </div>

        {/* Exact Privacy & Consent Disclosure */}
        <p className="text-sm leading-relaxed text-[#4A5C75]">
          If you opt in, your camera preview stays hidden while a local model samples
          facial-expression estimates during today&apos;s check. Only temporary labels and
          scores are kept in page memory; no video, frames, or face descriptors are
          saved. Sampling stops when you submit or stop it. Account sharing is not
          available until Firestore security rules are confirmed, and nothing will be
          uploaded now.
        </p>

        {/* Live Feedback / State */}
        {status === 'active' && (
          <div className="p-3 rounded-xl bg-[#145252]/10 border border-[#145252]/20 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse shrink-0" />
            <p className="text-xs font-semibold text-[#145252]" aria-live="polite">
              Local sampling is active. The camera preview remains completely hidden.
            </p>
          </div>
        )}

        {status === 'starting' && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <p className="text-xs font-semibold text-[#854D0E]" aria-live="polite">
              Loading local models and requesting camera permission…
            </p>
          </div>
        )}

        {status === 'skipped' && (
          <div className="p-3 rounded-xl bg-[#12233B]/5 border border-[#12233B]/10">
            <p className="text-xs text-[#4A5C75]" aria-live="polite">
              Skipped. No camera data is currently being collected.
            </p>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <p className="text-xs font-medium text-red-800" role="alert">
              {error}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 flex flex-wrap items-center justify-end gap-2.5 border-t border-[#12233B]/10">
          {enabled ? (
            <>
              <button
                type="button"
                onClick={() => {
                  onStop();
                  onClose();
                }}
                className="min-h-10 rounded-full border border-red-600/30 px-5 py-2 text-xs sm:text-sm font-semibold text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
              >
                Stop and discard
              </button>
              <button
                type="button"
                onClick={onClose}
                className="min-h-10 rounded-full bg-[#12233B] px-5 py-2 text-xs sm:text-sm font-semibold text-[#FCF9F0] hover:bg-[#1C3558] transition-colors cursor-pointer"
              >
                Keep Active &amp; Close
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  onSkip();
                  onClose();
                }}
                className="min-h-10 rounded-full border border-[#12233B]/25 px-5 py-2 text-xs sm:text-sm font-semibold text-[#12233B] hover:bg-[#12233B]/5 transition-colors cursor-pointer"
              >
                Skip
              </button>
              <button
                type="button"
                onClick={() => {
                  onAgree();
                  onClose();
                }}
                className="min-h-10 rounded-full bg-[#12233B] px-5 py-2 text-xs sm:text-sm font-semibold text-[#FCF9F0] hover:bg-[#1C3558] transition-colors shadow-md cursor-pointer"
              >
                I agree — start local check
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

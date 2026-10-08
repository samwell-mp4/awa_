import React from "react";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

interface LessonNavigationProps {
  onPrevious?: () => void;
  onContinue?: () => void;
  previousDisabled?: boolean;
  continueDisabled?: boolean;
  previousLabel?: string;
  continueLabel?: string;
  statusText?: string;
  isCompleted?: boolean;
  isStickyMobile?: boolean;
  className?: string;
}

export function LessonNavigation({
  onPrevious,
  onContinue,
  previousDisabled = false,
  continueDisabled = false,
  previousLabel = "Anterior",
  continueLabel = "Continuar",
  statusText,
  isCompleted = false,
  isStickyMobile = true,
  className = "",
}: LessonNavigationProps) {
  return (
    <div
      className={`flex items-center justify-between gap-3 border-t border-[#6d4220]/40 bg-[#1e130a]/95 px-4 py-3 backdrop-blur-md ${
        isStickyMobile
          ? "sticky bottom-0 z-30 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:relative lg:bottom-auto lg:z-auto lg:rounded-2xl lg:border lg:p-4"
          : "rounded-2xl border border-[#6d4220]/40 p-4"
      } ${className}`}
    >
      {/* Previous Action */}
      {onPrevious ? (
        <button
          type="button"
          onClick={onPrevious}
          disabled={previousDisabled}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#6d4220] bg-[#28190e] px-3.5 py-2 text-xs sm:text-sm font-semibold text-[#d4a373] transition hover:bg-[#331f13] hover:text-[#fdfaf3] disabled:opacity-40 disabled:pointer-events-none active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">{previousLabel}</span>
        </button>
      ) : (
        <div />
      )}

      {/* Middle Status / Indicator */}
      {statusText && (
        <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#ffd166] text-center">
          {isCompleted && <CheckCircle2 className="h-4 w-4 text-[#4ade80]" />}
          <span>{statusText}</span>
        </div>
      )}

      {/* Primary Action (Continuar) */}
      {onContinue ? (
        <button
          type="button"
          onClick={onContinue}
          disabled={continueDisabled}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#4ade80] to-[#22c55e] px-5 py-2.5 text-xs sm:text-sm font-extrabold text-[#0d2818] shadow-md transition hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
        >
          <span>{continueLabel}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      ) : (
        <div />
      )}
    </div>
  );
}

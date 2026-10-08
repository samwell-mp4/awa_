import React from "react";
import { FolderSearch, type LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon = FolderSearch,
  title,
  description,
  actionLabel,
  onAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center rounded-2xl border border-[#6d4220]/50 bg-[#1e130a]/80 p-8 sm:p-12 ${className}`}
    >
      <div className="grid h-12 w-12 place-items-center rounded-2xl border border-[#8d5b2d] bg-[#28190e] text-[#ffd166] shadow-sm mb-3">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="font-display text-lg sm:text-xl font-bold text-[#fdfaf3]">
        {title}
      </h3>
      <p className="mt-1.5 max-w-md text-xs sm:text-sm text-[#d4a373] leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 inline-flex items-center gap-2 rounded-xl border border-[#8d5b2d] bg-[#28190e] px-4 py-2 text-xs sm:text-sm font-semibold text-[#ffd166] transition hover:bg-[#331f13] hover:border-[#ffd166] active:scale-95"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

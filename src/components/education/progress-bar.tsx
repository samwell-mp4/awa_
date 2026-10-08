import React from "react";

interface ProgressBarProps {
  value: number; // 0 to 100
  label?: string;
  sublabel?: string;
  showPercent?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ProgressBar({
  value,
  label,
  sublabel,
  showPercent = true,
  size = "md",
  className = "",
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, Math.round(value)));

  const heights = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercent) && (
        <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-[#d4a373]">
          <span className="flex items-center gap-1.5">
            {label && <span className="text-[#fdfaf3]">{label}</span>}
            {sublabel && <span className="text-xs text-[#a37953]">({sublabel})</span>}
          </span>
          {showPercent && <span className="font-bold text-[#ffd166]">{clamped}%</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        className={`w-full overflow-hidden rounded-full bg-[#180d05] border border-[#6d4220]/50 ${heights[size]}`}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#ffd166] via-[#f59e0b] to-[#4ade80] transition-all duration-300 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

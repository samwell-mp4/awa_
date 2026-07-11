import type { ReactNode } from "react";

export function Stat({
  icon,
  label,
  value,
  sub,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="px-1">
      <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-foreground/70">
        {icon} {label}
      </div>
      <div className="mt-0.5 font-display text-2xl font-black text-cream">{value}</div>
      <div className="text-[10px] text-foreground/60">{sub}</div>
    </div>
  );
}

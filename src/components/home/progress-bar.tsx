export function ProgressBar({ value, className = "" }: { value: number; className?: string }) {
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-card/80 ${className}`}>
      <div
        className="h-full rounded-full bg-[var(--gradient-leaf)] transition-all"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

import logoSrc from "@/assets/awa-tech-logo.png";

export function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <img
        src={logoSrc}
        alt="AWÃ TECH"
        className="h-12 w-12 shrink-0 rounded-full bg-cream/95 p-0.5 shadow-[var(--shadow-glow)] ring-1 ring-gold/40 object-contain"
      />
      <div className="leading-none">
        <div className="font-display text-xl font-black tracking-tight text-cream">
          AWÃ <span className="text-leaf">TECH</span>
        </div>
        <div className="mt-0.5 text-[10px] font-semibold tracking-[0.18em] text-gold/80">
          CULTURAS VIVAS
        </div>
      </div>
    </div>
  );
}

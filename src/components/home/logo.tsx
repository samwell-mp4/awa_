import logoSrc from "@/assets/awa-tech-logo.png";

export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative shrink-0">
        <div className="absolute -inset-1 rounded-full bg-[var(--gradient-gold)] opacity-30 blur-md" />
        <img
          src={logoSrc}
          alt="AWÃ TECH"
          className="relative h-12 w-12 rounded-full bg-cream/95 p-0.5 ring-2 ring-gold/50 object-contain shadow-[var(--shadow-gold)]"
        />
      </div>
      <div className="leading-none">
        <div className="font-display text-xl font-black tracking-tight text-cream">
          AWÃ <span className="text-gradient-gold">TECH</span>
        </div>
        <div className="mt-1 text-[10px] font-semibold tracking-[0.22em] text-gold/80">
          CULTURAS VIVAS
        </div>
      </div>
    </div>

  );
}

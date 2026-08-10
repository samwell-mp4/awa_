import { useTranslation } from "react-i18next";
import logoSrc from "@/assets/awa-tech-logo.png";

export function Logo() {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-3">
      <div className="relative shrink-0">
        <div className="absolute -inset-1 rounded-full bg-[var(--gradient-gold)] opacity-30 blur-md" />
        <div className="relative h-12 w-12 rounded-full bg-cream/95 p-0.5 ring-2 ring-gold/50 flex items-center justify-center shadow-[var(--shadow-gold)]">
          <span className="font-display text-xl font-black text-forest-deep">A</span>
        </div>
      </div>
      <div className="leading-none">
        <div className="font-display text-xl font-black tracking-tight text-cream">
          AWÃ <span className="text-gradient-gold">TECH</span>
        </div>
        <div className="mt-1 text-[10px] font-semibold tracking-[0.22em] text-gold/80">
          {t("common.tagline")}
        </div>
      </div>
    </div>

  );
}

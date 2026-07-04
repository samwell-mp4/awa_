import { Award, Flame, Sparkles, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import heroAsset from "@/assets/awa-hero.jpg.asset.json";
import { Stat } from "./stat";

const heroWoman = heroAsset.url;

export function HeroSection() {
  const { t } = useTranslation();
  return (
    <section id="início" className="relative mt-6 overflow-hidden rounded-[2rem] card-elev">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "var(--gradient-hero-glow)" }}
      />
      <div className="relative grid md:grid-cols-2">
        <div className="relative order-2 md:order-1 p-6 md:p-12">
          <span className="chip-gold inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]">
            <Sparkles className="h-3.5 w-3.5" /> {t("hero.badge")}
          </span>
          <h1 className="mt-5 font-display text-[2rem] font-black leading-[1.05] text-cream sm:text-4xl md:text-5xl lg:text-6xl break-words">
            {t("hero.title1")} <span className="text-leaf">{t("hero.title2")}</span>
            {t("hero.title3")}{" "}
            <span className="text-gradient-gold">{t("hero.title4")}</span>.
          </h1>
          <div className="divider-gold my-5 w-24" />
          <p className="max-w-md text-[15px] leading-relaxed text-foreground/80">
            {t("hero.subtitle")}
          </p>

          <div className="mt-8 grid grid-cols-3 gap-2 rounded-2xl border border-gold/25 bg-[oklch(0.14_0.04_145/0.7)] p-3 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <Stat icon={<Flame className="h-4 w-4 text-gold" />} label={t("hero.sequencia")} value="7" sub={t("hero.dias")} />
            <Stat icon={<Star className="h-4 w-4 text-gold" />} label={t("hero.pontos")} value="250" sub={t("hero.pontosSub")} />
            <Stat icon={<Award className="h-4 w-4 text-gold" />} label={t("hero.nivel")} value="2" sub={t("hero.nivelSub")} />
          </div>
        </div>

        <div className="relative order-1 md:order-2 min-h-[300px] md:min-h-[560px]">
          <img
            src={heroWoman}
            alt="Mulher indígena brasileira com cocar tradicional na floresta amazônica"
            width={1024}
            height={1536}
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent md:bg-gradient-to-r md:from-card md:via-card/10 md:to-transparent" />
          <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full border border-gold/40 bg-card/85 px-3 py-1.5 backdrop-blur-md shadow-[var(--shadow-gold)]">
            <div className="grid h-7 w-7 place-items-center rounded-full bg-[var(--gradient-gold)] text-[10px] font-black text-forest-deep">
              AK
            </div>
            <div className="text-xs leading-tight">
              <div className="text-foreground/70">{t("hero.ola")}</div>
              <div className="font-bold text-gold">Akuá!</div>
            </div>
          </div>
        </div>
      </div>
      <div className="tribal-border absolute bottom-0 left-0 right-0" />
    </section>
  );
}

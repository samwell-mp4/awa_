import { ScrollText, Video, type LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

export function ResourcesSection() {
  const { t } = useTranslation();
  const cards: { icon: LucideIcon; label: string; desc: string }[] = [
    { icon: ScrollText, label: t("home.resourceHistoriasLabel"), desc: t("home.resourceHistoriasDesc") },
    { icon: Video, label: t("home.resourceVideosLabel"), desc: t("home.resourceVideosDesc") },
  ];
  return (
    <section className="mt-10">
      <div className="mb-4 text-center">
        <div className="tribal-border mx-auto w-20" />
        <h2 className="mt-3 font-display text-2xl font-black text-cream md:text-3xl">
          {t("home.resourcesTitle")}
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-foreground/70">
          {t("home.resourcesSubtitle")}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {cards.map((r) => (
          <div
            key={r.label}
            className="card-elev group rounded-2xl p-5 transition hover:-translate-y-1"
          >
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--gradient-leaf)] text-cream shadow-[var(--shadow-glow)]">
              <r.icon className="h-5 w-5" />
            </div>
            <h4 className="mt-3 font-display text-lg font-bold text-cream">{r.label}</h4>
            <p className="mt-1 text-xs leading-relaxed text-foreground/70">{r.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

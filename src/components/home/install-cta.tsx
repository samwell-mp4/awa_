import { Link } from "@tanstack/react-router";
import { ChevronRight, Download, Smartphone } from "lucide-react";
import { useTranslation } from "react-i18next";

export function InstallCTA() {
  const { t } = useTranslation();
  const platforms = [
    { label: "Android", instruction: t("home.installAndroid") },
    { label: "iPhone", instruction: t("home.installIos") },
  ];
  return (
    <section className="mt-10 rounded-3xl border border-gold/20 bg-gradient-to-br from-leaf/15 to-forest-deep/20 p-6 text-center md:p-10">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gold/15 text-gold shadow-[var(--shadow-glow)]">
          <Download className="h-7 w-7" />
        </div>
        <h2 className="font-display text-2xl font-black text-cream md:text-3xl">
          {t("home.installTitle")}
        </h2>
        <p className="text-sm leading-relaxed text-foreground/80 md:text-base">
          {t("home.installSubtitle")}
        </p>

        <div className="mt-2 grid w-full gap-3 sm:grid-cols-2">
          {platforms.map((p) => (
            <div key={p.label} className="rounded-2xl border border-gold/15 bg-card/50 p-5 text-left">
              <div className="flex items-center gap-2 text-cream">
                <Smartphone className="h-4 w-4 text-gold" />
                <span className="text-sm font-bold">{p.label}</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-foreground/75">{p.instruction}</p>
            </div>
          ))}
        </div>

        <Link
          to="/instalar"
          className="mt-4 inline-flex items-center justify-center rounded-full bg-gold px-6 py-2.5 text-sm font-bold text-forest-deep transition hover:bg-gold/90"
        >
          {t("home.installCta")}
          <ChevronRight className="ml-1 h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

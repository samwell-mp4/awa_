import { Link } from "@tanstack/react-router";
import { ChevronRight, Download, Smartphone } from "lucide-react";
import { useTranslation } from "react-i18next";

export function InstallCTA({ mode = "adulto" }: { mode?: "adulto" | "infantil" }) {
  const { t } = useTranslation();
  const isAdult = mode === "adulto";
  const platforms = [
    { label: "Android", instruction: t("home.installAndroid") },
    { label: "iPhone", instruction: t("home.installIos") },
  ];
  return (
    <section className={
      isAdult
        ? "mt-10 rounded-3xl border border-[#e8e4dc] bg-white p-6 text-center md:p-10 shadow-xs"
        : "mt-10 rounded-3xl border border-gold/20 bg-gradient-to-br from-leaf/15 to-forest-deep/20 p-6 text-center md:p-10"
    }>
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4">
        <div className={`grid h-14 w-14 place-items-center rounded-2xl ${
          isAdult ? "bg-[#1b4332]/10 text-[#1b4332]" : "bg-gold/15 text-gold shadow-[var(--shadow-glow)]"
        }`}>
          <Download className="h-7 w-7" />
        </div>
        <h2 className={`font-display text-2xl font-black md:text-3xl ${
          isAdult ? "text-[#11231b]" : "text-cream"
        }`}>
          {t("home.installTitle")}
        </h2>
        <p className={`text-sm leading-relaxed md:text-base ${
          isAdult ? "text-[#4b5563]" : "text-foreground/80"
        }`}>
          {t("home.installSubtitle")}
        </p>

        <div className="mt-2 grid w-full gap-3 sm:grid-cols-2">
          {platforms.map((p) => (
            <div key={p.label} className={`rounded-2xl border p-5 text-left ${
              isAdult ? "border-[#e8e4dc] bg-[#faf9f6]" : "border-gold/15 bg-card/50"
            }`}>
              <div className={`flex items-center gap-2 ${isAdult ? "text-[#11231b]" : "text-cream"}`}>
                <Smartphone className={`h-4 w-4 ${isAdult ? "text-[#1b4332]" : "text-gold"}`} />
                <span className="text-sm font-bold">{p.label}</span>
              </div>
              <p className={`mt-2 text-xs leading-relaxed ${isAdult ? "text-[#6b7280]" : "text-foreground/75"}`}>{p.instruction}</p>
            </div>
          ))}
        </div>

        <Link
          to="/instalar"
          className={`mt-4 inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-bold transition shadow-xs ${
            isAdult
              ? "bg-[#1b4332] text-white hover:bg-[#2d6a4f]"
              : "bg-gold text-forest-deep hover:bg-gold/90"
          }`}
        >
          {t("home.installCta")}
          <ChevronRight className="ml-1 h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { trailSlugMap } from "@/lib/home-content";
import type { HomeTrail } from "@/hooks/use-home-data";
import { ProgressBar } from "./progress-bar";

const cardClass =
  "group card-elev overflow-hidden rounded-2xl transition hover:-translate-y-1 hover:shadow-[var(--shadow-glow)]";

const trailNameKey: Record<string, string> = {
  saudacoes: "common.trailSaudacoes",
  "saudações": "common.trailSaudacoes",
  familia: "common.trailFamilia",
  "família": "common.trailFamilia",
  natureza: "common.trailNatureza",
  animais: "common.trailAnimais",
};

export function translateTrailName(t: (k: string) => string, name: string) {
  const norm = (name ?? "").trim().toLowerCase();
  const key = trailNameKey[norm];
  return key ? t(key) : name;
}

function TrailCardInner({ trail, label, isAdult }: { trail: HomeTrail; label: string; isAdult: boolean }) {
  return (
    <>
      <div className="relative aspect-square overflow-hidden bg-[#f4f2ec]">
        <img
          src={trail.img}
          alt={label}
          width={640}
          height={640}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-3">
        <div className={`text-sm font-bold truncate ${isAdult ? "text-[#11231b]" : "text-cream"}`}>
          {label}
        </div>
        <ProgressBar value={trail.progress} className="mt-2" />
      </div>
    </>
  );
}

export function TrailsGrid({ trails, mode = "adulto" }: { trails: HomeTrail[]; mode?: "adulto" | "infantil" }) {
  const { t } = useTranslation();
  const isAdult = mode === "adulto";

  const cardClass = isAdult
    ? "group overflow-hidden rounded-2xl border border-[#e8e4dc] bg-white shadow-xs transition hover:-translate-y-1 hover:border-[#2d6a4f] hover:shadow-md"
    : "group card-elev overflow-hidden rounded-2xl transition hover:-translate-y-1 hover:shadow-[var(--shadow-glow)]";

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <div className="tribal-border w-16 mb-2" />
          <h2 className={`font-display text-2xl font-black md:text-3xl ${isAdult ? "text-[#11231b]" : "text-cream"}`}>
            {t("home.trailsTitle")}
          </h2>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {trails.map((trail) => {
          const norm = (trail.name ?? "").trim().toLowerCase();
          const slug = trailSlugMap[trail.name];
          const label = translateTrailName(t, trail.name);
          if (norm === "números" || norm === "numeros") {
            return (
              <Link key={trail.name} to="/aprender-numeros" search={{ area: mode }} className={cardClass}>
                <TrailCardInner trail={trail} label={label} isAdult={isAdult} />
              </Link>
            );
          }
          return slug ? (
            <Link key={trail.name} to="/trilhas/$slug" params={{ slug }} search={{ area: mode }} className={cardClass}>
              <TrailCardInner trail={trail} label={label} isAdult={isAdult} />
            </Link>
          ) : (
            <a key={trail.name} href="#aprender" className={cardClass}>
              <TrailCardInner trail={trail} label={label} isAdult={isAdult} />
            </a>
          );
        })}
      </div>
    </section>
  );
}

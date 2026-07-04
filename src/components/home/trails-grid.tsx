import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { trailSlugMap } from "@/lib/home-content";
import type { HomeTrail } from "@/hooks/use-home-data";
import { ProgressBar } from "./progress-bar";

const cardClass =
  "group card-elev overflow-hidden rounded-2xl transition hover:-translate-y-1 hover:shadow-[var(--shadow-glow)]";

function TrailCardInner({ trail }: { trail: HomeTrail }) {
  return (
    <>
      <div className="relative aspect-square overflow-hidden">
        <img
          src={trail.img}
          alt={trail.name}
          width={640}
          height={640}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-3">
        <div className="text-sm font-bold text-cream">{trail.name}</div>
        <ProgressBar value={trail.progress} className="mt-2" />
      </div>
    </>
  );
}

export function TrailsGrid({ trails }: { trails: HomeTrail[] }) {
  const { t } = useTranslation();
  return (
    <section className="mt-8">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <div className="tribal-border w-16 mb-2" />
          <h2 className="font-display text-2xl font-black text-cream md:text-3xl">
            {t("home.trailsTitle")}
          </h2>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {trails.map((t) => {
          const slug = trailSlugMap[t.name];
          return slug ? (
            <Link key={t.name} to="/trilhas/$slug" params={{ slug }} className={cardClass}>
              <TrailCardInner trail={t} />
            </Link>
          ) : (
            <a key={t.name} href="#aprender" className={cardClass}>
              <TrailCardInner trail={t} />
            </a>
          );
        })}
      </div>
    </section>
  );
}

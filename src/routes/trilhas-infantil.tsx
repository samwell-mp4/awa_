import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { SiteFooter } from "@/components/home/site-footer";
import { SiteHeader } from "@/components/home/site-header";
import { trailSlugMap } from "@/lib/home-content";
import { useHomeTrails } from "@/hooks/use-home-data";
import { translateTrailName } from "@/components/home/trails-grid";
import { useAutoTranslate } from "@/hooks/use-auto-translate";

export const Route = createFileRoute("/trilhas-infantil")({
  head: () => ({
    meta: [
      { title: "Trilhas da Aldeia — Awã Tech Infantil" },
      {
        name: "description",
        content:
          "Trilhas da Aldeia: mapa 3D infantil para crianças aprenderem saudações, família, natureza e animais em línguas indígenas.",
      },
      { property: "og:title", content: "Trilhas da Aldeia — Awã Tech" },
      {
        property: "og:description",
        content: "Mapa mágico 3D infantil das trilhas de aprendizado Awã Tech.",
      },
    ],
  }),
  component: TrilhaInfantilPage,
});

const clayStyles: Record<string, { emoji: string; gradient: string; ring: string }> = {
  saudacoes: {
    emoji: "🤝",
    gradient: "from-amber-300 via-orange-400 to-amber-600",
    ring: "ring-amber-200",
  },
  familia: {
    emoji: "🏠",
    gradient: "from-yellow-300 via-orange-300 to-amber-500",
    ring: "ring-yellow-200",
  },
  natureza: {
    emoji: "🌳",
    gradient: "from-lime-300 via-emerald-400 to-green-600",
    ring: "ring-lime-200",
  },
  animais: {
    emoji: "🐢",
    gradient: "from-teal-300 via-emerald-400 to-teal-600",
    ring: "ring-teal-200",
  },
};

const positions = [
  { top: "18%", left: "62%" },
  { top: "36%", left: "26%" },
  { top: "56%", left: "68%" },
  { top: "76%", left: "30%" },
];

function TrilhaInfantilPage() {
  const { t, i18n } = useTranslation();
  const trails = useHomeTrails();

  const captions = useMemo(
    () => ["🗺️ Trilhas da Aldeia", "Escolha uma trilha e siga o caminho mágico!"],
    [],
  );
  const [titleTr, subtitleTr] = useAutoTranslate(captions);

  return (
    <div
      key={i18n.language}
      className="min-h-screen bg-gradient-to-b from-sky-200 via-emerald-100 to-amber-100 text-foreground"
    >
      <SiteHeader mode="infantil" />

      <main className="mx-auto max-w-3xl px-3 pb-16 md:px-6">
        <div className="mt-4 text-center">
          <h1 className="font-display text-3xl font-black text-amber-900 drop-shadow-sm md:text-5xl">
            {titleTr}
          </h1>
          <p className="mt-1 text-sm font-bold text-emerald-900/80 md:text-base">
            {subtitleTr}
          </p>
        </div>

        <section
          className="relative mt-6 overflow-hidden rounded-[2rem] border-4 border-amber-300 shadow-[0_20px_60px_-25px_rgba(0,0,0,0.45)]"
          style={{
            aspectRatio: "3 / 4",
            background:
              "radial-gradient(ellipse at 30% 20%, #fff5d6 0%, #f2dfa8 45%, #d9b877 100%)",
          }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-30 mix-blend-multiply"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 30%, rgba(120,72,20,0.25) 0px, transparent 2px), radial-gradient(circle at 70% 60%, rgba(120,72,20,0.2) 0px, transparent 2px), radial-gradient(circle at 40% 80%, rgba(120,72,20,0.2) 0px, transparent 2px)",
              backgroundSize: "80px 80px, 120px 120px, 100px 100px",
            }}
          />

          <svg
            aria-hidden
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 100 133"
            preserveAspectRatio="none"
          >
            <path
              d="M 62 22 Q 40 30 26 40 Q 15 55 40 60 Q 70 65 68 75 Q 60 92 30 90 Q 20 100 40 110"
              fill="none"
              stroke="#8b5a2b"
              strokeWidth="0.8"
              strokeDasharray="1.5 2"
              strokeLinecap="round"
            />
            {[
              [45, 32],
              [30, 52],
              [58, 68],
              [45, 92],
            ].map(([x, y], i) => (
              <text
                key={i}
                x={x}
                y={y}
                fontSize="3"
                fill="#8b5a2b"
                fontWeight="bold"
                textAnchor="middle"
              >
                ✕
              </text>
            ))}
          </svg>

          <div className="absolute left-3 top-3 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-pink-300 to-pink-500 text-2xl shadow-lg ring-4 ring-white/70 md:h-20 md:w-20 md:text-4xl">
            🧭
          </div>

          {trails.slice(0, 4).map((trail, i) => {
            const slug = trailSlugMap[trail.name];
            if (!slug) return null;
            const style = clayStyles[slug];
            const pos = positions[i] ?? positions[0];
            const label = translateTrailName(t, trail.name);
            return (
              <Link
                key={slug}
                to="/trilhas/$slug"
                params={{ slug }}
                aria-label={label}
                style={{ top: pos.top, left: pos.left }}
                className="group absolute -translate-x-1/2 -translate-y-1/2"
              >
                <span className="relative block">
                  <span
                    className={`absolute -inset-3 rounded-full bg-gradient-to-br ${style.gradient} opacity-40 blur-md transition group-hover:opacity-70`}
                  />
                  <span
                    className={`relative grid h-[20vw] w-[20vw] max-h-28 max-w-28 place-items-center rounded-full bg-gradient-to-br ${style.gradient} text-[9vw] max-text-[3rem] shadow-[0_10px_20px_-6px_rgba(80,40,0,0.5),inset_0_-6px_10px_rgba(0,0,0,0.2),inset_0_6px_10px_rgba(255,255,255,0.4)] ring-4 ${style.ring} transition group-hover:-translate-y-1 group-hover:scale-110 group-active:scale-95`}
                  >
                    <span className="drop-shadow-md">{style.emoji}</span>
                  </span>
                  <span className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-full bg-amber-900/90 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-amber-50 shadow md:text-sm">
                    {label}
                  </span>
                </span>
              </Link>
            );
          })}
        </section>

        <nav className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {trails.slice(0, 4).map((trail) => {
            const slug = trailSlugMap[trail.name];
            if (!slug) return null;
            const style = clayStyles[slug];
            return (
              <Link
                key={"list-" + slug}
                to="/trilhas/$slug"
                params={{ slug }}
                className="flex items-center justify-center gap-2 rounded-2xl border-2 border-amber-300 bg-white/70 px-3 py-3 text-center font-display text-sm font-black uppercase tracking-wide text-emerald-900 shadow-sm hover:bg-white"
              >
                <span className="text-xl">{style.emoji}</span>
                {translateTrailName(t, trail.name)}
              </Link>
            );
          })}
        </nav>
      </main>

      <SiteFooter />
    </div>
  );
}

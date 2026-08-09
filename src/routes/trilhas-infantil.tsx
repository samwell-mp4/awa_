import { createFileRoute, Link } from "@tanstack/react-router";
import { requireArea } from "@/lib/area-guard";
import { useTranslation } from "react-i18next";

import { SiteFooter } from "@/components/home/site-footer";
import { SiteHeader } from "@/components/home/site-header";
import { trailSlugMap } from "@/lib/home-content";
import { useHomeTrails } from "@/hooks/use-home-data";
import { translateTrailName } from "@/components/home/trails-grid";
import { TrailNarrator } from "@/components/kids/trail-narrator";

export const Route = createFileRoute("/trilhas-infantil")({
  ssr: false,
  beforeLoad: () => requireArea("infantil"),
  head: () => ({
    meta: [
      { title: "Trilhas da Aldeia — Awã Tech Infantil" },
      {
        name: "description",
        content:
          "Trilhas da Aldeia: mapa colorido e infantil com totens de saudações, família, natureza e animais em línguas indígenas.",
      },
      { property: "og:title", content: "Trilhas da Aldeia — Awã Tech" },
      {
        property: "og:description",
        content: "Mapa mágico e divertido das trilhas de aprendizado Awã Tech.",
      },
    ],
  }),
  component: TrilhaInfantilPage,
});

type TotemStyle = {
  emoji: string;
  color: string; // main hex
  shadow: string; // shadow tint hex with alpha
  islandTop: string; // island top gradient stops
  islandBottom: string;
  position: string; // absolute position classes
  rotate: string;
};

const totemStyles: Record<string, TotemStyle> = {
  saudacoes: {
    emoji: "🤝",
    color: "#ffd166",
    shadow: "rgba(255,209,102,0.45)",
    islandTop: "#a7f3d0",
    islandBottom: "#6bbf8a",
    position: "top-2 right-8",
    rotate: "-3deg",
  },
  familia: {
    emoji: "🏠",
    color: "#ef476f",
    shadow: "rgba(239,71,111,0.45)",
    islandTop: "#c4b5fd",
    islandBottom: "#8b7ad1",
    position: "top-36 left-4",
    rotate: "4deg",
  },
  natureza: {
    emoji: "🌳",
    color: "#2d6a4f",
    shadow: "rgba(45,106,79,0.45)",
    islandTop: "#fde68a",
    islandBottom: "#e0b04a",
    position: "top-[280px] right-4",
    rotate: "-4deg",
  },
  animais: {
    emoji: "🐢",
    color: "#118ab2",
    shadow: "rgba(17,138,178,0.45)",
    islandTop: "#fca5a5",
    islandBottom: "#c96b6b",
    position: "bottom-4 left-8",
    rotate: "3deg",
  },
  videos: {
    emoji: "🎥",
    color: "#f4a261",
    shadow: "rgba(244,162,97,0.45)",
    islandTop: "#bae6fd",
    islandBottom: "#7dd3fc",
    position: "bottom-12 right-12",
    rotate: "-2deg",
  },
};

function FloatingIsland({ top, bottom, size = 140 }: { top: string; bottom: string; size?: number }) {
  const w = size;
  const h = Math.round(size * 0.55);
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${w} ${h}`}
      className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-3"
      style={{ width: w, height: h, filter: "drop-shadow(0 12px 12px rgba(0,0,0,0.25))" }}
    >
      <defs>
        <linearGradient id={`isl-${top}-${bottom}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={top} />
          <stop offset="55%" stopColor={top} />
          <stop offset="55%" stopColor={bottom} />
          <stop offset="100%" stopColor={bottom} />
        </linearGradient>
      </defs>
      <ellipse cx={w / 2} cy={h * 0.35} rx={w * 0.42} ry={h * 0.42} fill={`url(#isl-${top}-${bottom})`} />
      {/* tiny grass tufts */}
      <path d={`M ${w * 0.3} ${h * 0.32} q 3 -6 6 0`} stroke={bottom} strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d={`M ${w * 0.55} ${h * 0.28} q 3 -7 6 0`} stroke={bottom} strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function TrilhaInfantilPage() {
  const { t, i18n } = useTranslation();
  const trails = useHomeTrails();

  const titleTop = t("common.kidsTrailsTitle").replace(/^[^\p{L}]*/u, ""); // strip leading emoji if present
  const subtitle = t("common.kidsTrailsSubtitle");

  return (
    <div key={i18n.language} className="kids-theme min-h-screen bg-[#fdfcf0] text-foreground">
      <style>{`
        @keyframes kids-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes kids-wobble { 0%,100%{transform:rotate(var(--rot))} 50%{transform:rotate(calc(var(--rot) * -1))} }
        @keyframes kids-pop { 0%{transform:scale(.6);opacity:0} 60%{transform:scale(1.1);opacity:1} 100%{transform:scale(1)} }
        @keyframes kids-dash { to { stroke-dashoffset: -240 } }
        @keyframes kids-cloud { 0%{transform:translateX(-20px)} 50%{transform:translateX(20px)} 100%{transform:translateX(-20px)} }
        .kids-totem { animation: kids-pop .5s ease-out both, kids-float 3.6s ease-in-out infinite; }
        .kids-totem:hover { animation-play-state: paused; }
      `}</style>

      <SiteHeader mode="infantil" showBackButton title={t("nav.videosLong")} />

      <main className="mx-auto max-w-md px-4 pb-16 pt-4 font-['Hind',sans-serif]">
        <div className="relative overflow-hidden rounded-[2rem] border-4 border-[#ffd166]/40 bg-[#fdfcf0] shadow-inner">
          {/* Decorative clouds */}
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-40 opacity-70">
            <div className="absolute left-4 top-6 text-4xl" style={{ animation: "kids-cloud 12s ease-in-out infinite" }}>☁️</div>
            <div className="absolute right-6 top-16 text-3xl" style={{ animation: "kids-cloud 15s ease-in-out infinite reverse" }}>☁️</div>
            <div className="absolute right-10 top-2 text-2xl">☀️</div>
          </div>

          {/* Header */}
          <header className="relative z-10 px-6 pt-10 text-center">
            <Link
              to="/infantil"
              className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-sm font-black text-[#118ab2] shadow ring-2 ring-[#ffd166]/60 hover:scale-105 active:scale-95"
              aria-label={t("Voltar")}
            >
              <span aria-hidden>←</span> {t("Voltar")}
            </Link>
            <h1
              className="text-4xl uppercase leading-none tracking-tight text-[#118ab2]"
              style={{ fontFamily: "'Archivo Black', 'Archivo', system-ui, sans-serif" }}
            >
              {titleTop.split(" ").slice(0, -1).join(" ") || "Trilhas da"}
              <br />
              <span className="text-[#ef476f]">
                {titleTop.split(" ").slice(-1)[0] || "Aldeia"}
              </span>
            </h1>
            <p className="mt-3 text-lg font-bold text-[#2d6a4f]">{subtitle}</p>
          </header>

          {/* Adventure map area */}
          <div className="relative mx-4 my-6 h-[520px]">
            {/* Winding dashed trail */}
            <svg
              aria-hidden
              className="pointer-events-none absolute inset-0 h-full w-full"
              viewBox="0 0 300 520"
              fill="none"
              preserveAspectRatio="none"
            >
              <path
                d="M230 70 C 230 150, 70 150, 70 220 C 70 300, 230 300, 230 380 C 230 460, 70 460, 70 500"
                stroke="#ffd166"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray="10 14"
                style={{ animation: "kids-dash 6s linear infinite" }}
              />
              {/* footprints */}
              {[
                [150, 130], [90, 200], [150, 260], [210, 330], [150, 400], [90, 470],
              ].map(([x, y], i) => (
                <text key={i} x={x} y={y} fontSize="14" textAnchor="middle" opacity="0.7">
                  {i % 2 ? "🐾" : "👣"}
                </text>
              ))}
            </svg>

            {/* Totems */}
            {trails.slice(0, 5).map((trail, i) => {
              const slug = trailSlugMap[trail.name];
              if (!slug) return null;
              const style = totemStyles[slug];
              if (!style) return null;
              const label = translateTrailName(t, trail.name);
              return (
                <Link
                  key={slug}
                  to="/trilhas/$slug"
                  params={{ slug }}
                  aria-label={label}
                  className={`kids-totem group absolute ${style.position} transition-transform hover:scale-110 active:scale-95`}
                  style={{
                    animationDelay: `${i * 120}ms`,
                    // @ts-expect-error CSS var
                    "--rot": style.rotate,
                  }}
                >
                  <span className="relative block">
                    {/* Glow */}
                    <span
                      aria-hidden
                      className="absolute -inset-3 rounded-full opacity-70 blur-xl transition group-hover:opacity-100"
                      style={{ background: style.color }}
                    />

                    {/* Totem bubble */}
                    <span
                      className="relative flex h-24 w-24 flex-col items-center justify-center rounded-full border-4 border-white text-white"
                      style={{
                        background: style.color,
                        boxShadow: `0 10px 0 -2px ${style.shadow}, 0 20px 30px -10px ${style.shadow}`,
                        transform: `rotate(${style.rotate})`,
                      }}
                    >
                      <span className="text-3xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.25)]">{style.emoji}</span>
                      <span
                        className="mt-0.5 text-[10px] uppercase tracking-widest text-white"
                        style={{ fontFamily: "'Archivo Black', sans-serif" }}
                      >
                        {label}
                      </span>
                    </span>

                    {/* Floating island shadow beneath */}
                    <FloatingIsland top={style.islandTop} bottom={style.islandBottom} />
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Narração das trilhas — título e descrição com áudio */}
          <section className="px-4 pb-4" aria-label={t("common.kidsTrailsTitle")}>
            <div className="grid gap-3">
              {trails.slice(0, 5).map((trail) => {
                const slug = trailSlugMap[trail.name];
                if (!slug) return null;
                const style = totemStyles[slug];
                if (!style) return null;
                const descKey = `common.trailDesc${slug.charAt(0).toUpperCase() + slug.slice(1)}`;
                return (
                  <TrailNarrator
                    key={"narr-" + slug}
                    title={translateTrailName(t, trail.name)}
                    description={t(descKey)}
                    color={style.color}
                    emoji={style.emoji}
                  />
                );
              })}
            </div>
          </section>

          {/* Quick nav footer */}
          <div className="grid grid-cols-4 gap-2 border-t-2 border-[#ffd166]/40 bg-white/60 p-4 backdrop-blur-sm">
            {trails.slice(0, 5).map((trail) => {
              const slug = trailSlugMap[trail.name];
              if (!slug) return null;
              const style = totemStyles[slug];
              if (!style) return null;
              const label = translateTrailName(t, trail.name);
              return (
                <Link
                  key={"nav-" + slug}
                  to="/trilhas/$slug"
                  params={{ slug }}
                  aria-label={label}
                  className="flex h-14 items-center justify-center rounded-xl border-b-4 border-black/10 shadow-sm transition-all active:translate-y-1 active:border-b-0"
                  style={{ background: style.color }}
                >
                  <span className="text-2xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.25)]">{style.emoji}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

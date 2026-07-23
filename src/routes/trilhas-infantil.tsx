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

type TotemStyle = {
  emoji: string;
  gradient: string;
  ring: string;
  feather: string;
  shadow: string;
  pattern: string;
};

const totemStyles: Record<string, TotemStyle> = {
  saudacoes: {
    emoji: "🤝",
    gradient: "from-amber-200 via-orange-400 to-amber-700",
    ring: "ring-amber-100",
    feather: "#f59e0b",
    shadow: "shadow-[0_18px_0_-6px_#7c2d12,0_28px_40px_-12px_rgba(60,20,0,0.6)]",
    pattern: "◆",
  },
  familia: {
    emoji: "🏠",
    gradient: "from-yellow-200 via-orange-300 to-red-500",
    ring: "ring-yellow-100",
    feather: "#eab308",
    shadow: "shadow-[0_18px_0_-6px_#7f1d1d,0_28px_40px_-12px_rgba(60,20,0,0.6)]",
    pattern: "▲",
  },
  natureza: {
    emoji: "🌳",
    gradient: "from-lime-200 via-emerald-400 to-green-700",
    ring: "ring-lime-100",
    feather: "#10b981",
    shadow: "shadow-[0_18px_0_-6px_#14532d,0_28px_40px_-12px_rgba(0,40,10,0.6)]",
    pattern: "✦",
  },
  animais: {
    emoji: "🐢",
    gradient: "from-teal-200 via-cyan-400 to-teal-700",
    ring: "ring-teal-100",
    feather: "#0d9488",
    shadow: "shadow-[0_18px_0_-6px_#134e4a,0_28px_40px_-12px_rgba(0,40,40,0.6)]",
    pattern: "●",
  },
};

const positions = [
  { top: "20%", left: "64%" },
  { top: "40%", left: "28%" },
  { top: "60%", left: "70%" },
  { top: "80%", left: "32%" },
];

/** SVG feather stuck on top of the totem */
function Feather({ color }: { color: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 40 80"
      className="absolute -top-10 left-1/2 h-16 w-8 -translate-x-1/2 drop-shadow-[0_4px_2px_rgba(0,0,0,0.35)]"
      style={{ transformOrigin: "50% 100%", animation: "kids-sway 3s ease-in-out infinite" }}
    >
      <path
        d="M20 78 Q18 40 20 4 Q28 20 32 40 Q30 60 20 78 Z"
        fill={color}
        stroke="#3f2413"
        strokeWidth="1.5"
      />
      <path d="M20 78 Q22 40 20 4 Q12 20 8 40 Q10 60 20 78 Z" fill={color} opacity="0.8" stroke="#3f2413" strokeWidth="1.5" />
      <line x1="20" y1="78" x2="20" y2="8" stroke="#3f2413" strokeWidth="1.5" />
      <circle cx="20" cy="80" r="3" fill="#7c2d12" />
    </svg>
  );
}

/** Tribal border stripe drawn with SVG symbols */
function TribalBorder() {
  const symbols = ["◆", "△", "◇", "▽"];
  return (
    <div className="pointer-events-none absolute inset-0 rounded-[2rem]">
      <div className="absolute inset-x-4 top-2 flex justify-between text-[10px] font-black text-amber-900/70 md:text-sm">
        {Array.from({ length: 18 }).map((_, i) => (
          <span key={"t" + i}>{symbols[i % symbols.length]}</span>
        ))}
      </div>
      <div className="absolute inset-x-4 bottom-2 flex justify-between text-[10px] font-black text-amber-900/70 md:text-sm">
        {Array.from({ length: 18 }).map((_, i) => (
          <span key={"b" + i}>{symbols[(i + 2) % symbols.length]}</span>
        ))}
      </div>
    </div>
  );
}

function TrilhaInfantilPage() {
  const { t, i18n } = useTranslation();
  const trails = useHomeTrails();

  const captions = useMemo(
    () => ["🗺️ Trilhas da Aldeia", "Toque num totem e siga o caminho mágico!"],
    [],
  );
  const [titleTr, subtitleTr] = useAutoTranslate(captions);

  return (
    <div key={i18n.language} className="kids-theme min-h-screen text-foreground">
      <style>{`
        @keyframes kids-sway { 0%,100%{transform:translateX(-50%) rotate(-6deg)} 50%{transform:translateX(-50%) rotate(6deg)} }
        @keyframes kids-bounce-slow { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes kids-spin-slow { from{transform:rotate(0)} to{transform:rotate(360deg)} }
        @keyframes kids-walk { 0%{stroke-dashoffset:0} 100%{stroke-dashoffset:-40} }
        @keyframes kids-pop { 0%{transform:scale(.85)} 60%{transform:scale(1.08)} 100%{transform:scale(1)} }
      `}</style>

      <SiteHeader mode="infantil" />

      <main className="mx-auto max-w-3xl px-3 pb-16 md:px-6">
        <div className="mt-4 text-center">
          <h1 className="kids-title text-3xl text-amber-900 drop-shadow-[0_3px_0_rgba(255,255,255,0.6)] md:text-5xl">
            {titleTr}
          </h1>
          <p className="mt-2 text-sm font-bold text-emerald-900/80 md:text-base">
            {subtitleTr}
          </p>
        </div>

        <section
          className="relative mt-6 overflow-hidden rounded-[2rem] border-[6px] border-amber-800 shadow-[0_25px_70px_-25px_rgba(0,0,0,0.6),inset_0_0_0_4px_#fde68a]"
          style={{
            aspectRatio: "3 / 4",
            background:
              "radial-gradient(ellipse at 30% 15%, #fff5d6 0%, #f2dfa8 40%, #d9b877 80%, #b8894a 100%)",
          }}
        >
          {/* paper grain */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-40 mix-blend-multiply"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 30%, rgba(120,72,20,0.28) 0px, transparent 2px), radial-gradient(circle at 70% 60%, rgba(120,72,20,0.22) 0px, transparent 2px), radial-gradient(circle at 40% 80%, rgba(120,72,20,0.22) 0px, transparent 2px)",
              backgroundSize: "70px 70px, 110px 110px, 95px 95px",
            }}
          />

          <TribalBorder />

          {/* Decorative jungle: trees, mountains, sun */}
          <svg
            aria-hidden
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 100 133"
            preserveAspectRatio="none"
          >
            {/* Sun with rays */}
            <g style={{ transformOrigin: "12px 14px", animation: "kids-spin-slow 30s linear infinite" }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <line
                  key={i}
                  x1="12"
                  y1="14"
                  x2="12"
                  y2="4"
                  stroke="#f59e0b"
                  strokeWidth="1"
                  strokeLinecap="round"
                  transform={`rotate(${i * 30} 12 14)`}
                />
              ))}
              <circle cx="12" cy="14" r="4" fill="#fbbf24" stroke="#b45309" strokeWidth="0.6" />
            </g>

            {/* Mountains */}
            <path d="M0 30 L18 14 L28 24 L40 10 L55 26 L70 16 L88 28 L100 20 L100 40 L0 40 Z" fill="#a16207" opacity="0.35" />
            <path d="M0 34 L15 22 L26 30 L40 18 L55 32 L72 22 L90 32 L100 28 L100 42 L0 42 Z" fill="#78350f" opacity="0.4" />

            {/* Trees */}
            {[
              [8, 60], [92, 50], [10, 92], [90, 100], [50, 128], [22, 118], [78, 118],
            ].map(([x, y], i) => (
              <g key={"tree" + i} transform={`translate(${x} ${y})`}>
                <rect x="-1" y="0" width="2" height="5" fill="#7c2d12" />
                <polygon points="-5,0 5,0 0,-8" fill="#166534" />
                <polygon points="-4,-4 4,-4 0,-10" fill="#15803d" />
                <polygon points="-3,-8 3,-8 0,-12" fill="#22c55e" />
              </g>
            ))}

            {/* River */}
            <path
              d="M -2 105 Q 20 100 35 108 Q 55 116 80 108 Q 95 104 102 108"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.55"
            />
            <path
              d="M -2 105 Q 20 100 35 108 Q 55 116 80 108 Q 95 104 102 108"
              fill="none"
              stroke="#7dd3fc"
              strokeWidth="1"
              strokeLinecap="round"
            />

            {/* Dashed path connecting totems */}
            <path
              d="M 62 26 Q 40 32 26 44 Q 15 58 40 62 Q 70 66 68 78 Q 60 92 32 92 Q 20 102 40 112"
              fill="none"
              stroke="#7c2d12"
              strokeWidth="1"
              strokeDasharray="2 2.5"
              strokeLinecap="round"
              style={{ animation: "kids-walk 2s linear infinite" }}
            />

            {/* Footprints */}
            {[
              [50, 30], [34, 40], [30, 54], [50, 60], [64, 72], [50, 88], [36, 96], [40, 108],
            ].map(([x, y], i) => (
              <text key={"f" + i} x={x} y={y} fontSize="2.4" fill="#7c2d12" textAnchor="middle" opacity="0.75">
                {i % 2 ? "🐾" : "👣"}
              </text>
            ))}
          </svg>

          {/* Compass mascot */}
          <div
            className="absolute left-3 top-8 grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-pink-300 to-pink-500 text-3xl shadow-[0_10px_0_-3px_#9f1239,0_20px_25px_-10px_rgba(0,0,0,0.5)] ring-4 ring-white/80 md:h-24 md:w-24 md:text-5xl"
            style={{ animation: "kids-bounce-slow 2.5s ease-in-out infinite" }}
          >
            🧭
          </div>

          {/* Little bird mascot */}
          <div
            className="absolute right-4 top-6 text-3xl md:text-5xl"
            style={{ animation: "kids-bounce-slow 3s ease-in-out infinite" }}
          >
            🦜
          </div>

          {/* Totems */}
          {trails.slice(0, 4).map((trail, i) => {
            const slug = trailSlugMap[trail.name];
            if (!slug) return null;
            const style = totemStyles[slug];
            const pos = positions[i] ?? positions[0];
            const label = translateTrailName(t, trail.name);
            return (
              <Link
                key={slug}
                to="/trilhas/$slug"
                params={{ slug }}
                aria-label={label}
                style={{ top: pos.top, left: pos.left, animation: `kids-pop .6s ease-out ${i * 0.12}s both` }}
                className="group absolute -translate-x-1/2 -translate-y-1/2"
              >
                <span className="relative block">
                  <Feather color={style.feather} />

                  {/* glow */}
                  <span
                    className={`absolute -inset-4 rounded-full bg-gradient-to-br ${style.gradient} opacity-50 blur-lg transition group-hover:opacity-90`}
                  />

                  {/* Totem stack: cap → body → base */}
                  <span className="relative block">
                    {/* top cap */}
                    <span
                      className={`relative mx-auto block h-6 w-16 rounded-t-full bg-gradient-to-b ${style.gradient} ring-2 ${style.ring} md:h-8 md:w-24`}
                    />
                    {/* body */}
                    <span
                      className={`relative grid h-[22vw] w-[22vw] max-h-32 max-w-32 place-items-center rounded-3xl bg-gradient-to-br ${style.gradient} text-[10vw] max-text-[3.5rem] ring-4 ${style.ring} ${style.shadow} transition group-hover:-translate-y-2 group-hover:rotate-[-3deg] group-active:scale-95`}
                      style={{
                        backgroundImage:
                          "linear-gradient(135deg, rgba(255,255,255,0.35) 0%, transparent 40%), radial-gradient(circle at 50% 20%, rgba(255,255,255,0.5), transparent 60%)",
                      }}
                    >
                      {/* tribal band */}
                      <span className="absolute inset-x-0 top-3 flex justify-around text-[10px] font-black text-amber-950/70 md:text-sm">
                        {Array.from({ length: 6 }).map((_, k) => (
                          <span key={k}>{style.pattern}</span>
                        ))}
                      </span>
                      <span className="drop-shadow-[0_3px_2px_rgba(0,0,0,0.35)]">{style.emoji}</span>
                      <span className="absolute inset-x-0 bottom-3 flex justify-around text-[10px] font-black text-amber-950/70 md:text-sm">
                        {Array.from({ length: 6 }).map((_, k) => (
                          <span key={k}>{style.pattern}</span>
                        ))}
                      </span>
                    </span>
                    {/* base plinth */}
                    <span className="relative mx-auto -mt-1 block h-4 w-24 rounded-b-2xl bg-amber-900 shadow-[0_6px_0_-2px_#3f2413] md:h-6 md:w-32" />
                  </span>

                  {/* label plaque */}
                  <span className="pointer-events-none absolute left-1/2 top-full mt-3 -translate-x-1/2 whitespace-nowrap rounded-full border-2 border-amber-100 bg-amber-900/95 px-4 py-1.5 font-display text-[11px] font-black uppercase tracking-wider text-amber-50 shadow-[0_4px_0_-1px_#3f2413] md:text-sm">
                    {label}
                  </span>
                </span>
              </Link>
            );
          })}
        </section>

        {/* List nav */}
        <nav className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {trails.slice(0, 4).map((trail, i) => {
            const slug = trailSlugMap[trail.name];
            if (!slug) return null;
            const style = totemStyles[slug];
            return (
              <Link
                key={"list-" + slug}
                to="/trilhas/$slug"
                params={{ slug }}
                className={`kids-card flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-br ${style.gradient} px-3 py-4 text-center font-display text-sm font-black uppercase tracking-wide text-amber-950 ring-2 ${style.ring} transition hover:-translate-y-1`}
                style={{ animation: `kids-pop .5s ease-out ${i * 0.1}s both` }}
              >
                <span className="text-2xl drop-shadow">{style.emoji}</span>
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

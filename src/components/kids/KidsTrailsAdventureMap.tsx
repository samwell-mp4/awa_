import { useState, useEffect, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  Volume2,
  Pause,
  Sparkles,
  ArrowRight,
  Star,
  CheckCircle2,
  Compass,
  Award,
} from "lucide-react";
import { speak, stopSpeak } from "@/lib/speak";
import { getLearned, type TrailSlug } from "@/lib/trilhas";
import { SiteHeader } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";

import kidsBg from "@/assets/kids-menu-bg.jpg";
import kidsCharacter from "@/assets/kids-menu-character.png";
import trailSaudacoes from "@/assets/trail-saudacoes.jpg";
import trailFamilia from "@/assets/trail-familia.jpg";
import trailNatureza from "@/assets/trail-natureza.jpg";
import trailAnimais from "@/assets/trail-animais.jpg";

type TotemStyle = {
  emoji: string;
  label: string;
  stepBadge: string;
  color: string;
  shadow: string;
  islandTop: string;
  islandBottom: string;
  eyeColor: string;
  position: string;
  rotate: string;
  badgeBg: string;
  btnBg: string;
  btnShadow: string;
  btnHover: string;
  textColor: string;
  desc: string;
  speechText: string;
  highlightWords: string;
  img: string;
  totalEst: number;
};

const TOTEMS_CONFIG: Record<TrailSlug, TotemStyle> = {
  saudacoes: {
    emoji: "🤝",
    label: "Saudações",
    stepBadge: "ETAPA 1 • BOAS-VINDAS",
    color: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
    shadow: "rgba(245, 158, 11, 0.45)",
    islandTop: "#6ee7b7",
    islandBottom: "#10b981",
    eyeColor: "#065f46",
    position: "top-4 right-4 sm:right-12",
    rotate: "-3deg",
    badgeBg: "#fef3c7",
    btnBg: "#f59e0b",
    btnShadow: "#d97706",
    btnHover: "#d97706",
    textColor: "#0284c7",
    desc: "Aprenda a saudar com respeito e alegria. Diga bom dia, agradeça e receba as bênçãos sagradas da aldeia.",
    speechText:
      "Trilha de Saudações. Aprenda a saudar em língua Patxôhã, com palavras sagradas de respeito e amizade como Awê e Hamnhe!",
    highlightWords: "Awê • Hamnhe • Kanhgág",
    img: trailSaudacoes,
    totalEst: 12,
  },
  familia: {
    emoji: "🏠",
    label: "Família",
    stepBadge: "ETAPA 2 • UNIÃO",
    color: "linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)",
    shadow: "rgba(244, 63, 94, 0.45)",
    islandTop: "#c4b5fd",
    islandBottom: "#8b5cf6",
    eyeColor: "#4c1d95",
    position: "top-36 left-4 sm:left-10",
    rotate: "4deg",
    badgeBg: "#fce7f3",
    btnBg: "#f43f5e",
    btnShadow: "#be123c",
    btnHover: "#e11d48",
    textColor: "#0284c7",
    desc: "Descubra os nomes sagrados da família na aldeia: pai, mãe, irmão, irmã e os anciãos guardiões da memória.",
    speechText:
      "Trilha da Família. Descubra os nomes dos seus familiares na aldeia: pai, mãe, irmão, irmã e os anciãos guardiões da sabedoria!",
    highlightWords: "Pai • Mãe • Ancião • Criança",
    img: trailFamilia,
    totalEst: 14,
  },
  natureza: {
    emoji: "🌲",
    label: "Natureza",
    stepBadge: "ETAPA 3 • MÃE TERRA",
    color: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    shadow: "rgba(16, 185, 129, 0.45)",
    islandTop: "#fde68a",
    islandBottom: "#f59e0b",
    eyeColor: "#78350f",
    position: "top-[270px] right-4 sm:right-10",
    rotate: "-4deg",
    badgeBg: "#d1fae5",
    btnBg: "#10b981",
    btnShadow: "#047857",
    btnHover: "#059669",
    textColor: "#0284c7",
    desc: "Explore a floresta viva: as águas dos rios, o calor do sol, a luz da lua e as árvores protetoras.",
    speechText:
      "Trilha da Natureza. Explore a força da floresta sagrada: as águas, o sol, a terra viva e todas as árvores protetoras!",
    highlightWords: "Água • Sol • Floresta • Rio",
    img: trailNatureza,
    totalEst: 16,
  },
  animais: {
    emoji: "🐢",
    label: "Animais",
    stepBadge: "ETAPA 4 • GUARDIÕES",
    color: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
    shadow: "rgba(2, 132, 199, 0.45)",
    islandTop: "#fca5a5",
    islandBottom: "#f43f5e",
    eyeColor: "#881337",
    position: "bottom-6 left-6 sm:left-12",
    rotate: "3deg",
    badgeBg: "#e0f2fe",
    btnBg: "#0284c7",
    btnShadow: "#075985",
    btnHover: "#0369a1",
    textColor: "#0284c7",
    desc: "Conheça os mestres animais: onça valente, tatu arqueiro, jabuti paciente e pássaros coloridos que cantam na aldeia.",
    speechText:
      "Trilha dos Animais. Conheça as criaturas da mata: a onça valente, o jabuti sábio e os pássaros que trazem boas notícias!",
    highlightWords: "Onça • Jabuti • Gavião • Peixe",
    img: trailAnimais,
    totalEst: 15,
  },
};

/**
 * Ilha Flutuante / Seixo Sorridente fofinho com olhinhos felizes ^ ^
 */
function SmilingIsland({
  top,
  bottom,
  eyeColor,
  size = 145,
}: {
  top: string;
  bottom: string;
  eyeColor: string;
  size?: number;
}) {
  const w = size;
  const h = Math.round(size * 0.48);
  const gradId = `isl-${top.replace(/[^a-zA-Z0-9]/g, "")}-${bottom.replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-full -translate-x-1/2 -translate-y-4"
      style={{ width: w, height: h }}
    >
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="h-full w-full drop-shadow-[0_8px_10px_rgba(0,0,0,0.18)]"
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={top} />
            <stop offset="55%" stopColor={top} />
            <stop offset="55%" stopColor={bottom} />
            <stop offset="100%" stopColor={bottom} />
          </linearGradient>
        </defs>
        {/* Seixo / Ilha elíptica */}
        <ellipse
          cx={w / 2}
          cy={h * 0.44}
          rx={w * 0.44}
          ry={h * 0.42}
          fill={`url(#${gradId})`}
        />
        {/* Olhinhos sorridentes curvados ^ ^ */}
        <path
          d={`M ${w * 0.38} ${h * 0.38} q 3.5 -5 7 0`}
          stroke={eyeColor}
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d={`M ${w * 0.55} ${h * 0.38} q 3.5 -5 7 0`}
          stroke={eyeColor}
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

/**
 * Animated Sound Equalizer Waves indicator
 */
function SoundEqualizer() {
  return (
    <span className="flex items-center gap-0.5 h-3.5 px-0.5" aria-hidden>
      <span className="w-1 bg-white rounded-full h-3 animate-[pulse_0.6s_ease-in-out_infinite]" />
      <span className="w-1 bg-white rounded-full h-4 animate-[pulse_0.8s_ease-in-out_infinite_0.15s]" />
      <span className="w-1 bg-white rounded-full h-2 animate-[pulse_0.5s_ease-in-out_infinite_0.3s]" />
    </span>
  );
}

export function KidsTrailsAdventureMap({
  backHref = "/infantil",
}: {
  backHref?: string;
}) {
  const { i18n } = useTranslation();
  const [playingSlug, setPlayingSlug] = useState<TrailSlug | null>(null);

  // Stop any ongoing speech when unmounting
  useEffect(() => {
    return () => {
      stopSpeak();
    };
  }, []);

  // Compute learned progress per trail
  const progressMap = useMemo(() => {
    const slugs: TrailSlug[] = ["saudacoes", "familia", "natureza", "animais"];
    const out: Record<string, { count: number; total: number; percent: number }> = {};
    for (const slug of slugs) {
      const learned = getLearned(slug);
      const total = TOTEMS_CONFIG[slug].totalEst;
      const count = learned.size;
      const percent = Math.min(100, Math.round((count / total) * 100));
      out[slug] = { count, total, percent };
    }
    return out;
  }, []);

  // Overall progress
  const totalStats = useMemo(() => {
    const slugs: TrailSlug[] = ["saudacoes", "familia", "natureza", "animais"];
    let totalCount = 0;
    let totalMax = 0;
    for (const slug of slugs) {
      totalCount += progressMap[slug]?.count || 0;
      totalMax += TOTEMS_CONFIG[slug].totalEst;
    }
    const percent = totalMax > 0 ? Math.round((totalCount / totalMax) * 100) : 0;
    return { totalCount, totalMax, percent };
  }, [progressMap]);

  // Handle Play/Stop Narration reliably
  function toggleNarration(slug: TrailSlug, e?: React.MouseEvent) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (playingSlug === slug) {
      stopSpeak();
      setPlayingSlug(null);
      return;
    }

    stopSpeak();
    setPlayingSlug(slug);

    const cfg = TOTEMS_CONFIG[slug];
    speak(
      cfg.speechText,
      "pt-BR",
      1,
      () => {
        setPlayingSlug(slug);
      },
      () => {
        setPlayingSlug((current) => (current === slug ? null : current));
      }
    );
  }

  const slugs: TrailSlug[] = ["saudacoes", "familia", "natureza", "animais"];

  return (
    <div
      key={i18n.language}
      className="kids-theme relative min-h-screen bg-[#fbf9f4] text-[#143d2b] font-sans overflow-x-clip selection:bg-amber-300 selection:text-amber-950"
    >
      {/* Soft warm ambient lighting for kids */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(254,243,199,0.5),rgba(255,255,255,0))]"
      />

      <style>{`
        @keyframes kids-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-7px); }
        }
        @keyframes kids-dash {
          to { stroke-dashoffset: -240; }
        }
        @keyframes kids-cloud {
          0% { transform: translateX(-15px); }
          50% { transform: translateX(15px); }
          100% { transform: translateX(-15px); }
        }
        @keyframes kids-sun-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes kids-pulse-ring {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.18); opacity: 0.3; }
          100% { transform: scale(0.95); opacity: 0.8; }
        }
        .kids-totem {
          animation: kids-float 3.4s ease-in-out infinite;
        }
        .kids-totem:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Top Header Infantil */}
      <SiteHeader mode="infantil" />

      {/* Main Container */}
      <main className="relative z-10 mx-auto w-full max-w-6xl px-3 sm:px-6 lg:px-8 pb-24 pt-4 font-['Hind',sans-serif]">
        {/* Banner de Boas-Vindas da Aldeia */}
        <section className="relative mb-6 overflow-hidden rounded-[2.5rem] border-4 border-amber-300 bg-gradient-to-r from-[#fffef5] via-[#fef7e6] to-[#f5edd2] p-5 sm:p-7 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
            <div className="flex items-center gap-4">
              {/* Avatar da aldeia */}
              <div className="relative shrink-0">
                <img
                  src={kidsCharacter}
                  alt="Mascote da Aldeia"
                  className="h-16 w-16 sm:h-20 sm:w-20 object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.18)] transform hover:scale-105 transition"
                />
                <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-xs text-amber-950 font-black shadow-md border-2 border-white">
                  ✨
                </span>
              </div>

              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 border border-amber-300 px-3 py-0.5 text-xs font-black uppercase tracking-wider text-amber-900">
                  <Compass className="h-3.5 w-3.5 text-emerald-800" />
                  ✦ Trilha Mágica da Aldeia • Patxôhã ✦
                </div>
                <h1
                  className="mt-1.5 font-display text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight"
                  style={{ color: "#064e3b" }}
                >
                  Caminho dos Saberes Ancestrais
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-slate-700 max-w-xl font-semibold leading-relaxed">
                  Aprenda a língua e costumes do povo Pataxó passo a passo! Toque nos totens para ouvir e desvendar cada segredo.
                </p>
              </div>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 bg-white/95 border-2 border-amber-300 rounded-2xl px-4 py-3 shrink-0 shadow-sm">
              <div className="text-left sm:text-right">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-800 flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                  Progresso Geral
                </span>
                <span className="font-display text-xl sm:text-2xl font-black text-emerald-950">
                  {totalStats.totalCount} / {totalStats.totalMax}{" "}
                  <span className="text-xs font-sans text-amber-800 font-bold">
                    palavras ({totalStats.percent}%)
                  </span>
                </span>
              </div>
              <div className="w-28 sm:w-36 h-2.5 rounded-full bg-amber-100 overflow-hidden border border-amber-300">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${totalStats.percent}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Trail Quest Cards (Layout Limpo e Centrado) */}
        <div className="mx-auto max-w-4xl space-y-4">
          <div className="flex items-center justify-between px-1 mb-2">
            <Link
              to={backHref as "/"}
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-black text-[#0284c7] shadow-sm border border-sky-100 hover:bg-sky-50 active:scale-95 transition-all"
              aria-label="Voltar para o Menu"
            >
              <span aria-hidden>←</span> Menu Infantil
            </Link>

            <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              <Sparkles className="h-3 w-3 text-amber-500" />
              Missões da Aldeia
            </span>
          </div>

          <div className="flex items-center justify-between px-1">
            <div>
              <h2
                className="font-display text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2"
                style={{ color: "#064e3b" }}
              >
                <Award className="h-6 w-6 text-amber-500" />
                Missões da Aldeia
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 font-semibold">
                Complete cada etapa para liberar novos desafios sagrados!
              </p>
            </div>
          </div>

          {/* Trail Cards Grid */}
          <div className="space-y-4">
              {slugs.map((slug) => {
                const cfg = TOTEMS_CONFIG[slug];
                const prog = progressMap[slug] || { count: 0, total: cfg.totalEst, percent: 0 };
                const isPlaying = playingSlug === slug;

                return (
                  <article
                    key={slug}
                    className="relative overflow-hidden rounded-3xl bg-white p-4 sm:p-5 border-2 border-amber-200 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      {/* Trail Visual Cover Thumbnail */}
                      <div className="relative h-24 sm:h-28 w-full sm:w-28 shrink-0 overflow-hidden rounded-2xl border-2 border-black/5 shadow-inner">
                        <img
                          src={cfg.img}
                          alt={cfg.label}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <span className="absolute bottom-2 left-2 text-xl drop-shadow">
                          {cfg.emoji}
                        </span>
                        {prog.percent === 100 && (
                          <span className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white text-xs font-black shadow">
                            ✓
                          </span>
                        )}
                      </div>

                      {/* Content Column */}
                      <div className="flex-1 min-w-0">
                        {/* Step badge & word tags */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className="rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-800"
                            style={{ background: cfg.badgeBg }}
                          >
                            {cfg.stepBadge}
                          </span>
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                            {cfg.highlightWords}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="mt-1 font-display text-xl sm:text-2xl font-black text-slate-900 tracking-tight group-hover:text-emerald-700 transition">
                          Trilha de {cfg.label}
                        </h3>

                        {/* Description */}
                        <p className="mt-1 text-xs sm:text-[13px] text-slate-600 leading-relaxed font-medium">
                          {cfg.desc}
                        </p>

                        {/* Progress Bar & Details */}
                        <div className="mt-3 flex items-center gap-3">
                          <div className="h-3 flex-1 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${prog.percent}%`,
                                background: cfg.btnBg,
                              }}
                            />
                          </div>
                          <span className="text-xs font-black text-slate-700 tabular-nums shrink-0">
                            {prog.count}/{prog.total} ({prog.percent}%)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons Row */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                      {/* Audio Narration Button with Working Speech Synthesis */}
                      <button
                        type="button"
                        onClick={(e) => toggleNarration(slug, e)}
                        data-speech-control
                        className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-black uppercase tracking-wider text-white transition-all transform active:translate-y-1 shadow-md cursor-pointer ${
                          isPlaying
                            ? "bg-rose-600 hover:bg-rose-500 shadow-[0_4px_0_#9f1239]"
                            : "hover:brightness-110"
                        }`}
                        style={{
                          backgroundColor: isPlaying ? "#e11d48" : cfg.btnBg,
                          boxShadow: `0 4px 0 ${isPlaying ? "#9f1239" : cfg.btnShadow}`,
                        }}
                      >
                        {isPlaying ? (
                          <>
                            <SoundEqualizer />
                            <span>PAUSAR ÁUDIO</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="h-4 w-4" />
                            <span>OUVIR HISTÓRIA</span>
                          </>
                        )}
                      </button>

                      {/* Primary Adventure Action: Go to Trail */}
                      <Link
                        to="/trilhas/$slug"
                        params={{ slug }}
                        search={{ area: "infantil" }}
                        className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-2 text-xs font-black uppercase tracking-wider text-white shadow-[0_4px_0_#065f46] hover:bg-emerald-500 hover:shadow-[0_4px_0_#047857] active:translate-y-1 active:shadow-none transition-all"
                      >
                        <span>
                          {prog.percent > 0 ? "CONTINUAR TRILHA" : "ENTRAR NA TRILHA"}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Friendly Educational Footer Message */}
            <div className="rounded-2xl border-2 border-amber-300 bg-gradient-to-r from-amber-50 via-emerald-50 to-amber-50 p-4 text-slate-800 shadow-sm flex items-center gap-3">
              <span className="text-2xl">🏹</span>
              <p className="text-xs sm:text-sm font-semibold leading-relaxed text-slate-700">
                <strong className="text-emerald-900 font-black">Sabedoria do Professor Akuã:</strong> Ao terminar cada trilha, você ganha um certificado sagrado e abre novos cantos e jogos especiais!
              </p>
            </div>
          </div>
        </main>

      {/* Footer Infantil */}
      <SiteFooter mode="infantil" />
    </div>
  );
}

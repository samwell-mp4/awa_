import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getSiteConfig } from "@/lib/admin-layout.functions";
import {
  BookOpen,
  ChevronRight,
  Flame,
  Play,
  Star,
  Volume2,
  VolumeX,
  Maximize2,
  Mic,
  Music,
  GraduationCap,
  Sparkles,
  Award,
  Video,
  Compass,
  Home,
  User,
  CheckCircle2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { SiteHeader } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { supabase } from "@/integrations/supabase/client";
import { getPaddleEnvironment } from "@/lib/paddle";
import { setLastArea } from "@/lib/last-area";
import { useActiveTemplate } from "@/hooks/use-active-template";
import { useUserStats } from "@/hooks/use-user-stats";
import { KidsWordQuiz } from "@/components/kids/KidsWordQuiz";
import { isTestModeActive } from "@/hooks/use-auth";

import infantilLogo from "@/assets/infantil-logo-new.jpg.asset.json";
import kidsLogoRef from "@/assets/infantil-logo-ref.png";
import menuVideo from "@/assets/infantil-menu-video.mp4.asset.json";
import kidsBg from "@/assets/kids-menu-bg.jpg";
import kidsCharacter from "@/assets/kids-menu-character.png";
import trailSaudacoes from "@/assets/trail-saudacoes.jpg";
import trailFamilia from "@/assets/trail-familia.jpg";
import trailNatureza from "@/assets/trail-natureza.jpg";
import trailAnimais from "@/assets/trail-animais.jpg";
import trailCultura from "@/assets/trail-cultura.jpg";

export const Route = createFileRoute("/infantil")({
  ssr: false,
  beforeLoad: async () => {
    if (import.meta.env.DEV || isTestModeActive()) return;
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth", reloadDocument: true });
    const { data: hasAccess } = await supabase.rpc("has_plan_access", {
      _user_id: data.user.id,
      _plan: "infantil",
      _check_env: getPaddleEnvironment(),
    });
    if (!hasAccess) {
      throw redirect({
        to: "/planos",
        search: { need: "infantil" } as any,
        reloadDocument: true,
      });
    }
  },

  head: () => ({
    meta: [
      { title: "Awã Tech Infantil — Trilha da Aldeia" },
      {
        name: "description",
        content:
          "Área infantil do Awã Tech: trilhas, cânticos, histórias, jogos e amizade para crianças aprenderem línguas indígenas brincando.",
      },
      { property: "og:title", content: "Awã Tech Infantil" },
      {
        property: "og:description",
        content: "Trilha da Aldeia — menu ilustrado para crianças no Awã Tech.",
      },
    ],
  }),
  component: InfantilHome,
});

const TRAIL_CARDS = [
  { n: 1, label: "Saudações", img: trailSaudacoes, to: "/trilhas/$slug", slug: "saudacoes", tint: "#52b788", progress: 60, area: "infantil" },
  { n: 2, label: "Família", img: trailFamilia, to: "/trilhas/$slug", slug: "familia", tint: "#f59e0b", progress: 40, area: "infantil" },
  { n: 3, label: "Natureza", img: trailNatureza, to: "/trilhas/$slug", slug: "natureza", tint: "#2f8f9d", progress: 25, area: "infantil" },
  { n: 4, label: "Animais", img: trailAnimais, to: "/trilhas/$slug", slug: "animais", tint: "#ef4444", progress: 15, area: "infantil" },
  { n: 5, label: "Cultura", img: trailCultura, to: "/trilhas-infantil", slug: null, tint: "#a855f7", progress: 10 },
] as const;

const EXPLORE_ICONS = [
  { label: "Pronúncia", icon: Mic, to: "/traduzir", bg: "from-[#2d6a4f] to-[#1b4332]", iconColor: "#ffd166" },
  { label: "Músicas", icon: Music, to: "/musicas-infantil", bg: "from-[#2d6a4f] to-[#1b4332]", iconColor: "#ffd166" },
  { label: "Histórias", icon: BookOpen, to: "/historias-infantil", bg: "from-[#2d6a4f] to-[#1b4332]", iconColor: "#ffd166" },
  { label: "Ofícios", icon: Sparkles, to: "/aldeia-velha", bg: "from-[#2d6a4f] to-[#1b4332]", iconColor: "#ffd166" },
  { label: "Aprender Números", icon: GraduationCap, to: "/aprender-numeros", search: { area: "infantil" }, bg: "from-[#2d6a4f] to-[#1b4332]", iconColor: "#ffd166" },
  { label: "Vídeos", icon: Video, to: "/videos", bg: "from-[#2d6a4f] to-[#1b4332]", iconColor: "#ffd166" },
];

const CULTURAL_TIPS = [
  {
    title: "A Saudação Sagrada Awê!",
    text: "Quando os Pataxó dizem 'Awê!', desejam que todos os espíritos da mata tragam alegria, saúde e união para você e sua família!",
    badge: "Saudação",
    icon: "🕊️",
  },
  {
    title: "O Canto do Maracá",
    text: "O Maracá é feito com cabaça e sementes sagradas. Quando tocamos, a música imita o som da chuva abençoando as árvores!",
    badge: "Música & Espírito",
    icon: "🪇",
  },
  {
    title: "Cuidando das Águas (Kaimbé)",
    text: "Os rios são as veias da terra. As crianças da aldeia aprendem a nadar e proteger os peixes e nascentes desde bem pequeninas.",
    badge: "Natureza Viva",
    icon: "💧",
  },
  {
    title: "O Pássaro Guardião",
    text: "O canto do gavião nos avisa quando a manhã começa. Respeitar os animais é o primeiro mandamento de todo jovem aprendiz!",
    badge: "Guardião",
    icon: "🦅",
  },
  {
    title: "As Cores do Urucum",
    text: "Nossos grafismos corporais são feitos com tinta natural de jenipapo e urucum vermelho, trazendo coragem e proteção!",
    badge: "Pintura Sagrada",
    icon: "🎨",
  },
];

const ACHIEVEMENTS = [
  { title: "Primeira Flecha", desc: "Completou lição 1", icon: "🏹", unlocked: true, pts: "+50 pts" },
  { title: "Amigo da Mata", desc: "Explorou a floresta", icon: "🌿", unlocked: true, pts: "+50 pts" },
  { title: "Olho de Gavião", desc: "Acertou palavra Kaimbé", icon: "🦅", unlocked: true, pts: "+100 pts" },
  { title: "Ritmo do Maracá", desc: "Ouviu cânticos Pataxó", icon: "🪇", unlocked: true, pts: "+50 pts" },
  { title: "Canoeiro Ágil", desc: "7 dias seguidos ativo", icon: "🛶", unlocked: true, pts: "+100 pts" },
  { title: "Sábio da Aldeia", desc: "Nível 5 no Dicionário", icon: "👑", unlocked: false, pts: "Em breve" },
];

function InfantilHome() {
  const { t } = useTranslation();
  useEffect(() => setLastArea("/infantil"), []);
  const getFn = useServerFn(getSiteConfig);
  const { config } = useActiveTemplate("infantil");
  const { points, level, streak } = useUserStats();
  const [playingWord, setPlayingWord] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const videoCardRef = useRef<HTMLVideoElement>(null);
  const [tipIndex, setTipIndex] = useState(0);
  const [natureAudio, setNatureAudio] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const { data: branding } = useQuery({
    queryKey: ["site_config", "branding"],
    queryFn: () => getFn({ data: "branding" }),
  });

  const logoUrl = kidsLogoRef || branding?.infantil_logo_url || infantilLogo.url;
  const videoUrl = branding?.infantil_menu_video_url || menuVideo.url;

  const currentLevel = level || 2;
  const currentStreak = streak || 7;
  const currentPoints = points || 250;
  const nextLevelPct = Math.min(100, Math.max(15, currentPoints % 100 || 60));

  const toggleNatureSound = () => {
    if (natureAudio) {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => { });
        audioCtxRef.current = null;
      }
      setNatureAudio(false);
    } else {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;

        // Gerar suave brisa da floresta
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 350;

        const gain = ctx.createGain();
        gain.gain.value = 0.05;

        whiteNoise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        whiteNoise.start();

        setNatureAudio(true);
      } catch {
        setNatureAudio(false);
      }
    }
  };

  const playPronunciation = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    setPlayingWord(true);
    const u = new SpeechSynthesisUtterance("Kaimbé");
    u.lang = "pt-BR";
    u.rate = 0.85;
    u.onend = () => setPlayingWord(false);
    u.onerror = () => setPlayingWord(false);
    window.speechSynthesis.speak(u);
  };

  return (
    <div className="kids-theme relative min-h-screen bg-[#fbf9f4] text-slate-800 font-sans overflow-x-clip selection:bg-amber-300 selection:text-amber-950">
      {/* Soft warm ambient lighting for kids */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(254,243,199,0.5),rgba(255,255,255,0))]"
      />

      {/* Floating Animated Emojis in Background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden select-none z-0 opacity-40"
      >
        <span
          className="absolute left-[5%] top-[120px] text-3xl"
          style={{ animation: "music-float 6s ease-in-out infinite" }}
        >
          ✨
        </span>
        <span
          className="absolute right-[8%] top-[170px] text-4xl"
          style={{ animation: "music-float 7s ease-in-out infinite 1.5s" }}
        >
          🦜
        </span>
        <span
          className="absolute left-[11%] top-[450px] text-3xl"
          style={{ animation: "music-float 8s ease-in-out infinite 0.7s" }}
        >
          🪘
        </span>
        <span
          className="absolute right-[13%] top-[520px] text-3xl"
          style={{ animation: "music-float 5.5s ease-in-out infinite 2s" }}
        >
          🏹
        </span>
        <span
          className="absolute left-[3%] top-[780px] text-3xl"
          style={{ animation: "music-float 9s ease-in-out infinite 1s" }}
        >
          ☀️
        </span>
        <span
          className="absolute right-[5%] top-[860px] text-3xl"
          style={{ animation: "music-float 6.5s ease-in-out infinite 2.5s" }}
        >
          🌿
        </span>
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <SiteHeader mode="infantil" />

        <main className="mx-auto w-full max-w-5xl flex-1 px-3 sm:px-6 pb-24 pt-4">
          {/* ========================================================= */}
          {/* 1. SAUDAÇÃO AO ALUNO & RESUMO RÁPIDO                      */}
          {/* ========================================================= */}
          <section className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-5 rounded-[2.5rem] border-4 border-amber-300 bg-gradient-to-r from-[#fffef5] via-[#fef7e6] to-[#f5edd2] p-5 sm:p-7 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2 border-amber-300 bg-white shadow-md">
                <img
                  src={kidsCharacter}
                  alt="Akuá Pataxó"
                  className="h-full w-full object-cover object-top transform hover:scale-105 transition"
                  style={{ animation: "music-float 4s ease-in-out infinite" }}
                />
                <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-xs text-amber-950 font-black shadow-md border-2 border-white">
                  ✨
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1
                    className="font-display text-xl sm:text-2xl md:text-3xl font-black tracking-tight"
                    style={{ color: "#064e3b" }}
                  >
                    Awê, Pequeno Aprendiz!
                  </h1>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 font-semibold mt-0.5">
                  Pronto para continuar explorando as línguas e saberes sagrados da Aldeia?
                </p>
              </div>
            </div>

            {/* Quick stats & sound toggle */}
            <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
              <button
                onClick={toggleNatureSound}
                type="button"
                className={`flex items-center gap-1.5 rounded-2xl border-2 px-3.5 py-2 text-xs font-black shadow-sm transition active:translate-y-0.5 ${natureAudio
                  ? "border-emerald-500 bg-emerald-100 text-emerald-900"
                  : "border-amber-300 bg-white text-slate-700 hover:bg-amber-50"
                  }`}
                title={natureAudio ? "Pausar som da mata" : "Ouvir som suave da mata"}
              >
                <Volume2 className={`h-4 w-4 ${natureAudio ? "animate-pulse text-emerald-600" : ""}`} />
                <span>{natureAudio ? "Mata Ativa" : "Sons da Mata"}</span>
              </button>

              <div className="flex items-center gap-1.5 rounded-2xl border-2 border-amber-300 bg-white/95 px-3.5 py-2 text-xs font-black text-amber-900 shadow-sm">
                <Flame className="h-4 w-4 fill-amber-500 text-orange-500" />
                <span>{currentStreak} dias</span>
              </div>

              <div className="flex items-center gap-1.5 rounded-2xl border-2 border-amber-300 bg-white/95 px-3.5 py-2 text-xs font-black text-amber-900 shadow-sm">
                <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
                <span>{currentPoints} pts</span>
              </div>
            </div>
          </section>

          {/* ========================================================= */}
          {/* 2. CONTINUAR APRENDENDO (DESTAQUE HERO)                    */}
          {/* ========================================================= */}
          <section className="mb-6">
            <div className="relative overflow-hidden rounded-3xl border-3 border-amber-300 bg-white p-5 sm:p-6 shadow-md hover:shadow-lg transition">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider text-amber-900 border border-amber-300">
                      <Sparkles className="h-3.5 w-3.5 text-emerald-800" /> Continue de onde parou
                    </span>
                    <span className="text-xs font-bold text-amber-800">Última atividade</span>
                  </div>

                  <h2
                    className="font-display text-xl sm:text-2xl md:text-3xl font-black tracking-tight"
                    style={{ color: "#064e3b" }}
                  >
                    Saudações em Patxôhã
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm text-slate-600 font-medium">
                    Lição 3 de 8 • Expressões de boas-vindas e respeito ancestral
                  </p>

                  <div className="mt-4 max-w-md">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1.5">
                      <span>Progresso da Trilha</span>
                      <span className="text-amber-800 font-extrabold">38% concluído</span>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-amber-100 border border-amber-300">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-emerald-500 transition-all duration-500"
                        style={{ width: "38%" }}
                      />
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center">
                  <Link
                    to="/trilhas/$slug"
                    params={{ slug: "saudacoes" }}
                    search={{ area: "infantil" }}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 px-6 py-3.5 text-base font-black text-amber-950 shadow-[0_4px_0_#b45309] hover:brightness-105 active:translate-y-1 active:shadow-none transition cursor-pointer"
                  >
                    <span>Continuar aprendendo</span>
                    <ChevronRight className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================= */}
          {/* 3. RESUMO DO APRENDIZADO & NÍVEL                           */}
          {/* ========================================================= */}
          <section className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="flex items-center gap-3.5 rounded-2xl border-2 border-amber-200/90 bg-white p-4 shadow-sm hover:shadow-md transition">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-100 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-black uppercase tracking-wider text-amber-800">
                  Lições Completas
                </div>
                <div
                  className="font-display text-lg sm:text-xl font-black"
                  style={{ color: "#064e3b" }}
                >
                  12 atividades
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3.5 rounded-2xl border-2 border-amber-200/90 bg-white p-4 shadow-sm hover:shadow-md transition">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber-100 text-amber-800 border border-amber-200">
                <Award className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-black uppercase tracking-wider text-amber-800">
                  Nível do Aprendiz
                </div>
                <div
                  className="font-display text-lg sm:text-xl font-black text-amber-900"
                  style={{ color: "#78350f" }}
                >
                  Nível {currentLevel} • Curioso da Mata
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3.5 rounded-2xl border-2 border-amber-200/90 bg-white p-4 shadow-sm hover:shadow-md transition">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-orange-100 text-orange-800 border border-orange-200">
                <Compass className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-black uppercase tracking-wider text-amber-800">
                  Trilhas Ativas
                </div>
                <div
                  className="font-display text-lg sm:text-xl font-black"
                  style={{ color: "#064e3b" }}
                >
                  3 em andamento
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================= */}
          {/* 4. TRILHAS DA ALDEIA (PERCURSO EDUCACIONAL)               */}
          {/* ========================================================= */}
          <section className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2
                  className="font-display text-xl sm:text-2xl font-black tracking-tight"
                  style={{ color: "#064e3b" }}
                >
                  Trilhas da Aldeia
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 font-semibold">
                  Seu caminho de aprendizado passo a passo
                </p>
              </div>
              <Link
                to="/trilhas-infantil"
                className="inline-flex items-center gap-1 rounded-2xl bg-amber-100 border border-amber-300 px-3.5 py-1.5 text-xs font-black text-amber-900 shadow-sm hover:bg-amber-200 transition"
              >
                <span>Ver Mapa Completo</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
              {TRAIL_CARDS.map((c) => (
                <Link
                  key={c.label}
                  to={c.to as any}
                  params={(c.slug ? { slug: c.slug } : {}) as any}
                  search={(c.slug ? { area: c.area } : {}) as any}
                  className="group flex flex-col overflow-hidden rounded-3xl border-2 border-amber-200/90 bg-white shadow-md transition-all hover:-translate-y-1 hover:border-amber-400 hover:shadow-xl"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                    <img
                      src={c.img}
                      alt={c.label}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-2 left-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-black text-amber-950 border border-amber-300 shadow">
                      #{c.n}
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-3">
                    <div>
                      <div
                        className="font-display font-black text-sm truncate group-hover:text-emerald-700 transition"
                        style={{ color: "#064e3b" }}
                      >
                        {c.label}
                      </div>
                      <div className="text-[11px] font-bold text-amber-800 mt-0.5">
                        {c.progress}% concluído
                      </div>
                    </div>

                    <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-amber-100 border border-amber-200">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-500"
                        style={{ width: `${c.progress}%` }}
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* ========================================================= */}
          {/* 5. ATIVIDADE RECOMENDADA & PALAVRA DO DIA                  */}
          {/* ========================================================= */}
          <section className="mb-8 grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Atividade Recomendada (Vídeo do Dia) */}
            <div className="md:col-span-7 rounded-3xl border-2 border-amber-200/90 bg-white p-5 flex flex-col justify-between shadow-md hover:shadow-lg transition">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-900">
                    Atividade Recomendada
                  </span>
                  <span className="text-xs font-bold text-amber-800">Vídeo Bilíngue</span>
                </div>

                <h3
                  className="font-display text-lg sm:text-xl font-black tracking-tight"
                  style={{ color: "#064e3b" }}
                >
                  Saudações em Pataxó com Professor Awuá
                </h3>
                <p className="mt-1 text-xs text-slate-600 font-medium">
                  Aprenda as primeiras palavras de cumprimento da floresta de forma interativa.
                </p>

                <div className="relative mt-3 aspect-video w-full overflow-hidden rounded-2xl border-2 border-amber-300 bg-black shadow-md group">
                  <video
                    ref={videoCardRef}
                    src={videoUrl}
                    autoPlay
                    loop
                    muted={isVideoMuted}
                    playsInline
                    className="h-full w-full object-cover"
                  />
                  {/* Overlay Controls */}
                  <div className="absolute bottom-2.5 right-2.5 flex items-center gap-2 z-10">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsVideoMuted((prev) => !prev);
                        if (videoCardRef.current) {
                          videoCardRef.current.muted = !videoCardRef.current.muted;
                        }
                      }}
                      className="flex items-center gap-1.5 rounded-full bg-black/75 hover:bg-black/90 backdrop-blur-md px-3 py-1 text-xs font-black text-amber-200 border border-amber-400/60 shadow transition active:scale-95 cursor-pointer"
                      title={isVideoMuted ? "Ativar som do vídeo" : "Silenciar vídeo"}
                    >
                      {isVideoMuted ? (
                        <>
                          <VolumeX className="h-3.5 w-3.5 text-amber-300" />
                          <span>Ativar Som</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="h-3.5 w-3.5 text-emerald-400" />
                          <span className="text-emerald-300">Com Som</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowVideoModal(true)}
                      className="grid h-7 w-7 place-items-center rounded-full bg-black/75 hover:bg-black/90 backdrop-blur-md text-amber-200 border border-amber-400/60 shadow transition active:scale-95 cursor-pointer"
                      title="Abrir em tela cheia"
                    >
                      <Maximize2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Badge: Em Loop */}
                  <div className="pointer-events-none absolute top-2.5 left-2.5 flex items-center gap-1.5 rounded-full bg-emerald-950/85 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-300 border border-emerald-500/50 shadow">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Em Loop • Professor Awuá</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between pt-3 border-t border-amber-100">
                <div className="text-xs text-amber-900 font-bold">
                  Awê! = Olá! Seja bem-vindo!
                </div>
                <button
                  onClick={() => setShowVideoModal(true)}
                  className="rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-2 text-xs font-black text-amber-950 shadow-[0_3px_0_#b45309] hover:brightness-105 active:translate-y-1 active:shadow-none transition cursor-pointer"
                >
                  Ver em Tela Cheia ⛶
                </button>
              </div>
            </div>

            {/* Palavra do Dia & Sabedoria Cultural */}
            <div className="md:col-span-5 flex flex-col gap-4">
              {/* Palavra do Dia */}
              <div className="flex-1 rounded-3xl border-2 border-amber-200/90 bg-white p-5 flex flex-col justify-between shadow-md">
                <div>
                  <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-amber-800 mb-1">
                    <span>Palavra do Dia</span>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-900 border border-emerald-200">
                      Patxôhã
                    </span>
                  </div>
                  <div
                    className="font-display text-3xl font-black"
                    style={{ color: "#064e3b" }}
                  >
                    Kaimbé
                  </div>
                  <div className="text-xs text-slate-700 font-semibold mt-1">
                    Significado: <strong className="text-emerald-800 font-black">rio, correnteza d'água</strong>
                  </div>
                </div>

                <button
                  onClick={playPronunciation}
                  disabled={playingWord}
                  className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-2.5 text-xs font-black text-amber-950 shadow-[0_3px_0_#b45309] hover:brightness-105 active:translate-y-1 active:shadow-none transition cursor-pointer"
                >
                  <Volume2 className={`h-4 w-4 ${playingWord ? "animate-pulse" : ""}`} />
                  <span>{playingWord ? "Ouvindo..." : "Ouvir Pronúncia"}</span>
                </button>
              </div>

              {/* Sabedoria Cultural */}
              <div className="rounded-3xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-emerald-50 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
                    {CULTURAL_TIPS[tipIndex].badge}
                  </span>
                  <button
                    onClick={() => setTipIndex((prev) => (prev + 1) % CULTURAL_TIPS.length)}
                    className="text-xs font-black text-emerald-800 hover:underline"
                  >
                    Próxima dica →
                  </button>
                </div>
                <div
                  className="font-display font-black text-sm mt-2"
                  style={{ color: "#064e3b" }}
                >
                  {CULTURAL_TIPS[tipIndex].title}
                </div>
                <p className="text-xs text-slate-700 font-medium mt-1 leading-relaxed">
                  "{CULTURAL_TIPS[tipIndex].text}"
                </p>
              </div>
            </div>
          </section>

          {/* ========================================================= */}
          {/* 6. EXPLORAR A ALDEIA (CENTRAL DE ATIVIDADES)               */}
          {/* ========================================================= */}
          <section className="mb-8">
            <div className="mb-4">
              <h2
                className="font-display text-xl sm:text-2xl font-black tracking-tight"
                style={{ color: "#064e3b" }}
              >
                Explorar a Aldeia
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-semibold">
                Atividades educativas complementares para todas as idades
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5">
              {EXPLORE_ICONS.map((item) => (
                <Link
                  key={item.label}
                  to={item.to as any}
                  search={(item as any).search}
                  className="group flex flex-col items-center gap-2.5 rounded-3xl border-2 border-amber-200/90 bg-white p-4 text-center shadow-md transition-all hover:-translate-y-1 hover:border-amber-400 hover:shadow-xl"
                >
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-amber-100 border border-amber-200 text-amber-900 group-hover:scale-110 transition shadow-inner">
                    <item.icon className="h-7 w-7" />
                  </div>
                  <span
                    className="text-xs font-black group-hover:text-emerald-700 transition leading-tight"
                    style={{ color: "#064e3b" }}
                  >
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* ========================================================= */}
          {/* 7. CONQUISTAS DA ALDEIA                                   */}
          {/* ========================================================= */}
          <section id="conquistas" className="mb-8">
            <div className="mb-4">
              <h2
                className="font-display text-xl sm:text-2xl font-black tracking-tight"
                style={{ color: "#064e3b" }}
              >
                Conquistas do Aprendiz
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-semibold">
                Medalhas sagradas desbloqueadas na aldeia
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              {ACHIEVEMENTS.map((ach) => (
                <div
                  key={ach.title}
                  className={`flex items-center gap-3.5 rounded-3xl p-3.5 border-2 transition shadow-sm ${ach.unlocked
                    ? "border-emerald-300 bg-emerald-50/60"
                    : "border-slate-200 bg-white opacity-60"
                    }`}
                >
                  <div
                    className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl border-2 text-base shadow-sm ${ach.unlocked
                      ? "border-amber-400 bg-amber-100 text-amber-900"
                      : "border-slate-200 bg-slate-100 text-slate-400"
                      }`}
                  >
                    <Award className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div
                      className="truncate text-xs font-black"
                      style={{ color: ach.unlocked ? "#064e3b" : "#64748b" }}
                    >
                      {ach.title}
                    </div>
                    <div className="truncate text-[10px] text-slate-500 font-medium">
                      {ach.desc}
                    </div>
                    <div className="text-[10px] font-black text-emerald-800 mt-0.5">
                      {ach.unlocked ? "✓ Desbloqueada" : "Bloqueada"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ========================================================= */}
          {/* 8. QUIZ DA PALAVRA DO DIA                                  */}
          {/* ========================================================= */}
          <section id="quiz" className="mb-8">
            <KidsWordQuiz />
          </section>
        </main>

        {/* Modal de Vídeo Leve e Otimizado */}
        {showVideoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              onClick={() => setShowVideoModal(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            />
            <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-[2.5rem] border-4 border-amber-300 bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b-2 border-amber-200 px-5 py-4 bg-amber-50">
                <div
                  className="font-display font-black text-lg"
                  style={{ color: "#064e3b" }}
                >
                  Saudações em Pataxó
                </div>
                <button
                  onClick={() => setShowVideoModal(false)}
                  className="grid h-9 w-9 place-items-center rounded-full border-2 border-amber-300 bg-white text-slate-800 hover:scale-105 shadow-sm"
                >
                  ✕
                </button>
              </div>
              <div className="aspect-video w-full bg-black">
                <video
                  src={videoUrl}
                  controls
                  autoPlay
                  playsInline
                  className="h-full w-full object-contain"
                />
              </div>
            </div>
          </div>
        )}

        <SiteFooter mode="infantil" />
      </div>
    </div>
  );
}

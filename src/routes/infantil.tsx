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
        audioCtxRef.current.close().catch(() => {});
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
    <div
      className="kids-theme relative min-h-screen text-foreground font-sans"
      style={{
        backgroundImage: `url(${kidsBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Visual control scrim over the forest background so it functions as atmosphere */}
      <div aria-hidden className="awa-bg-scrim pointer-events-none fixed inset-0" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <SiteHeader mode="infantil" />

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-24 pt-4 sm:px-6">
          {/* ========================================================= */}
          {/* 1. SAUDAÇÃO AO ALUNO & RESUMO RÁPIDO                      */}
          {/* ========================================================= */}
          <section className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-2xl border border-[#633916]/50 bg-[#1e1107]/90 p-4 sm:p-5 backdrop-blur-md shadow-lg">
            <div className="flex items-center gap-4">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border-2 border-[#ffd166] bg-[#1b4332] shadow-md">
                <img
                  src={kidsCharacter}
                  alt="Akuá Pataxó"
                  className="h-full w-full object-cover object-top"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-[#ffd166] tracking-tight">
                    Awê, Pequeno Aprendiz!
                  </h1>
                </div>
                <p className="text-xs sm:text-sm text-[#fefae0]/80">
                  Pronto para continuar explorando as línguas e saberes da Aldeia?
                </p>
              </div>
            </div>

            {/* Quick stats & sound toggle */}
            <div className="flex items-center gap-2 self-start md:self-auto">
              <button
                onClick={toggleNatureSound}
                type="button"
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                  natureAudio
                    ? "border-[#2a9d8f] bg-[#2a9d8f]/20 text-[#2a9d8f]"
                    : "border-[#633916] bg-[#251408] text-[#fefae0]/70 hover:text-[#ffd166]"
                }`}
                title={natureAudio ? "Pausar som da mata" : "Ouvir som suave da mata"}
              >
                <Volume2 className={`h-4 w-4 ${natureAudio ? "animate-pulse" : ""}`} />
                <span className="hidden sm:inline">{natureAudio ? "Mata Ativa" : "Sons da Mata"}</span>
              </button>

              <div className="flex items-center gap-1.5 rounded-xl border border-[#633916] bg-[#251408] px-3 py-1.5 text-xs font-bold text-[#ffd166]">
                <Flame className="h-4 w-4 fill-[#ffd166] text-[#ffd166]" />
                <span>{currentStreak} dias</span>
              </div>

              <div className="flex items-center gap-1.5 rounded-xl border border-[#633916] bg-[#251408] px-3 py-1.5 text-xs font-bold text-[#ffd166]">
                <Star className="h-4 w-4 fill-[#ffd166] text-[#ffd166]" />
                <span>{currentPoints} pts</span>
              </div>
            </div>
          </section>

          {/* ========================================================= */}
          {/* 2. CONTINUAR APRENDENDO (DESTAQUE HERO - CARD LEVEL 1)     */}
          {/* ========================================================= */}
          <section className="mb-6">
            <div className="awa-card-1 relative overflow-hidden rounded-2xl p-5 sm:p-6 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="inline-flex items-center gap-1 rounded-md bg-[#ffd166]/20 px-2 py-0.5 text-[11px] font-black uppercase tracking-wider text-[#ffd166] border border-[#ffd166]/40">
                      <Sparkles className="h-3 w-3" /> Continue de onde parou
                    </span>
                    <span className="text-xs text-[#d4a373]">Última atividade</span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black text-[#fefae0] tracking-tight">
                    Saudações em Patxôhã
                  </h2>
                  <p className="mt-1 text-sm text-[#fefae0]/80">
                    Lição 3 de 8 • Expressões de boas-vindas e respeito ancestral
                  </p>

                  <div className="mt-4 max-w-md">
                    <div className="flex items-center justify-between text-xs font-bold text-[#d4a373] mb-1.5">
                      <span>Progresso da Trilha</span>
                      <span className="text-[#ffd166]">38% concluído</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#180e07] border border-[#633916]/40">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#2a9d8f] to-[#4ade80] transition-all duration-500"
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
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ffd166] to-[#f59e0b] px-6 py-3.5 text-base font-black text-[#1a0e04] shadow-lg transition hover:brightness-110 active:scale-95"
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
          <section className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="awa-card-3 flex items-center gap-3.5 rounded-xl p-3.5">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#2a9d8f]/20 text-[#2a9d8f] border border-[#2a9d8f]/40">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#d4a373]">
                  Lições Completas
                </div>
                <div className="text-lg font-black text-[#fefae0]">
                  12 atividades
                </div>
              </div>
            </div>

            <div className="awa-card-3 flex items-center gap-3.5 rounded-xl p-3.5">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#ffd166]/20 text-[#ffd166] border border-[#ffd166]/40">
                <Award className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#d4a373]">
                  Nível do Aprendiz
                </div>
                <div className="text-lg font-black text-[#ffd166]">
                  Nível {currentLevel} • Curioso da Mata
                </div>
              </div>
            </div>

            <div className="awa-card-3 flex items-center gap-3.5 rounded-xl p-3.5">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40">
                <Compass className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#d4a373]">
                  Trilhas Ativas
                </div>
                <div className="text-lg font-black text-[#fefae0]">
                  3 em andamento
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================= */}
          {/* 4. TRILHAS DA ALDEIA (PERCURSO EDUCACIONAL)               */}
          {/* ========================================================= */}
          <section className="mb-8">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#fefae0] tracking-tight">
                  Trilhas da Aldeia
                </h2>
                <p className="text-xs text-[#d4a373]">
                  Seu caminho de aprendizado passo a passo
                </p>
              </div>
              <Link
                to="/trilhas-infantil"
                className="flex items-center gap-1 text-xs font-bold text-[#ffd166] hover:underline"
              >
                <span>Ver todas as 5 trilhas</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {TRAIL_CARDS.map((c) => (
                <Link
                  key={c.label}
                  to={c.to as any}
                  params={(c.slug ? { slug: c.slug } : {}) as any}
                  search={(c.slug ? { area: c.area } : {}) as any}
                  className="awa-card-2 group flex flex-col overflow-hidden rounded-xl transition hover:-translate-y-1 hover:border-[#ffd166]/60 shadow-md"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/40">
                    <img
                      src={c.img}
                      alt={c.label}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-2 left-2 rounded-md bg-[#180e07]/80 px-1.5 py-0.5 text-[10px] font-bold text-[#ffd166] border border-[#633916]">
                      #{c.n}
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-2.5">
                    <div>
                      <div className="font-bold text-sm text-[#fefae0] truncate">
                        {c.label}
                      </div>
                      <div className="text-[11px] text-[#d4a373] mt-0.5">
                        {c.progress}% concluído
                      </div>
                    </div>

                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#180e07]">
                      <div
                        className="h-full rounded-full bg-[#2a9d8f]"
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
            <div className="awa-card-2 md:col-span-7 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="rounded-md bg-[#2a9d8f]/20 border border-[#2a9d8f]/50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#2a9d8f]">
                    Atividade Recomendada
                  </span>
                  <span className="text-xs text-[#d4a373]">Vídeo Bilíngue</span>
                </div>

                <h3 className="text-lg sm:text-xl font-black text-[#fefae0]">
                  Saudações em Pataxó com Professor Awuá
                </h3>
                <p className="mt-1 text-xs text-[#fefae0]/80">
                  Aprenda as primeiras palavras de cumprimento da floresta de forma interativa.
                </p>

                <div
                  onClick={() => setShowVideoModal(true)}
                  className="group relative mt-3 aspect-video w-full cursor-pointer overflow-hidden rounded-xl border border-[#633916] bg-black/60 shadow"
                >
                  <img
                    src={kidsCharacter}
                    alt="Vídeo Saudações"
                    className="h-full w-full object-cover object-top brightness-90 group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="grid h-12 w-12 place-items-center rounded-full bg-[#ffd166] text-[#180e07] shadow-lg group-hover:scale-110 transition">
                      <Play className="ml-0.5 h-6 w-6 fill-current" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between pt-3 border-t border-[#633916]/50">
                <div className="text-xs text-[#ffd166] font-semibold">
                  Awê! = Olá! Seja bem-vindo!
                </div>
                <button
                  onClick={() => setShowVideoModal(true)}
                  className="rounded-lg bg-[#331c0e] border border-[#ffd166]/50 px-3.5 py-1.5 text-xs font-bold text-[#ffd166] hover:bg-[#432512] transition"
                >
                  Assistir agora
                </button>
              </div>
            </div>

            {/* Palavra do Dia & Sabedoria Cultural */}
            <div className="md:col-span-5 flex flex-col gap-3">
              {/* Palavra do Dia */}
              <div className="awa-card-2 flex-1 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#d4a373] mb-1">
                    <span>Palavra do Dia</span>
                    <span className="text-[#2a9d8f]">Patxôhã</span>
                  </div>
                  <div className="text-2xl font-black text-[#ffd166]">
                    Kaimbé
                  </div>
                  <div className="text-xs text-[#fefae0]/90 mt-0.5">
                    Significado: <strong className="text-[#4ade80]">rio, correnteza d'água</strong>
                  </div>
                </div>

                <button
                  onClick={playPronunciation}
                  disabled={playingWord}
                  className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-[#633916] bg-[#251408] px-3 py-2 text-xs font-bold text-[#ffd166] hover:border-[#ffd166]/60 transition"
                >
                  <Volume2 className={`h-4 w-4 ${playingWord ? "animate-pulse text-[#4ade80]" : ""}`} />
                  <span>{playingWord ? "Ouvindo..." : "Ouvir Pronúncia"}</span>
                </button>
              </div>

              {/* Sabedoria Cultural */}
              <div className="awa-card-3 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#d4a373]">
                    {CULTURAL_TIPS[tipIndex].badge}
                  </span>
                  <button
                    onClick={() => setTipIndex((prev) => (prev + 1) % CULTURAL_TIPS.length)}
                    className="text-[11px] font-bold text-[#ffd166] hover:underline"
                  >
                    Próxima dica
                  </button>
                </div>
                <div className="font-bold text-xs text-[#ffd166]">
                  {CULTURAL_TIPS[tipIndex].title}
                </div>
                <p className="text-[11px] text-[#fefae0]/80 mt-1 leading-relaxed">
                  "{CULTURAL_TIPS[tipIndex].text}"
                </p>
              </div>
            </div>
          </section>

          {/* ========================================================= */}
          {/* 6. EXPLORAR A ALDEIA (CENTRAL DE ATIVIDADES)               */}
          {/* ========================================================= */}
          <section className="mb-8">
            <div className="mb-3">
              <h2 className="text-xl sm:text-2xl font-black text-[#fefae0] tracking-tight">
                Explorar a Aldeia
              </h2>
              <p className="text-xs text-[#d4a373]">
                Atividades educativas complementares
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {EXPLORE_ICONS.map((item) => (
                <Link
                  key={item.label}
                  to={item.to as any}
                  search={(item as any).search}
                  className="awa-card-2 group flex flex-col items-center gap-2 rounded-xl p-3 text-center transition hover:-translate-y-1 hover:border-[#ffd166]/60"
                >
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#251408] border border-[#633916] text-[#ffd166] group-hover:border-[#ffd166] group-hover:scale-105 transition">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-bold text-[#fefae0] group-hover:text-[#ffd166] leading-tight">
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* ========================================================= */}
          {/* 7. CONQUISTAS DA ALDEIA (MURAL EDUCACIONAL)               */}
          {/* ========================================================= */}
          <section id="conquistas" className="mb-8">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#fefae0] tracking-tight">
                  Conquistas do Aprendiz
                </h2>
                <p className="text-xs text-[#d4a373]">
                  5 de 6 medalhas desbloqueadas
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {ACHIEVEMENTS.map((ach) => (
                <div
                  key={ach.title}
                  className={`flex items-center gap-3 rounded-xl p-3 border transition ${
                    ach.unlocked
                      ? "awa-card-2 border-[#633916]"
                      : "awa-card-3 opacity-60"
                  }`}
                >
                  <div
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border text-base ${
                      ach.unlocked
                        ? "border-[#ffd166]/50 bg-[#331c0e] text-[#ffd166]"
                        : "border-white/10 bg-black/40 text-gray-500"
                    }`}
                  >
                    <Award className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-bold text-[#fefae0]">
                      {ach.title}
                    </div>
                    <div className="truncate text-[10px] text-[#d4a373]">
                      {ach.desc}
                    </div>
                    <div className="text-[10px] font-bold text-[#2a9d8f] mt-0.5">
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
              className="fixed inset-0 bg-black/85 backdrop-blur-sm"
            />
            <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl border-2 border-[#ffd166] bg-[#241307] shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#8d5b2d] px-4 py-3">
                <div className="font-display font-black text-[#ffd166]">Saudações em Pataxó</div>
                <button
                  onClick={() => setShowVideoModal(false)}
                  className="grid h-8 w-8 place-items-center rounded-full border border-[#ffd166] bg-[#3a2212] text-[#fefae0] hover:scale-105"
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

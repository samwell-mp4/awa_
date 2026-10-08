import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  Compass,
  Library,
  Languages,
  GraduationCap,
  ScrollText,
  Play,
  Volume2,
  TreePine,
  Search,
  Sparkles,
  Flame,
  Star,
  Award,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Info,
  Calendar,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { getPaddleEnvironment } from "@/lib/paddle";
import { setLastArea } from "@/lib/last-area";
import { useAuth, isTestModeActive } from "@/hooks/use-auth";
import { useUserStats } from "@/hooks/use-user-stats";
import { useDailyMission, useHomeTrails, type HomeTrail } from "@/hooks/use-home-data";
import { fetchSaudacoes, pickByHour, type Saudacao } from "@/routes/saudacoes";
import { playFast, base64ToBlobUrl } from "@/lib/audio-play";
import { narratePublic } from "@/lib/narrate-public.functions";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { SiteHeader } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { DailyMissionCard } from "@/components/home/daily-mission-card";
import { RankingCard } from "@/components/home/ranking-card";
import { InstallCTA } from "@/components/home/install-cta";
import { ErrorBoundary } from "@/components/ErrorBoundary";

import { TRAILS, getLearned, hasCertificate, FRASES_SABEDORIA, type TrailSlug } from "@/lib/trilhas";
import { trailSlugMap } from "@/lib/home-content";
import trailSaudacoes from "@/assets/trail-saudacoes.jpg";

export const Route = createFileRoute("/adulto")({
  ssr: false,
  beforeLoad: async () => {
    if (import.meta.env.DEV || isTestModeActive()) return;
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth", reloadDocument: true });
    const { data: hasAccess } = await supabase.rpc("has_plan_access", {
      _user_id: data.user.id,
      _plan: "adulto",
      _check_env: getPaddleEnvironment(),
    });
    if (!hasAccess) {
      throw redirect({
        to: "/planos",
        search: { need: "adulto" } as any,
        reloadDocument: true,
      });
    }
  },
  head: () => ({
    meta: [
      { title: "Awã Tech Adulto — Plataforma de Conhecimento e Cultura" },
      {
        name: "description",
        content:
          "Área de estudos para adultos do Awã Tech: trilhas estruturadas, dicionário fonético, tradutor inteligente, histórias e Espaço do Professor.",
      },
      { property: "og:title", content: "Awã Tech Adulto" },
      {
        property: "og:description",
        content:
          "Aprofunde-se na língua e saberes da Aldeia Pataxó com trilhas, tradutor e acervo cultural.",
      },
    ],
  }),
  component: AdultoHome,
});

async function fetchCategoryTotals(): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from("dictionary")
    .select("category")
    .limit(5000);
  if (error) return {};
  const totals: Record<string, number> = {};
  for (const row of data ?? []) {
    const c = (row as { category: string | null }).category ?? "";
    totals[c] = (totals[c] ?? 0) + 1;
  }
  return totals;
}

function AdultoHome() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { points, level, streak } = useUserStats();
  const trails = useHomeTrails();
  const { data: mission } = useDailyMission();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"todas" | "fundamentos" | "cultura" | "vocabulario">("todas");

  // Audio playing state
  const [audioBusy, setAudioBusy] = useState(false);
  const narrate = useServerFn(narratePublic);
  const audioCacheRef = useRef<string | null>(null);

  useEffect(() => {
    setLastArea("/adulto");
  }, []);

  // Profile display name
  const { data: profile } = useQuery({
    queryKey: ["profile-name-adulto", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("name").eq("id", user!.id).maybeSingle();
      return data;
    },
  });

  const displayName =
    profile?.name ||
    (user?.user_metadata as { name?: string } | undefined)?.name ||
    (user?.email ? user.email.split("@")[0] : null) ||
    "Estudante";

  // Greeting of the Moment
  const { data: saudacoesList = [] } = useQuery({
    queryKey: ["saudacoes-adulto"],
    queryFn: fetchSaudacoes,
  });
  const saudacaoAtual = pickByHour(saudacoesList);

  // Time of day calculation
  const currentHour = new Date().getHours();
  const timePeriod =
    currentHour >= 5 && currentHour <= 11
      ? { label: "Bom dia", nativeGreeting: "Akxãy!", emoji: "🌅" }
      : currentHour >= 12 && currentHour <= 17
      ? { label: "Boa tarde", nativeGreeting: "Hayôkunã!", emoji: "☀️" }
      : { label: "Boa noite", nativeGreeting: "Ĩtxê niató!", emoji: "🌙" };

  // Random wisdom proverb of the day
  const dailyProverb = useMemo(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return FRASES_SABEDORIA[dayOfYear % FRASES_SABEDORIA.length];
  }, []);

  // Category totals for progress calculation
  const { data: categoryTotals = {} } = useQuery({
    queryKey: ["dict-category-totals-adulto"],
    queryFn: fetchCategoryTotals,
    staleTime: 5 * 60 * 1000,
  });

  // Calculate active trail and overall progress
  const trailLessons = useMemo(() => {
    return (Object.values(TRAILS) as (typeof TRAILS)[TrailSlug][]).map((tr) => {
      const total = tr.categories.reduce((s, c) => s + (categoryTotals[c] ?? 0), 0);
      const learned = Math.min(getLearned(tr.slug).size, total || Infinity);
      const pct = total > 0 ? Math.round((learned / total) * 100) : 0;
      return {
        slug: tr.slug,
        name: tr.name,
        emoji: tr.emoji,
        intro: tr.intro,
        learned,
        total,
        pct,
        done: hasCertificate(tr.slug) || (total > 0 && learned >= total),
      };
    });
  }, [categoryTotals]);

  const activeTrail =
    trailLessons.find((l) => !l.done && l.learned > 0) ??
    trailLessons.find((l) => !l.done) ??
    trailLessons[0];

  const totalWordsLearned = useMemo(() => {
    return trailLessons.reduce((sum, t) => sum + t.learned, 0);
  }, [trailLessons]);

  // Audio player for greeting
  async function handlePlayGreetingAudio(saudacao: Saudacao) {
    if (audioBusy) return;
    try {
      setAudioBusy(true);
      if (saudacao.audio_url) {
        await playFast(saudacao.audio_url);
        return;
      }
      if (!audioCacheRef.current) {
        const res = await narrate({
          data: {
            text: saudacao.term_indigenous,
            voice: "onyx",
          },
        });
        if (res.error || !res.audio_base64) {
          throw new Error(res.message ?? "Não foi possível reproduzir");
        }
        audioCacheRef.current = base64ToBlobUrl(res.audio_base64, res.mime);
      }
      await playFast(audioCacheRef.current);
    } catch (e: any) {
      toast.error(e.message ?? "Áudio indisponível no momento");
    } finally {
      setAudioBusy(false);
    }
  }

  // Filtered trails for exploration
  const filteredTrails = useMemo(() => {
    return trails.filter((t) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      const norm = t.name.toLowerCase();
      if (selectedCategory === "fundamentos") {
        return norm.includes("saud") || norm.includes("fam");
      }
      if (selectedCategory === "cultura") {
        return norm.includes("nat") || norm.includes("anim") || norm.includes("aldeia");
      }
      if (selectedCategory === "vocabulario") {
        return norm.includes("num") || norm.includes("dic") || norm.includes("verb");
      }
      return true;
    });
  }, [trails, searchQuery, selectedCategory]);

  return (
    <div className="adulto-theme min-h-screen">
      <SiteHeader mode="adulto" />

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-6 pb-20 space-y-8">
        {/* 1. Top Cultural Welcome & Daily Wisdom Banner */}
        <section className="awa-adult-card p-6 sm:p-8 bg-white border border-[#e8e4dc]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#1b4332]/10 border border-[#1b4332]/20 px-3.5 py-1 text-xs font-bold text-[#1b4332]">
                <span>{timePeriod.emoji}</span>
                <span>{timePeriod.nativeGreeting} · {timePeriod.label}</span>
              </div>

              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-[#11231b] tracking-tight">
                Awê, {displayName}!
              </h1>

              <p className="text-sm sm:text-base text-[#4b5563] leading-relaxed">
                Bem-vindo ao portal educacional adulto. Aprofunde sua formação na língua e saberes da Aldeia Pataxó.
              </p>

              {/* Sabedoria dos Anciãos */}
              <div className="pt-2">
                <div className="inline-flex items-center gap-2 rounded-xl bg-[#faf9f6] border border-[#e8e4dc] px-3.5 py-2 text-xs font-medium text-[#2d6a4f]">
                  <span className="font-bold text-[#1b4332]">Sabedoria:</span>
                  <span className="italic">{dailyProverb}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 shrink-0">
              <div className="rounded-2xl border border-[#e8e4dc] bg-[#faf9f6] p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-xs font-bold text-[#b47e28]">
                  <Flame className="h-4 w-4 fill-[#b47e28]" />
                  <span>Sequência</span>
                </div>
                <div className="font-display text-xl font-black text-[#11231b] mt-0.5">{streak} dias</div>
              </div>

              <div className="rounded-2xl border border-[#e8e4dc] bg-[#faf9f6] p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-xs font-bold text-[#2d6a4f]">
                  <Star className="h-4 w-4 fill-[#2d6a4f]" />
                  <span>Pontos</span>
                </div>
                <div className="font-display text-xl font-black text-[#11231b] mt-0.5">{points} XP</div>
              </div>

              <div className="rounded-2xl border border-[#e8e4dc] bg-[#faf9f6] p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-xs font-bold text-[#b47e28]">
                  <Award className="h-4 w-4" />
                  <span>Nível</span>
                </div>
                <div className="font-display text-xl font-black text-[#11231b] mt-0.5">Nível {level}</div>
              </div>

              <div className="rounded-2xl border border-[#e8e4dc] bg-[#faf9f6] p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-xs font-bold text-[#2d6a4f]">
                  <BookOpen className="h-4 w-4" />
                  <span>Palavras</span>
                </div>
                <div className="font-display text-xl font-black text-[#11231b] mt-0.5">{totalWordsLearned}</div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Destaque: Continuar Aprendendo + Saudação do Momento com Áudio */}
        <section className="grid lg:grid-cols-12 gap-6">
          {/* Active Trail Card (7 cols) */}
          <div className="lg:col-span-7 awa-adult-card p-6 sm:p-7 bg-white border border-[#e8e4dc] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1b4332]/10 border border-[#1b4332]/25 px-3 py-1 text-xs font-bold text-[#1b4332]">
                  <Compass className="h-3.5 w-3.5" /> Trilha em Andamento
                </span>
                <span className="text-sm font-black text-[#2d6a4f]">
                  {activeTrail?.pct ?? 0}% Concluído
                </span>
              </div>

              <h2 className="font-display text-2xl font-black text-[#11231b] flex items-center gap-2">
                <span>{activeTrail?.emoji}</span>
                <span>{activeTrail?.name}</span>
              </h2>

              <p className="mt-2 text-sm text-[#4b5563] leading-relaxed">
                {activeTrail?.intro || "Explore o vocabulário, termos ancestrais e pratique com exercícios interativos."}
              </p>

              {/* Progress bar */}
              <div className="mt-5 space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-[#6b7280]">
                  <span>Progresso da Trilha</span>
                  <span>{activeTrail?.learned} de {activeTrail?.total || "?"} palavras dominadas</span>
                </div>
                <div className="h-2.5 w-full bg-[#f4f2ec] rounded-full overflow-hidden border border-[#e8e4dc]">
                  <div
                    className="h-full bg-gradient-to-r from-[#2d6a4f] to-[#1b4332] rounded-full transition-all duration-500"
                    style={{ width: `${activeTrail?.pct ?? 0}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-[#e8e4dc] flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-[#6b7280]">
                {activeTrail?.done ? "Trilha finalizada! Você pode revisitar as lições." : "Retome seus estudos diários de onde parou."}
              </span>
              <Link
                to="/trilhas/$slug"
                params={{ slug: activeTrail?.slug ?? "saudacoes" }}
                search={{ area: "adulto" }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1b4332] px-5 py-2.5 min-h-[44px] text-xs font-bold text-white transition hover:bg-[#2d6a4f] shadow-sm hover:shadow-md"
              >
                <span>Continuar Trilha</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Greeting of the Moment Card (5 cols) */}
          <div className="lg:col-span-5 awa-adult-card p-6 sm:p-7 bg-[#faf9f6] border border-[#e8e4dc] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#b47e28]/15 border border-[#b47e28]/30 px-3 py-1 text-xs font-bold text-[#8a6508]">
                  <span>🗣️</span> Expressão do Momento
                </span>
                <Link
                  to="/saudacoes"
                  className="text-xs font-semibold text-[#1b4332] hover:underline"
                >
                  Ver todas →
                </Link>
              </div>

              {saudacaoAtual ? (
                <div className="mt-3 space-y-2">
                  <div className="font-display text-2xl sm:text-3xl font-black text-[#1b4332] tracking-tight">
                    {saudacaoAtual.term_indigenous}
                  </div>
                  <div className="text-base font-bold text-[#1f2937]">
                    {saudacaoAtual.term_pt}
                  </div>
                  {saudacaoAtual.pronunciation && (
                    <div className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-[#e8e4dc] px-2.5 py-1 text-xs font-medium text-[#6b7280]">
                      <span className="text-[#b47e28] font-bold">Pronúncia:</span>
                      <span>{saudacaoAtual.pronunciation}</span>
                    </div>
                  )}
                  {saudacaoAtual.example && (
                    <p className="mt-2 text-xs italic text-[#4b5563] line-clamp-2">
                      "{saudacaoAtual.example}"
                    </p>
                  )}
                </div>
              ) : (
                <div className="py-4 text-sm text-[#6b7280]">
                  Carregando saudações da Aldeia...
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-[#e8e4dc] flex items-center justify-between gap-3">
              <span className="text-xs text-[#6b7280]">
                Ouça e pratique a pronúncia nativa
              </span>
              {saudacaoAtual && (
                <button
                  type="button"
                  disabled={audioBusy}
                  onClick={() => handlePlayGreetingAudio(saudacaoAtual)}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#e2ded5] bg-white px-4 py-2.5 min-h-[44px] text-xs font-bold text-[#1b4332] transition hover:border-[#1b4332] hover:bg-[#1b4332]/5 shadow-xs disabled:opacity-50"
                  aria-label={`Ouvir pronúncia de ${saudacaoAtual.term_indigenous}`}
                >
                  {audioBusy ? (
                    <Loader2 className="h-4 w-4 animate-spin text-[#1b4332]" />
                  ) : (
                    <Volume2 className="h-4 w-4 text-[#1b4332]" />
                  )}
                  <span>Ouvir Áudio</span>
                </button>
              )}
            </div>
          </div>
        </section>

        {/* 3. Central de Ferramentas Educacionais (6 Ferramentas) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl font-black text-[#11231b]">
                Ferramentas de Aprendizado
              </h2>
              <p className="text-xs sm:text-sm text-[#4b5563]">
                Acesso rápido aos módulos linguísticos, práticos e pedagógicos da plataforma.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-4">
            {/* Dicionário */}
            <Link
              to="/dicionario"
              className="awa-adult-card p-5 bg-white border border-[#e8e4dc] flex flex-col justify-between group"
            >
              <div>
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#1b4332]/10 text-[#1b4332] group-hover:bg-[#1b4332] group-hover:text-white transition">
                  <Library className="h-5 w-5" />
                </div>
                <h3 className="font-display text-base sm:text-lg font-bold text-[#11231b] mt-3 group-hover:text-[#1b4332] transition">
                  Dicionário Patxôhã
                </h3>
                <p className="text-xs text-[#6b7280] mt-1 line-clamp-2">
                  Mais de 5.000 verbetes com busca instantânea, fonética e áudios nativos.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-bold text-[#1b4332]">
                <span>Consultar</span>
                <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            {/* Tradutor */}
            <Link
              to="/traduzir"
              className="awa-adult-card p-5 bg-white border border-[#e8e4dc] flex flex-col justify-between group"
            >
              <div>
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#b47e28]/15 text-[#8a6508] group-hover:bg-[#b47e28] group-hover:text-white transition">
                  <Languages className="h-5 w-5" />
                </div>
                <h3 className="font-display text-base sm:text-lg font-bold text-[#11231b] mt-3 group-hover:text-[#8a6508] transition">
                  Tradutor Inteligente
                </h3>
                <p className="text-xs text-[#6b7280] mt-1 line-clamp-2">
                  Tradução bidirecional Português ⇄ Patxôhã com suporte contextual.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-bold text-[#8a6508]">
                <span>Traduzir</span>
                <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            {/* Professor Awã */}
            <Link
              to="/professor"
              className="awa-adult-card p-5 bg-white border border-[#e8e4dc] flex flex-col justify-between group"
            >
              <div>
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#2d6a4f]/15 text-[#2d6a4f] group-hover:bg-[#2d6a4f] group-hover:text-white transition">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <h3 className="font-display text-base sm:text-lg font-bold text-[#11231b] mt-3 group-hover:text-[#2d6a4f] transition">
                  Espaço do Professor
                </h3>
                <p className="text-xs text-[#6b7280] mt-1 line-clamp-2">
                  Tutor interativo com inteligência pedagógica para dúvidas e conversas.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-bold text-[#2d6a4f]">
                <span>Conhecer</span>
                <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            {/* Histórias Ancestrais */}
            <Link
              to="/historias"
              className="awa-adult-card p-5 bg-white border border-[#e8e4dc] flex flex-col justify-between group"
            >
              <div>
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#b47e28]/15 text-[#8a6508] group-hover:bg-[#b47e28] group-hover:text-white transition">
                  <ScrollText className="h-5 w-5" />
                </div>
                <h3 className="font-display text-base sm:text-lg font-bold text-[#11231b] mt-3 group-hover:text-[#8a6508] transition">
                  Histórias Ancestrais
                </h3>
                <p className="text-xs text-[#6b7280] mt-1 line-clamp-2">
                  Tradições orais e memórias preservadas da vivência e sabedoria Pataxó.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-bold text-[#8a6508]">
                <span>Ler Histórias</span>
                <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            {/* Cânticos & Músicas */}
            <Link
              to="/musicas"
              className="awa-adult-card p-5 bg-white border border-[#e8e4dc] flex flex-col justify-between group"
            >
              <div>
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#1b4332]/10 text-[#1b4332] group-hover:bg-[#1b4332] group-hover:text-white transition">
                  <Play className="h-5 w-5" />
                </div>
                <h3 className="font-display text-base sm:text-lg font-bold text-[#11231b] mt-3 group-hover:text-[#1b4332] transition">
                  Músicas & Cânticos
                </h3>
                <p className="text-xs text-[#6b7280] mt-1 line-clamp-2">
                  Gravações originais dos rituais, celebrações e cantigas da aldeia.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-bold text-[#1b4332]">
                <span>Ouvir</span>
                <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            {/* Aldeia Velha */}
            <Link
              to="/aldeia-velha"
              className="awa-adult-card p-5 bg-white border border-[#e8e4dc] flex flex-col justify-between group"
            >
              <div>
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#2d6a4f]/15 text-[#2d6a4f] group-hover:bg-[#2d6a4f] group-hover:text-white transition">
                  <TreePine className="h-5 w-5" />
                </div>
                <h3 className="font-display text-base sm:text-lg font-bold text-[#11231b] mt-3 group-hover:text-[#2d6a4f] transition">
                  Aldeia Velha
                </h3>
                <p className="text-xs text-[#6b7280] mt-1 line-clamp-2">
                  Conheça o território sagrado, a história e o intercâmbio comunitário.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-bold text-[#2d6a4f]">
                <span>Explorar</span>
                <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          </div>
        </section>

        {/* 4. Grade de Trilhas Estruturadas (Com Busca & Abas) */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-black text-[#11231b]">
                Trilhas de Estudo
              </h2>
              <p className="text-xs sm:text-sm text-[#4b5563]">
                Jornadas temáticas com vocabulário sequencial, pronúncia e certificação.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b7280]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar trilha..."
                className="w-full pl-9 pr-4 py-2 min-h-[44px] rounded-xl border border-[#e8e4dc] bg-white text-xs font-medium text-[#1f2937] placeholder:text-[#9ca3af] focus:outline-none focus:border-[#1b4332] shadow-xs"
              />
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: "todas", label: "Todas as Trilhas" },
              { id: "fundamentos", label: "🤝 Fundamentos & Início" },
              { id: "cultura", label: "🌿 Cultura & Natureza" },
              { id: "vocabulario", label: "🔢 Vocabulário & Expressões" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id as any)}
                className={`rounded-xl px-4 py-2 min-h-[44px] text-xs font-bold transition whitespace-nowrap ${
                  selectedCategory === tab.id
                    ? "bg-[#1b4332] text-white shadow-xs"
                    : "border border-[#e8e4dc] bg-white text-[#4b5563] hover:border-[#1b4332]/40 hover:text-[#11231b]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Trails Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredTrails.map((trail) => {
              const norm = (trail.name ?? "").trim().toLowerCase();
              const slug = trailSlugMap[trail.name];
              const isNumbers = norm === "números" || norm === "numeros";

              return (
                <div
                  key={trail.name}
                  className="awa-adult-card bg-white border border-[#e8e4dc] overflow-hidden flex flex-col justify-between group"
                >
                  <div className="relative aspect-video sm:aspect-4/3 overflow-hidden bg-[#faf9f6]">
                    <img
                      src={trail.img || trailSaudacoes}
                      alt={trail.name}
                      width={480}
                      height={320}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="inline-flex items-center rounded-md bg-white/90 backdrop-blur-sm border border-[#e8e4dc] px-2 py-0.5 text-[10px] font-bold text-[#1b4332] shadow-xs">
                        {isNumbers ? "Vocabulário" : "Trilha de Estudo"}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-display text-base font-bold text-[#11231b] group-hover:text-[#1b4332] transition">
                        {trail.name}
                      </h3>
                      <div className="mt-2.5 flex items-center justify-between text-xs text-[#6b7280]">
                        <span>Progresso</span>
                        <span className="font-bold text-[#1b4332]">{trail.progress}%</span>
                      </div>
                      <div className="mt-1 h-1.5 w-full bg-[#f4f2ec] rounded-full overflow-hidden border border-[#e8e4dc]">
                        <div
                          className="h-full bg-[#2d6a4f] rounded-full"
                          style={{ width: `${trail.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#f4f2ec]">
                      {isNumbers ? (
                        <Link
                          to="/aprender-numeros"
                          search={{ area: "adulto" }}
                          className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#e2ded5] bg-[#faf9f6] py-2 text-xs font-bold text-[#1b4332] hover:bg-[#1b4332] hover:text-white transition"
                        >
                          <span>Acessar Lição</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      ) : slug ? (
                        <Link
                          to="/trilhas/$slug"
                          params={{ slug }}
                          search={{ area: "adulto" }}
                          className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#e2ded5] bg-[#faf9f6] py-2 text-xs font-bold text-[#1b4332] hover:bg-[#1b4332] hover:text-white transition"
                        >
                          <span>Acessar Trilha</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      ) : (
                        <Link
                          to="/trilhas/$slug"
                          params={{ slug: "saudacoes" }}
                          search={{ area: "adulto" }}
                          className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#e2ded5] bg-[#faf9f6] py-2 text-xs font-bold text-[#1b4332] hover:bg-[#1b4332] hover:text-white transition"
                        >
                          <span>Acessar Trilha</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 5. Desafio Diário & Ranking de Aprendizes */}
        <section id="desafios" className="grid gap-6 md:grid-cols-2">
          <ErrorBoundary area="adulto-missao">
            <DailyMissionCard mission={mission} mode="adulto" />
          </ErrorBoundary>
          <ErrorBoundary area="adulto-ranking">
            <RankingCard mode="adulto" />
          </ErrorBoundary>
        </section>

        {/* 6. Instalação do Aplicativo (PWA) */}
        <ErrorBoundary area="adulto-install" fallback={() => null}>
          <InstallCTA mode="adulto" />
        </ErrorBoundary>
      </main>

      <SiteFooter mode="adulto" />
    </div>
  );
}

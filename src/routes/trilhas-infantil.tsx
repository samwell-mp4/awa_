import { createFileRoute, Link } from "@tanstack/react-router";
import { requireArea } from "@/lib/area-guard";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getTrailsTotemsConfig } from "@/lib/infantil-content.functions";
import { useMemo, useState } from "react";
import {
  ChevronRight,
  Clock,
  BookOpen,
  Search,
  X,
  Compass,
  Sparkles,
  CheckCircle2,
  GraduationCap,
} from "lucide-react";

import { SiteFooter } from "@/components/home/site-footer";
import { SiteHeader } from "@/components/home/site-header";
import { trailSlugMap } from "@/lib/home-content";
import { useHomeTrails } from "@/hooks/use-home-data";
import { TrailNarrator } from "@/components/kids/trail-narrator";
import kidsBg from "@/assets/kids-menu-bg.jpg";
import { PageHeader } from "@/components/education/page-header";
import { ProgressBar } from "@/components/education/progress-bar";
import { LearningStatusBadge, type LearningStatus } from "@/components/education/learning-status-badge";
import { EmptyState } from "@/components/education/empty-state";
import { getLearned, TRAILS, type TrailSlug } from "@/lib/trilhas";
import trailSaudacoes from "@/assets/trail-saudacoes.jpg";
import trailFamilia from "@/assets/trail-familia.jpg";
import trailNatureza from "@/assets/trail-natureza.jpg";
import trailAnimais from "@/assets/trail-animais.jpg";
import trailCultura from "@/assets/trail-cultura.jpg";

export const Route = createFileRoute("/trilhas-infantil")({
  ssr: false,
  beforeLoad: () => requireArea("infantil"),
  head: () => ({
    meta: [
      { title: "Trilhas da Aldeia — Awã Tech Infantil" },
      {
        name: "description",
        content:
          "Trilhas de Aprendizado: percursos sequenciais para aprender a língua Patxôhã, natureza e tradições indígenas.",
      },
    ],
  }),
  component: TrilhaInfantilPage,
});

const TRAIL_META: Record<string, { img: string; time: string; totalEst: number; category: string }> = {
  saudacoes: { img: trailSaudacoes, time: "15 min", totalEst: 12, category: "Língua & Comunicação" },
  familia: { img: trailFamilia, time: "20 min", totalEst: 14, category: "Cultura & Pessoas" },
  natureza: { img: trailNatureza, time: "25 min", totalEst: 16, category: "Mata & Meio Ambiente" },
  animais: { img: trailAnimais, time: "20 min", totalEst: 15, category: "Fauna da Aldeia" },
  cultura: { img: trailCultura, time: "30 min", totalEst: 18, category: "Memória Ancestral" },
};

type FilterStatus = "todas" | "em_andamento" | "nao_iniciado" | "concluido";

function TrilhaInfantilPage() {
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterStatus>("todas");

  // Compute learned items and statuses per trail
  const allTrails = useMemo(() => {
    const list: TrailSlug[] = ["saudacoes", "familia", "natureza", "animais", "cultura"];
    return list.map((slug) => {
      const trail = TRAILS[slug];
      const meta = TRAIL_META[slug] || {
        img: trailSaudacoes,
        time: "15 min",
        totalEst: 12,
        category: "Língua & Cultura",
      };
      const learned = getLearned(slug);
      const learnedCount = learned.size;
      const totalCount = meta.totalEst;
      const percent = Math.min(100, Math.round((learnedCount / totalCount) * 100));

      let status: LearningStatus = "nao_iniciado";
      if (percent === 100) status = "concluido";
      else if (learnedCount > 0) status = "em_andamento";

      return {
        slug,
        name: trail?.name ?? (slug.charAt(0).toUpperCase() + slug.slice(1)),
        intro: trail?.intro ?? "Aprenda palavras e expressões da aldeia.",
        img: meta.img,
        time: meta.time,
        category: meta.category,
        learnedCount,
        totalCount,
        percent,
        status,
      };
    });
  }, []);

  const totalLearned = allTrails.reduce((acc, t) => acc + t.learnedCount, 0);
  const totalActivities = allTrails.reduce((acc, t) => acc + t.totalCount, 0);
  const completedTrailsCount = allTrails.filter((t) => t.status === "concluido").length;
  const inProgressTrailsCount = allTrails.filter((t) => t.status === "em_andamento").length;

  const filteredTrails = useMemo(() => {
    return allTrails.filter((trail) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = trail.name.toLowerCase().includes(q);
        const matchesIntro = trail.intro.toLowerCase().includes(q);
        const matchesCat = trail.category.toLowerCase().includes(q);
        if (!matchesName && !matchesIntro && !matchesCat) return false;
      }

      if (activeFilter === "todas") return true;
      if (activeFilter === "em_andamento") return trail.status === "em_andamento";
      if (activeFilter === "nao_iniciado") return trail.status === "nao_iniciado";
      if (activeFilter === "concluido") return trail.status === "concluido";
      return true;
    });
  }, [allTrails, searchQuery, activeFilter]);

  return (
    <div
      key={i18n.language}
      className="kids-theme relative min-h-screen text-[#fefae0] font-sans"
      style={{
        backgroundImage: `url(${kidsBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundAttachment: "fixed",
      }}
    >
      {/* High-contrast atmospheric scrim layer */}
      <div aria-hidden className="awa-bg-scrim pointer-events-none fixed inset-0" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <SiteHeader mode="infantil" />

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-24 pt-4 sm:px-6">
          <PageHeader
            breadcrumbs={[
              { label: "Início", href: "/infantil" },
              { label: "Trilhas de Aprendizado" },
            ]}
            title="Trilhas da Aldeia"
            description="Escolha uma trilha e percorra cada etapa para conhecer a língua, os saberes e as histórias dos povos indígenas."
            badge={`${totalLearned} de ${totalActivities} lições concluídas`}
          />

          {/* Educational Quick Stats Bar */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="awa-card-3 p-3 flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-[#2a170a] border border-[#633916] grid place-items-center text-[#ffd166]">
                <Compass className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-[#d4a373]">Total de Trilhas</div>
                <div className="text-base font-bold text-[#fefae0]">{allTrails.length} percursos</div>
              </div>
            </div>

            <div className="awa-card-3 p-3 flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-[#2a170a] border border-[#633916] grid place-items-center text-[#2a9d8f]">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-[#d4a373]">Em Andamento</div>
                <div className="text-base font-bold text-[#2a9d8f]">{inProgressTrailsCount} trilhas</div>
              </div>
            </div>

            <div className="awa-card-3 p-3 flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-[#2a170a] border border-[#633916] grid place-items-center text-[#22c55e]">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-[#d4a373]">Concluídas</div>
                <div className="text-base font-bold text-[#22c55e]">{completedTrailsCount} trilhas</div>
              </div>
            </div>

            <div className="awa-card-3 p-3 flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-[#2a170a] border border-[#633916] grid place-items-center text-[#ffd166]">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-[#d4a373]">Lições Aprendidas</div>
                <div className="text-base font-bold text-[#ffd166]">{totalLearned} / {totalActivities}</div>
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d4a373]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar trilha ou tema..."
                className="w-full rounded-xl border border-[#633916] bg-[#1a0e05]/95 pl-10 pr-9 py-2.5 text-xs text-[#fefae0] placeholder-[#d4a373]/60 focus:border-[#ffd166] focus:outline-none focus:ring-1 focus:ring-[#ffd166]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#d4a373] hover:text-[#fefae0]"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: "todas", label: `Todas (${allTrails.length})` },
                { id: "em_andamento", label: `Em Andamento (${inProgressTrailsCount})` },
                { id: "nao_iniciado", label: "Não Iniciadas" },
                { id: "concluido", label: `Concluídas (${completedTrailsCount})` },
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setActiveFilter(btn.id as FilterStatus)}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition shadow ${
                    activeFilter === btn.id
                      ? "bg-[#ffd166] text-[#1a0e04] shadow-md"
                      : "awa-card-3 text-[#fefae0]/80 hover:text-[#ffd166] hover:border-[#ffd166]/40"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Educational Trail Cards List */}
          <div className="mt-6 flex flex-col gap-4">
            {filteredTrails.length === 0 ? (
              <EmptyState
                title="Nenhuma trilha encontrada"
                description={
                  searchQuery
                    ? `Nenhum resultado para "${searchQuery}". Tente outro termo de busca.`
                    : "Não há trilhas com o filtro selecionado."
                }
                actionLabel="Limpar filtros"
                onAction={() => {
                  setSearchQuery("");
                  setActiveFilter("todas");
                }}
              />
            ) : (
              filteredTrails.map((trail, index) => {
                const isRecommended =
                  trail.status === "em_andamento" ||
                  (trail.status === "nao_iniciado" && index === 0);

                return (
                  <div
                    key={trail.slug}
                    className={`rounded-2xl p-4 sm:p-5 transition shadow-lg border ${
                      isRecommended
                        ? "awa-card-1 border-[#ffd166]/60"
                        : "awa-card-2 border-[#633916]/60"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      {/* Trail image / thumbnail */}
                      <div className="relative h-32 w-full sm:h-28 sm:w-44 shrink-0 overflow-hidden rounded-xl bg-black/40 border border-[#633916]/80">
                        <img
                          src={trail.img}
                          alt={trail.name}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute top-2 left-2 rounded-md bg-[#180e07]/90 px-2 py-0.5 text-[10px] font-bold text-[#ffd166] border border-[#633916]">
                          Trilha #{index + 1}
                        </div>
                      </div>

                      {/* Trail content info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <LearningStatusBadge status={trail.status} />
                          <span className="text-[11px] font-semibold text-[#2a9d8f]">
                            {trail.category}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-[#d4a373]">
                            <Clock className="h-3 w-3" /> {trail.time}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-[#d4a373]">
                            <BookOpen className="h-3 w-3" /> {trail.totalCount} atividades
                          </span>
                        </div>

                        <h2 className="text-lg sm:text-xl font-black text-[#fefae0] tracking-tight">
                          {trail.name}
                        </h2>
                        <p className="mt-1 text-xs text-[#fefae0]/85 leading-relaxed max-w-xl">
                          {trail.intro}
                        </p>

                        <div className="mt-3.5 max-w-md">
                          <ProgressBar
                            current={trail.learnedCount}
                            total={trail.totalCount}
                            size="sm"
                            showPercent
                          />
                        </div>
                      </div>

                      {/* Primary Trail CTA */}
                      <div className="shrink-0 w-full sm:w-auto pt-2 sm:pt-0">
                        <Link
                          to="/trilhas/$slug"
                          params={{ slug: trail.slug }}
                          search={{ area: "infantil" }}
                          className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-black transition active:scale-95 shadow ${
                            isRecommended
                              ? "bg-gradient-to-r from-[#ffd166] to-[#f59e0b] text-[#1a0e04] hover:brightness-110 shadow-lg"
                              : "bg-[#2b170c] border border-[#633916] text-[#ffd166] hover:bg-[#3d1f0e] hover:border-[#ffd166]/60"
                          }`}
                        >
                          <span>{trail.status === "concluido" ? "Revisar Trilha" : trail.status === "em_andamento" ? "Continuar Trilha" : "Começar Trilha"}</span>
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Trail Narrator integration */}
          <div className="mt-8">
            <TrailNarrator />
          </div>
        </main>

        <SiteFooter mode="infantil" />
      </div>
    </div>
  );
}

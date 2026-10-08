import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getPaddleEnvironment } from "@/lib/paddle";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft, Volume2, Loader2, Check, Award, X, Sparkles, RotateCw, Shuffle, ArrowRight,
  BookOpen, ChevronLeft, ChevronRight, Search,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { speakText } from "@/lib/tts.functions";
import { base64ToBlobUrl, playFast } from "@/lib/audio-play";
import { TRAILS, type TrailSlug, getLearned, setLearned, markCertificate, hasCertificate } from "@/lib/trilhas";
import { toast } from "sonner";
import { PremiumGate } from "@/components/PremiumGate";
import { pickLang, useLang } from "@/lib/pick-lang";
import { useAutoTranslate } from "@/hooks/use-auto-translate";
import { SiteHeader } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { PageHeader } from "@/components/education/page-header";
import { ProgressBar } from "@/components/education/progress-bar";
import { LessonNavigation } from "@/components/education/lesson-navigation";
import { EmptyState } from "@/components/education/empty-state";
import { Pagination } from "@/components/education/pagination";
import { useLastArea } from "@/lib/last-area";
import kidsBg from "@/assets/kids-menu-bg.jpg";

function useTr(texts: string[]) {
  const translated = useAutoTranslate(texts);
  return useMemo(() => {
    const m = new Map<string, string>();
    texts.forEach((t, i) => { if (t) m.set(t, translated[i] ?? t); });
    return (s: string) => (s ? m.get(s) ?? s : s);
  }, [texts.join("\u0001"), translated.join("\u0001")]);
}

function useLocalize(tr: (s: string) => string) {
  const lang = useLang();
  return function localize<T extends Record<string, any>>(row: T, field: keyof T & string): string {
    const original = (row?.[field] as string) ?? "";
    if (!original) return "";
    if (lang === "pt" || lang === "pat") return original;
    const picked = pickLang(row, field, lang);
    if (picked && picked !== original) return picked;
    return tr(original);
  };
}

const TRAIL_ORDER: TrailSlug[] = ["saudacoes", "familia", "natureza", "animais"];
function nextTrailSlug(current: TrailSlug): TrailSlug {
  const i = TRAIL_ORDER.indexOf(current);
  return TRAIL_ORDER[(i + 1) % TRAIL_ORDER.length];
}


export const Route = createFileRoute("/trilhas/$slug")({
  ssr: false,
  beforeLoad: ({ params }) => {
    if (!(params.slug in TRAILS)) throw notFound();
  },
  validateSearch: (search: Record<string, unknown>): { area?: "adulto" | "infantil" } => ({
    area: search.area === "infantil" ? "infantil" : search.area === "adulto" ? "adulto" : undefined,
  }),
  head: ({ params }) => {
    const t = TRAILS[params.slug as TrailSlug];
    return {
      meta: [
        { title: `Trilha ${t?.name ?? ""} — AWÃ TECH` },
        { name: "description", content: t?.intro ?? "" },
      ],
    };
  },
  errorComponent: ({ error }) => <div className="p-8 text-cream">{error.message}</div>,
  notFoundComponent: () => <div className="p-8 text-cream">Trilha não encontrada.</div>,
  component: () => (
    <PremiumGate title="Trilhas de aprendizado (Premium)" description="Exercícios, jogos e progresso das trilhas são exclusivos para assinantes. Comece grátis pelas 25 saudações essenciais.">
      <TrilhaPage />
    </PremiumGate>
  ),
});

type Word = {
  id: string;
  term_indigenous: string;
  term_pt: string;
  pronunciation: string | null;
  example: string | null;
  audio_url: string | null;
  category: string;
  term_pt_en?: string | null;
  term_pt_es?: string | null;
  example_en?: string | null;
  example_es?: string | null;
};


function TrilhaPage() {
  const backTo = useLastArea();
  const { area } = Route.useSearch();
  const { slug } = Route.useParams();

  const trail = TRAILS[slug as TrailSlug];
  const navigate = useNavigate();
  const nextSlug = nextTrailSlug(slug as TrailSlug);
  const nextTrail = TRAILS[nextSlug];

  const { data: words = [], isLoading } = useQuery({
    queryKey: ["trilha-words", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dictionary")
        .select("id,term_indigenous,term_pt,pronunciation,example,audio_url,category,term_pt_en,term_pt_es,example_en,example_es")
        .in("category", trail.categories)
        .order("term_pt");
      if (error) throw error;
      return (data ?? []) as Word[];
    },
  });

  const [learned, setLearnedState] = useState<Set<string>>(new Set());
  const [showCert, setShowCert] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showMatch, setShowMatch] = useState(false);
  const [showFlashcards, setShowFlashcards] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"todas" | "pendentes" | "aprendidas">("todas");
  const [currentPage, setCurrentPage] = useState(1);
  const WORDS_PER_PAGE = 8;

  useEffect(() => { setLearnedState(getLearned(slug)); }, [slug]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterMode, slug]);

  function logLearningEvent(action: string) {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      supabase
        .from("learning_events")
        .insert({ user_id: data.user.id, trail: slug, action, points: 1 })
        .then(() => {});
    });
  }

  function markLearned(id: string) {
    setLearnedState((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev); next.add(id);
      setLearned(slug, next);
      logLearningEvent("learn_word");
      if (words.length && next.size >= words.length && !hasCertificate(slug)) {
        markCertificate(slug);
        logLearningEvent("certificate");
        setTimeout(() => setShowCert(true), 300);
      }
      return next;
    });
  }

  const progress = words.length ? Math.round((learned.size / words.length) * 100) : 0;

  function toggleLearned(id: string) {
    setLearnedState((prev) => {
      const next = new Set(prev);
      const wasAdding = !next.has(id);
      wasAdding ? next.add(id) : next.delete(id);
      setLearned(slug, next);
      if (wasAdding) logLearningEvent("learn_word");
      if (words.length && next.size >= words.length && !hasCertificate(slug)) {
        markCertificate(slug);
        logLearningEvent("certificate");
        setTimeout(() => setShowCert(true), 300);
      }
      return next;
    });
  }

  function resetProgress() {
    setLearnedState(new Set());
    setLearned(slug, new Set());
    toast.success("Novas lições prontas! Bons estudos 🌱");
  }

  const filteredWords = useMemo(() => {
    return words.filter((w) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesInd = (w.term_indigenous || "").toLowerCase().includes(q);
        const matchesPt = (w.term_pt || "").toLowerCase().includes(q);
        const matchesPron = (w.pronunciation || "").toLowerCase().includes(q);
        if (!matchesInd && !matchesPt && !matchesPron) return false;
      }
      const isLearned = learned.has(w.id);
      if (filterMode === "pendentes" && isLearned) return false;
      if (filterMode === "aprendidas" && !isLearned) return false;
      return true;
    });
  }, [words, searchQuery, filterMode, learned]);

  const totalPages = Math.max(1, Math.ceil(filteredWords.length / WORDS_PER_PAGE));
  const paginatedWords = useMemo(() => {
    const start = (currentPage - 1) * WORDS_PER_PAGE;
    return filteredWords.slice(start, start + WORDS_PER_PAGE);
  }, [filteredWords, currentPage]);

  const grouped = useMemo(() => {
    if (trail.groups) {
      return trail.groups
        .map((g) => ({ label: g.label, items: words.filter((w) => g.categories.includes(w.category)) }))
        .filter((g) => g.items.length > 0);
    }
    return [{ label: trail.emoji + " " + trail.name, items: words }];
  }, [words, trail]);

  const tr = useTr([
    "Início", "Reiniciar", "palavras", "Praticar quiz",
    "Associar imagem ↔ palavra", "Ver certificado", "Carregando...",
    trail.intro, trail.apoio, trail.name,
    ...words.flatMap((w) => [w.term_pt, w.example].filter(Boolean) as string[]),
  ]);
  const localize = useLocalize(tr);

  const isKids = area === "infantil" || (!area && typeof backTo === "string" && backTo.includes("infantil"));

  return (
    <div
      className={`min-h-screen relative text-foreground ${isKids ? "kids-theme bg-cover bg-center bg-no-repeat bg-fixed" : ""}`}
      style={isKids ? { backgroundImage: `url(${kidsBg})` } : undefined}
    >
      {isKids && (
        <div
          aria-hidden
          className="awa-bg-scrim pointer-events-none fixed inset-0"
        />
      )}

      <div className="relative z-10 flex min-h-screen flex-col justify-between">
        <div>
          {isKids ? <SiteHeader mode="infantil" /> : (
            <>
              <SiteHeader mode="adulto" />
              <header className="sticky top-0 z-30 border-b border-[#e8e4dc] bg-white/95 backdrop-blur-xl shadow-xs">
                <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 md:px-8">
                  <Link to="/trilhas" className="inline-flex items-center gap-2 text-xs font-bold text-[#1b4332] hover:text-[#2d6a4f]">
                    <ArrowLeft className="h-4 w-4" /> {tr("Trilhas")}
                  </Link>
                  <div className="flex items-center gap-2 font-display text-sm md:text-base font-black text-[#11231b]">
                    {trail.emoji} {tr(trail.name)}
                  </div>
                  <button onClick={resetProgress} title={tr("Reiniciar")} className="text-[#6b7280] hover:text-[#1b4332] transition">
                    <RotateCw className="h-4 w-4" />
                  </button>
                </div>
              </header>
            </>
          )}

          <main className="mx-auto max-w-5xl px-4 py-6 md:px-8">
            {isKids ? (
              <div className="space-y-4">
                <PageHeader
                  breadcrumbs={[
                    { label: "Início", href: "/infantil" },
                    { label: "Trilhas", href: "/trilhas-infantil" },
                    { label: tr(trail.name) },
                  ]}
                  title={tr(trail.name)}
                  description={tr(trail.intro || "Aprenda palavras e expressões da aldeia.")}
                  badge={`${learned.size} de ${words.length} palavras aprendidas`}
                  primaryAction={{
                    label: learned.size >= words.length ? "Revisar Trilha" : "Continuar Atividade",
                    onClick: () => setShowQuiz(true),
                  }}
                />

                {/* Educational Action Bar with Progress */}
                <div className="awa-card-1 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
                  <div className="w-full md:max-w-md">
                    <ProgressBar current={learned.size} total={words.length || 1} showPercent />
                  </div>

                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                    <button
                      onClick={() => setShowFlashcards(true)}
                      disabled={words.length === 0}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#ffd166] to-[#f59e0b] px-3.5 py-2 text-xs font-black text-[#1a0e04] hover:brightness-110 disabled:opacity-50 transition shadow active:scale-95"
                    >
                      <BookOpen className="h-4 w-4" />
                      <span>Modo Estudo</span>
                    </button>
                    <button
                      onClick={() => setShowQuiz(true)}
                      disabled={words.length < 4}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#2a9d8f] px-3.5 py-2 text-xs font-bold text-white hover:brightness-110 disabled:opacity-50 transition shadow"
                    >
                      <Sparkles className="h-4 w-4" /> {tr("Quiz")}
                    </button>
                    <button
                      onClick={() => setShowMatch(true)}
                      disabled={words.length < 4}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[#633916] bg-[#251408] px-3.5 py-2 text-xs font-bold text-[#ffd166] hover:border-[#ffd166]/60 disabled:opacity-50 transition"
                    >
                      <Shuffle className="h-4 w-4" /> {tr("Combinar")}
                    </button>
                    {hasCertificate(slug) && (
                      <button
                        onClick={() => setShowCert(true)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-[#ffd166]/50 bg-[#331c0e] px-3.5 py-2 text-xs font-bold text-[#ffd166] hover:bg-[#432512] transition shadow"
                      >
                        <Award className="h-4 w-4" /> {tr("Medalha")}
                      </button>
                    )}
                    <button
                      onClick={resetProgress}
                      title="Reiniciar progresso desta trilha"
                      className="p-2 rounded-xl border border-[#633916] bg-[#251408] text-[#d4a373] hover:text-[#ffd166] transition"
                    >
                      <RotateCw className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Search Bar & Filters */}
                <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d4a373]" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar palavra ou tradução..."
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

                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: "todas", label: `Todas (${words.length})` },
                      { id: "pendentes", label: `Pendentes (${Math.max(0, words.length - learned.size)})` },
                      { id: "aprendidas", label: `Aprendidas (${learned.size})` },
                    ].map((btn) => (
                      <button
                        key={btn.id}
                        onClick={() => setFilterMode(btn.id as any)}
                        className={`rounded-xl px-4 py-2 text-xs font-bold transition shadow ${
                          filterMode === btn.id
                            ? "bg-[#ffd166] text-[#1a0e04] shadow-md"
                            : "awa-card-3 text-[#fefae0]/80 hover:text-[#ffd166] hover:border-[#ffd166]/40"
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Counter */}
                <div className="flex items-center justify-between text-xs text-[#d4a373] px-1 pt-1">
                  <span>
                    Mostrando palavras {filteredWords.length > 0 ? (currentPage - 1) * WORDS_PER_PAGE + 1 : 0}–
                    {Math.min(currentPage * WORDS_PER_PAGE, filteredWords.length)} de {filteredWords.length}
                  </span>
                  {searchQuery && (
                    <span className="text-[#ffd166]">Filtro ativo: "{searchQuery}"</span>
                  )}
                </div>

                {/* Paginated Word Grid */}
                <div className="pt-2">
                  {isLoading ? (
                    <div className="grid gap-3.5 sm:grid-cols-2">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="awa-card-2 h-28 rounded-2xl animate-pulse" />
                      ))}
                    </div>
                  ) : filteredWords.length === 0 ? (
                    <EmptyState
                      title="Nenhuma palavra encontrada"
                      description={
                        searchQuery
                          ? `Nenhum resultado para "${searchQuery}". Tente outro termo.`
                          : filterMode === "aprendidas"
                          ? "Você ainda não aprendeu nenhuma palavra desta trilha. Toque em 'Aprender' para registrar seu avanço!"
                          : "Todas as palavras desta trilha já foram aprendidas! Parabéns!"
                      }
                      actionLabel="Ver todas as palavras"
                      onAction={() => {
                        setSearchQuery("");
                        setFilterMode("todas");
                      }}
                    />
                  ) : (
                    <div className="grid gap-3.5 sm:grid-cols-2">
                      {paginatedWords.map((w) => (
                        <WordCard
                          key={w.id}
                          w={w}
                          learned={learned.has(w.id)}
                          onToggle={() => toggleLearned(w.id)}
                          localize={localize}
                          isKids={isKids}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Responsive Pagination Controls */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  className="pt-6"
                />

                {/* Sequential navigation */}
                <div className="pt-8">
                  <LessonNavigation
                    previousLabel="Trilhas da Aldeia"
                    onPrevious={() => navigate({ to: "/trilhas-infantil" })}
                    nextLabel={learned.size >= words.length ? `Próxima: ${nextTrail.name}` : "Praticar no Quiz (+20 pts)"}
                    onNext={() => {
                      if (learned.size >= words.length) {
                        navigate({ to: "/trilhas/$slug", params: { slug: nextSlug }, search: { area: "infantil" } });
                      } else {
                        setShowQuiz(true);
                      }
                    }}
                    stickyOnMobile
                  />
                </div>
              </div>
            ) : (
              <>
                <section className="rounded-3xl border border-[#e8e4dc] bg-white p-6 md:p-8 shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#b47e28]">
                    <span>{trail.emoji}</span>
                    <span>Trilha Temática</span>
                  </div>
                  <p className="mt-2 font-display text-2xl md:text-3xl font-black text-[#11231b] tracking-tight">{tr(trail.intro)}</p>
                  <p className="mt-2 text-sm text-[#4b5563] leading-relaxed">{tr(trail.apoio)}</p>

                  <div className="mt-5">
                    <div className="flex items-center justify-between text-xs font-bold text-[#11231b]">
                      <span>{learned.size} / {words.length} {tr("palavras aprendidas")}</span>
                      <span className="text-[#2d6a4f]">{progress}% concluído</span>
                    </div>
                    <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-[#f4f2ec]">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#2d6a4f] to-[#52b788] transition-all" style={{ width: `${progress}%` }} />
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2.5">
                    <button
                      onClick={() => setShowQuiz(true)}
                      disabled={words.length < 4}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#1b4332] px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#2d6a4f] active:scale-95 disabled:opacity-50"
                    >
                      <Sparkles className="h-4 w-4" /> {tr("Praticar quiz")}
                    </button>
                    <button
                      onClick={() => setShowMatch(true)}
                      disabled={words.length < 4}
                      className="inline-flex items-center gap-2 rounded-xl border border-[#e8e4dc] bg-[#f7f6f2] px-5 py-2.5 text-xs font-bold text-[#11231b] shadow-xs transition hover:bg-white hover:border-[#1b4332] disabled:opacity-50"
                    >
                      <Shuffle className="h-4 w-4 text-[#2d6a4f]" /> {tr("Associar imagem ↔ palavra")}
                    </button>
                    {hasCertificate(slug) && (
                      <button
                        onClick={() => setShowCert(true)}
                        className="inline-flex items-center gap-2 rounded-xl border border-[#b47e28]/40 bg-[#b47e28]/10 px-5 py-2.5 text-xs font-bold text-[#b47e28]"
                      >
                        <Award className="h-4 w-4" /> {tr("Ver certificado")}
                      </button>
                    )}
                  </div>
                </section>

                {isLoading ? (
                  <div className="mt-8 flex items-center gap-2 text-foreground/60"><Loader2 className="h-4 w-4 animate-spin" /> {tr("Carregando...")}</div>
                ) : (
                  grouped.map((g) => (
                    <section key={g.label} className="mt-8">
                      <h2 className="text-lg sm:text-xl font-black mb-3 text-[#11231b] tracking-tight">
                        {g.label}
                      </h2>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {g.items.map((w) => (
                          <WordCard key={w.id} w={w} learned={learned.has(w.id)} onToggle={() => toggleLearned(w.id)} localize={localize} isKids={false} />
                        ))}
                      </div>
                    </section>
                  ))
                )}
              </>
            )}
          </main>
        </div>

        <SiteFooter mode={isKids ? "infantil" : "adulto"} />
      </div>

      {showFlashcards && (
        <FlashcardModal
          words={filteredWords.length > 0 ? filteredWords : words}
          learnedIds={learned}
          onClose={() => setShowFlashcards(false)}
          onToggleLearned={(id) => toggleLearned(id)}
          localize={localize}
        />
      )}

      {showQuiz && words.length >= 4 && (
        <QuizModal words={words} onClose={() => setShowQuiz(false)} onCorrect={(id) => markLearned(id)} localize={localize} tr={tr} />
      )}

      {showMatch && words.length >= 4 && (
        <MatchModal words={words} learnedIds={learned} onClose={() => setShowMatch(false)} onCorrect={(id) => markLearned(id)} localize={localize} tr={tr} />
      )}

      {showCert && (
        <CertificateModal
          trail={trail}
          nextTrail={nextTrail}
          onClose={() => setShowCert(false)}
          onNext={() => {
            setShowCert(false);
            navigate({ to: "/trilhas/$slug", params: { slug: nextSlug }, search: { area: isKids ? "infantil" : "adulto" } });
          }}
        />
      )}
    </div>
  );
}

function FlashcardModal({
  words,
  learnedIds,
  onClose,
  onToggleLearned,
  localize,
}: {
  words: Word[];
  learnedIds: Set<string>;
  onClose: () => void;
  onToggleLearned: (id: string) => void;
  localize: (row: any, field: string) => string;
}) {
  const [index, setIndex] = useState(0);
  const current = words[index];
  const isLearned = current ? learnedIds.has(current.id) : false;

  if (!current) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="awa-card-1 relative w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-[#ffd166]/50">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-xl bg-black/40 text-[#fefae0]/70 hover:text-white border border-[#633916]"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Step indicator */}
        <div className="flex items-center justify-between text-xs text-[#d4a373] mb-3">
          <span className="font-bold text-[#ffd166] flex items-center gap-1.5">
            <BookOpen className="h-4 w-4" /> Modo Estudo Passo a Passo
          </span>
          <span className="font-semibold">{index + 1} de {words.length}</span>
        </div>
        <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-gradient-to-r from-[#ffd166] to-[#f59e0b] transition-all duration-300"
            style={{ width: `${((index + 1) / words.length) * 100}%` }}
          />
        </div>

        {/* Flashcard body */}
        <div className="text-center py-4 bg-[#180e07]/80 rounded-2xl border border-[#633916]/50 p-6 shadow-inner">
          <div className="font-display text-3xl sm:text-4xl font-black text-[#ffd166] mb-2 tracking-tight">
            {current.term_indigenous}
          </div>

          <div className="text-lg sm:text-xl font-bold text-[#ffffff] mb-3">
            {localize(current, "term_pt")}
          </div>

          {current.pronunciation && (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#251408] border border-[#633916] px-4 py-1 text-xs text-[#d4a373] font-medium mb-4">
              <span>🗣️ Pronúncia:</span>
              <span className="text-[#ffd166] font-bold">{current.pronunciation}</span>
            </div>
          )}

          {current.example && (
            <div className="mt-2 text-xs italic text-[#fefae0]/85 bg-black/40 rounded-xl p-3 border border-[#633916]/40 max-w-md mx-auto">
              "{current.example}"
            </div>
          )}

          {/* Big audio button */}
          <div className="mt-6 flex justify-center">
            <PlayBtn text={current.term_indigenous} audioUrl={current.audio_url} />
          </div>
        </div>

        {/* Toggle Learned & Navigation */}
        <div className="mt-6 pt-4 border-t border-[#633916]/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <button
            onClick={() => onToggleLearned(current.id)}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 min-h-[44px] text-xs font-bold transition shadow ${
              isLearned
                ? "bg-[#2a9d8f] text-white"
                : "bg-[#251408] border border-[#633916] text-[#ffd166] hover:border-[#ffd166]"
            }`}
          >
            <Check className="h-4 w-4 shrink-0" />
            <span>{isLearned ? "Aprendida ✓" : "Marcar como Aprendida"}</span>
          </button>

          {/* Nav buttons */}
          <div className="flex items-center justify-end gap-2">
            <button
              disabled={index === 0}
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
              className="rounded-xl border border-[#633916] bg-[#251408] min-h-[44px] min-w-[44px] grid place-items-center text-[#fefae0] hover:border-[#ffd166] disabled:opacity-40 transition"
              title="Palavra anterior"
              aria-label="Palavra anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              disabled={index === words.length - 1}
              onClick={() => setIndex((i) => Math.min(words.length - 1, i + 1))}
              className="flex-1 sm:flex-none inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#ffd166] to-[#f59e0b] px-4 py-2.5 min-h-[44px] text-xs font-black text-[#1a0e04] hover:brightness-110 disabled:opacity-40 transition shadow"
            >
              <span>Próxima</span>
              <ChevronRight className="h-4 w-4 ml-1 inline shrink-0" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function WordCard({ w, learned, onToggle, localize, isKids }: { w: Word; learned: boolean; onToggle: () => void; localize: (row: any, field: string) => string; isKids?: boolean }) {
  const trAria = useTr(["Marcar como aprendida", "Marcar como não aprendida"]);
  if (isKids) {
    return (
      <div
        className={`awa-card-2 rounded-2xl p-4 transition shadow-md border ${
          learned
            ? "border-[#2a9d8f]/70 bg-[#16271e]"
            : "border-[#633916]/60 hover:border-[#ffd166]/60"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-display text-lg sm:text-xl font-black text-[#ffd166] tracking-tight">
                {w.term_indigenous}
              </span>
              {learned && (
                <span className="inline-flex items-center gap-0.5 rounded-md bg-[#2a9d8f]/20 border border-[#2a9d8f]/50 px-1.5 py-0.5 text-[10px] font-bold text-[#2a9d8f]">
                  ✓ Aprendida
                </span>
              )}
            </div>

            <div className="text-sm font-bold text-[#ffffff] mt-1">
              {localize(w, "term_pt")}
            </div>

            {w.pronunciation && (
              <div className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-[#180e07] border border-[#633916]/60 px-2 py-0.5 text-[11px] text-[#d4a373]">
                <span className="text-[10px]">🗣️</span>
                <span className="font-medium text-[#ffd166]">{w.pronunciation}</span>
              </div>
            )}

            {w.example && (
              <div className="mt-2 text-[11px] text-[#fefae0]/75 italic line-clamp-2">
                "{w.example}"
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
            <PlayBtn text={w.term_indigenous} audioUrl={w.audio_url} />
            <button
              onClick={onToggle}
              aria-label={learned ? trAria("Marcar como não aprendida") : trAria("Marcar como aprendida")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition shadow active:scale-95 ${
                learned
                  ? "bg-[#2a9d8f] text-white"
                  : "bg-[#251408] border border-[#633916] text-[#ffd166] hover:border-[#ffd166]"
              }`}
            >
              <Check className="h-3.5 w-3.5" />
              <span>{learned ? "Aprendida" : "Aprender"}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className={`rounded-2xl border p-4 transition shadow-xs ${
      learned
        ? "border-emerald-500/50 bg-emerald-50/60"
        : "border-[#e8e4dc] bg-white hover:border-[#2d6a4f]/50 hover:shadow-sm"
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-display text-lg font-bold text-[#1b4332] truncate">
              {w.term_indigenous}
            </span>
            {learned && (
              <span className="inline-flex items-center rounded-md bg-emerald-100 border border-emerald-300 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                ✓ Aprendida
              </span>
            )}
          </div>
          <div className="text-sm font-medium text-[#374151] truncate mt-0.5">{localize(w, "term_pt")}</div>

          {w.pronunciation && (
            <div className="text-xs text-[#6b7280] mt-1 inline-flex items-center gap-1">
              <span>🗣️</span>
              <span className="font-medium text-[#b47e28]">{w.pronunciation}</span>
            </div>
          )}
          {w.example && (
            <div className="text-xs text-[#6b7280] italic mt-1 line-clamp-1">
              "{w.example}"
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <PlayBtn text={w.term_indigenous} audioUrl={w.audio_url} />
          <button
            onClick={onToggle}
            aria-label={learned ? trAria("Marcar como não aprendida") : trAria("Marcar como aprendida")}
            className={`grid h-9 w-9 place-items-center rounded-xl transition ${
              learned
                ? "bg-[#1b4332] text-white shadow-xs"
                : "border border-[#e8e4dc] bg-[#f4f2ec] text-[#1b4332] hover:bg-emerald-50 hover:border-emerald-300"
            }`}
          >
            <Check className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function PlayBtn({ text, audioUrl }: { text: string; audioUrl: string | null }) {
  const speak = useServerFn(speakText);
  const [busy, setBusy] = useState(false);
  const cacheRef = useRef<string | null>(null);

  async function play() {
    if (busy) return;
    try {
      setBusy(true);
      if (audioUrl) {
        await playFast(audioUrl);
        return;
      }
      if (!cacheRef.current) {
        const r = await speak({ data: { text, voice: "onyx", environment: getPaddleEnvironment() } });
        if (r.error || !r.audio_base64) {
          throw new Error(r.message ?? "Não foi possível gerar áudio");
        }
        cacheRef.current = base64ToBlobUrl(r.audio_base64, r.mime);
      }
      await playFast(cacheRef.current);
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao tocar áudio");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button onClick={play} disabled={busy} aria-label={`Ouvir ${text}`}
      className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-leaf/20 text-leaf hover:bg-leaf/30 disabled:opacity-50">
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
    </button>
  );
}

function QuizModal({ words, onClose, onCorrect, localize, tr }: { words: Word[]; onClose: () => void; onCorrect: (id: string) => void; localize: (row: any, field: string) => string; tr: (s: string) => string }) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const trLocal = useTr(["Quiz · Acertos:", "Como se diz:", "Próxima"]);

  const question = useMemo(() => {
    const correct = words[Math.floor(Math.random() * words.length)];
    const opts = new Set<string>([correct.term_indigenous]);
    while (opts.size < Math.min(4, words.length)) {
      opts.add(words[Math.floor(Math.random() * words.length)].term_indigenous);
    }
    return { correct, options: [...opts].sort(() => Math.random() - 0.5) };
  }, [round, words]);

  function pick(opt: string) {
    if (picked) return;
    setPicked(opt);
    if (opt === question.correct.term_indigenous) {
      setScore((s) => s + 1);
      onCorrect(question.correct.id);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
      <div className="card-elev w-full max-w-md rounded-3xl border border-gold/30 bg-card p-6">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-leaf">{trLocal("Quiz · Acertos:")} {score}</div>
          <button onClick={onClose} className="text-foreground/60 hover:text-cream"><X className="h-5 w-5" /></button>
        </div>
        <p className="mt-4 text-foreground/75 text-sm">{trLocal("Como se diz:")}</p>
        <h3 className="mt-1 font-display text-2xl font-black text-cream">{localize(question.correct, "term_pt")}</h3>


        <div className="mt-5 grid gap-2">
          {question.options.map((opt) => {
            const isCorrect = opt === question.correct.term_indigenous;
            const state = picked
              ? isCorrect ? "border-leaf bg-leaf/20 text-cream"
                : opt === picked ? "border-red-500/50 bg-red-500/10 text-cream/80"
                : "border-gold/15 text-foreground/60"
              : "border-gold/20 text-cream hover:bg-gold/10";
            return (
              <button key={opt} onClick={() => pick(opt)}
                className={`rounded-2xl border px-4 py-3 text-left font-semibold transition ${state}`}>
                {opt}
              </button>
            );
          })}
        </div>

        {picked && (
          <button
            onClick={() => { setPicked(null); setRound((r) => r + 1); }}
            className="mt-5 w-full rounded-full bg-[var(--gradient-leaf)] py-3 text-sm font-bold text-cream"
          >
            {trLocal("Próxima")}
          </button>
        )}
      </div>
    </div>
  );
}

function CertificateModal({
  trail, nextTrail, onClose, onNext,
}: {
  trail: typeof TRAILS[TrailSlug];
  nextTrail: typeof TRAILS[TrailSlug];
  onClose: () => void;
  onNext: () => void;
}) {
  const tr = useTr([
    "Certificado · PATXOHÃ · 2026", "PROFESSOR AKUÃ", "Próxima trilha:",
    trail.certificate.title, trail.certificate.description, trail.certificate.message,
    nextTrail.name,
  ]);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4 overflow-y-auto">
      <div className="card-elev relative w-full max-w-2xl rounded-3xl border-2 border-gold/50 bg-gradient-to-br from-forest-deep to-bark p-6 md:p-10 my-8">
        <button onClick={onClose} className="absolute right-4 top-4 text-foreground/60 hover:text-cream"><X className="h-5 w-5" /></button>
        <div className="text-center">
          <Award className="mx-auto h-12 w-12 text-gold" />
          <div className="mt-3 text-xs font-bold uppercase tracking-[0.22em] text-leaf">{tr("Certificado · PATXOHÃ · 2026")}</div>
          <h2 className="mt-3 font-display text-3xl md:text-4xl font-black text-gold">{tr(trail.certificate.title)}</h2>
          <p className="mt-3 text-sm md:text-base text-cream/90">{tr(trail.certificate.description)}</p>
          <div className="mt-6 whitespace-pre-line text-left text-sm leading-relaxed text-foreground/85 rounded-2xl border border-gold/20 bg-forest-deep/40 p-4">
            {tr(trail.certificate.message)}
          </div>
          <div className="mt-6 text-[10px] font-semibold tracking-[0.22em] text-gold/80">{tr("PROFESSOR AKUÃ")}</div>
          <button
            onClick={onNext}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--gradient-leaf)] px-6 py-3 text-sm font-bold text-cream"
          >
            {tr("Próxima trilha:")} {nextTrail.emoji} {tr(nextTrail.name)} <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Mapping word → emoji used as visual "imagem" in the matching game.
const EMOJI_RULES: Array<[RegExp, string]> = [
  [/\b(sol|hayô|dia)\b/i, "☀️"],
  [/\b(lua|noite)\b/i, "🌙"],
  [/\b(estrela)\b/i, "⭐"],
  [/\b(céu|ceu)\b/i, "🌌"],
  [/\b(chuva|nuvem|trovão|trovao)\b/i, "🌧️"],
  [/\b(rio|água|agua|miãga|miaga|mar)\b/i, "💧"],
  [/\b(terra|hãhão|hahao|chão|chao)\b/i, "🌍"],
  [/\b(fogo)\b/i, "🔥"],
  [/\b(árvore|arvore|mata|floresta|folha|pau)\b/i, "🌳"],
  [/\b(flor)\b/i, "🌸"],
  [/\b(fruta|fruto)\b/i, "🍃"],
  [/\b(pai|mãe|mae|avô|avo|irmã|irma|irmão|irmao|filho|filha|tio|tia|primo|prima|esposa|marido|família|familia|povo|cacique|pajé|paje)\b/i, "👨‍👩‍👧"],
  [/\b(criança|crianca|menino|menina|bebê|bebe)\b/i, "🧒"],
  [/\b(onça|onca|jaguar)\b/i, "🐆"],
  [/\b(cobra|serpente)\b/i, "🐍"],
  [/\b(macaco)\b/i, "🐒"],
  [/\b(peixe)\b/i, "🐟"],
  [/\b(pássaro|passaro|ave|tucano|arara)\b/i, "🦜"],
  [/\b(tartaruga|jabuti)\b/i, "🐢"],
  [/\b(abelha|formiga|inseto)\b/i, "🐝"],
  [/\b(cachorro|cão|cao)\b/i, "🐕"],
  [/\b(gato)\b/i, "🐈"],
  [/\b(galinha|galo)\b/i, "🐓"],
  [/\b(cavalo)\b/i, "🐎"],
  [/\b(boi|vaca)\b/i, "🐄"],
  [/\b(porco)\b/i, "🐖"],
  [/\b(coelho)\b/i, "🐇"],
  [/\b(olho)\b/i, "👁️"],
  [/\b(boca|lábio|labio)\b/i, "👄"],
  [/\b(orelha|ouvido)\b/i, "👂"],
  [/\b(nariz)\b/i, "👃"],
  [/\b(mão|mao)\b/i, "✋"],
  [/\b(pé|pe)\b/i, "🦶"],
  [/\b(cabeça|cabeca|cabelo)\b/i, "🧑"],
  [/\b(coração|coracao)\b/i, "❤️"],
  [/\b(bom dia)\b/i, "🌅"],
  [/\b(boa tarde)\b/i, "🌇"],
  [/\b(boa noite)\b/i, "🌙"],
  [/\b(obrigad)/i, "🙏"],
  [/\b(olá|ola|oi|saudaç)/i, "🤝"],
  [/\b(adeus|tchau|despedi)/i, "👋"],
  [/\b(milho|mandioca|farinha|pão|pao|peixe|carne|comida|alimento)\b/i, "🍽️"],
  [/\b(água|agua)\b/i, "🥤"],
  [/\b(branco)\b/i, "⚪"],
  [/\b(preto)\b/i, "⚫"],
  [/\b(vermelho)\b/i, "🟥"],
  [/\b(verde)\b/i, "🟩"],
  [/\b(amarelo)\b/i, "🟨"],
  [/\b(azul)\b/i, "🟦"],
];
const CAT_EMOJI: Record<string, string> = {
  Saudações: "🤝", Família: "👨‍👩‍👧", Natureza: "🌿", Animais: "🐾",
  Corpo: "🧍", Verbos: "⚡", Cores: "🎨", Números: "🔢", Alimentos: "🍲",
};
function emojiFor(w: Word): string {
  for (const [re, emj] of EMOJI_RULES) if (re.test(w.term_pt)) return emj;
  return CAT_EMOJI[w.category] ?? "🌱";
}

function MatchModal({
  words, learnedIds, onClose, onCorrect, localize, tr,
}: { words: Word[]; learnedIds: Set<string>; onClose: () => void; onCorrect: (id: string) => void; localize: (row: any, field: string) => string; tr: (s: string) => string }) {
  const trLocal = useTr([
    "Associar ·", "Toque uma imagem à esquerda e depois a palavra correta em Patxôhã à direita.",
    "🌟 Awê! Você associou tudo!", "Progresso salvo nesta trilha.", "Nova rodada",
  ]);
  const PAIR_COUNT = Math.min(4, words.length);

  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrong, setWrong] = useState<{ left: string; right: string } | null>(null);

  // Prefer not-yet-learned, fallback to random
  const pool = useMemo(() => {
    const fresh = words.filter((w) => !learnedIds.has(w.id));
    return fresh.length >= PAIR_COUNT ? fresh : words;
  }, [words, learnedIds, PAIR_COUNT]);

  const pairs = useMemo(() => {
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, PAIR_COUNT);
    return shuffled;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  const rights = useMemo(() => [...pairs].sort(() => Math.random() - 0.5), [pairs]);

  function selectLeft(id: string) {
    if (matched.has(id)) return;
    setSelectedLeft(id);
  }

  function selectRight(id: string) {
    if (matched.has(id) || !selectedLeft) return;
    if (id === selectedLeft) {
      const next = new Set(matched); next.add(id);
      setMatched(next);
      setScore((s) => s + 1);
      onCorrect(id);
      setSelectedLeft(null);
    } else {
      setErrors((e) => e + 1);
      setWrong({ left: selectedLeft, right: id });
      setTimeout(() => { setWrong(null); setSelectedLeft(null); }, 650);
    }
  }

  function nextRound() {
    setMatched(new Set()); setSelectedLeft(null); setWrong(null);
    setRound((r) => r + 1);
  }

  const allMatched = matched.size === pairs.length && pairs.length > 0;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-3 md:p-4 overflow-y-auto">
      <div className="card-elev w-full max-w-2xl rounded-3xl border border-gold/30 bg-card p-5 md:p-6 my-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-leaf">
            {trLocal("Associar ·")} ✅ {score} · ❌ {errors}
          </div>
          <button onClick={onClose} className="text-foreground/60 hover:text-cream"><X className="h-5 w-5" /></button>
        </div>
        <p className="mt-3 text-sm text-foreground/75">
          {trLocal("Toque uma imagem à esquerda e depois a palavra correta em Patxôhã à direita.")}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3 md:gap-4">
          {/* Left: imagens (emoji + PT) */}
          <div className="flex flex-col gap-2">
            {pairs.map((w) => {
              const isMatched = matched.has(w.id);
              const isSel = selectedLeft === w.id;
              const isWrong = wrong?.left === w.id;
              const cls = isMatched
                ? "border-leaf bg-leaf/15 text-cream opacity-70"
                : isWrong
                  ? "border-red-500/60 bg-red-500/15 animate-pulse"
                  : isSel
                    ? "border-gold bg-gold/15"
                    : "border-gold/20 bg-forest-deep/30 hover:bg-gold/10";
              return (
                <button
                  key={w.id}
                  disabled={isMatched}
                  onClick={() => selectLeft(w.id)}
                  className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition ${cls}`}
                >
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-card/80 text-3xl">
                    {emojiFor(w)}
                  </span>
                  <span className="text-sm font-bold text-cream">{localize(w, "term_pt")}</span>
                  {isMatched && <Check className="ml-auto h-4 w-4 text-leaf" />}
                </button>
              );
            })}
          </div>
          {/* Right: palavras Patxôhã */}
          <div className="flex flex-col gap-2">
            {rights.map((w) => {
              const isMatched = matched.has(w.id);
              const isWrong = wrong?.right === w.id;
              const cls = isMatched
                ? "border-leaf bg-leaf/15 opacity-70"
                : isWrong
                  ? "border-red-500/60 bg-red-500/15 animate-pulse"
                  : selectedLeft
                    ? "border-gold/40 bg-gold/5 hover:bg-gold/20"
                    : "border-gold/20 bg-forest-deep/30";
              return (
                <button
                  key={w.id}
                  disabled={isMatched || !selectedLeft}
                  onClick={() => selectRight(w.id)}
                  className={`rounded-2xl border p-3 text-center font-display text-lg font-bold text-gold transition ${cls} disabled:cursor-not-allowed`}
                >
                  {w.term_indigenous}
                  {isMatched && <Check className="ml-2 inline h-4 w-4 text-leaf" />}
                </button>
              );
            })}
          </div>
        </div>

        {allMatched && (
          <div className="mt-5 rounded-2xl border border-leaf/40 bg-leaf/10 p-4 text-center">
            <p className="font-display text-lg font-black text-cream">{trLocal("🌟 Awê! Você associou tudo!")}</p>
            <p className="mt-1 text-xs text-foreground/75">{trLocal("Progresso salvo nesta trilha.")}</p>
            <button
              onClick={nextRound}
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-[var(--gradient-leaf)] px-5 py-2 text-sm font-bold text-cream"
            >
              <Shuffle className="h-4 w-4" /> {trLocal("Nova rodada")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

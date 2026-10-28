import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Volume2,
  Loader2,
  Check,
  Award,
  X,
  Sparkles,
  RotateCw,
  Shuffle,
  ArrowRight,
  Star,
  CheckCircle2,
  Pause,
  Compass,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { playFast, primeAudio, attachEndHandler } from "@/lib/audio-play";
import { speak, stopSpeak } from "@/lib/speak";
import { getTrilhaAudioUrl } from "@/lib/trilhas-audio-catalog";
import {
  TRAILS,
  type TrailSlug,
  getLearned,
  setLearned,
  markCertificate,
  hasCertificate,
} from "@/lib/trilhas";
import { toast } from "sonner";
import { PremiumGate } from "@/components/PremiumGate";
import { pickLang, useLang } from "@/lib/pick-lang";
import { useAutoTranslate } from "@/hooks/use-auto-translate";
import { useLastArea, setLastArea } from "@/lib/last-area";
import { SiteHeader } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";

import kidsBg from "@/assets/kids-menu-bg.jpg";
import kidsCharacter from "@/assets/kids-menu-character.png";
import trailSaudacoes from "@/assets/trail-saudacoes.jpg";
import trailFamilia from "@/assets/trail-familia.jpg";
import trailNatureza from "@/assets/trail-natureza.jpg";
import trailAnimais from "@/assets/trail-animais.jpg";

const TRAIL_IMAGES: Record<string, string> = {
  saudacoes: trailSaudacoes,
  familia: trailFamilia,
  natureza: trailNatureza,
  animais: trailAnimais,
};

function useTr(texts: string[]) {
  const translated = useAutoTranslate(texts);
  return useMemo(() => {
    const m = new Map<string, string>();
    texts.forEach((t, i) => {
      if (t) m.set(t, translated[i] ?? t);
    });
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
    <PremiumGate
      title="Trilhas de aprendizado (Premium)"
      description="Exercícios, jogos e progresso das trilhas são exclusivos para assinantes. Comece grátis pelas 25 saudações essenciais."
    >
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

/** Botão de áudio ultra-resiliente que toca 100% das vezes */
function AudioPlayBtn({
  text,
  audioUrl,
  label = "Ouvir",
  variant = "normal",
  className = "",
}: {
  text: string;
  audioUrl?: string | null;
  label?: string;
  variant?: "normal" | "kids" | "kids-pill" | "icon";
  className?: string;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "playing">("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  async function handlePlay(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (status === "playing") {
      stopSpeak();
      setStatus("idle");
      return;
    }

    if (status === "loading") {
      // Ignora clique repetido enquanto carrega para não cancelar antes de tocar
      return;
    }

    primeAudio();
    if (timerRef.current) clearTimeout(timerRef.current);
    setStatus("loading");

    // Trava de segurança: reseta estado caso a requisição demore demais
    timerRef.current = setTimeout(() => {
      setStatus("idle");
    }, 8000);

    // Prioridade total: áudio oficial baixado da trilha (0 tokens de IA)
    const effectiveUrl = audioUrl || getTrilhaAudioUrl(text);

    if (effectiveUrl) {
      try {
        attachEndHandler(() => {
          setStatus("idle");
          if (timerRef.current) clearTimeout(timerRef.current);
        });
        setStatus("playing");
        await playFast(effectiveUrl);
        return;
      } catch (err) {
        console.warn("Falha ao tocar áudio da trilha:", err);
      }
    }

    // Sem áudio disponível ou fallback: reseta estado sem disparar IA paga
    setStatus("idle");
    if (timerRef.current) clearTimeout(timerRef.current);
  }

  if (variant === "kids-pill") {
    return (
      <button
        type="button"
        onClick={handlePlay}
        aria-label={status === "playing" ? `Pausar ${text}` : `${label} ${text}`}
        data-speech-control
        className={`inline-flex items-center justify-center gap-1.5 rounded-2xl px-4 py-2 text-xs font-black uppercase tracking-wider text-white transition-all transform active:translate-y-1 shadow-md cursor-pointer ${
          status === "playing"
            ? "bg-rose-500 shadow-[0_3px_0_#be123c] animate-pulse"
            : status === "loading"
            ? "bg-amber-500 shadow-[0_3px_0_#b45309]"
            : "bg-emerald-600 hover:bg-emerald-500 shadow-[0_3px_0_#065f46]"
        } ${className}`}
      >
        {status === "loading" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Carregando</span>
          </>
        ) : status === "playing" ? (
          <>
            <span className="flex items-center gap-0.5 h-3" aria-hidden>
              <span className="w-1 bg-white rounded-full h-2.5 animate-[pulse_0.6s_ease-in-out_infinite]" />
              <span className="w-1 bg-white rounded-full h-3.5 animate-[pulse_0.8s_ease-in-out_infinite_0.15s]" />
              <span className="w-1 bg-white rounded-full h-2 animate-[pulse_0.5s_ease-in-out_infinite_0.3s]" />
            </span>
            <span>Ouvindo</span>
          </>
        ) : (
          <>
            <Volume2 className="h-4 w-4" />
            <span>{label}</span>
          </>
        )}
      </button>
    );
  }

  if (variant === "kids") {
    return (
      <button
        type="button"
        onClick={handlePlay}
        aria-label={status === "playing" ? `Pausar ${text}` : `${label} ${text}`}
        data-speech-control
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-md transition-all transform active:translate-y-1 cursor-pointer ${
          status === "playing"
            ? "bg-rose-500 shadow-[0_3px_0_#be123c] animate-pulse"
            : status === "loading"
            ? "bg-amber-500 shadow-[0_3px_0_#b45309]"
            : "bg-emerald-600 hover:bg-emerald-500 shadow-[0_3px_0_#065f46]"
        } ${className}`}
      >
        {status === "loading" ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : status === "playing" ? (
          <Pause className="h-5 w-5" />
        ) : (
          <Volume2 className="h-5 w-5" />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handlePlay}
      aria-label={status === "playing" ? `Pausar ${text}` : `Ouvir ${text}`}
      data-speech-control
      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full transition active:scale-95 cursor-pointer ${
        status === "playing"
          ? "bg-rose-500/20 text-rose-400 ring-2 ring-rose-500/40 animate-pulse"
          : status === "loading"
          ? "bg-amber-500/20 text-amber-300 ring-2 ring-amber-500/40"
          : "bg-leaf/20 text-leaf hover:bg-leaf/30"
      } ${className}`}
    >
      {status === "loading" ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : status === "playing" ? (
        <Pause className="h-4 w-4" />
      ) : (
        <Volume2 className="h-4 w-4" />
      )}
    </button>
  );
}

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
        .select(
          "id,term_indigenous,term_pt,pronunciation,example,audio_url,category,term_pt_en,term_pt_es,example_en,example_es"
        )
        .in("category", trail.categories)
        .order("term_pt");
      if (error) throw error;
      return (data ?? []).map((w) => ({
        ...w,
        audio_url: w.audio_url || getTrilhaAudioUrl(w),
      })) as Word[];
    },
  });

  const [learned, setLearnedState] = useState<Set<string>>(new Set());
  const [showCert, setShowCert] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showMatch, setShowMatch] = useState(false);
  const [playingIntro, setPlayingIntro] = useState(false);

  useEffect(() => {
    setLearnedState(getLearned(slug));
  }, [slug]);

  useEffect(() => {
    return () => {
      stopSpeak();
    };
  }, []);

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
      const next = new Set(prev);
      next.add(id);
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

  function toggleIntroAudio() {
    if (playingIntro) {
      stopSpeak();
      setPlayingIntro(false);
      return;
    }
    setPlayingIntro(true);
    const speech = `Trilha ${trail.name}. ${trail.intro}. ${trail.apoio}`;
    speak(
      speech,
      "pt-BR",
      0.95,
      () => setPlayingIntro(true),
      () => setPlayingIntro(false)
    );
  }

  const grouped = useMemo(() => {
    if (trail.groups) {
      return trail.groups
        .map((g) => ({
          label: g.label,
          items: words.filter((w) => g.categories.includes(w.category)),
        }))
        .filter((g) => g.items.length > 0);
    }
    return [{ label: trail.emoji + " " + trail.name, items: words }];
  }, [words, trail]);

  const tr = useTr([
    "Início",
    "Reiniciar",
    "palavras",
    "Praticar quiz",
    "Associar imagem ↔ palavra",
    "Ver certificado",
    "Carregando...",
    trail.intro,
    trail.apoio,
    trail.name,
    ...words.flatMap((w) => [w.term_pt, w.example].filter(Boolean) as string[]),
  ]);
  const localize = useLocalize(tr);

  // Detecção robusta da área infantil
  const isKids =
    area === "infantil" ||
    (typeof window !== "undefined" &&
      (new URLSearchParams(window.location.search).get("area") === "infantil" ||
        window.location.pathname.includes("-infantil")));

  useEffect(() => {
    if (isKids) setLastArea("/infantil");
    else setLastArea("/adulto");
  }, [isKids]);

  const coverImg = TRAIL_IMAGES[slug] || trailSaudacoes;

  return (
    <div
      className={`min-h-screen ${
        isKids
          ? "kids-theme relative font-sans text-slate-800 bg-[#fbf9f4] overflow-x-clip selection:bg-amber-300 selection:text-amber-950"
          : "bg-gradient-forest text-foreground"
      }`}
    >
      {/* Header */}
      {isKids ? <SiteHeader mode="infantil" /> : <SiteHeader mode="adulto" />}

      {/* Sticky Sub-Header Bar */}
      <header
        className={`sticky top-0 z-40 border-b ${
          isKids
            ? "border-amber-300 bg-white shadow-sm"
            : "border-gold/20 bg-[oklch(0.18_0.04_145/0.75)] backdrop-blur-xl"
        }`}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 md:px-8">
          <Link
            to={(isKids ? "/trilhas-infantil" : "/trilhas") as "/"}
            className={`inline-flex items-center gap-2 text-sm font-bold transition-all hover:scale-105 active:scale-95 ${
              isKids
                ? "rounded-full bg-amber-100 px-3.5 py-1.5 text-emerald-900 border border-amber-300 shadow-sm"
                : "text-gold hover:underline"
            }`}
          >
            <ArrowLeft className="h-4 w-4" /> {isKids ? "Mapa das Trilhas" : tr("Trilhas")}
          </Link>

          <div
            className={`flex items-center gap-2 font-display font-black ${
              isKids ? "text-emerald-900 text-lg md:text-xl" : "text-cream"
            }`}
          >
            <span className={isKids ? "text-2xl drop-shadow" : ""}>{trail.emoji}</span>{" "}
            {tr(trail.name)}
          </div>

          <button
            onClick={resetProgress}
            title={tr("Reiniciar")}
            aria-label="Reiniciar progresso"
            className={`flex items-center gap-1 rounded-full p-2 transition ${
              isKids
                ? "text-emerald-800 hover:text-amber-600 hover:bg-amber-100/50"
                : "text-foreground/60 hover:text-gold"
            }`}
          >
            <RotateCw className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Main Trail Content */}
      <main className="relative z-10 mx-auto max-w-5xl px-3 sm:px-6 py-6 md:px-8 md:py-10 pb-36">
        {/* ========================================================
            HERO CARD: Children Mode vs Adult Mode
           ======================================================== */}
        {isKids ? (
          <section className="relative overflow-hidden rounded-[2.5rem] border-4 border-amber-300 bg-gradient-to-br from-[#fffdf5] via-[#fef7e6] to-[#f5edd2] p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.15)]">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Illustrated Cover Thumbnail */}
              <div className="relative h-32 w-32 md:h-40 md:w-40 shrink-0 overflow-hidden rounded-3xl border-4 border-white shadow-lg">
                <img
                  src={coverImg}
                  alt={trail.name}
                  className="h-full w-full object-cover"
                />
                <span className="absolute bottom-2 right-2 text-3xl drop-shadow">
                  {trail.emoji}
                </span>
              </div>

              {/* Trail Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-200/80 border border-amber-400/60 px-3 py-1 text-xs font-black uppercase tracking-wider text-amber-900">
                  <Compass className="h-3.5 w-3.5 text-emerald-800" />
                  Trilha da Aldeia • Nível Infantil
                </div>
                <h1
                  className="mt-2 font-display text-3xl md:text-4xl font-black tracking-tight"
                  style={{ color: "#064e3b" }}
                >
                  Trilha de {tr(trail.name)}
                </h1>
                <p
                  className="mt-1 text-sm md:text-base font-semibold max-w-xl"
                  style={{ color: "#143d2b" }}
                >
                  {tr(trail.intro)}
                </p>

                {/* Audio Narration Button for Trail Intro */}
                <div className="mt-3 flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <button
                    type="button"
                    onClick={toggleIntroAudio}
                    data-speech-control
                    className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow-md transition-all transform active:translate-y-1 cursor-pointer ${
                      playingIntro
                        ? "bg-rose-500 shadow-[0_4px_0_#be123c] animate-pulse"
                        : "bg-amber-500 hover:bg-amber-400 shadow-[0_4px_0_#b45309]"
                    }`}
                  >
                    {playingIntro ? (
                      <>
                        <Pause className="h-4 w-4" />
                        <span>Pausar História</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="h-4 w-4" />
                        <span>Ouvir História da Trilha</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Progress Bar Container */}
            <div className="mt-6 rounded-2xl bg-white/80 p-4 border border-amber-200 shadow-sm">
              <div className="flex items-center justify-between text-sm font-black text-emerald-950">
                <span className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
                  {learned.size} de {words.length} palavras aprendidas
                </span>
                <span className="text-amber-800 font-extrabold">{progress}% Concluído</span>
              </div>
              <div className="mt-2 h-4 w-full overflow-hidden rounded-full border border-amber-300 bg-amber-50">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Interactive Game Buttons */}
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                onClick={() => setShowQuiz(true)}
                disabled={words.length < 4}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border-b-[5px] border-emerald-800 bg-emerald-600 hover:bg-emerald-500 px-6 py-3.5 text-base font-black uppercase tracking-wider text-white shadow-lg transition active:translate-y-[3px] active:border-b-2 disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="h-5 w-5 text-amber-300" /> Jogar Quiz da Aldeia
              </button>

              <button
                onClick={() => setShowMatch(true)}
                disabled={words.length < 4}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border-b-[5px] border-orange-700 bg-orange-500 hover:bg-orange-400 px-6 py-3.5 text-base font-black uppercase tracking-wider text-white shadow-lg transition active:translate-y-[3px] active:border-b-2 disabled:opacity-50 cursor-pointer"
              >
                <Shuffle className="h-5 w-5 text-amber-200" /> Associar Imagens
              </button>

              {hasCertificate(slug) && (
                <button
                  onClick={() => setShowCert(true)}
                  className="sm:col-span-2 inline-flex items-center justify-center gap-2 rounded-2xl border-b-[5px] border-amber-600 bg-gradient-to-r from-amber-400 to-amber-500 px-6 py-3.5 text-base font-black uppercase tracking-wider text-amber-950 shadow-lg transition active:translate-y-[3px] active:border-b-2 cursor-pointer"
                >
                  <Award className="h-6 w-6 text-amber-950" /> Ver Medalha Sagrada
                </button>
              )}
            </div>
          </section>
        ) : (
          /* Adult Hero Section */
          <section
            className={`card-elev rounded-[2rem] border-4 border-gold/25 bg-gradient-to-br ${trail.color} p-6 md:p-8 shadow-[0_20px_60px_-25px_rgba(0,0,0,0.35)]`}
          >
            <p className="font-display text-2xl md:text-3xl font-black text-cream">
              {tr(trail.intro)}
            </p>
            <p className="mt-2 text-sm text-foreground/85">{tr(trail.apoio)}</p>

            <div className="mt-5">
              <div className="flex items-center justify-between text-xs font-bold text-cream/90">
                <span>
                  {learned.size} / {words.length} {tr("palavras")}
                </span>
                <span className="text-gold">{progress}%</span>
              </div>
              <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-forest-deep/60">
                <div
                  className="h-full bg-[var(--gradient-gold)] transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                onClick={() => setShowQuiz(true)}
                disabled={words.length < 4}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--gradient-leaf)] px-5 py-2.5 text-sm font-bold text-cream disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" /> {tr("Praticar quiz")}
              </button>
              <button
                onClick={() => setShowMatch(true)}
                disabled={words.length < 4}
                className="inline-flex items-center gap-2 rounded-full bg-gold/20 px-5 py-2.5 text-sm font-bold text-gold disabled:opacity-50"
              >
                <Shuffle className="h-4 w-4" /> {tr("Associar imagem ↔ palavra")}
              </button>
              {hasCertificate(slug) && (
                <button
                  onClick={() => setShowCert(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-gold/20 px-5 py-2.5 text-sm font-bold text-gold"
                >
                  <Award className="h-4 w-4" /> {tr("Ver certificado")}
                </button>
              )}
            </div>
          </section>
        )}

        {/* ========================================================
            WORDS LIST BY CATEGORY
           ======================================================== */}
        {isLoading ? (
          <div className="mt-8 flex items-center justify-center gap-2 py-12 text-slate-600 font-bold">
            <Loader2 className="h-5 w-5 animate-spin text-emerald-600" /> {tr("Carregando...")}
          </div>
        ) : (
          grouped.map((g) => (
            <section key={g.label} className="mt-8">
              {isKids ? (
                <div className="flex items-center gap-3 mb-4">
                  <div className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 border-2 border-amber-300 shadow-sm">
                    <span className="text-xl">✨</span>
                    <h2
                      className="font-display text-lg sm:text-xl font-black tracking-tight"
                      style={{ color: "#064e3b" }}
                    >
                      {g.label}
                    </h2>
                  </div>
                  <div className="h-0.5 flex-1 bg-gradient-to-r from-amber-300/80 to-transparent rounded-full" />
                </div>
              ) : (
                <h2 className="font-display text-xl md:text-2xl font-black mb-4 flex items-center gap-2 text-cream">
                  <span>🌿</span>
                  <span>{g.label}</span>
                </h2>
              )}

              <div className="grid gap-3.5 sm:grid-cols-2">
                {g.items.map((w) => (
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
            </section>
          ))
        )}
      </main>

      {/* Footer */}
      {isKids ? <SiteFooter mode="infantil" /> : null}

      {/* Modals */}
      {showQuiz && words.length >= 4 && (
        <QuizModal
          words={words}
          onClose={() => setShowQuiz(false)}
          onCorrect={(id) => markLearned(id)}
          localize={localize}
          tr={tr}
          isKids={isKids}
        />
      )}

      {showMatch && words.length >= 4 && (
        <MatchModal
          words={words}
          learnedIds={learned}
          onClose={() => setShowMatch(false)}
          onCorrect={(id) => markLearned(id)}
          localize={localize}
          tr={tr}
          isKids={isKids}
        />
      )}

      {showCert && (
        <CertificateModal
          trail={trail}
          nextTrail={nextTrail}
          onClose={() => setShowCert(false)}
          onNext={() => {
            setShowCert(false);
            navigate({
              to: "/trilhas/$slug",
              params: { slug: nextSlug },
              search: { area: isKids ? "infantil" : "adulto" },
            });
          }}
          isKids={isKids}
        />
      )}
    </div>
  );
}

/** Card de palavra com layout lúdico e áudio 100% garantido */
function WordCard({
  w,
  learned,
  onToggle,
  localize,
  isKids,
}: {
  w: Word;
  learned: boolean;
  onToggle: () => void;
  localize: (row: any, field: string) => string;
  isKids?: boolean;
}) {
  const trAria = useTr(["Marcar como aprendida", "Marcar como não aprendida"]);

  if (isKids) {
    return (
      <div
        className={`relative overflow-hidden rounded-3xl border-3 p-4 sm:p-5 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 bg-white ${
          learned
            ? "border-emerald-500 ring-2 ring-emerald-300/40"
            : "border-amber-300 hover:border-amber-400"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          {/* Visual Emoji + Words */}
          <div className="flex items-start gap-3.5 min-w-0 flex-1">
            <span
              className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber-100 text-2xl shadow-inner border border-amber-200"
              aria-hidden
            >
              {emojiFor(w)}
            </span>

            <div className="min-w-0 flex-1">
              <div
                className="font-display text-xl sm:text-2xl font-black text-emerald-950 truncate"
                style={{ color: "#064e3b" }}
              >
                {w.term_indigenous}
              </div>

              <div
                className="text-base font-bold text-amber-900 truncate"
                style={{ color: "#9a3412" }}
              >
                {localize(w, "term_pt")}
              </div>

              {w.pronunciation && (
                <div
                  className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-900 border border-emerald-200"
                  style={{ color: "#065f46" }}
                >
                  <span>🗣️</span>
                  <span>{w.pronunciation}</span>
                </div>
              )}

              {w.example && (
                <div className="mt-2 text-xs text-slate-700 italic bg-amber-50 p-2.5 rounded-xl border border-amber-200 font-medium leading-relaxed">
                  "{w.example}"
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons: Audio + Learned Checkmark */}
          <div className="flex flex-col items-center gap-2 shrink-0">
            {/* Pronúncia em áudio */}
            <AudioPlayBtn
              text={w.term_indigenous}
              audioUrl={w.audio_url}
              label="Ouvir"
              variant="kids"
            />

            {/* Checkmark de Aprendido */}
            <button
              type="button"
              onClick={onToggle}
              title={learned ? "Palavra aprendida!" : "Marcar como aprendida"}
              aria-label={
                learned
                  ? trAria("Marcar como não aprendida")
                  : trAria("Marcar como aprendida")
              }
              className={`flex h-11 w-11 items-center justify-center rounded-2xl border-b-4 transition-all transform active:translate-y-1 shadow-md cursor-pointer ${
                learned
                  ? "border-emerald-700 bg-emerald-500 text-white"
                  : "border-amber-400 bg-amber-100 hover:bg-amber-200 text-amber-900"
              }`}
            >
              {learned ? (
                <Check className="h-6 w-6 stroke-[3]" />
              ) : (
                <span className="text-sm font-black">⭐</span>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Adult layout
  return (
    <div
      className={`card-elev rounded-2xl border p-4 transition ${
        learned ? "border-gold/60 bg-gold/5" : "border-gold/15"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-display text-lg font-bold text-gold truncate">
            {w.term_indigenous}
          </div>
          <div className="text-sm text-cream/90 truncate">{localize(w, "term_pt")}</div>

          {w.pronunciation && (
            <div className="text-xs text-foreground/60 mt-0.5">🗣️ {w.pronunciation}</div>
          )}
        </div>
        <div className="flex flex-col items-center gap-2">
          <AudioPlayBtn text={w.term_indigenous} audioUrl={w.audio_url} />
          <button
            onClick={onToggle}
            aria-label={
              learned
                ? trAria("Marcar como não aprendida")
                : trAria("Marcar como aprendida")
            }
            className={`grid h-9 w-9 place-items-center rounded-full transition ${
              learned ? "bg-gold text-forest-deep" : "bg-leaf/15 text-leaf hover:bg-leaf/25"
            }`}
          >
            <Check className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/** Quiz Modal com suporte completo a cores infantis e áudio */
function QuizModal({
  words,
  onClose,
  onCorrect,
  localize,
  tr,
  isKids,
}: {
  words: Word[];
  onClose: () => void;
  onCorrect: (id: string) => void;
  localize: (row: any, field: string) => string;
  tr: (s: string) => string;
  isKids?: boolean;
}) {
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
    // Toca o áudio oficial baixado da palavra (0 tokens de IA)
    const optAudio = getTrilhaAudioUrl(opt);
    if (optAudio) {
      void playFast(optAudio);
    }

    if (opt === question.correct.term_indigenous) {
      setScore((s) => s + 1);
      onCorrect(question.correct.id);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4 overflow-y-auto">
      <div
        className={`w-full max-w-md rounded-[2.5rem] p-6 shadow-2xl ${
          isKids
            ? "border-4 border-amber-400 bg-gradient-to-b from-[#fffdf5] to-[#fcf6e8] text-slate-800"
            : "card-elev border border-gold/30 bg-card text-foreground"
        }`}
      >
        <div className="flex items-center justify-between">
          <div
            className={`text-xs font-black uppercase tracking-wider ${
              isKids ? "text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full" : "text-leaf"
            }`}
          >
            {trLocal("Quiz · Acertos:")} ⭐ {score}
          </div>
          <button
            onClick={onClose}
            className={`rounded-full p-1.5 transition ${
              isKids ? "text-slate-500 hover:text-slate-900 hover:bg-black/5" : "text-foreground/60 hover:text-cream"
            }`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className={`mt-4 text-xs font-bold uppercase tracking-wider ${isKids ? "text-amber-800" : "text-foreground/75"}`}>
          {trLocal("Como se diz:")}
        </p>

        <div className="mt-1 flex items-center justify-between gap-3">
          <h3
            className={`font-display text-2xl font-black ${
              isKids ? "text-emerald-950" : "text-cream"
            }`}
            style={{ color: isKids ? "#064e3b" : undefined }}
          >
            {localize(question.correct, "term_pt")}
          </h3>

          {/* Botão de áudio para a pergunta com áudio nativo */}
          <AudioPlayBtn
            text={question.correct.term_indigenous}
            audioUrl={question.correct.audio_url || getTrilhaAudioUrl(question.correct)}
            variant={isKids ? "kids" : "normal"}
            className="h-9 w-9"
          />
        </div>

        <div className="mt-5 grid gap-2.5">
          {question.options.map((opt) => {
            const isCorrect = opt === question.correct.term_indigenous;
            let btnStyle = "";

            if (isKids) {
              if (picked) {
                if (isCorrect) {
                  btnStyle = "border-emerald-600 bg-emerald-100 text-emerald-950 font-black shadow-md";
                } else if (opt === picked) {
                  btnStyle = "border-rose-400 bg-rose-50 text-rose-900 font-bold opacity-80";
                } else {
                  btnStyle = "border-slate-200 bg-white/60 text-slate-400";
                }
              } else {
                btnStyle =
                  "border-amber-200 bg-white hover:bg-amber-50 hover:border-amber-400 text-slate-800 font-black shadow-sm active:translate-y-0.5";
              }
            } else {
              btnStyle = picked
                ? isCorrect
                  ? "border-leaf bg-leaf/20 text-cream"
                  : opt === picked
                  ? "border-red-500/50 bg-red-500/10 text-cream/80"
                  : "border-gold/15 text-foreground/60"
                : "border-gold/20 text-cream hover:bg-gold/10";
            }

            return (
              <button
                key={opt}
                onClick={() => pick(opt)}
                className={`rounded-2xl border-2 px-4 py-3 text-left transition-all ${btnStyle}`}
              >
                <div className="flex items-center justify-between">
                  <span>{opt}</span>
                  {picked && isCorrect && <span className="text-emerald-700 font-black">✓ Certo!</span>}
                </div>
              </button>
            );
          })}
        </div>

        {picked && (
          <button
            onClick={() => {
              setPicked(null);
              setRound((r) => r + 1);
            }}
            className={`mt-5 w-full rounded-2xl py-3 text-sm font-black uppercase tracking-wider transition-all transform active:translate-y-1 shadow-md ${
              isKids
                ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_4px_0_#065f46]"
                : "bg-[var(--gradient-leaf)] text-cream"
            }`}
          >
            {trLocal("Próxima")} →
          </button>
        )}
      </div>
    </div>
  );
}

/** Modal de Associação Imagem ↔ Palavra */
function MatchModal({
  words,
  learnedIds,
  onClose,
  onCorrect,
  localize,
  tr,
  isKids,
}: {
  words: Word[];
  learnedIds: Set<string>;
  onClose: () => void;
  onCorrect: (id: string) => void;
  localize: (row: any, field: string) => string;
  tr: (s: string) => string;
  isKids?: boolean;
}) {
  const trLocal = useTr([
    "Associar ·",
    "Toque uma imagem à esquerda e depois a palavra correta em Patxôhã à direita.",
    "🌟 Awê! Você associou tudo!",
    "Progresso salvo nesta trilha.",
    "Nova rodada",
  ]);
  const PAIR_COUNT = Math.min(4, words.length);

  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrong, setWrong] = useState<{ left: string; right: string } | null>(null);

  const pool = useMemo(() => {
    const fresh = words.filter((w) => !learnedIds.has(w.id));
    return fresh.length >= PAIR_COUNT ? fresh : words;
  }, [words, learnedIds, PAIR_COUNT]);

  const pairs = useMemo(() => {
    return [...pool].sort(() => Math.random() - 0.5).slice(0, PAIR_COUNT);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  const rights = useMemo(() => [...pairs].sort(() => Math.random() - 0.5), [pairs]);

  function selectLeft(id: string) {
    if (matched.has(id)) return;
    setSelectedLeft(id);
  }

  function selectRight(id: string) {
    if (matched.has(id) || !selectedLeft) return;
    const item = rights.find((p) => p.id === id);
    if (item) {
      const audio = item.audio_url || getTrilhaAudioUrl(item);
      if (audio) {
        void playFast(audio);
      }
    }

    if (id === selectedLeft) {
      const next = new Set(matched);
      next.add(id);
      setMatched(next);
      setScore((s) => s + 1);
      onCorrect(id);
      setSelectedLeft(null);
    } else {
      setErrors((e) => e + 1);
      setWrong({ left: selectedLeft, right: id });
      setTimeout(() => {
        setWrong(null);
        setSelectedLeft(null);
      }, 650);
    }
  }

  function nextRound() {
    setMatched(new Set());
    setSelectedLeft(null);
    setWrong(null);
    setRound((r) => r + 1);
  }

  const allMatched = matched.size === pairs.length && pairs.length > 0;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-3 md:p-4 overflow-y-auto">
      <div
        className={`w-full max-w-2xl rounded-[2.5rem] p-5 md:p-6 shadow-2xl my-4 ${
          isKids
            ? "border-4 border-amber-400 bg-gradient-to-b from-[#fffef8] to-[#fcf6e8] text-slate-800"
            : "card-elev border border-gold/30 bg-card text-foreground"
        }`}
      >
        <div className="flex items-center justify-between">
          <div
            className={`text-xs font-black uppercase tracking-wider ${
              isKids ? "text-emerald-900 bg-emerald-100 px-3 py-1 rounded-full" : "text-leaf"
            }`}
          >
            {trLocal("Associar ·")} ✅ {score} · ❌ {errors}
          </div>
          <button
            onClick={onClose}
            className={`rounded-full p-1.5 transition ${
              isKids ? "text-slate-500 hover:text-slate-900" : "text-foreground/60 hover:text-cream"
            }`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className={`mt-3 text-sm font-medium ${isKids ? "text-emerald-900" : "text-foreground/75"}`}>
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
                ? "border-emerald-500 bg-emerald-100/60 opacity-60"
                : isWrong
                ? "border-rose-500 bg-rose-100 animate-pulse"
                : isSel
                ? "border-amber-500 bg-amber-100 ring-2 ring-amber-400"
                : isKids
                ? "border-amber-200 bg-white hover:bg-amber-50 shadow-sm"
                : "border-gold/20 bg-forest-deep/30 hover:bg-gold/10";

              return (
                <button
                  key={w.id}
                  disabled={isMatched}
                  onClick={() => selectLeft(w.id)}
                  className={`flex items-center gap-2.5 rounded-2xl border-2 p-3 text-left transition-all ${cls}`}
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-50 text-2xl border border-amber-200">
                    {emojiFor(w)}
                  </span>
                  <span className="text-sm font-black text-slate-800 truncate">
                    {localize(w, "term_pt")}
                  </span>
                  {isMatched && <Check className="ml-auto h-4 w-4 text-emerald-600 stroke-[3]" />}
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
                ? "border-emerald-500 bg-emerald-100/60 opacity-60 text-emerald-900"
                : isWrong
                ? "border-rose-500 bg-rose-100 animate-pulse text-rose-900"
                : selectedLeft
                ? "border-emerald-400 bg-emerald-50 hover:bg-emerald-100"
                : isKids
                ? "border-slate-200 bg-white/70"
                : "border-gold/20 bg-forest-deep/30";

              return (
                <button
                  key={w.id}
                  disabled={isMatched || !selectedLeft}
                  onClick={() => selectRight(w.id)}
                  className={`rounded-2xl border-2 p-3 text-center font-display text-base sm:text-lg font-black transition-all ${cls} disabled:cursor-not-allowed`}
                >
                  <span>{w.term_indigenous}</span>
                  {isMatched && <Check className="ml-2 inline h-4 w-4 text-emerald-600 stroke-[3]" />}
                </button>
              );
            })}
          </div>
        </div>

        {allMatched && (
          <div className="mt-5 rounded-2xl border-2 border-emerald-400 bg-emerald-100/70 p-4 text-center">
            <p className="font-display text-lg font-black text-emerald-950">
              {trLocal("🌟 Awê! Você associou tudo!")}
            </p>
            <p className="mt-1 text-xs text-emerald-800 font-bold">
              {trLocal("Progresso salvo nesta trilha.")}
            </p>
            <button
              onClick={nextRound}
              className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-2 text-sm font-black uppercase text-white shadow-md active:translate-y-1 hover:bg-emerald-500 cursor-pointer"
            >
              <Shuffle className="h-4 w-4" /> {trLocal("Nova rodada")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/** Modal de Certificado / Medalha */
function CertificateModal({
  trail,
  nextTrail,
  onClose,
  onNext,
  isKids,
}: {
  trail: typeof TRAILS[TrailSlug];
  nextTrail: typeof TRAILS[TrailSlug];
  onClose: () => void;
  onNext: () => void;
  isKids?: boolean;
}) {
  const tr = useTr([
    "Certificado · PATXOHÃ · 2026",
    "PROFESSOR AKUÃ",
    "Próxima trilha:",
    trail.certificate.title,
    trail.certificate.description,
    trail.certificate.message,
    nextTrail.name,
  ]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4 overflow-y-auto">
      <div
        className={`relative w-full max-w-2xl rounded-[2.5rem] p-6 md:p-10 my-8 shadow-2xl ${
          isKids
            ? "border-4 border-amber-400 bg-gradient-to-b from-[#fffef8] via-[#fdf7e7] to-[#f9eed2] text-slate-800"
            : "card-elev border-2 border-gold/50 bg-gradient-to-br from-forest-deep to-bark text-cream"
        }`}
      >
        <button
          onClick={onClose}
          className={`absolute right-4 top-4 rounded-full p-2 ${
            isKids ? "text-slate-500 hover:text-slate-900" : "text-foreground/60 hover:text-cream"
          }`}
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 border-4 border-amber-400 shadow-md">
            <Award className="h-10 w-10 text-amber-600" />
          </div>

          <div className="mt-3 text-xs font-black uppercase tracking-[0.22em] text-emerald-800">
            {tr("Certificado · PATXOHÃ · 2026")}
          </div>

          <h2
            className="mt-2 font-display text-3xl md:text-4xl font-black text-amber-900"
            style={{ color: "#78350f" }}
          >
            {tr(trail.certificate.title)}
          </h2>

          <p className="mt-2 text-sm md:text-base font-semibold text-slate-700">
            {tr(trail.certificate.description)}
          </p>

          <div
            className={`mt-6 whitespace-pre-line text-left text-sm leading-relaxed rounded-2xl p-5 border ${
              isKids
                ? "bg-white/80 border-amber-200 text-slate-800 font-medium"
                : "border-gold/20 bg-forest-deep/40 text-foreground/85"
            }`}
          >
            {tr(trail.certificate.message)}
          </div>

          <div className="mt-6 text-[11px] font-black tracking-[0.22em] text-amber-800">
            {tr("PROFESSOR AKUÃ • GUARDIÃO DA ALDEIA")}
          </div>

          <button
            onClick={onNext}
            className={`mt-6 inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-black uppercase tracking-wider text-white shadow-lg transition active:translate-y-1 cursor-pointer ${
              isKids
                ? "bg-emerald-600 hover:bg-emerald-500 shadow-[0_4px_0_#065f46]"
                : "bg-[var(--gradient-leaf)]"
            }`}
          >
            {tr("Próxima trilha:")} {nextTrail.emoji} {tr(nextTrail.name)}{" "}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Mapping word → emoji used as visual "imagem" in the matching game
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
  [
    /\b(pai|mãe|mae|avô|avo|irmã|irma|irmão|irmao|filho|filha|tio|tia|primo|prima|esposa|marido|família|familia|povo|cacique|pajé|paje)\b/i,
    "👨‍👩‍👧",
  ],
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
  [/\b(obrigad)\b/i, "🙏"],
  [/\b(olá|ola|oi|saudaç)\b/i, "🤝"],
  [/\b(adeus|tchau|despedi)\b/i, "👋"],
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
  Saudações: "🤝",
  Família: "👨‍👩‍👧",
  Natureza: "🌿",
  Animais: "🐾",
  Corpo: "🧍",
  Verbos: "⚡",
  Cores: "🎨",
  Números: "🔢",
  Alimentos: "🍲",
};

function emojiFor(w: Word): string {
  for (const [re, emj] of EMOJI_RULES) if (re.test(w.term_pt)) return emj;
  return CAT_EMOJI[w.category] ?? "🌱";
}

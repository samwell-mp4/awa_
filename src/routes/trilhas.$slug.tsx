import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getPaddleEnvironment } from "@/lib/paddle";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft, Volume2, Loader2, Check, Award, X, Sparkles, RotateCw, Shuffle, ArrowRight,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { speakText } from "@/lib/tts.functions";
import { base64ToBlobUrl, playFast } from "@/lib/audio-play";
import { TRAILS, type TrailSlug, getLearned, setLearned, markCertificate, hasCertificate } from "@/lib/trilhas";
import { toast } from "sonner";
import { PremiumGate } from "@/components/PremiumGate";
import { pickLang, useLang } from "@/lib/pick-lang";
import { useAutoTranslate } from "@/hooks/use-auto-translate";
import { useLastArea } from "@/lib/last-area";
import { SiteHeader } from "@/components/home/site-header";

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
  beforeLoad: ({ params }) => {
    if (!(params.slug in TRAILS)) throw notFound();
  },
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

  useEffect(() => { setLearnedState(getLearned(slug)); }, [slug]);

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

  const isKids = typeof backTo === "string" && backTo.includes("infantil");

  return (
    <div className={`min-h-screen ${isKids ? "kids-theme" : ""}`}>
      {isKids ? <SiteHeader mode="infantil" /> : null}
      <header className={`sticky top-0 z-40 border-b backdrop-blur-xl ${isKids ? "border-amber-300/60 bg-white/85" : "border-gold/20 bg-[oklch(0.18_0.04_145/0.75)]"}`}>
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 md:px-8">
          <Link to={(isKids ? "/trilhas-infantil" : "/trilhas") as "/"} className={`inline-flex items-center gap-2 text-sm font-semibold hover:underline ${isKids ? "text-emerald-800" : "text-gold"}`}>
            <ArrowLeft className="h-4 w-4" /> {tr("Trilhas")}
          </Link>
          <div className={`flex items-center gap-2 font-display font-black ${isKids ? "text-emerald-900 text-xl" : "text-cream"}`}>
            <span className={isKids ? "text-3xl" : ""}>{trail.emoji}</span> {tr(trail.name)}
          </div>
          <button onClick={resetProgress} title={tr("Reiniciar")} className={isKids ? "text-emerald-700 hover:text-amber-600" : "text-foreground/60 hover:text-gold"}>
            <RotateCw className="h-4 w-4" />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-10">
        {isKids ? (
          <section className="relative overflow-hidden rounded-[2.5rem] border-4 border-amber-300 bg-gradient-to-br from-yellow-100 via-orange-100 to-emerald-100 p-6 md:p-8 shadow-[0_20px_60px_-25px_rgba(0,0,0,0.35)]">
            <div className="flex flex-col items-center text-center">
              <div className="text-7xl md:text-8xl drop-shadow-md animate-[wiggle_2s_ease-in-out_infinite]" aria-hidden>{trail.emoji}</div>
              <h1 className="mt-3 font-display text-3xl md:text-4xl font-black text-emerald-900">{tr(trail.name)}</h1>
              <p className="mt-2 text-base md:text-lg font-bold text-emerald-800/90 max-w-xl">{tr("Vamos brincar e aprender!")}</p>
            </div>

            <div className="mt-5 mx-auto max-w-md">
              <div className="flex items-center justify-between text-sm font-black text-emerald-900">
                <span>⭐ {learned.size} / {words.length}</span>
                <span>{progress}%</span>
              </div>
              <div className="mt-2 h-5 w-full overflow-hidden rounded-full border-2 border-amber-300 bg-white/70">
                <div className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-emerald-400 transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                onClick={() => setShowQuiz(true)}
                disabled={words.length < 4}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border-b-[6px] border-emerald-700 bg-gradient-to-b from-emerald-400 to-emerald-500 px-6 py-4 text-lg font-black text-white shadow-lg transition active:translate-y-[3px] active:border-b-2 disabled:opacity-50"
              >
                <Sparkles className="h-6 w-6" /> {tr("Jogar")}
              </button>
              <button
                onClick={() => setShowMatch(true)}
                disabled={words.length < 4}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border-b-[6px] border-orange-600 bg-gradient-to-b from-amber-400 to-orange-400 px-6 py-4 text-lg font-black text-white shadow-lg transition active:translate-y-[3px] active:border-b-2 disabled:opacity-50"
              >
                <Shuffle className="h-6 w-6" /> {tr("Combinar")}
              </button>
              {hasCertificate(slug) && (
                <button
                  onClick={() => setShowCert(true)}
                  className="sm:col-span-2 inline-flex items-center justify-center gap-2 rounded-2xl border-b-[6px] border-yellow-600 bg-gradient-to-b from-yellow-300 to-amber-400 px-6 py-4 text-lg font-black text-emerald-900 shadow-lg transition active:translate-y-[3px] active:border-b-2"
                >
                  <Award className="h-6 w-6" /> {tr("Medalha")}
                </button>
              )}
            </div>
          </section>
        ) : (
          <section className={`card-elev rounded-[2rem] border-4 border-gold/25 bg-gradient-to-br ${trail.color} p-6 md:p-8 shadow-[0_20px_60px_-25px_rgba(0,0,0,0.35)]`}>
            <p className="font-display text-2xl md:text-3xl font-black text-cream">{tr(trail.intro)}</p>
            <p className="mt-2 text-sm text-foreground/85">{tr(trail.apoio)}</p>

            <div className="mt-5">
              <div className="flex items-center justify-between text-xs font-bold text-cream/90">
                <span>{learned.size} / {words.length} {tr("palavras")}</span>
                <span className="text-gold">{progress}%</span>
              </div>
              <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-forest-deep/60">
                <div className="h-full bg-[var(--gradient-gold)] transition-all" style={{ width: `${progress}%` }} />
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

        {isLoading ? (
          <div className="mt-8 flex items-center gap-2 text-foreground/60"><Loader2 className="h-4 w-4 animate-spin" /> {tr("Carregando...")}</div>
        ) : (
          grouped.map((g) => (
            <section key={g.label} className="mt-8">
              <h2 className={`font-display text-xl md:text-2xl font-black mb-4 ${isKids ? "text-emerald-900" : "text-cream"}`}>
                {isKids ? "✨ " : ""}{g.label}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {g.items.map((w) => (
                  <WordCard key={w.id} w={w} learned={learned.has(w.id)} onToggle={() => toggleLearned(w.id)} localize={localize} isKids={isKids} />
                ))}
              </div>
            </section>
          ))
        )}
      </main>

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
            navigate({ to: "/trilhas/$slug", params: { slug: nextSlug } });
          }}
        />
      )}
    </div>
  );
}

function WordCard({ w, learned, onToggle, localize, isKids }: { w: Word; learned: boolean; onToggle: () => void; localize: (row: any, field: string) => string; isKids?: boolean }) {
  const trAria = useTr(["Marcar como aprendida", "Marcar como não aprendida"]);
  if (isKids) {
    return (
      <div className={`rounded-3xl border-4 p-4 transition ${learned ? "border-emerald-400 bg-emerald-50" : "border-amber-300 bg-white/80"} shadow-md`}>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="font-display text-xl font-black text-emerald-900 truncate">{w.term_indigenous}</div>
            <div className="text-base font-bold text-orange-700 truncate">{localize(w, "term_pt")}</div>
            {w.pronunciation && <div className="text-sm text-emerald-800/80 mt-0.5">🗣️ {w.pronunciation}</div>}
          </div>
          <div className="flex flex-col items-center gap-2">
            <PlayBtn text={w.term_indigenous} audioUrl={w.audio_url} />
            <button
              onClick={onToggle}
              aria-label={learned ? trAria("Marcar como não aprendida") : trAria("Marcar como aprendida")}
              className={`grid h-11 w-11 place-items-center rounded-full border-b-4 transition active:translate-y-[2px] ${learned ? "border-emerald-700 bg-emerald-500 text-white" : "border-amber-500 bg-amber-300 text-emerald-900"}`}
            >
              <Check className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className={`card-elev rounded-2xl border p-4 transition ${learned ? "border-gold/60 bg-gold/5" : "border-gold/15"}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-display text-lg font-bold text-gold truncate">{w.term_indigenous}</div>
          <div className="text-sm text-cream/90 truncate">{localize(w, "term_pt")}</div>

          {w.pronunciation && <div className="text-xs text-foreground/60 mt-0.5">🗣️ {w.pronunciation}</div>}
        </div>
        <div className="flex flex-col items-center gap-2">
          <PlayBtn text={w.term_indigenous} audioUrl={w.audio_url} />
          <button
            onClick={onToggle}
            aria-label={learned ? trAria("Marcar como não aprendida") : trAria("Marcar como aprendida")}
            className={`grid h-9 w-9 place-items-center rounded-full transition ${learned ? "bg-gold text-forest-deep" : "bg-leaf/15 text-leaf hover:bg-leaf/25"}`}
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
        const r = await speak({ data: { text, voice: "nova", environment: getPaddleEnvironment() } });
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

import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft, Volume2, Loader2, Check, Award, X, Sparkles, RotateCw, Shuffle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { speakText } from "@/lib/tts.functions";
import { TRAILS, type TrailSlug, getLearned, setLearned, markCertificate, hasCertificate } from "@/lib/trilhas";
import { toast } from "sonner";

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
  component: TrilhaPage,
});

type Word = {
  id: string;
  term_indigenous: string;
  term_pt: string;
  pronunciation: string | null;
  example: string | null;
  audio_url: string | null;
  category: string;
};

function TrilhaPage() {
  const { slug } = Route.useParams();
  const trail = TRAILS[slug as TrailSlug];

  const { data: words = [], isLoading } = useQuery({
    queryKey: ["trilha-words", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dictionary")
        .select("id,term_indigenous,term_pt,pronunciation,example,audio_url,category")
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

  function markLearned(id: string) {
    setLearnedState((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev); next.add(id);
      setLearned(slug, next);
      if (words.length && next.size >= words.length && !hasCertificate(slug)) {
        markCertificate(slug);
        setTimeout(() => setShowCert(true), 300);
      }
      return next;
    });
  }

  const progress = words.length ? Math.round((learned.size / words.length) * 100) : 0;

  function toggleLearned(id: string) {
    setLearnedState((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      setLearned(slug, next);
      if (words.length && next.size >= words.length && !hasCertificate(slug)) {
        markCertificate(slug);
        setTimeout(() => setShowCert(true), 300);
      }
      return next;
    });
  }

  function resetProgress() {
    if (!confirm("Reiniciar o progresso desta trilha?")) return;
    setLearnedState(new Set());
    setLearned(slug, new Set());
  }

  const grouped = useMemo(() => {
    if (trail.groups) {
      return trail.groups
        .map((g) => ({ label: g.label, items: words.filter((w) => g.categories.includes(w.category)) }))
        .filter((g) => g.items.length > 0);
    }
    return [{ label: trail.emoji + " " + trail.name, items: words }];
  }, [words, trail]);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-gold/20 bg-[oklch(0.18_0.04_145/0.75)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 md:px-8">
          <Link to="/trilhas" className="inline-flex items-center gap-2 text-sm font-semibold text-gold hover:underline">
            <ArrowLeft className="h-4 w-4" /> Trilhas
          </Link>
          <div className="flex items-center gap-2 font-display font-black text-cream">
            <span>{trail.emoji}</span> {trail.name}
          </div>
          <button onClick={resetProgress} title="Reiniciar" className="text-foreground/60 hover:text-gold">
            <RotateCw className="h-4 w-4" />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-10">
        <section className={`card-elev rounded-3xl border border-gold/25 bg-gradient-to-br ${trail.color} p-6 md:p-8`}>
          <p className="font-display text-2xl md:text-3xl font-black text-cream">{trail.intro}</p>
          <p className="mt-2 text-sm text-foreground/85">{trail.apoio}</p>

          <div className="mt-5">
            <div className="flex items-center justify-between text-xs font-bold text-cream/90">
              <span>{learned.size} / {words.length} palavras</span>
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
              <Sparkles className="h-4 w-4" /> Praticar quiz
            </button>
            <button
              onClick={() => setShowMatch(true)}
              disabled={words.length < 4}
              className="inline-flex items-center gap-2 rounded-full bg-gold/20 px-5 py-2.5 text-sm font-bold text-gold disabled:opacity-50"
            >
              <Shuffle className="h-4 w-4" /> Associar imagem ↔ palavra
            </button>
            {hasCertificate(slug) && (
              <button
                onClick={() => setShowCert(true)}
                className="inline-flex items-center gap-2 rounded-full bg-gold/20 px-5 py-2.5 text-sm font-bold text-gold"
              >
                <Award className="h-4 w-4" /> Ver certificado
              </button>
            )}
          </div>
        </section>

        {isLoading ? (
          <div className="mt-8 flex items-center gap-2 text-foreground/60"><Loader2 className="h-4 w-4 animate-spin" /> Carregando...</div>
        ) : (
          grouped.map((g) => (
            <section key={g.label} className="mt-8">
              <h2 className="font-display text-xl md:text-2xl font-black text-cream mb-4">{g.label}</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {g.items.map((w) => (
                  <WordCard key={w.id} w={w} learned={learned.has(w.id)} onToggle={() => toggleLearned(w.id)} />
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      {showQuiz && words.length >= 4 && (
        <QuizModal words={words} onClose={() => setShowQuiz(false)} onCorrect={(id) => markLearned(id)} />
      )}

      {showMatch && words.length >= 4 && (
        <MatchModal words={words} learnedIds={learned} onClose={() => setShowMatch(false)} onCorrect={(id) => markLearned(id)} />
      )}

      {showCert && <CertificateModal trail={trail} onClose={() => setShowCert(false)} />}
    </div>
  );
}

function WordCard({ w, learned, onToggle }: { w: Word; learned: boolean; onToggle: () => void }) {
  return (
    <div className={`card-elev rounded-2xl border p-4 transition ${learned ? "border-gold/60 bg-gold/5" : "border-gold/15"}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-display text-lg font-bold text-gold truncate">{w.term_indigenous}</div>
          <div className="text-sm text-cream/90 truncate">{w.term_pt}</div>
          {w.pronunciation && <div className="text-xs text-foreground/60 mt-0.5">🗣️ {w.pronunciation}</div>}
        </div>
        <div className="flex flex-col items-center gap-2">
          <PlayBtn text={w.term_indigenous} audioUrl={w.audio_url} />
          <button
            onClick={onToggle}
            aria-label={learned ? "Marcar como não aprendida" : "Marcar como aprendida"}
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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cacheRef = useRef<string | null>(null);

  async function play() {
    if (busy) return;
    try {
      setBusy(true);
      if (audioUrl) {
        const a = new Audio(audioUrl);
        audioRef.current?.pause();
        audioRef.current = a;
        await a.play();
        return;
      }
      if (!cacheRef.current) {
        const r = await speak({ data: { text, voice: "nova" } });
        cacheRef.current = `data:${r.mime};base64,${r.audio_base64}`;
      }
      const a = new Audio(cacheRef.current);
      audioRef.current?.pause();
      audioRef.current = a;
      await a.play();
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

function QuizModal({ words, onClose, onCorrect }: { words: Word[]; onClose: () => void; onCorrect: (id: string) => void }) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);

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
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-leaf">Quiz · Acertos: {score}</div>
          <button onClick={onClose} className="text-foreground/60 hover:text-cream"><X className="h-5 w-5" /></button>
        </div>
        <p className="mt-4 text-foreground/75 text-sm">Como se diz:</p>
        <h3 className="mt-1 font-display text-2xl font-black text-cream">{question.correct.term_pt}</h3>

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
            Próxima
          </button>
        )}
      </div>
    </div>
  );
}

function CertificateModal({ trail, onClose }: { trail: typeof TRAILS[TrailSlug]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4 overflow-y-auto">
      <div className="card-elev relative w-full max-w-2xl rounded-3xl border-2 border-gold/50 bg-gradient-to-br from-forest-deep to-bark p-6 md:p-10 my-8">
        <button onClick={onClose} className="absolute right-4 top-4 text-foreground/60 hover:text-cream"><X className="h-5 w-5" /></button>
        <div className="text-center">
          <Award className="mx-auto h-12 w-12 text-gold" />
          <div className="mt-3 text-xs font-bold uppercase tracking-[0.22em] text-leaf">Certificado · PATXOHÃ · 2026</div>
          <h2 className="mt-3 font-display text-3xl md:text-4xl font-black text-gold">{trail.certificate.title}</h2>
          <p className="mt-3 text-sm md:text-base text-cream/90">{trail.certificate.description}</p>
          <div className="mt-6 whitespace-pre-line text-left text-sm leading-relaxed text-foreground/85 rounded-2xl border border-gold/20 bg-forest-deep/40 p-4">
            {trail.certificate.message}
          </div>
          <div className="mt-6 text-[10px] font-semibold tracking-[0.22em] text-gold/80">PROFESSOR AKUÃ</div>
        </div>
      </div>
    </div>
  );
}

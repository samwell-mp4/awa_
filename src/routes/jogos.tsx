import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { Gamepad2, Trophy, RefreshCw, Check, X, Sparkles } from "lucide-react";

export const Route = createFileRoute("/jogos")({
  head: () => ({
    meta: [
      { title: "Jogos — AWÃ TECH" },
      { name: "description", content: "Jogos educativos para aprender Patxôhã brincando: relacione palavras, memória cultural e preencha lacunas." },
      { property: "og:title", content: "Jogos AWÃ TECH — Aprenda Patxôhã brincando" },
      { property: "og:description", content: "Jogos divertidos com temas indígenas e vocabulário Patxôhã." },
    ],
  }),
  component: JogosPage,
});

// Vocabulário base (grátis para todos)
const VOCAB: { pt: string; px: string }[] = [
  { pt: "Nós", px: "Awã" },
  { pt: "Nosso povo", px: "Pataxó" },
  { pt: "Deus / espírito do céu", px: "Tupã" },
  { pt: "Terra", px: "Yby" },
  { pt: "Água", px: "Y" },
  { pt: "Sol", px: "Kwaracy" },
  { pt: "Lua", px: "Jaci" },
  { pt: "Fogo", px: "Tatá" },
  { pt: "Mãe", px: "Sy" },
  { pt: "Pai", px: "Txopai" },
  { pt: "Criança", px: "Kunumi" },
  { pt: "Bom dia", px: "Djahatã" },
];

const SYMBOLS = [
  { emoji: "🏹", label: "Arco e Flecha" },
  { emoji: "🔥", label: "Fogo Sagrado" },
  { emoji: "🌿", label: "Urucum" },
  { emoji: "🪶", label: "Cocar" },
  { emoji: "🥁", label: "Maracá" },
  { emoji: "🌳", label: "Floresta" },
];

const FILL_QUESTIONS = [
  { sentence: "____ pataxó (Nós somos pataxó).", answer: "Awã", options: ["Awã", "Tupã", "Yby"] },
  { sentence: "____ é a nossa mãe terra.", answer: "Yby", options: ["Y", "Yby", "Tatá"] },
  { sentence: "O ____ ilumina o dia.", answer: "Kwaracy", options: ["Jaci", "Kwaracy", "Tupã"] },
  { sentence: "A ____ ilumina a noite.", answer: "Jaci", options: ["Jaci", "Sy", "Y"] },
  { sentence: "Bebemos ____ do rio.", answer: "Y", options: ["Y", "Tatá", "Awã"] },
];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function JogosPage() {
  const [tab, setTab] = useState<"match" | "memoria" | "lacuna">("match");
  const [score, setScore] = useState(0);

  return (
    <div className="min-h-screen bg-[var(--gradient-forest)] text-cream">
      <div className="mx-auto max-w-5xl px-4 py-10 md:py-16">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/20 text-gold">
            <Gamepad2 className="h-8 w-8" />
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold">Jogos Awã Tech</h1>
          <p className="mt-3 text-cream/80">Aprenda Patxôhã brincando 🌿</p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-gold/15 px-4 py-2 text-gold">
            <Trophy className="h-4 w-4" /> <span className="font-bold">{score} pontos</span>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap justify-center gap-2">
          {[
            { id: "match", label: "📚 Relacione" },
            { id: "memoria", label: "🧩 Memória" },
            { id: "lacuna", label: "✍️ Lacuna" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as "match" | "memoria" | "lacuna")}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                tab === t.id ? "bg-gold text-forest-deep" : "bg-white/10 text-cream hover:bg-white/20"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="rounded-3xl bg-black/30 p-4 md:p-8 backdrop-blur border border-gold/20">
          {tab === "match" && <MatchGame onScore={(n) => setScore((s) => s + n)} />}
          {tab === "memoria" && <MemoryGame onScore={(n) => setScore((s) => s + n)} />}
          {tab === "lacuna" && <FillGame onScore={(n) => setScore((s) => s + n)} />}
        </div>
      </div>
    </div>
  );
}

/* ============ 1. RELACIONE ============ */
function MatchGame({ onScore }: { onScore: (n: number) => void }) {
  const [round, setRound] = useState(0);
  const pool = useMemo(() => shuffle(VOCAB).slice(0, 4), [round]);
  const shuffledPt = useMemo(() => shuffle(pool.map((p) => p.pt)), [pool]);
  const [selectedPx, setSelectedPx] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const handlePt = (pt: string) => {
    if (!selectedPx) return;
    const correct = pool.find((p) => p.px === selectedPx)?.pt === pt;
    if (correct) {
      setMatches((m) => ({ ...m, [selectedPx]: pt }));
      onScore(10);
    } else {
      setErrors((e) => ({ ...e, [selectedPx]: true }));
      setTimeout(() => setErrors((e) => ({ ...e, [selectedPx]: false })), 500);
    }
    setSelectedPx(null);
  };

  const done = Object.keys(matches).length === pool.length;

  return (
    <div>
      <h3 className="mb-4 text-center text-xl font-bold text-gold">Ligue Patxôhã → Português</h3>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <p className="text-sm text-cream/60">Patxôhã</p>
          {pool.map((p) => {
            const matched = !!matches[p.px];
            const selected = selectedPx === p.px;
            const err = errors[p.px];
            return (
              <button
                key={p.px}
                disabled={matched}
                onClick={() => setSelectedPx(p.px)}
                className={`w-full rounded-xl px-4 py-3 text-left font-semibold transition ${
                  matched
                    ? "bg-leaf/40 text-cream line-through opacity-60"
                    : err
                    ? "bg-red-500/40"
                    : selected
                    ? "bg-gold text-forest-deep"
                    : "bg-white/10 hover:bg-white/20"
                }`}
              >
                {p.px}
              </button>
            );
          })}
        </div>
        <div className="space-y-2">
          <p className="text-sm text-cream/60">Português</p>
          {shuffledPt.map((pt) => {
            const used = Object.values(matches).includes(pt);
            return (
              <button
                key={pt}
                disabled={used || !selectedPx}
                onClick={() => handlePt(pt)}
                className={`w-full rounded-xl px-4 py-3 text-left font-semibold transition ${
                  used ? "bg-leaf/40 line-through opacity-60" : "bg-white/10 hover:bg-white/20"
                }`}
              >
                {pt}
              </button>
            );
          })}
        </div>
      </div>
      {done && (
        <div className="mt-6 text-center">
          <p className="mb-3 text-gold font-bold">🎉 Rodada completa! +40 pts</p>
          <button
            onClick={() => {
              setMatches({});
              setRound((r) => r + 1);
            }}
            className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-2 font-bold text-forest-deep"
          >
            <RefreshCw className="h-4 w-4" /> Nova rodada
          </button>
        </div>
      )}
    </div>
  );
}

/* ============ 2. MEMÓRIA ============ */
function MemoryGame({ onScore }: { onScore: (n: number) => void }) {
  const [round, setRound] = useState(0);
  const cards = useMemo(() => {
    const pick = shuffle(SYMBOLS).slice(0, 6);
    return shuffle([...pick, ...pick].map((c, i) => ({ ...c, id: i })));
  }, [round]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<string[]>([]);

  useEffect(() => {
    if (flipped.length === 2) {
      const [a, b] = flipped;
      if (cards[a].label === cards[b].label) {
        setMatched((m) => [...m, cards[a].label]);
        onScore(15);
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 800);
      }
    }
  }, [flipped, cards, onScore]);

  const handle = (i: number) => {
    if (flipped.length === 2 || flipped.includes(i) || matched.includes(cards[i].label)) return;
    setFlipped([...flipped, i]);
  };

  const done = matched.length === SYMBOLS.length;

  return (
    <div>
      <h3 className="mb-4 text-center text-xl font-bold text-gold">Encontre os pares culturais</h3>
      <div className="grid grid-cols-3 gap-3 md:grid-cols-4">
        {cards.map((c, i) => {
          const show = flipped.includes(i) || matched.includes(c.label);
          return (
            <motion.button
              key={c.id}
              onClick={() => handle(i)}
              whileTap={{ scale: 0.95 }}
              className={`aspect-square rounded-xl text-center font-bold transition ${
                show ? "bg-gold/90 text-forest-deep" : "bg-forest-deep/70 border border-gold/30"
              }`}
            >
              {show ? (
                <div className="flex h-full flex-col items-center justify-center p-2">
                  <div className="text-3xl md:text-4xl">{c.emoji}</div>
                  <div className="mt-1 text-[10px] md:text-xs">{c.label}</div>
                </div>
              ) : (
                <Sparkles className="mx-auto h-6 w-6 text-gold/50" />
              )}
            </motion.button>
          );
        })}
      </div>
      {done && (
        <div className="mt-6 text-center">
          <p className="mb-3 text-gold font-bold">🎉 Todos os pares! +90 pts</p>
          <button
            onClick={() => {
              setMatched([]);
              setFlipped([]);
              setRound((r) => r + 1);
            }}
            className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-2 font-bold text-forest-deep"
          >
            <RefreshCw className="h-4 w-4" /> Jogar de novo
          </button>
        </div>
      )}
    </div>
  );
}

/* ============ 3. LACUNA ============ */
function FillGame({ onScore }: { onScore: (n: number) => void }) {
  const [i, setI] = useState(0);
  const [answered, setAnswered] = useState<null | boolean>(null);
  const q = FILL_QUESTIONS[i];

  const choose = (opt: string) => {
    if (answered !== null) return;
    const ok = opt === q.answer;
    setAnswered(ok);
    if (ok) onScore(20);
  };

  const next = () => {
    setAnswered(null);
    setI((n) => (n + 1) % FILL_QUESTIONS.length);
  };

  return (
    <div className="text-center">
      <h3 className="mb-4 text-xl font-bold text-gold">Complete a frase em Patxôhã</h3>
      <p className="mb-6 text-2xl font-serif">{q.sentence}</p>
      <div className="mx-auto flex max-w-md flex-wrap justify-center gap-3">
        {q.options.map((opt) => (
          <button
            key={opt}
            onClick={() => choose(opt)}
            className={`rounded-xl px-6 py-3 font-bold transition ${
              answered !== null && opt === q.answer
                ? "bg-leaf text-cream"
                : answered === false && opt !== q.answer
                ? "bg-white/10 opacity-50"
                : "bg-white/10 hover:bg-gold hover:text-forest-deep"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      {answered !== null && (
        <div className="mt-6">
          <p className={`mb-3 font-bold ${answered ? "text-leaf" : "text-red-400"}`}>
            {answered ? (
              <span className="inline-flex items-center gap-2"><Check className="h-5 w-5" /> Correto! +20 pts</span>
            ) : (
              <span className="inline-flex items-center gap-2"><X className="h-5 w-5" /> Resposta: {q.answer}</span>
            )}
          </p>
          <button onClick={next} className="rounded-full bg-gold px-6 py-2 font-bold text-forest-deep">
            Próxima →
          </button>
        </div>
      )}
    </div>
  );
}

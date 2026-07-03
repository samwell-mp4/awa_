import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { Gamepad2, Trophy, RefreshCw, Check, X, Sparkles, BookOpen, Puzzle, PencilLine } from "lucide-react";

export const Route = createFileRoute("/jogos")({
  head: () => ({
    meta: [
      { title: "Jogos Awã Tech — Aprenda Patxôhã brincando" },
      { name: "description", content: "Jogos culturais Pataxó: memória, ligação de palavras e complete a frase em Patxôhã." },
      { property: "og:title", content: "Jogos Awã Tech" },
      { property: "og:description", content: "Aprenda Patxôhã brincando com jogos culturais Pataxó." },
    ],
  }),
  component: JogosPage,
});

// Vocabulário Patxôhã com explicações culturais
const VOCAB: { px: string; pt: string; nota: string }[] = [
  { px: "Awã", pt: "Nós", nota: "Marca a coletividade — o nosso povo." },
  { px: "Pataxó", pt: "Nosso povo", nota: "Nome do povo originário do sul da Bahia." },
  { px: "Tupã", pt: "Espírito do céu", nota: "Força criadora que habita o alto." },
  { px: "Yby", pt: "Terra", nota: "A mãe que sustenta e alimenta." },
  { px: "Y", pt: "Água", nota: "Vida que corre nos rios sagrados." },
  { px: "Kwaracy", pt: "Sol", nota: "Ilumina o dia e guia o plantio." },
  { px: "Jaci", pt: "Lua", nota: "Marca o tempo e os rituais da noite." },
  { px: "Tatá", pt: "Fogo", nota: "O fogo sagrado que reúne a aldeia." },
  { px: "Sy", pt: "Mãe", nota: "Origem, cuidado e proteção." },
  { px: "Txopai", pt: "Pai", nota: "Guardião e provedor da família." },
  { px: "Kunumi", pt: "Criança", nota: "Futuro do povo, aprende ouvindo os anciãos." },
  { px: "Katu", pt: "Bom / Bem", nota: "Usado em saudações e bênçãos." },
  { px: "Djahatã", pt: "Bom dia", nota: "Saudação ao amanhecer." },
  { px: "Ramã", pt: "Como / assim", nota: "Aparece em perguntas do dia a dia." },
];

const SYMBOLS = [
  { emoji: "🏹", label: "Arco e Flecha", nota: "Caça e proteção do território." },
  { emoji: "🔥", label: "Fogo Sagrado", nota: "Reúne a aldeia nas noites de reza." },
  { emoji: "🌿", label: "Urucum", nota: "Tinta vermelha da pintura corporal." },
  { emoji: "🪶", label: "Cocar", nota: "Símbolo de sabedoria e liderança." },
  { emoji: "🥁", label: "Maracá", nota: "Chama os espíritos no ritual." },
  { emoji: "🌳", label: "Mata Atlântica", nota: "Casa e farmácia do povo Pataxó." },
];

const FILL_QUESTIONS = [
  { sentence: "____ pataxó (Nós somos pataxó).", answer: "Awã", options: ["Awã", "Tupã", "Yby"], nota: "Awã = Nós, coletividade do povo." },
  { sentence: "____ é a nossa mãe terra.", answer: "Yby", options: ["Y", "Yby", "Tatá"], nota: "Yby = Terra, sustento da vida." },
  { sentence: "O ____ ilumina o dia.", answer: "Kwaracy", options: ["Jaci", "Kwaracy", "Tupã"], nota: "Kwaracy = Sol." },
  { sentence: "A ____ ilumina a noite.", answer: "Jaci", options: ["Jaci", "Sy", "Y"], nota: "Jaci = Lua, marca os rituais." },
  { sentence: "Bebemos ____ do rio.", answer: "Y", options: ["Y", "Tatá", "Awã"], nota: "Y = Água, vida sagrada." },
  { sentence: "____ ramã? (Como vai você?)", answer: "Awã", options: ["Awã", "Katu", "Sy"], nota: "Saudação comum entre parentes." },
];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

const URUCUM = "#972C20";

function JogosPage() {
  const [tab, setTab] = useState<"match" | "memoria" | "lacuna">("match");
  const [score, setScore] = useState(0);

  const tabs = [
    { id: "match" as const, label: "Ligação", icon: BookOpen },
    { id: "memoria" as const, label: "Memória", icon: Puzzle },
    { id: "lacuna" as const, label: "Lacuna", icon: PencilLine },
  ];

  return (
    <div className="min-h-screen bg-[var(--gradient-forest)] text-cream">
      <div className="mx-auto max-w-5xl px-4 py-8 md:py-14">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/20 text-gold">
            <Gamepad2 className="h-8 w-8" />
          </div>
          <h1 className="font-serif text-3xl md:text-5xl font-bold">Jogos Awã Tech</h1>
          <p className="mt-3 text-cream/80 px-2">Aprenda Patxôhã brincando 🌿 — jogos culturais do povo Pataxó.</p>
          <div
            className="mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 font-bold text-cream shadow-lg"
            style={{ background: URUCUM }}
          >
            <Trophy className="h-4 w-4 text-gold" /> <span>{score} pontos</span>
          </div>
        </div>

        {/* Navegação em botões grandes, mobile-first */}
        <div className="mb-6 grid grid-cols-3 gap-2 md:flex md:justify-center md:gap-3">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 rounded-2xl px-3 py-3 md:px-6 md:py-3 text-sm md:text-base font-bold transition ${
                  active
                    ? "bg-gold text-forest-deep shadow-lg scale-[1.02]"
                    : "bg-white/10 text-cream hover:bg-white/20"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        <div className="rounded-3xl bg-black/30 p-4 md:p-8 backdrop-blur border-2 border-gold/30 shadow-2xl">
          {tab === "match" && <MatchGame onScore={(n) => setScore((s) => s + n)} />}
          {tab === "memoria" && <MemoryGame onScore={(n) => setScore((s) => s + n)} />}
          {tab === "lacuna" && <FillGame onScore={(n) => setScore((s) => s + n)} />}
        </div>

        <p className="mt-6 text-center text-xs text-cream/60">
          Todos os jogos são gratuitos 🌱 — cortesia do povo Pataxó para as próximas gerações.
        </p>
      </div>
    </div>
  );
}

/* ============ 1. LIGAÇÃO ============ */
function MatchGame({ onScore }: { onScore: (n: number) => void }) {
  const [round, setRound] = useState(0);
  const pool = useMemo(() => shuffle(VOCAB).slice(0, 4), [round]);
  const shuffledPt = useMemo(() => shuffle(pool.map((p) => p.pt)), [pool]);
  const [selectedPx, setSelectedPx] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [lastNota, setLastNota] = useState<string | null>(null);

  const handlePt = (pt: string) => {
    if (!selectedPx) return;
    const item = pool.find((p) => p.px === selectedPx);
    const correct = item?.pt === pt;
    if (correct && item) {
      setMatches((m) => ({ ...m, [selectedPx]: pt }));
      setLastNota(`${item.px} = ${item.pt}. ${item.nota}`);
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
      <h3 className="mb-2 text-center text-lg md:text-xl font-bold text-gold">
        Ligue Patxôhã → Português
      </h3>
      <p className="mb-4 text-center text-xs text-cream/60">Toque numa palavra à esquerda e depois no significado.</p>
      <div className="grid gap-3 md:gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-gold/80">Patxôhã</p>
          {pool.map((p) => {
            const matched = !!matches[p.px];
            const selected = selectedPx === p.px;
            const err = errors[p.px];
            return (
              <button
                key={p.px}
                disabled={matched}
                onClick={() => setSelectedPx(p.px)}
                className={`w-full rounded-xl px-4 py-4 text-left font-semibold transition min-h-[52px] ${
                  matched
                    ? "bg-leaf/40 text-cream line-through opacity-60"
                    : err
                    ? "bg-red-500/40"
                    : selected
                    ? "bg-gold text-forest-deep scale-[1.02]"
                    : "bg-white/10 hover:bg-white/20"
                }`}
                style={!matched && !selected && !err ? { borderLeft: `4px solid ${URUCUM}` } : undefined}
              >
                {p.px}
              </button>
            );
          })}
        </div>
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-gold/80">Português</p>
          {shuffledPt.map((pt) => {
            const used = Object.values(matches).includes(pt);
            return (
              <button
                key={pt}
                disabled={used || !selectedPx}
                onClick={() => handlePt(pt)}
                className={`w-full rounded-xl px-4 py-4 text-left font-semibold transition min-h-[52px] ${
                  used ? "bg-leaf/40 line-through opacity-60" : "bg-white/10 hover:bg-white/20 disabled:opacity-50"
                }`}
              >
                {pt}
              </button>
            );
          })}
        </div>
      </div>

      {lastNota && !done && (
        <div className="mt-4 rounded-xl border border-gold/30 bg-gold/10 p-3 text-sm text-cream/90">
          <Sparkles className="mr-2 inline h-4 w-4 text-gold" />
          {lastNota}
        </div>
      )}

      {done && (
        <div className="mt-6 text-center">
          <p className="mb-3 text-gold font-bold text-lg">🎉 Rodada completa! +40 pts</p>
          <p className="mb-4 text-sm text-cream/70">Você conhece bem o nosso idioma!</p>
          <button
            onClick={() => {
              setMatches({});
              setLastNota(null);
              setRound((r) => r + 1);
            }}
            className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 font-bold text-forest-deep"
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
  const [lastNota, setLastNota] = useState<string | null>(null);

  useEffect(() => {
    if (flipped.length === 2) {
      const [a, b] = flipped;
      if (cards[a].label === cards[b].label) {
        setMatched((m) => [...m, cards[a].label]);
        setLastNota(`${cards[a].emoji} ${cards[a].label} — ${cards[a].nota}`);
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
      <h3 className="mb-2 text-center text-lg md:text-xl font-bold text-gold">
        Memória Cultural Pataxó
      </h3>
      <p className="mb-4 text-center text-xs text-cream/60">Encontre os pares de símbolos sagrados.</p>
      <div className="grid grid-cols-3 gap-2 md:grid-cols-4 md:gap-3">
        {cards.map((c, i) => {
          const show = flipped.includes(i) || matched.includes(c.label);
          return (
            <button
              key={c.id}
              onClick={() => handle(i)}
              className={`aspect-square rounded-xl text-center font-bold transition ${
                show
                  ? "bg-gold/90 text-forest-deep"
                  : "border-2 border-gold/30"
              }`}
              style={!show ? { background: URUCUM } : undefined}
            >
              {show ? (
                <div className="flex h-full flex-col items-center justify-center p-1">
                  <div className="text-2xl md:text-4xl">{c.emoji}</div>
                  <div className="mt-1 text-[9px] md:text-xs leading-tight">{c.label}</div>
                </div>
              ) : (
                <Sparkles className="mx-auto h-6 w-6 text-gold/70" />
              )}
            </button>
          );
        })}
      </div>

      {lastNota && !done && (
        <div className="mt-4 rounded-xl border border-gold/30 bg-gold/10 p-3 text-sm text-cream/90">
          {lastNota}
        </div>
      )}

      {done && (
        <div className="mt-6 text-center">
          <p className="mb-3 text-gold font-bold text-lg">🎉 Todos os pares! +90 pts</p>
          <button
            onClick={() => {
              setMatched([]);
              setFlipped([]);
              setLastNota(null);
              setRound((r) => r + 1);
            }}
            className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 font-bold text-forest-deep"
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
      <h3 className="mb-2 text-lg md:text-xl font-bold text-gold">Complete a frase em Patxôhã</h3>
      <p className="mb-6 text-cream/60 text-xs">Frase {i + 1} de {FILL_QUESTIONS.length}</p>
      <p className="mb-6 text-xl md:text-2xl font-serif px-2">{q.sentence}</p>
      <div className="mx-auto flex max-w-md flex-wrap justify-center gap-2 md:gap-3">
        {q.options.map((opt) => {
          const isAnswer = answered !== null && opt === q.answer;
          const isWrongPicked = answered === false && opt !== q.answer;
          return (
            <button
              key={opt}
              onClick={() => choose(opt)}
              className={`rounded-xl px-5 py-3 md:px-6 md:py-3 font-bold transition min-w-[90px] ${
                isAnswer
                  ? "bg-leaf text-cream"
                  : isWrongPicked
                  ? "bg-white/10 opacity-50"
                  : "bg-white/10 hover:bg-gold hover:text-forest-deep"
              }`}
              style={answered === null ? { borderBottom: `3px solid ${URUCUM}` } : undefined}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {answered !== null && (
        <div className="mt-6">
          <p className={`mb-2 font-bold ${answered ? "text-leaf" : "text-red-400"}`}>
            {answered ? (
              <span className="inline-flex items-center gap-2"><Check className="h-5 w-5" /> Correto! +20 pts</span>
            ) : (
              <span className="inline-flex items-center gap-2"><X className="h-5 w-5" /> Resposta: {q.answer}</span>
            )}
          </p>
          <p className="mb-4 text-sm text-cream/70 px-3">{q.nota}</p>
          <button onClick={next} className="rounded-full bg-gold px-6 py-3 font-bold text-forest-deep">
            Próxima →
          </button>
        </div>
      )}
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Gamepad2, Trophy, RefreshCw, Check, X, Sparkles, BookOpen, Puzzle, PencilLine } from "lucide-react";
import { speak } from "@/lib/speak";
import { SiteHeader } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";

export const Route = createFileRoute("/jogos")({
  head: () => ({
    meta: [
      { title: "Jogos Culturais Patxôhã — AWÃ TECH" },
      { name: "description", content: "Jogos culturais Pataxó: memória, ligação de palavras e complete a frase em Patxôhã." },
      { property: "og:title", content: "Jogos Culturais Patxôhã — AWÃ TECH" },
      { property: "og:description", content: "Aprenda Patxôhã brincando com jogos culturais do povo Pataxó." },
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

function JogosPage() {
  const [tab, setTab] = useState<"match" | "memoria" | "lacuna">("match");
  const [score, setScore] = useState(0);

  const tabs = [
    { id: "match" as const, label: "Ligação", desc: "Ligue palavras Patxôhã ao português.", icon: BookOpen },
    { id: "memoria" as const, label: "Memória", desc: "Encontre os pares de cartas.", icon: Puzzle },
    { id: "lacuna" as const, label: "Lacuna", desc: "Complete a frase com a palavra certa.", icon: PencilLine },
  ];

  return (
    <div className="min-h-screen bg-[#f7f6f2] text-[#1f2937]">
      <SiteHeader mode="adulto" />

      <main className="mx-auto max-w-4xl px-4 py-8 md:py-12">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-[#e8e4dc] bg-white text-[#1b4332] shadow-xs">
            <Gamepad2 className="h-7 w-7" />
          </div>
          <h1 className="font-display text-3xl font-black text-[#11231b] md:text-5xl">
            Jogos Culturais Patxôhã
          </h1>
          <p className="mt-2 text-sm md:text-base text-[#4b5563] px-2">
            Aprenda Patxôhã praticando — jogos de memória, associação e vocabulário ancestral.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#1b4332] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-xs">
            <Trophy className="h-4 w-4 text-[#e9c46a]" />
            <span>{score} pontos acumulados</span>
          </div>
        </div>

        {/* Abas */}
        <div className="mb-6 grid grid-cols-3 gap-2 md:flex md:justify-center md:gap-3">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  speak(`${t.label}. ${t.desc}`, "pt-BR");
                  setTab(t.id);
                }}
                className={`flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 rounded-2xl px-3 py-3 md:px-6 md:py-3 text-xs md:text-sm font-bold transition shadow-xs ${
                  active
                    ? "bg-[#1b4332] text-white"
                    : "border border-[#e8e4dc] bg-white text-[#4b5563] hover:border-[#1b4332]/50 hover:text-[#11231b]"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        <div className="rounded-3xl border border-[#e8e4dc] bg-white p-5 md:p-8 shadow-xs">
          {tab === "match" && <MatchGame onScore={(n) => setScore((s) => s + n)} />}
          {tab === "memoria" && <MemoryGame onScore={(n) => setScore((s) => s + n)} />}
          {tab === "lacuna" && <FillGame onScore={(n) => setScore((s) => s + n)} />}
        </div>

        <p className="mt-6 text-center text-xs font-semibold text-[#6b7280]">
          Recurso cultural e pedagógico gratuito para o aprendizado e fortalecimento da língua Patxôhã.
        </p>
      </main>

      <SiteFooter mode="adulto" />
    </div>
  );
}

/* ============ 1. LIGAÇÃO ============ */
function MatchGame({ onScore }: { onScore: (n: number) => void }) {
  const [round, setRound] = useState(0);
  const [pool, setPool] = useState(() => VOCAB.slice(0, 4));
  const [shuffledPt, setShuffledPt] = useState(() => VOCAB.slice(0, 4).map((p) => p.pt));

  useEffect(() => {
    const p = shuffle(VOCAB).slice(0, 4);
    setPool(p);
    setShuffledPt(shuffle(p.map((x) => x.pt)));
  }, [round]);

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
      <h3 className="mb-1 text-center font-display text-lg md:text-xl font-black text-[#11231b]">
        Ligue Patxôhã → Português
      </h3>
      <p className="mb-6 text-center text-xs text-[#6b7280]">
        Selecione uma palavra em Patxôhã e em seguida o seu significado em português.
      </p>

      <div className="grid gap-4 md:gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider font-bold text-[#1b4332]">Patxôhã</p>
          {pool.map((p) => {
            const matched = !!matches[p.px];
            const selected = selectedPx === p.px;
            const err = errors[p.px];
            return (
              <button
                key={p.px}
                disabled={matched}
                onClick={() => setSelectedPx(p.px)}
                className={`w-full rounded-2xl px-4 py-3.5 text-left font-bold transition min-h-[52px] border ${
                  matched
                    ? "border-[#1b4332]/30 bg-[#1b4332]/10 text-[#1b4332] line-through opacity-60"
                    : err
                    ? "border-rose-400 bg-rose-50 text-rose-700 animate-shake"
                    : selected
                    ? "border-[#1b4332] bg-[#1b4332] text-white shadow-xs"
                    : "border-[#e8e4dc] bg-[#fbfaf7] text-[#11231b] hover:border-[#1b4332]/50 hover:bg-white"
                }`}
              >
                {p.px}
              </button>
            );
          })}
        </div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider font-bold text-[#b47e28]">Português</p>
          {shuffledPt.map((pt) => {
            const used = Object.values(matches).includes(pt);
            return (
              <button
                key={pt}
                disabled={used || !selectedPx}
                onClick={() => handlePt(pt)}
                className={`w-full rounded-2xl px-4 py-3.5 text-left font-semibold transition min-h-[52px] border ${
                  used
                    ? "border-[#1b4332]/30 bg-[#1b4332]/10 text-[#1b4332] line-through opacity-60"
                    : "border-[#e8e4dc] bg-[#fbfaf7] text-[#11231b] hover:border-[#1b4332]/50 hover:bg-white disabled:opacity-40"
                }`}
              >
                {pt}
              </button>
            );
          })}
        </div>
      </div>

      {lastNota && !done && (
        <div className="mt-5 rounded-2xl border border-[#b47e28]/30 bg-[#b47e28]/5 p-3.5 text-xs md:text-sm text-[#374151]">
          <Sparkles className="mr-2 inline h-4 w-4 text-[#b47e28]" />
          {lastNota}
        </div>
      )}

      {done && (
        <div className="mt-6 text-center">
          <p className="mb-2 font-display text-xl font-black text-[#1b4332]">🎉 Rodada completa! +40 pts</p>
          <p className="mb-4 text-xs md:text-sm text-[#4b5563]">Excelente conhecimento da língua!</p>
          <button
            onClick={() => {
              setMatches({});
              setLastNota(null);
              setRound((r) => r + 1);
            }}
            className="inline-flex items-center gap-2 rounded-full bg-[#1b4332] px-6 py-3 font-bold text-white hover:bg-[#2d6a4f] shadow-xs"
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
  const [cards, setCards] = useState(() => {
    const pick = SYMBOLS.slice(0, 6);
    return [...pick, ...pick].map((c, i) => ({ ...c, id: i }));
  });

  useEffect(() => {
    const pick = shuffle(SYMBOLS).slice(0, 6);
    setCards(shuffle([...pick, ...pick].map((c, i) => ({ ...c, id: i }))));
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

  const done = matched.length === 6;

  return (
    <div>
      <h3 className="mb-1 text-center font-display text-lg md:text-xl font-black text-[#11231b]">
        Memória Cultural Pataxó
      </h3>
      <p className="mb-6 text-center text-xs text-[#6b7280]">
        Encontre os pares dos símbolos e elementos sagrados.
      </p>

      <div className="grid grid-cols-3 gap-2.5 md:grid-cols-4 md:gap-3.5">
        {cards.map((c, i) => {
          const show = flipped.includes(i) || matched.includes(c.label);
          return (
            <button
              key={c.id}
              onClick={() => handle(i)}
              className={`aspect-square rounded-2xl text-center font-bold transition shadow-xs border ${
                show
                  ? "border-[#1b4332] bg-[#1b4332]/5 text-[#11231b]"
                  : "border-[#e8e4dc] bg-[#1b4332] text-white hover:bg-[#2d6a4f]"
              }`}
            >
              {show ? (
                <div className="flex h-full flex-col items-center justify-center p-2">
                  <div className="text-2xl md:text-4xl">{c.emoji}</div>
                  <div className="mt-1 text-[10px] md:text-xs font-bold leading-tight text-[#11231b]">
                    {c.label}
                  </div>
                </div>
              ) : (
                <Sparkles className="mx-auto h-6 w-6 text-[#e9c46a]" />
              )}
            </button>
          );
        })}
      </div>

      {lastNota && !done && (
        <div className="mt-5 rounded-2xl border border-[#b47e28]/30 bg-[#b47e28]/5 p-3.5 text-xs md:text-sm text-[#374151]">
          {lastNota}
        </div>
      )}

      {done && (
        <div className="mt-6 text-center">
          <p className="mb-2 font-display text-xl font-black text-[#1b4332]">🎉 Todos os pares encontrados! +90 pts</p>
          <p className="mb-4 text-xs md:text-sm text-[#4b5563]">Parabéns pelo domínio dos símbolos!</p>
          <button
            onClick={() => {
              setMatched([]);
              setFlipped([]);
              setLastNota(null);
              setRound((r) => r + 1);
            }}
            className="inline-flex items-center gap-2 rounded-full bg-[#1b4332] px-6 py-3 font-bold text-white hover:bg-[#2d6a4f] shadow-xs"
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
      <h3 className="mb-1 font-display text-lg md:text-xl font-black text-[#11231b]">
        Complete a frase em Patxôhã
      </h3>
      <p className="mb-6 text-xs text-[#6b7280]">
        Frase {i + 1} de {FILL_QUESTIONS.length}
      </p>

      <p className="mb-6 font-display text-xl md:text-2xl font-bold text-[#11231b] px-2">
        {q.sentence}
      </p>

      <div className="mx-auto flex max-w-md flex-wrap justify-center gap-2 md:gap-3">
        {q.options.map((opt) => {
          const isAnswer = answered !== null && opt === q.answer;
          const isWrongPicked = answered === false && opt !== q.answer;
          return (
            <button
              key={opt}
              onClick={() => choose(opt)}
              className={`rounded-2xl px-6 py-3.5 font-bold transition min-w-[90px] border shadow-xs ${
                isAnswer
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : isWrongPicked
                  ? "border-rose-300 bg-rose-50 text-rose-700 opacity-60"
                  : "border-[#e8e4dc] bg-[#fbfaf7] text-[#11231b] hover:border-[#1b4332] hover:bg-white"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {answered !== null && (
        <div className="mt-6">
          <p className={`mb-2 font-bold ${answered ? "text-emerald-700" : "text-rose-600"}`}>
            {answered ? (
              <span className="inline-flex items-center gap-2">
                <Check className="h-5 w-5" /> Correto! +20 pts
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <X className="h-5 w-5" /> Resposta correta: {q.answer}
              </span>
            )}
          </p>
          <p className="mb-4 text-xs md:text-sm text-[#4b5563] px-3 max-w-md mx-auto">{q.nota}</p>
          <button
            onClick={next}
            className="rounded-full bg-[#1b4332] px-6 py-3 font-bold text-white hover:bg-[#2d6a4f] shadow-xs"
          >
            Próxima frase →
          </button>
        </div>
      )}
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { RotateCcw, Star } from "lucide-react";
import { requireArea } from "@/lib/area-guard";
import { setLastArea } from "@/lib/last-area";
import { speak, stopSpeak } from "@/lib/speak";
import { KIDS_WORDS, KIDS_NUMBERS } from "@/lib/kids-data";
import { KidsPage, KidsCard } from "@/components/kids/kids-page";

export const Route = createFileRoute("/jogos-infantil")({
  ssr: false,
  beforeLoad: () => requireArea("infantil"),
  head: () => ({
    meta: [
      { title: "Jogos da Aldeia — Awã Tech Infantil" },
      {
        name: "description",
        content:
          "Joguinhos indígenas para crianças: memória da floresta, pares em Patxôhã e ordenar os números.",
      },
      { property: "og:title", content: "Jogos da Aldeia — Awã Tech Infantil" },
      {
        property: "og:description",
        content: "Brincar aprendendo Patxôhã: memória, pares de palavras e números.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: JogosInfantilPage,
});

type GameId = "memoria" | "pares" | "numeros";

const GAMES: { id: GameId; emoji: string; title: string; desc: string; bg: string }[] = [
  {
    id: "memoria",
    emoji: "🧠",
    title: "Memória da Floresta",
    desc: "Ache os pares iguais",
    bg: "from-[#2a9d8f] to-[#1c6f65]",
  },
  {
    id: "pares",
    emoji: "🗣️",
    title: "Pares Patxôhã",
    desc: "Ligue a palavra ao desenho",
    bg: "from-[#e76f51] to-[#c2452c]",
  },
  {
    id: "numeros",
    emoji: "🔢",
    title: "Ordene os Números",
    desc: "Do menor para o maior",
    bg: "from-[#e9c46a] to-[#c79a2f]",
  },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function JogosInfantilPage() {
  useEffect(() => setLastArea("/infantil"), []);
  useEffect(() => () => stopSpeak(), []);
  const [game, setGame] = useState<GameId | null>(null);
  const [stars, setStars] = useState(0);

  const win = (msg: string) => {
    setStars((s) => s + 1);
    speak(msg, "pt-BR", 1.05);
  };

  return (
    <KidsPage
      title="Jogos"
      subtitle="Escolha uma brincadeira"
      emoji="🎲"
      back={game ? undefined : "/infantil"}
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="inline-flex items-center gap-1 rounded-full border-[3px] border-[#e9c46a] bg-[#14503c] px-3 py-1.5 text-sm font-black text-[#ffe9b8]">
          <Star className="h-4 w-4 fill-current" /> {stars}
        </span>
        {game && (
          <button
            onClick={() => {
              stopSpeak();
              setGame(null);
            }}
            className="rounded-full border-[3px] border-[#e9c46a] bg-[#e76f51] px-4 py-1.5 text-xs font-black uppercase tracking-widest text-white"
          >
            Outros jogos
          </button>
        )}
      </div>

      {!game ? (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {GAMES.map((g) => (
            <li key={g.id}>
              <button
                onClick={() => setGame(g.id)}
                className={`flex w-full items-center gap-4 rounded-[1.75rem] border-[5px] border-[#fdfcf0] bg-gradient-to-br ${g.bg} p-4 text-left shadow-[0_12px_0_-4px_rgba(0,0,0,.4)] transition-transform active:translate-y-1 active:shadow-none md:flex-col md:items-start`}
              >
                <span aria-hidden className="text-4xl">
                  {g.emoji}
                </span>
                <span>
                  <span className="block font-display text-xl leading-tight text-[#fffdf5]">
                    {g.title}
                  </span>
                  <span className="block text-xs font-bold text-white/85">{g.desc}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <KidsCard className="p-4">
          {game === "memoria" && <MemoryGame onWin={() => win("Muito bem! Achou todos os pares!")} />}
          {game === "pares" && <PairsGame onWin={() => win("Isso! Você ligou todas as palavras!")} />}
          {game === "numeros" && <NumbersGame onWin={() => win("Perfeito! Números na ordem certa!")} />}
        </KidsCard>
      )}
    </KidsPage>
  );
}

/* ---------------- Memória da Floresta ---------------- */
function MemoryGame({ onWin }: { onWin: () => void }) {
  const [round, setRound] = useState(0);
  const deck = useMemo(() => {
    const picks = shuffle(KIDS_WORDS).slice(0, 4);
    return shuffle([...picks, ...picks].map((w, i) => ({ key: `${w.px}-${i}`, ...w })));
  }, [round]);

  const [open, setOpen] = useState<string[]>([]);
  const [done, setDone] = useState<string[]>([]);

  useEffect(() => {
    if (open.length !== 2) return;
    const [a, b] = open.map((k) => deck.find((c) => c.key === k)!);
    if (a.px === b.px) {
      setDone((d) => {
        const next = [...d, a.px];
        if (next.length === 4) onWin();
        return next;
      });
      speak(a.px, "pt-BR", 1);
      setOpen([]);
    } else {
      const t = setTimeout(() => setOpen([]), 700);
      return () => clearTimeout(t);
    }
  }, [open]);

  const reset = () => {
    setOpen([]);
    setDone([]);
    setRound((r) => r + 1);
  };

  return (
    <div>
      <div className="grid grid-cols-4 gap-2">
        {deck.map((c) => {
          const shown = open.includes(c.key) || done.includes(c.px);
          return (
            <button
              key={c.key}
              onClick={() => {
                if (shown || open.length === 2) return;
                setOpen((o) => [...o, c.key]);
              }}
              className={`grid aspect-square place-items-center rounded-2xl border-[4px] text-3xl transition-transform ${
                shown
                  ? "border-[#2a9d8f] bg-[#e6f4ec]"
                  : "border-[#123a2b] bg-[#14503c] text-transparent"
              }`}
            >
              <span aria-hidden>{shown ? c.emoji : "?"}</span>
            </button>
          );
        })}
      </div>
      <GameFooter label={`${done.length}/4 pares`} onReset={reset} />
    </div>
  );
}

/* ---------------- Pares Patxôhã ---------------- */
function PairsGame({ onWin }: { onWin: () => void }) {
  const [round, setRound] = useState(0);
  const picks = useMemo(() => shuffle(KIDS_WORDS).slice(0, 4), [round]);
  const emojis = useMemo(() => shuffle(picks), [picks]);
  const [sel, setSel] = useState<string | null>(null);
  const [ok, setOk] = useState<string[]>([]);

  const choose = (emoji: string) => {
    if (!sel) return;
    const word = picks.find((p) => p.px === sel)!;
    if (word.emoji === emoji) {
      const next = [...ok, word.px];
      setOk(next);
      speak(`${word.px} é ${word.pt}`, "pt-BR", 1);
      if (next.length === picks.length) onWin();
    }
    setSel(null);
  };

  const reset = () => {
    setOk([]);
    setSel(null);
    setRound((r) => r + 1);
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          {picks.map((p) => (
            <button
              key={p.px}
              disabled={ok.includes(p.px)}
              onClick={() => {
                setSel(p.px);
                speak(p.px, "pt-BR", 1);
              }}
              className={`rounded-2xl border-[4px] px-3 py-3 font-display text-lg ${
                ok.includes(p.px)
                  ? "border-[#2a9d8f] bg-[#e6f4ec] text-[#1c6f65]"
                  : sel === p.px
                    ? "border-[#e76f51] bg-[#fbe6de]"
                    : "border-[#123a2b] bg-[#fdfcf0]"
              }`}
            >
              {p.px}
            </button>
          ))}
        </div>
        <div className="grid gap-2">
          {emojis.map((p) => (
            <button
              key={p.emoji}
              disabled={ok.includes(p.px)}
              onClick={() => choose(p.emoji)}
              className={`grid place-items-center rounded-2xl border-[4px] py-2 text-3xl ${
                ok.includes(p.px)
                  ? "border-[#2a9d8f] bg-[#e6f4ec]"
                  : "border-[#123a2b] bg-[#fdfcf0]"
              }`}
            >
              <span aria-hidden>{p.emoji}</span>
            </button>
          ))}
        </div>
      </div>
      <GameFooter label={`${ok.length}/${picks.length} pares`} onReset={reset} />
    </div>
  );
}

/* ---------------- Ordene os Números ---------------- */
function NumbersGame({ onWin }: { onWin: () => void }) {
  const [round, setRound] = useState(0);
  const target = useMemo(() => {
    const start = Math.floor(Math.random() * 6);
    return KIDS_NUMBERS.slice(start, start + 5);
  }, [round]);
  const pool = useMemo(() => shuffle(target), [target]);
  const [seq, setSeq] = useState<number[]>([]);

  const tap = (n: number) => {
    const expected = target[seq.length];
    if (expected.n !== n) {
      speak("Tenta de novo!", "pt-BR", 1.05);
      setSeq([]);
      return;
    }
    const next = [...seq, n];
    setSeq(next);
    speak(expected.pt, "pt-BR", 1.05);
    if (next.length === target.length) onWin();
  };

  const reset = () => {
    setSeq([]);
    setRound((r) => r + 1);
  };

  return (
    <div>
      <div className="mb-3 flex min-h-14 items-center justify-center gap-2 rounded-2xl border-[4px] border-dashed border-[#e9c46a] bg-[#f2ead6] p-2">
        {seq.length === 0 ? (
          <span className="text-xs font-black uppercase tracking-widest text-[#3f6b57]">
            Toque do menor para o maior
          </span>
        ) : (
          seq.map((n) => (
            <span
              key={n}
              className="grid h-10 w-10 place-items-center rounded-xl bg-[#2a9d8f] font-display text-xl text-white"
            >
              {n}
            </span>
          ))
        )}
      </div>
      <div className="grid grid-cols-5 gap-2">
        {pool.map((p) => (
          <button
            key={p.n}
            disabled={seq.includes(p.n)}
            onClick={() => tap(p.n)}
            className={`grid aspect-square place-items-center rounded-2xl border-[4px] font-display text-2xl ${
              seq.includes(p.n)
                ? "border-[#2a9d8f] bg-[#e6f4ec] text-[#1c6f65]"
                : "border-[#123a2b] bg-[#fdfcf0]"
            }`}
          >
            {p.n}
          </button>
        ))}
      </div>
      <GameFooter label={`${seq.length}/${target.length}`} onReset={reset} />
    </div>
  );
}

function GameFooter({ label, onReset }: { label: string; onReset: () => void }) {
  return (
    <div className="mt-4 flex items-center justify-between">
      <span className="text-xs font-black uppercase tracking-widest text-[#3f6b57]">
        {label}
      </span>
      <button
        onClick={onReset}
        className="inline-flex items-center gap-1.5 rounded-full border-[3px] border-[#123a2b] bg-[#e9c46a] px-3 py-1.5 text-xs font-black uppercase tracking-widest text-[#123a2b]"
      >
        <RotateCcw className="h-3.5 w-3.5" /> Nova rodada
      </button>
    </div>
  );
}

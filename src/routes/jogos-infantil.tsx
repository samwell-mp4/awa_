import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, RefreshCw, Sparkles, Star, Trophy } from "lucide-react";
import { T } from "@/components/T";
import bg from "@/assets/jogos-infantil-bg.jpg.asset.json";

export const Route = createFileRoute("/jogos-infantil")({
  head: () => ({
    meta: [
      { title: "Jogos Awã Tech Infantil — Brincar e Aprender" },
      {
        name: "description",
        content:
          "Menu de jogos infantis do Awã Tech: memória da floresta, pares de palavras Patxôhã e caça aos bichos da aldeia.",
      },
      { property: "og:title", content: "Jogos Awã Tech Infantil" },
      {
        property: "og:description",
        content: "Menu divertido de jogos em Patxôhã para crianças.",
      },
    ],
  }),
  component: JogosInfantilPage,
});

type GameId = "memoria" | "pares" | "caca";

const GAMES: {
  id: GameId;
  emoji: string;
  title: string;
  desc: string;
  color: string;
}[] = [
  {
    id: "memoria",
    emoji: "🧠",
    title: "Memória da Floresta",
    desc: "Ache os pares de bichos e plantas.",
    color: "from-emerald-400 to-emerald-600",
  },
  {
    id: "pares",
    emoji: "🗣️",
    title: "Pares Patxôhã",
    desc: "Ligue a palavra ao desenho certo.",
    color: "from-amber-400 to-orange-500",
  },
  {
    id: "caca",
    emoji: "🎯",
    title: "Caça aos Bichos",
    desc: "Toque no bichinho antes que ele suma!",
    color: "from-sky-400 to-indigo-500",
  },
];

function JogosInfantilPage() {
  const [game, setGame] = useState<GameId | null>(null);
  const [stars, setStars] = useState(0);

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat text-emerald-950"
      style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.55), rgba(255,255,255,0.75)), url(${bg.url})`,
      }}
    >
      <header className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
        <Link
          to="/infantil"
          className="inline-flex items-center gap-1 rounded-full bg-white/80 px-3 py-2 text-sm font-black uppercase text-emerald-800 shadow"
        >
          <ArrowLeft className="h-4 w-4" /> <T>Aldeia</T>
        </Link>
        <div className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-3 py-2 text-sm font-black text-emerald-900 shadow">
          <Star className="h-4 w-4" /> {stars}
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-16">
        <div className="text-center">
          <div className="mx-auto mb-3 inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-white shadow-lg">
            <Trophy className="h-8 w-8 text-amber-500" />
          </div>
          <h1 className="font-display text-3xl font-black uppercase tracking-wide text-emerald-900 md:text-5xl">
            <T>Jogos Awã Tech</T>
          </h1>
          <p className="mt-2 text-emerald-800/80">
            <T>Escolha um jogo e vamos brincar na aldeia!</T> 🌿
          </p>
        </div>

        {!game && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {GAMES.map((g) => (
              <button
                key={g.id}
                onClick={() => setGame(g.id)}
                className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${g.color} p-5 text-left text-white shadow-xl transition hover:-translate-y-1 hover:shadow-2xl`}
              >
                <div className="text-5xl drop-shadow">{g.emoji}</div>
                <div className="mt-3 font-display text-lg font-black uppercase tracking-wide">
                  <T>{g.title}</T>
                </div>
                <div className="mt-1 text-sm text-white/90"><T>{g.desc}</T></div>
                <Sparkles className="absolute right-3 top-3 h-5 w-5 text-white/70 transition group-hover:scale-125" />
              </button>
            ))}
          </div>
        )}

        {game && (
          <div className="mt-8 rounded-3xl border-4 border-white bg-white/80 p-4 shadow-xl md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <button
                onClick={() => setGame(null)}
                className="inline-flex items-center gap-1 rounded-full bg-emerald-800 px-3 py-2 text-xs font-black uppercase text-white shadow"
              >
                <ArrowLeft className="h-4 w-4" /> <T>Menu</T>
              </button>
              <span className="font-display text-lg font-black uppercase text-emerald-900">
                <T>{GAMES.find((g) => g.id === game)?.title ?? ""}</T>
              </span>
            </div>
            {game === "memoria" && <MemoryGame onWin={() => setStars((s) => s + 3)} />}
            {game === "pares" && <PairsGame onWin={() => setStars((s) => s + 2)} />}
            {game === "caca" && <CatchGame onScore={() => setStars((s) => s + 1)} />}
          </div>
        )}
      </main>
    </div>
  );
}

/* ---------------- Memória ---------------- */
const MEM = ["🦜", "🐒", "🐢", "🐆", "🌿", "🌺"];
function MemoryGame({ onWin }: { onWin: () => void }) {
  const [round, setRound] = useState(0);
  const cards = useMemo(
    () =>
      [...MEM, ...MEM]
        .map((v) => ({ v, k: Math.random() }))
        .sort((a, b) => a.k - b.k),
    [round]
  );
  const [flip, setFlip] = useState<number[]>([]);
  const [done, setDone] = useState<string[]>([]);

  useEffect(() => {
    if (flip.length === 2) {
      const [a, b] = flip;
      if (cards[a].v === cards[b].v) {
        setDone((d) => [...d, cards[a].v]);
        setFlip([]);
      } else {
        const t = setTimeout(() => setFlip([]), 700);
        return () => clearTimeout(t);
      }
    }
  }, [flip, cards]);

  useEffect(() => {
    if (done.length === MEM.length) onWin();
  }, [done, onWin]);

  return (
    <div>
      <div className="grid grid-cols-4 gap-2 md:gap-3">
        {cards.map((c, i) => {
          const show = flip.includes(i) || done.includes(c.v);
          return (
            <button
              key={i}
              onClick={() =>
                !show && flip.length < 2 && setFlip((f) => [...f, i])
              }
              className={`aspect-square rounded-2xl text-4xl transition ${
                show
                  ? "bg-amber-200"
                  : "bg-emerald-600 text-transparent hover:bg-emerald-700"
              }`}
            >
              {show ? c.v : "?"}
            </button>
          );
        })}
      </div>
      {done.length === MEM.length && (
        <div className="mt-4 text-center">
          <p className="font-black text-emerald-700">🎉 <T>Você achou todos!</T></p>
          <button
            onClick={() => {
              setDone([]);
              setFlip([]);
              setRound((r) => r + 1);
            }}
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-700 px-5 py-2 font-black text-white"
          >
            <RefreshCw className="h-4 w-4" /> <T>Jogar de novo</T>
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------------- Pares Patxôhã ---------------- */
const PAIRS = [
  { px: "Y", emoji: "💧", pt: "Água" },
  { px: "Tatá", emoji: "🔥", pt: "Fogo" },
  { px: "Kwaracy", emoji: "☀️", pt: "Sol" },
  { px: "Jaci", emoji: "🌙", pt: "Lua" },
];
function PairsGame({ onWin }: { onWin: () => void }) {
  const [round, setRound] = useState(0);
  const words = useMemo(() => [...PAIRS].sort(() => Math.random() - 0.5), [round]);
  const emojis = useMemo(() => [...PAIRS].sort(() => Math.random() - 0.5), [round]);
  const [sel, setSel] = useState<string | null>(null);
  const [ok, setOk] = useState<string[]>([]);

  const pick = (e: string) => {
    if (!sel) return;
    const good = PAIRS.find((p) => p.px === sel)?.emoji === e;
    if (good) {
      setOk((o) => [...o, sel]);
      if (ok.length + 1 === PAIRS.length) onWin();
    }
    setSel(null);
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-2">
        {words.map((w) => {
          const done = ok.includes(w.px);
          const active = sel === w.px;
          return (
            <button
              key={w.px}
              disabled={done}
              onClick={() => setSel(w.px)}
              className={`w-full rounded-2xl px-3 py-4 text-left font-black uppercase transition ${
                done
                  ? "bg-emerald-200 line-through text-emerald-800/60"
                  : active
                  ? "bg-amber-400 text-emerald-900"
                  : "bg-white text-emerald-800 hover:bg-amber-100"
              }`}
            >
              {w.px}
              <span className="ml-2 text-xs opacity-70">({w.pt})</span>
            </button>
          );
        })}
      </div>
      <div className="space-y-2">
        {emojis.map((e) => {
          const done = ok.includes(e.px);
          return (
            <button
              key={e.emoji}
              disabled={done}
              onClick={() => pick(e.emoji)}
              className={`w-full rounded-2xl px-3 py-4 text-4xl transition ${
                done ? "bg-emerald-200 opacity-50" : "bg-white hover:bg-sky-100"
              }`}
            >
              {e.emoji}
            </button>
          );
        })}
      </div>
      {ok.length === PAIRS.length && (
        <div className="col-span-2 text-center">
          <p className="font-black text-emerald-700">🌟 Todos os pares!</p>
          <button
            onClick={() => {
              setOk([]);
              setRound((r) => r + 1);
            }}
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-700 px-5 py-2 font-black text-white"
          >
            <RefreshCw className="h-4 w-4" /> De novo
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------------- Caça aos Bichos ---------------- */
const BICHOS = ["🦜", "🐢", "🦋", "🐒", "🦌", "🐸"];
function CatchGame({ onScore }: { onScore: () => void }) {
  const [pos, setPos] = useState({ x: 50, y: 50, e: "🦜" });
  const [hits, setHits] = useState(0);
  const [time, setTime] = useState(20);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setTime((s) => {
        if (s <= 1) {
          setRunning(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running]);

  const move = () => {
    setPos({
      x: Math.random() * 80 + 5,
      y: Math.random() * 70 + 10,
      e: BICHOS[Math.floor(Math.random() * BICHOS.length)],
    });
  };

  const hit = () => {
    setHits((h) => h + 1);
    onScore();
    move();
  };

  return (
    <div>
      <div className="mb-2 flex justify-between font-black text-emerald-800">
        <span>⏱️ {time}s</span>
        <span>🎯 {hits}</span>
      </div>
      <div className="relative h-64 overflow-hidden rounded-2xl bg-gradient-to-b from-sky-300 to-emerald-400 md:h-80">
        {running && time > 0 && (
          <button
            onClick={hit}
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 text-5xl transition hover:scale-125"
          >
            {pos.e}
          </button>
        )}
        {!running && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/30 text-white">
            {time === 0 && (
              <p className="font-display text-2xl font-black">
                Fim! Você pegou {hits} bichinhos 🌟
              </p>
            )}
            <button
              onClick={() => {
                setHits(0);
                setTime(20);
                setRunning(true);
                move();
              }}
              className="rounded-full bg-amber-400 px-6 py-3 font-black uppercase text-emerald-900 shadow-lg"
            >
              {time === 0 ? "Jogar de novo" : "Começar!"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

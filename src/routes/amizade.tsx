import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Heart, RefreshCw, Sparkles, Star } from "lucide-react";
import bg from "@/assets/jogos-infantil-bg.jpg.asset.json";
import { KidsForestScene } from "@/components/kids/forest-scene";

export const Route = createFileRoute("/amizade")({
  head: () => ({
    meta: [
      { title: "Amizade Awã Tech Infantil — Brincar entre amigos" },
      {
        name: "description",
        content:
          "Jogos de amizade em Patxôhã: cumprimente amigos, encontre pares de carinho e forme a roda da aldeia.",
      },
      { property: "og:title", content: "Amizade Awã Tech Infantil" },
      {
        property: "og:description",
        content: "Menu divertido de jogos de amizade em Patxôhã para crianças.",
      },
    ],
  }),
  component: AmizadePage,
});

type GameId = "cumprimento" | "pares" | "roda";

const GAMES: {
  id: GameId;
  emoji: string;
  title: string;
  desc: string;
  color: string;
}[] = [
  {
    id: "cumprimento",
    emoji: "👋",
    title: "Cumprimente o Amigo",
    desc: "Escolha a saudação certa para o momento.",
    color: "from-rose-400 to-pink-600",
  },
  {
    id: "pares",
    emoji: "💛",
    title: "Palavras de Carinho",
    desc: "Ligue a palavra Patxôhã ao gesto amigo.",
    color: "from-amber-400 to-orange-500",
  },
  {
    id: "roda",
    emoji: "🤝",
    title: "Roda da Amizade",
    desc: "Toque em cada amigo e diga Aria!",
    color: "from-emerald-400 to-teal-600",
  },
];

function AmizadePage() {
  const [game, setGame] = useState<GameId | null>(null);
  const [stars, setStars] = useState(0);

  return (
    <div
      className="kids-theme min-h-screen bg-cover bg-center bg-no-repeat text-emerald-950"
      style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.55), rgba(255,255,255,0.75)), url(${bg.url})`,
      }}
    >
      <KidsForestScene />
      <header className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">

        <Link
          to="/infantil"
          className="inline-flex items-center gap-1 rounded-full bg-white/80 px-3 py-2 text-sm font-black uppercase text-emerald-800 shadow"
        >
          <ArrowLeft className="h-4 w-4" /> Aldeia
        </Link>
        <div className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-3 py-2 text-sm font-black text-emerald-900 shadow">
          <Star className="h-4 w-4" /> {stars}
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-16">
        <div className="text-center">
          <div className="mx-auto mb-3 inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-white shadow-lg">
            <Heart className="h-8 w-8 text-rose-500" />
          </div>
          <h1 className="font-display text-3xl font-black uppercase tracking-wide text-emerald-900 md:text-5xl">
            Amizade Awã Tech
          </h1>
          <p className="mt-2 text-emerald-800/80">
            Vamos brincar de fazer amigos na aldeia! 🌿
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
                  {g.title}
                </div>
                <div className="mt-1 text-sm text-white/90">{g.desc}</div>
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
                <ArrowLeft className="h-4 w-4" /> Menu
              </button>
              <span className="font-display text-lg font-black uppercase text-emerald-900">
                {GAMES.find((g) => g.id === game)?.title}
              </span>
            </div>
            {game === "cumprimento" && (
              <GreetGame onWin={() => setStars((s) => s + 3)} />
            )}
            {game === "pares" && <PairsGame onWin={() => setStars((s) => s + 2)} />}
            {game === "roda" && <CircleGame onScore={() => setStars((s) => s + 1)} />}
          </div>
        )}
      </main>
    </div>
  );
}

/* ---------------- Cumprimente o Amigo ---------------- */
const GREETINGS = [
  { emoji: "🌅", pt: "De manhã", correct: "Aria hê" },
  { emoji: "☀️", pt: "De tarde", correct: "Aria kohó" },
  { emoji: "🌙", pt: "De noite", correct: "Aria pytuna" },
  { emoji: "🤗", pt: "Ao encontrar um amigo", correct: "Aria, djohó!" },
];
const OPTIONS = ["Aria hê", "Aria kohó", "Aria pytuna", "Aria, djohó!"];

function GreetGame({ onWin }: { onWin: () => void }) {
  const [round, setRound] = useState(0);
  const [idx, setIdx] = useState(0);
  const [hits, setHits] = useState(0);
  const list = useMemo(
    () => [...GREETINGS].sort(() => Math.random() - 0.5),
    [round]
  );
  const opts = useMemo(
    () => [...OPTIONS].sort(() => Math.random() - 0.5),
    [round, idx]
  );
  const current = list[idx];
  const done = idx >= list.length;

  useEffect(() => {
    if (done && hits === list.length) onWin();
  }, [done, hits, list.length, onWin]);

  if (done) {
    return (
      <div className="text-center">
        <p className="font-display text-xl font-black text-emerald-800">
          Você acertou {hits} de {list.length} 🌟
        </p>
        <button
          onClick={() => {
            setIdx(0);
            setHits(0);
            setRound((r) => r + 1);
          }}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-700 px-5 py-2 font-black text-white"
        >
          <RefreshCw className="h-4 w-4" /> Jogar de novo
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-2xl bg-gradient-to-br from-rose-100 to-amber-100 p-6 text-center">
        <div className="text-6xl">{current.emoji}</div>
        <p className="mt-2 font-display text-lg font-black uppercase text-emerald-900">
          {current.pt}
        </p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {opts.map((o) => (
          <button
            key={o}
            onClick={() => {
              if (o === current.correct) setHits((h) => h + 1);
              setIdx((i) => i + 1);
            }}
            className="rounded-2xl bg-white px-3 py-4 font-black uppercase text-emerald-800 shadow hover:bg-amber-100"
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Palavras de Carinho ---------------- */
const PAIRS = [
  { px: "Aria", emoji: "👋", pt: "Olá" },
  { px: "Djohó", emoji: "🤝", pt: "Amigo" },
  { px: "Ãhy", emoji: "🎁", pt: "Presente" },
  { px: "Awê", emoji: "❤️", pt: "Amor" },
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
          <p className="font-black text-emerald-700">💛 Todos os carinhos!</p>
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

/* ---------------- Roda da Amizade ---------------- */
const FRIENDS = ["🧒🏽", "👧🏽", "👦🏾", "🧒🏾", "👧🏻", "👦🏽"];

function CircleGame({ onScore }: { onScore: () => void }) {
  const [greeted, setGreeted] = useState<number[]>([]);
  const complete = greeted.length === FRIENDS.length;

  return (
    <div>
      <p className="text-center text-sm font-bold uppercase text-emerald-800">
        Toque em cada amigo e diga Aria!
      </p>
      <div className="relative mx-auto mt-4 aspect-square max-w-sm">
        {FRIENDS.map((f, i) => {
          const angle = (i / FRIENDS.length) * Math.PI * 2 - Math.PI / 2;
          const x = 50 + Math.cos(angle) * 38;
          const y = 50 + Math.sin(angle) * 38;
          const done = greeted.includes(i);
          return (
            <button
              key={i}
              onClick={() => {
                if (done) return;
                setGreeted((g) => [...g, i]);
                onScore();
              }}
              style={{ left: `${x}%`, top: `${y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 grid h-16 w-16 place-items-center rounded-full text-4xl shadow-lg transition ${
                done ? "bg-emerald-300 scale-110" : "bg-white hover:scale-110"
              }`}
            >
              {f}
            </button>
          );
        })}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-400 px-4 py-2 font-black uppercase text-emerald-900 shadow">
          {complete ? "Aria!" : `${greeted.length}/${FRIENDS.length}`}
        </div>
      </div>
      {complete && (
        <div className="mt-4 text-center">
          <p className="font-black text-emerald-700">🤝 Roda completa!</p>
          <button
            onClick={() => setGreeted([])}
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-700 px-5 py-2 font-black text-white"
          >
            <RefreshCw className="h-4 w-4" /> De novo
          </button>
        </div>
      )}
    </div>
  );
}

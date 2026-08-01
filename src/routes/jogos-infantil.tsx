import { createFileRoute, Link } from "@tanstack/react-router";
import { requireArea } from "@/lib/area-guard";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Eraser, Palette, RefreshCw, Sparkles, Star, Trophy, Volume2 } from "lucide-react";
import { T } from "@/components/T";
import { speak } from "@/lib/speak";
import bg from "@/assets/jogos-infantil-bg.jpg.asset.json";
import { SiteHeader } from "@/components/home/site-header";

/** Botão de áudio reutilizável — toca a palavra em voz alta. */
function SpeakBtn({
  text,
  lang = "pt-BR",
  className = "",
  label = "Ouvir",
}: {
  text: string;
  lang?: string;
  className?: string;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        speak(text, lang);
      }}
      aria-label={`${label}: ${text}`}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white shadow hover:bg-emerald-700 active:scale-95 ${className}`}
    >
      <Volume2 className="h-4 w-4" />
    </button>
  );
}

export const Route = createFileRoute("/jogos-infantil")({
  ssr: false,
  beforeLoad: () => requireArea("infantil"),
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

type GameId =
  | "memoria"
  | "pares"
  | "caca"
  | "acerte"
  | "ordenar"
  | "cores"
  | "adivinhe"
  | "colorir"
  | "en-animals"
  | "en-colors"
  | "en-numbers";

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
  {
    id: "acerte",
    emoji: "🎯",
    title: "Acerte a Palavra",
    desc: "Veja a figura e toque na palavra certa.",
    color: "from-fuchsia-400 to-purple-600",
  },
  {
    id: "ordenar",
    emoji: "🧮",
    title: "Ordene os Números",
    desc: "Coloque os números do menor ao maior.",
    color: "from-teal-400 to-cyan-600",
  },
  {
    id: "cores",
    emoji: "🌈",
    title: "Junte a Cor ao Nome",
    desc: "Toque na cor certa para cada nome.",
    color: "from-rose-400 to-red-500",
  },
  {
    id: "adivinhe",
    emoji: "🦜",
    title: "Adivinhe o Bicho",
    desc: "Ouça a dica e escolha o bichinho!",
    color: "from-lime-400 to-green-600",
  },
  {
    id: "colorir",
    emoji: "🎨",
    title: "Desenhar e Colorir",
    desc: "Pinte símbolos e bichos da aldeia.",
    color: "from-orange-400 to-amber-600",
  },
];

const EN_GAMES: {
  id: GameId;
  emoji: string;
  title: string;
  desc: string;
  color: string;
  pairs: { en: string; emoji: string; pt: string }[];
}[] = [
  {
    id: "en-animals",
    emoji: "🐾",
    title: "Animals in English",
    desc: "Match the animal to its English name.",
    color: "from-lime-400 to-emerald-600",
    pairs: [
      { en: "Dog", emoji: "🐶", pt: "Cachorro" },
      { en: "Cat", emoji: "🐱", pt: "Gato" },
      { en: "Bird", emoji: "🐦", pt: "Pássaro" },
      { en: "Fish", emoji: "🐟", pt: "Peixe" },
    ],
  },
  {
    id: "en-colors",
    emoji: "🎨",
    title: "Colors in English",
    desc: "Tap the correct color name.",
    color: "from-pink-400 to-rose-600",
    pairs: [
      { en: "Red", emoji: "🟥", pt: "Vermelho" },
      { en: "Blue", emoji: "🟦", pt: "Azul" },
      { en: "Yellow", emoji: "🟨", pt: "Amarelo" },
      { en: "Green", emoji: "🟩", pt: "Verde" },
    ],
  },
  {
    id: "en-numbers",
    emoji: "🔢",
    title: "Numbers in English",
    desc: "Match the number to its English word.",
    color: "from-sky-400 to-blue-600",
    pairs: [
      { en: "One", emoji: "1️⃣", pt: "Um" },
      { en: "Two", emoji: "2️⃣", pt: "Dois" },
      { en: "Three", emoji: "3️⃣", pt: "Três" },
      { en: "Four", emoji: "4️⃣", pt: "Quatro" },
    ],
  },
];

function JogosInfantilPage() {
  const [game, setGame] = useState<GameId | null>(null);
  const [stars, setStars] = useState(0);

  return (
    <div
      className="kids-theme min-h-screen bg-cover bg-center bg-no-repeat text-emerald-950"
      style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.55), rgba(255,255,255,0.75)), url(${bg.url})`,
      }}
    >
      <SiteHeader mode="infantil" />

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
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {GAMES.map((g) => (
                <button
                  key={g.id}
                  onClick={() => {
                    speak(`${g.title}. ${g.desc}`, "pt-BR");
                    setGame(g.id);
                  }}
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

            <div className="mt-10 flex items-center gap-3">
              <span className="text-3xl">🇺🇸</span>
              <div>
                <h2 className="font-display text-2xl font-black uppercase tracking-wide text-emerald-900 md:text-3xl">
                  <T>Jogos em Inglês</T>
                </h2>
                <p className="text-sm text-emerald-800/80">
                  <T>Aprenda inglês brincando!</T>
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {EN_GAMES.map((g) => (
                <button
                  key={g.id}
                  onClick={() => {
                    speak(`${g.title}. ${g.desc}`, "en-US");
                    setGame(g.id);
                  }}
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
          </>
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
                {(() => {
                  const en = EN_GAMES.find((g) => g.id === game);
                  if (en) return en.title;
                  const pt = GAMES.find((g) => g.id === game)?.title ?? "";
                  return <T>{pt}</T>;
                })()}
              </span>
            </div>
            {game === "memoria" && <MemoryGame onWin={() => setStars((s) => s + 3)} />}
            {game === "pares" && <PairsGame onWin={() => setStars((s) => s + 2)} />}
            {game === "caca" && <CatchGame onScore={() => setStars((s) => s + 1)} />}
            {game === "acerte" && <AcertePalavraGame onWin={() => setStars((s) => s + 1)} />}
            {game === "ordenar" && <OrdenarNumerosGame onWin={() => setStars((s) => s + 2)} />}
            {game === "cores" && <CoresGame onWin={() => setStars((s) => s + 2)} />}
            {game === "adivinhe" && <AdivinheBichoGame onWin={() => setStars((s) => s + 1)} />}
            {game === "colorir" && <ColorirCanvas />}
            {EN_GAMES.filter((g) => g.id === game).map((g) => (
              <EnglishPairsGame key={g.id} pairs={g.pairs} onWin={() => setStars((s) => s + 2)} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

/* ---------------- Memória ---------------- */
const MEM = ["🦜", "🐒", "🐢", "🐆", "🌿", "🌺"];
const MEM_NAMES: Record<string, string> = {
  "🦜": "Arara",
  "🐒": "Macaco",
  "🐢": "Tartaruga",
  "🐆": "Onça",
  "🌿": "Folha",
  "🌺": "Flor",
};
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
              onClick={() => {
                if (show || flip.length >= 2) return;
                speak(MEM_NAMES[c.v] ?? "", "pt-BR");
                setFlip((f) => [...f, i]);
              }}
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
            <div key={w.px} className="flex items-center gap-2">
              <button
                disabled={done}
                onClick={() => {
                  setSel(w.px);
                  speak(w.px, "pt-BR");
                }}
                className={`flex-1 rounded-2xl px-3 py-4 text-left font-black uppercase transition ${
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
              {!done && <SpeakBtn text={w.px} />}
            </div>
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
          <p className="font-black text-emerald-700">🌟 <T>Todos os pares!</T></p>
          <button
            onClick={() => {
              setOk([]);
              setRound((r) => r + 1);
            }}
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-700 px-5 py-2 font-black text-white"
          >
            <RefreshCw className="h-4 w-4" /> <T>De novo</T>
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
                <T>Fim! Você pegou</T> {hits} <T>bichinhos</T> 🌟
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
              <T>{time === 0 ? "Jogar de novo" : "Começar!"}</T>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- English Pairs ---------------- */
function EnglishPairsGame({
  pairs,
  onWin,
}: {
  pairs: { en: string; emoji: string; pt: string }[];
  onWin: () => void;
}) {
  const [round, setRound] = useState(0);
  const words = useMemo(() => [...pairs].sort(() => Math.random() - 0.5), [round, pairs]);
  const emojis = useMemo(() => [...pairs].sort(() => Math.random() - 0.5), [round, pairs]);
  const [sel, setSel] = useState<string | null>(null);
  const [ok, setOk] = useState<string[]>([]);

  const pick = (emoji: string) => {
    if (!sel) return;
    const good = pairs.find((p) => p.en === sel)?.emoji === emoji;
    if (good) {
      setOk((o) => [...o, sel]);
      if (ok.length + 1 === pairs.length) onWin();
    }
    setSel(null);
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-2">
        {words.map((w) => {
          const done = ok.includes(w.en);
          const active = sel === w.en;
          return (
            <div key={w.en} className="flex items-center gap-2">
              <button
                disabled={done}
                onClick={() => {
                  setSel(w.en);
                  speak(w.en, "en-US");
                }}
                className={`flex-1 rounded-2xl px-3 py-4 text-left font-black uppercase transition ${
                  done
                    ? "bg-emerald-200 line-through text-emerald-800/60"
                    : active
                    ? "bg-amber-400 text-emerald-900"
                    : "bg-white text-emerald-800 hover:bg-amber-100"
                }`}
              >
                {w.en}
                <span className="ml-2 text-xs opacity-70">({w.pt})</span>
              </button>
              {!done && <SpeakBtn text={w.en} lang="en-US" />}
            </div>
          );
        })}
      </div>
      <div className="space-y-2">
        {emojis.map((e) => {
          const done = ok.includes(e.en);
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
      {ok.length === pairs.length && (
        <div className="col-span-2 text-center">
          <p className="font-black text-emerald-700">🌟 <T>Muito bem! All correct!</T></p>
          <button
            onClick={() => {
              setOk([]);
              setRound((r) => r + 1);
            }}
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-700 px-5 py-2 font-black text-white"
          >
            <RefreshCw className="h-4 w-4" /> <T>De novo</T>
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------------- Acerte a Palavra (imagem → palavra) ---------------- */
const ACERTE = [
  { emoji: "☀️", answer: "Kwaracy", options: ["Kwaracy", "Jaci", "Tatá"] },
  { emoji: "🌙", answer: "Jaci", options: ["Y", "Jaci", "Kwaracy"] },
  { emoji: "🔥", answer: "Tatá", options: ["Tatá", "Yby", "Jaci"] },
  { emoji: "💧", answer: "Y", options: ["Y", "Tatá", "Awã"] },
  { emoji: "🌍", answer: "Yby", options: ["Yby", "Jaci", "Y"] },
  { emoji: "👩", answer: "Sy", options: ["Txopai", "Sy", "Kunumi"] },
  { emoji: "👨", answer: "Txopai", options: ["Sy", "Kunumi", "Txopai"] },
  { emoji: "🧒", answer: "Kunumi", options: ["Kunumi", "Sy", "Awã"] },
];
function AcertePalavraGame({ onWin }: { onWin: () => void }) {
  const [i, setI] = useState(0);
  const [state, setState] = useState<null | "ok" | "err">(null);
  const q = ACERTE[i];
  const choose = (o: string) => {
    if (state) return;
    if (o === q.answer) {
      setState("ok");
      onWin();
    } else setState("err");
  };
  const next = () => {
    setState(null);
    setI((n) => (n + 1) % ACERTE.length);
  };
  return (
    <div className="text-center">
      <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-100 to-emerald-100 text-8xl shadow-inner">
        {q.emoji}
      </div>
      <p className="mt-3 font-black text-emerald-800"><T>Qual é a palavra?</T> <SpeakBtn text={q.answer} className="ml-1 align-middle" /></p>
      <div className="mx-auto mt-4 flex max-w-md flex-wrap justify-center gap-2">
        {q.options.map((o) => {
          const isRight = state && o === q.answer;
          const isWrong = state === "err" && o !== q.answer;
          return (
            <button
              key={o}
              onClick={() => {
                speak(o, "pt-BR");
                choose(o);
              }}
              className={`min-w-[110px] rounded-2xl px-5 py-3 font-black uppercase transition ${
                isRight
                  ? "bg-emerald-500 text-white"
                  : isWrong
                  ? "bg-white/60 text-emerald-800/60"
                  : "bg-white text-emerald-800 hover:bg-amber-200"
              }`}
            >
              {o}
            </button>
          );
        })}
      </div>
      {state && (
        <button
          onClick={next}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-3 font-black text-white"
        >
          <T>Próximo</T> →
        </button>
      )}
    </div>
  );
}

/* ---------------- Ordene os Números ---------------- */
function OrdenarNumerosGame({ onWin }: { onWin: () => void }) {
  const [round, setRound] = useState(0);
  const target = useMemo(() => {
    const start = 1 + Math.floor(Math.random() * 5);
    return Array.from({ length: 5 }, (_, i) => start + i);
  }, [round]);
  const [pool, setPool] = useState<number[]>([]);
  const [seq, setSeq] = useState<number[]>([]);
  useEffect(() => {
    setPool([...target].sort(() => Math.random() - 0.5));
    setSeq([]);
  }, [target]);
  const pick = (n: number) => {
    speak(String(n), "pt-BR");
    setPool((p) => p.filter((x) => x !== n));
    setSeq((s) => [...s, n]);
  };
  const reset = () => {
    setPool([...target].sort(() => Math.random() - 0.5));
    setSeq([]);
  };
  const done = seq.length === target.length;
  const correct = done && seq.every((n, i) => n === target[i]);
  useEffect(() => {
    if (correct) onWin();
  }, [correct, onWin]);
  return (
    <div className="text-center">
      <p className="font-black text-emerald-800"><T>Toque nos números do menor ao maior</T></p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {seq.map((n, i) => (
          <span
            key={i}
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-2xl font-black text-white shadow"
          >
            {n}
          </span>
        ))}
        {seq.length < target.length &&
          Array.from({ length: target.length - seq.length }).map((_, i) => (
            <span
              key={"e" + i}
              className="flex h-14 w-14 items-center justify-center rounded-2xl border-4 border-dashed border-emerald-300 text-2xl font-black text-emerald-300"
            >
              ?
            </span>
          ))}
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {pool.map((n) => (
          <button
            key={n}
            onClick={() => pick(n)}
            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-300 text-3xl font-black text-emerald-900 shadow hover:scale-110"
          >
            {n}
          </button>
        ))}
      </div>
      {done && (
        <div className="mt-5">
          <p className={`font-black ${correct ? "text-emerald-700" : "text-rose-600"}`}>
            {correct ? "🎉 " : "😅 "}
            <T>{correct ? "Você acertou tudo!" : "Quase! Tente de novo."}</T>
          </p>
          <button
            onClick={() => (correct ? setRound((r) => r + 1) : reset())}
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-700 px-5 py-2 font-black text-white"
          >
            <RefreshCw className="h-4 w-4" /> <T>{correct ? "Nova rodada" : "Tentar de novo"}</T>
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------------- Junte a Cor ao Nome ---------------- */
const CORES = [
  { name: "Vermelho", hex: "#e11d48" },
  { name: "Azul", hex: "#2563eb" },
  { name: "Amarelo", hex: "#facc15" },
  { name: "Verde", hex: "#16a34a" },
  { name: "Roxo", hex: "#7c3aed" },
  { name: "Laranja", hex: "#f97316" },
];
function CoresGame({ onWin }: { onWin: () => void }) {
  const [round, setRound] = useState(0);
  const shuffled = useMemo(() => [...CORES].sort(() => Math.random() - 0.5), [round]);
  const [i, setI] = useState(0);
  const [feedback, setFeedback] = useState<null | "ok" | "err">(null);
  const target = shuffled[i];
  const opts = useMemo(() => {
    const others = CORES.filter((c) => c.name !== target?.name)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    return [target, ...others].sort(() => Math.random() - 0.5);
  }, [target]);
  useEffect(() => {
    if (target?.name) speak(target.name, "pt-BR");
  }, [target?.name]);
  const pick = (hex: string) => {
    if (feedback) return;
    if (hex === target.hex) {
      setFeedback("ok");
      if (i === shuffled.length - 1) onWin();
      setTimeout(() => {
        setFeedback(null);
        setI((n) => (n + 1) % shuffled.length);
      }, 700);
    } else {
      setFeedback("err");
      setTimeout(() => setFeedback(null), 600);
    }
  };
  return (
    <div className="text-center">
      <p className="text-sm font-black text-emerald-700">
        <T>Rodada</T> {i + 1} / {shuffled.length}
      </p>
      <p className="mt-2 font-display text-3xl font-black uppercase text-emerald-900">
        {target.name}
        <SpeakBtn text={target.name} className="ml-2 align-middle" />
      </p>
      <div className="mx-auto mt-6 grid max-w-md grid-cols-2 gap-3">
        {opts.map((o) => (
          <button
            key={o.hex}
            onClick={() => pick(o.hex)}
            className={`h-20 rounded-2xl shadow-lg transition hover:scale-105 ${
              feedback === "ok" && o.hex === target.hex ? "ring-4 ring-emerald-500" : ""
            } ${feedback === "err" && o.hex !== target.hex ? "" : ""}`}
            style={{ backgroundColor: o.hex }}
            aria-label={o.name}
          />
        ))}
      </div>
      {i === shuffled.length - 1 && feedback === "ok" && (
        <button
          onClick={() => setRound((r) => r + 1)}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-700 px-5 py-2 font-black text-white"
        >
          <RefreshCw className="h-4 w-4" /> <T>De novo</T>
        </button>
      )}
    </div>
  );
}

/* ---------------- Adivinhe o Bicho ---------------- */
const ADIV = [
  { emoji: "🦜", name: "Arara", hint: "Voa e tem penas coloridas." },
  { emoji: "🐢", name: "Tartaruga", hint: "Anda devagar e tem casco." },
  { emoji: "🐆", name: "Onça", hint: "Tem pintas e é a rainha da mata." },
  { emoji: "🐒", name: "Macaco", hint: "Pula de galho em galho." },
  { emoji: "🐍", name: "Cobra", hint: "Rasteja pelo chão da floresta." },
  { emoji: "🦋", name: "Borboleta", hint: "Nasce da lagarta e tem asas." },
  { emoji: "🐸", name: "Sapo", hint: "Vive perto do rio e pula." },
];
function AdivinheBichoGame({ onWin }: { onWin: () => void }) {
  const [i, setI] = useState(0);
  const [state, setState] = useState<null | "ok" | "err">(null);
  const q = ADIV[i];
  const opts = useMemo(() => {
    const others = ADIV.filter((a) => a.name !== q.name)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    return [q, ...others].sort(() => Math.random() - 0.5);
  }, [i]);
  useEffect(() => {
    if (q?.hint) speak(q.hint, "pt-BR");
  }, [i]);
  const choose = (n: string) => {
    if (state) return;
    if (n === q.name) {
      setState("ok");
      onWin();
    } else setState("err");
  };
  const next = () => {
    setState(null);
    setI((n) => (n + 1) % ADIV.length);
  };
  return (
    <div className="text-center">
      <div className="mx-auto max-w-md rounded-3xl bg-gradient-to-br from-emerald-100 to-sky-100 p-6 shadow-inner">
        <p className="text-2xl">🕵️‍♂️</p>
        <p className="mt-2 font-black text-emerald-900"><T>{q.hint}</T> <SpeakBtn text={q.hint} className="ml-1 align-middle" /></p>
      </div>
      <div className="mx-auto mt-5 grid max-w-md grid-cols-2 gap-3">
        {opts.map((o) => {
          const isRight = state && o.name === q.name;
          const isWrong = state === "err" && o.name !== q.name;
          return (
            <button
              key={o.name}
              onClick={() => choose(o.name)}
              className={`flex items-center gap-2 rounded-2xl px-4 py-3 font-black uppercase transition ${
                isRight
                  ? "bg-emerald-500 text-white"
                  : isWrong
                  ? "bg-white/60 text-emerald-800/60"
                  : "bg-white text-emerald-800 hover:bg-amber-200"
              }`}
            >
              <span className="text-3xl">{o.emoji}</span>
              <T>{o.name}</T>
            </button>
          );
        })}
      </div>
      {state && (
        <button
          onClick={next}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-3 font-black text-white"
        >
          <T>Próximo</T> →
        </button>
      )}
    </div>
  );
}

/* ---------------- Desenhar e Colorir ---------------- */
const COLORIR_TEMPLATES = [
  { id: "arara", label: "Arara", emoji: "🦜" },
  { id: "onca", label: "Onça", emoji: "🐆" },
  { id: "tartaruga", label: "Tartaruga", emoji: "🐢" },
  { id: "cocar", label: "Cocar", emoji: "🪶" },
  { id: "grafismo", label: "Grafismo", emoji: "🔺" },
  { id: "maraca", label: "Maracá", emoji: "🥁" },
];
const COLORIR_PALETTE = [
  "#111827", "#e11d48", "#f97316", "#facc15",
  "#16a34a", "#0ea5e9", "#7c3aed", "#f5f5f4",
  "#78350f", "#ec4899",
];
function ColorirCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [color, setColor] = useState("#e11d48");
  const [size, setSize] = useState(8);
  const [erase, setErase] = useState(false);
  const [tpl, setTpl] = useState(COLORIR_TEMPLATES[0]);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.font = `${Math.floor(c.width * 0.55)}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = "#065f46";
    ctx.fillText(tpl.emoji, c.width / 2, c.height / 2);
    ctx.globalAlpha = 1;
  }, [tpl]);

  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current!;
    const r = c.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * c.width,
      y: ((e.clientY - r.top) / r.height) * c.height,
    };
  };
  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
    drawing.current = true;
    last.current = point(e);
  };
  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const c = canvasRef.current!;
    const ctx = c.getContext("2d")!;
    const p = point(e);
    const l = last.current ?? p;
    ctx.strokeStyle = erase ? "#ffffff" : color;
    ctx.lineWidth = erase ? size * 2 : size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(l.x, l.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
  };
  const end = () => {
    drawing.current = false;
    last.current = null;
  };
  const clear = () => {
    const c = canvasRef.current!;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.font = `${Math.floor(c.width * 0.55)}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = "#065f46";
    ctx.fillText(tpl.emoji, c.width / 2, c.height / 2);
    ctx.globalAlpha = 1;
  };

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="font-black text-emerald-800"><T>Desenho:</T></span>
        {COLORIR_TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => setTpl(t)}
            className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm font-black uppercase transition ${
              tpl.id === t.id
                ? "bg-emerald-700 text-white"
                : "bg-white text-emerald-800 hover:bg-amber-100"
            }`}
          >
            <span>{t.emoji}</span>
            <T>{t.label}</T>
          </button>
        ))}
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Palette className="h-4 w-4 text-emerald-800" />
        {COLORIR_PALETTE.map((c) => (
          <button
            key={c}
            onClick={() => {
              setErase(false);
              setColor(c);
            }}
            className={`h-8 w-8 rounded-full border-2 transition ${
              !erase && color === c
                ? "border-emerald-800 scale-110"
                : "border-white shadow"
            }`}
            style={{ backgroundColor: c }}
            aria-label={c}
          />
        ))}
        <button
          onClick={() => setErase((v) => !v)}
          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-black uppercase transition ${
            erase ? "bg-emerald-700 text-white" : "bg-white text-emerald-800"
          }`}
        >
          <Eraser className="h-4 w-4" /> <T>Borracha</T>
        </button>
        <label className="ml-2 flex items-center gap-2 text-xs font-black text-emerald-800">
          <T>Tamanho</T>
          <input
            type="range"
            min={2}
            max={30}
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
          />
        </label>
        <button
          onClick={clear}
          className="ml-auto inline-flex items-center gap-1 rounded-full bg-rose-500 px-3 py-1 text-sm font-black uppercase text-white"
        >
          <RefreshCw className="h-4 w-4" /> <T>Limpar</T>
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
        className="w-full touch-none rounded-2xl border-4 border-white bg-white shadow-inner"
        style={{ aspectRatio: "4 / 3" }}
      />
      <p className="mt-2 text-center text-xs text-emerald-800/70">
        <T>Pinte o desenho tocando na tela.</T> 🎨
      </p>
    </div>
  );
}

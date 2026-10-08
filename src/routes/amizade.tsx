import { createFileRoute, Link } from "@tanstack/react-router";
import { requireArea } from "@/lib/area-guard";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Heart, RefreshCw, Sparkles, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { speak } from "@/lib/speak";
import kidsBg from "@/assets/kids-menu-bg.jpg";
import { SiteHeader } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";

export const Route = createFileRoute("/amizade")({
  ssr: false,
  beforeLoad: () => requireArea("infantil"),
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
}[] = [
  {
    id: "cumprimento",
    emoji: "👋",
    title: "Cumprimente o Amigo",
    desc: "Escolha a saudação certa para o momento.",
  },
  {
    id: "pares",
    emoji: "💛",
    title: "Palavras de Carinho",
    desc: "Ligue a palavra Patxôhã ao gesto amigo.",
  },
  {
    id: "roda",
    emoji: "🤝",
    title: "Roda da Amizade",
    desc: "Toque em cada amigo e diga Aria!",
  },
];

import { PageHeader } from "@/components/education/page-header";

function AmizadePage() {
  const { t } = useTranslation();
  const [game, setGame] = useState<GameId | null>(null);
  const [stars, setStars] = useState(0);

  return (
    <div
      className="kids-theme relative min-h-screen text-[#fefae0] font-sans"
      style={{
        backgroundImage: `url(${kidsBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundAttachment: "fixed",
      }}
    >
      <div aria-hidden className="awa-bg-scrim pointer-events-none fixed inset-0" />

      <div className="relative z-10 flex min-h-screen flex-col justify-between">
        <div>
          <SiteHeader mode="infantil" />

          <main className="mx-auto max-w-5xl px-4 py-6 md:px-6">
            {!game ? (
              <>
                <PageHeader
                  breadcrumbs={[
                    { label: "Início", href: "/infantil" },
                    { label: "Amizade Awã" },
                  ]}
                  title="Amizade Awã"
                  description="Brinque de fazer amigos na aldeia com saudações, palavras de carinho e a grande roda de união."
                  badge={`⭐ ${stars} estrelas conquistadas`}
                />

                <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {GAMES.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => {
                        speak(`${g.title}. ${g.desc}`, "pt-BR");
                        setGame(g.id);
                      }}
                      className="awa-card-2 group relative overflow-hidden rounded-2xl p-5 text-left text-[#fefae0] shadow-md transition hover:-translate-y-1 hover:border-[#ffd166]/50"
                    >
                      <div className="text-4xl drop-shadow group-hover:scale-105 transition">{g.emoji}</div>
                      <div className="mt-3 font-display text-base font-black text-[#ffd166] group-hover:text-white transition">
                        {g.title}
                      </div>
                      <div className="mt-1 text-xs text-[#fefae0]/80 leading-relaxed">{g.desc}</div>
                      <Sparkles className="absolute right-3.5 top-3.5 h-4 w-4 text-[#ffd166]/40 transition group-hover:scale-125 group-hover:text-[#ffd166]" />
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="awa-card-1 mt-4 rounded-2xl p-5 shadow-2xl md:p-7 text-[#fefae0] border border-[#633916]">
                <div className="mb-5 flex items-center justify-between border-b border-[#633916] pb-3">
                  <button
                    onClick={() => setGame(null)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#633916] bg-[#251408] px-3.5 py-1.5 text-xs font-bold text-[#ffd166] hover:border-[#ffd166]"
                  >
                    <ArrowLeft className="h-4 w-4" /> Voltar aos Jogos
                  </button>
                  <span className="font-display text-base font-black text-[#ffd166]">
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

        <SiteFooter mode="infantil" />
      </div>
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
      <div className="text-center py-4">
        <p className="font-display text-2xl font-black text-[#ffd166]">
          Você acertou {hits} de {list.length}! 🌟
        </p>
        <button
          onClick={() => {
            setIdx(0);
            setHits(0);
            setRound((r) => r + 1);
          }}
          className="mt-4 inline-flex items-center gap-2 rounded-full border-b-2 border-[#2d6a4f] bg-gradient-to-r from-[#52b788] to-[#2d6a4f] px-6 py-2.5 font-black text-white shadow-lg transition hover:brightness-110 active:scale-95"
        >
          <RefreshCw className="h-4 w-4" /> Jogar de novo
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-2xl border-2 border-[#8d5b2d] bg-[#2a160a] p-6 text-center shadow-lg">
        <div className="text-6xl drop-shadow">{current.emoji}</div>
        <p className="mt-3 font-display text-xl font-black uppercase tracking-wider text-[#ffd166]">
          {current.pt}
        </p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {opts.map((o) => (
          <button
            key={o}
            onClick={() => {
              if (o === current.correct) setHits((h) => h + 1);
              setIdx((i) => i + 1);
            }}
            className="rounded-xl border-2 border-[#8d5b2d] bg-[#351d0d] px-4 py-4 font-black uppercase tracking-wide text-[#ffd166] shadow transition hover:border-[#ffd166] hover:bg-[#3d2210] active:scale-95"
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
      <div className="space-y-2.5">
        {words.map((w) => {
          const done = ok.includes(w.px);
          const active = sel === w.px;
          return (
            <button
              key={w.px}
              disabled={done}
              onClick={() => setSel(w.px)}
              className={`w-full rounded-xl border-2 px-4 py-3.5 text-left font-black uppercase transition ${
                done
                  ? "border-[#4ade80]/40 bg-[#1b4332]/50 line-through text-[#4ade80]/60"
                  : active
                    ? "border-[#ffd166] bg-gradient-to-r from-[#ffd166] to-[#f59e0b] text-[#2e180c] shadow-[0_0_12px_rgba(255,209,102,0.4)]"
                    : "border-[#8d5b2d] bg-[#2a160a] text-[#ffd166] hover:border-[#ffd166] hover:bg-[#351d0d]"
              }`}
            >
              {w.px}
              <span className="ml-2 text-xs opacity-75 font-normal">({w.pt})</span>
            </button>
          );
        })}
      </div>
      <div className="space-y-2.5">
        {emojis.map((e) => {
          const done = ok.includes(e.px);
          return (
            <button
              key={e.emoji}
              disabled={done}
              onClick={() => pick(e.emoji)}
              className={`w-full rounded-xl border-2 px-4 py-3.5 text-3xl transition ${
                done ? "border-[#4ade80]/40 bg-[#1b4332]/30 opacity-40" : "border-[#8d5b2d] bg-[#2a160a] hover:border-[#ffd166] hover:scale-[1.02]"
              }`}
            >
              {e.emoji}
            </button>
          );
        })}
      </div>
      {ok.length === PAIRS.length && (
        <div className="col-span-2 text-center py-3 border-t border-[#8d5b2d]/40 mt-2">
          <p className="font-display text-xl font-black text-[#ffd166]">💛 Todos os carinhos associados!</p>
          <button
            onClick={() => {
              setOk([]);
              setRound((r) => r + 1);
            }}
            className="mt-3 inline-flex items-center gap-2 rounded-full border-b-2 border-[#2d6a4f] bg-gradient-to-r from-[#52b788] to-[#2d6a4f] px-6 py-2.5 font-black text-white shadow-lg transition hover:brightness-110 active:scale-95"
          >
            <RefreshCw className="h-4 w-4" /> Jogar de novo
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
      <p className="text-center text-sm font-black uppercase tracking-wider text-[#ffd166]">
        Toque em cada amigo e diga Aria!
      </p>
      <div className="relative mx-auto mt-6 aspect-square max-w-sm rounded-full border-2 border-dashed border-[#8d5b2d]/50 p-4">
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
              className={`absolute -translate-x-1/2 -translate-y-1/2 grid h-16 w-16 place-items-center rounded-full border-2 text-4xl shadow-xl transition active:scale-95 ${
                done
                  ? "border-[#4ade80] bg-[#1b4332] scale-110 shadow-[0_0_15px_rgba(74,222,128,0.5)]"
                  : "border-[#8d5b2d] bg-[#2a160a] hover:scale-110 hover:border-[#ffd166]"
              }`}
            >
              {f}
            </button>
          );
        })}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#f59e0b] bg-[#2a160a]/90 px-4 py-2 font-display text-base font-black uppercase text-[#ffd166] shadow-lg">
          {complete ? "Aria! 🎉" : `${greeted.length}/${FRIENDS.length}`}
        </div>
      </div>
      {complete && (
        <div className="mt-6 text-center border-t border-[#8d5b2d]/40 pt-4">
          <p className="font-display text-xl font-black text-[#ffd166]">🤝 Roda completa!</p>
          <button
            onClick={() => setGreeted([])}
            className="mt-3 inline-flex items-center gap-2 rounded-full border-b-2 border-[#2d6a4f] bg-gradient-to-r from-[#52b788] to-[#2d6a4f] px-6 py-2.5 font-black text-white shadow-lg transition hover:brightness-110 active:scale-95"
          >
            <RefreshCw className="h-4 w-4" /> Jogar de novo
          </button>
        </div>
      )}
    </div>
  );
}

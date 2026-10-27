import { createFileRoute, Link } from "@tanstack/react-router";
import { requireArea } from "@/lib/area-guard";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Heart, RefreshCw, Sparkles, Star, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { speak } from "@/lib/speak";
import kidsCharacter from "@/assets/kids-menu-character.png";
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
  badge: string;
}[] = [
  {
    id: "cumprimento",
    emoji: "👋",
    title: "Cumprimente o Amigo",
    desc: "Escolha a saudação certa em Patxôhã para a manhã, tarde e noite.",
    badge: "Saudações",
  },
  {
    id: "pares",
    emoji: "💛",
    title: "Palavras de Carinho",
    desc: "Ligue a palavra sagrada em Patxôhã ao gesto amigo correspondente.",
    badge: "Vocabulário",
  },
  {
    id: "roda",
    emoji: "🤝",
    title: "Roda da Amizade",
    desc: "Toque em cada amigo da aldeia e diga Aria para completar a roda sagrada!",
    badge: "União",
  },
];

function AmizadePage() {
  const { t } = useTranslation();
  const [game, setGame] = useState<GameId | null>(null);
  const [stars, setStars] = useState(0);

  return (
    <div className="kids-theme relative min-h-screen bg-[#fbf9f4] text-slate-800 font-sans overflow-x-clip selection:bg-amber-300 selection:text-amber-950">
      {/* Soft warm ambient lighting for kids */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(254,243,199,0.5),rgba(255,255,255,0))]"
      />

      {/* Floating Animated Emojis in Background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden select-none z-0 opacity-40"
      >
        <span
          className="absolute left-[6%] top-[140px] text-3xl"
          style={{ animation: "music-float 6s ease-in-out infinite" }}
        >
          🤝
        </span>
        <span
          className="absolute right-[8%] top-[190px] text-4xl"
          style={{ animation: "music-float 7s ease-in-out infinite 1.2s" }}
        >
          💛
        </span>
        <span
          className="absolute left-[10%] top-[450px] text-3xl"
          style={{ animation: "music-float 8s ease-in-out infinite 0.5s" }}
        >
          👋
        </span>
        <span
          className="absolute right-[12%] top-[500px] text-3xl"
          style={{ animation: "music-float 6.5s ease-in-out infinite 2s" }}
        >
          ✨
        </span>
        <span
          className="absolute left-[4%] top-[720px] text-3xl"
          style={{ animation: "music-float 9s ease-in-out infinite 1.5s" }}
        >
          ⭐
        </span>
        <span
          className="absolute right-[6%] top-[780px] text-3xl"
          style={{ animation: "music-float 7.5s ease-in-out infinite 2.5s" }}
        >
          🌿
        </span>
      </div>

      <div className="relative z-10 flex min-h-screen flex-col justify-between">
        <div>
          <SiteHeader mode="infantil" />

          <main className="mx-auto max-w-5xl px-3 sm:px-6 py-6 md:px-8 pb-28">
            {!game ? (
              <>
                {/* ========================================================
                    HERO BANNER DE AMIZADE
                   ======================================================== */}
                <section className="relative mb-8 overflow-hidden rounded-[2.5rem] border-4 border-amber-300 bg-gradient-to-r from-[#fffef5] via-[#fef7e6] to-[#f5edd2] p-5 sm:p-7 shadow-lg">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
                    <div className="flex items-center gap-4">
                      {/* Avatar do Mascote */}
                      <div className="relative shrink-0">
                        <img
                          src={kidsCharacter}
                          alt="Mascote da Aldeia"
                          className="h-16 w-16 sm:h-20 sm:w-20 object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.18)] transform hover:scale-105 transition"
                          style={{ animation: "music-float 4s ease-in-out infinite" }}
                        />
                        <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-xs text-amber-950 font-black shadow-md border-2 border-white">
                          🤝
                        </span>
                      </div>

                      <div>
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 border border-amber-300 px-3 py-0.5 text-xs font-black uppercase tracking-wider text-amber-900">
                          <Users className="h-3.5 w-3.5 text-emerald-800" />
                          ✦ Laços Sagrados • União da Aldeia ✦
                        </div>
                        <h1
                          className="mt-1.5 font-display text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight"
                          style={{ color: "#064e3b" }}
                        >
                          Amizade na Aldeia
                        </h1>
                        <p className="mt-1 text-xs sm:text-sm text-slate-700 max-w-xl font-semibold leading-relaxed">
                          Brinque de fazer amigos na aldeia com saudações afetuosas, palavras de carinho e a grande roda de união!
                        </p>
                      </div>
                    </div>

                    {/* Quick Stats Pill */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 bg-white/95 border-2 border-amber-300 rounded-2xl px-4 py-3 shrink-0 shadow-sm">
                      <span className="text-[11px] font-black uppercase tracking-wider text-amber-800 flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                        Estrelas de Amigo
                      </span>
                      <span className="font-display text-xl sm:text-2xl font-black text-emerald-950">
                        ⭐ {stars}{" "}
                        <span className="text-xs font-sans text-amber-800 font-bold">
                          conquistadas
                        </span>
                      </span>
                    </div>
                  </div>
                </section>

                {/* ========================================================
                    CARDS DE JOGOS DE AMIZADE
                   ======================================================== */}
                <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
                  {GAMES.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => {
                        speak(`${g.title}. ${g.desc}`, "pt-BR");
                        setGame(g.id);
                      }}
                      className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border-2 border-amber-200/90 bg-white p-5 sm:p-6 text-left shadow-md transition-all hover:-translate-y-1 hover:border-amber-400 hover:shadow-xl active:translate-y-0.5 cursor-pointer"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-amber-100 text-3xl shadow-inner border border-amber-200 group-hover:scale-105 transition">
                            {g.emoji}
                          </span>
                          <span className="rounded-full bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-900">
                            {g.badge}
                          </span>
                        </div>

                        <h2
                          className="mt-4 font-display text-lg sm:text-xl font-black tracking-tight group-hover:text-emerald-700 transition"
                          style={{ color: "#064e3b" }}
                        >
                          {g.title}
                        </h2>

                        <p className="mt-1.5 text-xs text-slate-600 font-medium leading-relaxed">
                          {g.desc}
                        </p>
                      </div>

                      <div className="mt-5 pt-3 border-t border-amber-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-800 group-hover:underline">
                          Jogar agora →
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-xl bg-amber-400 px-3 py-1 text-xs font-black text-amber-950 shadow-[0_3px_0_#b45309] group-hover:brightness-105">
                          Brincar 🌟
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              /* ========================================================
                  TELA DO JOGO ATIVO
                 ======================================================== */
              <div className="mt-2 rounded-[2.5rem] border-4 border-amber-300 bg-white p-5 sm:p-8 shadow-xl text-slate-800">
                <div className="mb-6 flex items-center justify-between border-b-2 border-amber-200 pb-4">
                  <button
                    onClick={() => setGame(null)}
                    className="inline-flex items-center gap-2 rounded-2xl border-2 border-amber-300 bg-amber-100 px-4 py-2 text-xs font-black text-amber-900 shadow-sm hover:bg-amber-200 active:translate-y-0.5 transition cursor-pointer"
                  >
                    <ArrowLeft className="h-4 w-4" /> <span>Voltar aos Jogos</span>
                  </button>

                  <h2
                    className="font-display text-lg sm:text-2xl font-black tracking-tight"
                    style={{ color: "#064e3b" }}
                  >
                    {GAMES.find((g) => g.id === game)?.title}
                  </h2>

                  <div className="inline-flex items-center gap-1 rounded-full bg-amber-100 border border-amber-300 px-3 py-1 text-xs font-black text-amber-900">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" /> {stars} estrelas
                  </div>
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
      <div className="text-center py-6">
        <p
          className="font-display text-2xl sm:text-3xl font-black"
          style={{ color: "#064e3b" }}
        >
          🌟 Parabéns! Você acertou {hits} de {list.length}!
        </p>
        <p className="mt-1 text-slate-600 font-semibold text-sm">
          Você ganhou 3 estrelas sagradas de amizade!
        </p>
        <button
          onClick={() => {
            setIdx(0);
            setHits(0);
            setRound((r) => r + 1);
          }}
          className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 px-6 py-3 font-black text-amber-950 shadow-[0_4px_0_#b45309] hover:brightness-105 active:translate-y-1 active:shadow-none transition cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" /> Jogar de novo
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-3xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 p-6 text-center shadow-md">
        <div className="text-6xl drop-shadow">{current.emoji}</div>
        <p
          className="mt-3 font-display text-xl sm:text-2xl font-black uppercase tracking-wider"
          style={{ color: "#064e3b" }}
        >
          {current.pt}
        </p>
        <p className="mt-1 text-xs text-slate-600 font-semibold">
          Como dizemos em língua Patxôhã?
        </p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4">
        {opts.map((o) => (
          <button
            key={o}
            onClick={() => {
              speak(o, "pt-BR");
              if (o === current.correct) setHits((h) => h + 1);
              setIdx((i) => i + 1);
            }}
            className="rounded-2xl border-b-[4px] border-amber-400 bg-white hover:bg-amber-50 px-4 py-4 font-black uppercase tracking-wide text-slate-800 shadow-md transition active:translate-y-1 active:border-b-2 cursor-pointer text-sm sm:text-base"
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
    <div>
      <p className="text-center text-xs sm:text-sm font-semibold text-slate-600 mb-4">
        Toque na palavra à esquerda e depois no emoji que representa esse carinho!
      </p>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-3">
          {words.map((w) => {
            const done = ok.includes(w.px);
            const active = sel === w.px;
            return (
              <button
                key={w.px}
                disabled={done}
                onClick={() => {
                  speak(w.px, "pt-BR");
                  setSel(w.px);
                }}
                className={`w-full rounded-2xl border-2 px-4 py-3.5 text-left font-black uppercase transition-all shadow-sm cursor-pointer ${
                  done
                    ? "border-emerald-300 bg-emerald-50 line-through text-emerald-800 opacity-60"
                    : active
                      ? "border-amber-400 bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 shadow-md scale-102"
                      : "border-amber-200 bg-white text-slate-800 hover:border-amber-400 hover:bg-amber-50"
                }`}
              >
                <span>{w.px}</span>
                <span className="ml-2 text-xs opacity-75 font-normal">({w.pt})</span>
              </button>
            );
          })}
        </div>

        <div className="space-y-3">
          {emojis.map((e) => {
            const done = ok.includes(e.px);
            return (
              <button
                key={e.emoji}
                disabled={done}
                onClick={() => pick(e.emoji)}
                className={`w-full rounded-2xl border-2 px-4 py-3.5 text-3xl transition-all shadow-sm cursor-pointer ${
                  done
                    ? "border-emerald-300 bg-emerald-50 opacity-40"
                    : "border-amber-200 bg-white hover:border-amber-400 hover:bg-amber-50 hover:scale-102"
                }`}
              >
                {e.emoji}
              </button>
            );
          })}
        </div>

        {ok.length === PAIRS.length && (
          <div className="col-span-2 text-center py-4 border-t-2 border-amber-200 mt-3">
            <p
              className="font-display text-xl sm:text-2xl font-black"
              style={{ color: "#064e3b" }}
            >
              💛 Todos os carinhos associados com sucesso!
            </p>
            <button
              onClick={() => {
                setOk([]);
                setRound((r) => r + 1);
              }}
              className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 px-6 py-2.5 font-black text-amber-950 shadow-[0_4px_0_#b45309] hover:brightness-105 active:translate-y-1 active:shadow-none transition cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" /> Jogar de novo
            </button>
          </div>
        )}
      </div>
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
      <p
        className="text-center text-sm font-black uppercase tracking-wider"
        style={{ color: "#064e3b" }}
      >
        Toque em cada amigo da aldeia e diga Aria!
      </p>

      <div className="relative mx-auto mt-6 aspect-square max-w-sm rounded-full border-4 border-dashed border-amber-300 bg-amber-50/50 p-4">
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
                speak("Aria!", "pt-BR");
                setGreeted((g) => [...g, i]);
                onScore();
              }}
              style={{ left: `${x}%`, top: `${y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 grid h-16 w-16 place-items-center rounded-full border-3 text-3xl shadow-lg transition-all transform active:scale-95 cursor-pointer ${
                done
                  ? "border-emerald-500 bg-emerald-100 scale-110 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                  : "border-amber-300 bg-white hover:scale-110 hover:border-amber-400"
              }`}
            >
              {f}
            </button>
          );
        })}

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-amber-400 bg-white px-5 py-2.5 font-display text-base font-black uppercase text-amber-950 shadow-md">
          {complete ? "Aria! 🎉" : `${greeted.length}/${FRIENDS.length}`}
        </div>
      </div>

      {complete && (
        <div className="mt-6 text-center border-t-2 border-amber-200 pt-4">
          <p
            className="font-display text-xl sm:text-2xl font-black"
            style={{ color: "#064e3b" }}
          >
            🤝 Roda da Amizade completa! Parabéns!
          </p>
          <button
            onClick={() => setGreeted([])}
            className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 px-6 py-2.5 font-black text-amber-950 shadow-[0_4px_0_#b45309] hover:brightness-105 active:translate-y-1 active:shadow-none transition cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" /> Jogar de novo
          </button>
        </div>
      )}
    </div>
  );
}

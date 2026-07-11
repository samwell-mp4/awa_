import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Trophy, BookOpen, RefreshCw, Check } from "lucide-react";
import jungleBgAsset from "@/assets/jogos-jungle-bg.png.asset.json";
const jungleBg = jungleBgAsset.url;

// Woven tribal tile for the "Ligação" category button
const TRIBAL_WEAVE =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='72' height='72' viewBox='0 0 72 72'><rect width='72' height='72' fill='%23a8551f'/><g fill='none' stroke-linejoin='miter'><polygon points='36,4 68,36 36,68 4,36' fill='%23f4d29a' stroke='%236b3410' stroke-width='2'/><polygon points='36,14 58,36 36,58 14,36' fill='%23c8451f' stroke='%23f4d29a' stroke-width='2'/><polygon points='36,22 50,36 36,50 22,36' fill='%23f4d29a' stroke='%236b3410' stroke-width='1.5'/><polygon points='36,30 42,36 36,42 30,36' fill='%236b3410'/><path d='M0 0 L14 14 M72 0 L58 14 M0 72 L14 58 M72 72 L58 58' stroke='%23f4d29a' stroke-width='2'/></g></svg>\")";

// Wood + tribal weave pattern for the answer bars
const WOOD_TRIBAL =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='56' viewBox='0 0 120 56'><rect width='120' height='56' fill='%23d6a86a'/><g stroke='%236b3410' stroke-width='0.6' opacity='0.55' fill='none'><path d='M0 8 Q30 6 60 10 T120 8'/><path d='M0 20 Q40 24 80 18 T120 22'/><path d='M0 34 Q30 30 60 36 T120 32'/><path d='M0 46 Q40 42 80 48 T120 44'/></g><g fill='none' stroke='%236b3410' stroke-width='1.5'><polygon points='60,6 76,28 60,50 44,28' fill='%23c8451f'/><polygon points='60,14 68,28 60,42 52,28' fill='%23f4d29a'/><polygon points='20,6 36,28 20,50 4,28' fill='%23f4d29a' opacity='0.85'/><polygon points='100,6 116,28 100,50 84,28' fill='%23f4d29a' opacity='0.85'/></g></svg>\")";

export const Route = createFileRoute("/jogos")({
  head: () => ({
    meta: [
      { title: "Jogos Awã Tech — Aprenda Patxôhã brincando" },
      { name: "description", content: "Jogos culturais Pataxó para aprender Patxôhã brincando." },
      { property: "og:title", content: "Jogos Awã Tech" },
      { property: "og:description", content: "Aprenda Patxôhã brincando com jogos culturais Pataxó." },
    ],
  }),
  component: JogosPage,
});

type Pair = { pat: string; pt: string };
const PAIRS: Pair[] = [
  { pat: "Y", pt: "Água" },
  { pat: "Tupã", pt: "Deus / Trovão" },
  { pat: "K", pt: "Fogo" },
  { pat: "Pataxó", pt: "Povo Pataxó" },
];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function JogosPage() {
  const [score, setScore] = useState(0);

  return (
    <div
      className="min-h-screen text-cream relative"
      style={{
        backgroundImage: `url(${jungleBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="mx-auto max-w-5xl px-4 py-8 md:py-14">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-cream px-2 text-2xl md:text-3xl font-black drop-shadow-[0_2px_2px_rgba(0,0,0,0.7)]">
            Aprenda Patxôhã brincando 🌈✨ — jogos do povo Pataxó
          </h1>
          <div
            className="mt-4 inline-flex items-center gap-2 rounded-full px-6 py-3 font-black text-cream text-lg"
            style={{
              backgroundImage: `${TRIBAL_WEAVE}, linear-gradient(160deg,#ff5470,#c81d5e)`,
              backgroundSize: "72px 72px, cover",
              backgroundRepeat: "repeat, no-repeat",
              boxShadow:
                "0 8px 0 #7a0d38, 0 14px 24px rgba(0,0,0,0.35), inset 0 0 0 3px #f4d29a, inset 0 -4px 8px rgba(0,0,0,0.25), inset 0 3px 6px rgba(255,255,255,0.35)",
            }}
          >
            <Trophy className="h-5 w-5 text-gold drop-shadow" /> <span>{score} pontos</span>
          </div>
        </div>

        {/* Category button — only Ligação */}
        <div className="mb-6 flex justify-start">
          <button
            className="flex flex-col items-center justify-center gap-1 rounded-2xl px-6 py-4 md:py-5 text-sm md:text-base font-black"
            style={{
              backgroundImage: `${TRIBAL_WEAVE}, linear-gradient(160deg,#c8823a,#8a4a1a)`,
              backgroundSize: "72px 72px, cover",
              backgroundRepeat: "repeat, no-repeat",
              color: "#fff",
              textShadow: "0 2px 0 rgba(0,0,0,0.5)",
              boxShadow:
                "0 8px 0 #5a2a0a, 0 14px 22px rgba(0,0,0,0.4), inset 0 0 0 3px #6b3410, inset 0 0 0 6px #f4d29a, inset 0 -4px 8px rgba(0,0,0,0.25), inset 0 3px 5px rgba(255,255,255,0.35)",
            }}
          >
            <BookOpen className="h-6 w-6" />
            <span>Ligação</span>
          </button>
        </div>

        {/* Game */}
        <LigacaoGame onScore={(n) => setScore((s) => s + n)} />

        <p className="mt-6 text-center text-xs text-cream/85 font-semibold drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]">
          Todos os jogos são gratuitos 🌱 — cortesia do povo Pataxó para as próximas gerações.
        </p>
      </div>
    </div>
  );
}

/* ============ LIGAÇÃO ============ */
function LigacaoGame({ onScore }: { onScore: (n: number) => void }) {
  const [round, setRound] = useState(0);
  const lefts = useMemo(() => PAIRS.map((p) => p.pat), []);
  const rights = useMemo(() => shuffle(PAIRS).map((p) => p.pt), [round]);

  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matched, setMatched] = useState<Record<string, string>>({});
  const [wrong, setWrong] = useState<string | null>(null);

  const clickLeft = (pat: string) => {
    if (matched[pat]) return;
    setSelectedLeft(pat);
    setWrong(null);
  };

  const clickRight = (pt: string) => {
    if (!selectedLeft) return;
    if (Object.values(matched).includes(pt)) return;
    const correct = PAIRS.find((p) => p.pat === selectedLeft)?.pt === pt;
    if (correct) {
      setMatched((m) => ({ ...m, [selectedLeft]: pt }));
      setSelectedLeft(null);
      onScore(20);
    } else {
      setWrong(pt);
      setTimeout(() => setWrong(null), 500);
    }
  };

  const done = Object.keys(matched).length === PAIRS.length;

  return (
    <div>
      <h3
        className="mb-2 text-center text-2xl md:text-4xl font-black tracking-wide"
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          background: "linear-gradient(180deg,#fff2a8 0%,#ffd166 55%,#ffa62b 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          filter: "drop-shadow(0 2px 0 rgba(0,0,0,0.5)) drop-shadow(0 4px 6px rgba(0,0,0,0.4))",
        }}
      >
        Ligue Patxôhã → Português
      </h3>
      <p className="mb-5 text-center text-sm text-cream/95 drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]">
        Toque numa palavra à esquerda e depois no significado.
      </p>

      <div className="mb-2 pl-2 text-xs font-black tracking-widest text-cream/90 drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]">
        PATXÔHÃ
      </div>

      <div className="flex flex-col gap-4">
        {lefts.map((pat, idx) => {
          const isMatched = !!matched[pat];
          const isSelected = selectedLeft === pat;
          const rightWord = rights[idx];
          const rightMatchedBy = Object.entries(matched).find(([, v]) => v === rightWord)?.[0];
          const rightDone = !!rightMatchedBy;
          const isWrong = wrong === rightWord;

          return (
            <div
              key={pat}
              className="grid grid-cols-[110px_1fr] items-center gap-3 rounded-full p-2"
              style={{
                background: "linear-gradient(160deg,#9b7ce0,#6b48c4)",
                boxShadow:
                  "0 8px 0 #3d2680, 0 12px 20px rgba(0,0,0,0.4), inset 0 -4px 8px rgba(0,0,0,0.25), inset 0 3px 6px rgba(255,255,255,0.4)",
              }}
            >
              {/* Left = Patxôhã word */}
              <button
                onClick={() => clickLeft(pat)}
                disabled={isMatched}
                className="h-14 rounded-full px-3 text-center text-lg font-black text-white transition-transform active:translate-y-0.5"
                style={{
                  background: isMatched
                    ? "linear-gradient(160deg,#4ecdc4,#2aa39b)"
                    : isSelected
                    ? "linear-gradient(160deg,#ffe066,#f5a623)"
                    : "linear-gradient(160deg,#8a6ad0,#5a3ab4)",
                  color: isSelected ? "#2a1a00" : "#fff",
                  textShadow: isSelected ? "none" : "0 2px 0 rgba(0,0,0,0.4)",
                  boxShadow: "inset 0 -3px 6px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.35)",
                }}
              >
                {isMatched ? <Check className="mx-auto h-5 w-5" /> : pat}
              </button>

              {/* Right = Portuguese meaning with tribal wood texture */}
              <button
                onClick={() => clickRight(rightWord)}
                disabled={rightDone}
                className="h-14 rounded-full px-4 text-left text-base font-black text-[#3a1a05] transition-transform active:translate-y-0.5"
                style={{
                  backgroundImage: `${WOOD_TRIBAL}, linear-gradient(160deg,#e8b878,#b07a3a)`,
                  backgroundSize: "120px 56px, cover",
                  backgroundRepeat: "repeat, no-repeat",
                  boxShadow: isWrong
                    ? "inset 0 0 0 3px #e63946, inset 0 -3px 6px rgba(0,0,0,0.25)"
                    : rightDone
                    ? "inset 0 0 0 3px #2aa39b, inset 0 -3px 6px rgba(0,0,0,0.25)"
                    : "inset 0 -3px 6px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.35)",
                  opacity: rightDone ? 0.7 : 1,
                  transform: isWrong ? "translateX(2px)" : undefined,
                }}
              >
                <span className="rounded px-2 py-0.5 bg-black/45 text-cream">
                  {rightDone ? `✓ ${rightWord}` : rightWord}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {done && (
        <div className="mt-6 text-center">
          <p className="mb-3 text-gold font-black text-lg">🎉 Todas as ligações! +80 pts</p>
          <button
            onClick={() => {
              setMatched({});
              setSelectedLeft(null);
              setWrong(null);
              setRound((r) => r + 1);
            }}
            className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 font-black text-forest-deep"
          >
            <RefreshCw className="h-4 w-4" /> Jogar de novo
          </button>
        </div>
      )}
    </div>
  );
}

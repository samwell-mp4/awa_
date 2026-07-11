import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { Gamepad2, Trophy, RefreshCw, Sparkles, BookOpen, Puzzle, PencilLine } from "lucide-react";
import jungleBg from "@/assets/jogos-jungle-bg.jpg";

// Bold woven diamond tile for TEAL tabs (Ligação / Lacuna)
const TRIBAL_PATTERN_TEAL =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='72' height='72' viewBox='0 0 72 72'><g fill='none' stroke-linejoin='miter'><polygon points='36,4 68,36 36,68 4,36' fill='%23fff2c9' stroke='%23a83a1a' stroke-width='2'/><polygon points='36,14 58,36 36,58 14,36' fill='%23e63e2a' stroke='%23fff2c9' stroke-width='2'/><polygon points='36,22 50,36 36,50 22,36' fill='%23fff2c9' stroke='%236b3410' stroke-width='1.5'/><polygon points='36,30 42,36 36,42 30,36' fill='%236b3410'/><path d='M0 0 L14 14 M72 0 L58 14 M0 72 L14 58 M72 72 L58 58' stroke='%23fff2c9' stroke-width='2'/></g></svg>\")";

// Vertical stripes for the GOLD active tab (Memória)
const TRIBAL_PATTERN_GOLD =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='48' height='60' viewBox='0 0 48 60'><g stroke='%236b2a10' stroke-width='2' fill='none'><path d='M8 0 L8 60 M40 0 L40 60'/><path d='M4 8 L12 8 M4 16 L12 16 M4 24 L12 24 M4 32 L12 32 M4 40 L12 40 M4 48 L12 48 M4 56 L12 56'/><path d='M36 8 L44 8 M36 16 L44 16 M36 24 L44 24 M36 32 L44 32 M36 40 L44 40 M36 48 L44 48 M36 56 L44 56'/><polygon points='24,10 30,20 24,30 18,20' fill='%23c8451f'/><polygon points='24,30 30,40 24,50 18,40' fill='%236b2a10' fill-opacity='0.7'/></g></svg>\")";

// Rose/pink tribal card face for Memória (gold diamond + zigzag borders)
const ROSE_TRIBAL_CARD =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'><rect width='120' height='120' fill='%23e63e6a'/><g fill='none' stroke='%23ffd166' stroke-width='2'><rect x='6' y='6' width='108' height='108' rx='4'/><polygon points='60,20 100,60 60,100 20,60'/><polygon points='60,32 88,60 60,88 32,60'/></g><g fill='%23ffd166'><circle cx='60' cy='60' r='3'/><polygon points='10,60 16,54 22,60 16,66'/><polygon points='110,60 104,54 98,60 104,66'/></g><g fill='none' stroke='%23ffd166' stroke-width='1.5' opacity='0.9'><path d='M6 12 L12 6 L18 12 L24 6 L30 12 L36 6 L42 12 L48 6 L54 12 L60 6 L66 12 L72 6 L78 12 L84 6 L90 12 L96 6 L102 12 L108 6 L114 12'/><path d='M6 108 L12 114 L18 108 L24 114 L30 108 L36 114 L42 108 L48 114 L54 108 L60 114 L66 108 L72 114 L78 108 L84 114 L90 108 L96 114 L102 108 L108 114 L114 108'/></g></svg>\")";

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

const SYMBOLS = [
  { emoji: "🏹", label: "Arco e Flecha", nota: "Caça e proteção do território." },
  { emoji: "🔥", label: "Fogo Sagrado", nota: "Reúne a aldeia nas noites de reza." },
  { emoji: "🌿", label: "Urucum", nota: "Tinta vermelha da pintura corporal." },
  { emoji: "🪶", label: "Cocar", nota: "Símbolo de sabedoria e liderança." },
  { emoji: "🥁", label: "Maracá", nota: "Chama os espíritos no ritual." },
  { emoji: "🌳", label: "Mata Atlântica", nota: "Casa e farmácia do povo Pataxó." },
];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function JogosPage() {
  const [tab, setTab] = useState<"match" | "memoria" | "lacuna">("memoria");
  const [score, setScore] = useState(0);

  const tabs = [
    { id: "match" as const, label: "Ligação", icon: BookOpen },
    { id: "memoria" as const, label: "Memória", icon: Puzzle },
    { id: "lacuna" as const, label: "Lacuna", icon: PencilLine },
  ];

  return (
    <div
      className="min-h-screen text-cream relative"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(10,40,20,0.35) 0%, rgba(10,40,20,0.15) 30%, rgba(10,40,20,0.55) 100%), url(${jungleBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="mx-auto max-w-5xl px-4 py-8 md:py-14">
        <div className="mb-6 text-center">
          <div
            className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-[24px] text-forest-deep"
            style={{
              background: "linear-gradient(160deg,#ffe066,#ffa62b)",
              boxShadow:
                "0 8px 0 #b26a00, 0 16px 26px rgba(0,0,0,0.35), inset 0 -6px 12px rgba(0,0,0,0.15), inset 0 4px 6px rgba(255,255,255,0.5)",
              transform: "rotate(-4deg)",
            }}
          >
            <Gamepad2 className="h-8 w-8" />
          </div>
          <p className="text-cream/95 px-2 text-base md:text-lg font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,0.6)]">
            Aprenda Patxôhã brincando 🌈✨ — jogos do povo Pataxó
          </p>
          <div
            className="mt-4 inline-flex items-center gap-2 rounded-full px-6 py-3 font-black text-cream text-lg"
            style={{
              background: "linear-gradient(160deg,#ff5470,#c81d5e)",
              boxShadow:
                "0 8px 0 #7a0d38, 0 14px 24px rgba(0,0,0,0.35), inset 0 -4px 8px rgba(0,0,0,0.2), inset 0 3px 6px rgba(255,255,255,0.35)",
            }}
          >
            <Trophy className="h-5 w-5 text-gold drop-shadow" /> <span>{score} pontos</span>
          </div>
        </div>

        {/* Tabs — Ligação (teal), Memória (gold active), Lacuna (teal) */}
        <div className="mb-6 grid grid-cols-3 gap-3 md:gap-4">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="flex flex-col items-center justify-center gap-1 rounded-2xl px-3 py-4 md:py-5 text-sm md:text-base font-black transition-transform active:translate-y-1"
                style={
                  active
                    ? {
                        backgroundImage: `${TRIBAL_PATTERN_GOLD}, linear-gradient(160deg,#ffe066,#f5a623)`,
                        backgroundSize: "48px 60px, cover",
                        backgroundRepeat: "repeat, no-repeat",
                        color: "#2a1a00",
                        boxShadow:
                          "0 8px 0 #a35a00, 0 14px 22px rgba(0,0,0,0.4), inset 0 0 0 4px #6b2a10, inset 0 0 0 7px #ffd166, inset 0 -4px 8px rgba(0,0,0,0.25), inset 0 3px 5px rgba(255,255,255,0.4)",
                        transform: "translateY(-2px)",
                      }
                    : {
                        backgroundImage: `${TRIBAL_PATTERN_TEAL}, linear-gradient(160deg,#4ecdc4,#2aa39b)`,
                        backgroundSize: "72px 72px, cover",
                        backgroundRepeat: "repeat, no-repeat",
                        color: "#062a28",
                        boxShadow:
                          "0 6px 0 #14625d, 0 10px 18px rgba(0,0,0,0.35), inset 0 0 0 4px #14625d, inset 0 0 0 7px #a8f0e8, inset 0 -3px 6px rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,0.4)",
                      }
                }
              >
                <Icon className="h-6 w-6" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Game panel */}
        {tab === "memoria" ? (
          <MemoryGame onScore={(n) => setScore((s) => s + n)} />
        ) : (
          <div
            className="rounded-[28px] p-10 text-center"
            style={{
              background: "linear-gradient(180deg, rgba(30,42,120,0.85), rgba(20,28,80,0.9))",
              border: "3px solid #f5c542",
              boxShadow: "0 16px 0 rgba(0,0,0,0.3), 0 24px 50px rgba(0,0,0,0.45)",
            }}
          >
            <Sparkles className="mx-auto h-10 w-10 text-gold" />
            <p className="mt-3 font-black text-gold text-lg">Em breve 🌱</p>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-cream/85 font-semibold drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]">
          Todos os jogos são gratuitos 🌱 — cortesia do povo Pataxó para as próximas gerações.
        </p>
      </div>
    </div>
  );
}

/* ============ MEMÓRIA ============ */
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
        ✦ Memória Cultural Pataxó ✦
      </h3>
      <p className="mb-5 text-center text-sm text-cream/90 drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]">
        Encontre os pares de símbolos sagrados.
      </p>
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        {cards.map((c, i) => {
          const show = flipped.includes(i) || matched.includes(c.label);
          return (
            <button
              key={c.id}
              onClick={() => handle(i)}
              className="aspect-square rounded-3xl text-center font-black transition-transform active:translate-y-1"
              style={
                show
                  ? {
                      background: "linear-gradient(160deg,#ffe066,#ffa62b)",
                      color: "#2a1a00",
                      boxShadow:
                        "0 8px 0 #b26a00, 0 14px 22px rgba(0,0,0,0.35), inset 0 -4px 8px rgba(0,0,0,0.15), inset 0 3px 5px rgba(255,255,255,0.5)",
                    }
                  : {
                      backgroundImage: `${ROSE_TRIBAL_CARD}, linear-gradient(160deg,#ff4e78,#c81d5e)`,
                      backgroundSize: "cover, auto",
                      backgroundPosition: "center",
                      boxShadow:
                        "0 8px 0 #7a0d38, 0 14px 22px rgba(0,0,0,0.4), inset 0 -4px 8px rgba(0,0,0,0.25), inset 0 3px 6px rgba(255,255,255,0.35)",
                    }
              }
            >
              {show ? (
                <div className="flex h-full flex-col items-center justify-center p-1">
                  <div className="text-3xl md:text-5xl drop-shadow">{c.emoji}</div>
                  <div className="mt-1 text-[10px] md:text-xs leading-tight">{c.label}</div>
                </div>
              ) : (
                <Sparkles className="mx-auto h-8 w-8 text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.35)]" />
              )}
            </button>
          );
        })}
      </div>

      {lastNota && !done && (
        <div className="mt-4 rounded-xl border border-gold/40 bg-black/40 p-3 text-sm text-cream/95 text-center">
          {lastNota}
        </div>
      )}

      {done && (
        <div className="mt-6 text-center">
          <p className="mb-3 text-gold font-black text-lg">🎉 Todos os pares! +90 pts</p>
          <button
            onClick={() => {
              setMatched([]);
              setFlipped([]);
              setLastNota(null);
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

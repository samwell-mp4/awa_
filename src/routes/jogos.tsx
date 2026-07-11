import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { Gamepad2, Trophy, RefreshCw, Check, X, Sparkles, BookOpen, Puzzle, PencilLine } from "lucide-react";
import jungleBg from "@/assets/jogos-jungle-bg.jpg";

// Tribal woven pattern (SVG data URI) — used as button texture
const TRIBAL_PATTERN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='60' height='30' viewBox='0 0 60 30'><g fill='none' stroke='%23f5c542' stroke-width='1.2' opacity='0.55'><path d='M0 15 L15 0 L30 15 L45 0 L60 15 L45 30 L30 15 L15 30 Z'/><path d='M7 15 L15 7 L23 15 L15 23 Z' fill='%23c8451f' opacity='0.6' stroke='none'/><path d='M37 15 L45 7 L53 15 L45 23 Z' fill='%237a2410' opacity='0.5' stroke='none'/></g></svg>\")";

// Woven wood/tribal tile for Ligação pills (rich earthy diamonds)
const WOVEN_TILE =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='40' viewBox='0 0 80 40'><rect width='80' height='40' fill='%23c9a26a'/><g stroke='%236b3410' stroke-width='1.5' fill='none'><path d='M0 20 L20 0 L40 20 L60 0 L80 20 L60 40 L40 20 L20 40 Z'/><path d='M0 20 L20 40 M40 20 L60 40 M20 0 L40 20 M60 0 L80 20'/></g><g fill='%23a83a1a'><polygon points='20,10 26,20 20,30 14,20'/><polygon points='60,10 66,20 60,30 54,20'/></g><g fill='%23f5c542'><polygon points='40,14 44,20 40,26 36,20'/><polygon points='0,14 4,20 0,26'/><polygon points='80,14 76,20 80,26'/></g></svg>\")";

// Rose/pink tribal card face for Memória (gold diamond + zigzag borders)
const ROSE_TRIBAL_CARD =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'><rect width='120' height='120' fill='%23e63e6a'/><g fill='none' stroke='%23ffd166' stroke-width='2'><rect x='6' y='6' width='108' height='108' rx='4'/><polygon points='60,20 100,60 60,100 20,60'/><polygon points='60,32 88,60 60,88 32,60'/></g><g fill='%23ffd166'><circle cx='60' cy='60' r='3'/><polygon points='10,60 16,54 22,60 16,66'/><polygon points='110,60 104,54 98,60 104,66'/><polygon points='60,10 66,4 72,10 66,16' opacity='0'/></g><g fill='none' stroke='%23ffd166' stroke-width='1.5' opacity='0.9'><path d='M6 12 L12 6 L18 12 L24 6 L30 12 L36 6 L42 12 L48 6 L54 12 L60 6 L66 12 L72 6 L78 12 L84 6 L90 12 L96 6 L102 12 L108 6 L114 12'/><path d='M6 108 L12 114 L18 108 L24 114 L30 108 L36 114 L42 108 L48 114 L54 108 L60 114 L66 108 L72 114 L78 108 L84 114 L90 108 L96 114 L102 108 L108 114 L114 108'/></g></svg>\")";

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
        <div className="mb-8 text-center">
          <div
            className="mx-auto mb-4 inline-flex h-20 w-20 items-center justify-center rounded-[28px] text-forest-deep"
            style={{
              background: "linear-gradient(160deg,#ffe066,#ffa62b)",
              boxShadow:
                "0 10px 0 #b26a00, 0 18px 30px rgba(0,0,0,0.35), inset 0 -6px 12px rgba(0,0,0,0.15), inset 0 4px 6px rgba(255,255,255,0.5)",
              transform: "rotate(-4deg)",
            }}
          >
            <Gamepad2 className="h-10 w-10" />
          </div>
          <h1
            className="font-serif text-4xl md:text-6xl font-black tracking-tight"
            style={{
              background: "linear-gradient(180deg,#fff9c2 0%,#ffd166 60%,#ff9a3c 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "0 6px 0 rgba(0,0,0,0.35)",
              filter: "drop-shadow(0 4px 0 rgba(0,0,0,0.5))",
            }}
          >
            Jogos Awã Tech
          </h1>
          <p className="mt-3 text-cream/90 px-2 text-base md:text-lg font-semibold">
            Aprenda Patxôhã brincando 🌈✨ — jogos do povo Pataxó
          </p>
          <div
            className="mt-5 inline-flex items-center gap-2 rounded-full px-5 py-3 font-black text-cream text-lg"
            style={{
              background: "linear-gradient(160deg,#ff5470,#c81d5e)",
              boxShadow:
                "0 8px 0 #7a0d38, 0 14px 24px rgba(0,0,0,0.35), inset 0 -4px 8px rgba(0,0,0,0.2), inset 0 3px 6px rgba(255,255,255,0.35)",
            }}
          >
            <Trophy className="h-5 w-5 text-gold drop-shadow" /> <span>{score} pontos</span>
          </div>
        </div>

        {/* Navegação chunky 3D */}
        <div className="mb-6 grid grid-cols-3 gap-3 md:flex md:justify-center md:gap-4">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 rounded-2xl px-3 py-4 md:px-7 md:py-4 text-sm md:text-base font-black transition-transform active:translate-y-1"
                style={
                  active
                    ? {
                        background: `${TRIBAL_PATTERN}, linear-gradient(160deg,#ffe066,#ffa62b)`,
                        backgroundBlendMode: "overlay, normal",
                        color: "#2a1a00",
                        boxShadow:
                          "0 8px 0 #b26a00, 0 14px 22px rgba(0,0,0,0.35), inset 0 0 0 3px rgba(122,36,16,0.7), inset 0 -4px 8px rgba(0,0,0,0.2), inset 0 3px 5px rgba(255,255,255,0.5)",
                        transform: "translateY(-2px)",
                      }
                    : {
                        background: `${TRIBAL_PATTERN}, linear-gradient(160deg,#4ecdc4,#2aa39b)`,
                        backgroundBlendMode: "overlay, normal",
                        color: "#062a28",
                        boxShadow:
                          "0 6px 0 #14625d, 0 10px 18px rgba(0,0,0,0.3), inset 0 0 0 3px rgba(20,98,93,0.7), inset 0 -3px 6px rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,0.4)",
                      }
                }
              >
                <Icon className="h-6 w-6" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        <div
          className="rounded-[32px] p-5 md:p-8 relative"
          style={{
            background:
              "linear-gradient(180deg, rgba(30,42,120,0.85) 0%, rgba(20,28,80,0.9) 100%)",
            border: "4px solid #f5c542",
            outline: "3px solid #c8451f",
            outlineOffset: "-10px",
            boxShadow:
              "0 20px 0 rgba(0,0,0,0.35), 0 30px 60px rgba(0,0,0,0.5), inset 0 0 0 8px rgba(245,197,66,0.15)",
          }}
        >
          {tab === "match" && <MatchGame onScore={(n) => setScore((s) => s + n)} />}
          {tab === "memoria" && <MemoryGame onScore={(n) => setScore((s) => s + n)} />}
          {tab === "lacuna" && <FillGame onScore={(n) => setScore((s) => s + n)} />}
        </div>

        <p className="mt-6 text-center text-xs text-cream/70 font-semibold">
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
            const purplePill = (extraShadow = "") => ({
              background: `${WOVEN_TILE} right center / 60% 100% no-repeat, linear-gradient(160deg,#7a6bff,#4a3ad4)`,
              color: "#fff",
              boxShadow:
                "0 8px 0 #241a80, 0 12px 22px rgba(0,0,0,0.4), inset 0 0 0 4px #6a5cff, inset 0 -4px 8px rgba(0,0,0,0.25), inset 0 3px 5px rgba(255,255,255,0.3)" +
                (extraShadow ? ", " + extraShadow : ""),
            });
            const base: React.CSSProperties = matched
              ? {
                  background: "linear-gradient(160deg,#7ac74f,#3f8f2e)",
                  color: "#f7ffe0",
                  boxShadow: "0 4px 0 #1f4a15, inset 0 -3px 6px rgba(0,0,0,0.2)",
                  textDecoration: "line-through",
                  opacity: 0.85,
                }
              : err
              ? {
                  ...purplePill(),
                  background: `${WOVEN_TILE} right center / 60% 100% no-repeat, linear-gradient(160deg,#ff5470,#c81d5e)`,
                  boxShadow:
                    "0 8px 0 #7a0d38, 0 12px 22px rgba(0,0,0,0.4), inset 0 0 0 4px #ff7a95, inset 0 -4px 8px rgba(0,0,0,0.25)",
                }
              : selected
              ? {
                  ...purplePill(),
                  transform: "translateY(-3px)",
                  boxShadow:
                    "0 10px 0 #241a80, 0 16px 28px rgba(0,0,0,0.45), inset 0 0 0 4px #ffd166, inset 0 -4px 8px rgba(0,0,0,0.25), inset 0 3px 5px rgba(255,255,255,0.35)",
                }
              : purplePill();
            return (
              <button
                key={p.px}
                disabled={matched}
                onClick={() => setSelectedPx(p.px)}
                className="w-full rounded-full pl-5 pr-[45%] py-5 text-left font-black text-lg transition-transform active:translate-y-1 min-h-[64px]"
                style={base}
              >
                {p.px}
              </button>
            );
          })}
        </div>
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-wider text-gold/80 font-black">Português</p>
          {shuffledPt.map((pt) => {
            const used = Object.values(matches).includes(pt);
            const style: React.CSSProperties = used
              ? {
                  background: "linear-gradient(160deg,#7ac74f,#3f8f2e)",
                  color: "#f7ffe0",
                  boxShadow: "0 4px 0 #1f4a15",
                  textDecoration: "line-through",
                  opacity: 0.7,
                }
              : {
                  background: `${WOVEN_TILE} right center / 55% 100% no-repeat, linear-gradient(160deg,#4ecdc4,#2aa39b)`,
                  color: "#062a28",
                  boxShadow:
                    "0 6px 0 #14625d, 0 10px 18px rgba(0,0,0,0.3), inset 0 -3px 6px rgba(0,0,0,0.15), inset 0 2px 4px rgba(255,255,255,0.4)",
                };
            return (
              <button
                key={pt}
                disabled={used || !selectedPx}
                onClick={() => handlePt(pt)}
                className="w-full rounded-full pl-5 pr-[42%] py-5 text-left font-black text-lg transition-transform active:translate-y-1 min-h-[64px] disabled:opacity-60"
                style={style}
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
      <h3
        className="mb-2 text-center text-2xl md:text-3xl font-black tracking-wide"
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          background: "linear-gradient(180deg,#fff2a8 0%,#ffd166 55%,#ffa62b 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          filter: "drop-shadow(0 2px 0 rgba(0,0,0,0.4)) drop-shadow(0 4px 6px rgba(0,0,0,0.35))",
        }}
      >
        ✦ Memória Cultural Pataxó ✦
      </h3>
      <p className="mb-5 text-center text-sm text-cream/80">Encontre os pares de símbolos sagrados.</p>
      <div className="grid grid-cols-3 gap-3 md:grid-cols-4 md:gap-4">
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
      <div className="mx-auto flex max-w-md flex-wrap justify-center gap-3 md:gap-4">
        {q.options.map((opt) => {
          const isAnswer = answered !== null && opt === q.answer;
          const isWrongPicked = answered === false && opt !== q.answer;
          const style: React.CSSProperties = isAnswer
            ? {
                background: "linear-gradient(160deg,#7ac74f,#3f8f2e)",
                color: "#f7ffe0",
                boxShadow:
                  "0 8px 0 #1f4a15, 0 14px 22px rgba(0,0,0,0.35), inset 0 -4px 8px rgba(0,0,0,0.2), inset 0 3px 5px rgba(255,255,255,0.35)",
                transform: "translateY(-2px)",
              }
            : isWrongPicked
            ? {
                background: "linear-gradient(160deg,#4a4670,#2c294a)",
                color: "#cfcfe5",
                boxShadow: "0 4px 0 #1a1830",
                opacity: 0.7,
              }
            : {
                background: "linear-gradient(160deg,#ff9a3c,#e05a1a)",
                color: "#2a1400",
                boxShadow:
                  "0 8px 0 #843000, 0 14px 22px rgba(0,0,0,0.35), inset 0 -4px 8px rgba(0,0,0,0.2), inset 0 3px 5px rgba(255,255,255,0.4)",
              };
          return (
            <button
              key={opt}
              onClick={() => choose(opt)}
              className="rounded-2xl px-6 py-4 font-black text-lg transition-transform active:translate-y-1 min-w-[110px]"
              style={style}
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

import { createFileRoute, Link } from "@tanstack/react-router";
import { requireArea } from "@/lib/area-guard";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getGamesConfig } from "@/lib/infantil-content.functions";

import { ArrowLeft, Eraser, Gamepad2, Palette, Play, RefreshCw, Search, Sparkles, Star, Trophy, Volume2, X } from "lucide-react";
import { T } from "@/components/T";
import { speak } from "@/lib/speak";
import kidsCharacter from "@/assets/kids-menu-character.png";
import { SiteHeader } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { EmptyState } from "@/components/education/empty-state";

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

const STATIC_GAMES: {
  id: GameId;
  emoji: string;
  title: string;
  desc: string;
  skill: string;
  category: "lingua" | "memoria" | "numeros" | "natureza" | "ingles";
  difficulty: "Fácil" | "Médio";
  bestScore?: number;
  color: string;
}[] = [
  {
    id: "memoria",
    emoji: "🧠",
    title: "Memória da Floresta",
    desc: "Ache os pares de bichos e plantas.",
    skill: "Memória • Natureza",
    category: "memoria",
    difficulty: "Fácil",
    bestScore: 480,
    color: "from-emerald-400 to-emerald-600",
  },
  {
    id: "pares",
    emoji: "🗣️",
    title: "Pares Patxôhã",
    desc: "Ligue a palavra ao desenho certo.",
    skill: "Vocabulário • Associação",
    category: "lingua",
    difficulty: "Fácil",
    bestScore: 320,
    color: "from-amber-400 to-orange-500",
  },
  {
    id: "caca",
    emoji: "🎯",
    title: "Caça aos Bichos",
    desc: "Toque no bichinho antes que ele suma!",
    skill: "Atenção • Agilidade",
    category: "natureza",
    difficulty: "Médio",
    bestScore: 500,
    color: "from-sky-400 to-indigo-500",
  },
  {
    id: "acerte",
    emoji: "🏹",
    title: "Acerte a Palavra",
    desc: "Veja a figura e toque na palavra certa.",
    skill: "Leitura • Reconhecimento",
    category: "lingua",
    difficulty: "Fácil",
    bestScore: 280,
    color: "from-fuchsia-400 to-purple-600",
  },
  {
    id: "ordenar",
    emoji: "🧮",
    title: "Ordene os Números",
    desc: "Coloque os números do menor ao maior.",
    skill: "Matemática • Sequência",
    category: "numeros",
    difficulty: "Fácil",
    bestScore: 400,
    color: "from-teal-400 to-cyan-600",
  },
  {
    id: "cores",
    emoji: "🎨",
    title: "Junte a Cor ao Nome",
    desc: "Toque na cor certa para cada nome.",
    skill: "Cores • Percepção",
    category: "natureza",
    difficulty: "Fácil",
    bestScore: 350,
    color: "from-rose-400 to-red-500",
  },
  {
    id: "adivinhe",
    emoji: "🦜",
    title: "Adivinhe o Bicho",
    desc: "Ouça a dica e escolha o bichinho!",
    skill: "Escuta • Dedução",
    category: "natureza",
    difficulty: "Médio",
    bestScore: 420,
    color: "from-lime-400 to-green-600",
  },
  {
    id: "colorir",
    emoji: "🖌️",
    title: "Desenhar e Colorir",
    desc: "Pinte símbolos e bichos da aldeia.",
    skill: "Criatividade • Arte",
    category: "natureza",
    difficulty: "Fácil",
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
  const { t } = useTranslation();
  const [game, setGame] = useState<GameId | null>(null);
  const [stars, setStars] = useState(0);
  const getFn = useServerFn(getGamesConfig);
  
  const { data: configGames } = useQuery({
    queryKey: ["site_config", "infantil_games"],
    queryFn: () => getFn(),
  });

  const games = useMemo(() => {
    if (configGames && Array.isArray(configGames) && configGames.length > 0) {
      return configGames;
    }
    return STATIC_GAMES;
  }, [configGames]);


  const [activeCategory, setActiveCategory] = useState<"todos" | "lingua" | "memoria" | "numeros" | "natureza" | "ingles">("todos");
  const [searchQuery, setSearchQuery] = useState("");

  const featuredGame = STATIC_GAMES[0]; // Memória da Floresta

  const visibleGames = useMemo(() => {
    let list = games;
    if (activeCategory === "ingles") list = EN_GAMES;
    else if (activeCategory !== "todos") list = games.filter((g: any) => g.category === activeCategory);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((g: any) =>
        (g.title || "").toLowerCase().includes(q) ||
        (g.desc || "").toLowerCase().includes(q) ||
        (g.skill || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [games, activeCategory, searchQuery]);

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
          className="absolute left-[5%] top-[130px] text-3xl"
          style={{ animation: "music-float 6s ease-in-out infinite" }}
        >
          🎮
        </span>
        <span
          className="absolute right-[8%] top-[190px] text-4xl"
          style={{ animation: "music-float 7s ease-in-out infinite 1.5s" }}
        >
          🎲
        </span>
        <span
          className="absolute left-[11%] top-[480px] text-3xl"
          style={{ animation: "music-float 8s ease-in-out infinite 0.7s" }}
        >
          🧠
        </span>
        <span
          className="absolute right-[14%] top-[540px] text-2xl"
          style={{ animation: "music-float 5.5s ease-in-out infinite 2s" }}
        >
          ✨
        </span>
        <span
          className="absolute left-[3%] top-[780px] text-3xl"
          style={{ animation: "music-float 9s ease-in-out infinite 1s" }}
        >
          🎨
        </span>
        <span
          className="absolute right-[5%] top-[860px] text-3xl"
          style={{ animation: "music-float 6.5s ease-in-out infinite 2.5s" }}
        >
          ⭐
        </span>
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <SiteHeader mode="infantil" />

        <main className="mx-auto w-full max-w-5xl flex-1 px-3 sm:px-6 pb-28 pt-4">
          {!game ? (
            <>
              {/* ========================================================
                  HERO BANNER DE JOGOS DA ALDEIA
                 ======================================================== */}
              <section className="relative mb-6 overflow-hidden rounded-[2.5rem] border-4 border-amber-300 bg-gradient-to-r from-[#fffef5] via-[#fef7e6] to-[#f5edd2] p-5 sm:p-7 shadow-lg">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
                  <div className="flex items-center gap-4">
                    {/* Mascote */}
                    <div className="relative shrink-0">
                      <img
                        src={kidsCharacter}
                        alt="Mascote da Aldeia"
                        className="h-16 w-16 sm:h-20 sm:w-20 object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.18)] transform hover:scale-105 transition"
                        style={{ animation: "music-float 4s ease-in-out infinite" }}
                      />
                      <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-xs text-amber-950 font-black shadow-md border-2 border-white">
                        🎮
                      </span>
                    </div>

                    <div>
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 border border-amber-300 px-3 py-0.5 text-xs font-black uppercase tracking-wider text-amber-900">
                        <Gamepad2 className="h-3.5 w-3.5 text-emerald-800" />
                        ✦ Jogos da Aldeia • Brincar e Aprender ✦
                      </div>
                      <h1
                        className="mt-1.5 font-display text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight"
                        style={{ color: "#064e3b" }}
                      >
                        Jogos e Brincadeiras
                      </h1>
                      <p className="mt-1 text-xs sm:text-sm text-slate-700 max-w-xl font-semibold leading-relaxed">
                        Desenvolva memória, agilidade e vocabulário Patxôhã através de jogos divertidos e culturais!
                      </p>
                    </div>
                  </div>

                  {/* Stars Pill */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 bg-white/95 border-2 border-amber-300 rounded-2xl px-4 py-3 shrink-0 shadow-sm">
                    <span className="text-[11px] font-black uppercase tracking-wider text-amber-800 flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                      Pontuação Geral
                    </span>
                    <span className="font-display text-xl sm:text-2xl font-black text-emerald-950">
                      ⭐ {stars}{" "}
                      <span className="text-xs font-sans text-amber-800 font-bold">
                        estrelas
                      </span>
                    </span>
                  </div>
                </div>
              </section>

              {/* 1. DESTAQUE: JOGO RECOMENDADO */}
              <section className="mb-6">
                <div className="relative overflow-hidden rounded-3xl border-3 border-amber-300 bg-white p-5 sm:p-6 shadow-md hover:shadow-lg transition">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-amber-100 border-2 border-amber-300 text-3xl shadow-inner">
                        {featuredGame.emoji}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-900">
                            Recomendado da Aldeia
                          </span>
                          <span className="text-xs font-bold text-amber-800">
                            {featuredGame.difficulty}
                          </span>
                        </div>
                        <h2
                          className="font-display text-xl sm:text-2xl font-black tracking-tight"
                          style={{ color: "#064e3b" }}
                        >
                          {featuredGame.title}
                        </h2>
                        <p className="text-xs text-slate-600 font-medium mt-0.5">
                          {featuredGame.skill} • Melhor pontuação: {featuredGame.bestScore || 480} pts
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        speak(`${featuredGame.title}. ${featuredGame.desc}`, "pt-BR");
                        setGame(featuredGame.id);
                      }}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 px-6 py-3 text-sm font-black text-amber-950 shadow-[0_4px_0_#b45309] hover:brightness-105 active:translate-y-1 active:shadow-none transition cursor-pointer"
                    >
                      <Play className="h-4 w-4 fill-current" />
                      <span>Jogar Agora</span>
                    </button>
                  </div>
                </div>
              </section>

              {/* 2. SEARCH & CATEGORY FILTERS */}
              <div className="mt-6 flex flex-col gap-4">
                <div className="relative w-full max-w-lg">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar jogo ou habilidade..."
                    className="w-full rounded-2xl border-2 border-amber-300 bg-white pl-11 pr-10 py-3 text-sm text-slate-800 placeholder-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-100 shadow-sm transition"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-800 p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 sm:gap-2.5">
                  {[
                    { id: "todos", label: "Todos os Jogos", icon: "🌟" },
                    { id: "lingua", label: "Língua & Vocabulário", icon: "🏹" },
                    { id: "memoria", label: "Memória", icon: "🧠" },
                    { id: "numeros", label: "Números", icon: "🔢" },
                    { id: "natureza", label: "Natureza & Bichos", icon: "🌿" },
                    { id: "ingles", label: "Inglês", icon: "🌍" },
                  ].map((cat) => {
                    const isActive = activeCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id as any)}
                        className={`inline-flex items-center gap-1.5 rounded-2xl px-4 py-2 text-xs sm:text-sm font-black transition-all transform active:translate-y-0.5 cursor-pointer shadow-sm ${
                          isActive
                            ? "bg-amber-400 text-amber-950 border-b-[4px] border-amber-600 shadow-md scale-105"
                            : "bg-white text-slate-700 border-2 border-amber-200 hover:border-amber-400 hover:bg-amber-50"
                        }`}
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. GAMES GRID */}
              <div className="mt-6">
                {visibleGames.length === 0 ? (
                  <EmptyState
                    title="Nenhum jogo encontrado"
                    description={
                      searchQuery
                        ? `Nenhum resultado para "${searchQuery}". Tente outro termo ou categoria.`
                        : "Não há jogos disponíveis nesta categoria no momento."
                    }
                    actionLabel="Ver todos os jogos"
                    onAction={() => {
                      setActiveCategory("todos");
                      setSearchQuery("");
                    }}
                  />
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {visibleGames.map((g: any) => (
                      <article
                        key={g.id}
                        className="group flex flex-col justify-between rounded-3xl border-2 border-amber-200/90 bg-white p-5 shadow-md transition-all hover:-translate-y-1 hover:border-amber-400 hover:shadow-xl"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-amber-100 border border-amber-200 text-3xl group-hover:scale-105 transition shadow-inner">
                              {g.emoji}
                            </div>
                            <span className="rounded-full bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-900">
                              {g.difficulty || "Fácil"}
                            </span>
                          </div>

                          <h3
                            className="mt-3 font-display text-lg font-black tracking-tight group-hover:text-emerald-700 transition"
                            style={{ color: "#064e3b" }}
                          >
                            <T>{g.title}</T>
                          </h3>
                          <div className="text-[11px] font-bold text-amber-800 mt-0.5">
                            {g.skill || "Habilidade Educacional"}
                          </div>
                          <p className="mt-1 text-xs text-slate-600 font-medium line-clamp-2 leading-relaxed">
                            <T>{g.desc}</T>
                          </p>
                        </div>

                        <div className="mt-5 pt-3 border-t border-amber-100 flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-500">
                            {g.bestScore ? `Recorde: ${g.bestScore}` : "Praticar 🌟"}
                          </span>
                          <button
                            onClick={() => {
                              const lang = g.id.startsWith("en-") ? "en-US" : "pt-BR";
                              speak(`${g.title}. ${g.desc}`, lang);
                              setGame(g.id);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-2 text-xs font-black text-amber-950 shadow-[0_3px_0_#b45309] hover:brightness-105 active:translate-y-1 active:shadow-none transition cursor-pointer"
                          >
                            <Play className="h-3.5 w-3.5 fill-current" />
                            <span>Jogar</span>
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            /* TELA DO JOGO ATIVO */
            <div className="rounded-[2.5rem] border-4 border-amber-300 bg-white p-5 sm:p-8 shadow-xl text-slate-800">
              <div className="mb-6 flex items-center justify-between border-b-2 border-amber-200 pb-4">
                <button
                  onClick={() => setGame(null)}
                  className="inline-flex items-center gap-1.5 rounded-2xl border-2 border-amber-300 bg-amber-100 px-4 py-2 text-xs font-black text-amber-900 shadow-sm hover:bg-amber-200 active:translate-y-0.5 transition cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" /> <span>Voltar para Jogos</span>
                </button>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-100 px-3 py-1 text-xs font-black text-amber-900">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" /> {stars} Estrelas
                  </span>
                </div>
                <h2
                  className="font-display text-base sm:text-xl font-black uppercase"
                  style={{ color: "#064e3b" }}
                >
                  {(() => {
                    const en = EN_GAMES.find((g) => g.id === game);
                    if (en) return en.title;
                    const pt = games.find((g: any) => g.id === game)?.title ?? "";
                    return <T>{pt}</T>;
                  })()}
                </h2>
              </div>
              <div className="text-slate-900">
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
            </div>
          )}
        </main>

        <SiteFooter mode="infantil" />
      </div>
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
                <span className="ml-2 text-xs opacity-70">(<T>{w.pt}</T>)</span>
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
                <span className="ml-2 text-xs opacity-70">(<T>{w.pt}</T>)</span>
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
        <T>{target.name}</T>
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

import { createFileRoute } from "@tanstack/react-router";
import { requireArea } from "@/lib/area-guard";
import { useEffect, useRef, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getStoriesConfig } from "@/lib/infantil-content.functions";
import { SiteHeader } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { EmptyState } from "@/components/education/empty-state";
import { Pagination } from "@/components/education/pagination";
import { LessonNavigation } from "@/components/education/lesson-navigation";
import { getNarrationUrl } from "@/lib/narration-cache";
import { setLastArea } from "@/lib/last-area";
import kidsCharacter from "@/assets/kids-menu-character.png";
import {
  BookOpen,
  Clock,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Search,
  X,
  Volume2,
  Pause,
  ArrowLeft,
  Sparkles,
  Star,
  Compass,
} from "lucide-react";

import josaImg from "@/assets/kids-stories/josa.jpg.asset.json";
import joaoImg from "@/assets/kids-stories/joao.jpg.asset.json";
import monteImg from "@/assets/kids-stories/monte.jpg.asset.json";
import linguaImg from "@/assets/kids-stories/lingua.jpg.asset.json";
import aldeiaAsset from "@/assets/kids-stories/aldeia.jpg.asset.json";
import aweImg from "@/assets/kids-stories/awe.jpg.asset.json";
import arteImg from "@/assets/kids-stories/arte.jpg.asset.json";

const monte = monteImg.url;
const ancianoImg = linguaImg.url;
const aldeiaImg = aldeiaAsset.url;
const dancaImg = aweImg.url;
const artesanatoImg = arteImg.url;
const albumJosaClean = josaImg.url;
const albumAnciao = { url: joaoImg.url };

export const Route = createFileRoute("/historias-infantil")({
  ssr: false,
  beforeLoad: () => requireArea("infantil"),
  head: () => ({
    meta: [
      { title: "Histórias da Aldeia — Awã Tech Infantil" },
      {
        name: "description",
        content:
          "Histórias e narrativas do povo Pataxó contadas para crianças: anciãos, aldeia, língua Patxôhã, floresta e cultura viva.",
      },
    ],
  }),
  component: HistoriasInfantilPage,
});

type Category = "todas" | "memoria" | "natureza" | "lingua" | "arte" | "tradicoes";

type Story = {
  id: string;
  chip: string;
  category: "memoria" | "natureza" | "lingua" | "arte" | "tradicoes";
  chipEmoji: string;
  title: string;
  highlight: string;
  readTime: string;
  image: string;
  paragraphs: string[];
  quote?: string;
  color: string;
  accent: string;
};

const STATIC_STORIES: Story[] = [
  {
    id: "josa",
    chip: "Guardião da memória",
    category: "memoria",
    chipEmoji: "🪶",
    title: "Ancião Josa",
    highlight: "quem nunca desistiu da aldeia",
    readTime: "3 min de leitura",
    image: albumJosaClean,
    paragraphs: [
      "Desde menino, Josa aprendeu que a terra é a mãe que alimenta, que guarda os antigos e ensina os novos.",
      "Ele lutou pela floresta, pelos rios e pela língua Patxôhã, para que nada do povo Pataxó se perdesse com o tempo.",
      "Hoje ele reúne as crianças em volta do fogo e conta as histórias da aldeia — para que a memória continue viva.",
    ],
    quote: "Nossa tradição não é coisa do passado. É o que mantém viva a nossa identidade.",
    color: "#f4a261",
    accent: "#2f6d3a",
  },
  {
    id: "joao",
    chip: "In memoriam",
    category: "memoria",
    chipEmoji: "🕯️",
    title: "Ancião João",
    highlight: "cantou até o último Awê",
    readTime: "3 min de leitura",
    image: albumAnciao.url,
    paragraphs: [
      "Seu João viu a aldeia crescer, enfrentou muitas lutas e nunca baixou a cabeça — sempre com maracá na mão e sorriso no rosto.",
      "Ele dizia que ser ancião é mais que ter cabelos brancos: é guardar as histórias e plantar hoje para que a aldeia floresça amanhã.",
      "Seu maracá silenciou, mas seu canto segue vivo em cada roda de Awê e em cada criança que aprende Patxôhã.",
    ],
    quote: "A voz que ensina é a mesma que aprende com os que estão chegando.",
    color: "#e76f51",
    accent: "#264653",
  },
  {
    id: "monte-pascoal",
    chip: "Terra Sagrada",
    category: "natureza",
    chipEmoji: "⛰️",
    title: "Monte Pascoal",
    highlight: "o guardião de pedra da aldeia",
    readTime: "4 min de leitura",
    image: monte,
    paragraphs: [
      "No coração da terra Pataxó ergue-se o Monte Pascoal — para nós, montanha sagrada onde habitam os espíritos da mata.",
      "Os mais velhos dizem que o monte vê tudo: viu os primeiros barcos chegarem e viu o povo resistir por séculos sem perder a raiz.",
      "Para a criança Pataxó, olhar o monte é lembrar de onde veio e quem é. Uma montanha não se curva ao vento — e nós também não.",
    ],
    quote: "O monte não fala português nem Patxôhã. Mas todo índio entende o que ele diz.",
    color: "#2a9d8f",
    accent: "#1b4332",
  },
  {
    id: "lingua-patxoha",
    chip: "Voz dos Antepassados",
    category: "lingua",
    chipEmoji: "🗣️",
    title: "A Língua Patxôhã",
    highlight: "as palavras que renasceram",
    readTime: "3 min de leitura",
    image: ancianoImg,
    paragraphs: [
      "Houve um tempo em que quiseram calar o Patxôhã. Disseram que era língua esquecida, coisa que já tinha passado.",
      "Mas a língua dos guerreiros não morre tão fácil. Ficou guardada no coração dos mais velhos, nas cantigas e nos nomes das plantas.",
      "Hoje, nas escolas da aldeia, as crianças voltam a falar Patxôhã bem alto — porque um povo que perde a língua perde a alma.",
    ],
    quote: "Cada palavra em Patxôhã que você aprende é uma semente que os antigos plantaram em você.",
    color: "#e9c46a",
    accent: "#582f0e",
  },
  {
    id: "aldeia-velha",
    chip: "Coração Pataxó",
    category: "tradicoes",
    chipEmoji: "🏕️",
    title: "A Vida na Aldeia Velha",
    highlight: "onde a terra é sagrada",
    readTime: "4 min de leitura",
    image: aldeiaImg,
    paragraphs: [
      "Na Aldeia Velha, o dia começa antes do sol — com o cheiro da lenha queimando e o som dos pássaros anunciando a manhã.",
      "As crianças correm livres entre as mangueiras, aprendem a cuidar da horta com as mães e a ouvir os mais velhos com respeito.",
      "Ali o tempo tem outro ritmo: não é o relógio que manda, é o ciclo das águas, das frutas e das luas cheias de celebração.",
    ],
    quote: "A aldeia não é só o lugar onde a gente mora. É o lugar que mora dentro da gente.",
    color: "#84a98c",
    accent: "#1f3a24",
  },
  {
    id: "danca-awe",
    chip: "Ritual Sagrado",
    category: "tradicoes",
    chipEmoji: "🪇",
    title: "O Sagrado Awê",
    highlight: "quando a aldeia inteira vira um só coração",
    readTime: "3 min de leitura",
    image: dancaImg,
    paragraphs: [
      "Quando o maracá começa a tocar e a poeira sobe do chão batido, ninguém fica de fora: velhos, moços e curumins entram na roda.",
      "O Awê não é dança para turista ver. É oração cantada, é agradecimento pela chuva, pela cura e pela força da comunidade.",
      "Os pés batem firmes na terra para avisar os espíritos: nós estamos aqui, juntos, vivos e cantando.",
    ],
    quote: "No Awê não tem quem dança melhor. Tem quem dança com mais coração.",
    color: "#f4a261",
    accent: "#78350f",
  },
  {
    id: "artesanato",
    chip: "Mãos que criam",
    category: "arte",
    chipEmoji: "🪵",
    title: "Arte em Madeira e Sementes",
    highlight: "histórias que a floresta esculpe",
    readTime: "3 min de leitura",
    image: artesanatoImg,
    paragraphs: [
      "Um pedaço de madeira caído na mata não é lixo: para o artesão Pataxó, é o corpo de um animal esperando para nascer.",
      "Com faca e paciência, as mãos vão descobrindo a tartaruga, o gavião, o tamanduá. Cada peça traz um espírito da mata.",
      "Colares de tento, sementes de açaí e folhas secas — nossa arte é feita daquilo que a terra nos dá, sem tirar mais do que precisa.",
    ],
    quote: "A floresta dá a madeira, a gente só ajuda ela a virar arte.",
    color: "#a37081",
    accent: "#3a1f28",
  },
];

let currentAudio: HTMLAudioElement | null = null;
let currentSetter: ((s: "idle" | "playing") => void) | null = null;
let currentUtterance: SpeechSynthesisUtterance | null = null;

function useStoryNarrator(text: string, currentLang: string = "pt") {
  const [state, setState] = useState<"idle" | "playing">("idle");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
      }
      if (currentUtterance && typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        currentUtterance = null;
      }
      if (currentSetter) {
        currentSetter("idle");
        currentSetter = null;
      }
    };
  }, []);

  const stop = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }
    if (currentUtterance && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      currentUtterance = null;
    }
    setState("idle");
    setProgress(0);
  };

  const play = async () => {
    if (state === "playing") {
      stop();
      return;
    }
    if (!text.trim()) return;

    try {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
      }
      if (currentUtterance && typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        currentUtterance = null;
      }
      if (currentSetter) currentSetter("idle");

      const lang = (currentLang || "pt").slice(0, 2).toLowerCase();
      const speechLang = lang === "en" ? "en-US" : lang === "es" ? "es-ES" : "pt-BR";

      // 1. Tenta obter narração de alta qualidade no idioma selecionado
      const url = await getNarrationUrl({ text, lang, mode: "story" });

      if (url) {
        const a = new Audio(url);
        a.onended = () => {
          setState("idle");
          setProgress(0);
        };
        a.ontimeupdate = () => {
          if (a.duration && Number.isFinite(a.duration) && a.duration > 0) {
            setProgress(a.currentTime / a.duration);
          }
        };
        a.onerror = () => {
          setState("idle");
          setProgress(0);
        };
        currentAudio = a;
        currentSetter = setState;
        await a.play();
        setState("playing");
        return;
      }

      // 2. Fallback imediato: síntese de voz nativa no idioma selecionado
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = speechLang;
        u.rate = 0.95;
        u.onend = () => {
          setState("idle");
          setProgress(0);
        };
        u.onerror = () => {
          setState("idle");
          setProgress(0);
        };
        currentUtterance = u;
        currentSetter = setState;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
        setState("playing");
      }
    } catch {
      setState("idle");
    }
  };

  return { state, progress, play, stop };
}

function HistoriasInfantilPage() {
  const { t } = useTranslation();
  const getFn = useServerFn(getStoriesConfig);

  const { data: configStories } = useQuery({
    queryKey: ["site_config", "infantil_stories"],
    queryFn: () => getFn(),
  });

  const stories = useMemo(() => {
    if (configStories && Array.isArray(configStories) && configStories.length > 0) {
      return configStories as Story[];
    }
    return STATIC_STORIES;
  }, [configStories]);

  useEffect(() => setLastArea("/infantil"), []);

  const [activeCategory, setActiveCategory] = useState<Category>("todas");
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [completedStories, setCompletedStories] = useState<Set<string>>(new Set());

  // Load completed stories
  useEffect(() => {
    try {
      const saved = localStorage.getItem("awa_kids_completed_stories");
      if (saved) setCompletedStories(new Set(JSON.parse(saved)));
    } catch {}
  }, []);

  const toggleCompleted = (id: string) => {
    setCompletedStories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem("awa_kids_completed_stories", JSON.stringify([...next]));
      } catch {}
      return next;
    });
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const STORIES_PER_PAGE = 6;

  // Reset page when category or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchQuery]);

  const filteredStories = useMemo(() => {
    return stories.filter((s) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = s.title.toLowerCase().includes(q);
        const matchesHighlight = s.highlight.toLowerCase().includes(q);
        const matchesBody = s.paragraphs.some((p) => p.toLowerCase().includes(q));
        if (!matchesTitle && !matchesHighlight && !matchesBody) return false;
      }
      if (activeCategory === "todas") return true;
      return s.category === activeCategory;
    });
  }, [stories, activeCategory, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredStories.length / STORIES_PER_PAGE));
  const paginatedStories = useMemo(() => {
    const start = (currentPage - 1) * STORIES_PER_PAGE;
    return filteredStories.slice(start, start + STORIES_PER_PAGE);
  }, [filteredStories, currentPage]);

  const categories: { id: Category; label: string; icon: string }[] = [
    { id: "todas", label: `Todas (${stories.length})`, icon: "✨" },
    { id: "memoria", label: "Memória", icon: "🪶" },
    { id: "natureza", label: "Natureza", icon: "🌿" },
    { id: "lingua", label: "Língua", icon: "🏹" },
    { id: "arte", label: "Arte", icon: "🪵" },
    { id: "tradicoes", label: "Tradições", icon: "🔥" },
  ];

  const currentStoryIndex = selectedStory
    ? stories.findIndex((s) => s.id === selectedStory.id)
    : -1;

  const { i18n } = useTranslation();
  const currentLang = (
    (typeof window !== "undefined" ? window.localStorage.getItem("awa_lang") : null) ||
    i18n.resolvedLanguage ||
    i18n.language ||
    "pt"
  ).slice(0, 2).toLowerCase();

  const narrationText = selectedStory
    ? `${selectedStory.title}. ${selectedStory.highlight}. ${selectedStory.paragraphs.join(" ")} ${selectedStory.quote ?? ""}`
    : "";

  const { state: audioState, progress: audioProgress, play: playAudio, stop: stopAudio } =
    useStoryNarrator(narrationText, currentLang);

  const handleOpenStory = (story: Story) => {
    setSelectedStory(story);
  };

  const handleCloseStory = () => {
    stopAudio();
    setSelectedStory(null);
  };

  const handleNextStory = () => {
    if (currentStoryIndex < stories.length - 1) {
      stopAudio();
      setSelectedStory(stories[currentStoryIndex + 1]);
    }
  };

  const handlePrevStory = () => {
    if (currentStoryIndex > 0) {
      stopAudio();
      setSelectedStory(stories[currentStoryIndex - 1]);
    }
  };

  return (
    <div className="kids-theme relative min-h-screen bg-[#fbf9f4] text-slate-800 font-sans overflow-x-clip selection:bg-amber-300 selection:text-amber-950">
      {/* Soft warm ambient lighting */}
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
          📖
        </span>
        <span
          className="absolute right-[8%] top-[190px] text-4xl"
          style={{ animation: "music-float 7s ease-in-out infinite 1.5s" }}
        >
          🪶
        </span>
        <span
          className="absolute left-[12%] top-[450px] text-3xl"
          style={{ animation: "music-float 8s ease-in-out infinite 0.7s" }}
        >
          ✨
        </span>
        <span
          className="absolute right-[14%] top-[520px] text-3xl"
          style={{ animation: "music-float 5.5s ease-in-out infinite 2s" }}
        >
          🌿
        </span>
        <span
          className="absolute left-[4%] top-[780px] text-3xl"
          style={{ animation: "music-float 9s ease-in-out infinite 1s" }}
        >
          🪵
        </span>
        <span
          className="absolute right-[6%] top-[860px] text-3xl"
          style={{ animation: "music-float 6.5s ease-in-out infinite 2.5s" }}
        >
          ⭐
        </span>
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <SiteHeader mode="infantil" />

        <main className="mx-auto w-full max-w-5xl flex-1 px-3 sm:px-6 pb-28 pt-4">
          {/* ========================================================= */}
          {/* 1. HERO PARCHMENT BANNER                                  */}
          {/* ========================================================= */}
          <section className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-5 rounded-[2.5rem] border-4 border-amber-300 bg-gradient-to-r from-[#fffef5] via-[#fef7e6] to-[#f5edd2] p-5 sm:p-7 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2 border-amber-300 bg-white shadow-md">
                <img
                  src={kidsCharacter}
                  alt="Mascote Awã"
                  className="h-full w-full object-cover object-top transform hover:scale-105 transition"
                  style={{ animation: "music-float 4s ease-in-out infinite" }}
                />
                <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-xs text-amber-950 font-black shadow-md border-2 border-white">
                  🪶
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1
                    className="font-display text-xl sm:text-2xl md:text-3xl font-black tracking-tight"
                    style={{ color: "#064e3b" }}
                  >
                    Histórias da Aldeia Pataxó
                  </h1>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 font-semibold mt-0.5">
                  Aprenda com os anciãos, os cantos sagrados e a sabedoria viva da floresta.
                </p>
              </div>
            </div>

            {/* Badges and Quick Start */}
            <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
              <div className="flex items-center gap-1.5 rounded-2xl border-2 border-amber-300 bg-white/95 px-3.5 py-2 text-xs font-black text-amber-900 shadow-sm">
                <BookOpen className="h-4 w-4 text-emerald-700" />
                <span>
                  {completedStories.size} de {stories.length} lidas
                </span>
              </div>

              {stories.length > 0 && (
                <button
                  onClick={() => handleOpenStory(stories[0])}
                  className="rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-2 text-xs font-black text-amber-950 shadow-[0_3px_0_#b45309] hover:brightness-105 active:translate-y-1 active:shadow-none transition cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Começar Primeira</span>
                </button>
              )}
            </div>
          </section>

          {/* ========================================================= */}
          {/* 2. SEARCH BAR & BOUNCY 3D CATEGORY PILLS                  */}
          {/* ========================================================= */}
          <div className="mb-6 flex flex-col gap-3.5">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-700" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar história ou personagem..."
                className="w-full rounded-2xl border-2 border-amber-300 bg-white pl-10 pr-9 py-2.5 text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 shadow-sm transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((c) => {
                const isActive = activeCategory === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveCategory(c.id)}
                    className={`flex items-center gap-1.5 rounded-2xl px-4 py-2 text-xs font-black transition-all cursor-pointer ${
                      isActive
                        ? "bg-amber-400 text-amber-950 border-2 border-amber-400 shadow-[0_3px_0_#b45309] scale-105"
                        : "bg-white text-slate-700 border-2 border-amber-200/90 hover:bg-amber-50 shadow-sm hover:border-amber-300"
                    }`}
                  >
                    <span>{c.icon}</span>
                    <span>{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status & Counter */}
          <div className="mb-4 flex items-center justify-between text-xs font-bold text-slate-600 px-1">
            <span>
              Mostrando {filteredStories.length > 0 ? (currentPage - 1) * STORIES_PER_PAGE + 1 : 0}–
              {Math.min(currentPage * STORIES_PER_PAGE, filteredStories.length)} de {filteredStories.length} histórias
            </span>
            {searchQuery && (
              <span className="text-amber-800 font-black">Filtro ativo: "{searchQuery}"</span>
            )}
          </div>

          {/* ========================================================= */}
          {/* 3. STORIES GRID (Clean, Bright White 3D Cards)             */}
          {/* ========================================================= */}
          <div className="mt-2">
            {filteredStories.length === 0 ? (
              <EmptyState
                title="Nenhuma história encontrada"
                description={
                  searchQuery
                    ? `Nenhum resultado para "${searchQuery}". Tente outro termo ou limpe a busca.`
                    : "Selecione outra categoria ou veja todas as histórias da aldeia."
                }
                actionLabel="Ver todas as histórias"
                onAction={() => {
                  setActiveCategory("todas");
                  setSearchQuery("");
                }}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {paginatedStories.map((story) => {
                  const isRead = completedStories.has(story.id);

                  return (
                    <article
                      key={story.id}
                      onClick={() => handleOpenStory(story)}
                      className="group flex flex-col justify-between overflow-hidden rounded-3xl border-2 border-amber-200/90 bg-white shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                    >
                      <div>
                        {/* Cover Image with Chip */}
                        <div className="relative aspect-[16/10] w-full overflow-hidden bg-amber-50">
                          <img
                            src={story.image}
                            alt={story.title}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          />
                          <div className="absolute top-3 left-3 rounded-xl bg-white/95 backdrop-blur-md px-2.5 py-1 text-[11px] font-black text-amber-950 border border-amber-300 shadow-sm flex items-center gap-1">
                            <span>{story.chipEmoji}</span>
                            <span>{story.chip}</span>
                          </div>
                          {isRead && (
                            <div className="absolute top-3 right-3 flex items-center gap-1 rounded-xl bg-emerald-600 px-2.5 py-1 text-[11px] font-black text-white shadow-sm border border-emerald-400">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Lida
                            </div>
                          )}
                        </div>

                        {/* Card Content */}
                        <div className="p-4 sm:p-5">
                          <h3
                            className="font-display text-lg font-black tracking-tight group-hover:text-emerald-700 transition"
                            style={{ color: "#064e3b" }}
                          >
                            {story.title}
                          </h3>
                          <div className="text-xs font-bold text-amber-800 mt-0.5">
                            {story.highlight}
                          </div>
                          <p className="mt-2 text-xs text-slate-600 font-medium line-clamp-2 leading-relaxed">
                            {story.paragraphs[0]}
                          </p>
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="px-4 pb-4 pt-2 sm:px-5 sm:pb-5 flex items-center justify-between border-t border-amber-100">
                        <span className="flex items-center gap-1 text-xs font-semibold text-slate-500">
                          <Clock className="h-3.5 w-3.5 text-amber-600" /> {story.readTime}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-3.5 py-1 text-xs font-black text-amber-950 shadow-sm group-hover:brightness-105 transition">
                          <span>Ler História</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          {/* Responsive Pagination Controls */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            className="mt-8"
          />
        </main>

        {/* ========================================================= */}
        {/* 4. DEDICATED STORY READER MODAL (Portaled to Body)         */}
        {/* ========================================================= */}
        {selectedStory && typeof document !== "undefined" &&
          createPortal(
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
              <div
                onClick={handleCloseStory}
                className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
                aria-hidden
              />

              <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] border-4 border-amber-300 bg-white text-slate-800 shadow-2xl p-5 sm:p-7">
                {/* Top Navigation Bar */}
                <div className="flex items-center justify-between pb-3.5 border-b-2 border-amber-200">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
                    <span className="cursor-pointer hover:underline" onClick={handleCloseStory}>
                      Histórias
                    </span>
                    <span>/</span>
                    <span
                      className="font-black truncate max-w-[200px]"
                      style={{ color: "#064e3b" }}
                    >
                      {selectedStory.title}
                    </span>
                  </div>

                  <button
                    onClick={handleCloseStory}
                    className="grid h-9 w-9 place-items-center rounded-full border-2 border-amber-300 bg-amber-50 text-amber-950 hover:bg-amber-100 hover:scale-105 active:scale-95 transition shadow-sm cursor-pointer"
                    aria-label="Fechar"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Story Header */}
                <div className="mt-4">
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 border border-amber-300 px-3 py-0.5 text-[11px] font-black text-amber-950 shadow-xs">
                    <span>{selectedStory.chipEmoji}</span>
                    <span>{selectedStory.chip}</span>
                  </span>
                  <h2
                    className="font-display text-2xl sm:text-3xl font-black mt-2 tracking-tight"
                    style={{ color: "#064e3b" }}
                  >
                    {selectedStory.title}
                  </h2>
                  <div className="text-xs sm:text-sm font-bold text-amber-800 mt-0.5">
                    {selectedStory.highlight} • {selectedStory.readTime}
                  </div>
                </div>

                {/* Story Image with Audio Play Bar */}
                <div className="relative mt-4 aspect-video w-full overflow-hidden rounded-2xl border-2 border-amber-300 bg-amber-50 shadow-md">
                  <img
                    src={selectedStory.image}
                    alt={selectedStory.title}
                    className="h-full w-full object-cover"
                  />

                  {/* Audio Narrator Bar */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center gap-3 rounded-2xl bg-white/95 backdrop-blur-md p-2.5 border-2 border-amber-300 shadow-lg">
                    <button
                      onClick={playAudio}
                      className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-3.5 py-1.5 text-xs font-black text-amber-950 shadow-[0_2px_0_#b45309] hover:brightness-105 active:translate-y-0.5 active:shadow-none transition cursor-pointer"
                    >
                      {audioState === "playing" ? (
                        <>
                          <Pause className="h-3.5 w-3.5 fill-current" />
                          <span>Pausar</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="h-3.5 w-3.5" />
                          <span>Ouvir História</span>
                        </>
                      )}
                    </button>

                    <div className="flex-1 h-2 rounded-full bg-amber-100 border border-amber-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-500 transition-all"
                        style={{ width: `${Math.round(audioProgress * 100)}%` }}
                      />
                    </div>

                    <span className="text-xs font-black text-amber-950">
                      {Math.round(audioProgress * 100)}%
                    </span>
                  </div>
                </div>

                {/* Story Reading Content */}
                <div className="mt-5 space-y-3.5 text-sm sm:text-base leading-relaxed text-slate-700 font-medium">
                  {selectedStory.paragraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}

                  {selectedStory.quote && (
                    <blockquote className="mt-4 rounded-2xl border-l-4 border-amber-400 bg-amber-50/80 p-4 italic text-sm sm:text-base text-amber-950 font-bold shadow-xs">
                      “{selectedStory.quote}”
                    </blockquote>
                  )}
                </div>

                {/* Mark as read button */}
                <div className="mt-6 pt-4 border-t-2 border-amber-100 flex items-center justify-between">
                  <button
                    onClick={() => toggleCompleted(selectedStory.id)}
                    className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-black transition-all shadow cursor-pointer active:translate-y-0.5 ${
                      completedStories.has(selectedStory.id)
                        ? "bg-emerald-600 text-white shadow-[0_3px_0_#064e3b]"
                        : "bg-white border-2 border-amber-300 text-amber-950 hover:bg-amber-50 shadow-[0_3px_0_#b45309]"
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>
                      {completedStories.has(selectedStory.id)
                        ? "✓ História Concluída"
                        : "Marcar como Concluída"}
                    </span>
                  </button>
                </div>

                {/* Reader Previous / Next Navigation */}
                <div className="mt-4">
                  <LessonNavigation
                    previousLabel="História Anterior"
                    onPrevious={currentStoryIndex > 0 ? handlePrevStory : undefined}
                    continueLabel="Próxima História"
                    onContinue={currentStoryIndex < stories.length - 1 ? handleNextStory : undefined}
                  />
                </div>
              </div>
            </div>,
            document.body
          )}

        <SiteFooter mode="infantil" />
      </div>
    </div>
  );
}

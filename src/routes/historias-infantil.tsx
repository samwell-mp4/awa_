import { createFileRoute } from "@tanstack/react-router";
import { requireArea } from "@/lib/area-guard";
import { useEffect, useRef, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getStoriesConfig } from "@/lib/infantil-content.functions";
import { SiteHeader } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { PageHeader } from "@/components/education/page-header";
import { EmptyState } from "@/components/education/empty-state";
import { Pagination } from "@/components/education/pagination";
import { LessonNavigation } from "@/components/education/lesson-navigation";
import { getNarrationUrl } from "@/lib/narration-cache";
import { setLastArea } from "@/lib/last-area";
import kidsBg from "@/assets/kids-menu-bg.jpg";
import { BookOpen, Clock, CheckCircle2, ChevronRight, ChevronLeft, Search, X, Volume2, Pause, ArrowLeft } from "lucide-react";

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
    quote: "Enquanto houver respeito e união, nosso povo seguirá forte.",
    color: "#ef476f",
    accent: "#118ab2",
  },
  {
    id: "origem",
    chip: "Origem e território",
    category: "natureza",
    chipEmoji: "🗺️",
    title: "A casa Pataxó",
    highlight: "é a Mata Atlântica",
    readTime: "2 min de leitura",
    image: monte,
    paragraphs: [
      "Os Pataxó vivem no sul da Bahia há muitos e muitos luares, guardando as praias, as matas e o sagrado Monte Pascoal.",
      "São quase 50 aldeias espalhadas pela Bahia e Minas Gerais — cada uma com sua história, seu cacique e seu jeito de cuidar da terra.",
    ],
    color: "#06d6a0",
    accent: "#264653",
  },
  {
    id: "lingua",
    chip: "Língua Patxôhã",
    category: "lingua",
    chipEmoji: "🗣️",
    title: "A língua do guerreiro",
    highlight: "está voltando a falar",
    readTime: "2 min de leitura",
    image: ancianoImg,
    paragraphs: [
      "O Patxôhã quase foi silenciado pelo tempo, mas os anciãos e os professores estão trazendo cada palavra de volta.",
      "Cada nova palavra aprendida é um ancestral que volta a falar — e é assim que a língua fica viva no coração das crianças.",
    ],
    color: "#ffd166",
    accent: "#8b5a2b",
  },
  {
    id: "aldeia",
    chip: "Vida na aldeia",
    category: "natureza",
    chipEmoji: "🏡",
    title: "Nossa casa de palha",
    highlight: "vive em roda",
    readTime: "2 min de leitura",
    image: aldeiaImg,
    paragraphs: [
      "Na aldeia, todo mundo se cuida: os mais velhos ensinam, as crianças brincam e a comida vem da terra, do rio e do mar.",
      "No pátio central acontecem os conselhos, as danças e as festas — porque tudo o que é bonito, a gente vive junto.",
    ],
    color: "#8ecae6",
    accent: "#023047",
  },
  {
    id: "ritual",
    chip: "Espiritualidade e dança",
    category: "tradicoes",
    chipEmoji: "🔥",
    title: "O Awê é o canto",
    highlight: "que abraça a floresta",
    readTime: "3 min de leitura",
    image: dancaImg,
    paragraphs: [
      "No Awê, os corpos pintados de urucum e jenipapo dançam em roda, ao som do maracá, unindo o povo aos encantados da mata.",
      "É um agradecimento cantado: à floresta, aos animais e a cada estrela que vela a aldeia à noite.",
    ],
    color: "#e76f51",
    accent: "#2a9d8f",
  },
  {
    id: "arte",
    chip: "Arte e sabedoria",
    category: "arte",
    chipEmoji: "🎨",
    title: "Grafismos e sementes",
    highlight: "contam quem nós somos",
    readTime: "2 min de leitura",
    image: artesanatoImg,
    paragraphs: [
      "Com sementes de tento, pau-brasil e açaí, mãos pacientes tecem colares que protegem e enfeitam o corpo de quem canta.",
      "Cada risquinho, cada grafismo é uma palavra antiga — arte que também é escrita ancestral.",
    ],
    color: "#c77dff",
    accent: "#5a189a",
  },
];

let currentAudio: HTMLAudioElement | null = null;
let currentSetter: ((s: "idle") => void) | null = null;

function useStoryNarrator(text: string) {
  const { i18n } = useTranslation();
  const [state, setState] = useState<"idle" | "loading" | "playing">("idle");
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);
  const lang = (i18n.language || "pt").slice(0, 2).toLowerCase();

  useEffect(() => {
    stop();
    audioRef.current = null;
    urlRef.current = null;
  }, [text, lang]);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
      urlRef.current = null;
    };
  }, []);

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setState("idle");
    setProgress(0);
  };

  const play = async () => {
    if (state === "playing") return stop();
    if (currentAudio && currentAudio !== audioRef.current) {
      try {
        currentAudio.pause();
      } catch {}
      currentSetter?.("idle");
    }
    setState("loading");
    try {
      let url = urlRef.current;
      if (!url) {
        url = await getNarrationUrl({ text, lang, mode: "story", voice: "onyx" });
        if (!url) {
          setState("idle");
          return;
        }
        urlRef.current = url;
      }

      const a = audioRef.current ?? new Audio();
      audioRef.current = a;
      a.src = url;
      a.currentTime = 0;
      a.ontimeupdate = () => {
        if (a.duration > 0) setProgress(a.currentTime / a.duration);
      };
      a.onended = () => {
        setState("idle");
        setProgress(0);
      };
      currentAudio = a;
      currentSetter = setState;
      await a.play();
      setState("playing");
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

  const categories: { id: Category; label: string }[] = [
    { id: "todas", label: `Todas (${stories.length})` },
    { id: "memoria", label: "Memória" },
    { id: "natureza", label: "Natureza" },
    { id: "lingua", label: "Língua" },
    { id: "arte", label: "Arte" },
    { id: "tradicoes", label: "Tradições" },
  ];

  const currentStoryIndex = selectedStory
    ? stories.findIndex((s) => s.id === selectedStory.id)
    : -1;

  const narrationText = selectedStory
    ? `${selectedStory.title}. ${selectedStory.highlight}. ${selectedStory.paragraphs.join(" ")} ${selectedStory.quote ?? ""}`
    : "";

  const { state: audioState, progress: audioProgress, play: playAudio, stop: stopAudio } =
    useStoryNarrator(narrationText);

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

      <div className="relative z-10 flex min-h-screen flex-col">
        <SiteHeader mode="infantil" />

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-28 pt-4 sm:px-6">
          <PageHeader
            breadcrumbs={[
              { label: "Início", href: "/infantil" },
              { label: "Histórias da Aldeia" },
            ]}
            title="Histórias da Aldeia"
            description="Histórias sobre cultura, sabedoria dos mais velhos e os mistérios da floresta viva."
            badge={`${completedStories.size} de ${stories.length} histórias lidas`}
            primaryAction={
              stories.length > 0
                ? {
                    label: "Começar Primeira História",
                    onClick: () => handleOpenStory(stories[0]),
                  }
                : undefined
            }
          />

          {/* Search Bar & Category Filters */}
          <div className="mt-6 flex flex-col gap-3">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d4a373]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar história ou personagem..."
                className="w-full rounded-xl border border-[#633916] bg-[#1a0e05]/95 pl-10 pr-9 py-2.5 text-xs text-[#fefae0] placeholder-[#d4a373]/60 focus:border-[#ffd166] focus:outline-none focus:ring-1 focus:ring-[#ffd166]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#d4a373] hover:text-[#fefae0]"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveCategory(c.id)}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition shadow ${
                    activeCategory === c.id
                      ? "bg-[#ffd166] text-[#1a0e04] shadow-md"
                      : "awa-card-3 text-[#fefae0]/80 hover:text-[#ffd166] hover:border-[#ffd166]/40"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Status & Counter */}
          <div className="mt-4 flex items-center justify-between text-xs text-[#d4a373] px-1">
            <span>
              Mostrando {filteredStories.length > 0 ? (currentPage - 1) * STORIES_PER_PAGE + 1 : 0}–
              {Math.min(currentPage * STORIES_PER_PAGE, filteredStories.length)} de {filteredStories.length} histórias
            </span>
            {searchQuery && (
              <span className="text-[#ffd166]">Filtro de busca ativo: "{searchQuery}"</span>
            )}
          </div>

          {/* Stories Grid */}
          <div className="mt-3">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedStories.map((story) => {
                  const isRead = completedStories.has(story.id);

                  return (
                    <div
                      key={story.id}
                      onClick={() => handleOpenStory(story)}
                      className="awa-card-2 group flex flex-col justify-between overflow-hidden rounded-2xl transition shadow-md hover:-translate-y-1 hover:border-[#ffd166]/50 cursor-pointer"
                    >
                      <div>
                        {/* Cover Image */}
                        <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/40">
                          <img
                            src={story.image}
                            alt={story.title}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          />
                          <div className="absolute top-2.5 left-2.5 rounded-md bg-[#180e07]/85 px-2 py-0.5 text-[10px] font-bold text-[#ffd166] border border-[#633916]">
                            {story.chip}
                          </div>
                          {isRead && (
                            <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-md bg-[#1b4332]/90 px-2 py-0.5 text-[10px] font-bold text-[#4ade80] border border-[#4ade80]/40">
                              <CheckCircle2 className="h-3 w-3" /> Lida
                            </div>
                          )}
                        </div>

                        {/* Card Content */}
                        <div className="p-4">
                          <h3 className="text-base font-black text-[#fefae0] group-hover:text-[#ffd166] transition">
                            {story.title}
                          </h3>
                          <div className="text-xs text-[#d4a373] mt-0.5">
                            {story.highlight}
                          </div>
                          <p className="mt-2 text-xs text-[#fefae0]/75 line-clamp-2 leading-relaxed">
                            {story.paragraphs[0]}
                          </p>
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="px-4 pb-4 pt-2 flex items-center justify-between border-t border-[#633916]/30">
                        <span className="flex items-center gap-1 text-[11px] text-[#d4a373]">
                          <Clock className="h-3 w-3" /> {story.readTime}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#ffd166] group-hover:translate-x-0.5 transition">
                          <span>Ler</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </div>
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

        {/* Dedicated Story Reader Modal */}
        {selectedStory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
            <div
              onClick={handleCloseStory}
              className="fixed inset-0 bg-black/85 backdrop-blur-sm"
              aria-hidden
            />

            <div className="relative z-10 w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl border border-[#ffd166]/50 bg-[#1e1107] text-[#fefae0] shadow-2xl p-5 sm:p-7">
              {/* Top Navigation bar */}
              <div className="flex items-center justify-between pb-3 border-b border-[#633916]">
                <div className="flex items-center gap-2 text-xs text-[#d4a373]">
                  <span className="cursor-pointer hover:underline" onClick={handleCloseStory}>
                    Histórias
                  </span>
                  <span>/</span>
                  <span className="text-[#ffd166] font-bold truncate max-w-[200px]">
                    {selectedStory.title}
                  </span>
                </div>

                <button
                  onClick={handleCloseStory}
                  className="grid h-8 w-8 place-items-center rounded-full bg-[#251408] border border-[#633916] text-[#ffd166] hover:bg-[#331c0e] transition"
                  aria-label="Fechar"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Story Header */}
              <div className="mt-4">
                <span className="rounded-md bg-[#251408] border border-[#633916] px-2 py-0.5 text-[10px] font-bold text-[#ffd166]">
                  {selectedStory.chip}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#ffd166] mt-2">
                  {selectedStory.title}
                </h2>
                <div className="text-xs text-[#d4a373] mt-0.5">
                  {selectedStory.highlight} • {selectedStory.readTime}
                </div>
              </div>

              {/* Story Image with Audio Play Bar */}
              <div className="relative mt-4 aspect-video w-full overflow-hidden rounded-2xl border border-[#633916] bg-black/40">
                <img
                  src={selectedStory.image}
                  alt={selectedStory.title}
                  className="h-full w-full object-cover"
                />

                <div className="absolute bottom-3 left-3 right-3 flex items-center gap-3 rounded-xl bg-[#180e07]/90 backdrop-blur-md p-2.5 border border-[#633916]">
                  <button
                    onClick={playAudio}
                    className="flex items-center gap-1.5 rounded-lg bg-[#ffd166] px-3 py-1.5 text-xs font-black text-[#1a0e04] shadow hover:brightness-110 transition"
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

                  <div className="flex-1 h-2 rounded-full bg-black/60 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#2a9d8f] to-[#4ade80] transition-all"
                      style={{ width: `${Math.round(audioProgress * 100)}%` }}
                    />
                  </div>

                  <span className="text-[11px] font-bold text-[#ffd166]">
                    {Math.round(audioProgress * 100)}%
                  </span>
                </div>
              </div>

              {/* Story Reading Content */}
              <div className="mt-5 space-y-3.5 text-sm sm:text-base leading-relaxed text-[#fefae0]/90">
                {selectedStory.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}

                {selectedStory.quote && (
                  <blockquote className="mt-4 rounded-xl border-l-4 border-[#ffd166] bg-[#251408] p-4 italic text-sm text-[#ffd166]">
                    “{selectedStory.quote}”
                  </blockquote>
                )}
              </div>

              {/* Mark as read button */}
              <div className="mt-6 pt-4 border-t border-[#633916] flex items-center justify-between">
                <button
                  onClick={() => toggleCompleted(selectedStory.id)}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition shadow ${
                    completedStories.has(selectedStory.id)
                      ? "bg-[#2a9d8f] text-white"
                      : "bg-[#251408] border border-[#633916] text-[#ffd166] hover:border-[#ffd166]"
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
                  nextLabel="Próxima História"
                  onNext={currentStoryIndex < stories.length - 1 ? handleNextStory : undefined}
                />
              </div>
            </div>
          </div>
        )}

        <SiteFooter mode="infantil" />
      </div>
    </div>
  );
}

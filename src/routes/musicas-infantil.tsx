import { createFileRoute } from "@tanstack/react-router";
import { requireArea } from "@/lib/area-guard";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Pause,
  Play,
  Heart,
  Clock,
  CheckCircle2,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { stopSpeak } from "@/lib/speak";
import kidsBg from "@/assets/kids-menu-bg.jpg";
import { SiteHeader } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { PageHeader } from "@/components/education/page-header";
import { EmptyState } from "@/components/education/empty-state";
import { Pagination } from "@/components/education/pagination";
import { MiniPlayer, type MiniPlayerSong as Song } from "@/components/kids/MiniPlayer";
import { getSiteConfig } from "@/lib/admin-layout.functions";

export const Route = createFileRoute("/musicas-infantil")({
  ssr: false,
  beforeLoad: () => requireArea("infantil"),
  head: () => ({
    meta: [
      { title: "Músicas e Cânticos — Awã Tech Infantil" },
      {
        name: "description",
        content:
          "Cantigas indígenas do Awã Tech: cânticos sagrados, maracá e melodias da floresta para as crianças cantarem juntas.",
      },
    ],
  }),
  component: MusicasInfantilPage,
});

function formatDuration(sec: number | null | undefined): string {
  if (!sec || isNaN(sec)) return "2:30";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

type FilterType = "todas" | "patxoha" | "portugues" | "bilingue" | "ouvidas" | "favoritas";

const ITEMS_PER_PAGE = 9;

function MusicasInfantilPage() {
  const { t } = useTranslation();
  const getFn = useServerFn(getSiteConfig);
  const { data: branding } = useQuery({
    queryKey: ["site_config", "branding"],
    queryFn: () => getFn({ data: "branding" }),
  });

  const { data: songs = [], isLoading } = useQuery({
    queryKey: ["songs_infantil"],
    staleTime: 1000 * 60 * 30,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("songs")
        .select(
          "id,title,artist,audio_url,cover_url,language,lyrics_indigenous,lyrics_pt,lyrics_pt_en,lyrics_pt_es,duration_seconds,sync_offsets,sync_times,style",
        )
        .eq("is_active", true)
        .order("order_index")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any as Song[];
    },
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("todas");
  const [currentPage, setCurrentPage] = useState(1);
  const [playing, setPlaying] = useState<Song | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const [listenedIds, setListenedIds] = useState<Set<string>>(new Set());
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  // Load listened & favorites from localStorage
  useEffect(() => {
    try {
      const savedListened = localStorage.getItem("awa_kids_listened_songs");
      if (savedListened) setListenedIds(new Set(JSON.parse(savedListened)));
      const savedFavs = localStorage.getItem("awa_kids_fav_songs");
      if (savedFavs) setFavoriteIds(new Set(JSON.parse(savedFavs)));
    } catch {}
  }, []);

  // Reset page when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, searchQuery]);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem("awa_kids_fav_songs", JSON.stringify([...next]));
      } catch {}
      return next;
    });
  };

  const handlePlaySong = (song: Song) => {
    stopSpeak();
    if (playing?.id === song.id) {
      setPlaying(null);
      setIsMaximized(false);
    } else {
      setPlaying(song);
      setIsMaximized(true);
      setListenedIds((prev) => {
        const next = new Set(prev).add(song.id);
        try {
          localStorage.setItem("awa_kids_listened_songs", JSON.stringify([...next]));
        } catch {}
        return next;
      });
    }
  };

  const filteredSongs = useMemo(() => {
    return songs.filter((s) => {
      // Search matching
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = (s.title || "").toLowerCase().includes(q);
        const matchesArtist = (s.artist || "").toLowerCase().includes(q);
        const matchesLyrics =
          (s.lyrics_indigenous || "").toLowerCase().includes(q) ||
          (s.lyrics_pt || "").toLowerCase().includes(q);
        if (!matchesTitle && !matchesArtist && !matchesLyrics) return false;
      }

      // Filter category
      if (activeFilter === "todas") return true;
      if (activeFilter === "favoritas") return favoriteIds.has(s.id);
      if (activeFilter === "ouvidas") return listenedIds.has(s.id);
      const lang = (s.language || "").toLowerCase();
      if (activeFilter === "patxoha") return lang.includes("patx") || lang.includes("ind");
      if (activeFilter === "portugues") return lang.includes("port");
      if (activeFilter === "bilingue") return lang.includes("biling") || (s.lyrics_indigenous && s.lyrics_pt);
      return true;
    });
  }, [songs, activeFilter, searchQuery, favoriteIds, listenedIds]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredSongs.length / ITEMS_PER_PAGE));
  const paginatedSongs = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredSongs.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredSongs, currentPage]);

  const filterButtons: { id: FilterType; label: string }[] = [
    { id: "todas", label: `Todas (${songs.length})` },
    { id: "patxoha", label: "Patxôhã" },
    { id: "portugues", label: "Português" },
    { id: "bilingue", label: "Bilíngue" },
    { id: "ouvidas", label: `Ouvidas (${listenedIds.size})` },
    { id: "favoritas", label: `Favoritas (${favoriteIds.size})` },
  ];

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
      {/* High-contrast atmospheric scrim layer */}
      <div aria-hidden className="awa-bg-scrim pointer-events-none fixed inset-0" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <SiteHeader mode="infantil" />

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-28 pt-4 sm:px-6">
          <PageHeader
            breadcrumbs={[
              { label: "Início", href: "/infantil" },
              { label: "Músicas e Cânticos" },
            ]}
            title="Músicas e Cânticos"
            description="Aprenda cantos, palavras e histórias ancestrais através da música e do toque sagrado do maracá."
            badge={`${songs.length} cantigas • ${listenedIds.size} ouvidas`}
            primaryAction={
              songs.length > 0
                ? {
                    label: playing ? "Pausar Reprodução" : "Continuar Ouvindo",
                    onClick: () => {
                      const nextToPlay = songs.find((s) => !listenedIds.has(s.id)) || songs[0];
                      if (nextToPlay) handlePlaySong(nextToPlay);
                    },
                  }
                : undefined
            }
          />

          {/* Search Bar & Filters Controls */}
          <div className="mt-6 flex flex-col gap-3">
            {/* Search Input */}
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d4a373]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar cantiga, artista ou letra..."
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

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              {filterButtons.map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setActiveFilter(btn.id)}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition shadow ${
                    activeFilter === btn.id
                      ? "bg-[#ffd166] text-[#1a0e04] shadow-md"
                      : "awa-card-3 text-[#fefae0]/80 hover:text-[#ffd166] hover:border-[#ffd166]/40"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Status & Counter */}
          <div className="mt-4 flex items-center justify-between text-xs text-[#d4a373] px-1">
            <span>
              Mostrando {filteredSongs.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}–
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredSongs.length)} de {filteredSongs.length} cantigas
            </span>
            {searchQuery && (
              <span className="text-[#ffd166]">Filtro de busca ativo: "{searchQuery}"</span>
            )}
          </div>

          {/* Songs Grid / Library */}
          <div className="mt-3">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="awa-card-2 h-24 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : filteredSongs.length === 0 ? (
              <EmptyState
                title="Nenhuma cantiga encontrada"
                description={
                  searchQuery
                    ? `Nenhum resultado para "${searchQuery}". Tente outro termo ou limpe a busca.`
                    : "Tente alterar os filtros selecionados para explorar outros cânticos da aldeia."
                }
                actionLabel="Limpar filtros e busca"
                onAction={() => {
                  setActiveFilter("todas");
                  setSearchQuery("");
                }}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {paginatedSongs.map((s) => {
                  const isPlaying = playing?.id === s.id;
                  const isFav = favoriteIds.has(s.id);
                  const isListened = listenedIds.has(s.id);

                  return (
                    <div
                      key={s.id}
                      onClick={() => handlePlaySong(s)}
                      className={`awa-card-2 group flex items-center gap-3.5 rounded-2xl p-3.5 transition cursor-pointer shadow-md hover:-translate-y-0.5 ${
                        isPlaying
                          ? "border-[#ffd166] bg-[#2a170a]"
                          : "hover:border-[#ffd166]/50"
                      }`}
                    >
                      {/* Play / Thumbnail button */}
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-[#251408] border border-[#633916] flex items-center justify-center">
                        {isPlaying ? (
                          <div className="grid h-8 w-8 place-items-center rounded-full bg-[#ffd166] text-[#1a0e04]">
                            <Pause className="h-4 w-4 fill-current" />
                          </div>
                        ) : (
                          <div className="grid h-8 w-8 place-items-center rounded-full bg-[#331c0e] text-[#ffd166] group-hover:scale-110 transition">
                            <Play className="ml-0.5 h-4 w-4 fill-current" />
                          </div>
                        )}
                      </div>

                      {/* Song Information */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="rounded bg-[#251408] px-1.5 py-0.5 text-[9px] font-black uppercase text-[#ffd166] border border-[#633916]">
                            {s.language || "Patxôhã"}
                          </span>
                          {isListened && (
                            <span className="flex items-center gap-0.5 text-[10px] text-[#2a9d8f] font-semibold">
                              <CheckCircle2 className="h-3 w-3" /> Ouvida
                            </span>
                          )}
                        </div>

                        <div className="truncate font-bold text-sm text-[#fefae0] mt-1 group-hover:text-[#ffd166]">
                          {s.title}
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-[#d4a373] mt-0.5">
                          <span>{s.artist || "Povo Pataxó"}</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5">
                            <Clock className="h-3 w-3" /> {formatDuration(s.duration_seconds)}
                          </span>
                        </div>
                      </div>

                      {/* Favorite Button */}
                      <button
                        onClick={(e) => toggleFavorite(s.id, e)}
                        className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border transition ${
                          isFav
                            ? "border-red-500/50 bg-red-950/60 text-red-400"
                            : "border-white/10 bg-transparent text-white/40 hover:text-white"
                        }`}
                        title={isFav ? "Remover dos favoritos" : "Favoritar"}
                      >
                        <Heart className={`h-4 w-4 ${isFav ? "fill-current" : ""}`} />
                      </button>
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

        {/* Global MiniPlayer Integration */}
        {playing && (
          <MiniPlayer
            song={playing}
            branding={branding}
            onClose={() => {
              setPlaying(null);
              setIsMaximized(false);
            }}
            isMaximized={isMaximized}
            onToggleMaximize={() => setIsMaximized((prev) => !prev)}
          />
        )}

        <SiteFooter mode="infantil" />
      </div>
    </div>
  );
}

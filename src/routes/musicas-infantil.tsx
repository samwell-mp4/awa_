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
  Sparkles,
  Music,
  Disc3,
  Shuffle,
  Volume2,
  Compass,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { stopSpeak } from "@/lib/speak";
import kidsCharacter from "@/assets/kids-menu-character.png";
import { SiteHeader } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { EmptyState } from "@/components/education/empty-state";
import { Pagination } from "@/components/education/pagination";
import { MiniPlayer, type MiniPlayerSong as Song } from "@/components/kids/MiniPlayer";
import { getSiteConfig } from "@/lib/admin-layout.functions";
import { getSongSyncConfig } from "@/data/kids-songs-sync";

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
  if (!sec || isNaN(sec)) return "1:30";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

type FilterType = "todas" | "patxoha" | "portugues" | "bilingue" | "ouvidas" | "favoritas";

const ITEMS_PER_PAGE = 9;

/** Animated Sound Equalizer Waves indicator */
function SoundWavesIndicator({ isPlaying }: { isPlaying: boolean }) {
  if (!isPlaying) return null;
  return (
    <span className="flex items-center gap-0.5 h-3.5 px-0.5" aria-hidden>
      <span className="w-1 bg-amber-400 rounded-full h-3 animate-[pulse_0.6s_ease-in-out_infinite]" />
      <span className="w-1 bg-amber-400 rounded-full h-4 animate-[pulse_0.8s_ease-in-out_infinite_0.15s]" />
      <span className="w-1 bg-amber-400 rounded-full h-2 animate-[pulse_0.5s_ease-in-out_infinite_0.3s]" />
    </span>
  );
}

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
      return (data || []).map((s) => {
        const sync = getSongSyncConfig(s);
        return {
          ...s,
          duration_seconds: s.duration_seconds || sync.durationSeconds,
          sync_times: s.sync_times && s.sync_times.length > 0 ? s.sync_times : sync.syncTimes,
        };
      }) as any as Song[];
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
    setPlaying(song);
    setIsMaximized(true);
    setListenedIds((prev) => {
      const next = new Set(prev).add(song.id);
      try {
        localStorage.setItem("awa_kids_listened_songs", JSON.stringify([...next]));
      } catch {}
      return next;
    });
  };

  const playRandomSong = () => {
    if (songs.length === 0) return;
    const pool = songs.filter((s) => !listenedIds.has(s.id));
    const nextSong = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : songs[Math.floor(Math.random() * songs.length)];
    if (nextSong) handlePlaySong(nextSong);
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

  const filterButtons: { id: FilterType; label: string; icon: string }[] = [
    { id: "todas", label: `Todas (${songs.length})`, icon: "🌟" },
    { id: "patxoha", label: "Patxôhã", icon: "🏹" },
    { id: "portugues", label: "Português", icon: "🍃" },
    { id: "bilingue", label: "Bilíngue", icon: "✨" },
    { id: "ouvidas", label: `Ouvidas (${listenedIds.size})`, icon: "✅" },
    { id: "favoritas", label: `Favoritas (${favoriteIds.size})`, icon: "❤️" },
  ];

  return (
    <div className="kids-theme relative min-h-screen bg-[#fbf9f4] text-slate-800 font-sans overflow-x-clip selection:bg-amber-300 selection:text-amber-950">
      {/* Soft warm ambient lighting for kids */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(254,243,199,0.5),rgba(255,255,255,0))]"
      />

      {/* Floating Animated Musical Notes & Forest Icons in Background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden select-none z-0 opacity-40"
      >
        <span
          className="absolute left-[5%] top-[120px] text-3xl"
          style={{ animation: "music-float 6s ease-in-out infinite" }}
        >
          🎵
        </span>
        <span
          className="absolute right-[8%] top-[180px] text-4xl"
          style={{ animation: "music-float 7s ease-in-out infinite 1.5s" }}
        >
          🎶
        </span>
        <span
          className="absolute left-[12%] top-[450px] text-3xl"
          style={{ animation: "music-float 8s ease-in-out infinite 0.7s" }}
        >
          🪘
        </span>
        <span
          className="absolute right-[15%] top-[520px] text-2xl"
          style={{ animation: "music-float 5.5s ease-in-out infinite 2s" }}
        >
          ✨
        </span>
        <span
          className="absolute left-[3%] top-[750px] text-3xl"
          style={{ animation: "music-float 9s ease-in-out infinite 1s" }}
        >
          🦜
        </span>
        <span
          className="absolute right-[5%] top-[850px] text-3xl"
          style={{ animation: "music-float 6.5s ease-in-out infinite 2.5s" }}
        >
          🌿
        </span>
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Top Header Infantil */}
        <SiteHeader mode="infantil" />

        <main className="mx-auto w-full max-w-5xl flex-1 px-3 sm:px-6 pb-28 pt-4">
          {/* ========================================================
              LIVELY VILLAGE MUSIC HERO BANNER
             ======================================================== */}
          <section className="relative mb-6 overflow-hidden rounded-[2.5rem] border-4 border-amber-300 bg-gradient-to-r from-[#fffef5] via-[#fef7e6] to-[#f5edd2] p-5 sm:p-7 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
              <div className="flex items-center gap-4">
                {/* Animated Character Avatar */}
                <div className="relative shrink-0">
                  <img
                    src={kidsCharacter}
                    alt="Mascote da Aldeia"
                    className="h-16 w-16 sm:h-20 sm:w-20 object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.18)] transform hover:scale-105 transition"
                    style={{ animation: "music-float 4s ease-in-out infinite" }}
                  />
                  <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-xs text-amber-950 font-black shadow-md border-2 border-white">
                    🪘
                  </span>
                </div>

                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 border border-amber-300 px-3 py-0.5 text-xs font-black uppercase tracking-wider text-amber-900">
                    <Music className="h-3.5 w-3.5 text-emerald-800" />
                    ✦ Cantigas e Cânticos da Aldeia • Patxôhã ✦
                  </div>
                  <h1
                    className="mt-1.5 font-display text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight"
                    style={{ color: "#064e3b" }}
                  >
                    Músicas e Cânticos Sagrados
                  </h1>
                  <p className="mt-1 text-xs sm:text-sm text-slate-700 max-w-xl font-semibold leading-relaxed">
                    Cante, dance e aprenda a língua Pataxó! Toque nas cantigas para ouvir a letra com sincronia sagrada e o maracá.
                  </p>
                </div>
              </div>

              {/* Action & Stats Pill */}
              <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3 bg-white/95 border-2 border-amber-300 rounded-2xl p-3 sm:p-4 shrink-0 shadow-sm">
                <button
                  type="button"
                  onClick={playRandomSong}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-amber-950 shadow-[0_4px_0_#b45309] hover:brightness-105 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
                >
                  <Shuffle className="h-4 w-4" />
                  <span>Tocar Cântico</span>
                </button>

                <div className="text-right">
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-800 flex items-center justify-end gap-1">
                    <Sparkles className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                    {listenedIds.size} de {songs.length} ouvidas
                  </span>
                  <div className="w-24 sm:w-32 h-2.5 rounded-full bg-amber-100 overflow-hidden border border-amber-300 mt-1">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-emerald-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${songs.length > 0 ? Math.round((listenedIds.size / songs.length) * 100) : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================
              SEARCH BAR & FUN FILTER PILLS
             ======================================================== */}
          <div className="mt-6 flex flex-col gap-4">
            {/* Search Input */}
            <div className="relative w-full max-w-lg">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar cantiga, artista ou palavra..."
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

            {/* Bouncy Filter Pills */}
            <div className="flex flex-wrap gap-2 sm:gap-2.5">
              {filterButtons.map((btn) => {
                const isActive = activeFilter === btn.id;
                return (
                  <button
                    key={btn.id}
                    onClick={() => setActiveFilter(btn.id)}
                    className={`inline-flex items-center gap-1.5 rounded-2xl px-4 py-2 text-xs sm:text-sm font-black transition-all transform active:translate-y-0.5 cursor-pointer shadow-sm ${
                      isActive
                        ? "bg-amber-400 text-amber-950 border-b-[4px] border-amber-600 shadow-md scale-105"
                        : "bg-white text-slate-700 border-2 border-amber-200/80 hover:border-amber-400 hover:bg-amber-50"
                    }`}
                  >
                    <span>{btn.icon}</span>
                    <span>{btn.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status & Counter */}
          <div className="mt-4 flex items-center justify-between text-xs font-bold text-slate-600 px-1">
            <span>
              Mostrando {filteredSongs.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}–
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredSongs.length)} de {filteredSongs.length} cantigas
            </span>
            {searchQuery && (
              <span className="text-amber-800 font-extrabold">Filtro de busca ativo: "{searchQuery}"</span>
            )}
          </div>

          {/* ========================================================
              SONGS GRID / ANIMATED 3D CARDS
             ======================================================== */}
          <div className="mt-4">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-28 rounded-3xl bg-white border-2 border-amber-200 animate-pulse shadow-sm" />
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedSongs.map((s) => {
                  const isPlaying = playing?.id === s.id;
                  const isFav = favoriteIds.has(s.id);
                  const isListened = listenedIds.has(s.id);

                  return (
                    <article
                      key={s.id}
                      onClick={() => handlePlaySong(s)}
                      className={`relative overflow-hidden rounded-3xl bg-white p-4 border-2 transition-all cursor-pointer shadow-md hover:shadow-xl hover:-translate-y-1 group ${
                        isPlaying
                          ? "border-emerald-500 ring-4 ring-emerald-300/40 bg-gradient-to-br from-emerald-50/60 to-white"
                          : "border-amber-200 hover:border-amber-400"
                      }`}
                    >
                      {/* Animated playing indicator bar on top */}
                      {isPlaying && (
                        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-400 via-emerald-400 to-amber-400 animate-pulse" />
                      )}

                      <div className="flex items-start gap-3.5">
                        {/* Play Button / Visual Thumbnail */}
                        <div
                          className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-md border-2 ${
                            isPlaying
                              ? "bg-rose-500 border-rose-300 text-white shadow-[0_4px_0_#be123c]"
                              : "bg-amber-100 border-amber-300 text-amber-900 group-hover:bg-amber-200"
                          }`}
                        >
                          {isPlaying ? (
                            <Pause className="h-6 w-6 fill-current animate-pulse" />
                          ) : (
                            <Play className="ml-1 h-6 w-6 fill-amber-900" />
                          )}
                        </div>

                        {/* Song Info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9.5px] font-black uppercase text-emerald-900 border border-emerald-200">
                              {s.language || "Patxôhã"}
                            </span>
                            {isListened && (
                              <span className="flex items-center gap-0.5 text-[10px] text-teal-700 font-bold bg-teal-50 px-1.5 py-0.2 rounded-full border border-teal-200">
                                <CheckCircle2 className="h-3 w-3" /> Ouvida
                              </span>
                            )}
                          </div>

                          <h3
                            className="truncate font-display font-black text-base sm:text-lg tracking-tight mt-1 group-hover:text-emerald-700 transition"
                            style={{ color: "#064e3b" }}
                          >
                            {s.title}
                          </h3>

                          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mt-0.5">
                            <span className="truncate">{s.artist || "Povo Pataxó"}</span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5 text-amber-800 font-bold shrink-0">
                              <Clock className="h-3 w-3" /> {formatDuration(s.duration_seconds)}
                            </span>
                          </div>
                        </div>

                        {/* Favorite Button */}
                        <button
                          type="button"
                          onClick={(e) => toggleFavorite(s.id, e)}
                          className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border transition-all transform active:scale-90 ${
                            isFav
                              ? "border-rose-400 bg-rose-50 text-rose-500 shadow-sm"
                              : "border-slate-200 bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50"
                          }`}
                          title={isFav ? "Remover dos favoritos" : "Favoritar cantiga"}
                        >
                          <Heart className={`h-4 w-4 ${isFav ? "fill-rose-500 text-rose-500" : ""}`} />
                        </button>
                      </div>

                      {/* Bottom Action / Playing Status */}
                      <div className="mt-3 pt-2.5 border-t border-amber-100 flex items-center justify-between text-xs">
                        {isPlaying ? (
                          <div className="flex items-center gap-1.5 text-emerald-700 font-black">
                            <SoundWavesIndicator isPlaying={true} />
                            <span>Tocando Agora...</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 font-semibold group-hover:text-emerald-800 transition">
                            Toque para cantar 🎤
                          </span>
                        )}

                        <span className="inline-flex items-center gap-1 font-black text-[11px] text-amber-800 group-hover:translate-x-0.5 transition-transform">
                          Ouvir Cântico →
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

        {/* Footer Infantil */}
        <SiteFooter mode="infantil" />
      </div>
    </div>
  );
}

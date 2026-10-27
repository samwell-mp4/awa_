import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft,
  Music,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  X,
  MapPin,
  Clock,
  Volume2,
  Volume1,
  VolumeX,
  RotateCcw,
  RotateCw,
  Repeat,
  Repeat1,
  Shuffle,
  ListMusic,
  Sparkles,
  Sliders,
  Maximize2,
  Minimize2,
  Quote,
} from "lucide-react";
import { PremiumGate } from "@/components/PremiumGate";
import { pickLang, useLang } from "@/lib/pick-lang";
import { useLastArea, setLastArea } from "@/lib/last-area";
import {
  activeLineIndex,
  resolveDuration,
  resolveLyricBounds,
  resolveLyricRanges,
  activeLineFromRanges,
} from "@/lib/lyric-sync";
import { SongTimelineModal } from "@/components/music/SongTimelineSyncEditor";

// Authentic indigenous cultural photos for rich fallback covers
import danca from "@/assets/pataxo-danca.jpg";
import aldeiaImg from "@/assets/pataxo-aldeia.jpg";
import anciaoImg from "@/assets/pataxo-anciao.jpg";
import artesanatoImg from "@/assets/pataxo-artesanato.jpg";
import pascoalImg from "@/assets/pataxo-monte-pascoal.jpg";
import heroWoman from "@/assets/hero-woman.jpg";
import trailCultura from "@/assets/trail-cultura.jpg";
import trailNatureza from "@/assets/trail-natureza.jpg";
import trailAnimais from "@/assets/trail-animais.jpg";
import trailSaudacoes from "@/assets/trail-saudacoes.jpg";
import trailFamilia from "@/assets/trail-familia.jpg";

export const Route = createFileRoute("/musicas")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Cânticos Sagrados — AWÃ TECH" },
      { name: "description", content: "Cânticos em Patxôhã com legendas bilíngues (Premium)." },
    ],
  }),
  component: () => (
    <PremiumGate title="Cânticos completos (Premium)" description="Assine para ouvir todos os cânticos com legendas bilíngues e vídeos imersivos.">
      <MusicasPage />
    </PremiumGate>
  ),
});

export type Song = {
  id: string;
  title: string;
  artist: string | null;
  language: string;
  audio_url: string;
  cover_url: string | null;
  video_url: string | null;
  ambient_video_id: string | null;
  lyrics_indigenous: string;
  lyrics_pt: string;
  description: string | null;
  aldeia: string | null;
  title_en?: string | null;
  title_es?: string | null;
  artist_en?: string | null;
  artist_es?: string | null;
  description_en?: string | null;
  description_es?: string | null;
  lyrics_pt_en?: string | null;
  lyrics_pt_es?: string | null;
  duration_seconds?: number | null;
  sync_offsets?: number[] | null;
  sync_times?: number[] | null;
  style?: any;
};

type Ambient = { id: string; name: string; video_url: string };

const ALDEIAS = ["Todas", "Aldeia Velha", "Barra Velha", "Coroa Vermelha", "Jaqueira", "Boca da Mata"] as const;

const FALLBACK_COVERS = [
  danca,
  aldeiaImg,
  anciaoImg,
  artesanatoImg,
  pascoalImg,
  heroWoman,
  trailCultura,
  trailNatureza,
  trailAnimais,
  trailSaudacoes,
  trailFamilia,
];

export function getSongCover(song: { id?: string; title?: string; cover_url?: string | null }): string {
  if (song.cover_url && song.cover_url.trim().length > 0) return song.cover_url;
  const seed = song.id || song.title || "awatech";
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return FALLBACK_COVERS[Math.abs(hash) % FALLBACK_COVERS.length];
}

function MusicasPage() {
  const backTo = useLastArea();
  useEffect(() => setLastArea("/adulto"), []);
  const { data: songs = [] } = useQuery({
    queryKey: ["songs_public"],
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60 * 6,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("songs")
        .select("id,title,artist,language,audio_url,cover_url,video_url,ambient_video_id,lyrics_indigenous,lyrics_pt,description,aldeia,title_en,title_es,artist_en,artist_es,description_en,description_es,lyrics_pt_en,lyrics_pt_es,duration_seconds,sync_offsets,sync_times,style")
        .eq("is_active", true)
        .order("order_index")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Song[];
    },
  });
  const { data: ambients = [] } = useQuery({
    queryKey: ["ambient_videos"],
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 6,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ambient_videos")
        .select("id,name,video_url");
      if (error) throw error;
      return data as Ambient[];
    },
  });

  const ambientMap = useMemo(() => Object.fromEntries(ambients.map((a) => [a.id, a])), [ambients]);
  const [playing, setPlaying] = useState<Song | null>(null);
  const [aldeia, setAldeia] = useState<(typeof ALDEIAS)[number]>("Todas");
  const filteredSongs = useMemo(
    () => (aldeia === "Todas" ? songs : songs.filter((s) => s.aldeia === aldeia)),
    [songs, aldeia],
  );
  const soundCloudWidgetsRef = useRef<Record<string, any>>({});

  useEffect(() => {
    const hasSoundCloud = songs.some((song) => scEmbed(song.audio_url));
    if (!hasSoundCloud || (window as any).SC?.Widget) return;
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://w.soundcloud.com/player/api.js"]',
    );
    if (existing) return;
    const script = document.createElement("script");
    script.src = "https://w.soundcloud.com/player/api.js";
    script.async = true;
    document.body.appendChild(script);
  }, [songs]);

  const pauseSoundCloudWidgets = () => {
    Object.values(soundCloudWidgetsRef.current).forEach((widget) => {
      try {
        widget?.pause?.();
      } catch {}
    });
  };

  const openSong = (song: Song) => {
    const widget = scEmbed(song.audio_url) ? soundCloudWidgetsRef.current[song.id] : null;
    if (widget) {
      pauseSoundCloudWidgets();
      try {
        widget.seekTo?.(0);
        widget.play?.();
      } catch {}
    }
    setPlaying(song);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(76,175,80,0.18),transparent_34%),linear-gradient(180deg,oklch(0.18_0.04_145),oklch(0.10_0.03_145))]">
        <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.18_0.04_145/0.9)] via-[oklch(0.15_0.04_145/0.7)] to-[oklch(0.10_0.03_145/0.95)]" />
      </div>

      <header className="sticky top-0 z-40 border-b border-gold/20 bg-[oklch(0.15_0.04_145/0.7)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 md:px-8">
          <Link
            to={backTo as "/"}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gold hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
          <div className="flex items-center gap-2 text-cream font-display font-black text-lg">
            <Music className="h-5 w-5 text-leaf" /> Cânticos
          </div>
          <span className="w-14" />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 md:px-8 py-10 md:py-16">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between border-b border-gold/20 pb-6 mb-10">
          <div>
            <span className="text-[10px] md:text-xs font-bold tracking-[0.35em] uppercase text-gold">
              AWÃ TECH · Cantos Originários
            </span>
            <h1 className="mt-2 font-display text-3xl md:text-5xl font-black text-cream leading-tight">
              Cânticos <span className="italic text-gradient-gold">Sagrados</span>
            </h1>
            <p className="mt-3 max-w-xl text-sm md:text-base text-foreground/75 leading-relaxed">
              A floresta canta. Ouça em língua originária Patxôhã com capas e traduções bilíngues sincronizadas verso a verso em tempo real.
            </p>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {ALDEIAS.map((a) => (
            <button
              key={a}
              onClick={() => setAldeia(a)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold transition shadow-xs ${
                aldeia === a
                  ? "border-gold bg-gradient-to-r from-gold to-[#f59e0b] text-emerald-950 shadow-[0_2px_10px_rgba(249,168,37,0.4)]"
                  : "border-gold/30 text-cream hover:bg-gold/10"
              }`}
            >
              <MapPin className="h-3.5 w-3.5" /> {a}
            </button>
          ))}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredSongs.map((s) => (
            <SongCard
              key={s.id}
              song={s}
              onClick={() => openSong(s)}
            />
          ))}
          {filteredSongs.length === 0 && (
            <div className="col-span-full text-center text-foreground/60 py-16">
              Nenhum cântico desta aldeia encontrado no momento.
            </div>
          )}
        </div>
      </main>

      <SoundCloudPreloads songs={songs} widgetsRef={soundCloudWidgetsRef} />

      {playing && (
        <Player
          song={playing}
          ambient={playing.ambient_video_id ? ambientMap[playing.ambient_video_id] : undefined}
          songs={filteredSongs.length > 0 ? filteredSongs : songs}
          onClose={() => setPlaying(null)}
          onChange={setPlaying}
          soundCloudWidget={scEmbed(playing.audio_url) ? soundCloudWidgetsRef.current[playing.id] : undefined}
        />
      )}
    </div>
  );
}

function SoundCloudPreloads({
  songs,
  widgetsRef,
}: {
  songs: Song[];
  widgetsRef: { current: Record<string, any> };
}) {
  const iframeRefs = useRef<Record<string, HTMLIFrameElement | null>>({});
  const soundCloudSongs = useMemo(
    () => songs.filter((song) => scEmbed(song.audio_url)),
    [songs],
  );

  useEffect(() => {
    if (soundCloudSongs.length === 0) return;
    let cancelled = false;
    const ensureScript = () =>
      new Promise<void>((resolve) => {
        if ((window as any).SC?.Widget) return resolve();
        const existing = document.querySelector<HTMLScriptElement>(
          'script[src="https://w.soundcloud.com/player/api.js"]',
        );
        if (existing) {
          existing.addEventListener("load", () => resolve(), { once: true });
          return;
        }
        const s = document.createElement("script");
        s.src = "https://w.soundcloud.com/player/api.js";
        s.async = true;
        s.onload = () => resolve();
        document.body.appendChild(s);
      });

    ensureScript().then(() => {
      if (cancelled) return;
      const SC = (window as any).SC;
      soundCloudSongs.forEach((song) => {
        const iframe = iframeRefs.current[song.id];
        if (iframe && !widgetsRef.current[song.id]) {
          try {
            widgetsRef.current[song.id] = SC.Widget(iframe);
          } catch {}
        }
      });
    });

    return () => {
      cancelled = true;
    };
  }, [soundCloudSongs, widgetsRef]);

  return (
    <div className="pointer-events-none absolute bottom-0 left-0 h-px w-px opacity-0">
      {soundCloudSongs.map((song) => (
        <iframe
          key={song.id}
          ref={(el) => {
            iframeRefs.current[song.id] = el;
          }}
          src={`${scEmbed(song.audio_url)!}&auto_play=false&show_artwork=false&show_teaser=false&buying=false&sharing=false&download=false`}
          allow="autoplay; encrypted-media"
          title={`Pré-carregamento ${song.title}`}
          tabIndex={-1}
          className="h-px w-px border-0"
        />
      ))}
    </div>
  );
}

function SongCard({
  song,
  onClick,
}: {
  song: Song;
  onClick: () => void;
}) {
  const lang = useLang();
  const tTitle = pickLang(song, "title", lang);
  const tArtist = pickLang(song, "artist", lang);
  const [imgError, setImgError] = useState(false);
  const fallbackCover = useMemo(() => getSongCover(song), [song]);
  const coverSrc = (!imgError && song.cover_url) ? song.cover_url : fallbackCover;

  return (
    <button
      onClick={onClick}
      className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-gold/25 bg-[oklch(0.14_0.04_145/0.8)] text-left transition-all duration-500 hover:-translate-y-1.5 hover:border-gold hover:shadow-[0_20px_50px_-15px_rgba(249,168,37,0.4)] cursor-pointer"
    >
      {/* Media Image */}
      <div className="absolute inset-0">
        <img
          src={coverSrc}
          alt={tTitle || song.title}
          loading="lazy"
          decoding="async"
          onError={() => setImgError(true)}
          className="h-full w-full object-cover transition-all duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
      </div>

      {/* Tribal corner indicator */}
      <div className="absolute top-3 right-3 flex gap-1 z-10">
        <span className="block h-2 w-2 rounded-full bg-gold shadow-[0_0_8px_rgba(249,168,37,0.8)]" />
        <span className="block h-2 w-2 rounded-full bg-gold/50" />
      </div>

      {/* Play Overlay Glow */}
      <div className="absolute inset-0 grid place-items-center opacity-0 transition-all duration-300 group-hover:opacity-100 backdrop-blur-[2px] bg-black/20">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-[#ffd166] via-[#f59e0b] to-[#d97706] text-bark shadow-[0_0_35px_rgba(249,168,37,0.7)] transition-transform duration-300 group-hover:scale-110">
          <Play className="h-7 w-7 ml-1 fill-current" />
        </div>
      </div>

      {/* Info Card Content */}
      <div className="absolute inset-x-0 bottom-0 p-5 z-10">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="text-[10px] font-black tracking-[0.2em] uppercase text-gold bg-black/60 px-2.5 py-0.5 rounded-full border border-gold/30">
            {song.language || "Patxôhã"}
          </span>
          {song.aldeia && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 text-[10px] uppercase tracking-wider text-emerald-200">
              <MapPin className="h-2.5 w-2.5 text-emerald-400" /> {song.aldeia}
            </span>
          )}
        </div>
        <h3 className="font-display text-xl font-black text-cream leading-tight drop-shadow-md group-hover:text-gold transition-colors">
          {tTitle || song.title}
        </h3>
        {song.artist && (
          <p className="mt-1 text-xs text-foreground/80 truncate italic">{tArtist || song.artist}</p>
        )}
      </div>
    </button>
  );
}

function AudioVisualizer({ isPlaying }: { isPlaying: boolean }) {
  const bars = [40, 75, 30, 95, 60, 85, 45, 100, 70, 50, 90, 65, 35, 80, 55, 90, 45, 70, 85, 40];
  return (
    <div className="flex items-end justify-center gap-1.5 h-8 w-full max-w-xs px-4 mx-auto">
      {bars.map((h, i) => (
        <span
          key={i}
          className="w-1 rounded-full bg-gradient-to-t from-gold/50 via-gold to-[#ffd166] transition-all duration-300"
          style={{
            height: isPlaying ? `${Math.max(20, (h * ((i % 3 + 1) * 0.3 + 0.4)) % 100)}%` : "15%",
            opacity: isPlaying ? 0.95 : 0.35,
          }}
        />
      ))}
    </div>
  );
}

function Player({
  song,
  ambient,
  songs,
  onClose,
  onChange,
  soundCloudWidget,
}: {
  song: Song;
  ambient?: Ambient;
  songs: Song[];
  onClose: () => void;
  onChange: (s: Song) => void;
  soundCloudWidget?: any;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const scIframeRef = useRef<HTMLIFrameElement>(null);
  const scWidgetRef = useRef<any>(null);
  const [playing, setPlaying] = useState(true);
  const [loadingAudio, setLoadingAudio] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.9);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [repeatMode, setRepeatMode] = useState<"off" | "all" | "one">("off");
  const [isShuffle, setIsShuffle] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [viewMode, setViewMode] = useState<"split" | "lyrics" | "cover">("split");

  const [imgError, setImgError] = useState(false);
  const fallbackCover = useMemo(() => getSongCover(song), [song]);
  const coverSrc = (!imgError && song.cover_url) ? song.cover_url : fallbackCover;

  const idx = songs.findIndex((s) => s.id === song.id);
  const prev = idx > 0 ? songs[idx - 1] : songs[songs.length - 1];
  const next = idx < songs.length - 1 ? songs[idx + 1] : songs[0];

  const lang = useLang();
  const tTitle = pickLang(song, "title", lang);
  const tArtist = pickLang(song, "artist", lang);
  const isSC = !!scEmbed(song.audio_url);

  const rawIndLines = useMemo(
    () =>
      (song.lyrics_indigenous || "")
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean),
    [song.lyrics_indigenous],
  );
  const lyricsTranslated = pickLang(song, "lyrics_pt", lang);
  const rawPtLines = useMemo(
    () =>
      lyricsTranslated
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean),
    [lyricsTranslated],
  );

  const syncDuration = resolveDuration(duration, song.duration_seconds ?? null);
  const [showTimeline, setShowTimeline] = useState(false);
  const [localRangesVersion, setLocalRangesVersion] = useState(0);

  useEffect(() => {
    const handleSyncUpdate = (e: any) => {
      if (!e.detail?.songId || e.detail.songId === song.id) {
        setLocalRangesVersion((v) => v + 1);
      }
    };
    window.addEventListener("awa:song-sync-updated", handleSyncUpdate);
    return () => window.removeEventListener("awa:song-sync-updated", handleSyncUpdate);
  }, [song.id]);

  const ranges = useMemo(
    () =>
      resolveLyricRanges({
        songId: song.id,
        songTitle: song.title,
        indLines: rawIndLines,
        ptLines: rawPtLines,
        duration: syncDuration,
        styleRanges: (song as any).style?.sync_ranges,
        syncTimes: song.sync_times ?? null,
        offsets: song.sync_offsets ?? null,
      }),
    [rawIndLines, rawPtLines, syncDuration, song.id, song.title, song.sync_offsets, song.sync_times, (song as any).style, localRangesVersion],
  );

  const indLines = useMemo(() => {
    if (ranges && ranges.length > 0 && ranges.some((r) => r.text)) {
      return ranges.map((r) => r.text || "");
    }
    return rawIndLines;
  }, [ranges, rawIndLines]);

  const ptLines = useMemo(() => {
    if (ranges && ranges.length > 0 && ranges.some((r) => r.translation)) {
      return ranges.map((r) => r.translation || "");
    }
    return rawPtLines;
  }, [ranges, rawPtLines]);

  const maxLen = Math.max(indLines.length, ptLines.length);

  const bounds = useMemo(
    () =>
      resolveLyricBounds({
        indLines,
        ptLines,
        duration: syncDuration,
        times: song.sync_times ?? null,
        offsets: song.sync_offsets ?? null,
      }),
    [indLines, ptLines, syncDuration, song.sync_offsets, song.sync_times],
  );

  const activeIdx = useMemo(() => {
    if (maxLen <= 0) return -1;
    if (ranges && ranges.length > 0) {
      return activeLineFromRanges(ranges, progress, 0.25);
    }
    if (!bounds.length) return 0;
    return activeLineIndex(bounds, progress, 0.6);
  }, [ranges, bounds, progress, maxLen]);

  const lineRefs = useRef<Array<HTMLDivElement | null>>([]);
  useEffect(() => {
    if (activeIdx < 0) return;
    const el = lineRefs.current[activeIdx];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeIdx]);

  useEffect(() => {
    setProgress(0);
    setDuration(0);
    setLoadingAudio(true);
    setPlaying(true);
    setImgError(false);
  }, [song.id]);

  // Audio element volume & playbackRate sync
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = isMuted ? 0 : volume;
    a.playbackRate = playbackRate;
  }, [volume, isMuted, playbackRate]);

  useEffect(() => {
    if (isSC) return;
    const a = audioRef.current;
    if (!a) return;
    a.play()
      .then(() => {
        setLoadingAudio(false);
        setPlaying(true);
      })
      .catch(() => {
        setLoadingAudio(false);
        setPlaying(false);
      });
  }, [song.id, isSC]);

  useEffect(() => {
    if (isSC) return;
    let raf = 0;
    const tick = () => {
      const a = audioRef.current;
      if (a) {
        setProgress(a.currentTime);
        if (a.duration && Number.isFinite(a.duration)) setDuration(a.duration);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [song.id, isSC]);

  // Handle track finished
  const handleTrackFinished = () => {
    if (repeatMode === "one") {
      seekTo(0);
      toggle();
      return;
    }
    if (isShuffle) {
      const randomIdx = Math.floor(Math.random() * songs.length);
      onChange(songs[randomIdx]);
      return;
    }
    if (next && (repeatMode === "all" || idx < songs.length - 1)) {
      onChange(next);
    } else {
      setPlaying(false);
    }
  };

  // SoundCloud Widget API — track progress + play/pause
  useEffect(() => {
    if (!isSC) return;
    let cancelled = false;
    let readyTimer: number | undefined;
    const bindWidget = (widget: any) => {
      if (cancelled || !widget) return;
      const SC = (window as any).SC;
      scWidgetRef.current = widget;
      widget.bind(SC.Widget.Events.READY, () => {
        if (cancelled) return;
        widget.getDuration((d: number) => setDuration(d / 1000));
        widget.setVolume(isMuted ? 0 : volume * 100);
        setLoadingAudio(false);
        setPlaying(true);
        readyTimer = window.setTimeout(() => {
          widget.play();
        }, 0);
      });
      widget.bind(SC.Widget.Events.PLAY_PROGRESS, (e: any) => {
        setLoadingAudio(false);
        setProgress(e.currentPosition / 1000);
      });
      widget.bind(SC.Widget.Events.PLAY, () => {
        setLoadingAudio(false);
        setPlaying(true);
      });
      widget.bind(SC.Widget.Events.PAUSE, () => {
        setLoadingAudio(false);
        setPlaying(false);
      });
      widget.bind(SC.Widget.Events.FINISH, () => {
        handleTrackFinished();
      });
      widget.getDuration((d: number) => {
        if (cancelled) return;
        if (d > 0) {
          setDuration(d / 1000);
          setLoadingAudio(false);
        }
      });
      readyTimer = window.setTimeout(() => {
        if (!cancelled) widget.play();
      }, 0);
    };

    const ensureScript = () =>
      new Promise<void>((resolve) => {
        if ((window as any).SC?.Widget) return resolve();
        const existing = document.querySelector<HTMLScriptElement>(
          'script[src="https://w.soundcloud.com/player/api.js"]',
        );
        if (existing) {
          existing.addEventListener("load", () => resolve(), { once: true });
          return;
        }
        const s = document.createElement("script");
        s.src = "https://w.soundcloud.com/player/api.js";
        s.async = true;
        s.onload = () => resolve();
        document.body.appendChild(s);
      });

    ensureScript().then(() => {
      if (cancelled) return;
      const SC = (window as any).SC;
      if (soundCloudWidget) {
        bindWidget(soundCloudWidget);
        return;
      }
      if (!scIframeRef.current) return;
      bindWidget(SC.Widget(scIframeRef.current));
    });

    return () => {
      cancelled = true;
      if (readyTimer) window.clearTimeout(readyTimer);
      try {
        scWidgetRef.current?.pause?.();
      } catch {}
      scWidgetRef.current = null;
    };
  }, [song.id, isSC, soundCloudWidget]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showQueue) setShowQueue(false);
        else onClose();
      } else if (e.code === "Space") {
        e.preventDefault();
        toggle();
      } else if (e.key === "ArrowLeft") {
        skip(-10);
      } else if (e.key === "ArrowRight") {
        skip(10);
      }
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, showQueue, progress, duration]);

  function toggle() {
    if (isSC) {
      const w = scWidgetRef.current || soundCloudWidget;
      if (!w) {
        setPlaying(true);
        setLoadingAudio(true);
        return;
      }
      w.toggle();
      return;
    }
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      a.play();
      setPlaying(true);
    } else {
      a.pause();
      setPlaying(false);
    }
  }

  function seekTo(seconds: number) {
    const target = Math.max(0, Math.min(duration || 9999, seconds));
    if (isSC) {
      const w = scWidgetRef.current || soundCloudWidget;
      w?.seekTo?.(target * 1000);
    } else if (audioRef.current) {
      audioRef.current.currentTime = target;
    }
    setProgress(target);
  }

  function skip(seconds: number) {
    seekTo(progress + seconds);
  }

  function seekToLine(i: number) {
    if (ranges && ranges[i] && typeof ranges[i].start === "number") {
      seekTo(ranges[i].start);
    } else if (bounds && bounds.length > 0) {
      const startTime = i === 0 ? 0 : (bounds[i - 1] ?? 0);
      seekTo(startTime);
    } else if (duration > 0 && maxLen > 0) {
      seekTo((i / maxLen) * duration);
    }
  }

  function cycleRepeat() {
    if (repeatMode === "off") setRepeatMode("all");
    else if (repeatMode === "all") setRepeatMode("one");
    else setRepeatMode("off");
  }

  function handleVolumeChange(val: number) {
    setVolume(val);
    if (val === 0) setIsMuted(true);
    else setIsMuted(false);
    if (isSC) {
      scWidgetRef.current?.setVolume?.(val * 100);
    }
  }

  function toggleMute() {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (isSC) {
      scWidgetRef.current?.setVolume?.(nextMuted ? 0 : volume * 100);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-black/95 text-white backdrop-blur-3xl overflow-hidden select-none animate-in fade-in duration-300">
      {/* Cinematic Ambient Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {song.video_url ? (
          ytEmbed(song.video_url) ? (
            <iframe
              src={ytEmbed(song.video_url)!}
              allow="autoplay; encrypted-media"
              className="absolute left-1/2 top-1/2 h-[120vh] w-[220vw] -translate-x-1/2 -translate-y-1/2 md:w-[160vw] pointer-events-none border-0 opacity-30 blur-sm"
            />
          ) : (
            <video
              src={song.video_url}
              autoPlay
              muted
              loop
              playsInline
              className="h-full w-full object-cover scale-105 opacity-30 blur-sm"
            />
          )
        ) : ambient ? (
          <video
            src={ambient.video_url}
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover scale-105 opacity-30 blur-sm"
          />
        ) : (
          <img
            src={coverSrc}
            alt=""
            className="h-full w-full object-cover scale-125 blur-3xl opacity-35"
          />
        )}
        <div className="absolute inset-0 bg-radial-vignette from-transparent via-black/75 to-black" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/60 to-black/95" />
      </div>

      {/* Top Header Bar */}
      <div className="relative z-20 flex items-center justify-between border-b border-gold/20 bg-black/50 px-4 py-3 md:px-8 backdrop-blur-xl">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-gold/40 shadow-md">
            <img src={coverSrc} alt="" className="h-full w-full object-cover" />
            {playing && (
              <span className="absolute bottom-1 right-1 h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-gold">
                TOCANDO AGORA · {song.language || "PATXÔHÃ"}
              </span>
              {song.aldeia && (
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-950/70 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  <MapPin className="h-2.5 w-2.5" /> {song.aldeia}
                </span>
              )}
            </div>
            <h2 className="font-display text-base md:text-lg font-black text-cream truncate drop-shadow-sm">
              {tTitle || song.title}
            </h2>
            {song.artist && (
              <p className="text-xs text-foreground/75 truncate italic">{tArtist || song.artist}</p>
            )}
          </div>
        </div>

        {/* View Switcher Controls */}
        <div className="hidden lg:flex items-center gap-1 rounded-full border border-gold/30 bg-black/60 p-1 backdrop-blur-md">
          <button
            onClick={() => setViewMode("split")}
            className={`rounded-full px-3 py-1 text-xs font-bold transition ${
              viewMode === "split"
                ? "bg-gold text-emerald-950 shadow-xs"
                : "text-cream/70 hover:text-cream"
            }`}
          >
            Capa & Letra
          </button>
          <button
            onClick={() => setViewMode("lyrics")}
            className={`rounded-full px-3 py-1 text-xs font-bold transition ${
              viewMode === "lyrics"
                ? "bg-gold text-emerald-950 shadow-xs"
                : "text-cream/70 hover:text-cream"
            }`}
          >
            Teatro de Letra
          </button>
          <button
            onClick={() => setViewMode("cover")}
            className={`rounded-full px-3 py-1 text-xs font-bold transition ${
              viewMode === "cover"
                ? "bg-gold text-emerald-950 shadow-xs"
                : "text-cream/70 hover:text-cream"
            }`}
          >
            Modo Vinil
          </button>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowQueue((v) => !v)}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold backdrop-blur-md transition ${
              showQueue
                ? "border-gold bg-gold text-emerald-950"
                : "border-gold/30 bg-black/50 text-gold hover:bg-gold/15"
            }`}
            title="Ver lista de cânticos"
          >
            <ListMusic className="h-4 w-4" />
            <span className="hidden sm:inline">Cânticos ({songs.length})</span>
          </button>

          <button
            onClick={() => setShowTimeline(true)}
            className="hidden sm:flex items-center gap-1.5 rounded-full border border-gold/30 bg-black/50 px-3 py-1.5 text-xs font-bold text-gold backdrop-blur-md hover:bg-gold/15 transition"
            title="Ajustar tempos da letra na Linha do Tempo"
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Timeline</span>
          </button>

          <button
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full border border-gold/40 bg-black/60 text-gold backdrop-blur-md transition hover:scale-105 hover:bg-gold hover:text-emerald-950"
            aria-label="Fechar player"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 overflow-hidden px-4 md:px-8 py-6">
        <div className="mx-auto h-full max-w-7xl flex flex-col lg:flex-row items-center gap-8 lg:gap-12 justify-center">
          {/* Left Column: Prominent Album Cover Art & Vinyl Stage */}
          {(viewMode === "split" || viewMode === "cover") && (
            <div className={`w-full lg:w-[44%] flex flex-col items-center justify-center transition-all duration-500 ${
              viewMode === "cover" ? "max-w-2xl" : "max-w-lg"
            }`}>
              <div className="relative w-full max-w-sm sm:max-w-md aspect-square flex items-center justify-center p-4">
                {/* Vinyl Glow Aura */}
                <div
                  className="absolute inset-0 rounded-full opacity-35 blur-3xl transition-opacity duration-700 pointer-events-none"
                  style={{
                    backgroundImage: `url(${coverSrc})`,
                    backgroundSize: "cover",
                  }}
                />

                <div className="relative flex items-center justify-center w-full h-full">
                  {/* Rotating Vinyl Disc Record peeking behind album art */}
                  <div
                    className={`absolute h-[85%] w-[85%] rounded-full border-4 border-[#1e1e1e] bg-[#111] shadow-2xl transition-transform duration-700 flex items-center justify-center ${
                      playing ? "animate-[spin_18s_linear_infinite]" : "rotate-12"
                    }`}
                    style={{
                      right: "-12%",
                      background: "radial-gradient(circle, #333 15%, #181818 25%, #2a2a2a 38%, #141414 52%, #222 68%, #101010 85%, #050505 100%)",
                    }}
                  >
                    {/* Vinyl Center Label */}
                    <div className="relative h-[32%] w-[32%] rounded-full border-2 border-gold/60 overflow-hidden bg-forest-deep flex items-center justify-center shadow-inner">
                      <img src={coverSrc} alt="" className="h-full w-full object-cover opacity-85" />
                      <div className="absolute inset-0 bg-black/25" />
                      <div className="relative h-4 w-4 rounded-full bg-gold border-2 border-bark" />
                    </div>
                  </div>

                  {/* Album Cover Sleeve Box */}
                  <div className="relative z-10 h-[88%] w-[88%] overflow-hidden rounded-2xl border-2 border-gold/50 bg-black shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] group">
                    <img
                      src={coverSrc}
                      alt={tTitle || song.title}
                      onError={() => setImgError(true)}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                    <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 rounded-full bg-black/70 backdrop-blur-md px-3 py-1 text-xs font-bold text-gold border border-gold/30">
                      <MapPin className="h-3.5 w-3.5 text-gold" />
                      <span>{song.aldeia || "Povo Pataxó"}</span>
                    </div>

                    <div className="absolute bottom-4 inset-x-4">
                      <h3 className="font-display text-xl sm:text-2xl font-black text-cream drop-shadow-md">
                        {tTitle || song.title}
                      </h3>
                      {song.artist && (
                        <p className="text-xs sm:text-sm text-gold/90 font-medium italic truncate mt-0.5">
                          {tArtist || song.artist}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Real-time Equalizer Simulation */}
              <div className="mt-4 w-full flex flex-col items-center">
                <AudioVisualizer isPlaying={playing} />
              </div>

              {/* Cultural Context / Description Quote */}
              {song.description && (
                <div className="mt-4 max-w-sm rounded-xl border border-gold/20 bg-black/40 p-3 backdrop-blur-md text-center">
                  <div className="flex items-center justify-center gap-1.5 text-gold text-[10px] font-bold uppercase tracking-wider mb-1">
                    <Quote className="h-3 w-3" /> Significado Cultural
                  </div>
                  <p className="text-xs text-foreground/80 italic leading-relaxed line-clamp-2">
                    "{song.description}"
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Right Column: Synchronized Bilingual Lyrics Theater */}
          {(viewMode === "split" || viewMode === "lyrics") && (
            <div className={`w-full flex-1 flex flex-col h-full max-h-[calc(100vh-250px)] rounded-3xl border border-gold/20 bg-black/40 backdrop-blur-xl overflow-hidden shadow-2xl ${
              viewMode === "lyrics" ? "max-w-4xl" : "lg:w-[56%]"
            }`}>
              {/* Lyrics header pill */}
              <div className="flex items-center justify-between border-b border-gold/15 px-5 py-3 bg-black/30">
                <div className="flex items-center gap-2 text-xs font-bold text-gold">
                  <Sparkles className="h-4 w-4" />
                  <span>Letra Sincronizada Patxôhã & Português</span>
                </div>
                <span className="text-[11px] text-foreground/60 hidden sm:inline">
                  Toque em qualquer verso para pular
                </span>
              </div>

              {/* Lyrics scrollable stream */}
              <div className="flex-1 overflow-y-auto px-5 md:px-8 py-8 space-y-6 scroll-smooth">
                {Array.from({ length: maxLen }).map((_, i) => {
                  const active = i === activeIdx;
                  return (
                    <div
                      key={i}
                      ref={(el) => {
                        lineRefs.current[i] = el;
                      }}
                      onClick={() => seekToLine(i)}
                      className={`group relative rounded-2xl p-4 transition-all duration-300 cursor-pointer ${
                        active
                          ? "bg-gradient-to-r from-gold/20 via-gold/10 to-transparent border-l-4 border-gold shadow-[0_0_30px_rgba(249,168,37,0.15)] scale-[1.02]"
                          : "hover:bg-white/5 opacity-50 hover:opacity-90 border-l-4 border-transparent"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1 flex items-center justify-center h-6 w-6 shrink-0 rounded-full bg-gold/10 text-gold group-hover:bg-gold group-hover:text-emerald-950 transition">
                          {active ? (
                            <Play className="h-3 w-3 fill-current animate-pulse" />
                          ) : (
                            <span className="text-[10px] font-mono font-bold opacity-75">{i + 1}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`font-display text-xl sm:text-2xl md:text-3xl font-black leading-tight transition-colors ${
                              active
                                ? "text-gold drop-shadow-[0_0_20px_rgba(255,209,102,0.5)]"
                                : "text-cream"
                            }`}
                          >
                            {indLines[i] || "\u00A0"}
                          </p>
                          {ptLines[i] && (
                            <p
                              className={`mt-1.5 text-sm sm:text-base md:text-lg italic transition-colors ${
                                active ? "text-cream font-medium" : "text-foreground/60"
                              }`}
                            >
                              {ptLines[i]}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {maxLen === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Music className="h-12 w-12 text-gold/40 mb-3" />
                    <p className="text-base font-semibold text-cream">Este cântico não possui letra sincronizada cadastrada.</p>
                    <p className="text-xs text-foreground/60 mt-1 max-w-sm">Você pode usar a ferramenta de Linha do Tempo para adicionar versos e sincronizá-los.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Bottom Control Bar */}
      <div className="relative z-30 border-t border-gold/25 bg-gradient-to-t from-black via-black/95 to-black/80 px-4 py-3 md:px-8 md:py-4 backdrop-blur-2xl">
        <div className="mx-auto max-w-5xl">
          {/* Progress Seek Bar */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono font-semibold text-gold tabular-nums w-10 text-right">
              {fmt(progress)}
            </span>
            <div
              className="group relative flex-1 h-2 cursor-pointer rounded-full bg-white/15 overflow-hidden transition-all hover:h-2.5"
              onClick={(e) => {
                if (!duration) return;
                const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                const t = ((e.clientX - rect.left) / rect.width) * duration;
                seekTo(t);
              }}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-gold via-[#f59e0b] to-[#ffd166] shadow-[0_0_15px_rgba(249,168,37,0.7)]"
                style={{ width: `${duration ? (progress / duration) * 100 : 0}%` }}
              />
            </div>
            <span className="text-[11px] font-mono font-semibold text-foreground/60 tabular-nums w-10">
              {fmt(duration)}
            </span>
          </div>

          {/* Master Controls Row */}
          <div className="mt-3 flex items-center justify-between gap-4">
            {/* Left mini track info */}
            <div className="hidden sm:flex items-center gap-3 w-1/4 min-w-0">
              <img
                src={coverSrc}
                alt=""
                className="h-11 w-11 shrink-0 rounded-lg object-cover border border-gold/30"
              />
              <div className="min-w-0">
                <div className="text-xs font-bold text-cream truncate">{tTitle || song.title}</div>
                <div className="text-[11px] text-foreground/70 truncate">{tArtist || song.artist || "Povo Pataxó"}</div>
              </div>
            </div>

            {/* Center Playback Controls */}
            <div className="flex items-center justify-center gap-3 sm:gap-6 flex-1">
              <button
                onClick={cycleRepeat}
                className={`grid h-8 w-8 place-items-center rounded-full transition ${
                  repeatMode !== "off"
                    ? "text-gold bg-gold/15"
                    : "text-foreground/50 hover:text-foreground/80"
                }`}
                title={`Repetir: ${repeatMode === "off" ? "Desligado" : repeatMode === "all" ? "Todos" : "Este cântico"}`}
              >
                {repeatMode === "one" ? <Repeat1 className="h-4 w-4" /> : <Repeat className="h-4 w-4" />}
              </button>

              <button
                onClick={() => skip(-10)}
                className="grid h-9 w-9 place-items-center rounded-full text-foreground/70 hover:text-gold hover:bg-gold/10 transition"
                title="Voltar 10 segundos"
              >
                <RotateCcw className="h-4 w-4" />
              </button>

              <button
                disabled={!prev}
                onClick={() => prev && onChange(prev)}
                className="grid h-10 w-10 place-items-center rounded-full text-cream/80 hover:text-gold hover:bg-gold/10 transition disabled:opacity-20"
                aria-label="Cântico anterior"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              {/* Radiant Golden Play/Pause Hero Button */}
              <button
                onClick={toggle}
                className="relative grid h-14 w-14 place-items-center rounded-full bg-gradient-to-tr from-[#ffd166] via-[#f59e0b] to-[#d97706] text-bark shadow-[0_0_30px_rgba(249,168,37,0.6)] transition hover:scale-105 active:scale-95 cursor-pointer"
                aria-label={loadingAudio ? "Carregando" : playing ? "Pausar" : "Tocar"}
              >
                {loadingAudio ? (
                  <span className="h-6 w-6 animate-spin rounded-full border-2 border-bark/30 border-t-bark" />
                ) : playing ? (
                  <Pause className="h-6 w-6 fill-current" />
                ) : (
                  <Play className="h-6 w-6 ml-0.5 fill-current" />
                )}
              </button>

              <button
                disabled={!next}
                onClick={() => next && onChange(next)}
                className="grid h-10 w-10 place-items-center rounded-full text-cream/80 hover:text-gold hover:bg-gold/10 transition disabled:opacity-20"
                aria-label="Próximo cântico"
              >
                <ChevronRight className="h-6 w-6" />
              </button>

              <button
                onClick={() => skip(10)}
                className="grid h-9 w-9 place-items-center rounded-full text-foreground/70 hover:text-gold hover:bg-gold/10 transition"
                title="Avançar 10 segundos"
              >
                <RotateCw className="h-4 w-4" />
              </button>

              <button
                onClick={() => setIsShuffle((v) => !v)}
                className={`grid h-8 w-8 place-items-center rounded-full transition ${
                  isShuffle ? "text-gold bg-gold/15" : "text-foreground/50 hover:text-foreground/80"
                }`}
                title={`Ordem Aleatória: ${isShuffle ? "Ativada" : "Desativada"}`}
              >
                <Shuffle className="h-4 w-4" />
              </button>
            </div>

            {/* Right Volume & Speed Controls */}
            <div className="hidden sm:flex items-center justify-end gap-3 w-1/4">
              {/* Playback speed selector */}
              <div className="flex items-center gap-1 rounded-full border border-gold/25 bg-black/40 px-2 py-0.5 text-[11px] font-bold text-gold">
                {[0.75, 1.0, 1.25].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => setPlaybackRate(rate)}
                    className={`px-1.5 py-0.5 rounded-full transition ${
                      playbackRate === rate ? "bg-gold text-emerald-950 font-black" : "text-cream/60 hover:text-cream"
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>

              {/* Volume Slider */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className="text-gold/80 hover:text-gold transition"
                  title={isMuted ? "Desmutar" : "Mutar"}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="h-4 w-4" />
                  ) : volume < 0.5 ? (
                    <Volume1 className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="h-1.5 w-16 sm:w-20 cursor-pointer appearance-none rounded-full bg-white/20 accent-gold"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide-over Tracklist Queue Drawer */}
      {showQueue && (
        <div className="absolute inset-y-0 right-0 z-40 w-full max-w-sm sm:max-w-md border-l border-gold/30 bg-black/95 p-5 shadow-2xl backdrop-blur-3xl flex flex-col animate-in slide-in-from-right duration-300">
          <div className="flex items-center justify-between border-b border-gold/20 pb-4">
            <div className="flex items-center gap-2">
              <ListMusic className="h-5 w-5 text-gold" />
              <h3 className="font-display text-lg font-black text-cream">Fila de Cânticos</h3>
              <span className="text-xs text-gold/80 font-bold bg-gold/15 px-2 py-0.5 rounded-full">
                {songs.length}
              </span>
            </div>
            <button
              onClick={() => setShowQueue(false)}
              className="grid h-8 w-8 place-items-center rounded-full border border-gold/30 bg-black/60 text-gold hover:bg-gold hover:text-emerald-950 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4 space-y-2">
            {songs.map((s, i) => {
              const isCurrent = s.id === song.id;
              const cardCover = getSongCover(s);
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    onChange(s);
                  }}
                  className={`w-full flex items-center gap-3 rounded-xl p-2.5 text-left transition ${
                    isCurrent
                      ? "bg-gold/20 border border-gold shadow-md"
                      : "hover:bg-white/10 border border-transparent"
                  }`}
                >
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-gold/30">
                    <img src={cardCover} alt="" className="h-full w-full object-cover" />
                    {isCurrent && playing && (
                      <div className="absolute inset-0 bg-black/40 grid place-items-center">
                        <span className="h-2 w-2 rounded-full bg-gold animate-ping" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-display text-sm font-bold truncate ${isCurrent ? "text-gold" : "text-cream"}`}>
                      {s.title}
                    </div>
                    <div className="text-xs text-foreground/60 truncate italic">
                      {s.artist || "Povo Pataxó"}
                    </div>
                  </div>
                  {s.aldeia && (
                    <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/70 border border-emerald-500/30 px-2 py-0.5 rounded-full shrink-0">
                      {s.aldeia}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Hidden Audio Elements & Fallback Iframes */}
      {isSC && !soundCloudWidget && (
        <iframe
          ref={scIframeRef}
          src={`${scEmbed(song.audio_url)!}&auto_play=true&show_artwork=false&show_teaser=false&buying=false&sharing=false&download=false`}
          allow="autoplay; encrypted-media"
          title={song.title}
          aria-hidden="true"
          tabIndex={-1}
          className="pointer-events-none absolute bottom-0 left-0 h-px w-px opacity-0 border-0"
        />
      )}
      {!isSC && (
        <audio
          ref={audioRef}
          src={song.audio_url}
          onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => {
            setDuration(e.currentTarget.duration);
            setLoadingAudio(false);
          }}
          onCanPlay={() => setLoadingAudio(false)}
          onEnded={handleTrackFinished}
          onPlay={() => {
            setLoadingAudio(false);
            setPlaying(true);
          }}
          onPause={() => {
            setLoadingAudio(false);
            setPlaying(false);
          }}
        />
      )}

      {/* Timeline Synchronization Modal */}
      {showTimeline && (
        <SongTimelineModal
          song={song as any}
          onClose={() => setShowTimeline(false)}
          onSaved={() => {
            setLocalRangesVersion((v) => v + 1);
          }}
        />
      )}
    </div>
  );
}

function fmt(s: number) {
  if (!isFinite(s) || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function ytEmbed(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  if (!m) return null;
  const id = m[1];
  return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&controls=0&playlist=${id}&playsinline=1&modestbranding=1&rel=0`;
}

function scEmbed(url: string): string | null {
  if (!/soundcloud\.com/.test(url)) return null;
  return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&hide_related=true&show_comments=false&show_user=false&show_reposts=false&visual=false&color=%23f9a825`;
}

import React, { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Repeat,
  Repeat1,
  Shuffle,
  Volume2,
  Volume1,
  VolumeX,
  Maximize2,
  Minimize2,
  X,
  Clock,
  ListMusic,
  Sparkles,
  BookOpen,
  Languages,
  Disc3,
  MapPin,
  Quote,
  ArrowLeft,
  Music,
} from "lucide-react";
import { pickLang, useLang } from "@/lib/pick-lang";
import {
  splitLyrics,
  resolveDuration,
  resolveLyricBounds,
  resolveLyricRanges,
  activeLineFromRanges,
  activeLineIndex,
} from "@/lib/lyric-sync";
import { getSongSyncConfig } from "@/data/kids-songs-sync";
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

export const FALLBACK_COVERS = [
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

export function getSongCover(song: { id?: string; title?: string; cover_url?: string | null }): string {
  if (song.cover_url && song.cover_url.trim().length > 0) return song.cover_url;
  const seed = song.id || song.title || "awatech";
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return FALLBACK_COVERS[Math.abs(hash) % FALLBACK_COVERS.length];
}

export type AdultPlayerView = "bilingual" | "split" | "indigenous" | "pt" | "cover";

export interface AdultPlayerProps {
  song: Song;
  songs: Song[];
  ambient?: { id: string; name: string; video_url: string };
  onClose: () => void;
  onChange: (song: Song) => void;
  soundCloudWidget?: any;
  initialMaximized?: boolean;
}

function fmt(s: number): string {
  if (!isFinite(s) || isNaN(s) || s < 0) return "0:00";
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

/** Animated Sound Equalizer Waves indicator */
function SoundWavesIndicator({ isPlaying }: { isPlaying: boolean }) {
  if (!isPlaying) return null;
  return (
    <span className="flex items-center gap-0.5 h-3.5 px-0.5" aria-hidden>
      <span className="w-1 bg-gold rounded-full h-2.5 animate-[pulse_0.6s_ease-in-out_infinite]" />
      <span className="w-1 bg-gold rounded-full h-4 animate-[pulse_0.8s_ease-in-out_infinite_0.15s]" />
      <span className="w-1 bg-gold rounded-full h-2 animate-[pulse_0.5s_ease-in-out_infinite_0.3s]" />
    </span>
  );
}

/** Visualizer for the Vinyl/Cover Mode */
function AudioVisualizer({ isPlaying }: { isPlaying: boolean }) {
  const bars = [40, 75, 30, 95, 60, 85, 45, 100, 70, 50, 90, 65, 35, 80, 55, 90, 45, 70, 85, 40];
  return (
    <div className="flex items-end justify-center gap-1.5 h-8 w-full max-w-xs px-4 mx-auto">
      {bars.map((h, i) => (
        <span
          key={i}
          className="w-1 rounded-full bg-gradient-to-t from-gold/50 via-gold to-[#ffd166] transition-all duration-300"
          style={{
            height: isPlaying ? `${Math.max(20, (h * (((i % 3) + 1) * 0.3 + 0.4)) % 100)}%` : "15%",
            opacity: isPlaying ? 0.95 : 0.35,
          }}
        />
      ))}
    </div>
  );
}

export function AdultPlayer({
  song,
  songs,
  ambient,
  onClose,
  onChange,
  soundCloudWidget,
  initialMaximized = true,
}: AdultPlayerProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [isMaximized, setIsMaximized] = useState(initialMaximized);
  const [activeView, setActiveView] = useState<AdultPlayerView>("bilingual");
  const [isPlaying, setIsPlaying] = useState(true);
  const [loadingAudio, setLoadingAudio] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.9);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [repeatMode, setRepeatMode] = useState<"off" | "all" | "one">("off");
  const [isShuffle, setIsShuffle] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [localRangesVersion, setLocalRangesVersion] = useState(0);
  const [imgError, setImgError] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const scIframeRef = useRef<HTMLIFrameElement>(null);
  const scWidgetRef = useRef<any>(null);
  const isSC = !!scEmbed(song.audio_url);

  const lang = useLang();
  const tTitle = pickLang(song, "title", lang);
  const tArtist = pickLang(song, "artist", lang);
  const fallbackCover = useMemo(() => getSongCover(song), [song]);
  const coverSrc = !imgError && song.cover_url ? song.cover_url : fallbackCover;

  // Track next and previous
  const idx = songs.findIndex((s) => s.id === song.id);
  const prevSong = idx > 0 ? songs[idx - 1] : songs[songs.length - 1];
  const nextSong = idx < songs.length - 1 ? songs[idx + 1] : songs[0];

  // Raw lyrics splitting
  const rawIndLines = useMemo(() => splitLyrics(song.lyrics_indigenous || ""), [song.lyrics_indigenous]);
  const rawPtLines = useMemo(() => {
    const translated = pickLang(song, "lyrics_pt", lang);
    return splitLyrics(translated || song.lyrics_pt || "");
  }, [song, lang]);

  // Sync config & duration
  const syncConfig = useMemo(() => getSongSyncConfig(song), [song]);
  const syncDuration = resolveDuration(duration, song.duration_seconds ?? syncConfig.durationSeconds);

  // Sync update listener (from SongTimelineModal)
  useEffect(() => {
    const handleSyncUpdate = (e: any) => {
      if (!e.detail?.songId || e.detail.songId === song.id) {
        setLocalRangesVersion((v) => v + 1);
      }
    };
    window.addEventListener("awa:song-sync-updated", handleSyncUpdate);
    return () => window.removeEventListener("awa:song-sync-updated", handleSyncUpdate);
  }, [song.id]);

  // Resolved lyric ranges
  const ranges = useMemo(
    () =>
      resolveLyricRanges({
        songId: song.id,
        songTitle: song.title,
        indLines: rawIndLines,
        ptLines: rawPtLines,
        duration: syncDuration,
        styleRanges: (song as any).style?.sync_ranges,
        syncTimes: song.sync_times ?? (syncConfig.syncTimes && syncConfig.syncTimes.length > 0 ? syncConfig.syncTimes : null),
        offsets: song.sync_offsets ?? null,
      }),
    [rawIndLines, rawPtLines, syncDuration, song.id, song.title, song.sync_offsets, song.sync_times, syncConfig.syncTimes, (song as any).style, localRangesVersion]
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
        times: song.sync_times ?? (syncConfig.syncTimes && syncConfig.syncTimes.length > 0 ? syncConfig.syncTimes : null),
        offsets: song.sync_offsets ?? null,
      }),
    [indLines, ptLines, syncDuration, song.sync_offsets, song.sync_times, syncConfig.syncTimes]
  );

  // Active Line Index
  const activeIdx = useMemo(() => {
    if (maxLen <= 0) return -1;
    if (ranges && ranges.length > 0) {
      return activeLineFromRanges(ranges, currentTime, 0.25);
    }
    if (!bounds.length) return 0;
    return activeLineIndex(bounds, currentTime, 0.5);
  }, [ranges, bounds, currentTime, maxLen]);

  // Scroll Container Refs
  const bilingualListRef = useRef<HTMLDivElement>(null);
  const indListRef = useRef<HTMLDivElement>(null);
  const ptListRef = useRef<HTMLDivElement>(null);
  const indOnlyListRef = useRef<HTMLDivElement>(null);
  const ptOnlyListRef = useRef<HTMLDivElement>(null);

  const bilingualLineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const indLineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ptLineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const indOnlyLineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ptOnlyLineRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Centering auto-scroll when active line changes (smooth and mobile-safe without scrolling the page)
  useEffect(() => {
    if (activeIdx < 0 || !isMaximized) return;

    if (activeView === "bilingual") {
      const el = bilingualLineRefs.current[activeIdx];
      const container = bilingualListRef.current;
      if (el && container) {
        const targetTop = el.offsetTop - container.clientHeight / 2 + el.clientHeight / 2;
        container.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
      }
    } else if (activeView === "split") {
      const indEl = indLineRefs.current[activeIdx];
      const indContainer = indListRef.current;
      if (indEl && indContainer) {
        const targetTop = indEl.offsetTop - indContainer.clientHeight / 2 + indEl.clientHeight / 2;
        indContainer.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
      }

      const ptEl = ptLineRefs.current[activeIdx];
      const ptContainer = ptListRef.current;
      if (ptEl && ptContainer) {
        const targetTop = ptEl.offsetTop - ptContainer.clientHeight / 2 + ptEl.clientHeight / 2;
        ptContainer.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
      }
    } else if (activeView === "indigenous") {
      const el = indOnlyLineRefs.current[activeIdx];
      const container = indOnlyListRef.current;
      if (el && container) {
        const targetTop = el.offsetTop - container.clientHeight / 2 + el.clientHeight / 2;
        container.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
      }
    } else if (activeView === "pt") {
      const el = ptOnlyLineRefs.current[activeIdx];
      const container = ptOnlyListRef.current;
      if (el && container) {
        const targetTop = el.offsetTop - container.clientHeight / 2 + el.clientHeight / 2;
        container.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
      }
    }
  }, [activeIdx, activeView, isMaximized]);

  // Audio Playback Lifecycle
  useEffect(() => {
    setCurrentTime(0);
    setDuration(song.duration_seconds || syncConfig.durationSeconds || 0);
    setLoadingAudio(true);
    setIsPlaying(true);
    setImgError(false);

    if (!isSC && audioRef.current) {
      audioRef.current.load();
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.playbackRate = playbackRate;
      audioRef.current
        .play()
        .then(() => {
          setLoadingAudio(false);
          setIsPlaying(true);
        })
        .catch(() => {
          setLoadingAudio(false);
          setIsPlaying(false);
        });
    }
  }, [song.id, song.audio_url, isSC]);

  // Volume & Speed Sync
  useEffect(() => {
    const a = audioRef.current;
    if (a) {
      a.volume = isMuted ? 0 : volume;
      a.playbackRate = playbackRate;
    }
  }, [volume, isMuted, playbackRate]);

  // Precise Progress Tracker via requestAnimationFrame
  useEffect(() => {
    if (isSC) return;
    let raf = 0;
    const tick = () => {
      const a = audioRef.current;
      if (a) {
        setCurrentTime(a.currentTime);
        if (a.duration && Number.isFinite(a.duration) && a.duration > 0) {
          setDuration(a.duration);
        }
        setIsPlaying(!a.paused);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [song.id, isSC]);

  // Finish track handler
  const handleTrackFinished = useCallback(() => {
    if (repeatMode === "one") {
      seekTo(0);
      togglePlay();
      return;
    }
    if (isShuffle) {
      const randomIdx = Math.floor(Math.random() * songs.length);
      onChange(songs[randomIdx]);
      return;
    }
    if (nextSong && (repeatMode === "all" || idx < songs.length - 1)) {
      onChange(nextSong);
    } else {
      setIsPlaying(false);
    }
  }, [repeatMode, isShuffle, songs, nextSong, idx, onChange]);

  // SoundCloud Widget binding
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
        setIsPlaying(true);
        readyTimer = window.setTimeout(() => {
          widget.play();
        }, 0);
      });
      widget.bind(SC.Widget.Events.PLAY_PROGRESS, (e: any) => {
        setLoadingAudio(false);
        setCurrentTime(e.currentPosition / 1000);
      });
      widget.bind(SC.Widget.Events.PLAY, () => {
        setLoadingAudio(false);
        setIsPlaying(true);
      });
      widget.bind(SC.Widget.Events.PAUSE, () => {
        setLoadingAudio(false);
        setIsPlaying(false);
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
  }, [song.id, isSC, soundCloudWidget, handleTrackFinished]);

  // Keyboard navigation
  useEffect(() => {
    if (!isMaximized) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showQueue) setShowQueue(false);
        else setIsMaximized(false);
      } else if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
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
  }, [isMaximized, showQueue, currentTime, duration]);

  // Audio actions
  const togglePlay = () => {
    if (isSC) {
      const w = scWidgetRef.current || soundCloudWidget;
      if (!w) {
        setIsPlaying(true);
        setLoadingAudio(true);
        return;
      }
      w.toggle();
      return;
    }
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      a.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      a.pause();
      setIsPlaying(false);
    }
  };

  const seekTo = (seconds: number) => {
    const target = Math.max(0, Math.min(duration || 9999, seconds));
    if (isSC) {
      const w = scWidgetRef.current || soundCloudWidget;
      w?.seekTo?.(target * 1000);
    } else if (audioRef.current) {
      audioRef.current.currentTime = target;
    }
    setCurrentTime(target);
  };

  const skip = (seconds: number) => {
    seekTo(currentTime + seconds);
  };

  const seekToLine = (i: number) => {
    if (ranges && ranges[i] && typeof ranges[i].start === "number") {
      seekTo(ranges[i].start);
    } else if (bounds && bounds.length > 0) {
      const startTime = i === 0 ? 0 : bounds[i - 1] ?? 0;
      seekTo(startTime);
    } else if (duration > 0 && maxLen > 0) {
      seekTo((i / maxLen) * duration);
    }
    if (!isSC && audioRef.current?.paused) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const cycleRepeat = () => {
    if (repeatMode === "off") setRepeatMode("all");
    else if (repeatMode === "all") setRepeatMode("one");
    else setRepeatMode("off");
  };

  const cycleSpeed = () => {
    const speeds = [0.75, 1.0, 1.25, 1.5];
    const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setPlaybackRate(nextSpeed);
    if (audioRef.current) audioRef.current.playbackRate = nextSpeed;
  };

  const handleVolumeChange = (val: number) => {
    setVolume(val);
    setIsMuted(val === 0);
    if (isSC) {
      scWidgetRef.current?.setVolume?.(val * 100);
    }
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (isSC) {
      scWidgetRef.current?.setVolume?.(nextMuted ? 0 : volume * 100);
    }
  };

  // Touch scrubber helper for mobile seekbar
  const handleScrub = (clientX: number, target: HTMLDivElement) => {
    if (!duration) return;
    const rect = target.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    seekTo(ratio * duration);
  };

  const viewTabs: { id: AdultPlayerView; label: string; icon: string }[] = [
    { id: "bilingual", label: "Bilíngue", icon: "🪇" },
    { id: "split", label: "Lado a Lado", icon: "📖" },
    { id: "indigenous", label: "Patxôhã", icon: "🏹" },
    { id: "pt", label: "Português", icon: "🇧🇷" },
    { id: "cover", label: "Vinil & Capa", icon: "💿" },
  ];

  if (!mounted || typeof document === "undefined") return null;

  return (
    <>
      {/* Hidden Audio Element */}
      {!isSC && (
        <audio
          ref={audioRef}
          src={song.audio_url}
          preload="auto"
          onEnded={handleTrackFinished}
          onCanPlay={() => setLoadingAudio(false)}
          onError={() => setLoadingAudio(false)}
        />
      )}

      {/* Hidden SoundCloud Iframe if used */}
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

      {/* ========================================================================= */}
      {/* 1. DOCKED MINI PLAYER (Rendered when minimized)                          */}
      {/* ========================================================================= */}
      {!isMaximized && (
        <div
          onClick={() => setIsMaximized(true)}
          className="fixed bottom-20 sm:bottom-4 left-3 right-3 sm:left-auto sm:right-6 sm:w-[420px] z-50 flex items-center gap-3 rounded-2xl border-2 border-gold/40 bg-[oklch(0.14_0.04_145/0.95)] p-2.5 shadow-[0_15px_35px_rgba(0,0,0,0.8)] backdrop-blur-2xl cursor-pointer transition-all duration-300 hover:border-gold hover:scale-[1.01]"
        >
          {/* Mini Thumbnail */}
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-gold/30 bg-black/50 shadow-md">
            <img src={coverSrc} alt="" className="h-full w-full object-cover" />
            {isPlaying && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <SoundWavesIndicator isPlaying={isPlaying} />
              </div>
            )}
          </div>

          {/* Song Info & Live Verse Snippet */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-display text-sm font-black text-cream truncate">
                {tTitle || song.title}
              </span>
              {song.aldeia && (
                <span className="hidden sm:inline-block text-[9px] font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.2 rounded-full border border-emerald-500/30 shrink-0">
                  {song.aldeia}
                </span>
              )}
            </div>

            <p className="text-[11px] text-gold/80 truncate italic">
              {tArtist || song.artist || "Povo Pataxó"}
            </p>

            {/* Current singing verse snippet */}
            {activeIdx >= 0 && (indLines[activeIdx] || ptLines[activeIdx]) && (
              <p className="text-[10px] text-foreground/75 truncate mt-0.5">
                <span className="text-gold font-bold">♪ </span>
                {indLines[activeIdx] || ptLines[activeIdx]}
              </p>
            )}

            {/* Mini Progress Bar Line */}
            <div className="mt-1 h-1 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-gold via-amber-400 to-[#ffd166]"
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={togglePlay}
              className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-tr from-gold to-[#f59e0b] text-emerald-950 shadow-md transition hover:scale-105 active:scale-95"
              title={isPlaying ? "Pausar" : "Tocar"}
            >
              {loadingAudio ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-950/30 border-t-emerald-950" />
              ) : isPlaying ? (
                <Pause className="h-4 w-4 fill-current" />
              ) : (
                <Play className="h-4 w-4 ml-0.5 fill-current" />
              )}
            </button>

            <button
              onClick={() => setIsMaximized(true)}
              className="grid h-8 w-8 place-items-center rounded-full border border-gold/30 bg-white/5 text-gold hover:bg-gold/15 transition"
              title="Expandir player"
            >
              <Maximize2 className="h-4 w-4" />
            </button>

            <button
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-full border border-rose-500/40 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 transition"
              title="Fechar música"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. FULL MODAL PLAYER (Rendered when isMaximized)                          */}
      {/* ========================================================================= */}
      {isMaximized &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex flex-col h-[100dvh] bg-[#070e0a] text-white overflow-hidden select-none animate-in fade-in duration-200">
            {/* Cinematic Ambient Background */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              {song.video_url ? (
                ytEmbed(song.video_url) ? (
                  <iframe
                    src={ytEmbed(song.video_url)!}
                    allow="autoplay; encrypted-media"
                    className="absolute left-1/2 top-1/2 h-[120vh] w-[220vw] -translate-x-1/2 -translate-y-1/2 md:w-[160vw] pointer-events-none border-0 opacity-25 blur-sm"
                  />
                ) : (
                  <video
                    src={song.video_url}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="h-full w-full object-cover scale-105 opacity-25 blur-sm"
                  />
                )
              ) : ambient ? (
                <video
                  src={ambient.video_url}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="h-full w-full object-cover scale-105 opacity-25 blur-sm"
                />
              ) : (
                <img
                  src={coverSrc}
                  alt=""
                  className="h-full w-full object-cover scale-125 blur-3xl opacity-30"
                />
              )}
              <div className="absolute inset-0 bg-radial-vignette from-transparent via-black/80 to-[#070e0a]" />
              <div className="absolute inset-0 bg-gradient-to-b from-[#070e0a]/90 via-[#070e0a]/70 to-[#070e0a]/95" />
            </div>

            {/* TOP HEADER BAR (Compact on mobile) */}
            <header className="relative z-20 shrink-0 border-b border-gold/20 bg-black/60 px-3 py-2 sm:px-6 sm:py-3 backdrop-blur-xl">
              <div className="mx-auto flex max-w-7xl items-center justify-between gap-2">
                {/* Back / Minimize button */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsMaximized(false)}
                    className="grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-full border border-gold/30 bg-black/60 text-gold hover:bg-gold hover:text-emerald-950 transition-all hover:scale-105"
                    title="Minimizar player"
                    aria-label="Minimizar player"
                  >
                    <Minimize2 className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                  </button>

                  <div className="hidden xs:flex flex-col min-w-0">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gold flex items-center gap-1.5">
                      <span>AWÃ TECH</span>
                      {song.aldeia && (
                        <span className="text-emerald-400 font-bold bg-emerald-950/70 border border-emerald-500/30 px-1.5 py-0.2 rounded-full">
                          {song.aldeia}
                        </span>
                      )}
                    </span>
                    <h1 className="font-display text-xs sm:text-sm font-black text-cream truncate max-w-[180px] sm:max-w-xs">
                      {tTitle || song.title}
                    </h1>
                  </div>
                </div>

                {/* Mobile View Switcher Tabs (Horizontal scrollable pill list) */}
                <nav
                  aria-label="Modos de exibição"
                  className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar py-0.5 px-1 max-w-[60vw] sm:max-w-none"
                >
                  {viewTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveView(tab.id)}
                      className={`shrink-0 flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold transition-all ${
                        activeView === tab.id
                          ? "bg-gradient-to-r from-gold via-amber-400 to-[#f59e0b] text-emerald-950 font-black shadow-[0_2px_12px_rgba(249,168,37,0.4)] scale-105"
                          : "bg-black/50 hover:bg-white/10 text-cream/70 hover:text-cream border border-gold/20"
                      }`}
                    >
                      <span>{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </nav>

                {/* Right Actions: Timeline, Queue, Close */}
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <button
                    onClick={() => setShowTimeline(true)}
                    className="grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-full border border-gold/30 bg-black/60 text-gold hover:bg-gold/20 transition"
                    title="Ajustar Linha do Tempo (Timeline)"
                  >
                    <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </button>

                  <button
                    onClick={() => setShowQueue((v) => !v)}
                    className={`grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-full border transition ${
                      showQueue
                        ? "border-gold bg-gold text-emerald-950"
                        : "border-gold/30 bg-black/60 text-gold hover:bg-gold/15"
                    }`}
                    title={`Fila de Cânticos (${songs.length})`}
                  >
                    <ListMusic className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </button>

                  <button
                    onClick={onClose}
                    className="grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-full border border-rose-500/40 bg-rose-500/10 text-rose-300 hover:bg-rose-500 hover:text-white transition"
                    title="Fechar e parar música"
                    aria-label="Fechar player"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </header>

            {/* ===================================================================== */}
            {/* MAIN STAGE CONTENT (Crucial flex-1 min-h-0 for responsive scroll)   */}
            {/* ===================================================================== */}
            <main className="relative z-10 flex-1 min-h-0 w-full overflow-hidden px-2 sm:px-6 py-2 sm:py-4 flex flex-col justify-center">
              {/* VIEW 1: BILINGUAL UNIFIED CARDS (Default & Most Requested) */}
              {activeView === "bilingual" && (
                <div className="h-full flex flex-col max-w-4xl w-full mx-auto min-h-0 overflow-hidden">
                  <div className="shrink-0 flex items-center justify-between border-b border-gold/20 pb-1.5 mb-2 px-2">
                    <span className="text-[11px] font-bold text-gold flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-gold" />
                      <span>Versos Sincronizados · Patxôhã & Português</span>
                    </span>
                    <span className="text-[10px] text-foreground/60 hidden xs:inline">
                      Toque em qualquer verso para pular
                    </span>
                  </div>

                  <div
                    ref={bilingualListRef}
                    className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-1 sm:px-3 py-2 space-y-2.5 sm:space-y-3.5 scroll-smooth"
                    style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-y" }}
                  >
                    {maxLen === 0 ? (
                      <div className="flex h-full flex-col items-center justify-center py-16 text-center">
                        <Music className="h-10 w-10 text-gold/40 mb-2" />
                        <p className="text-sm font-semibold text-cream">Letra em melodia ancestral sagrada.</p>
                        <p className="text-xs text-foreground/60 mt-1">Use a Linha do Tempo para adicionar versos.</p>
                      </div>
                    ) : (
                      Array.from({ length: maxLen }).map((_, idx) => {
                        const isActive = idx === activeIdx;
                        const indLine = indLines[idx] || "";
                        const ptLine = ptLines[idx] || "";

                        return (
                          <div
                            key={idx}
                            ref={(el) => {
                              bilingualLineRefs.current[idx] = el;
                            }}
                            onClick={() => seekToLine(idx)}
                            className={`group relative rounded-2xl p-3 sm:p-4 text-left transition-all duration-300 cursor-pointer border ${
                              isActive
                                ? "bg-gradient-to-r from-gold/25 via-emerald-950/60 to-gold/15 border-gold shadow-[0_0_30px_rgba(249,168,37,0.3)] scale-[1.01]"
                                : "bg-black/45 hover:bg-white/5 border-gold/15 text-cream/75 hover:border-gold/30"
                            }`}
                          >
                            <div className="flex items-start gap-2.5 sm:gap-3.5">
                              {/* Verse index or play indicator */}
                              <div
                                className={`mt-0.5 flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-full font-mono text-[10px] sm:text-xs font-bold transition ${
                                  isActive
                                    ? "bg-gold text-emerald-950 font-black shadow-md"
                                    : "bg-gold/10 text-gold group-hover:bg-gold group-hover:text-emerald-950"
                                }`}
                              >
                                {isActive ? (
                                  <Play className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-current animate-pulse" />
                                ) : (
                                  idx + 1
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-1">
                                  <span
                                    className={`text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                      isActive
                                        ? "bg-gold text-emerald-950 font-black"
                                        : "bg-emerald-950/80 text-emerald-300 border border-emerald-500/30"
                                    }`}
                                  >
                                    🏹 Patxôhã
                                  </span>
                                </div>

                                <p
                                  className={`font-display font-black leading-snug sm:leading-tight transition-colors ${
                                    isActive
                                      ? "text-base sm:text-xl md:text-2xl text-gold drop-shadow-[0_0_20px_rgba(255,209,102,0.5)]"
                                      : "text-sm sm:text-lg md:text-xl text-cream"
                                  }`}
                                >
                                  {indLine || "—"}
                                </p>

                                {ptLine && (
                                  <div
                                    className={`mt-2 pt-2 border-t flex flex-col ${
                                      isActive ? "border-gold/30 text-cream" : "border-gold/10 text-foreground/75"
                                    }`}
                                  >
                                    <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-amber-400/80 mb-0.5">
                                      Tradução
                                    </span>
                                    <p
                                      className={`font-sans text-xs sm:text-sm md:text-base italic leading-snug ${
                                        isActive ? "text-cream font-medium" : "text-foreground/70"
                                      }`}
                                    >
                                      {ptLine}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* VIEW 2: LADO A LADO (2 Synchronized Parallel Columns on Mobile & Desktop) */}
              {activeView === "split" && (
                <div className="h-full flex flex-col max-w-5xl w-full mx-auto min-h-0 overflow-hidden">
                  <div className="shrink-0 flex items-center justify-between border-b border-gold/20 pb-1.5 mb-2 px-2">
                    <span className="text-[11px] font-bold text-gold flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5 text-gold" />
                      <span>Exibição Lado a Lado · Duas Colunas Paralelas</span>
                    </span>
                    <span className="text-[10px] text-foreground/60 hidden xs:inline">
                      Sincronização em tempo real
                    </span>
                  </div>

                  {/* Dual Column Grid Container (100% responsive for phones) */}
                  <div className="flex-1 min-h-0 w-full grid grid-cols-2 gap-1.5 sm:gap-4 overflow-hidden">
                    {/* LEFT COLUMN: PATAXÓ (PATXÔHÃ) */}
                    <div className="flex flex-col min-h-0 h-full rounded-2xl border border-gold/25 bg-black/40 backdrop-blur-md overflow-hidden shadow-xl">
                      <div className="shrink-0 flex items-center justify-between border-b border-gold/20 bg-emerald-950/70 px-2.5 py-1.5 sm:py-2 text-center">
                        <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1 truncate">
                          <span>🏹</span> <span className="truncate">Patxôhã</span>
                        </span>
                        <span className="text-[9px] sm:text-[10px] font-mono text-gold/80 shrink-0">
                          {indLines.length} versos
                        </span>
                      </div>

                      <div
                        ref={indListRef}
                        className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-1.5 sm:p-3 space-y-1.5 sm:space-y-2.5 scroll-smooth"
                        style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-y" }}
                      >
                        {indLines.length === 0 ? (
                          <div className="flex h-full items-center justify-center text-center text-xs text-foreground/60 p-4">
                            Sem letra indígena cadastrada
                          </div>
                        ) : (
                          indLines.map((line, idx) => {
                            const isActive = idx === activeIdx;
                            return (
                              <div
                                key={idx}
                                ref={(el) => {
                                  indLineRefs.current[idx] = el;
                                }}
                                onClick={() => seekToLine(idx)}
                                className={`group cursor-pointer rounded-xl p-2 sm:p-3 transition-all duration-300 border text-left ${
                                  isActive
                                    ? "bg-gradient-to-r from-emerald-900/70 via-emerald-800/80 to-emerald-900/70 border-gold shadow-[0_0_20px_rgba(76,175,80,0.3)] scale-[1.02]"
                                    : "bg-black/30 hover:bg-white/5 border-gold/10 text-cream/70"
                                }`}
                              >
                                <div className="flex items-start gap-1.5 sm:gap-2">
                                  <span
                                    className={`shrink-0 font-mono text-[9px] sm:text-[11px] font-bold rounded-full h-4 w-4 sm:h-5 sm:w-5 grid place-items-center mt-0.5 ${
                                      isActive ? "bg-gold text-emerald-950" : "text-gold/60 bg-gold/10"
                                    }`}
                                  >
                                    {idx + 1}
                                  </span>
                                  <p
                                    className={`font-display font-black leading-snug sm:leading-tight ${
                                      isActive
                                        ? "text-xs sm:text-base md:text-lg text-gold drop-shadow-sm"
                                        : "text-[11px] sm:text-sm md:text-base text-cream"
                                    }`}
                                  >
                                    {line}
                                  </p>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* RIGHT COLUMN: PORTUGUÊS (TRADUÇÃO) */}
                    <div className="flex flex-col min-h-0 h-full rounded-2xl border border-gold/25 bg-black/40 backdrop-blur-md overflow-hidden shadow-xl">
                      <div className="shrink-0 flex items-center justify-between border-b border-gold/20 bg-amber-950/70 px-2.5 py-1.5 sm:py-2 text-center">
                        <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1 truncate">
                          <span>🇧🇷</span> <span className="truncate">Português</span>
                        </span>
                        <span className="text-[9px] sm:text-[10px] font-mono text-gold/80 shrink-0">
                          {ptLines.length} versos
                        </span>
                      </div>

                      <div
                        ref={ptListRef}
                        className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-1.5 sm:p-3 space-y-1.5 sm:space-y-2.5 scroll-smooth"
                        style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-y" }}
                      >
                        {ptLines.length === 0 ? (
                          <div className="flex h-full items-center justify-center text-center text-xs text-foreground/60 p-4">
                            Sem tradução cadastrada
                          </div>
                        ) : (
                          ptLines.map((line, idx) => {
                            const isActive = idx === activeIdx;
                            return (
                              <div
                                key={idx}
                                ref={(el) => {
                                  ptLineRefs.current[idx] = el;
                                }}
                                onClick={() => seekToLine(idx)}
                                className={`group cursor-pointer rounded-xl p-2 sm:p-3 transition-all duration-300 border text-left ${
                                  isActive
                                    ? "bg-gradient-to-r from-amber-950/80 via-amber-900/80 to-amber-950/80 border-gold shadow-[0_0_20px_rgba(249,168,37,0.3)] scale-[1.02]"
                                    : "bg-black/30 hover:bg-white/5 border-gold/10 text-cream/70"
                                }`}
                              >
                                <div className="flex items-start gap-1.5 sm:gap-2">
                                  <span
                                    className={`shrink-0 font-mono text-[9px] sm:text-[11px] font-bold rounded-full h-4 w-4 sm:h-5 sm:w-5 grid place-items-center mt-0.5 ${
                                      isActive ? "bg-amber-400 text-amber-950" : "text-amber-300/60 bg-amber-500/10"
                                    }`}
                                  >
                                    {idx + 1}
                                  </span>
                                  <p
                                    className={`font-sans italic leading-snug sm:leading-tight ${
                                      isActive
                                        ? "text-xs sm:text-base md:text-lg text-cream font-medium drop-shadow-sm"
                                        : "text-[11px] sm:text-sm md:text-base text-foreground/75"
                                    }`}
                                  >
                                    {line}
                                  </p>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW 3: PATXÔHÃ EXCLUSIVE (Solo Indigenous Language Focus) */}
              {activeView === "indigenous" && (
                <div className="h-full flex flex-col max-w-3xl w-full mx-auto min-h-0 overflow-hidden">
                  <div className="shrink-0 flex items-center justify-between border-b border-gold/20 pb-1.5 mb-2 px-2">
                    <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
                      <span>🏹</span> Patxôhã Puro · Letra na Língua Sagrada
                    </span>
                    <span className="text-[10px] text-foreground/60 hidden xs:inline">
                      Ideal para cantar junto
                    </span>
                  </div>

                  <div
                    ref={indOnlyListRef}
                    className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-2 py-3 space-y-3 scroll-smooth text-center"
                    style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-y" }}
                  >
                    {indLines.map((line, idx) => {
                      const isActive = idx === activeIdx;
                      return (
                        <div
                          key={idx}
                          ref={(el) => {
                            indOnlyLineRefs.current[idx] = el;
                          }}
                          onClick={() => seekToLine(idx)}
                          className={`group cursor-pointer rounded-2xl p-4 transition-all duration-300 border ${
                            isActive
                              ? "bg-gradient-to-r from-emerald-950/80 via-emerald-900/90 to-emerald-950/80 border-gold shadow-[0_0_25px_rgba(249,168,37,0.3)] scale-[1.02]"
                              : "bg-black/35 hover:bg-white/5 border-gold/15 text-cream/70"
                          }`}
                        >
                          <div className="text-[10px] font-mono font-bold text-gold/70 mb-1">
                            VERSO {idx + 1}
                          </div>
                          <p
                            className={`font-display font-black leading-snug ${
                              isActive
                                ? "text-lg sm:text-2xl md:text-3xl text-gold drop-shadow-[0_0_15px_rgba(255,209,102,0.4)]"
                                : "text-base sm:text-xl md:text-2xl text-cream"
                            }`}
                          >
                            {line}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* VIEW 4: PORTUGUÊS EXCLUSIVE (Solo Translation Focus) */}
              {activeView === "pt" && (
                <div className="h-full flex flex-col max-w-3xl w-full mx-auto min-h-0 overflow-hidden">
                  <div className="shrink-0 flex items-center justify-between border-b border-gold/20 pb-1.5 mb-2 px-2">
                    <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                      <span>🇧🇷</span> Português · Tradução e Significado
                    </span>
                    <span className="text-[10px] text-foreground/60 hidden xs:inline">
                      Compreenda a mensagem dos ancestrais
                    </span>
                  </div>

                  <div
                    ref={ptOnlyListRef}
                    className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-2 py-3 space-y-3 scroll-smooth text-center"
                    style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-y" }}
                  >
                    {ptLines.map((line, idx) => {
                      const isActive = idx === activeIdx;
                      return (
                        <div
                          key={idx}
                          ref={(el) => {
                            ptOnlyLineRefs.current[idx] = el;
                          }}
                          onClick={() => seekToLine(idx)}
                          className={`group cursor-pointer rounded-2xl p-4 transition-all duration-300 border ${
                            isActive
                              ? "bg-gradient-to-r from-amber-950/80 via-amber-900/90 to-amber-950/80 border-gold shadow-[0_0_25px_rgba(249,168,37,0.3)] scale-[1.02]"
                              : "bg-black/35 hover:bg-white/5 border-gold/15 text-cream/70"
                          }`}
                        >
                          <div className="text-[10px] font-mono font-bold text-amber-400/70 mb-1">
                            VERSO {idx + 1}
                          </div>
                          <p
                            className={`font-sans italic leading-snug ${
                              isActive
                                ? "text-base sm:text-xl md:text-2xl text-cream font-medium drop-shadow-sm"
                                : "text-sm sm:text-lg md:text-xl text-foreground/75"
                            }`}
                          >
                            {line}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* VIEW 5: VINIL & CAPA (Original Visual Vinyl Stage) */}
              {activeView === "cover" && (
                <div className="h-full flex flex-col items-center justify-center max-w-xl w-full mx-auto min-h-0 overflow-y-auto px-2 py-2">
                  <div className="relative w-full max-w-xs sm:max-w-sm aspect-square flex items-center justify-center p-3">
                    {/* Vinyl Glow Aura */}
                    <div
                      className="absolute inset-0 rounded-full opacity-40 blur-3xl pointer-events-none"
                      style={{ backgroundImage: `url(${coverSrc})`, backgroundSize: "cover" }}
                    />

                    {/* Rotating Vinyl Disc Record */}
                    <div
                      className={`absolute h-[85%] w-[85%] rounded-full border-4 border-[#1e1e1e] bg-[#111] shadow-2xl transition-transform duration-700 flex items-center justify-center ${
                        isPlaying ? "animate-[spin_18s_linear_infinite]" : "rotate-12"
                      }`}
                      style={{
                        right: "-8%",
                        background:
                          "radial-gradient(circle, #333 15%, #181818 25%, #2a2a2a 38%, #141414 52%, #222 68%, #101010 85%, #050505 100%)",
                      }}
                    >
                      <div className="relative h-[32%] w-[32%] rounded-full border-2 border-gold/60 overflow-hidden bg-emerald-950 flex items-center justify-center shadow-inner">
                        <img src={coverSrc} alt="" className="h-full w-full object-cover opacity-85" />
                        <div className="absolute inset-0 bg-black/25" />
                        <div className="relative h-3 w-3 rounded-full bg-gold border-2 border-black" />
                      </div>
                    </div>

                    {/* Album Cover Sleeve */}
                    <div className="relative z-10 h-[88%] w-[88%] overflow-hidden rounded-2xl border-2 border-gold/50 bg-black shadow-2xl">
                      <img
                        src={coverSrc}
                        alt={tTitle || song.title}
                        onError={() => setImgError(true)}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />

                      {song.aldeia && (
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-black/70 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-gold border border-gold/30">
                          <MapPin className="h-3 w-3 text-gold" />
                          <span>{song.aldeia}</span>
                        </div>
                      )}

                      <div className="absolute bottom-3 inset-x-3">
                        <h2 className="font-display text-base sm:text-xl font-black text-cream drop-shadow-md truncate">
                          {tTitle || song.title}
                        </h2>
                        {song.artist && (
                          <p className="text-xs text-gold/90 font-medium italic truncate mt-0.5">
                            {tArtist || song.artist}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Equalizer simulation */}
                  <div className="mt-2 w-full">
                    <AudioVisualizer isPlaying={isPlaying} />
                  </div>

                  {/* Live active lyric ticker snippet */}
                  {activeIdx >= 0 && (indLines[activeIdx] || ptLines[activeIdx]) && (
                    <div className="mt-3 max-w-sm rounded-xl border border-gold/25 bg-black/60 px-4 py-2 text-center backdrop-blur-md">
                      <p className="text-xs font-bold text-gold truncate">
                        {indLines[activeIdx]}
                      </p>
                      {ptLines[activeIdx] && (
                        <p className="text-[11px] text-cream/70 italic truncate mt-0.5">
                          {ptLines[activeIdx]}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Cultural Description Quote */}
                  {song.description && (
                    <div className="mt-2 max-w-sm rounded-xl border border-gold/20 bg-black/40 p-2.5 backdrop-blur-md text-center">
                      <div className="flex items-center justify-center gap-1.5 text-gold text-[10px] font-bold uppercase tracking-wider mb-0.5">
                        <Quote className="h-3 w-3" /> Significado Cultural
                      </div>
                      <p className="text-xs text-foreground/80 italic leading-relaxed line-clamp-2">
                        "{song.description}"
                      </p>
                    </div>
                  )}
                </div>
              )}
            </main>

            {/* ===================================================================== */}
            {/* BOTTOM PLAYBACK CONTROLS (Fully responsive on mobile)               */}
            {/* ===================================================================== */}
            <footer className="relative z-30 shrink-0 border-t border-gold/25 bg-gradient-to-t from-black via-black/95 to-black/85 px-3 py-2 sm:px-8 sm:py-3.5 backdrop-blur-2xl pb-[max(env(safe-area-inset-bottom),12px)]">
              <div className="mx-auto max-w-5xl">
                {/* Touch-Friendly Progress Seek Bar */}
                <div className="flex items-center gap-2.5">
                  <span className="text-[11px] font-mono font-semibold text-gold tabular-nums w-10 text-right shrink-0">
                    {fmt(currentTime)}
                  </span>

                  <div
                    className="group relative flex-1 py-2 cursor-pointer flex items-center"
                    onClick={(e) => handleScrub(e.clientX, e.currentTarget as HTMLDivElement)}
                    onTouchMove={(e) => {
                      if (e.touches[0]) handleScrub(e.touches[0].clientX, e.currentTarget as HTMLDivElement);
                    }}
                  >
                    <div className="h-1.5 sm:h-2 w-full rounded-full bg-white/15 overflow-hidden transition-all group-hover:h-2.5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-gold via-[#f59e0b] to-[#ffd166] shadow-[0_0_12px_rgba(249,168,37,0.7)]"
                        style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  <span className="text-[11px] font-mono font-semibold text-foreground/60 tabular-nums w-10 shrink-0">
                    {fmt(duration)}
                  </span>
                </div>

                {/* Master Playback Controls Row */}
                <div className="mt-1 sm:mt-2 flex items-center justify-between gap-2">
                  {/* Left: Mini song info on tablet/desktop */}
                  <div className="hidden md:flex items-center gap-2.5 w-1/4 min-w-0">
                    <img
                      src={coverSrc}
                      alt=""
                      className="h-10 w-10 shrink-0 rounded-lg object-cover border border-gold/30"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-cream truncate">{tTitle || song.title}</div>
                      <div className="text-[10px] text-foreground/70 truncate italic">
                        {tArtist || song.artist || "Povo Pataxó"}
                      </div>
                    </div>
                  </div>

                  {/* Center: Core Playback buttons */}
                  <div className="flex items-center justify-center gap-2 xs:gap-3 sm:gap-6 flex-1">
                    {/* Repeat button */}
                    <button
                      onClick={cycleRepeat}
                      className={`grid h-8 w-8 place-items-center rounded-full transition ${
                        repeatMode !== "off" ? "text-gold bg-gold/15" : "text-foreground/50 hover:text-foreground/80"
                      }`}
                      title={`Repetir: ${repeatMode === "off" ? "Desligado" : repeatMode === "all" ? "Todos" : "Este cântico"}`}
                    >
                      {repeatMode === "one" ? <Repeat1 className="h-4 w-4" /> : <Repeat className="h-4 w-4" />}
                    </button>

                    {/* Rewind 10s */}
                    <button
                      onClick={() => skip(-10)}
                      className="grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-full text-foreground/70 hover:text-gold hover:bg-gold/10 transition"
                      title="Voltar 10 segundos"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>

                    {/* Previous Track */}
                    <button
                      disabled={!prevSong}
                      onClick={() => prevSong && onChange(prevSong)}
                      className="grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-full text-cream/80 hover:text-gold hover:bg-gold/10 transition disabled:opacity-20"
                      aria-label="Cântico anterior"
                    >
                      <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                    </button>

                    {/* Hero Radiant Play/Pause Button */}
                    <button
                      onClick={togglePlay}
                      className="relative grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-full bg-gradient-to-tr from-[#ffd166] via-[#f59e0b] to-[#d97706] text-bark shadow-[0_0_25px_rgba(249,168,37,0.6)] transition hover:scale-105 active:scale-95 cursor-pointer"
                      aria-label={loadingAudio ? "Carregando" : isPlaying ? "Pausar" : "Tocar"}
                    >
                      {loadingAudio ? (
                        <span className="h-5 w-5 sm:h-6 sm:w-6 animate-spin rounded-full border-2 border-bark/30 border-t-bark" />
                      ) : isPlaying ? (
                        <Pause className="h-5 w-5 sm:h-6 sm:w-6 fill-current text-emerald-950" />
                      ) : (
                        <Play className="h-5 w-5 sm:h-6 sm:w-6 ml-0.5 fill-current text-emerald-950" />
                      )}
                    </button>

                    {/* Next Track */}
                    <button
                      disabled={!nextSong}
                      onClick={() => nextSong && onChange(nextSong)}
                      className="grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-full text-cream/80 hover:text-gold hover:bg-gold/10 transition disabled:opacity-20"
                      aria-label="Próximo cântico"
                    >
                      <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                    </button>

                    {/* Forward 10s */}
                    <button
                      onClick={() => skip(10)}
                      className="grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-full text-foreground/70 hover:text-gold hover:bg-gold/10 transition"
                      title="Avançar 10 segundos"
                    >
                      <RotateCw className="h-4 w-4" />
                    </button>

                    {/* Shuffle button */}
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

                  {/* Right: Speed & Volume controls */}
                  <div className="flex items-center justify-end gap-2 w-auto md:w-1/4">
                    {/* Speed button (Cycle on mobile / compact) */}
                    <button
                      onClick={cycleSpeed}
                      className="flex items-center gap-1 rounded-full border border-gold/25 bg-black/40 px-2 sm:px-2.5 py-1 text-[11px] font-black text-gold hover:bg-gold/15 transition"
                      title="Velocidade de reprodução (toque para alternar)"
                    >
                      <span>{playbackRate}x</span>
                    </button>

                    {/* Volume Mute & Slider */}
                    <button
                      onClick={toggleMute}
                      className="grid h-8 w-8 place-items-center rounded-full text-gold/80 hover:text-gold hover:bg-white/5 transition"
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
                      className="hidden sm:inline-block h-1.5 w-16 cursor-pointer appearance-none rounded-full bg-white/20 accent-gold"
                    />
                  </div>
                </div>
              </div>
            </footer>

            {/* SLIDE-OVER TRACKLIST QUEUE DRAWER */}
            {showQueue && (
              <div className="absolute inset-y-0 right-0 z-50 w-full max-w-sm sm:max-w-md border-l border-gold/30 bg-black/95 p-4 sm:p-5 shadow-2xl backdrop-blur-3xl flex flex-col animate-in slide-in-from-right duration-300">
                <div className="flex items-center justify-between border-b border-gold/20 pb-3">
                  <div className="flex items-center gap-2">
                    <ListMusic className="h-5 w-5 text-gold" />
                    <h3 className="font-display text-base sm:text-lg font-black text-cream">Fila de Cânticos</h3>
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

                <div
                  className="flex-1 min-h-0 overflow-y-auto overscroll-contain py-3 space-y-2"
                  style={{ WebkitOverflowScrolling: "touch" }}
                >
                  {songs.map((s) => {
                    const isCurrent = s.id === song.id;
                    const cardCover = getSongCover(s);
                    return (
                      <button
                        key={s.id}
                        onClick={() => {
                          onChange(s);
                          setShowQueue(false);
                        }}
                        className={`w-full flex items-center gap-3 rounded-xl p-2.5 text-left transition ${
                          isCurrent
                            ? "bg-gold/20 border border-gold shadow-md"
                            : "hover:bg-white/10 border border-transparent"
                        }`}
                      >
                        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-gold/30 bg-black">
                          <img src={cardCover} alt="" className="h-full w-full object-cover" />
                          {isCurrent && isPlaying && (
                            <div className="absolute inset-0 bg-black/40 grid place-items-center">
                              <span className="h-2 w-2 rounded-full bg-gold animate-ping" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div
                            className={`font-display text-xs sm:text-sm font-bold truncate ${
                              isCurrent ? "text-gold" : "text-cream"
                            }`}
                          >
                            {s.title}
                          </div>
                          <div className="text-[11px] text-foreground/60 truncate italic">
                            {s.artist || "Povo Pataxó"}
                          </div>
                        </div>
                        {s.aldeia && (
                          <span className="text-[9px] text-emerald-400 font-semibold bg-emerald-950/70 border border-emerald-500/30 px-2 py-0.5 rounded-full shrink-0">
                            {s.aldeia}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TIMELINE MODAL INTEGRATION */}
            {showTimeline && (
              <SongTimelineModal
                song={song as any}
                onClose={() => setShowTimeline(false)}
                onSaved={() => {
                  setLocalRangesVersion((v) => v + 1);
                }}
              />
            )}
          </div>,
          document.body
        )}
    </>
  );
}

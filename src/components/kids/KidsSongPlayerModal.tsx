import React, { useRef, useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Volume2,
  VolumeX,
  RotateCcw,
  Play,
  Pause,
  ArrowLeft,
  Home,
  Music,
  Sparkles,
  Sliders,
  Minimize2,
  Clock,
  BookOpen,
  Languages,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import {
  splitLyrics,
  activeLineFromRanges,
  resolveLyricRanges,
} from "@/lib/lyric-sync";
import { getSongSyncConfig, setSongManualOffset } from "@/data/kids-songs-sync";
import type { MiniPlayerSong } from "./MiniPlayer";
import { SongTimelineModal } from "@/components/music/SongTimelineSyncEditor";

// Assets
import girlImg from "/kids-player-assets/character_girl.png";
import boyImg from "/kids-player-assets/character_boy.png";
import topBannerImg from "/kids-player-assets/top_banner.png";
import medallionImg from "/kids-player-assets/center_medallion.png";
import tribalDividerImg from "/kids-player-assets/center_tribal_divider.png";
import tribalBorderTop from "/kids-player-assets/tribal_border_top.png";
import tribalBorderBottom from "/kids-player-assets/tribal_border_bottom.png";

interface KidsSongPlayerModalProps {
  song: MiniPlayerSong;
  onClose: () => void;
  onMinimize?: () => void;
  starsCount?: number;
}

type MobileTab = "bilingual" | "split" | "indigenous" | "pt";

export function KidsSongPlayerModal({
  song,
  onClose,
  onMinimize,
  starsCount = 125,
}: KidsSongPlayerModalProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [karaokeMode, setKaraokeMode] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [mobileTab, setMobileTab] = useState<MobileTab>("bilingual");
  const [offsetNudge, setOffsetNudge] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`awa_song_offset_${song.id}`);
      return saved ? parseFloat(saved) || 0 : 0;
    } catch {
      return 0;
    }
  });
  const [showOffsetControls, setShowOffsetControls] = useState(false);
  const [audioError, setAudioError] = useState(false);

  // References for scrolling lyrics
  const indListRef = useRef<HTMLDivElement>(null);
  const ptListRef = useRef<HTMLDivElement>(null);
  const bilingualListRef = useRef<HTMLDivElement>(null);
  const indLineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ptLineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const bilingualLineRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Split lyrics
  const indLines = useMemo(() => splitLyrics(song.lyrics_indigenous || ""), [song.lyrics_indigenous]);
  const ptLines = useMemo(() => splitLyrics(song.lyrics_pt || ""), [song.lyrics_pt]);

  // Synchronized timestamps with offset
  const syncConfig = useMemo(() => {
    const config = getSongSyncConfig(song);
    const adjustedTimes = config.syncTimes.map((t) => Math.max(0, Number((t + offsetNudge).toFixed(2))));
    return {
      ...config,
      syncTimes: adjustedTimes,
    };
  }, [song, offsetNudge]);

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
        indLines,
        ptLines,
        duration: duration || syncConfig.durationSeconds,
        styleRanges: (song as any).style?.sync_ranges,
        syncTimes: syncConfig.syncTimes && syncConfig.syncTimes.length > 0 ? syncConfig.syncTimes : song.sync_times ?? null,
      }),
    [song.id, song.title, indLines, ptLines, duration, syncConfig.durationSeconds, syncConfig.syncTimes, (song as any).style, song.sync_times, localRangesVersion]
  );

  // Versos efetivos para exibição
  const displayIndLines = useMemo(() => {
    if (ranges && ranges.length > 0 && ranges.some((r) => r.text)) {
      return ranges.map((r) => r.text || "");
    }
    return indLines;
  }, [ranges, indLines]);

  const displayPtLines = useMemo(() => {
    if (ranges && ranges.length > 0 && ranges.some((r) => r.translation)) {
      return ranges.map((r) => r.translation || "");
    }
    return ptLines;
  }, [ranges, ptLines]);

  const maxLineCount = Math.max(displayIndLines.length, displayPtLines.length);

  // Audio duration setup
  useEffect(() => {
    const fallbackDur = song.duration_seconds || syncConfig.durationSeconds || 90;
    setDuration(fallbackDur);
  }, [song.duration_seconds, syncConfig.durationSeconds]);

  // Load and play audio when song changes
  useEffect(() => {
    setCurrentTime(0);
    setIsPlaying(false);
    setAudioError(false);

    const a = audioRef.current;
    if (!a) return;

    a.load();
    a.playbackRate = playbackRate;
    const playPromise = a.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch(() => {
          setIsPlaying(false);
        });
    }
  }, [song.id, song.audio_url]);

  // Smooth time tracking via requestAnimationFrame
  useEffect(() => {
    let rafId = 0;
    const updateProgress = () => {
      const a = audioRef.current;
      if (a) {
        setCurrentTime(a.currentTime);
        if (a.duration && Number.isFinite(a.duration) && a.duration > 0) {
          setDuration(a.duration);
        }
        setIsPlaying(!a.paused);
      }
      rafId = requestAnimationFrame(updateProgress);
    };
    rafId = requestAnimationFrame(updateProgress);
    return () => cancelAnimationFrame(rafId);
  }, [song.id]);

  // Active line index calculation
  const activeLineIndex = useMemo(() => {
    if (maxLineCount === 0) return -1;
    if (ranges && ranges.length > 0) {
      return activeLineFromRanges(ranges, currentTime, 0.2);
    }
    const times = syncConfig.syncTimes;
    if (!times || times.length === 0) return 0;

    const leadTime = 0.2;
    const t = currentTime + leadTime;

    if (times.length > 0 && t < times[0]) {
      return -1;
    }

    for (let i = times.length - 1; i >= 0; i--) {
      if (t >= times[i]) {
        return Math.min(i, maxLineCount - 1);
      }
    }
    return 0;
  }, [currentTime, ranges, syncConfig.syncTimes, maxLineCount]);

  // Smooth auto-scrolling to keep active line centered
  useEffect(() => {
    if (activeLineIndex < 0) return;

    // Desktop/split: Left list
    const indEl = indLineRefs.current[activeLineIndex];
    const indContainer = indListRef.current;
    if (indEl && indContainer) {
      const targetTop = indEl.offsetTop - indContainer.clientHeight / 2 + indEl.clientHeight / 2;
      indContainer.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
    }

    // Desktop/split: Right list
    const ptEl = ptLineRefs.current[activeLineIndex];
    const ptContainer = ptListRef.current;
    if (ptEl && ptContainer) {
      const targetTop = ptEl.offsetTop - ptContainer.clientHeight / 2 + ptEl.clientHeight / 2;
      ptContainer.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
    }

    // Mobile: Bilingual unified list
    const biEl = bilingualLineRefs.current[activeLineIndex];
    const biContainer = bilingualListRef.current;
    if (biEl && biContainer) {
      const targetTop = biEl.offsetTop - biContainer.clientHeight / 2 + biEl.clientHeight / 2;
      biContainer.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
    }
  }, [activeLineIndex]);

  // Audio controls
  const togglePlay = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      a.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      a.pause();
      setIsPlaying(false);
    }
  };

  const seekTo = (sec: number) => {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = Math.max(0, Math.min(sec, duration));
    setCurrentTime(a.currentTime);
  };

  const seekToVerse = (index: number) => {
    if (ranges && ranges[index] !== undefined) {
      seekTo(ranges[index].start);
    } else {
      const times = syncConfig.syncTimes;
      if (times && times[index] !== undefined) {
        seekTo(times[index]);
      }
    }
    const a = audioRef.current;
    if (a && a.paused) {
      a.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const restartSong = () => {
    seekTo(0);
    const a = audioRef.current;
    if (a) {
      a.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const toggleMute = () => {
    const a = audioRef.current;
    if (!a) return;
    a.muted = !a.muted;
    setIsMuted(a.muted);
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackRate(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  const adjustOffset = (delta: number) => {
    const newOffset = Number((offsetNudge + delta).toFixed(2));
    setOffsetNudge(newOffset);
    setSongManualOffset(song.id, newOffset);
  };

  const resetOffset = () => {
    setOffsetNudge(0);
    setSongManualOffset(song.id, 0);
  };

  const formatTime = (sec: number) => {
    if (!sec || isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-between overflow-hidden bg-[#2b170c] text-amber-50 select-none">
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={song.audio_url}
        preload="auto"
        onEnded={() => setIsPlaying(false)}
        onError={() => setAudioError(true)}
      />

      {/* ========================================================= */}
      {/* 1. TOP BAR (Responsive & Compact on Mobile)               */}
      {/* ========================================================= */}
      <div className="relative w-full shrink-0 border-b-4 border-[#522b14] bg-[#3e200f] px-2 py-2 shadow-xl sm:px-4 md:px-6 md:py-2.5">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2">
          {/* Back & Home buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={onClose}
              title="Voltar"
              className="group flex h-9 w-9 sm:h-10 sm:w-10 md:h-11 md:w-11 items-center justify-center rounded-full border-2 border-amber-400/80 bg-[#5c3016] text-amber-100 shadow-[0_3px_0_#2b1509] transition-all hover:scale-105 active:translate-y-0.5 active:shadow-none"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:-translate-x-0.5" />
            </button>
            <Link
              to="/infantil"
              onClick={onClose}
              title="Início Awã Mirim"
              className="group flex h-9 w-9 sm:h-10 sm:w-10 md:h-11 md:w-11 items-center justify-center rounded-full border-2 border-amber-400/80 bg-[#5c3016] text-amber-100 shadow-[0_3px_0_#2b1509] transition-all hover:scale-105 active:translate-y-0.5 active:shadow-none"
            >
              <Home className="h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:scale-110" />
            </Link>
          </div>

          {/* Awã Tech Center Logo */}
          <div className="flex flex-col items-center text-center min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-display text-base sm:text-xl md:text-2xl font-black tracking-wider text-amber-300">
                AWÃ
              </span>
              <span className="font-display text-base sm:text-xl md:text-2xl font-black tracking-wider text-emerald-400">
                TECH
              </span>
            </div>
            <span className="hidden sm:inline-block text-[9px] md:text-[11px] font-bold tracking-widest text-amber-200/80 uppercase truncate">
              Línguas Indígenas, Culturas Vivas
            </span>
          </div>

          {/* Awã Mirim Badge & Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="flex items-center gap-1 sm:gap-1.5 rounded-2xl border-2 border-amber-400/70 bg-[#5c3016] px-2 sm:px-2.5 py-1 shadow-[0_3px_0_#2b1509]">
              <span className="text-sm sm:text-base">👦🏽</span>
              <span className="flex items-center gap-0.5 text-xs sm:text-sm font-black text-amber-300">
                {starsCount} <span className="text-yellow-400">★</span>
              </span>
            </div>

            <button
              onClick={() => setShowTimeline(true)}
              title="Ajustar Linha do Tempo (Timeline dos Versos)"
              className="grid h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 place-items-center rounded-full border-2 border-amber-400/80 bg-amber-400 text-amber-950 shadow-[0_3px_0_#2b1509] transition-all hover:scale-105 active:translate-y-0.5"
            >
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>

            {onMinimize && (
              <button
                onClick={onMinimize}
                title="Minimizar player"
                className="grid h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 place-items-center rounded-full border-2 border-amber-400/70 bg-[#5c3016] text-amber-200 shadow-[0_3px_0_#2b1509] transition-all hover:scale-105 active:translate-y-0.5"
              >
                <Minimize2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
            )}

            <button
              onClick={onClose}
              title="Fechar Cantiga"
              className="grid h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 place-items-center rounded-full border-2 border-rose-400/70 bg-rose-600/90 text-white shadow-[0_3px_0_#4c0519] transition-all hover:scale-105 active:translate-y-0.5"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>

        {/* Tribal pattern top trim */}
        <div
          className="absolute inset-x-0 bottom-0 h-1.5 opacity-90"
          style={{
            backgroundImage: `url(${tribalBorderTop})`,
            backgroundRepeat: "repeat-x",
            backgroundSize: "contain",
          }}
        />
      </div>

      {/* ========================================================= */}
      {/* 2. MAIN SCENE CONTAINER (Centered on desktop & mobile)    */}
      {/* ========================================================= */}
      <div className="relative flex w-full flex-1 items-center justify-center overflow-hidden px-2 py-1.5 sm:py-2 md:px-6 md:py-3">
        {/* Background Tropical Ambience */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#2d4d2a] via-[#1e381b] to-[#2b170c] opacity-95" />
        <div className="pointer-events-none absolute -left-10 top-0 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-10 top-0 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />

        {/* Mascot Left (Girl with maracá) - anchored on desktop edges without pushing content */}
        <div className="pointer-events-none absolute bottom-0 left-2 xl:left-8 z-10 hidden lg:block">
          <img
            src={girlImg}
            alt="Menina Indígena Pataxó"
            className="h-48 xl:h-64 2xl:h-72 w-auto object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)] animate-pulse"
            style={{ animationDuration: "4s" }}
          />
        </div>

        {/* Mascot Right (Boy with maracá) - anchored on desktop edges without pushing content */}
        <div className="pointer-events-none absolute bottom-0 right-2 xl:right-8 z-10 hidden lg:block">
          <img
            src={boyImg}
            alt="Menino Indígena Pataxó"
            className="h-48 xl:h-64 2xl:h-72 w-auto object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)] animate-pulse"
            style={{ animationDuration: "4s", animationDelay: "1s" }}
          />
        </div>

        {/* CENTER TABLET / BOOK CONTAINER */}
        <div className="relative z-20 flex h-full max-h-[82vh] w-full max-w-4xl xl:max-w-5xl flex-col items-center">
          {/* Top Carved Wood Banner */}
          <div className="relative mb-1.5 shrink-0 sm:mb-2 text-center">
            <div className="relative flex items-center justify-center">
              <img
                src={topBannerImg}
                alt="Cânticos Infantis Pataxó"
                className="h-8 sm:h-10 md:h-12 w-auto object-contain drop-shadow-[0_6px_10px_rgba(0,0,0,0.5)]"
              />
            </div>
            {/* Song Title Tag */}
            <div className="mx-auto mt-1 flex flex-wrap items-center justify-center gap-1.5 rounded-full border-2 border-amber-400/60 bg-[#4e2712]/95 px-3 sm:px-4 py-0.5 text-center shadow-md">
              <Sparkles className="h-3 w-3 text-amber-300" />
              <span className="font-display text-xs sm:text-sm font-black text-amber-100">
                {song.title}
              </span>
              {karaokeMode && (
                <span className="rounded-full bg-emerald-500 px-2 py-0.2 text-[9px] sm:text-[10px] font-black uppercase text-emerald-950">
                  Modo Karaokê
                </span>
              )}
            </div>
          </div>

          {/* MOBILE VIEW TABS (Visible only on mobile screens < md) */}
          <div className="flex md:hidden items-center justify-center gap-1 mb-1.5 w-full shrink-0 px-1">
            <button
              onClick={() => setMobileTab("bilingual")}
              className={`px-2.5 py-1 rounded-full text-xs font-black transition-all border ${
                mobileTab === "bilingual"
                  ? "bg-amber-400 text-amber-950 border-amber-300 shadow"
                  : "bg-[#4e2712]/80 text-amber-200 border-amber-500/40"
              }`}
            >
              🪇 Bilíngue
            </button>
            <button
              onClick={() => setMobileTab("split")}
              className={`px-2.5 py-1 rounded-full text-xs font-black transition-all border ${
                mobileTab === "split"
                  ? "bg-amber-400 text-amber-950 border-amber-300 shadow"
                  : "bg-[#4e2712]/80 text-amber-200 border-amber-500/40"
              }`}
            >
              📖 Lado a Lado
            </button>
            <button
              onClick={() => setMobileTab("indigenous")}
              className={`px-2 py-1 rounded-full text-xs font-black transition-all border ${
                mobileTab === "indigenous"
                  ? "bg-emerald-500 text-white border-emerald-300 shadow"
                  : "bg-[#4e2712]/80 text-amber-200 border-amber-500/40"
              }`}
            >
              🏹 Patxôhã
            </button>
            <button
              onClick={() => setMobileTab("pt")}
              className={`px-2 py-1 rounded-full text-xs font-black transition-all border ${
                mobileTab === "pt"
                  ? "bg-amber-500 text-white border-amber-300 shadow"
                  : "bg-[#4e2712]/80 text-amber-200 border-amber-500/40"
              }`}
            >
              🇧🇷 Português
            </button>
          </div>

          {/* PARCHMENT TABLET / OPEN BOOK */}
          <div className="relative flex flex-1 w-full flex-col overflow-hidden rounded-3xl border-3 md:border-4 border-[#4a2612] bg-[#fbf5e8] shadow-[0_16px_40px_rgba(0,0,0,0.7)]">
            {/* VIEW A: MOBILE BILINGUAL CARDS (Default on mobile) */}
            <div
              className={`flex-1 flex-col overflow-hidden p-2.5 ${
                mobileTab === "bilingual" ? "flex md:hidden" : "hidden"
              }`}
            >
              <div className="mb-1.5 flex items-center justify-between border-b-2 border-amber-900/20 pb-1 px-1">
                <span className="font-display text-xs font-black text-emerald-900 flex items-center gap-1">
                  <span>🏹</span> Patxôhã
                </span>
                <span className="text-[10px] font-bold text-amber-800">
                  {maxLineCount} versos sincronizados
                </span>
                <span className="font-display text-xs font-black text-amber-900 flex items-center gap-1">
                  Português <span>🇧🇷</span>
                </span>
              </div>

              <div
                ref={bilingualListRef}
                className="flex-1 overflow-y-auto space-y-2 px-1 py-1 scroll-smooth"
              >
                {maxLineCount === 0 ? (
                  <div className="flex h-full items-center justify-center text-center font-display text-sm font-bold text-emerald-800/70">
                    Cântico entoado na melodia sagrada 🌱
                  </div>
                ) : (
                  Array.from({ length: maxLineCount }).map((_, idx) => {
                    const indLine = displayIndLines[idx] || "";
                    const ptLine = displayPtLines[idx] || "";
                    const isActive = idx === activeLineIndex;

                    return (
                      <div
                        key={idx}
                        ref={(el) => {
                          bilingualLineRefs.current[idx] = el;
                        }}
                        onClick={() => seekToVerse(idx)}
                        className={`group cursor-pointer rounded-2xl p-2.5 sm:p-3 text-center transition-all duration-300 border-2 ${
                          isActive
                            ? "scale-[1.02] bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 text-white font-black shadow-lg border-amber-300 ring-2 ring-amber-400"
                            : "bg-white/90 hover:bg-white text-slate-800 border-amber-200/90 shadow-sm"
                        }`}
                      >
                        {/* Indigenous Verse (Patxôhã) */}
                        <div className="flex items-center justify-center gap-1 mb-0.5">
                          <span
                            className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.2 rounded-full ${
                              isActive
                                ? "bg-amber-400 text-amber-950 font-black"
                                : "bg-emerald-100 text-emerald-900 border border-emerald-300/60"
                            }`}
                          >
                            🏹 Patxôhã
                          </span>
                        </div>
                        <p
                          className={`font-display font-black leading-snug ${
                            isActive
                              ? "text-base sm:text-lg text-white drop-shadow"
                              : "text-sm sm:text-base text-emerald-950"
                          }`}
                        >
                          {indLine || "—"}
                        </p>

                        {/* Portuguese Translation */}
                        {ptLine && (
                          <div
                            className={`mt-1.5 pt-1.5 border-t flex flex-col items-center ${
                              isActive ? "border-white/30 text-amber-100" : "border-amber-200/60 text-amber-900"
                            }`}
                          >
                            <span
                              className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-full mb-0.5 ${
                                isActive ? "bg-white/20 text-white" : "bg-amber-100 text-amber-950"
                              }`}
                            >
                              Tradução
                            </span>
                            <p
                              className={`font-display text-xs sm:text-sm leading-snug italic font-bold ${
                                isActive ? "text-amber-100 drop-shadow-sm" : "text-[#78350f]"
                              }`}
                            >
                              {ptLine}
                            </p>
                          </div>
                        )}

                        {isActive && karaokeMode && (
                          <div className="mt-1 flex items-center justify-center gap-1 text-[10px] font-black text-amber-200 animate-bounce">
                            <span>🪇 Cante junto! 🪇</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* VIEW B: 2-COLUMN BOOK (Desktop default, or Mobile 'split' mode) */}
            <div
              className={`flex-1 overflow-hidden ${
                mobileTab === "bilingual"
                  ? "hidden md:flex md:flex-row"
                  : mobileTab === "split"
                  ? "flex flex-row"
                  : mobileTab === "indigenous"
                  ? "flex flex-col"
                  : "flex flex-col"
              }`}
            >
              {/* LEFT COLUMN: PATXÔHÃ */}
              <div
                className={`relative flex flex-1 flex-col bg-[#ebf4ed] p-2.5 sm:p-3 md:p-4 border-r border-[#4a2612]/20 ${
                  mobileTab === "pt" ? "hidden" : "flex"
                }`}
              >
                {/* Header */}
                <div className="mb-2 flex items-center justify-center gap-1.5 border-b-2 border-emerald-900/20 pb-1.5 text-center">
                  <span className="text-emerald-700 text-xs">◆</span>
                  <h3 className="font-display text-sm sm:text-base md:text-xl font-black text-emerald-950">
                    Pataxó (Patxôhã)
                  </h3>
                  <span className="text-emerald-700 text-xs">◆</span>
                </div>

                {/* Verses Scroll Area */}
                <div
                  ref={indListRef}
                  className="flex-1 overflow-y-auto space-y-2 px-1 py-1 scroll-smooth"
                >
                  {displayIndLines.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-center font-display text-xs sm:text-sm font-bold text-emerald-800/70">
                      Cântico entoado na melodia sagrada 🌱
                    </div>
                  ) : (
                    displayIndLines.map((line, idx) => {
                      const isActive = idx === activeLineIndex;
                      return (
                        <div
                          key={idx}
                          ref={(el) => {
                            indLineRefs.current[idx] = el;
                          }}
                          onClick={() => seekToVerse(idx)}
                          className={`group cursor-pointer rounded-xl px-2.5 py-1.5 text-center transition-all duration-300 ${
                            isActive
                              ? "scale-[1.02] bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 text-white font-black shadow-md ring-2 ring-emerald-300"
                              : "text-emerald-950 hover:bg-emerald-100/80 font-bold"
                          }`}
                        >
                          <p
                            className={`font-display leading-snug transition-all ${
                              isActive
                                ? "text-sm sm:text-base md:text-lg text-white drop-shadow"
                                : "text-xs sm:text-sm md:text-base text-emerald-900/90"
                            }`}
                          >
                            {line}
                          </p>
                          {isActive && karaokeMode && (
                            <div className="mt-0.5 flex items-center justify-center gap-1 text-[10px] font-black text-amber-200 animate-bounce">
                              <span>🪇 Cante! 🪇</span>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Bottom Action Pill */}
                <div className="mt-1.5 flex items-center justify-center gap-1.5 pt-1 border-t border-emerald-900/10">
                  <button
                    onClick={togglePlay}
                    className="flex items-center gap-1 rounded-full border border-emerald-900/30 bg-emerald-800 px-3 py-1 text-xs font-black text-emerald-50 shadow-sm transition hover:bg-emerald-700 active:translate-y-0.5"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                    <span>{isPlaying ? "PAUSAR" : "OUVIR"}</span>
                  </button>
                  <button
                    onClick={() => setKaraokeMode((prev) => !prev)}
                    className={`flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-black shadow-sm transition active:translate-y-0.5 ${
                      karaokeMode
                        ? "border-amber-400 bg-amber-400 text-amber-950 ring-2 ring-amber-300"
                        : "border-emerald-900/30 bg-emerald-900 text-emerald-100 hover:bg-emerald-800"
                    }`}
                  >
                    <Music className="h-3.5 w-3.5" />
                    <span>KARAOKÊ</span>
                  </button>
                </div>
              </div>

              {/* CENTER DIVIDER (Visible on Desktop or Split Mode) */}
              <div
                className={`relative w-6 md:w-8 shrink-0 flex-col items-center justify-center bg-[#fdf6e9] ${
                  mobileTab === "indigenous" || mobileTab === "pt" ? "hidden" : "hidden sm:flex"
                }`}
              >
                {/* Vertical tribal pattern */}
                <div
                  className="absolute inset-y-0 w-3 md:w-4 opacity-80"
                  style={{
                    backgroundImage: `url(${tribalDividerImg})`,
                    backgroundRepeat: "repeat-y",
                    backgroundSize: "contain",
                    backgroundPosition: "center",
                  }}
                />

                {/* Central Medallion Button */}
                <button
                  onClick={togglePlay}
                  title={isPlaying ? "Pausar música" : "Tocar música"}
                  className={`group relative z-30 flex h-11 w-11 md:h-13 md:w-13 items-center justify-center rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.4)] transition-transform hover:scale-110 active:scale-95 ${
                    isPlaying ? "animate-pulse" : ""
                  }`}
                >
                  <img
                    src={medallionImg}
                    alt="Tocar Cântico"
                    className="h-full w-full object-contain"
                  />
                  <div className="absolute inset-0 grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 rounded-full">
                    {isPlaying ? (
                      <Pause className="h-5 w-5 text-white drop-shadow" />
                    ) : (
                      <Play className="h-5 w-5 text-white drop-shadow ml-0.5" />
                    )}
                  </div>
                </button>
              </div>

              {/* RIGHT COLUMN: PORTUGUÊS */}
              <div
                className={`relative flex flex-1 flex-col bg-[#fdf6e9] p-2.5 sm:p-3 md:p-4 ${
                  mobileTab === "indigenous" ? "hidden" : "flex"
                }`}
              >
                {/* Header */}
                <div className="mb-2 flex items-center justify-center gap-1.5 border-b-2 border-amber-900/20 pb-1.5 text-center">
                  <span className="text-amber-700 text-xs">◆</span>
                  <h3 className="font-display text-sm sm:text-base md:text-xl font-black text-[#8c3e12]">
                    Português
                  </h3>
                  <span className="text-amber-700 text-xs">◆</span>
                </div>

                {/* Verses Scroll Area */}
                <div
                  ref={ptListRef}
                  className="flex-1 overflow-y-auto space-y-2 px-1 py-1 scroll-smooth"
                >
                  {displayPtLines.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-center font-display text-xs sm:text-sm font-bold text-amber-900/70">
                      Tradução em breve 🌱
                    </div>
                  ) : (
                    displayPtLines.map((line, idx) => {
                      const isActive = idx === activeLineIndex;
                      return (
                        <div
                          key={idx}
                          ref={(el) => {
                            ptLineRefs.current[idx] = el;
                          }}
                          onClick={() => seekToVerse(idx)}
                          className={`group cursor-pointer rounded-xl px-2.5 py-1.5 text-center transition-all duration-300 ${
                            isActive
                              ? "scale-[1.02] bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-white font-black shadow-md ring-2 ring-amber-300"
                              : "text-amber-950 hover:bg-amber-100/80 font-bold"
                          }`}
                        >
                          <p
                            className={`font-display leading-snug transition-all ${
                              isActive
                                ? "text-sm sm:text-base md:text-lg text-white drop-shadow"
                                : "text-xs sm:text-sm md:text-base text-amber-900/90"
                            }`}
                          >
                            {line}
                          </p>
                          {isActive && karaokeMode && (
                            <div className="mt-0.5 flex items-center justify-center gap-1 text-[10px] font-black text-amber-100 animate-bounce">
                              <span>✨ Significado ✨</span>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Bottom Action Pill */}
                <div className="mt-1.5 flex items-center justify-center gap-1.5 pt-1 border-t border-amber-900/10">
                  <button
                    onClick={togglePlay}
                    className="flex items-center gap-1 rounded-full border border-amber-950/30 bg-[#b45309] px-3 py-1 text-xs font-black text-amber-50 shadow-sm transition hover:bg-amber-600 active:translate-y-0.5"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                    <span>{isPlaying ? "PAUSAR" : "OUVIR"}</span>
                  </button>
                  <button
                    onClick={() => setKaraokeMode((prev) => !prev)}
                    className={`flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-black shadow-sm transition active:translate-y-0.5 ${
                      karaokeMode
                        ? "border-amber-400 bg-amber-400 text-amber-950 ring-2 ring-amber-300"
                        : "border-amber-950/30 bg-[#78350f] text-amber-100 hover:bg-[#8d4013]"
                    }`}
                  >
                    <Music className="h-3.5 w-3.5" />
                    <span>CANTAR JUNTO</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. INTEGRATED BOTTOM PLAYER & SCRUBBER (Responsive)       */}
      {/* ========================================================= */}
      <div className="relative w-full shrink-0 border-t-4 border-[#522b14] bg-[#3e200f] px-2 py-1.5 shadow-2xl sm:px-4 md:px-6 md:py-2.5">
        {/* Tribal pattern bottom trim */}
        <div
          className="absolute inset-x-0 top-0 h-1.5 opacity-90"
          style={{
            backgroundImage: `url(${tribalBorderBottom})`,
            backgroundRepeat: "repeat-x",
            backgroundSize: "contain",
          }}
        />

        <div className="mx-auto flex max-w-4xl xl:max-w-5xl flex-col gap-1.5">
          {/* Timeline Scrubber */}
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="w-10 sm:w-12 text-right font-display text-[11px] sm:text-xs md:text-sm font-black text-amber-300">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={(e) => seekTo(parseFloat(e.target.value))}
              className="h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-[#5c3016] accent-amber-400"
            />
            <span className="w-10 sm:w-12 text-left font-display text-[11px] sm:text-xs md:text-sm font-black text-amber-200/80">
              {formatTime(duration)}
            </span>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between gap-1 sm:gap-2">
            {/* Left Tools: Replay & Speed */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={restartSong}
                title="Tocar do início"
                className="flex items-center gap-1 rounded-xl border border-amber-400/40 bg-[#5c3016] px-2 py-1 text-xs font-bold text-amber-100 hover:bg-[#6f3b1c] active:translate-y-0.5"
              >
                <RotateCcw className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span className="hidden sm:inline">Repetir</span>
              </button>

              <button
                onClick={() => handleSpeedChange(playbackRate === 1 ? 0.75 : 1)}
                title="Velocidade de reprodução"
                className={`rounded-xl border border-amber-400/40 px-2 py-1 text-xs font-black transition-all ${
                  playbackRate === 0.75
                    ? "bg-amber-400 text-amber-950 font-black"
                    : "bg-[#5c3016] text-amber-100 hover:bg-[#6f3b1c]"
                }`}
              >
                {playbackRate === 0.75 ? "0.75x" : "1.0x"}
              </button>

              <button
                onClick={() => setShowOffsetControls((prev) => !prev)}
                title="Ajustar tempo da legenda"
                className={`flex items-center gap-1 rounded-xl border border-amber-400/40 px-2 py-1 text-xs font-bold transition-all ${
                  showOffsetControls
                    ? "bg-emerald-600 text-white"
                    : "bg-[#5c3016] text-amber-100 hover:bg-[#6f3b1c]"
                }`}
              >
                <Sliders className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span className="hidden sm:inline">Tempo</span>
              </button>
            </div>

            {/* Center Main Play / Pause */}
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlay}
                className="flex h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12 items-center justify-center rounded-full border-2 border-amber-300 bg-gradient-to-b from-amber-400 to-amber-600 text-amber-950 shadow-[0_3px_0_#78350f] transition-all hover:scale-105 active:translate-y-0.5 active:shadow-none"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5 fill-current" />
                ) : (
                  <Play className="h-5 w-5 fill-current ml-0.5" />
                )}
              </button>
            </div>

            {/* Right Tools: Volume & Error Retry */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={toggleMute}
                title={isMuted ? "Ativar som" : "Desativar som"}
                className="grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-xl border border-amber-400/40 bg-[#5c3016] text-amber-100 hover:bg-[#6f3b1c]"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>

              {audioError && (
                <button
                  onClick={() => {
                    const a = audioRef.current;
                    if (a) {
                      setAudioError(false);
                      a.load();
                      a.play();
                    }
                  }}
                  className="rounded-xl bg-amber-400 px-2.5 py-1 font-display text-[11px] font-black text-amber-950"
                >
                  Recarregar 🔁
                </button>
              )}
            </div>
          </div>

          {/* Collapsible Fine-Tuning Offset Slider */}
          {showOffsetControls && (
            <div className="mt-1 flex flex-wrap items-center justify-between gap-1.5 rounded-2xl border-2 border-amber-400/50 bg-[#4e2712] p-2 text-xs">
              <div className="flex items-center gap-1.5 font-display font-bold text-amber-200">
                <span>⏱️ Sincronia:</span>
                <span className="font-mono font-black text-amber-300">
                  {offsetNudge > 0 ? `+${offsetNudge}s` : `${offsetNudge}s`}
                </span>
                {offsetNudge !== 0 && (
                  <span className="rounded bg-emerald-700/80 px-1.5 py-0.2 text-[10px] text-emerald-100">
                    Ajuste salvo
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => adjustOffset(-0.5)}
                  className="rounded-lg bg-[#5c3016] px-2 py-0.5 font-black text-amber-100 hover:bg-[#6f3b1c]"
                >
                  -0.5s
                </button>
                <button
                  onClick={() => adjustOffset(-0.2)}
                  className="rounded-lg bg-[#5c3016] px-2 py-0.5 font-black text-amber-100 hover:bg-[#6f3b1c]"
                >
                  -0.2s
                </button>
                <button
                  onClick={resetOffset}
                  className="rounded-lg bg-amber-600/60 px-2 py-0.5 font-bold text-amber-100 hover:bg-amber-600"
                >
                  Padrão
                </button>
                <button
                  onClick={() => adjustOffset(+0.2)}
                  className="rounded-lg bg-[#5c3016] px-2 py-0.5 font-black text-amber-100 hover:bg-[#6f3b1c]"
                >
                  +0.2s
                </button>
                <button
                  onClick={() => adjustOffset(+0.5)}
                  className="rounded-lg bg-[#5c3016] px-2 py-0.5 font-black text-amber-100 hover:bg-[#6f3b1c]"
                >
                  +0.5s
                </button>
              </div>

              <button
                onClick={() => {
                  setShowOffsetControls(false);
                  setShowTimeline(true);
                }}
                className="w-full mt-1.5 rounded-xl bg-amber-400 text-amber-950 px-3 py-1 font-display text-xs font-black uppercase tracking-wider hover:brightness-110 shadow-md flex items-center justify-center gap-1.5 transition"
              >
                <Clock className="h-3.5 w-3.5" /> Abrir Editor de Timeline dos Versos
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Timeline Editor Modal */}
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
  );
}

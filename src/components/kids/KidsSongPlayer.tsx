import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Home, Music2, Pause, Play, Volume2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useLang, pickLang } from "@/lib/pick-lang";
import { splitLyrics, resolveDuration, computeLyricBounds, activeLineIndex } from "@/lib/lyric-sync";
import type { MiniPlayerSong as Song } from "@/components/kids/MiniPlayer";
import leftKid from "@/assets/kids-player/left.png.asset.json";
import rightKid from "@/assets/kids-player/right.png.asset.json";

export function KidsSongPlayer({
  song,
  branding,
  onClose,
}: {
  song: Song;
  branding?: any;
  onClose: () => void;
}) {
  const ref = useRef<HTMLAudioElement>(null);
  const lang = useLang();
  const [progress, setProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    setProgress(0);
    setAudioDuration(0);
    const a = ref.current;
    if (!a) return;
    a.load();
    void a.play()?.catch(() => {});
  }, [song.id, song.audio_url]);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const a = ref.current;
      if (a) {
        setProgress(a.currentTime);
        if (a.duration && Number.isFinite(a.duration)) setAudioDuration(a.duration);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [song.id]);

  const indLines = useMemo(() => splitLyrics(song.lyrics_indigenous || ""), [song.lyrics_indigenous]);
  const transLines = useMemo(
    () => splitLyrics(pickLang(song as any, "lyrics_pt", lang) || ""),
    [song, lang],
  );
  const maxLen = Math.max(indLines.length, transLines.length);
  const duration = resolveDuration(audioDuration, song.duration_seconds);

  const bounds = useMemo(
    () => computeLyricBounds(indLines, transLines, duration, song.sync_offsets || []),
    [indLines, transLines, duration, song.id, lang, song.sync_offsets],
  );
  const activeIdx = useMemo(() => activeLineIndex(bounds, progress), [progress, bounds]);

  function toggle() {
    const a = ref.current;
    if (!a) return;
    if (a.paused) void a.play()?.catch(() => {});
    else a.pause();
  }

  function restart() {
    const a = ref.current;
    if (!a) return;
    a.currentTime = 0;
    void a.play()?.catch(() => {});
  }

  const lineSize = branding?.caption_max_size || "text-lg sm:text-2xl md:text-3xl";
  const subSize = branding?.caption_max_subsize || "text-base sm:text-xl md:text-2xl";

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-[#4a2c17]">
      {/* Top wood bar */}
      <header className="flex items-center justify-between gap-2 border-b-4 border-[#2f1a0d] bg-gradient-to-b from-[#7a4a24] to-[#5a3318] px-3 py-2 shadow-lg">
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            aria-label="Voltar"
            className="grid h-11 w-11 place-items-center rounded-full border-[3px] border-[#f2d7a8] bg-[#8a5a2c] text-[#f7e7c8] shadow-[0_4px_0_#3a2110] active:translate-y-0.5 active:shadow-none"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <Link
            to="/infantil"
            aria-label="Início"
            className="grid h-11 w-11 place-items-center rounded-full border-[3px] border-[#f2d7a8] bg-[#8a5a2c] text-[#f7e7c8] shadow-[0_4px_0_#3a2110] active:translate-y-0.5 active:shadow-none"
          >
            <Home className="h-5 w-5" />
          </Link>
        </div>
        <div className="min-w-0 text-center">
          <div className="truncate font-display text-lg font-black uppercase tracking-wide text-[#f7e7c8] drop-shadow sm:text-2xl">
            {song.title}
          </div>
          {song.artist && (
            <div className="truncate text-[11px] font-bold text-[#e7c99a]">{song.artist}</div>
          )}
        </div>
        <span className="w-11 sm:w-24" />
      </header>

      {/* Tribal strip */}
      <div
        aria-hidden
        className="h-3 w-full"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg,#c1873f 0 10px,#7a4a24 10px 20px)",
        }}
      />

      {/* Board */}
      <div className="relative flex-1 overflow-hidden bg-gradient-to-b from-[#f7edd2] to-[#efe0be]">
        {/* Characters */}
        <img
          src={leftKid.url}
          alt=""
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-0 h-[45%] select-none object-contain opacity-95 sm:h-[62%]"
        />
        <img
          src={rightKid.url}
          alt=""
          aria-hidden
          className="pointer-events-none absolute bottom-0 right-0 h-[45%] select-none object-contain opacity-95 sm:h-[62%]"
        />

        {/* Title plaque */}
        <div className="relative z-10 flex justify-center pt-3">
          <div className="rounded-2xl border-[3px] border-[#3a2110] bg-gradient-to-b from-[#8a5a2c] to-[#6b3f1d] px-5 py-1.5 font-display text-base font-black text-[#f7e7c8] shadow-[0_6px_0_#3a2110] sm:text-xl">
            🎵 Cânticos Infantis Pataxó 🎵
          </div>
        </div>

        {/* Two columns */}
        <div className="relative z-10 mx-auto grid h-[calc(100%-9.5rem)] max-w-5xl grid-cols-2 gap-0 px-2 pt-3">
          <div className="overflow-y-auto rounded-l-2xl bg-[#e6f2e2]/85 px-2 py-2 sm:px-6">
            <h2 className="mb-1 text-center font-display text-lg font-black text-[#2f6d3a] sm:text-2xl">
              Patxôhã
            </h2>
            <div className="mx-auto mb-2 h-[3px] w-3/4 rounded bg-[#2f6d3a]/40" />
            {Array.from({ length: maxLen }).map((_, i) => (
              <p
                key={i}
                className={`py-1 text-center font-bold leading-snug transition-colors ${lineSize} ${
                  i === activeIdx ? "text-[#1f5128]" : "text-[#2f6d3a]/55"
                }`}
              >
                {indLines[i] || "\u00A0"}
              </p>
            ))}
          </div>
          <div className="overflow-y-auto rounded-r-2xl bg-[#fbf3dc]/90 px-2 py-2 sm:px-6">
            <h2 className="mb-1 text-center font-display text-lg font-black text-[#a04a1e] sm:text-2xl">
              Português
            </h2>
            <div className="mx-auto mb-2 h-[3px] w-3/4 rounded bg-[#a04a1e]/40" />
            {Array.from({ length: maxLen }).map((_, i) => (
              <p
                key={i}
                className={`py-1 text-center font-bold leading-snug transition-colors ${subSize} ${
                  i === activeIdx ? "text-[#7b3411]" : "text-[#a04a1e]/55"
                }`}
              >
                {transLines[i] || "\u00A0"}
              </p>
            ))}
          </div>
        </div>

        {/* Center divider + play knob */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-16 left-1/2 w-6 -translate-x-1/2"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg,#c1873f 0 8px,#efe0be 8px 16px)",
          }}
        />
        <button
          onClick={toggle}
          aria-label={isPlaying ? "Pausar" : "Tocar"}
          className="absolute left-1/2 top-1/2 z-20 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-[5px] border-[#8a5a2c] bg-[#2f6d3a] text-[#f7e7c8] shadow-[0_6px_0_#3a2110] active:translate-y-[calc(-50%+3px)] active:shadow-none"
        >
          {isPlaying ? <Pause className="h-7 w-7 fill-current" /> : <Music2 className="h-7 w-7" />}
        </button>

        {/* Buttons */}
        <div className="absolute inset-x-0 bottom-2 z-20 mx-auto grid max-w-5xl grid-cols-2 gap-2 px-3">
          <div className="flex justify-center gap-2">
            <button
              onClick={restart}
              className="inline-flex items-center gap-1 rounded-full border-2 border-[#f2d7a8] bg-[#2f6d3a] px-4 py-2 text-xs font-black uppercase text-[#f7e7c8] shadow-[0_4px_0_#1f4a26] active:translate-y-0.5 active:shadow-none sm:text-sm"
            >
              <Volume2 className="h-4 w-4" /> Ouvir
            </button>
            <button
              onClick={toggle}
              className="inline-flex items-center gap-1 rounded-full border-2 border-[#f2d7a8] bg-[#2f6d3a] px-4 py-2 text-xs font-black uppercase text-[#f7e7c8] shadow-[0_4px_0_#1f4a26] active:translate-y-0.5 active:shadow-none sm:text-sm"
            >
              <Play className="h-4 w-4 fill-current" /> Cantar Junto
            </button>
          </div>
          <div className="flex justify-center gap-2">
            <button
              onClick={restart}
              className="inline-flex items-center gap-1 rounded-full border-2 border-[#f2d7a8] bg-[#b8541f] px-4 py-2 text-xs font-black uppercase text-[#f7e7c8] shadow-[0_4px_0_#7b3411] active:translate-y-0.5 active:shadow-none sm:text-sm"
            >
              <Volume2 className="h-4 w-4" /> Ouvir
            </button>
            <button
              onClick={toggle}
              className="inline-flex items-center gap-1 rounded-full border-2 border-[#f2d7a8] bg-[#b8541f] px-4 py-2 text-xs font-black uppercase text-[#f7e7c8] shadow-[0_4px_0_#7b3411] active:translate-y-0.5 active:shadow-none sm:text-sm"
            >
              <Play className="h-4 w-4 fill-current" /> Cantar Junto
            </button>
          </div>
        </div>
      </div>

      {/* Bottom tribal strip */}
      <div
        aria-hidden
        className="h-3 w-full"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg,#c1873f 0 10px,#7a4a24 10px 20px)",
        }}
      />

      <audio
        ref={ref}
        src={song.audio_url}
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />
    </div>
  );
}

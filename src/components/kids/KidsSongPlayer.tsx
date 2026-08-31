import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Home, Music2, Pause, Play, Volume2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { MiniPlayerSong as Song } from "@/components/kids/MiniPlayer";
import bgVideo from "@/assets/kids-player/bg.mp4.asset.json";

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
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
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
      <div className="relative flex-1 overflow-hidden bg-[#4a2c17]">
        {/* Original video filling the screen */}
        <video
          src={bgVideo.url}
          autoPlay
          loop
          muted
          playsInline
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-black/10" />

        {/* Title plaque */}
        <div className="relative z-10 flex justify-center pt-2">
          <div className="rounded-full border-2 border-[#3a2110] bg-gradient-to-b from-[#8a5a2c] to-[#6b3f1d] px-3 py-1 font-display text-[11px] font-black text-[#f7e7c8] shadow-[0_3px_0_#3a2110] sm:text-sm">
            🎵 Cânticos Infantis Pataxó 🎵
          </div>
        </div>

        {/* Play knob */}
        <button
          onClick={toggle}
          aria-label={isPlaying ? "Pausar" : "Tocar"}
          className="absolute left-1/2 top-[26%] z-20 grid h-12 w-12 -translate-x-1/2 place-items-center rounded-full border-[4px] border-[#8a5a2c] bg-[#2f6d3a] text-[#f7e7c8] shadow-[0_4px_0_#3a2110] active:translate-y-0.5 active:shadow-none"
        >
          {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Music2 className="h-5 w-5" />}
        </button>


        {/* Buttons */}
        <div className="absolute inset-x-0 bottom-2 z-20 flex justify-center gap-2 px-3">
          <button
            onClick={restart}
            className="inline-flex items-center gap-1 rounded-full border-2 border-[#f2d7a8] bg-[#2f6d3a] px-4 py-2 text-xs font-black uppercase text-[#f7e7c8] shadow-[0_4px_0_#1f4a26] active:translate-y-0.5 active:shadow-none sm:text-sm"
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

import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import type { MiniPlayerSong as Song } from "@/components/kids/MiniPlayer";
import bgVideo from "@/assets/kids-player/bg.mp4.asset.json";
import { splitLyrics } from "@/lib/lyric-sync";

export function KidsSongPlayer({
  song,
  onClose,
}: {
  song: Song;
  branding?: any;
  onClose: () => void;
}) {
  const ref = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const indigenousLines = splitLyrics(song.lyrics_indigenous);
  const portugueseLines = splitLyrics(song.lyrics_pt);
  const lineCount = Math.max(indigenousLines.length, portugueseLines.length);
  const lyricSize =
    lineCount > 16
      ? "text-[8px] sm:text-xs md:text-sm"
      : lineCount > 11
        ? "text-[9px] sm:text-sm md:text-base"
        : "text-[10px] sm:text-base md:text-xl";

  useEffect(() => {
    const a = ref.current;
    if (!a) return;
    a.load();
    void a.play()?.catch(() => {});
  }, [song.id, song.audio_url]);

  function toggle() {
    const a = ref.current;
    if (!a) return;
    if (a.paused) void a.play()?.catch(() => {});
    else a.pause();
  }

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center overflow-hidden bg-amber-950">
      <div className="relative aspect-[35/26] w-full max-w-[calc(100vh*35/26)] overflow-hidden">
        <video
          src={bgVideo.url}
          autoPlay
          loop
          muted
          playsInline
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full object-fill"
        />

        {/* The controls drawn into the original video remain the only visible controls. */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Voltar"
          className="absolute left-[0.5%] top-[4.5%] z-30 h-[10%] w-[6%] rounded-full bg-transparent"
        />
        <Link
          to="/infantil"
          aria-label="Início"
          className="absolute left-[7.2%] top-[4.5%] z-30 h-[10%] w-[6%] rounded-full"
        />

        {/* Replace the video's illustrative copy with the selected song's real lyrics. */}
        <section className="absolute inset-x-[14.8%] top-[25.5%] z-20 grid h-[47%] grid-cols-2 gap-[5%] overflow-hidden" aria-label={`Letra de ${song.title}`}>
          <div className="overflow-hidden bg-emerald-50 px-[4%] py-[2%] text-center text-emerald-950">
            <h2 className="mb-[2%] font-display text-xs font-black sm:text-lg md:text-2xl">Patxôhã</h2>
            <div className={`${lyricSize} font-display font-black leading-snug`}>
              {indigenousLines.map((line, index) => (
                <p key={`${index}-${line}`}>{line}</p>
              ))}
            </div>
          </div>
          <div className="overflow-hidden bg-amber-50 px-[4%] py-[2%] text-center text-amber-950">
            <h2 className="mb-[2%] font-display text-xs font-black sm:text-lg md:text-2xl">Português</h2>
            <div className={`${lyricSize} font-display font-black leading-snug`}>
              {portugueseLines.map((line, index) => (
                <p key={`${index}-${line}`}>{line}</p>
              ))}
            </div>
          </div>
        </section>

        {/* Hide the illustrative “Ouvir / Cantar junto” labels baked into the video. */}
        <div aria-hidden className="absolute left-[17%] top-[72%] z-20 h-[11%] w-[27%] bg-emerald-50" />
        <div aria-hidden className="absolute right-[17%] top-[72%] z-20 h-[11%] w-[28%] bg-amber-50" />

        <button
          type="button"
          onClick={toggle}
          aria-label={isPlaying ? "Pausar" : "Tocar"}
          className="absolute left-[46.2%] top-[52%] z-30 h-[14%] w-[8%] rounded-full bg-transparent"
        />
      </div>

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

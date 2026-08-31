import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import type { MiniPlayerSong as Song } from "@/components/kids/MiniPlayer";
import bgVideo from "@/assets/kids-player/bg.mp4.asset.json";
import {
  activeLineIndex,
  computeLyricBounds,
  resolveDuration,
  splitLyrics,
} from "@/lib/lyric-sync";

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
  const [duration, setDuration] = useState<number | null>(null);
  const [lineIndex, setLineIndex] = useState(0);

  const lyricRows = useMemo(() => {
    const rawIndigenousLines = splitLyrics(song.lyrics_indigenous);
    const rawPortugueseLines = splitLyrics(song.lyrics_pt);
    return Array.from(
      { length: Math.max(rawIndigenousLines.length, rawPortugueseLines.length) },
      (_, index) => ({
        indigenous: rawIndigenousLines[index] ?? "",
        portuguese: rawPortugueseLines[index] ?? "",
      }),
    ).filter(
      (row, index, rows) =>
        index === 0 ||
        row.indigenous !== rows[index - 1]?.indigenous ||
        row.portuguese !== rows[index - 1]?.portuguese,
    );
  }, [song.lyrics_indigenous, song.lyrics_pt]);

  const bounds = useMemo(
    () =>
      computeLyricBounds(
        lyricRows.map((r) => r.indigenous),
        lyricRows.map((r) => r.portuguese),
        resolveDuration(duration, (song as any).duration_seconds),
      ),
    [lyricRows, duration, song],
  );

  const currentRow = lyricRows[Math.min(lineIndex, lyricRows.length - 1)];

  useEffect(() => {
    const a = ref.current;
    if (!a) return;
    setLineIndex(0);
    setDuration(null);
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

        {/* Duas colunas fixas: apenas o texto da linha atual é trocado, sem acumular. */}
        <section className="absolute inset-x-[14.8%] top-[25.5%] z-20 grid h-[47%] grid-cols-2 gap-[5%] overflow-hidden" aria-label={`Letra de ${song.title}`}>
          <div className="grid grid-rows-[auto_1fr] overflow-hidden bg-emerald-50 px-[4%] py-[2%] text-center text-emerald-950">
            <h2 className="font-display text-xs font-black sm:text-lg md:text-2xl">Patxôhã</h2>
            <p aria-live="polite" className="grid place-items-center overflow-hidden font-display text-[11px] font-black leading-snug sm:text-lg md:text-2xl">
              {currentRow?.indigenous ?? ""}
            </p>
          </div>
          <div className="grid grid-rows-[auto_1fr] overflow-hidden bg-amber-50 px-[4%] py-[2%] text-center text-amber-950">
            <h2 className="font-display text-xs font-black sm:text-lg md:text-2xl">Português</h2>
            <p aria-live="polite" className="grid place-items-center overflow-hidden font-display text-[11px] font-black leading-snug sm:text-lg md:text-2xl">
              {currentRow?.portuguese ?? ""}
            </p>
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

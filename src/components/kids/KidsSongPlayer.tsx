import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import type { MiniPlayerSong as Song } from "@/components/kids/MiniPlayer";
import bgVideo from "@/assets/kids-player/bg.mp4.asset.json";
import { speak } from "@/lib/speak";
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

  /** Ajusta o tamanho da fonte para o verso caber dentro do quadrado. */
  function fitSize(text: string) {
    const len = text.trim().length;
    const longest = text
      .trim()
      .split(/\s+/)
      .reduce((m, w) => Math.max(m, w.length), 0);
    const score = Math.max(len / 3, longest);
    const size = Math.max(1.1, Math.min(3.2, 26 / Math.max(8, score)));
    return { fontSize: `clamp(0.7rem, ${size}cqw, 2rem)` };
  }

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
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              speak(currentRow?.indigenous ?? "", "pt-BR");
            }}
            aria-label="Ouvir pronúncia em Patxôhã"
            className="grid grid-rows-[auto_1fr] overflow-hidden bg-emerald-50 px-[4%] py-[2%] text-center text-emerald-950 transition active:scale-[0.98] [container-type:inline-size]"
          >
            <h2 className="font-display font-black" style={{ fontSize: "clamp(0.6rem, 7cqw, 1.5rem)" }}>🗣️ Patxôhã</h2>
            <p
              aria-live="polite"
              className="grid place-items-center overflow-hidden break-words font-display font-black leading-tight [hyphens:auto]"
              style={fitSize(currentRow?.indigenous ?? "")}
            >
              {currentRow?.indigenous ?? ""}
            </p>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              speak(currentRow?.portuguese ?? "", "pt-BR");
            }}
            aria-label="Ouvir pronúncia em Português"
            className="grid grid-rows-[auto_1fr] overflow-hidden bg-amber-50 px-[4%] py-[2%] text-center text-amber-950 transition active:scale-[0.98] [container-type:inline-size]"
          >
            <h2 className="font-display font-black" style={{ fontSize: "clamp(0.6rem, 7cqw, 1.5rem)" }}>📝 Português</h2>
            <p
              aria-live="polite"
              className="grid place-items-center overflow-hidden break-words font-display font-black leading-tight [hyphens:auto]"
              style={fitSize(currentRow?.portuguese ?? "")}
            >
              {currentRow?.portuguese ?? ""}
            </p>
          </button>
        </section>


        {/* Hide the illustrative “Ouvir / Cantar junto” labels baked into the video. */}
        <div className="absolute left-[17%] top-[72%] z-20 grid h-[11%] w-[27%] place-items-center bg-emerald-50 px-[1%] text-center font-display font-bold text-emerald-900" style={{ fontSize: "clamp(0.5rem, 1.1vw, 0.9rem)" }}>
          🔊 Clique para ouvir
        </div>
        <div className="absolute right-[17%] top-[72%] z-20 grid h-[11%] w-[28%] place-items-center bg-amber-50 px-[1%] text-center font-display font-bold text-amber-900" style={{ fontSize: "clamp(0.5rem, 1.1vw, 0.9rem)" }}>
          🔊 Clique para ouvir
        </div>

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
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onTimeUpdate={(e) => {
          const next = activeLineIndex(bounds, e.currentTarget.currentTime);
          if (next >= 0) setLineIndex((prev) => (prev === next ? prev : next));
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />

    </div>
  );
}

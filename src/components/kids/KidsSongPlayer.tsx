import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import type { MiniPlayerSong as Song } from "@/components/kids/MiniPlayer";
import bgVideo from "@/assets/kids-player/bg.mp4.asset.json";
import { speak } from "@/lib/speak";
import {
  activeLineIndex,
  computeLyricBounds,
  LYRIC_LEAD,
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

  /** Tempo de início de um verso: o final do verso anterior (ou 0). */
  function lineStart(i: number) {
    return i <= 0 ? 0 : Math.max(0, (bounds[i - 1] ?? 0) - LYRIC_LEAD);
  }

  /** Vai para o verso anterior e posiciona o áudio nele. */
  function goPrevLine() {
    setLineIndex((prev) => {
      const next = Math.max(0, prev - 1);
      const a = ref.current;
      if (a) a.currentTime = lineStart(next);
      return next;
    });
  }

  /** Vai para o próximo verso e posiciona o áudio nele. */
  function goNextLine() {
    setLineIndex((prev) => {
      const next = Math.min(lyricRows.length - 1, prev + 1);
      const a = ref.current;
      if (a) a.currentTime = lineStart(next);
      return next;
    });
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


        {/* Aviso único e centralizado — nenhum texto é desenhado sobre o fundo. */}
        <div
          className="absolute inset-x-[20%] top-[73.5%] z-20 grid place-items-center rounded-full bg-amber-100/95 px-[2%] py-[1%] text-center font-display font-black text-emerald-900 shadow-[0_3px_0_rgba(0,0,0,0.18)]"
          style={{ fontSize: "clamp(0.55rem, 1.25vw, 1rem)" }}
        >
          🔊 Clique para ouvir a palavra
        </div>

        <button
          type="button"
          onClick={toggle}
          aria-label={isPlaying ? "Pausar" : "Tocar"}
          className="absolute left-[46.2%] top-[52%] z-30 h-[14%] w-[8%] rounded-full bg-transparent"
        />

        {/* Navegação inferior: Voltar | Início | Próxima */}
        <nav className="absolute inset-x-[8%] top-[88.5%] z-30 flex items-center justify-between gap-[2%]">
          <button
            type="button"
            onClick={goPrevLine}
            disabled={lineIndex <= 0}
            aria-label="Verso anterior"
            className="flex flex-1 items-center justify-center gap-[4%] rounded-full border-2 border-white bg-emerald-700 px-[3%] py-[1.5%] font-display font-black text-white shadow-[0_3px_0_#064e3b] transition active:translate-y-0.5 active:shadow-none disabled:opacity-40 disabled:active:translate-y-0 disabled:active:shadow-[0_3px_0_#064e3b]"
            style={{ fontSize: "clamp(0.5rem, 1.1vw, 0.9rem)" }}
          >
            ⬅️ Voltar
          </button>
          <Link
            to="/infantil"
            aria-label="Início"
            className="flex flex-1 items-center justify-center gap-[4%] rounded-full border-2 border-white bg-amber-500 px-[3%] py-[1.5%] font-display font-black text-white shadow-[0_3px_0_#92400e] transition active:translate-y-0.5 active:shadow-none"
            style={{ fontSize: "clamp(0.5rem, 1.1vw, 0.9rem)" }}
          >
            🏠 Início
          </Link>
          <button
            type="button"
            onClick={goNextLine}
            disabled={lineIndex >= lyricRows.length - 1}
            aria-label="Próximo verso"
            className="flex flex-1 items-center justify-center gap-[4%] rounded-full border-2 border-white bg-emerald-700 px-[3%] py-[1.5%] font-display font-black text-white shadow-[0_3px_0_#064e3b] transition active:translate-y-0.5 active:shadow-none disabled:opacity-40 disabled:active:translate-y-0 disabled:active:shadow-[0_3px_0_#064e3b]"
            style={{ fontSize: "clamp(0.5rem, 1.1vw, 0.9rem)" }}
          >
            Próxima ➡️
          </button>
        </nav>

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

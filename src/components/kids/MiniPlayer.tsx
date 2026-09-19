import { useRef, useState, useEffect, useMemo } from "react";
import { X } from "lucide-react";
import { useLang, pickLang } from "@/lib/pick-lang";
import { splitLyrics, resolveDuration, computeLyricBounds, activeLineIndex } from "@/lib/lyric-sync";

export type MiniPlayerSong = {
  id: string;
  title: string;
  artist: string | null;
  audio_url: string;
  cover_url: string | null;
  language: string;
  lyrics_indigenous: string | null;
  lyrics_pt: string | null;
  lyrics_pt_en: string | null;
  lyrics_pt_es: string | null;
  duration_seconds: number | null;
  sync_offsets?: number[];
};

export function MiniPlayer({
  song,
  branding,
  onClose,
  isMaximized,
  onToggleMaximize,
}: {
  song: MiniPlayerSong;
  branding?: any;
  onClose: () => void;
  isMaximized: boolean;
  onToggleMaximize: () => void;
}) {
  const ref = useRef<HTMLAudioElement>(null);
  const lang = useLang();
  const [progress, setProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioError, setAudioError] = useState(false);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setProgress(0);
    setAudioDuration(0);
    setAudioError(false);
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

  const indLines = splitLyrics(song.lyrics_indigenous || "");
  const transLines = splitLyrics(pickLang(song as any, "lyrics_pt", lang) || "");
  const maxLen = Math.max(indLines.length, transLines.length);
  const duration = resolveDuration(audioDuration, song.duration_seconds);
  
  const bounds = useMemo(
    () => computeLyricBounds(indLines, transLines, duration, song.sync_offsets || []),
    [indLines, transLines, duration, song.id, lang, song.sync_offsets]
  );

  const activeIdx = useMemo(() => activeLineIndex(bounds, progress), [progress, bounds]);

  useEffect(() => {
    const box = boxRef.current;
    const el = lineRefs.current[activeIdx];
    if (!box || !el) return;
    box.scrollTo?.({
      top: el.offsetTop - box.clientHeight / 2 + el.clientHeight / 2,
      behavior: "smooth",
    });
  }, [activeIdx]);

  function retryAudio() {
    const a = ref.current;
    if (!a) return;
    setAudioError(false);
    a.load();
    void a.play()?.catch(() => {});
  }

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-[60] transition-all duration-500 ease-in-out ${
        isMaximized
          ? "top-0 h-screen flex flex-col bg-emerald-950 p-6"
          : "border-t-[6px] border-dashed border-amber-300 bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-900 p-3 shadow-2xl"
      }`}
    >
      {isMaximized ? (
        <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col overflow-hidden">
          <button
            onClick={onClose}
            aria-label="Fechar e voltar às cantigas"
            className="absolute right-0 top-0 z-50 grid h-10 w-10 place-items-center rounded-full border-2 border-amber-300/60 bg-emerald-900 text-amber-200 hover:bg-emerald-800"
          >
            <X className="h-5 w-5" />
          </button>
          <h2 className="mb-3 text-center font-display text-2xl font-black text-amber-200 md:text-3xl">
            🎶 {song.title} 🎶
          </h2>
          {maxLen === 0 ? (
            <p className="mt-10 text-center font-display text-lg font-black text-amber-100/80">
              A letra desta cantiga ainda não foi cadastrada 🌱
            </p>
          ) : (
            <div
              ref={boxRef}
              className="grid flex-1 grid-cols-1 gap-3 overflow-y-auto rounded-3xl border-4 border-amber-300/70 bg-emerald-950/70 p-4 md:grid-cols-2 md:gap-6"
            >
              <div className="min-w-0">
                <h3 className="mb-3 border-b-2 border-amber-300/40 pb-2 text-center font-display text-xl font-black text-amber-300">
                  Patxohã
                </h3>
                {Array.from({ length: maxLen }).map((_, i) => {
                  const active = i === activeIdx;
                  return (
                    <p
                      key={i}
                      ref={(el) => {
                        lineRefs.current[i] = el as unknown as HTMLDivElement;
                      }}
                      className={`py-2 text-center font-display font-black leading-tight transition-all duration-300 ${
                        branding?.caption_max_size || "text-2xl md:text-3xl"
                      } ${active ? "scale-105 text-amber-300" : "text-amber-100/60"}`}
                    >
                      {indLines[i] || "\u00A0"}
                    </p>
                  );
                })}
              </div>
              <div className="min-w-0 md:border-l-2 md:border-amber-300/25 md:pl-6">
                <h3 className="mb-3 border-b-2 border-amber-300/40 pb-2 text-center font-display text-xl font-black text-emerald-200">
                  Português
                </h3>
                {Array.from({ length: maxLen }).map((_, i) => {
                  const active = i === activeIdx;
                  return (
                    <p
                      key={i}
                      className={`py-2 text-center font-bold italic leading-tight transition-all duration-300 ${
                        branding?.caption_max_subsize || "text-xl md:text-2xl"
                      } ${active ? "scale-105 text-white" : "text-emerald-100/55"}`}
                    >
                      {transLines[i] || "\u00A0"}
                    </p>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        maxLen > 0 && (
          <div
            ref={boxRef}
            onClick={onToggleMaximize}
            className="relative mx-auto mb-2 max-h-40 w-full max-w-4xl cursor-pointer overflow-y-auto rounded-2xl border-4 border-amber-300/70 bg-emerald-950/60 px-3 py-2"
          >
            {Array.from({ length: maxLen }).map((_, i) => {
              const active = i === activeIdx;
              return (
                <div
                  key={i}
                  ref={(el) => {
                    lineRefs.current[i] = el;
                  }}
                  className={`py-4 text-center transition-all duration-300 ${active ? "scale-105" : "opacity-50"}`}
                >
                  <p
                    className={`font-display font-black leading-tight ${
                      branding?.caption_normal_size || "text-base"
                    } ${active ? "text-amber-300" : "text-amber-100"}`}
                  >
                    {indLines[i] || transLines[i] || "\u00A0"}
                  </p>
                  {indLines[i] && transLines[i] && (
                    <p
                      className={`font-bold italic ${
                        branding?.caption_normal_subsize || "text-xs mt-1"
                      } text-emerald-100/85`}
                    >
                      {transLines[i]}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )
      )}

      <div className="mx-auto flex max-w-4xl items-center gap-3">
        {song.cover_url ? (
          <img
            src={song.cover_url}
            width={56}
            height={56}
            className="h-14 w-14 shrink-0 rounded-2xl border-4 border-white object-cover shadow-lg"
            alt=""
          />
        ) : (
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border-4 border-white bg-amber-300 text-3xl">🎶</div>
        )}

        <div className="min-w-0 flex-1">
          <div className="truncate font-display text-base font-black text-amber-200">{song.title}</div>
          {song.artist && <div className="truncate text-[11px] font-bold text-emerald-100/80">{song.artist}</div>}
          {!song.audio_url && (
            <div className="mt-1 text-[11px] font-bold text-amber-100/85">
              O áudio desta cantiga ainda não foi cadastrado 🌱
            </div>
          )}
          <audio
            ref={ref}
            src={song.audio_url}
            controls
            className="mt-1 w-full"
            preload="auto"
            onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
            onLoadedMetadata={(e) => setAudioDuration(e.currentTarget.duration || 0)}
            onError={() => setAudioError(true)}
          />
          {audioError && (
            <button
              onClick={retryAudio}
              className="mt-1 rounded-xl border-2 border-white bg-amber-300 px-3 py-1 font-display text-xs font-black text-emerald-950"
            >
              Tocar de novo 🔁
            </button>
          )}
        </div>
        <button
          onClick={onClose}
          className="grid h-10 w-10 place-items-center rounded-full border-2 border-white bg-rose-500 text-white shadow-lg active:translate-y-0.5"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

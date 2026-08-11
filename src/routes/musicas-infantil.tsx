import { createFileRoute, Link } from "@tanstack/react-router";
import { AreaGate } from "@/components/area-gate";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Pause, Play, X, Maximize2, Minimize2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { pickLang, useLang } from "@/lib/pick-lang";
import bgAsset from "@/assets/musicas-infantil-bg.jpg.asset.json";
import { SiteHeader } from "@/components/home/site-header";
import { useTranslation } from "react-i18next";
import {
  activeLineIndex,
  computeLyricBounds,
  resolveDuration,
  splitLyrics,
} from "@/lib/lyric-sync";

export const Route = createFileRoute("/musicas-infantil")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Cantigas da Aldeia — Awã Tech Infantil" },
      {
        name: "description",
        content:
          "Menu infantil de cantigas indígenas do Awã Tech — bem colorido, com bichos, penas e tambor para as crianças cantarem juntas.",
      },
    ],
  }),
  component: GuardedMusicasInfantilPage,
});

type Song = {
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
};

const THEMES = [
  { bg: "from-rose-400 via-pink-400 to-fuchsia-400", ring: "ring-rose-100", emoji: "🪶", label: "Pena" },
  { bg: "from-emerald-400 via-lime-400 to-yellow-300", ring: "ring-emerald-100", emoji: "🐢", label: "Tartaruga" },
  { bg: "from-sky-400 via-cyan-400 to-teal-300", ring: "ring-sky-100", emoji: "🐟", label: "Peixinho" },
  { bg: "from-orange-400 via-red-400 to-rose-400", ring: "ring-orange-100", emoji: "🔥", label: "Fogueira" },
  { bg: "from-violet-400 via-fuchsia-400 to-pink-300", ring: "ring-violet-100", emoji: "🦜", label: "Arara" },
  { bg: "from-amber-500 via-orange-400 to-rose-300", ring: "ring-amber-100", emoji: "🥁", label: "Tambor" },
  { bg: "from-teal-400 via-emerald-400 to-lime-300", ring: "ring-teal-100", emoji: "🌳", label: "Árvore" },
  { bg: "from-yellow-400 via-amber-400 to-orange-400", ring: "ring-yellow-100", emoji: "☀️", label: "Sol" },
  { bg: "from-indigo-400 via-blue-400 to-sky-300", ring: "ring-indigo-100", emoji: "🌙", label: "Lua" },
  { bg: "from-lime-400 via-green-400 to-emerald-400", ring: "ring-lime-100", emoji: "🐸", label: "Sapinho" },
];

function MusicasInfantilPage() {
  const { t, i18n } = useTranslation();
  const { data: songs = [], isLoading } = useQuery({
    queryKey: ["songs_infantil"],
    staleTime: 1000 * 60 * 30,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("songs")
        .select(
          "id,title,artist,audio_url,cover_url,language,lyrics_indigenous,lyrics_pt,lyrics_pt_en,lyrics_pt_es,duration_seconds",
        )
        .eq("is_active", true)
        .order("order_index")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Song[];
    },
  });

  const [playing, setPlaying] = useState<Song | null>(null);

  return (
    <div
      className="kids-theme min-h-screen relative overflow-hidden text-emerald-950 bg-emerald-100"
      style={{
        backgroundImage: `url(${bgAsset.url})`,
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundAttachment: "fixed",
      }}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/0 via-black/10 to-black/40" />

      <SiteHeader mode="infantil" />

      <header className="relative sticky top-0 z-30 border-b-[6px] border-dashed border-amber-400 bg-amber-100/85 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-3 py-3">
          <Link
            to="/infantil"
            className="inline-flex items-center gap-1 rounded-full border-2 border-emerald-900 bg-emerald-600 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-white shadow-[0_4px_0_#064e3b] active:translate-y-0.5 active:shadow-none"
          >
            <ArrowLeft className="h-4 w-4" /> Aldeia
          </Link>
          <div className="flex items-center gap-1 font-display text-xl font-black text-rose-700 drop-shadow">
            🎶 Cantigas 🎶
          </div>
          <span className="w-16" />
        </div>
      </header>

      <main className="relative mx-auto max-w-4xl px-3 pb-32 pt-4">
        <section className="relative mb-6 overflow-hidden rounded-[2.5rem] border-[6px] border-white bg-gradient-to-br from-amber-200 via-yellow-100 to-rose-100 p-5 text-center shadow-[0_18px_0_-8px_rgba(180,83,9,0.45),0_25px_50px_-20px_rgba(0,0,0,0.4)]">
          <div className="flex justify-center gap-2 text-5xl">
            <span className="kid-bounce" style={{ animationDelay: "0s" }}>🪶</span>
            <span className="kid-bounce" style={{ animationDelay: "0.2s" }}>🥁</span>
            <span className="kid-bounce" style={{ animationDelay: "0.4s" }}>🦜</span>
            <span className="kid-bounce" style={{ animationDelay: "0.6s" }}>🌈</span>
          </div>
          <h1 className="mt-2 font-display text-4xl font-black leading-none text-emerald-900 md:text-5xl">
            Canta com a{" "}
            <span className="inline-block kid-wiggle text-rose-600">Aldeia!</span>
          </h1>
          <p className="mt-2 text-base font-black text-emerald-800/80">
            Toca no bichinho para ouvir a cantiga 🎵
          </p>
        </section>

        {isLoading ? (
          <div className="grid animate-pulse grid-cols-2 gap-5 sm:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-[2rem] bg-white/60" />
            ))}
          </div>
        ) : songs.length === 0 ? (
          <p className="text-center font-black text-emerald-800/70">
            Em breve novas cantigas 🌱
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
            {songs.map((s, i) => {
              const theme = THEMES[i % THEMES.length];
              const isActive = playing?.id === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setPlaying(isActive ? null : s)}
                  className={`group relative flex aspect-square flex-col items-center justify-between rounded-[2rem] border-[5px] border-white bg-gradient-to-br ${theme.bg} p-3 text-center shadow-[0_10px_0_-3px_rgba(0,0,0,0.25),0_20px_35px_-15px_rgba(0,0,0,0.4)] ring-4 ${theme.ring} transition-transform hover:-translate-y-1 hover:rotate-[-1deg] hover:scale-[1.04] active:translate-y-0.5 active:scale-95`}
                >
                  <svg viewBox="0 0 60 8" className="h-3 w-full text-white/90">
                    <path d="M0 8 L6 0 L12 8 L18 0 L24 8 L30 0 L36 8 L42 0 L48 8 L54 0 L60 8" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  </svg>

                  <div className="relative grid h-20 w-20 place-items-center rounded-full bg-white/95 text-5xl shadow-inner ring-[6px] ring-white/70">
                    {isActive ? (
                      <Pause className="h-9 w-9 fill-emerald-800 text-emerald-800" />
                    ) : (
                      <span aria-hidden className="kid-bounce" style={{ animationDelay: `${(i % 5) * 0.15}s` }}>
                        {theme.emoji}
                      </span>
                    )}
                    <span className="absolute inset-0 rounded-full border-[3px] border-dashed border-white/70 kid-spin-slow" />
                  </div>

                  <div className="w-full">
                    <div className="line-clamp-2 font-display text-sm font-black uppercase leading-tight tracking-wide text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.35)]">
                      {s.title}
                    </div>
                    {s.artist && (
                      <div className="mt-0.5 line-clamp-1 text-[10px] font-black text-white/90">
                        {s.artist}
                      </div>
                    )}
                  </div>

                  <span className="absolute -bottom-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full border-2 border-white bg-emerald-900 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-200 shadow-[0_4px_0_rgba(0,0,0,0.3)]">
                    {isActive ? "Tocando…" : <>Tocar <Play className="h-3 w-3 fill-current" /></>}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </main>

      {playing && <MiniPlayer song={playing} onClose={() => setPlaying(null)} />}
    </div>
  );
}

export function MiniPlayer({ song, onClose }: { song: Song; onClose: () => void }) {
  const ref = useRef<HTMLAudioElement>(null);
  const lang = useLang();
  const [progress, setProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioError, setAudioError] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
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
  }, [song.id]);

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

  const indLines = splitLyrics(song.lyrics_indigenous);
  const transLines = splitLyrics(pickLang(song as any, "lyrics_pt", lang));
  const maxLen = Math.max(indLines.length, transLines.length);

  const duration = resolveDuration(audioDuration, song.duration_seconds);

  const bounds = useMemo(
    () =>
      computeLyricBounds(
        Array.from({ length: maxLen }, (_, i) => indLines[i] || transLines[i] || ""),
        duration,
      ),
    [maxLen, duration, song.id, lang],
  );

  const activeIdx = useMemo(() => activeLineIndex(bounds, progress), [progress, bounds]);

  useEffect(() => {
    const box = boxRef.current;
    const el = lineRefs.current[activeIdx];
    if (!box || !el) return;
    // Auto-scroll removido a pedido: "letras fica para sem te mexe automaticamente"
    // O usuário pode rolar manualmente se desejar ver o resto.

  }, [activeIdx, isMaximized]);

  function retryAudio() {
    const a = ref.current;
    if (!a) return;
    setAudioError(false);
    a.load();
    void a.play()?.catch(() => {});
  }

  return (
    <div 
      className={`fixed inset-x-0 bottom-0 z-50 border-t-[6px] border-dashed border-amber-300 bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-900 transition-all duration-500 ease-in-out flex flex-col ${
        isMaximized ? "h-[100dvh]" : "h-auto p-3"
      }`}
    >
      {isMaximized && (
        <div className="flex items-center justify-between p-4 border-b-4 border-dashed border-white/20">
           <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl border-4 border-white bg-amber-300 text-2xl">
              🎶
            </div>
            <div className="min-w-0">
              <div className="truncate font-display text-lg font-black text-amber-200">
                {song.title}
              </div>
              <div className="truncate text-xs font-bold text-emerald-100/80">
                {song.artist}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsMaximized(false)}
              className="grid h-10 w-10 place-items-center rounded-full border-2 border-white bg-amber-500 text-white shadow-md active:translate-y-0.5"
            >
              <Minimize2 className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="grid h-10 w-10 place-items-center rounded-full border-2 border-white bg-rose-500 text-white shadow-md active:translate-y-0.5"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {maxLen > 0 && (
        <div 
          ref={boxRef} 
          className={`relative mx-auto overflow-y-auto transition-all duration-500 rounded-2xl border-4 border-amber-300/70 bg-emerald-950/60 px-4 py-3 flex-1 w-full max-w-4xl ${
            isMaximized ? "my-4 text-center" : "mb-2 max-h-40"
          }`}
        >
          {Array.from({ length: maxLen }).map((_, i) => {
            const active = i === activeIdx;
            return (
              <div
                key={i}
                ref={(el) => {
                  lineRefs.current[i] = el;
                }}
                className={`flex w-full items-start justify-center gap-4 py-3 transition-all duration-300 ${
                  active ? "scale-[1.05]" : "opacity-30 blur-[0.5px]"
                } ${isMaximized ? "py-6" : "py-2"}`}
              >
                <div className="w-1/2 text-right">
                  <p
                    className={`font-display font-black leading-tight drop-shadow-sm ${
                      active ? "text-amber-300" : "text-amber-100"
                    } ${isMaximized ? "text-3xl md:text-5xl" : "text-base sm:text-lg"}`}
                  >
                    {indLines[i] || "\u00A0"}
                  </p>
                </div>

                <div className={`h-full min-h-[1.5rem] w-0.5 self-stretch ${active ? "bg-amber-300/50" : "bg-emerald-800/50"}`} />

                <div className="w-1/2 text-left">
                  <p
                    className={`font-bold italic leading-tight ${
                      active ? "text-emerald-50" : "text-emerald-100/70"
                    } ${isMaximized ? "text-2xl md:text-4xl" : "text-sm sm:text-base"}`}
                  >
                    {transLines[i] || "\u00A0"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className={`mx-auto w-full max-w-4xl flex items-center gap-3 ${isMaximized ? "p-4 bg-black/20 rounded-t-3xl border-t-4 border-white/10" : ""}`}>
        {!isMaximized && (
          <button 
            onClick={() => setIsMaximized(true)}
            className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border-4 border-white bg-amber-300 text-3xl kid-bounce"
          >
            🎶
          </button>
        )}
        
        <div className="min-w-0 flex-1">
          {!isMaximized && (
            <>
              <div className="truncate font-display text-base font-black text-amber-200">
                {song.title}
              </div>
              {song.artist && (
                <div className="truncate text-[11px] font-bold text-emerald-100/80">
                  {song.artist}
                </div>
              )}
            </>
          )}
          
          <audio
            ref={ref}
            src={song.audio_url}
            controls
            className="mt-1 w-full"
            preload="auto"
            data-testid="kids-audio"
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

        {!isMaximized && (
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setIsMaximized(true)}
              aria-label="Maximizar"
              className="grid h-10 w-10 place-items-center rounded-full border-2 border-white bg-amber-500 text-white shadow-[0_4px_0_rgba(0,0,0,0.35)] active:translate-y-0.5 active:shadow-none"
            >
              <Maximize2 className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              aria-label="Fechar"
              className="grid h-10 w-10 place-items-center rounded-full border-2 border-white bg-rose-500 text-white shadow-[0_4px_0_rgba(0,0,0,0.35)] active:translate-y-0.5 active:shadow-none"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function GuardedMusicasInfantilPage() {
  return (
    <AreaGate plan="infantil">
      <MusicasInfantilPage />
    </AreaGate>
  );
}

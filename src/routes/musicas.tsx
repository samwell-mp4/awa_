import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft,
  Music,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  X,
  Volume2,
} from "lucide-react";

export const Route = createFileRoute("/musicas")({
  head: () => ({
    meta: [
      { title: "Cânticos Sagrados — AWÃ TECH" },
      {
        name: "description",
        content:
          "Cânticos em línguas indígenas brasileiras com legendas bilíngues sincronizadas e vídeos imersivos da floresta.",
      },
    ],
  }),
  component: MusicasPage,
});

type Song = {
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
};

type Ambient = { id: string; name: string; video_url: string };

function MusicasPage() {
  const { data: songs = [] } = useQuery({
    queryKey: ["songs_public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("songs")
        .select("*")
        .eq("is_active", true)
        .order("order_index")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Song[];
    },
  });
  const { data: ambients = [] } = useQuery({
    queryKey: ["ambient_videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ambient_videos")
        .select("id,name,video_url");
      if (error) throw error;
      return data as Ambient[];
    },
  });

  const ambientMap = Object.fromEntries(ambients.map((a) => [a.id, a]));
  const [playing, setPlaying] = useState<Song | null>(null);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* ambient backdrop */}
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-30">
        {ambients[0] && (
          <video
            src={ambients[0].video_url}
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.18_0.04_145/0.9)] via-[oklch(0.15_0.04_145/0.7)] to-[oklch(0.10_0.03_145/0.95)]" />
      </div>

      <header className="sticky top-0 z-40 border-b border-gold/20 bg-[oklch(0.15_0.04_145/0.6)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 md:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gold hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
          <div className="flex items-center gap-2 text-cream font-display font-black">
            <Music className="h-5 w-5 text-leaf" /> Cânticos
          </div>
          <span className="w-14" />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 md:px-8 py-10 md:py-16">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between border-b border-gold/20 pb-6 mb-10">
          <div>
            <span className="text-[10px] md:text-xs font-bold tracking-[0.35em] uppercase text-gold">
              AWÃ TECH · Cantos Originários
            </span>
            <h1 className="mt-2 font-display text-3xl md:text-5xl font-black text-cream leading-tight">
              Cânticos <span className="italic text-gold">Sagrados</span>
            </h1>
            <p className="mt-3 max-w-xl text-sm md:text-base text-foreground/70">
              A floresta canta. Ouça em língua originária com tradução em português —
              cada verso se acende quando chega a sua vez.
            </p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {songs.map((s) => (
            <SongCard
              key={s.id}
              song={s}
              ambient={s.ambient_video_id ? ambientMap[s.ambient_video_id] : undefined}
              onClick={() => setPlaying(s)}
            />
          ))}
          {songs.length === 0 && (
            <div className="col-span-full text-center text-foreground/60 py-12">
              Nenhum cântico publicado ainda.
            </div>
          )}
        </div>
      </main>

      {playing && (
        <Player
          song={playing}
          ambient={playing.ambient_video_id ? ambientMap[playing.ambient_video_id] : undefined}
          songs={songs}
          onClose={() => setPlaying(null)}
          onChange={setPlaying}
        />
      )}
    </div>
  );
}

function SongCard({
  song,
  ambient,
  onClick,
}: {
  song: Song;
  ambient?: Ambient;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-gold/15 bg-card/30 text-left transition-all duration-500 hover:-translate-y-1 hover:border-gold/50 hover:shadow-[0_20px_60px_-20px_rgba(249,168,37,0.35)]"
    >
      {/* media */}
      <div className="absolute inset-0">
        {song.cover_url ? (
          <img
            src={song.cover_url}
            alt={song.title}
            className="h-full w-full object-cover opacity-75 grayscale-[35%] transition-all duration-700 group-hover:scale-110 group-hover:grayscale-0 group-hover:opacity-100"
          />
        ) : ambient ? (
          <video
            src={ambient.video_url}
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover opacity-75 transition-all duration-700 group-hover:scale-110 group-hover:opacity-100"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-forest-deep via-bark to-leaf/40" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />
      </div>

      {/* tribal corner ornament */}
      <div className="absolute top-3 right-3 flex gap-1">
        <span className="block h-1.5 w-1.5 rounded-full bg-gold/60" />
        <span className="block h-1.5 w-1.5 rounded-full bg-gold/30" />
        <span className="block h-1.5 w-1.5 rounded-full bg-gold/15" />
      </div>

      {/* play overlay */}
      <div className="absolute inset-0 grid place-items-center opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-gold text-bark shadow-[0_0_40px_rgba(249,168,37,0.6)]">
          <Play className="h-7 w-7 ml-1 fill-current" />
        </div>
      </div>

      {/* info */}
      <div className="absolute inset-x-0 bottom-0 p-5">
        <div className="text-[10px] font-bold tracking-[0.25em] uppercase text-gold mb-1.5">
          {song.language}
        </div>
        <h3 className="font-display text-xl font-black text-cream leading-tight">
          {song.title}
        </h3>
        {song.artist && (
          <p className="mt-1 text-xs text-foreground/70 truncate">{song.artist}</p>
        )}
      </div>
    </button>
  );
}

function Player({
  song,
  ambient,
  songs,
  onClose,
  onChange,
}: {
  song: Song;
  ambient?: Ambient;
  songs: Song[];
  onClose: () => void;
  onChange: (s: Song) => void;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const lyricsRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  // user-tunable sync: negative = legenda mais cedo, positive = mais tarde
  const [offset, setOffset] = useState(0);

  const idx = songs.findIndex((s) => s.id === song.id);
  const prev = songs[idx - 1];
  const next = songs[idx + 1];

  const indLines = useMemo(
    () => song.lyrics_indigenous.split("\n").map((l) => l.trim()),
    [song.lyrics_indigenous],
  );
  const ptLines = useMemo(
    () => song.lyrics_pt.split("\n").map((l) => l.trim()),
    [song.lyrics_pt],
  );
  const maxLen = Math.max(indLines.length, ptLines.length);

  // distribute lines across (duration - intro) → karaoke index
  // intro ~ 8% of duration (instrumental abertura) + user offset
  const activeIdx = useMemo(() => {
    if (!duration || !maxLen) return 0;
    const intro = Math.min(12, duration * 0.08);
    const usable = Math.max(1, duration - intro);
    const perLine = usable / maxLen;
    const t = progress - intro + offset;
    if (t <= 0) return 0;
    return Math.min(maxLen - 1, Math.floor(t / perLine));
  }, [progress, duration, maxLen, offset]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, [song.id]);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const onSpace = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", onEsc);
    window.addEventListener("keydown", onSpace);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onEsc);
      window.removeEventListener("keydown", onSpace);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose]);

  // auto-scroll active verse into view
  useEffect(() => {
    const node = lyricsRef.current?.querySelector<HTMLDivElement>(
      `[data-line="${activeIdx}"]`,
    );
    node?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeIdx]);

  function toggle() {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      a.play();
      setPlaying(true);
    } else {
      a.pause();
      setPlaying(false);
    }
  }

  const intro = duration ? Math.min(12, duration * 0.08) : 0;
  const perLine = duration && maxLen ? Math.max(1, duration - intro) / maxLen : 0;
  const tInLine = progress - intro + offset - activeIdx * perLine;
  const lineProgress = perLine ? (tInLine / perLine) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50">
      {/* cinematic background */}
      <div className="absolute inset-0 overflow-hidden">
        {song.video_url ? (
          <video
            src={song.video_url}
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover scale-110"
          />
        ) : ambient ? (
          <video
            src={ambient.video_url}
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover scale-110"
          />
        ) : song.cover_url ? (
          <img
            src={song.cover_url}
            alt=""
            className="h-full w-full object-cover scale-110 blur-xl"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-forest-deep via-bark to-leaf/40" />
        )}
        {/* vignette + grain */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.85)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/95" />
      </div>

      {/* header */}
      <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between p-5 md:p-8">
        <div className="space-y-1">
          <div className="text-[10px] md:text-xs font-bold tracking-[0.35em] uppercase text-gold">
            Ouvindo agora · {song.language}
          </div>
          <h2 className="font-display text-2xl md:text-4xl font-black text-cream drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
            {song.title}
          </h2>
          {song.artist && (
            <div className="text-sm text-foreground/80 italic">{song.artist}</div>
          )}
        </div>
        <button
          onClick={onClose}
          className="grid h-11 w-11 place-items-center rounded-full border border-gold/40 bg-black/50 text-gold backdrop-blur-md hover:bg-gold/10"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* lyrics theater */}
      <div
        ref={lyricsRef}
        className="absolute inset-0 z-[5] overflow-y-auto px-4 md:px-8 pt-32 md:pt-40 pb-44 scroll-smooth"
      >
        <div className="mx-auto max-w-3xl space-y-10 md:space-y-14">
          {Array.from({ length: maxLen }).map((_, i) => {
            const isActive = i === activeIdx;
            const distance = Math.abs(i - activeIdx);
            const opacity = isActive ? 1 : distance === 1 ? 0.4 : distance === 2 ? 0.18 : 0.08;
            const blur = isActive ? 0 : Math.min(distance, 3);

            return (
              <div
                key={i}
                data-line={i}
                className="text-center transition-all duration-700 ease-out"
                style={{
                  opacity,
                  filter: blur ? `blur(${blur}px)` : "none",
                  transform: isActive ? "scale(1)" : "scale(0.94)",
                }}
              >
                <p
                  className={
                    "font-display font-black leading-tight transition-all duration-700 " +
                    (isActive
                      ? "text-3xl md:text-6xl bg-gradient-to-b from-gold via-[oklch(0.85_0.13_85)] to-[oklch(0.65_0.16_50)] bg-clip-text text-transparent drop-shadow-[0_4px_20px_rgba(249,168,37,0.35)]"
                      : "text-xl md:text-3xl text-cream")
                  }
                >
                  {indLines[i] || "\u00A0"}
                </p>
                {ptLines[i] && (
                  <p
                    className={
                      "mt-2 md:mt-3 italic transition-colors duration-700 " +
                      (isActive
                        ? "text-base md:text-xl text-cream/90"
                        : "text-sm md:text-base text-foreground/60")
                    }
                  >
                    {ptLines[i]}
                  </p>
                )}
                {isActive && (
                  <div className="mx-auto mt-4 h-[2px] w-32 rounded-full bg-gold/20 overflow-hidden">
                    <div
                      className="h-full bg-gold shadow-[0_0_12px_rgba(249,168,37,0.8)]"
                      style={{ width: `${Math.min(100, Math.max(0, lineProgress))}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
          {maxLen === 0 && (
            <p className="text-center text-foreground/60">Esta música ainda não tem letra cadastrada.</p>
          )}
        </div>
      </div>

      {/* controls */}
      <div className="absolute inset-x-0 bottom-0 z-10 border-t border-gold/15 bg-gradient-to-t from-black/95 via-black/80 to-black/40 backdrop-blur-xl">
        <div className="mx-auto max-w-3xl px-4 md:px-8 py-4 md:py-6">
          {/* progress */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold tracking-widest text-foreground/60 tabular-nums">
              {fmt(progress)}
            </span>
            <div
              className="group relative flex-1 h-1.5 cursor-pointer rounded-full bg-gold/15"
              onClick={(e) => {
                const a = audioRef.current;
                if (!a || !duration) return;
                const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                a.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
              }}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-gold to-[oklch(0.78_0.16_70)] shadow-[0_0_12px_rgba(249,168,37,0.6)]"
                style={{ width: `${duration ? (progress / duration) * 100 : 0}%` }}
              />
              <div
                className="absolute top-1/2 h-3 w-3 -translate-y-1/2 -translate-x-1/2 rounded-full bg-cream opacity-0 transition-opacity group-hover:opacity-100"
                style={{ left: `${duration ? (progress / duration) * 100 : 0}%` }}
              />
            </div>
            <span className="text-[10px] font-bold tracking-widest text-foreground/60 tabular-nums">
              {fmt(duration)}
            </span>
          </div>

          {/* buttons */}
          <div className="mt-4 flex items-center justify-center gap-6 md:gap-10">
            <button
              disabled={!prev}
              onClick={() => prev && onChange(prev)}
              className="text-cream/70 transition-colors hover:text-gold disabled:opacity-25"
              aria-label="Anterior"
            >
              <ChevronLeft className="h-7 w-7" />
            </button>
            <button
              onClick={toggle}
              className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-gold to-[oklch(0.62_0.16_55)] text-bark shadow-[0_10px_40px_-5px_rgba(249,168,37,0.6)] transition-transform hover:scale-105"
              aria-label={playing ? "Pausar" : "Tocar"}
            >
              {playing ? (
                <Pause className="h-7 w-7 fill-current" />
              ) : (
                <Play className="h-7 w-7 ml-1 fill-current" />
              )}
            </button>
            <button
              disabled={!next}
              onClick={() => next && onChange(next)}
              className="text-cream/70 transition-colors hover:text-gold disabled:opacity-25"
              aria-label="Próxima"
            >
              <ChevronRight className="h-7 w-7" />
            </button>
          </div>

          <div className="mt-3 flex items-center justify-center gap-2 text-[10px] font-bold tracking-[0.3em] uppercase text-gold/70">
            <Volume2 className="h-3 w-3" />
            Bilíngue · Indígena / Português
          </div>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={song.audio_url}
        onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={() => (next ? onChange(next) : setPlaying(false))}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
    </div>
  );
}

function fmt(s: number) {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

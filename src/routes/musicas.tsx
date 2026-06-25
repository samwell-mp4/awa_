import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Music, Play, Pause, ChevronLeft, ChevronRight, X } from "lucide-react";

export const Route = createFileRoute("/musicas")({
  head: () => ({
    meta: [
      { title: "Músicas — AWÃ TECH" },
      {
        name: "description",
        content:
          "Ouça músicas em línguas indígenas brasileiras com letras bilíngues e vídeos imersivos da floresta.",
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
      const { data, error } = await supabase.from("ambient_videos").select("id,name,video_url");
      if (error) throw error;
      return data as Ambient[];
    },
  });

  const ambientMap = Object.fromEntries(ambients.map((a) => [a.id, a]));
  const [playing, setPlaying] = useState<Song | null>(null);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-gold/20 bg-[oklch(0.18_0.04_145/0.75)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 md:px-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-gold hover:underline">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
          <div className="flex items-center gap-2 text-cream font-display font-black">
            <Music className="h-5 w-5 text-leaf" /> Músicas
          </div>
          <span className="w-14" />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 md:px-8 py-8">
        <h1 className="font-display text-3xl md:text-4xl font-black text-cream">
          Cantos da floresta <span className="text-gold">vivos</span>
        </h1>
        <p className="mt-2 max-w-2xl text-foreground/70">
          Ouça músicas em línguas indígenas. As legendas mostram o canto original em cima e a tradução em
          português embaixo, enquanto a floresta dança por trás.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {songs.map((s) => (
            <button
              key={s.id}
              onClick={() => setPlaying(s)}
              className="group text-left rounded-2xl border border-gold/20 bg-card/40 overflow-hidden hover:border-gold/60 transition"
            >
              <div className="aspect-video bg-gradient-to-br from-leaf/30 to-bark/40 relative overflow-hidden">
                {s.cover_url ? (
                  <img src={s.cover_url} alt={s.title} className="w-full h-full object-cover" />
                ) : s.ambient_video_id && ambientMap[s.ambient_video_id] ? (
                  <video
                    src={ambientMap[s.ambient_video_id].video_url}
                    muted
                    loop
                    playsInline
                    autoPlay
                    className="w-full h-full object-cover opacity-80"
                  />
                ) : (
                  <div className="absolute inset-0 grid place-items-center text-gold/40">
                    <Music className="h-14 w-14" />
                  </div>
                )}
                <div className="absolute inset-0 grid place-items-center bg-black/30 opacity-0 group-hover:opacity-100 transition">
                  <div className="h-14 w-14 rounded-full bg-gold text-bark grid place-items-center">
                    <Play className="h-6 w-6 ml-1" />
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="text-xs uppercase tracking-wider text-gold/80">{s.language}</div>
                <div className="font-display text-lg font-bold text-cream">{s.title}</div>
                {s.artist && <div className="text-xs text-foreground/60 mt-0.5">{s.artist}</div>}
              </div>
            </button>
          ))}
          {songs.length === 0 && (
            <div className="col-span-full text-center text-foreground/60 py-12">
              Nenhuma música publicada ainda.
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
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const idx = songs.findIndex((s) => s.id === song.id);
  const prev = songs[idx - 1];
  const next = songs[idx + 1];

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, [song.id]);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onEsc);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onEsc);
      document.body.style.overflow = "";
    };
  }, [onClose]);

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

  const indLines = song.lyrics_indigenous.split("\n");
  const ptLines = song.lyrics_pt.split("\n");
  const maxLen = Math.max(indLines.length, ptLines.length);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md">
      <div className="absolute inset-0 overflow-hidden">
        {song.video_url ? (
          <video src={song.video_url} autoPlay muted loop playsInline className="w-full h-full object-cover opacity-50" />
        ) : ambient ? (
          <video src={ambient.video_url} autoPlay muted loop playsInline className="w-full h-full object-cover opacity-50" />
        ) : song.cover_url ? (
          <img src={song.cover_url} alt="" className="w-full h-full object-cover opacity-30 blur-2xl scale-110" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-forest-deep via-bark to-leaf/40" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-black/90" />
      </div>

      <div className="relative h-full flex flex-col">
        <div className="flex items-center justify-between p-4 md:p-6">
          <div>
            <div className="text-xs uppercase tracking-wider text-gold">{song.language}</div>
            <h2 className="font-display text-xl md:text-2xl font-black text-cream">{song.title}</h2>
            {song.artist && <div className="text-sm text-foreground/70">{song.artist}</div>}
          </div>
          <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full border border-gold/40 bg-black/40 text-gold hover:bg-gold/10">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-32">
          <div className="mx-auto max-w-3xl space-y-4">
            {Array.from({ length: maxLen }).map((_, i) => (
              <div key={i} className="text-center">
                <p className="font-display text-xl md:text-3xl font-black text-cream leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                  {indLines[i] || "\u00A0"}
                </p>
                <p className="mt-1 text-sm md:text-base italic text-gold/90 drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
                  {ptLines[i] || ""}
                </p>
              </div>
            ))}
            {maxLen === 0 && (
              <p className="text-center text-foreground/60">Esta música não tem letra cadastrada.</p>
            )}
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 border-t border-gold/20 bg-[oklch(0.12_0.04_145/0.85)] backdrop-blur-xl p-3 md:p-4">
          <div className="mx-auto max-w-3xl flex items-center gap-3 md:gap-4">
            <button
              disabled={!prev}
              onClick={() => prev && onChange(prev)}
              className="grid h-10 w-10 place-items-center rounded-full text-gold disabled:opacity-30 hover:bg-gold/10"
              aria-label="Anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={toggle}
              className="grid h-12 w-12 place-items-center rounded-full bg-gold text-bark shadow-[var(--shadow-glow)]"
              aria-label={playing ? "Pausar" : "Tocar"}
            >
              {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
            </button>
            <button
              disabled={!next}
              onClick={() => next && onChange(next)}
              className="grid h-10 w-10 place-items-center rounded-full text-gold disabled:opacity-30 hover:bg-gold/10"
              aria-label="Próxima"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div className="flex-1">
              <div
                className="h-1.5 rounded-full bg-gold/20 cursor-pointer overflow-hidden"
                onClick={(e) => {
                  const a = audioRef.current;
                  if (!a || !duration) return;
                  const rect = (e.target as HTMLDivElement).getBoundingClientRect();
                  const ratio = (e.clientX - rect.left) / rect.width;
                  a.currentTime = ratio * duration;
                }}
              >
                <div className="h-full bg-gold transition-[width]" style={{ width: `${duration ? (progress / duration) * 100 : 0}%` }} />
              </div>
              <div className="flex justify-between text-[10px] text-foreground/60 mt-1 tabular-nums">
                <span>{fmt(progress)}</span>
                <span>{fmt(duration)}</span>
              </div>
            </div>
          </div>
        </div>

        <audio
          ref={audioRef}
          src={song.audio_url}
          onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onEnded={() => next ? onChange(next) : setPlaying(false)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />
      </div>
    </div>
  );
}

function fmt(s: number) {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

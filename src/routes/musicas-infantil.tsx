import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Pause, Play, Music2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/musicas-infantil")({
  head: () => ({
    meta: [
      { title: "Cantigas da Aldeia — Awã Tech Infantil" },
      {
        name: "description",
        content:
          "Menu infantil de músicas e cantigas indígenas do Awã Tech: aprenda cantando com desenhos, cores e sons da floresta.",
      },
    ],
  }),
  component: MusicasInfantilPage,
});

type Song = {
  id: string;
  title: string;
  artist: string | null;
  audio_url: string;
  cover_url: string | null;
  language: string;
};

// Tribal color themes cycled across cards
const THEMES = [
  { bg: "from-rose-400 via-amber-400 to-yellow-300", ring: "ring-rose-200", emoji: "🪶" },
  { bg: "from-emerald-400 via-lime-400 to-yellow-300", ring: "ring-emerald-200", emoji: "🌿" },
  { bg: "from-sky-400 via-cyan-400 to-teal-300", ring: "ring-sky-200", emoji: "🐟" },
  { bg: "from-orange-400 via-red-400 to-pink-400", ring: "ring-orange-200", emoji: "🔥" },
  { bg: "from-violet-400 via-fuchsia-400 to-pink-300", ring: "ring-violet-200", emoji: "🦜" },
  { bg: "from-amber-500 via-orange-400 to-rose-300", ring: "ring-amber-200", emoji: "🥁" },
  { bg: "from-teal-400 via-emerald-400 to-lime-300", ring: "ring-teal-200", emoji: "🐢" },
  { bg: "from-yellow-400 via-amber-400 to-orange-400", ring: "ring-yellow-200", emoji: "☀️" },
];

function MusicasInfantilPage() {
  const { data: songs = [], isLoading } = useQuery({
    queryKey: ["songs_infantil"],
    staleTime: 1000 * 60 * 30,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("songs")
        .select("id,title,artist,audio_url,cover_url,language")
        .eq("is_active", true)
        .order("order_index")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Song[];
    },
  });

  const [playing, setPlaying] = useState<Song | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-200 via-emerald-100 to-amber-100 text-emerald-950 overflow-hidden">
      {/* Playful floating tribal shapes */}
      <TribalBackdrop />

      <header className="relative sticky top-0 z-30 border-b-4 border-amber-300 bg-gradient-to-r from-amber-200/90 via-yellow-100/90 to-amber-200/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <Link
            to="/infantil"
            className="inline-flex items-center gap-1 rounded-full bg-emerald-700 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-white shadow"
          >
            <ArrowLeft className="h-4 w-4" /> Aldeia
          </Link>
          <div className="flex items-center gap-2 font-display text-lg font-black text-emerald-900">
            <Music2 className="h-5 w-5 text-rose-600" /> Cantigas
          </div>
          <span className="w-16" />
        </div>
      </header>

      <main className="relative mx-auto max-w-4xl px-4 pb-24 pt-6">
        {/* Big playful title */}
        <section className="relative mb-6 rounded-[2rem] border-4 border-amber-300 bg-gradient-to-br from-white/80 to-amber-50 p-5 text-center shadow-[0_15px_40px_-20px_rgba(0,0,0,0.35)]">
          <div className="text-5xl">🪶🥁🎶</div>
          <h1 className="mt-2 font-display text-3xl font-black leading-tight text-emerald-900 md:text-4xl">
            Cantigas da <span className="text-rose-600">Aldeia</span>
          </h1>
          <p className="mt-1 text-sm font-semibold text-emerald-800/80">
            Escolha uma canção e cante com a floresta!
          </p>
        </section>

        {isLoading ? (
          <div className="grid animate-pulse grid-cols-2 gap-4 sm:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-40 rounded-[1.75rem] bg-white/60" />
            ))}
          </div>
        ) : songs.length === 0 ? (
          <p className="text-center font-semibold text-emerald-800/70">
            Em breve novas cantigas 🌱
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {songs.map((s, i) => {
              const theme = THEMES[i % THEMES.length];
              const isActive = playing?.id === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setPlaying(isActive ? null : s)}
                  className={`group relative flex aspect-square flex-col items-center justify-between rounded-[1.75rem] border-4 border-white bg-gradient-to-br ${theme.bg} p-3 text-center shadow-[0_10px_25px_-8px_rgba(0,0,0,0.35)] ring-4 ${theme.ring} transition-transform hover:-translate-y-1 hover:scale-[1.03] active:scale-95`}
                >
                  {/* Tribal top pattern */}
                  <div className="flex w-full items-center justify-between text-[10px] font-black text-white/90">
                    <span>▲▽▲</span>
                    <span>{s.language}</span>
                    <span>▽▲▽</span>
                  </div>

                  <div className="grid h-16 w-16 place-items-center rounded-full bg-white/90 text-4xl shadow-inner ring-4 ring-white/60">
                    {isActive ? (
                      <Pause className="h-7 w-7 text-emerald-800" />
                    ) : (
                      <span aria-hidden>{theme.emoji}</span>
                    )}
                  </div>

                  <div className="w-full">
                    <div className="line-clamp-2 font-display text-xs font-black uppercase leading-tight tracking-wide text-white drop-shadow">
                      {s.title}
                    </div>
                    {s.artist && (
                      <div className="mt-0.5 line-clamp-1 text-[10px] font-bold text-white/90">
                        {s.artist}
                      </div>
                    )}
                  </div>

                  {/* play tag */}
                  <span className="absolute -bottom-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-emerald-900 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-200 shadow">
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

function MiniPlayer({ song, onClose }: { song: Song; onClose: () => void }) {
  const ref = useRef<HTMLAudioElement>(null);
  useEffect(() => {
    ref.current?.play().catch(() => {});
  }, [song.id]);
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t-4 border-amber-300 bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-900 p-3 shadow-2xl">
      <div className="mx-auto flex max-w-4xl items-center gap-3">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber-300 text-2xl">
          🎶
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate font-display text-sm font-black text-amber-200">
            {song.title}
          </div>
          {song.artist && (
            <div className="truncate text-[11px] font-semibold text-emerald-100/80">
              {song.artist}
            </div>
          )}
          <audio ref={ref} src={song.audio_url} controls className="mt-1 w-full" />
        </div>
        <button
          onClick={onClose}
          className="rounded-full bg-rose-500 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-white shadow"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}

function TribalBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -left-10 top-24 text-6xl opacity-30 rotate-[-15deg]">🪶</div>
      <div className="absolute right-4 top-40 text-5xl opacity-30 rotate-12">🥁</div>
      <div className="absolute left-6 bottom-40 text-6xl opacity-30">🌿</div>
      <div className="absolute right-8 bottom-56 text-5xl opacity-30 rotate-6">🦜</div>
      <div className="absolute left-1/2 top-10 -translate-x-1/2 text-4xl opacity-25">☀️</div>
      <svg
        className="absolute inset-x-0 top-0 h-24 w-full opacity-30"
        viewBox="0 0 400 40"
        preserveAspectRatio="none"
      >
        <path
          d="M0 20 L20 0 L40 20 L60 0 L80 20 L100 0 L120 20 L140 0 L160 20 L180 0 L200 20 L220 0 L240 20 L260 0 L280 20 L300 0 L320 20 L340 0 L360 20 L380 0 L400 20"
          fill="none"
          stroke="#b45309"
          strokeWidth="3"
        />
      </svg>
    </div>
  );
}

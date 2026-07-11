import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Music2, ChevronDown } from "lucide-react";
import { useState } from "react";


import { SiteFooter } from "@/components/home/site-footer";
import { SiteHeader } from "@/components/home/site-header";
import { supabase } from "@/integrations/supabase/client";
import canticosBgAsset from "@/assets/canticos-bg.png.asset.json";

const canticosBg = canticosBgAsset.url;

export const Route = createFileRoute("/canticos")({
  head: () => ({
    meta: [
      { title: "Cântico Infantil — Awã Tech" },
      {
        name: "description",
        content: "Aprenda a cantar os cânticos Pataxó — versão infantil com letra e áudio.",
      },
      { property: "og:title", content: "Cântico Infantil — Awã Tech" },
      {
        property: "og:description",
        content: "Ouça e cante junto os cânticos Pataxó.",
      },
    ],
  }),
  component: CanticosInfantilPage,
});

type Song = {
  id: string;
  title: string;
  artist: string | null;
  audio_url: string | null;
  cover_url: string | null;
  video_url: string | null;
  lyrics_indigenous: string | null;
  lyrics_pt: string | null;
  description: string | null;
  ambient_videos: { video_url: string | null } | null;
};

function useSongs() {
  return useQuery({
    queryKey: ["songs", "infantil"],
    staleTime: 1000 * 60 * 30,
    queryFn: async () => {
      const { data } = await supabase
        .from("songs")
        .select(
          "id,title,artist,audio_url,cover_url,video_url,lyrics_indigenous,lyrics_pt,description,ambient_videos(video_url)",
        )
        .eq("is_active", true)
        .order("order_index");
      return (data ?? []) as unknown as Song[];
    },
  });
}


function CanticosInfantilPage() {
  const { data: songs = [], isLoading } = useSongs();
  const [openId, setOpenId] = useState<string | null>(null);


  const emojis = ["🌈", "🦜", "🌻", "🐢", "🌿", "🥁", "🌊", "🔥", "⭐", "🌸", "🦋", "🌳", "🐒", "🎶"];
  // Playful 3D-ish palettes (top highlight → deep base) + accent ring + confetti emoji
  const cardStyles = [
    { grad: "from-rose-200 via-pink-300 to-fuchsia-500", ring: "ring-fuchsia-300", tag: "🎀" },
    { grad: "from-amber-200 via-orange-300 to-red-500", ring: "ring-orange-300", tag: "🔥" },
    { grad: "from-lime-200 via-emerald-300 to-teal-600", ring: "ring-emerald-300", tag: "🌿" },
    { grad: "from-sky-200 via-cyan-300 to-blue-600", ring: "ring-cyan-300", tag: "🌊" },
    { grad: "from-violet-200 via-purple-300 to-indigo-600", ring: "ring-violet-300", tag: "⭐" },
    { grad: "from-yellow-200 via-amber-300 to-orange-500", ring: "ring-yellow-300", tag: "☀️" },
  ];


  return (
    <div
      className="min-h-screen text-foreground"
      style={{
        backgroundImage: `url(${canticosBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundAttachment: "fixed",
      }}
    >
      <SiteHeader mode="infantil" />

      <main className="mx-auto max-w-4xl px-4 pb-16 md:px-8">
        <div className="mt-4 flex items-center justify-between">
          <Link
            to="/infantil"
            className="inline-flex items-center gap-1 rounded-full bg-white/70 px-3 py-1.5 text-sm font-bold text-emerald-900 ring-2 ring-emerald-300 active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
        </div>

        <header className="mt-4 rounded-[2.5rem] border-4 border-rose-300 bg-gradient-to-b from-white/90 to-rose-100/80 p-5 text-center shadow-[0_10px_0_-2px_rgba(244,114,182,0.55),0_20px_40px_-10px_rgba(0,0,0,0.3)]">
          <div className="text-5xl drop-shadow-[0_3px_0_rgba(0,0,0,0.15)]">🥁🌿🎶</div>
          <h1 className="mt-2 font-display text-3xl font-black uppercase tracking-wide text-rose-900 drop-shadow-[0_2px_0_rgba(255,255,255,0.9)] md:text-4xl">
            Cântico Infantil
          </h1>
          <p className="mt-1 text-sm font-semibold text-rose-800 md:text-base">
            Ouça, cante junto e aprenda os cânticos do povo Pataxó 🌿🪶
          </p>
        </header>

        {isLoading ? (
          <p className="mt-8 text-center text-emerald-800">Carregando cânticos…</p>
        ) : songs.length === 0 ? (
          <p className="mt-8 text-center text-emerald-800">Nenhum cântico disponível ainda.</p>
        ) : (
          <ul className="mt-6 grid gap-6 sm:grid-cols-2">
            {songs.map((s, i) => {
              const style = cardStyles[i % cardStyles.length];
              const emoji = emojis[i % emojis.length];
              const isOpen = openId === s.id;
              const videoUrl = s.video_url || s.ambient_videos?.video_url || null;
              return (
                <li
                  key={s.id}
                  className={`group relative overflow-hidden rounded-[2.25rem] bg-gradient-to-br ${style.grad} ring-4 ${style.ring} shadow-[0_12px_0_-4px_rgba(0,0,0,0.25),0_25px_40px_-15px_rgba(0,0,0,0.45)] transition-transform hover:-translate-y-1`}
                >
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-[2.25rem] bg-gradient-to-b from-white/60 to-transparent" />
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-2 bg-[repeating-linear-gradient(90deg,#fef3c7_0_10px,#b45309_10px_14px,#fef3c7_14px_24px,#065f46_24px_28px)]" />
                  <span className="absolute right-3 top-4 rotate-12 rounded-full bg-white/90 px-2 py-0.5 text-lg shadow-md ring-2 ring-white">
                    {style.tag}
                  </span>

                  <button
                    type="button"
                    onClick={() => setOpenId(isOpen ? null : s.id)}
                    className="relative flex w-full items-center gap-3 p-4 pt-6 text-left active:scale-[0.98]"
                  >
                    {s.cover_url ? (
                      <img
                        src={s.cover_url}
                        alt=""
                        className="h-20 w-20 shrink-0 rounded-3xl object-cover ring-4 ring-white shadow-[0_6px_0_-2px_rgba(0,0,0,0.2)]"
                      />
                    ) : (
                      <span className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl bg-white text-5xl shadow-[inset_0_-6px_0_rgba(0,0,0,0.1),0_6px_0_-2px_rgba(0,0,0,0.2)] ring-4 ring-white">
                        {emoji}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <h2 className="font-display text-2xl font-black uppercase leading-tight text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.35)]">
                        {s.title}
                      </h2>
                      {s.artist && (
                        <p className="truncate text-xs font-bold uppercase tracking-wide text-white/90 drop-shadow-[0_1px_0_rgba(0,0,0,0.3)]">
                          🪶 {s.artist}
                        </p>
                      )}
                    </div>
                    <ChevronDown
                      className={`h-8 w-8 shrink-0 text-white drop-shadow transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isOpen && (
                    <div className="relative m-3 mt-0 rounded-[1.5rem] border-2 border-white/70 bg-white/90 p-4 shadow-inner">
                      {s.lyrics_indigenous && (
                        <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 p-3 ring-2 ring-emerald-300 shadow-[0_4px_0_-1px_rgba(6,95,70,0.35)]">
                          <h3 className="font-display text-base font-black uppercase text-emerald-900">
                            🌿🪶 Patxôhã
                          </h3>
                          <p className="mt-1 whitespace-pre-line text-base leading-relaxed text-emerald-900">
                            {s.lyrics_indigenous}
                          </p>
                        </div>
                      )}

                      {videoUrl ? (
                        <div className="mt-3 overflow-hidden rounded-2xl ring-4 ring-amber-300 shadow-[0_6px_0_-2px_rgba(180,83,9,0.4)]">
                          <video
                            src={videoUrl}
                            controls
                            playsInline
                            poster={s.cover_url ?? undefined}
                            className="aspect-video w-full bg-black object-cover"
                          />
                        </div>
                      ) : s.audio_url ? (
                        <div className="mt-3 rounded-2xl bg-gradient-to-b from-amber-100 to-amber-200 p-2 ring-2 ring-amber-300 shadow-[0_4px_0_-1px_rgba(180,83,9,0.4)]">
                          <audio controls src={s.audio_url} className="w-full">
                            <track kind="captions" />
                          </audio>
                        </div>
                      ) : null}

                      {s.lyrics_pt && (
                        <div className="mt-3 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 p-3 ring-2 ring-amber-300 shadow-[0_4px_0_-1px_rgba(180,83,9,0.35)]">
                          <h3 className="font-display text-base font-black uppercase text-amber-900">
                            🌈☀️ Português
                          </h3>
                          <p className="mt-1 whitespace-pre-line text-base leading-relaxed text-amber-900">
                            {s.lyrics_pt}
                          </p>
                        </div>
                      )}

                      {!videoUrl && !s.audio_url && !s.lyrics_indigenous && !s.lyrics_pt && (
                        <p className="text-sm text-emerald-800">
                          <Music2 className="mr-1 inline h-4 w-4" />
                          Conteúdo em breve.
                        </p>
                      )}
                    </div>
                  )}

                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2 bg-[repeating-linear-gradient(90deg,#fef3c7_0_10px,#065f46_10px_14px,#fef3c7_14px_24px,#b45309_24px_28px)]" />
                </li>
              );
            })}
          </ul>

        )}
      </main>


      <SiteFooter />
    </div>
  );
}

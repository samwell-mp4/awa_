import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Music2 } from "lucide-react";


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
  lyrics_indigenous: string | null;
  lyrics_pt: string | null;
  description: string | null;
};

function useSongs() {
  return useQuery({
    queryKey: ["songs", "infantil"],
    staleTime: 1000 * 60 * 30,
    queryFn: async () => {
      const { data } = await supabase
        .from("songs")
        .select(
          "id,title,artist,audio_url,cover_url,lyrics_indigenous,lyrics_pt,description",
        )
        .eq("is_active", true)
        .order("order_index");
      return (data ?? []) as Song[];
    },
  });
}

function CanticosInfantilPage() {
  const { data: songs = [], isLoading } = useSongs();

  const emojis = ["🌈", "🦜", "🌻", "🐢", "🌿", "🥁", "🌊", "🔥", "⭐", "🌸", "🦋", "🌳", "🐒", "🎶"];
  const cardColors = [
    "from-pink-100 to-rose-200 ring-rose-300",
    "from-amber-100 to-yellow-200 ring-amber-300",
    "from-emerald-100 to-green-200 ring-emerald-300",
    "from-sky-100 to-blue-200 ring-sky-300",
    "from-violet-100 to-purple-200 ring-violet-300",
    "from-orange-100 to-red-200 ring-orange-300",
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

        <header className="mt-4 rounded-[2rem] border-4 border-rose-300 bg-white/70 p-5 text-center shadow-lg">
          <div className="text-4xl">🥁</div>
          <h1 className="mt-2 font-display text-3xl font-black uppercase tracking-wide text-rose-900 md:text-4xl">
            Cântico Infantil
          </h1>
          <p className="mt-1 text-sm font-semibold text-rose-800 md:text-base">
            Ouça, cante junto e aprenda os cânticos do povo Pataxó 🌿
          </p>
        </header>

        {isLoading ? (
          <p className="mt-8 text-center text-emerald-800">Carregando cânticos…</p>
        ) : songs.length === 0 ? (
          <p className="mt-8 text-center text-emerald-800">Nenhum cântico disponível ainda.</p>
        ) : (
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {songs.map((s) => {
              const open = openId === s.id;
              return (
                <li
                  key={s.id}
                  className="overflow-hidden rounded-3xl bg-gradient-to-br from-red-100 to-rose-200 ring-4 ring-rose-300"
                >
                  <button
                    onClick={() => setOpenId(open ? null : s.id)}
                    className="flex w-full items-center gap-3 p-4 text-left active:scale-[0.98]"
                  >
                    {s.cover_url ? (
                      <img
                        src={s.cover_url}
                        alt=""
                        className="h-16 w-16 rounded-2xl object-cover ring-2 ring-white"
                      />
                    ) : (
                      <span className="grid h-16 w-16 place-items-center rounded-2xl bg-white text-3xl shadow-inner">
                        🎶
                      </span>
                    )}
                    <span className="flex-1">
                      <span className="block font-display text-lg font-black uppercase text-rose-900">
                        {s.title}
                      </span>
                      {s.artist && (
                        <span className="block text-xs font-semibold text-rose-800">
                          {s.artist}
                        </span>
                      )}
                    </span>
                    <Play className="h-6 w-6 text-rose-700" />
                  </button>

                  {open && (
                    <div className="border-t-2 border-rose-300/60 bg-white/70 p-4">
                      {s.audio_url && (
                        <audio controls src={s.audio_url} className="w-full">
                          <track kind="captions" />
                        </audio>
                      )}
                      {s.lyrics_indigenous && (
                        <div className="mt-3">
                          <h3 className="font-display text-sm font-black uppercase text-emerald-900">
                            Letra (Patxohã)
                          </h3>
                          <p className="mt-1 whitespace-pre-line text-sm text-emerald-900">
                            {s.lyrics_indigenous}
                          </p>
                        </div>
                      )}
                      {s.lyrics_pt && (
                        <div className="mt-3">
                          <h3 className="font-display text-sm font-black uppercase text-emerald-900">
                            Tradução (Português)
                          </h3>
                          <p className="mt-1 whitespace-pre-line text-sm text-emerald-900/90">
                            {s.lyrics_pt}
                          </p>
                        </div>
                      )}
                      {!s.audio_url && !s.lyrics_indigenous && !s.lyrics_pt && (
                        <p className="text-sm text-emerald-800">
                          <Music2 className="mr-1 inline h-4 w-4" />
                          Conteúdo em breve.
                        </p>
                      )}
                    </div>
                  )}
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

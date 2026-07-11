import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Music2 } from "lucide-react";

import { SiteFooter } from "@/components/home/site-footer";
import { supabase } from "@/integrations/supabase/client";
import canticosBgAsset from "@/assets/canticos-bg-3d.jpg.asset.json";
import canticosBgVideoAsset from "@/assets/canticos-bg-video.mp4.asset.json";

const canticosBg = canticosBgAsset.url;
const canticosBgVideo = canticosBgVideoAsset.url;

export const Route = createFileRoute("/canticos")({
  head: () => ({
    meta: [
      { title: "Cânticos Pataxó — AWÃ TECH" },
      {
        name: "description",
        content: "Cânticos do povo Pataxó — assista aos vídeos com letra em Patxôhã e português.",
      },
      { property: "og:title", content: "Cânticos Pataxó — AWÃ TECH" },
      {
        property: "og:description",
        content: "Cânticos Pataxó em vídeo com letras em Patxôhã e português.",
      },
    ],
  }),
  component: CanticosPage,
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
    queryKey: ["songs", "canticos"],
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

function CanticosPage() {
  const { data: songs = [], isLoading } = useSongs();

  return (
    <div className="relative min-h-screen text-foreground overflow-hidden">
      <video
        src={canticosBgVideo}
        poster={canticosBg}
        autoPlay
        muted
        loop
        playsInline
        className="fixed inset-0 -z-10 h-full w-full object-cover"
      />
      <div
        className="fixed inset-0 -z-10"
        style={{
          background:
            "linear-gradient(oklch(0.18 0.04 145 / 0.75), oklch(0.14 0.03 145 / 0.9))",
        }}
      />
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[oklch(0.18_0.04_145/0.7)] border-b border-gold/20">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 md:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-gold/30 px-3 py-1.5 text-sm text-cream hover:bg-gold/10"
          >
            <ArrowLeft className="h-4 w-4" /> Início
          </Link>
          <h1 className="font-display text-lg font-black text-cream flex-1">Cânticos Pataxó</h1>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 md:px-8">
        <p className="mb-6 max-w-2xl text-sm text-foreground/70">
          Assista aos cânticos do povo Pataxó. Cada cântico traz a letra em Patxôhã e a tradução em
          português.
        </p>

        {isLoading ? (
          <p className="text-center text-sm text-foreground/70">Carregando cânticos…</p>
        ) : songs.length === 0 ? (
          <p className="text-center text-sm text-foreground/70">Nenhum cântico disponível ainda.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {songs.map((s) => {
              const videoUrl = s.video_url || s.ambient_videos?.video_url || null;
              return (
                <article
                  key={s.id}
                  className="group overflow-hidden rounded-2xl border border-gold/25 bg-card/50 backdrop-blur transition hover:border-gold/50"
                >
                  <div className="relative aspect-video bg-black">
                    {videoUrl ? (
                      <video
                        src={videoUrl}
                        controls
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        poster={s.cover_url ?? undefined}
                        className="h-full w-full object-cover"
                      />
                    ) : s.cover_url ? (
                      <img
                        src={s.cover_url}
                        alt={s.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-gold/60">
                        <Music2 className="h-10 w-10" />
                      </div>
                    )}
                  </div>

                  <div className="p-4 space-y-3">
                    <div>
                      <h2 className="font-display text-base font-black text-cream">{s.title}</h2>
                      {s.artist && <p className="text-xs text-gold/90 italic">{s.artist}</p>}
                    </div>

                    {s.audio_url && (
                      <audio controls src={s.audio_url} className="w-full">
                        <track kind="captions" />
                      </audio>
                    )}

                    {s.lyrics_indigenous && (
                      <div>
                        <h3 className="mb-1 text-[10px] uppercase tracking-wider text-gold/80">
                          Patxôhã
                        </h3>
                        <p className="whitespace-pre-line text-sm leading-relaxed text-cream">
                          {s.lyrics_indigenous}
                        </p>
                      </div>
                    )}

                    {s.lyrics_pt && (
                      <div>
                        <h3 className="mb-1 text-[10px] uppercase tracking-wider text-gold/80">
                          Português
                        </h3>
                        <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/80">
                          {s.lyrics_pt}
                        </p>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

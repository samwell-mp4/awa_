import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Music2, ChevronDown } from "lucide-react";
import { useState } from "react";

import { SiteFooter } from "@/components/home/site-footer";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/canticos")({
  head: () => ({
    meta: [
      { title: "Cânticos Pataxó — AWÃ TECH" },
      {
        name: "description",
        content: "Cânticos do povo Pataxó — ouça, assista e leia a letra em Patxôhã e português.",
      },
      { property: "og:title", content: "Cânticos Pataxó — AWÃ TECH" },
      {
        property: "og:description",
        content: "Cânticos Pataxó com áudio, vídeo e letras em Patxôhã e português.",
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
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="min-h-screen text-foreground">
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
          Ouça e assista aos cânticos do povo Pataxó. Toque em um cântico para ver a letra em
          Patxôhã, o vídeo e a tradução em português.
        </p>

        {isLoading ? (
          <p className="text-center text-sm text-foreground/70">Carregando cânticos…</p>
        ) : songs.length === 0 ? (
          <p className="text-center text-sm text-foreground/70">Nenhum cântico disponível ainda.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {songs.map((s) => {
              const isOpen = openId === s.id;
              const videoUrl = s.video_url || s.ambient_videos?.video_url || null;
              return (
                <article
                  key={s.id}
                  className="group overflow-hidden rounded-2xl border border-gold/25 bg-card/50 backdrop-blur transition hover:border-gold/50"
                >
                  <button
                    type="button"
                    onClick={() => setOpenId(isOpen ? null : s.id)}
                    className="flex w-full items-center gap-3 p-4 text-left"
                  >
                    {s.cover_url ? (
                      <img
                        src={s.cover_url}
                        alt=""
                        className="h-14 w-14 shrink-0 rounded-xl object-cover ring-1 ring-gold/30"
                      />
                    ) : (
                      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-gold/10 text-gold ring-1 ring-gold/30">
                        <Music2 className="h-6 w-6" />
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <h2 className="font-display text-base font-black text-cream truncate">
                        {s.title}
                      </h2>
                      {s.artist && (
                        <p className="truncate text-xs text-gold/80">{s.artist}</p>
                      )}
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-gold transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isOpen && (
                    <div className="border-t border-gold/20 p-4 space-y-4">
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

                      {videoUrl ? (
                        <div className="overflow-hidden rounded-xl border border-gold/25 bg-black">
                          <video
                            src={videoUrl}
                            controls
                            playsInline
                            preload="metadata"
                            poster={s.cover_url ?? undefined}
                            className="aspect-video w-full object-cover"
                          />
                        </div>
                      ) : s.audio_url ? (
                        <audio controls src={s.audio_url} className="w-full">
                          <track kind="captions" />
                        </audio>
                      ) : null}

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

                      {!videoUrl && !s.audio_url && !s.lyrics_indigenous && !s.lyrics_pt && (
                        <p className="text-sm text-foreground/70">
                          <Music2 className="mr-1 inline h-4 w-4" />
                          Conteúdo em breve.
                        </p>
                      )}
                    </div>
                  )}
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

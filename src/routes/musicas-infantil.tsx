import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Play, Pause } from "lucide-react";
import { requireArea } from "@/lib/area-guard";
import { supabase } from "@/integrations/supabase/client";
import { stopSpeak } from "@/lib/speak";
import { setLastArea } from "@/lib/last-area";
import { KidsPage, KidsCard } from "@/components/kids/kids-page";
import { type MiniPlayerSong as Song } from "@/components/kids/MiniPlayer";
import { KidsSongPlayer } from "@/components/kids/KidsSongPlayer";

export const Route = createFileRoute("/musicas-infantil")({
  ssr: false,
  beforeLoad: () => requireArea("infantil"),
  head: () => ({
    meta: [
      { title: "Cantigas da Aldeia — Awã Tech Infantil" },
      {
        name: "description",
        content:
          "Cantigas indígenas para crianças cantarem junto, com a letra em Patxôhã e em português lado a lado.",
      },
      { property: "og:title", content: "Cantigas da Aldeia — Awã Tech Infantil" },
      {
        property: "og:description",
        content: "Toque numa cantiga e cante junto com a aldeia em Patxôhã.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MusicasInfantilPage,
});

const EMOJIS = ["🥁", "🪶", "🦜", "🐢", "🔥", "🌙", "🐟", "☀️", "🌳", "🐸"];

export function MusicasInfantilPage() {
  useEffect(() => setLastArea("/infantil"), []);
  const [playing, setPlaying] = useState<Song | null>(null);

  const { data: songs = [], isLoading } = useQuery({
    queryKey: ["songs_infantil"],
    staleTime: 1000 * 60 * 30,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("songs")
        .select(
          "id,title,artist,audio_url,cover_url,language,lyrics_indigenous,lyrics_pt,lyrics_pt_en,lyrics_pt_es,duration_seconds,sync_offsets",
        )
        .eq("is_active", true)
        .order("order_index")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any as Song[];
    },
  });

  return (
    <KidsPage title="Cantigas" subtitle="Toque para cantar junto" emoji="🎶">
      {isLoading ? (
        <div className="grid gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-[1.5rem] bg-white/15" />
          ))}
        </div>
      ) : songs.length === 0 ? (
        <KidsCard className="p-6 text-center font-black">
          Em breve novas cantigas 🌱
        </KidsCard>
      ) : (
        <ul className="grid gap-3">
          {songs.map((s, i) => {
            const active = playing?.id === s.id;
            return (
              <li key={s.id}>
                <button
                  onClick={() => {
                    stopSpeak();
                    setPlaying(active ? null : s);
                  }}
                  className="flex w-full items-center gap-3 rounded-[1.5rem] border-[5px] border-[#e9c46a] bg-[#fdfcf0] p-3 text-left text-[#123a2b] shadow-[0_10px_0_-4px_rgba(0,0,0,.35)] transition-transform active:translate-y-1 active:shadow-none"
                >
                  <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[#14503c] text-3xl">
                    {active ? (
                      <Pause className="h-7 w-7 fill-[#ffe9b8] text-[#ffe9b8]" />
                    ) : (
                      <span aria-hidden>{EMOJIS[i % EMOJIS.length]}</span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-xl leading-tight">
                      {s.title}
                    </span>
                    <span className="block text-xs font-bold text-[#3f6b57]">
                      {s.artist || s.language || "Patxôhã"}
                    </span>
                  </span>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#e76f51] text-white">
                    {active ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current" />}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {playing && <KidsSongPlayer song={playing} onClose={() => setPlaying(null)} />}
    </KidsPage>
  );
}

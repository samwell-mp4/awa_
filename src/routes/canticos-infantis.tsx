import { createFileRoute } from "@tanstack/react-router";
import { SongHeader } from "@/components/kids/canticos/SongHeader";
import { SongPlayer } from "@/components/kids/canticos/SongPlayer";
import { SONGS } from "@/components/kids/canticos/songs-data";
import { requireArea } from "@/lib/area-guard";

export const Route = createFileRoute("/canticos-infantis")({
  ssr: false,
  beforeLoad: () => requireArea("infantil"),
  head: () => ({
    meta: [
      { title: "Cânticos Infantis Pataxó — Awã Tech" },
      { name: "description", content: "Cantigas infantis em Patxôhã e Português." },
    ],
  }),
  component: CanticosInfantisPage,
});

function CanticosInfantisPage() {
  const currentSong = SONGS[0];

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#d4edc9] to-[#fef3d8] pb-12">
      <SongHeader />
      <main>
        <SongPlayer song={currentSong} />
      </main>
    </div>
  );
}

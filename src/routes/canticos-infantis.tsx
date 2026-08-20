import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { requireArea } from "@/lib/area-guard";
import { CANTICOS_DATA, type KidSong } from "@/components/kids/canticos/songs-data";
import { SongHeader } from "@/components/kids/canticos/SongHeader";
import { SongPlayer } from "@/components/kids/canticos/SongPlayer";
import { LyricColumns } from "@/components/kids/canticos/LyricColumns";
import { SongList } from "@/components/kids/canticos/SongList";

export const Route = createFileRoute("/canticos-infantis")({
  ssr: false,
  beforeLoad: () => requireArea("infantil"),
  head: () => ({
    meta: [
      { title: "🎵 Cânticos Infantis Pataxó 🎵 — Awã Tech" },
      {
        name: "description",
        content: "Aprenda cantigas ancestrais do povo Pataxó com áudio sincronizado e letras bilíngues.",
      },
      { property: "og:title", content: "🎵 Cânticos Infantis Pataxó 🎵" },
      {
        property: "og:description",
        content: "Uma sala musical infantil para aprender Pataxó brincando.",
      },
    ],
  }),
  component: CanticosInfantisPage,
});

function CanticosInfantisPage() {
  const [currentSong, setCurrentSong] = useState<KidSong>(CANTICOS_DATA[0]);
  const [currentTime, setCurrentTime] = useState(0);

  // Reset time when song changes
  useEffect(() => {
    setCurrentTime(0);
  }, [currentSong.id]);

  return (
    <div className="kids-theme min-h-screen pb-20 text-emerald-950">
      {/* Background illustrations - Forest feel */}
      <div className="fixed inset-0 pointer-events-none opacity-20 overflow-hidden z-0">
        <span className="absolute top-40 left-10 text-9xl animate-bounce" style={{ animationDuration: '4s' }}>🦜</span>
        <span className="absolute top-20 right-20 text-8xl animate-pulse">🌳</span>
        <span className="absolute bottom-40 right-10 text-9xl animate-bounce" style={{ animationDuration: '5s' }}>🐢</span>
        <span className="absolute bottom-20 left-20 text-8xl animate-pulse" style={{ animationDelay: '1s' }}>🌿</span>
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20rem] opacity-10">🥁</span>
      </div>

      <SongHeader songTitle={currentSong.title} />

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 pt-8">
        
        {/* Lyrics Area - Digital Indigenous Book feel */}
        <section className="relative">
          <LyricColumns lyrics={currentSong.lyrics} currentTime={currentTime} />
          
          {/* Wooden/Bamboo side borders for book feel on larger screens */}
          <div className="hidden lg:block absolute -left-6 top-10 bottom-10 w-8 bg-[#5b3a24] rounded-full border-r-4 border-white/20 shadow-lg" />
          <div className="hidden lg:block absolute -right-6 top-10 bottom-10 w-8 bg-[#5b3a24] rounded-full border-l-4 border-white/20 shadow-lg" />
        </section>

        {/* Player Controls */}
        <SongPlayer 
          audioUrl={currentSong.audio} 
          onTimeUpdate={(t) => setCurrentTime(t)}
          onDurationChange={() => {}}
          onEnded={() => {}}
        />

        {/* Info Area */}
        <section className="kids-card mx-auto max-w-2xl bg-amber-50/90 p-6 text-center shadow-md">
          <div className="mb-2 flex justify-center gap-1 text-2xl text-amber-500">✨✨✨</div>
          <h4 className="font-display text-lg font-black uppercase text-emerald-900">Sabedoria da Aldeia</h4>
          <p className="mt-2 text-sm font-bold text-emerald-800/80 leading-relaxed italic">
            "{currentSong.culturalInfo}"
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-4 text-[10px] font-black uppercase tracking-widest text-emerald-900/50">
            <span>Autor: {currentSong.author}</span>
            <span>Créditos: {currentSong.credits}</span>
            <span>Autorizado por: {currentSong.authorizedBy}</span>
          </div>
        </section>

        {/* Discovery List */}
        <SongList 
          songs={CANTICOS_DATA} 
          currentSongId={currentSong.id} 
          onSelect={setCurrentSong} 
        />
      </main>

      {/* Footer message */}
      <footer className="mt-12 text-center text-xs font-black uppercase tracking-[0.2em] text-emerald-900/40 pb-10">
        Awã Tech Infantil — Preservando a Voz dos Ancestrais
      </footer>
    </div>
  );
}

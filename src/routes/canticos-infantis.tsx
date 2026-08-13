import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SongHeader } from "@/components/kids/canticos/SongHeader";
import { SongPlayer } from "@/components/kids/canticos/SongPlayer";
import { LyricColumns } from "@/components/kids/canticos/LyricColumns";
import { songsData } from "@/components/kids/canticos/songs-data";
import { setLastArea } from "@/lib/last-area";
import bgNatureza from "@/assets/infantil-categorias-bg.jpg.asset.json";

export const Route = createFileRoute("/canticos-infantis")({
  component: CanticosInfantisPage,
});

function CanticosInfantisPage() {
  useEffect(() => {
    setLastArea("/infantil");
  }, []);

  const [currentSong] = useState(songsData[0]);

  return (
    <div 
      className="kids-theme min-h-screen bg-cover bg-center bg-no-repeat flex flex-col"
      style={{ backgroundImage: `url(${bgNatureza.url})` }}
    >
      <SongHeader />
      
      <main className="flex-1 flex flex-col items-center py-6 px-4">
        {/* Border Decorativa superior */}
        <div className="w-full h-4 bg-repeat-x mb-8 opacity-60" style={{ backgroundImage: 'radial-gradient(circle, #5D3A1A 2px, transparent 2px)', backgroundSize: '20px 20px' }} />

        <SongPlayer title={currentSong.title} />

        <div className="w-full max-w-6xl mt-8 bg-white/40 backdrop-blur-md rounded-[3rem] border-4 border-[#8B5E34]/30 shadow-2xl relative overflow-hidden">
          {/* Divisor Tribal central */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-[#5D3A1A]/20 hidden md:block" />
          
          <LyricColumns lines={currentSong.lines} />
          
          {/* Ilustrações de personagens seriam adicionadas aqui com Absolute positioning */}
          {/* Ex: <img src="/kids-boy.png" className="absolute bottom-0 right-0 w-48" /> */}
        </div>
      </main>

      {/* Border Decorativa inferior */}
      <div className="w-full h-6 bg-[#3D2510] relative">
        <div className="absolute inset-x-0 -top-4 h-4 bg-repeat-x" style={{ backgroundImage: 'linear-gradient(45deg, #3D2510 25%, transparent 25%, transparent 75%, #3D2510 75%, #3D2510), linear-gradient(45deg, #3D2510 25%, transparent 25%, transparent 75%, #3D2510 75%, #3D2510)', backgroundSize: '30px 30px', backgroundPosition: '0 0, 15px 15px' }} />
      </div>
    </div>
  );
}

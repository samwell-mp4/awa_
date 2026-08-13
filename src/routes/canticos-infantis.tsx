import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Home } from "lucide-react";
import { SongHeader } from "@/components/kids/canticos/SongHeader";
import { SongPlayer } from "@/components/kids/canticos/SongPlayer";
import { LyricColumns } from "@/components/kids/canticos/LyricColumns";
import { SONGS } from "@/components/kids/canticos/songs-data";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { setLastArea } from "@/lib/last-area";

import categoriasBg from "@/assets/infantil-categorias-bg.jpg.asset.json";

export const Route = createFileRoute("/canticos-infantis")({
  component: CanticosInfantis,
});

function CanticosInfantis() {
  const { t } = useTranslation();
  const currentSong = SONGS[0];

  useEffect(() => {
    setLastArea("/infantil");
  }, []);

  return (
    <div className="kids-theme min-h-screen bg-[#FDF8F1] relative overflow-hidden">
      {/* Background Decor */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ backgroundImage: `url(${categoriasBg.url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      />
      
      {/* Sun Icon */}
      <div className="absolute top-10 right-10 w-24 h-24 text-amber-400 opacity-20 pointer-events-none">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      </div>

      <header className="relative z-20 flex items-center justify-between p-4 bg-[#8B4513]/10 backdrop-blur-sm">
        <div className="flex gap-2">
          <Link to="/infantil" className="p-3 bg-white rounded-full shadow-md text-[#8B4513] hover:scale-110 transition active:scale-95">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <Link to="/" className="p-3 bg-white rounded-full shadow-md text-[#8B4513] hover:scale-110 transition active:scale-95">
            <Home className="w-6 h-6" />
          </Link>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-amber-500 overflow-hidden shadow-md">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=pataxo-boy" alt="Avatar" />
          </div>
          <div className="hidden sm:block">
            <div className="text-xs font-black text-[#8B4513] uppercase tracking-tighter">Awã Mirim</div>
            <div className="flex items-center gap-1 text-sm font-black text-amber-600">
              <span>125</span>
              <span>⭐</span>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-20 container mx-auto px-4 py-8">
        <SongHeader title="Cânticos Infantis Pataxó" />
        
        <div className="relative mt-12 bg-white/60 backdrop-blur-md rounded-[3rem] border-8 border-[#8B4513]/20 p-8 shadow-2xl">
          <SongPlayer />
          
          <div className="flex flex-col md:flex-row items-start justify-between">
            {/* Character Left */}
            <div className="hidden lg:block w-48 mt-12">
              <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=pataxo-girl&facialHairProbability=0" 
                className="w-full h-auto drop-shadow-xl" 
                alt="Curumin" 
              />
            </div>

            <div className="flex-1">
              <LyricColumns 
                patxohaLines={currentSong.lyrics.patxoha}
                portuguesLines={currentSong.lyrics.portugues}
              />
            </div>

            {/* Character Right */}
            <div className="hidden lg:block w-48 mt-12">
              <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=pataxo-boy-2" 
                className="w-full h-auto drop-shadow-xl scale-x-[-1]" 
                alt="Curumin" 
              />
            </div>
          </div>
        </div>
      </main>

      {/* Decorative Border Bottom */}
      <div className="fixed bottom-0 left-0 right-0 h-4 bg-repeat-x z-30" 
           style={{ backgroundImage: 'linear-gradient(45deg, #8B4513 25%, transparent 25%, transparent 75%, #8B4513 75%, #8B4513), linear-gradient(45deg, #8B4513 25%, transparent 25%, transparent 75%, #8B4513 75%, #8B4513)', backgroundSize: '40px 40px', backgroundPosition: '0 0, 20px 20px' }} />
    </div>
  );
}

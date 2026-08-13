import { Link } from "@tanstack/react-router";
import { ArrowLeft, Home } from "lucide-react";

export function SongHeader() {
  return (
    <header className="flex items-center justify-between bg-gradient-to-b from-[#8B4513] to-[#653210] p-4 border-b-4 border-[#B8860B] shadow-lg">
      <div className="flex gap-3">
        <Link 
          to="/infantil" 
          className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#8B4513] bg-[#DEB887] text-[#8B4513] shadow-md transition active:scale-95"
        >
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <Link 
          to="/" 
          className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#8B4513] bg-[#DEB887] text-[#8B4513] shadow-md transition active:scale-95"
        >
          <Home className="h-6 w-6" />
        </Link>
      </div>
      
      <div className="flex-1 text-center mx-4">
        <div className="inline-block rounded-lg border-2 border-[#FFD700] bg-[#8B4513] px-4 py-2 text-sm font-bold tracking-widest text-[#FFD700] shadow-inner">
          AWÃ TECH • AWÃ MIRIM ⭐ 125
        </div>
      </div>
      
      <div className="w-24 hidden md:block"></div>
    </header>
  );
}

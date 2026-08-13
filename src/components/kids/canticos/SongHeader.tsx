import { ArrowLeft, Home } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function SongHeader() {
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-[#5D3A1A]/80 backdrop-blur-sm border-b-2 border-[#8B5E34]">
      <div className="flex gap-2">
        <Link to="/infantil" className="p-2 rounded-full bg-[#8B5E34] text-white shadow-md hover:bg-[#A67C52] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <Link to="/" className="p-2 rounded-full bg-[#8B5E34] text-white shadow-md hover:bg-[#A67C52] transition-colors">
          <Home className="w-5 h-5" />
        </Link>
      </div>
      
      <div className="flex items-center gap-2">
        <img src="/logo-awa-tech.png" alt="AWÃ TECH" className="h-8" />
        <div className="hidden sm:block text-[10px] text-white/80 font-bold uppercase tracking-widest leading-tight">
          Línguas Indígenas,<br />Culturas Vivas
        </div>
      </div>

      <div className="flex items-center gap-2 bg-[#3D2510] px-3 py-1 rounded-lg border border-white/20">
        <img src="/avatar-kids.png" alt="User" className="w-8 h-8 rounded-full border border-white/40" />
        <div className="text-right">
          <div className="text-[10px] text-white/70 font-bold leading-none">AWÃ MIRIM</div>
          <div className="text-xs text-amber-400 font-black flex items-center gap-1">
            125 <span className="text-[10px]">⭐</span>
          </div>
        </div>
      </div>
    </header>
  );
}

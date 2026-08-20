import { useTranslation } from "react-i18next";
import { Logo } from "@/components/home/logo";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Home } from "lucide-react";

export function SongHeader({ songTitle }: { songTitle?: string }) {
  const { t } = useTranslation();
  
  return (
    <header className="relative z-20 flex flex-col items-center px-4 py-6 text-center">
      {/* Back & Home floating buttons */}
      <div className="absolute left-4 top-6 flex gap-2">
        <button 
          onClick={() => window.history.back()}
          className="grid h-12 w-12 place-items-center rounded-2xl border-4 border-white bg-white text-rose-500 shadow-[0_6px_0_rgba(0,0,0,0.15)] transition-transform active:translate-y-0.5 active:shadow-none"
        >
          <ArrowLeft className="h-7 w-7" strokeWidth={3} />
        </button>
        <Link 
          to="/infantil"
          className="grid h-12 w-12 place-items-center rounded-2xl border-4 border-white bg-white text-emerald-600 shadow-[0_6px_0_rgba(0,0,0,0.15)] transition-transform active:translate-y-0.5 active:shadow-none"
        >
          <Home className="h-7 w-7" strokeWidth={3} />
        </Link>
      </div>

      <div className="mb-2 scale-90 md:scale-100">
        <Logo />
      </div>
      
      <div className="mt-4 space-y-1">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-900/60">
          Línguas Indígenas, Culturas Vivas
        </p>
        <h1 className="kids-title text-3xl md:text-5xl lg:text-6xl drop-shadow-sm">
          {songTitle ? `🎵 ${songTitle} 🎵` : "🎵 Cânticos Infantis Pataxó 🎵"}
        </h1>
      </div>

      {/* Tribal bamboo-style separator */}
      <div className="mt-6 h-4 w-full max-w-2xl rounded-full border-4 border-white bg-[#8B4513] opacity-80 shadow-sm" 
           style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.1) 40px, rgba(255,255,255,0.1) 44px)' }} 
      />
    </header>
  );
}

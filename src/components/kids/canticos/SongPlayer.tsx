import { Play, Pause, SkipBack, SkipForward, Volume2, RotateCcw } from "lucide-react";
import { useState } from "react";

export function SongPlayer({ title }: { title: string }) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="flex flex-col items-center gap-4 py-4 px-6 bg-[#3D2510]/60 rounded-3xl border-2 border-white/10 shadow-2xl backdrop-blur-md">
      <div className="bg-[#8B5E34] px-8 py-2 rounded-full border-2 border-[#5D3A1A] shadow-lg transform -translate-y-8">
        <h1 className="text-white font-display text-xl md:text-2xl font-black flex items-center gap-3">
          🎵 {title} 🎵
        </h1>
      </div>

      <div className="flex items-center gap-6 md:gap-10 -mt-4">
        <button className="text-white/80 hover:text-white transition-colors">
          <SkipBack className="w-8 h-8" />
        </button>
        
        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-20 h-20 rounded-full bg-amber-500 border-4 border-white shadow-2xl flex items-center justify-center text-emerald-900 transition-transform active:scale-95"
        >
          {isPlaying ? (
            <div className="flex flex-col items-center">
              <Pause className="w-10 h-10 fill-current" />
              <span className="text-[10px] font-black uppercase tracking-tighter">Pausar</span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Play className="w-10 h-10 fill-current ml-1" />
              <span className="text-[10px] font-black uppercase tracking-tighter">Reproduzir</span>
            </div>
          )}
        </button>

        <button className="text-white/80 hover:text-white transition-colors">
          <SkipForward className="w-8 h-8" />
        </button>
      </div>

      <div className="flex items-center gap-4 w-full max-w-xs mt-2">
        <Volume2 className="w-5 h-5 text-amber-400" />
        <div className="h-2 flex-1 bg-white/20 rounded-full overflow-hidden border border-white/10">
          <div className="h-full w-2/3 bg-amber-400 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
        </div>
        <button className="text-amber-400 hover:text-amber-300 transition-colors">
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

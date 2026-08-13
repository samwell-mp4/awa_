import { speak } from "@/lib/speak";
import { Volume2, Mic2 } from "lucide-react";
import { Song } from "./songs-data";

interface LyricColumnsProps {
  title: string;
  lyrics: string;
  variant: "esq" | "dir";
  song: Song;
}

export function LyricColumns({ title, lyrics, variant, song }: LyricColumnsProps) {
  const isEsq = variant === "esq";
  
  const handleOuvir = () => {
    speak(lyrics, isEsq ? "pt-BR" : "pt-BR");
  };

  const handleCantar = () => {
    speak(`Vamos cantar juntos: ${song.title}`, "pt-BR");
  };

  return (
    <div 
      className={`flex-1 rounded-2xl border-4 p-6 shadow-inner ${
        isEsq 
          ? "border-[#2F4F2F] bg-[#e8f5e0]" 
          : "border-[#8B4513] bg-[#fff8e8]"
      }`}
    >
      <div className={`mb-4 text-center text-xl font-black uppercase tracking-widest ${
        isEsq ? "text-[#2F4F2F]" : "text-[#8B4513]"
      }`}>
        ◆ {title} ◆
      </div>

      <div className={`whitespace-pre-line text-center font-display text-lg font-bold leading-relaxed mb-8 ${
        isEsq ? "text-[#1a3d1a]" : "text-[#5C2E09]"
      }`}>
        {lyrics}
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <button 
          onClick={handleOuvir}
          className={`flex items-center gap-2 rounded-full px-6 py-2 font-black shadow-md transition active:scale-95 ${
            isEsq ? "bg-[#32CD32] text-black" : "bg-[#FF8C00] text-white"
          }`}
        >
          <Volume2 className="h-5 w-5" /> OUVIR
        </button>
        <button 
          onClick={handleCantar}
          className={`flex items-center gap-2 rounded-full px-6 py-2 font-black shadow-md transition active:scale-95 ${
            isEsq ? "bg-[#2F4F2F] text-white" : "bg-[#8B4513] text-[#FFD700]"
          }`}
        >
          <Mic2 className="h-5 w-5" /> CANTAR JUNTO
        </button>
      </div>
    </div>
  );
}

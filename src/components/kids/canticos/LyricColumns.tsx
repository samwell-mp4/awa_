import { speak } from "@/lib/speak";
import { Volume2, Music } from "lucide-react";

type Line = { pat: string; pt: string };

export function LyricColumns({ lines }: { lines: Line[] }) {
  const handleSpeak = (text: string) => {
    void speak(text);
  };

  return (
    <div className="grid md:grid-cols-2 gap-8 w-full max-w-5xl mx-auto px-4 py-8">
      {/* Coluna Pataxó */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-center gap-3 border-b-2 border-emerald-800/30 pb-2">
          <div className="w-2 h-2 rotate-45 bg-emerald-800" />
          <h2 className="text-emerald-900 font-display text-2xl font-black uppercase tracking-widest">Pataxó</h2>
          <div className="w-2 h-2 rotate-45 bg-emerald-800" />
        </div>
        
        <div className="space-y-3">
          {lines.map((line, i) => (
            <div key={i} className="text-center">
              <p className="text-emerald-900 font-display text-xl font-black leading-tight drop-shadow-sm">
                {line.pat}
              </p>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-4 mt-4">
          <button 
            onClick={() => handleSpeak(lines.map(l => l.pat).join(". "))}
            className="flex items-center gap-2 bg-emerald-800 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-black uppercase text-xs transition-transform active:scale-95 shadow-md"
          >
            <Volume2 className="w-4 h-4" /> 🔊 OUVIRE
          </button>
          <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl font-black uppercase text-xs transition-transform active:scale-95 shadow-md">
            <Music className="w-4 h-4" /> 🎵 CANTAR JUNTO
          </button>
        </div>
      </div>

      {/* Coluna Português */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-center gap-3 border-b-2 border-orange-800/30 pb-2">
          <div className="w-2 h-2 rotate-45 bg-orange-800" />
          <h2 className="text-orange-900 font-display text-2xl font-black uppercase tracking-widest">Português</h2>
          <div className="w-2 h-2 rotate-45 bg-orange-800" />
        </div>

        <div className="space-y-3">
          {lines.map((line, i) => (
            <div key={i} className="text-center">
              <p className="text-orange-900 font-display text-xl font-black leading-tight drop-shadow-sm">
                {line.pt}
              </p>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-4 mt-4">
          <button 
            onClick={() => handleSpeak(lines.map(l => l.pt).join(". "))}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-xl font-black uppercase text-xs transition-transform active:scale-95 shadow-md"
          >
            <Volume2 className="w-4 h-4" /> 🔊 OUVIRE
          </button>
          <button className="flex items-center gap-2 bg-orange-800 hover:bg-orange-700 text-white px-4 py-2 rounded-xl font-black uppercase text-xs transition-transform active:scale-95 shadow-md">
            <Music className="w-4 h-4" /> 🎵 CANTAR JUNTO
          </button>
        </div>
      </div>
    </div>
  );
}

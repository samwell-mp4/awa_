import { speak } from "@/lib/speak";
import { Volume2, Mic } from "lucide-react";

interface LyricColumnsProps {
  patxohaLines: string[];
  portuguesLines: string[];
}

export function LyricColumns({ patxohaLines, portuguesLines }: LyricColumnsProps) {
  const handleHear = (text: string) => speak(text, "pt-BR");
  const handleSing = (text: string) => speak(text, "pt-BR", 0.85); // Slower for singing along

  return (
    <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-0 mt-8 mb-12">
      {/* Divider */}
      <div className="absolute left-1/2 top-0 bottom-0 w-2 hidden md:block bg-repeat-y opacity-30 pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(to bottom, #8B4513 50%, transparent 50%)', backgroundSize: '100% 20px' }} />

      {/* Pataxó Column */}
      <div className="flex flex-col items-center px-4 md:pr-12">
        <h3 className="text-2xl font-black text-[#2f6d3a] mb-6 border-b-4 border-[#2f6d3a]/20 pb-1">Pataxó</h3>
        <div className="space-y-2 text-center mb-8">
          {patxohaLines.map((line, i) => (
            <p key={i} className="text-xl font-bold text-[#603000] cursor-pointer hover:text-emerald-700" onClick={() => handleHear(line)}>{line}</p>
          ))}
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => handleHear(patxohaLines.join(". "))}
            className="flex items-center gap-2 px-4 py-2 bg-[#2f6d3a] text-white rounded-xl font-black text-sm uppercase shadow-md hover:brightness-110 transition active:scale-95"
          >
            <Volume2 className="w-4 h-4" /> OUVIR
          </button>
          <button 
            onClick={() => handleSing(patxohaLines.join(". "))}
            className="flex items-center gap-2 px-4 py-2 bg-[#15803d] text-white rounded-xl font-black text-sm uppercase shadow-md hover:brightness-110 transition active:scale-95"
          >
            <Mic className="w-4 h-4" /> CANTAR JUNTO
          </button>
        </div>
      </div>

      {/* Português Column */}
      <div className="flex flex-col items-center px-4 md:pl-12">
        <h3 className="text-2xl font-black text-[#8B4513] mb-6 border-b-4 border-[#8B4513]/20 pb-1">Português</h3>
        <div className="space-y-2 text-center mb-8">
          {portuguesLines.map((line, i) => (
            <p key={i} className="text-xl font-bold text-[#603000] cursor-pointer hover:text-amber-700" onClick={() => handleHear(line)}>{line}</p>
          ))}
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => handleHear(portuguesLines.join(". "))}
            className="flex items-center gap-2 px-4 py-2 bg-[#d97706] text-white rounded-xl font-black text-sm uppercase shadow-md hover:brightness-110 transition active:scale-95"
          >
            <Volume2 className="w-4 h-4" /> OUVIR
          </button>
          <button 
            onClick={() => handleSing(portuguesLines.join(". "))}
            className="flex items-center gap-2 px-4 py-2 bg-[#b45309] text-white rounded-xl font-black text-sm uppercase shadow-md hover:brightness-110 transition active:scale-95"
          >
            <Mic className="w-4 h-4" /> CANTAR JUNTO
          </button>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useRef } from "react";
import type { LyricLine } from "./songs-data";

interface LyricColumnsProps {
  lyrics: LyricLine[];
  currentTime: number;
}

export function LyricColumns({ lyrics, currentTime }: LyricColumnsProps) {
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Find active line index
  const activeIndex = lyrics.reduce((acc, line, idx) => {
    if (currentTime >= line.time) return idx;
    return acc;
  }, 0);

  useEffect(() => {
    const activeEl = lineRefs.current[activeIndex];
    const container = scrollContainerRef.current;
    if (activeEl && container) {
      const targetScroll = activeEl.offsetTop - container.clientHeight / 2 + activeEl.clientHeight / 2;
      container.scrollTo({
        top: targetScroll,
        behavior: "smooth",
      });
    }
  }, [activeIndex]);

  return (
    <div 
      ref={scrollContainerRef}
      className="kids-card relative z-10 flex max-h-[50vh] min-h-[300px] flex-col overflow-y-auto bg-white/90 p-6 md:p-10 shadow-inner custom-scrollbar"
    >
      {/* Desktop Header */}
      <div className="mb-6 hidden grid-cols-2 gap-8 border-b-4 border-dashed border-emerald-100 pb-4 md:grid">
        <h3 className="text-center font-display text-2xl font-black uppercase tracking-widest text-emerald-900">
          Pataxó
        </h3>
        <h3 className="text-center font-display text-2xl font-black uppercase tracking-widest text-rose-700">
          Português
        </h3>
      </div>

      <div className="space-y-6 md:space-y-8">
        {lyrics.map((line, idx) => {
          const isActive = idx === activeIndex;
          return (
            <div
              key={idx}
              ref={(el) => (lineRefs.current[idx] = el)}
              className={`grid gap-4 transition-all duration-500 md:grid-cols-2 md:gap-12 ${
                isActive ? "scale-105 opacity-100" : "opacity-40 grayscale-[0.5]"
              }`}
            >
              {/* Pataxó Verso */}
              <div className="flex flex-col items-center justify-center text-center">
                <span className={`kids-chip mb-2 md:hidden ${isActive ? 'bg-emerald-500' : 'bg-gray-300'}`}>Pataxó</span>
                <p className={`font-display text-xl font-black leading-tight md:text-2xl ${
                  isActive ? "text-emerald-900" : "text-emerald-800/70"
                }`}>
                  {line.pataxo}
                </p>
                <div className="mt-3 flex gap-2">
                   <button className="rounded-full bg-emerald-100 p-2 text-emerald-700 shadow-sm hover:bg-emerald-200 active:scale-95 transition-all">
                     <span className="text-sm font-black">🔊 OUVIR</span>
                   </button>
                   <button className="rounded-full bg-amber-100 p-2 text-amber-700 shadow-sm hover:bg-amber-200 active:scale-95 transition-all">
                     <span className="text-sm font-black">🎵 CANTAR</span>
                   </button>
                </div>
              </div>

              {/* Português Verso */}
              <div className="flex flex-col items-center justify-center border-t-2 border-dashed border-emerald-50 px-4 pt-4 text-center md:border-t-0 md:pt-0">
                <span className={`kids-chip mb-2 md:hidden ${isActive ? 'bg-rose-500' : 'bg-gray-300'}`}>Português</span>
                <p className={`font-sans text-lg font-bold italic leading-tight md:text-xl ${
                  isActive ? "text-rose-700" : "text-rose-800/60"
                }`}>
                  {line.portugues}
                </p>
                <div className="mt-3 flex gap-2">
                   <button className="rounded-full bg-rose-50 p-2 text-rose-700 shadow-sm hover:bg-rose-100 active:scale-95 transition-all">
                     <span className="text-sm font-black">🔊 OUVIR</span>
                   </button>
                   <button className="rounded-full bg-sky-50 p-2 text-sky-700 shadow-sm hover:bg-sky-100 active:scale-95 transition-all">
                     <span className="text-sm font-black">🎵 CANTAR</span>
                   </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

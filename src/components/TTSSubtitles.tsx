import { useEffect, useState, useMemo } from "react";
import { splitLyrics } from "@/lib/lyric-sync";

type TTSSubtitlesProps = {
  text: string;
  charIndex: number;
  className?: string;
  activeColor?: string;
  inactiveColor?: string;
};

export function TTSSubtitles({
  text,
  charIndex,
  className = "",
  activeColor = "text-gold",
  inactiveColor = "text-cream/50",
}: TTSSubtitlesProps) {
  const lines = useMemo(() => splitLyrics(text), [text]);
  
  // Encontra qual linha contém o charIndex atual
  const activeIdx = useMemo(() => {
    if (charIndex < 0 || lines.length === 0) return -1;
    
    let currentPos = 0;
    for (let i = 0; i < lines.length; i++) {
      const lineLen = lines[i].length + 1; // +1 para a quebra de linha
      if (charIndex >= currentPos && charIndex < currentPos + lineLen) {
        return i;
      }
      currentPos += lineLen;
    }
    return lines.length - 1;
  }, [lines, charIndex]);

  if (lines.length === 0) return null;

  return (
    <div className={`rounded-xl border border-gold/20 bg-black/20 px-4 py-2 ${className}`}>
      {lines.map((line, i) => {
        const active = i === activeIdx;
        return (
          <div
            key={i}
            className={`py-1 text-center transition-all duration-300 ${active ? "scale-105" : "opacity-50"}`}
          >
            <p className={`font-medium leading-tight ${active ? activeColor : inactiveColor}`}>
              {line}
            </p>
          </div>
        );
      })}
    </div>
  );
}

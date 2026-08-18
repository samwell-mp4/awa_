import { useEffect, useMemo, useRef, useState } from "react";
import { splitLyrics, computeLyricBounds, activeLineIndex, resolveDuration } from "@/lib/lyric-sync";

type CaptionPlayerProps = {
  text: string;
  audio: HTMLAudioElement | null;
  durationSeconds?: number;
  className?: string;
  activeColor?: string;
  inactiveColor?: string;
};

export function CaptionPlayer({
  text,
  audio,
  durationSeconds,
  className = "",
  activeColor = "text-gold",
  inactiveColor = "text-cream/50",
}: CaptionPlayerProps) {
  const [progress, setProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!audio) return;

    let raf = 0;
    const tick = () => {
      setProgress(audio.currentTime);
      if (audio.duration && Number.isFinite(audio.duration)) {
        setAudioDuration(audio.duration);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [audio]);

  const lines = useMemo(() => splitLyrics(text), [text]);
  const duration = useMemo(() => resolveDuration(audioDuration, durationSeconds), [audioDuration, durationSeconds]);
  const bounds = useMemo(() => computeLyricBounds(lines, duration), [lines, duration]);
  const activeIdx = useMemo(() => activeLineIndex(bounds, progress), [bounds, progress]);

  useEffect(() => {
    const box = boxRef.current;
    const el = lineRefs.current[activeIdx];
    if (!box || !el) return;
    box.scrollTo({
      top: el.offsetTop - box.clientHeight / 2 + el.clientHeight / 2,
      behavior: "smooth",
    });
  }, [activeIdx]);

  if (lines.length === 0) return null;

  return (
    <div 
      ref={boxRef} 
      className={`relative overflow-y-auto rounded-xl border border-gold/20 bg-black/20 px-4 py-2 ${className}`}
      style={{ maxHeight: "120px" }}
    >
      {lines.map((line, i) => {
        const active = i === activeIdx;
        return (
          <div
            key={i}
            ref={(el) => { lineRefs.current[i] = el; }}
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

import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, SkipBack, SkipForward, Volume2 } from "lucide-react";

interface SongPlayerProps {
  audioUrl: string;
  onTimeUpdate: (currentTime: number) => void;
  onDurationChange: (duration: number) => void;
  onEnded: () => void;
}

export function SongPlayer({ audioUrl, onTimeUpdate, onDurationChange, onEnded }: SongPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);

  useEffect(() => {
    setIsPlaying(false);
    setProgress(0);
    if (audioRef.current) {
      audioRef.current.load();
    }
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const current = audioRef.current.currentTime;
    const dur = audioRef.current.duration;
    setProgress((current / dur) * 100);
    onTimeUpdate(current);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    const dur = audioRef.current.duration;
    setDuration(dur);
    onDurationChange(dur);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const seekTime = (parseFloat(e.target.value) / 100) * duration;
    audioRef.current.currentTime = seekTime;
    setProgress(parseFloat(e.target.value));
  };

  const skip = (seconds: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime += seconds;
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="kids-card relative z-20 mx-auto w-full max-w-2xl bg-[#fffaf0]/95 p-6 md:p-8">
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => {
          setIsPlaying(false);
          onEnded();
        }}
      />

      <div className="flex flex-col items-center gap-6">
        {/* Main Play Button */}
        <button
          onClick={togglePlay}
          className="kids-btn group relative h-24 w-24 rounded-full bg-gradient-to-br from-rose-400 to-rose-500 p-0 shadow-[0_8px_0_0_#be123c] transition-all hover:scale-105 active:translate-y-1 active:shadow-[0_4px_0_0_#be123c]"
        >
          {isPlaying ? (
            <Pause className="h-10 w-10 text-white" fill="white" />
          ) : (
            <Play className="h-10 w-10 translate-x-1 text-white" fill="white" />
          )}
          <div className="absolute -inset-2 rounded-full border-4 border-dashed border-rose-200/50 animate-spin-slow pointer-events-none" />
        </button>

        {/* Controls Row */}
        <div className="flex w-full items-center justify-center gap-6">
          <button onClick={() => skip(-10)} className="text-emerald-800 hover:scale-110 active:scale-95 transition-transform">
            <SkipBack className="h-8 w-8" fill="currentColor" />
          </button>
          
          <div className="flex-1 space-y-2">
            <input
              type="range"
              min="0"
              max="100"
              value={progress || 0}
              onChange={handleSeek}
              className="h-3 w-full cursor-pointer appearance-none rounded-full bg-emerald-100 accent-rose-500 border-2 border-white shadow-inner"
            />
            <div className="flex justify-between text-xs font-black text-emerald-900/60 uppercase tracking-widest">
              <span>{formatTime((progress / 100) * duration)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <button onClick={() => skip(10)} className="text-emerald-800 hover:scale-110 active:scale-95 transition-transform">
            <SkipForward className="h-8 w-8" fill="currentColor" />
          </button>
        </div>

        {/* Bottom Row: Volume & Reset */}
        <div className="flex w-full items-center justify-between gap-8 px-4">
          <div className="flex items-center gap-2 flex-1 max-w-[120px]">
            <Volume2 className="h-5 w-5 text-emerald-800" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                setVolume(v);
                if (audioRef.current) audioRef.current.volume = v;
              }}
              className="h-2 w-full bg-emerald-100 accent-emerald-600 rounded-full"
            />
          </div>

          <button 
            onClick={() => {
              if (audioRef.current) audioRef.current.currentTime = 0;
            }}
            className="flex items-center gap-2 font-black text-xs text-rose-600 uppercase hover:underline"
          >
            <RotateCcw className="h-4 w-4" /> Recomeçar
          </button>
        </div>
      </div>
    </div>
  );
}

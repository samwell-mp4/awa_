import { Song } from "./songs-data";
import { LyricColumns } from "./LyricColumns";
import { Music } from "lucide-react";

interface SongPlayerProps {
  song: Song;
}

export function SongPlayer({ song }: SongPlayerProps) {
  return (
    <div className="mx-auto mt-6 max-w-4xl px-4">
      <div className="relative mb-6 rounded-2xl border-4 border-[#B8860B] bg-[#8B4513] py-4 shadow-xl">
        <h1 className="text-center font-display text-2xl font-black text-[#FFD700] md:text-3xl">
          🎵 {song.title} 🎵
        </h1>
      </div>

      <div className="relative flex flex-col gap-1 md:flex-row">
        {/* Central Music Button for Mobile (floats in middle on desktop) */}
        <button 
          className="z-20 mx-auto flex h-16 w-16 items-center justify-center rounded-full border-4 border-[#FFD700] bg-[#2F4F2F] text-[#FFD700] shadow-xl md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 transition active:scale-90"
          aria-label="Tocar Música"
        >
          <Music className="h-8 w-8" />
        </button>

        <div className="flex flex-1 flex-col md:flex-row">
           <LyricColumns 
            title="Patxôhã" 
            lyrics={song.lyrics_patxoha} 
            variant="esq" 
            song={song}
          />
          
          {/* Divider line for desktop */}
          <div className="hidden w-1 border-l-4 border-dashed border-[#8B4513] md:block" />
          
          <LyricColumns 
            title="Português" 
            lyrics={song.lyrics_portugues} 
            variant="dir"
            song={song}
          />
        </div>
      </div>
    </div>
  );
}

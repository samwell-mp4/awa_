import type { KidSong } from "./songs-data";

interface SongListProps {
  songs: KidSong[];
  currentSongId: string;
  onSelect: (song: KidSong) => void;
}

export function SongList({ songs, currentSongId, onSelect }: SongListProps) {
  return (
    <section className="relative z-20 mt-12 w-full">
      <h2 className="mb-6 text-center font-display text-2xl font-black uppercase text-emerald-900 drop-shadow-sm">
        Escolha outra Cantiga 🌳
      </h2>
      
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {songs.map((song) => {
          const isActive = song.id === currentSongId;
          return (
            <button
              key={song.id}
              onClick={() => onSelect(song)}
              className={`kids-card group flex flex-col items-center p-3 transition-all ${
                isActive 
                  ? "border-rose-400 ring-4 ring-rose-200" 
                  : "hover:border-emerald-400"
              }`}
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl border-2 border-white shadow-md">
                <img 
                  src={song.image} 
                  alt={song.title} 
                  className="h-full w-full object-cover transition-transform group-hover:scale-110"
                />
                {isActive && (
                  <div className="absolute inset-0 flex items-center justify-center bg-rose-500/30 backdrop-blur-[1px]">
                    <span className="rounded-full bg-white p-2 text-rose-500 shadow-lg">
                      <span className="text-xl">🎵</span>
                    </span>
                  </div>
                )}
              </div>
              <p className="mt-3 text-center text-xs font-black uppercase leading-tight tracking-wide text-emerald-900">
                {song.title}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

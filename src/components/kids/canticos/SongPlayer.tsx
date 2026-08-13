import { Music } from "lucide-react";

export function SongPlayer() {
  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden md:block">
      <div className="w-16 h-16 rounded-full bg-[#EAB308] border-4 border-[#8B4513] shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition active:scale-95">
        <Music className="w-8 h-8 text-[#8B4513]" />
      </div>
    </div>
  );
}

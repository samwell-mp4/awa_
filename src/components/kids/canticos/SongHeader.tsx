import { Music } from "lucide-react";

export function SongHeader({ title }: { title: string }) {
  return (
    <div className="flex justify-center mb-6">
      <div className="relative inline-flex items-center px-8 py-2 bg-[#8B4513] border-4 border-[#5D2E0A] rounded-2xl shadow-[0_4px_0_#5D2E0A]">
        <span className="text-xl text-white font-black uppercase tracking-wider flex items-center gap-2">
          🎵 {title} 🎵
        </span>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Loader2, Pause, Volume2 } from "lucide-react";
import {
  getPlayingHotspot,
  hotspotAudio,
  subscribeHotspotAudio,
  toggleHotspotAudio,
  type HotspotId,
} from "@/lib/audio-hotspots";

/**
 * Ponto de áudio interativo. Fica ao lado do conteúdo correspondente.
 * Só um áudio toca por vez: clicar em outro ponto interrompe o anterior.
 * Se ainda não houver arquivo de áudio para o ponto, nada é renderizado.
 */
export function AudioHotspot({
  id,
  className = "",
}: {
  id: HotspotId;
  className?: string;
}) {
  const entry = hotspotAudio(id);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const sync = () => {
      const active = getPlayingHotspot() === id;
      setPlaying(active);
      if (!active) setLoading(false);
    };
    sync();
    return subscribeHotspotAudio(sync);
  }, [id]);

  if (!entry?.url) return null;
  const url = entry.url;

  return (
    <button
      type="button"
      aria-label={entry.label}
      aria-pressed={playing}
      title={entry.label}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        if (!playing) setLoading(true);
        void toggleHotspotAudio(id, url);
      }}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 ${
        playing
          ? "border-gold bg-gold text-forest-deep shadow-[var(--shadow-gold)]"
          : "border-gold/35 bg-gold/12 text-gold hover:bg-gold/22"
      } ${className}`}
    >
      {playing ? (
        loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Pause className="h-3.5 w-3.5" />
        )
      ) : (
        <Volume2 className="h-3.5 w-3.5" />
      )}
      <span>{playing ? "Tocando" : "Ouvir"}</span>
      {playing && (
        <span aria-hidden className="ml-0.5 h-1.5 w-1.5 animate-pulse rounded-full bg-forest-deep" />
      )}
    </button>
  );
}

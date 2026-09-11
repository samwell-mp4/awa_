import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Pause, Volume2 } from "lucide-react";
import {
  getHotspotState,
  hotspotAudio,
  subscribeHotspotAudio,
  toggleHotspotAudio,
  type HotspotId,
} from "@/lib/audio-hotspots";

/**
 * Ponto de áudio interativo com voz natural.
 * Só um áudio toca por vez: clicar em outro ponto interrompe o anterior.
 */
export function AudioHotspot({ id, className = "" }: { id: HotspotId; className?: string }) {
  const entry = hotspotAudio(id);
  const { i18n } = useTranslation();
  const lang = (i18n.language || "pt").slice(0, 2).toLowerCase();
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const sync = () => {
      const s = getHotspotState();
      setPlaying(s.id === id);
      setLoading(s.id === id && s.loading);
    };
    sync();
    return subscribeHotspotAudio(sync);
  }, [id]);

  const label = playing ? "Pausar narração" : entry.label;

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={playing}
      title={label}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        void toggleHotspotAudio(id, lang);
      }}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 ${
        playing
          ? "border-gold bg-gold text-forest-deep shadow-[var(--shadow-gold)]"
          : "border-gold/35 bg-gold/12 text-gold hover:bg-gold/22"
      } ${className}`}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : playing ? (
        <Pause className="h-3.5 w-3.5" />
      ) : (
        <Volume2 className="h-3.5 w-3.5" />
      )}
      <span>{loading ? "Preparando" : playing ? "Tocando" : "Ouvir"}</span>
      {playing && !loading && (
        <span
          aria-hidden
          className="ml-0.5 h-1.5 w-1.5 animate-pulse rounded-full bg-forest-deep"
        />
      )}
    </button>
  );
}

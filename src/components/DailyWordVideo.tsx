import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Play, Pause, SkipForward, Radio, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Word = {
  id: string;
  term_pt: string;
  term_indigenous: string;
  pronunciation: string | null;
};

export function DailyWordVideo() {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(true);

  const { data = [], isLoading } = useQuery({
    queryKey: ["daily-word-video-pool"],
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dictionary")
        .select("id,term_pt,term_indigenous,pronunciation")
        .limit(2000);
      if (error) throw error;
      return (data ?? []) as Word[];
    },
  });

  const pool = useMemo(
    () => data.filter((w) => w.term_indigenous && w.term_pt),
    [data],
  );

  useEffect(() => {
    if (!playing || pool.length === 0) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % pool.length), 3500);
    return () => clearInterval(t);
  }, [playing, pool.length]);

  const current = pool[idx];
  const imageUrl = current
    ? `https://loremflickr.com/800/600/${encodeURIComponent(current.term_pt)},nature,forest?lock=${Math.abs(hashCode(current.id))}`
    : "";

  return (
    <section className="relative mt-6 overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-br from-forest-deep via-bark/60 to-forest-deep shadow-2xl">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-leaf/30 blur-3xl animate-pulse" />
        <div
          className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-gold/20 blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="relative p-6 md:p-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-red-500/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-red-300">
            <Radio className="h-3.5 w-3.5 animate-pulse" /> Vídeo do dia — Patxôhã ao vivo
          </div>
          {pool.length > 0 && (
            <span className="text-xs text-cream/70">
              {idx + 1} / {pool.length}
            </span>
          )}
        </div>

        {isLoading || !current ? (
          <div className="flex h-56 items-center justify-center text-foreground/60">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div
            key={current.id}
            className="mt-6 animate-in fade-in zoom-in-95 duration-700"
          >
            <div className="relative overflow-hidden rounded-2xl border border-gold/20 bg-forest-deep/40 aspect-video mb-4">
              <img
                src={imageUrl}
                alt={current.term_pt}
                loading="lazy"
                className="h-full w-full object-cover animate-in fade-in duration-1000"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = `https://loremflickr.com/800/600/nature,amazon?lock=${idx}`;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/90 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-4 right-4">
                <h2 className="font-display text-3xl md:text-5xl font-black text-gold break-words leading-tight drop-shadow-2xl">
                  {current.term_indigenous}
                </h2>
              </div>
            </div>
            <p className="text-lg md:text-xl text-cream/95 break-words">
              {current.term_pt}
            </p>
            {current.pronunciation && (
              <p className="mt-2 text-sm text-foreground/70">🗣️ {current.pronunciation}</p>
            )}
          </div>
        )}

        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={() => setPlaying((p) => !p)}
            className="grid h-12 w-12 place-items-center rounded-full bg-gold text-forest-deep shadow-lg hover:scale-105 transition"
            aria-label={playing ? "Pausar" : "Reproduzir"}
          >
            {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </button>
          <button
            onClick={() => setIdx((i) => (pool.length ? (i + 1) % pool.length : 0))}
            className="grid h-12 w-12 place-items-center rounded-full bg-leaf/30 text-cream hover:bg-leaf/50 transition"
            aria-label="Próxima palavra"
          >
            <SkipForward className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-forest-deep/60">
          <div
            key={`${current?.id}-${playing}`}
            className="h-full bg-gradient-to-r from-leaf to-gold"
            style={{ width: "100%", animation: playing ? "dwv-shrink 3.5s linear" : "none" }}
          />
        </div>
        <style>{`@keyframes dwv-shrink { from { width: 0% } to { width: 100% } }`}</style>
      </div>
    </section>
  );
}

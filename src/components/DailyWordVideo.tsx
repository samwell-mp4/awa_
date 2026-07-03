import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Play, Pause, SkipForward, Radio, Loader2, Leaf } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Word = {
  id: string;
  term_pt: string;
  term_indigenous: string;
  pronunciation: string | null;
};

function hashCode(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return h;
}

const SCENE_MS = 5000;

// Fixed particle positions (stable per mount) — floating leaves & sparks
const PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  left: (i * 37) % 100,
  delay: (i * 0.7) % 6,
  duration: 6 + ((i * 1.3) % 5),
  size: 10 + ((i * 5) % 14),
  drift: (i % 2 === 0 ? 1 : -1) * (20 + (i * 7) % 40),
  isSpark: i % 3 === 0,
}));

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
    const t = setInterval(() => setIdx((i) => (i + 1) % pool.length), SCENE_MS);
    return () => clearInterval(t);
  }, [playing, pool.length]);

  const current = pool[idx];
  const imageUrl = current
    ? `https://loremflickr.com/1200/800/${encodeURIComponent(current.term_pt)},nature,forest,amazon?lock=${Math.abs(hashCode(current.id))}`
    : "";

  const letters = current?.term_indigenous?.split("") ?? [];

  return (
    <section className="relative mt-6 overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-br from-forest-deep via-bark/60 to-forest-deep shadow-2xl">
      {/* Aurora glow */}
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -top-32 -left-24 h-80 w-80 rounded-full bg-leaf/30 blur-3xl dwv-aurora" />
        <div
          className="absolute -bottom-32 -right-24 h-80 w-80 rounded-full bg-gold/25 blur-3xl dwv-aurora"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute top-1/3 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-earth/20 blur-3xl dwv-aurora"
          style={{ animationDelay: "4s" }}
        />
      </div>

      <div className="relative p-6 md:p-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-red-500/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-red-300 backdrop-blur-sm">
            <Radio className="h-3.5 w-3.5 animate-pulse" /> Ao vivo — Patxôhã
          </div>
        </div>

        {isLoading || !current ? (
          <div className="flex h-56 items-center justify-center text-foreground/60">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div key={current.id} className="mt-6">
            {/* Cinematic stage */}
            <div className="relative overflow-hidden rounded-2xl border border-gold/30 bg-forest-deep/40 aspect-video mb-5 shadow-inner">
              {/* Ken Burns image */}
              <img
                src={imageUrl}
                alt={current.term_pt}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover dwv-kenburns"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = `https://loremflickr.com/1200/800/nature,amazon,jungle?lock=${idx}`;
                }}
              />

              {/* Film vignette + gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-forest-deep via-forest-deep/40 to-transparent" />
              <div className="absolute inset-0 dwv-vignette pointer-events-none" />

              {/* Tribal frame corners */}
              <span className="absolute top-3 left-3 h-6 w-6 border-t-2 border-l-2 border-gold/70 rounded-tl-lg" />
              <span className="absolute top-3 right-3 h-6 w-6 border-t-2 border-r-2 border-gold/70 rounded-tr-lg" />
              <span className="absolute bottom-3 left-3 h-6 w-6 border-b-2 border-l-2 border-gold/70 rounded-bl-lg" />
              <span className="absolute bottom-3 right-3 h-6 w-6 border-b-2 border-r-2 border-gold/70 rounded-br-lg" />

              {/* Floating particles */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {PARTICLES.map((p) => (
                  <span
                    key={p.id}
                    className="absolute bottom-[-20px] opacity-0 dwv-float"
                    style={{
                      left: `${p.left}%`,
                      animationDelay: `${p.delay}s`,
                      animationDuration: `${p.duration}s`,
                      // @ts-expect-error CSS custom property
                      "--drift": `${p.drift}px`,
                    }}
                  >
                    {p.isSpark ? (
                      <span
                        className="block rounded-full bg-gold shadow-[0_0_10px_rgba(249,168,37,0.8)]"
                        style={{ width: p.size * 0.45, height: p.size * 0.45 }}
                      />
                    ) : (
                      <Leaf
                        className="text-leaf/80 drop-shadow-[0_0_4px_rgba(76,175,80,0.6)]"
                        style={{ width: p.size, height: p.size }}
                      />
                    )}
                  </span>
                ))}
              </div>

              {/* Word reveal — letter by letter */}
              <div className="absolute inset-x-0 bottom-0 p-5 md:p-7">
                <div className="mb-2 h-px w-16 bg-gradient-to-r from-gold to-transparent dwv-slide-in" />
                <h2 className="font-display text-4xl md:text-6xl font-black text-gold break-words leading-[1.05] drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
                  {letters.map((ch, i) => (
                    <span
                      key={`${current.id}-${i}`}
                      className="inline-block dwv-letter"
                      style={{ animationDelay: `${0.3 + i * 0.06}s` }}
                    >
                      {ch === " " ? "\u00A0" : ch}
                    </span>
                  ))}
                </h2>
              </div>
            </div>

            {/* Translation card */}
            <div className="dwv-fade-up rounded-xl border border-leaf/20 bg-forest-deep/40 p-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-widest text-leaf/70 mb-1">
                Português
              </p>
              <p className="text-lg md:text-2xl text-cream font-medium break-words">
                {current.term_pt}
              </p>
              {current.pronunciation && (
                <p className="mt-2 text-sm text-gold/80 italic">
                  🗣️ {current.pronunciation}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={() => setPlaying((p) => !p)}
            className="grid h-12 w-12 place-items-center rounded-full bg-gold text-forest-deep shadow-lg hover:scale-110 hover:shadow-gold/50 transition"
            aria-label={playing ? "Pausar" : "Reproduzir"}
          >
            {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
          </button>
          <button
            onClick={() => setIdx((i) => (pool.length ? (i + 1) % pool.length : 0))}
            className="grid h-12 w-12 place-items-center rounded-full bg-leaf/30 text-cream hover:bg-leaf/50 hover:scale-110 transition"
            aria-label="Próxima palavra"
          >
            <SkipForward className="h-5 w-5" />
          </button>
        </div>

        {/* Progress */}
        <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-forest-deep/60">
          <div
            key={`${current?.id}-${playing}`}
            className="h-full bg-gradient-to-r from-leaf via-gold to-leaf bg-[length:200%_100%]"
            style={{
              width: "100%",
              animation: playing
                ? `dwv-shrink ${SCENE_MS}ms linear, dwv-shimmer 2s linear infinite`
                : "none",
            }}
          />
        </div>

        <style>{`
          @keyframes dwv-shrink { from { width: 0% } to { width: 100% } }
          @keyframes dwv-shimmer { 0% { background-position: 0% 0 } 100% { background-position: 200% 0 } }
          @keyframes dwv-kenburns {
            0% { transform: scale(1.05) translate(0, 0); }
            100% { transform: scale(1.18) translate(-2%, -1.5%); }
          }
          .dwv-kenburns { animation: dwv-kenburns ${SCENE_MS}ms ease-out forwards; }
          @keyframes dwv-aurora {
            0%, 100% { transform: translate(0,0) scale(1); opacity: 0.6; }
            50% { transform: translate(20px, -15px) scale(1.15); opacity: 0.9; }
          }
          .dwv-aurora { animation: dwv-aurora 8s ease-in-out infinite; }
          @keyframes dwv-letter-in {
            0% { opacity: 0; transform: translateY(24px) rotate(-6deg); filter: blur(6px); }
            100% { opacity: 1; transform: translateY(0) rotate(0); filter: blur(0); }
          }
          .dwv-letter { opacity: 0; animation: dwv-letter-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
          @keyframes dwv-float {
            0% { opacity: 0; transform: translateY(0) translateX(0) rotate(0deg); }
            15% { opacity: 0.9; }
            100% { opacity: 0; transform: translateY(-120%) translateX(var(--drift, 0)) rotate(240deg); }
          }
          .dwv-float { animation: dwv-float linear infinite; }
          @keyframes dwv-slide-in {
            from { width: 0; opacity: 0; }
            to { width: 4rem; opacity: 1; }
          }
          .dwv-slide-in { animation: dwv-slide-in 0.8s ease-out 0.2s both; }
          @keyframes dwv-fade-up {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .dwv-fade-up { animation: dwv-fade-up 0.7s ease-out 0.5s both; }
          .dwv-vignette {
            background: radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%);
          }
        `}</style>
      </div>
    </section>
  );
}

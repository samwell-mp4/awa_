import { createFileRoute, Link } from "@tanstack/react-router";
import { requireArea } from "@/lib/area-guard";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Pause, Play, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { pickLang, useLang } from "@/lib/pick-lang";
import bgAsset from "@/assets/musicas-infantil-bg.jpg.asset.json";
import { SiteHeader } from "@/components/home/site-header";

export const Route = createFileRoute("/musicas-infantil")({
  ssr: false,
  beforeLoad: () => requireArea("infantil"),
  head: () => ({
    meta: [
      { title: "Cantigas da Aldeia — Awã Tech Infantil" },
      {
        name: "description",
        content:
          "Menu infantil de cantigas indígenas do Awã Tech — bem colorido, com bichos, penas e tambor para as crianças cantarem juntas.",
      },
    ],
  }),
  component: MusicasInfantilPage,
});

type Song = {
  id: string;
  title: string;
  artist: string | null;
  audio_url: string;
  cover_url: string | null;
  language: string;
  lyrics_indigenous: string | null;
  lyrics_pt: string | null;
  lyrics_pt_en: string | null;
  lyrics_pt_es: string | null;
};


// Bright kid palettes + a matching indigenous emoji
const THEMES = [
  { bg: "from-rose-400 via-pink-400 to-fuchsia-400", ring: "ring-rose-100", emoji: "🪶", label: "Pena" },
  { bg: "from-emerald-400 via-lime-400 to-yellow-300", ring: "ring-emerald-100", emoji: "🐢", label: "Tartaruga" },
  { bg: "from-sky-400 via-cyan-400 to-teal-300", ring: "ring-sky-100", emoji: "🐟", label: "Peixinho" },
  { bg: "from-orange-400 via-red-400 to-rose-400", ring: "ring-orange-100", emoji: "🔥", label: "Fogueira" },
  { bg: "from-violet-400 via-fuchsia-400 to-pink-300", ring: "ring-violet-100", emoji: "🦜", label: "Arara" },
  { bg: "from-amber-500 via-orange-400 to-rose-300", ring: "ring-amber-100", emoji: "🥁", label: "Tambor" },
  { bg: "from-teal-400 via-emerald-400 to-lime-300", ring: "ring-teal-100", emoji: "🌳", label: "Árvore" },
  { bg: "from-yellow-400 via-amber-400 to-orange-400", ring: "ring-yellow-100", emoji: "☀️", label: "Sol" },
  { bg: "from-indigo-400 via-blue-400 to-sky-300", ring: "ring-indigo-100", emoji: "🌙", label: "Lua" },
  { bg: "from-lime-400 via-green-400 to-emerald-400", ring: "ring-lime-100", emoji: "🐸", label: "Sapinho" },
];

function MusicasInfantilPage() {
  const { data: songs = [], isLoading } = useQuery({
    queryKey: ["songs_infantil"],
    staleTime: 1000 * 60 * 30,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("songs")
        .select(
          "id,title,artist,audio_url,cover_url,language,lyrics_indigenous,lyrics_pt,lyrics_pt_en,lyrics_pt_es",
        )
        .eq("is_active", true)
        .order("order_index")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Song[];
    },
  });

  const [playing, setPlaying] = useState<Song | null>(null);

  return (
    <div
      className="kids-theme min-h-screen relative overflow-hidden text-emerald-950 bg-emerald-100"
      style={{
        backgroundImage: `url(${bgAsset.url})`,
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundAttachment: "fixed",
      }}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/0 via-black/10 to-black/40" />

      <SiteHeader mode="infantil" />

      <header className="relative sticky top-0 z-30 border-b-[6px] border-dashed border-amber-400 bg-amber-100/85 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-3 py-3">
          <Link
            to="/infantil"
            className="inline-flex items-center gap-1 rounded-full border-2 border-emerald-900 bg-emerald-600 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-white shadow-[0_4px_0_#064e3b] active:translate-y-0.5 active:shadow-none"
          >
            <ArrowLeft className="h-4 w-4" /> Aldeia
          </Link>
          <div className="flex items-center gap-1 font-display text-xl font-black text-rose-700 drop-shadow">
            🎶 Cantigas 🎶
          </div>
          <span className="w-16" />
        </div>
      </header>

      <main className="relative mx-auto max-w-4xl px-3 pb-32 pt-4">
        {/* Big playful hero */}
        <section className="relative mb-6 overflow-hidden rounded-[2.5rem] border-[6px] border-white bg-gradient-to-br from-amber-200 via-yellow-100 to-rose-100 p-5 text-center shadow-[0_18px_0_-8px_rgba(180,83,9,0.45),0_25px_50px_-20px_rgba(0,0,0,0.4)]">
          <div className="flex justify-center gap-2 text-5xl">
            <span className="kid-bounce" style={{ animationDelay: "0s" }}>🪶</span>
            <span className="kid-bounce" style={{ animationDelay: "0.2s" }}>🥁</span>
            <span className="kid-bounce" style={{ animationDelay: "0.4s" }}>🦜</span>
            <span className="kid-bounce" style={{ animationDelay: "0.6s" }}>🌈</span>
          </div>
          <h1 className="mt-2 font-display text-4xl font-black leading-none text-emerald-900 md:text-5xl">
            Canta com a{" "}
            <span className="inline-block kid-wiggle text-rose-600">Aldeia!</span>
          </h1>
          <p className="mt-2 text-base font-black text-emerald-800/80">
            Toca no bichinho para ouvir a cantiga 🎵
          </p>
        </section>

        {isLoading ? (
          <div className="grid animate-pulse grid-cols-2 gap-5 sm:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-[2rem] bg-white/60" />
            ))}
          </div>
        ) : songs.length === 0 ? (
          <p className="text-center font-black text-emerald-800/70">
            Em breve novas cantigas 🌱
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
            {songs.map((s, i) => {
              const theme = THEMES[i % THEMES.length];
              const isActive = playing?.id === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setPlaying(isActive ? null : s)}
                  className={`group relative flex aspect-square flex-col items-center justify-between rounded-[2rem] border-[5px] border-white bg-gradient-to-br ${theme.bg} p-3 text-center shadow-[0_10px_0_-3px_rgba(0,0,0,0.25),0_20px_35px_-15px_rgba(0,0,0,0.4)] ring-4 ${theme.ring} transition-transform hover:-translate-y-1 hover:rotate-[-1deg] hover:scale-[1.04] active:translate-y-0.5 active:scale-95`}
                >
                  {/* Zigzag tribal top */}
                  <svg viewBox="0 0 60 8" className="h-3 w-full text-white/90">
                    <path d="M0 8 L6 0 L12 8 L18 0 L24 8 L30 0 L36 8 L42 0 L48 8 L54 0 L60 8" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  </svg>

                  {/* Big emoji / play */}
                  <div className="relative grid h-20 w-20 place-items-center rounded-full bg-white/95 text-5xl shadow-inner ring-[6px] ring-white/70">
                    {isActive ? (
                      <Pause className="h-9 w-9 fill-emerald-800 text-emerald-800" />
                    ) : (
                      <span aria-hidden className="kid-bounce" style={{ animationDelay: `${(i % 5) * 0.15}s` }}>
                        {theme.emoji}
                      </span>
                    )}
                    {/* dotted halo */}
                    <span className="absolute inset-0 rounded-full border-[3px] border-dashed border-white/70 kid-spin-slow" />
                  </div>

                  {/* Title */}
                  <div className="w-full">
                    <div className="line-clamp-2 font-display text-sm font-black uppercase leading-tight tracking-wide text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.35)]">
                      {s.title}
                    </div>
                    {s.artist && (
                      <div className="mt-0.5 line-clamp-1 text-[10px] font-black text-white/90">
                        {s.artist}
                      </div>
                    )}
                  </div>

                  {/* Play tag */}
                  <span className="absolute -bottom-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full border-2 border-white bg-emerald-900 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-200 shadow-[0_4px_0_rgba(0,0,0,0.3)]">
                    {isActive ? "Tocando…" : <>Tocar <Play className="h-3 w-3 fill-current" /></>}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </main>

      {playing && <MiniPlayer song={playing} onClose={() => setPlaying(null)} />}
    </div>
  );
}

function MiniPlayer({ song, onClose }: { song: Song; onClose: () => void }) {
  const ref = useRef<HTMLAudioElement>(null);
  const lang = useLang();
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.play().catch(() => {});
    setProgress(0);
  }, [song.id]);

  // Smooth, frame-accurate clock (onTimeUpdate only fires ~4x/s => legendas atrasadas)
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const a = ref.current;
      if (a) {
        setProgress(a.currentTime);
        if (a.duration && Number.isFinite(a.duration)) setDuration(a.duration);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [song.id]);

  const split = (v: string | null | undefined) =>
    (v ?? "")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

  const indLines = split(song.lyrics_indigenous);
  const transLines = split(pickLang(song as any, "lyrics_pt", lang));
  const maxLen = Math.max(indLines.length, transLines.length);

  // Duração proporcional ao tamanho de cada verso (versos longos duram mais)
  const bounds = useMemo(() => {
    if (maxLen === 0 || duration <= 0) return [] as number[];
    const weights = Array.from({ length: maxLen }, (_, i) => {
      const len = (indLines[i] || transLines[i] || "").length;
      return Math.max(8, len);
    });
    const total = weights.reduce((a, b) => a + b, 0);
    const out: number[] = [];
    let acc = 0;
    for (const w of weights) {
      acc += w;
      out.push((acc / total) * duration);
    }
    return out;
  }, [maxLen, duration, song.id, lang]);

  // Pequena antecipação para a legenda chegar junto com a voz
  const LEAD = 0.25;
  const activeIdx = useMemo(() => {
    if (!bounds.length) return -1;
    const t = progress + LEAD;
    for (let i = 0; i < bounds.length; i++) if (t < bounds[i]) return i;
    return bounds.length - 1;
  }, [progress, bounds]);

  useEffect(() => {
    const box = boxRef.current;
    const el = lineRefs.current[activeIdx];
    if (!box || !el) return;
    // rola apenas o painel de legendas, não a página
    box.scrollTo({
      top: el.offsetTop - box.clientHeight / 2 + el.clientHeight / 2,
      behavior: "smooth",
    });
  }, [activeIdx]);


  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t-[6px] border-dashed border-amber-300 bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-900 p-3 shadow-2xl">
      {maxLen > 0 && (
        <div ref={boxRef} className="relative mx-auto mb-2 max-h-40 max-w-4xl overflow-y-auto rounded-2xl border-4 border-amber-300/70 bg-emerald-950/60 px-3 py-2">
          {Array.from({ length: maxLen }).map((_, i) => {
            const active = i === activeIdx;
            return (
              <div
                key={i}
                ref={(el) => {
                  lineRefs.current[i] = el;
                }}
                className={`py-1 text-center transition-all duration-300 ${
                  active ? "scale-105" : "opacity-50"
                }`}
              >
                <p
                  className={`font-display text-base font-black leading-tight ${
                    active ? "text-amber-300" : "text-amber-100"
                  }`}
                >
                  {indLines[i] || "\u00A0"}
                </p>
                {transLines[i] && (
                  <p className="text-xs font-bold italic text-emerald-100/85">{transLines[i]}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
      <div className="mx-auto flex max-w-4xl items-center gap-3">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border-4 border-white bg-amber-300 text-3xl kid-bounce">
          🎶
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate font-display text-base font-black text-amber-200">
            {song.title}
          </div>
          {song.artist && (
            <div className="truncate text-[11px] font-bold text-emerald-100/80">
              {song.artist}
            </div>
          )}
          <audio
            ref={ref}
            src={song.audio_url}
            controls
            className="mt-1 w-full"
            onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
          />
        </div>

        <button
          onClick={onClose}
          aria-label="Fechar"
          className="grid h-10 w-10 place-items-center rounded-full border-2 border-white bg-rose-500 text-white shadow-[0_4px_0_rgba(0,0,0,0.35)] active:translate-y-0.5 active:shadow-none"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

function TribalBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Big sun */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-[7rem] opacity-40 kid-spin-slow">☀️</div>
      {/* Floating friends */}
      <div className="absolute left-2 top-32 text-6xl opacity-70 kid-bounce">🪶</div>
      <div className="absolute right-3 top-44 text-6xl opacity-70 kid-wiggle">🦜</div>
      <div className="absolute left-4 bottom-40 text-6xl opacity-70 kid-bounce" style={{ animationDelay: "0.5s" }}>🥁</div>
      <div className="absolute right-6 bottom-56 text-6xl opacity-70 kid-wiggle" style={{ animationDelay: "0.3s" }}>🐢</div>
      <div className="absolute left-1/3 bottom-24 text-5xl opacity-60 kid-bounce" style={{ animationDelay: "0.8s" }}>🐸</div>
      <div className="absolute right-1/4 top-1/2 text-5xl opacity-60 kid-wiggle" style={{ animationDelay: "0.6s" }}>🐟</div>

      {/* Ground grass */}
      <svg
        className="absolute inset-x-0 bottom-0 h-24 w-full text-emerald-500/70"
        viewBox="0 0 400 40"
        preserveAspectRatio="none"
      >
        <path d="M0 40 L10 15 L20 40 L28 20 L38 40 L48 10 L58 40 L70 18 L80 40 L92 8 L104 40 L116 20 L128 40 L140 12 L152 40 L164 18 L176 40 L188 10 L200 40 L212 20 L224 40 L236 8 L248 40 L260 20 L272 40 L284 12 L296 40 L308 18 L320 40 L332 10 L344 40 L356 20 L368 40 L380 15 L392 40 L400 20 L400 40 Z" fill="currentColor" />
      </svg>

      {/* Top tribal zigzag border */}
      <svg
        className="absolute inset-x-0 top-0 h-6 w-full text-amber-600/50"
        viewBox="0 0 400 20"
        preserveAspectRatio="none"
      >
        <path d="M0 10 L10 0 L20 10 L30 0 L40 10 L50 0 L60 10 L70 0 L80 10 L90 0 L100 10 L110 0 L120 10 L130 0 L140 10 L150 0 L160 10 L170 0 L180 10 L190 0 L200 10 L210 0 L220 10 L230 0 L240 10 L250 0 L260 10 L270 0 L280 10 L290 0 L300 10 L310 0 L320 10 L330 0 L340 10 L350 0 L360 10 L370 0 L380 10 L390 0 L400 10" fill="none" stroke="currentColor" strokeWidth="3" />
      </svg>
    </div>
  );
}

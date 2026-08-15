import { createFileRoute, Link } from "@tanstack/react-router";
import { requireArea } from "@/lib/area-guard";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Home, Play, Pause, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLang } from "@/lib/pick-lang";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { activeLineIndex, computeLyricBounds, resolveDuration, splitLyrics, } from "@/lib/lyric-sync";
// Reference asset imports
import referenceAsset from "@/assets/kids-theme/reference.png.asset.json";
export const Route = createFileRoute("/musicas-infantil")({
    ssr: false,
    beforeLoad: () => requireArea("infantil"),
    head: () => ({
        meta: [
            { title: "Cânticos Infantis Pataxó — Awã Tech" },
            {
                name: "description",
                content: "Cante junto com a Aldeia! Músicas tradicionais Pataxó com letras sincronizadas em Patxôhã e Português.",
            },
        ],
    }),
    component: MusicasInfantilPage,
});
export function MusicasInfantilPage() {
    const { data: songs = [], isLoading } = useQuery({
        queryKey: ["songs_infantil"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("songs")
                .select("*")
                .eq("is_active", true)
                .order("order_index");
            if (error)
                throw error;
            return data;
        },
    });
    const [playing, setPlaying] = useState(null);
    const [mode, setMode] = useState("listen");
    return (<div className="kids-theme min-h-screen bg-[#5b3a24] relative overflow-hidden font-['Fredoka',sans-serif]">
      {/* Background with texture & jungle vibes */}
      <div className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none" style={{
            backgroundImage: `url(${referenceAsset.url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(20px) saturate(0.5)'
        }}/>
      
      {/* Decorative Jungle Leaves in corners */}
      <div className="absolute top-0 left-0 w-48 h-48 opacity-60 pointer-events-none z-0">
         <span className="text-8xl absolute top-4 left-4 kid-wiggle">🌿</span>
      </div>
      <div className="absolute top-0 right-0 w-48 h-48 opacity-60 pointer-events-none z-0">
         <span className="text-8xl absolute top-4 right-4 kid-wiggle" style={{ animationDelay: '0.5s' }}>🍃</span>
      </div>

      {/* Main Container mirroring the Tablet UI from reference */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 py-6 min-h-screen flex flex-col">
        
        {/* Top Navigation Row */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex gap-4">
            <Link to="/infantil" className="w-14 h-14 rounded-full bg-[#8b5a2b] border-4 border-[#5b3a24] flex items-center justify-center text-white shadow-lg transition-transform active:scale-90">
              <ArrowLeft className="w-8 h-8" strokeWidth={3}/>
            </Link>
            <Link to="/infantil" className="w-14 h-14 rounded-full bg-[#8b5a2b] border-4 border-[#5b3a24] flex items-center justify-center text-white shadow-lg transition-transform active:scale-90">
              <Home className="w-8 h-8" strokeWidth={3}/>
            </Link>
          </div>

          <div className="flex-1 flex justify-center">
             <div className="px-8 py-2 bg-[#8b5a2b] border-4 border-[#5b3a24] rounded-b-3xl shadow-lg relative -top-6">
                <img src="/logo-infantil.png" alt="Awã Tech" className="h-12 brightness-0 invert opacity-90" onError={(e) => (e.currentTarget.style.display = 'none')}/>
                <div className="text-amber-200 text-center font-black text-xl uppercase tracking-widest mt-1">
                   Awã Tech
                </div>
             </div>
          </div>

          <div className="w-32 h-14 bg-[#8b5a2b] border-4 border-[#5b3a24] rounded-2xl flex items-center justify-between px-3 shadow-lg">
             <span className="text-white font-black text-lg">AWÃ MIRIM</span>
             <div className="flex items-center gap-1">
                <span className="text-amber-300 font-black">125</span>
                <span className="text-yellow-400 text-xl">⭐</span>
             </div>
          </div>
        </header>

        {/* Center Song Board */}
        <div className="flex-1 flex flex-col items-center justify-center">
          
          <AnimatePresence mode="wait">
            {!playing ? (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-5xl">
                {songs.map((song, i) => (<button key={song.id} onClick={() => setPlaying(song)} className="kids-card aspect-[4/3] flex flex-col items-center justify-center p-4 gap-3 bg-[#fffaf0] hover:scale-105 transition-all group">
                    <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center text-4xl shadow-inner group-hover:rotate-12 transition-transform">
                       {i % 2 === 0 ? "🎵" : "🎸"}
                    </div>
                    <span className="font-display text-lg font-black text-[#5b3a24] text-center leading-tight">
                      {song.title}
                    </span>
                  </button>))}
              </motion.div>) : (<KidsSongPlayer song={playing} mode={mode} onClose={() => setPlaying(null)}/>)}
          </AnimatePresence>

        </div>
      </main>

      <style>{`
        .lyrics-scroll::-webkit-scrollbar { width: 0px; }
      `}</style>
    </div>);
}
function KidsSongPlayer({ song, mode, onClose }) {
    const { t, i18n } = useTranslation();
    const lang = useLang();
    const audioRef = useRef(null);
    const [progress, setProgress] = useState(0);
    const [audioDuration, setAudioDuration] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const boxRef = useRef(null);
    const lineRefs = useRef([]);
    const indLines = useMemo(() => splitLyrics(song.lyrics_indigenous), [song.lyrics_indigenous]);
    const ptLines = useMemo(() => splitLyrics(song.lyrics_pt), [song.lyrics_pt]);
    const maxLen = Math.max(indLines.length, ptLines.length);
    const duration = resolveDuration(audioDuration, song.duration_seconds);
    const bounds = useMemo(() => computeLyricBounds(Array.from({ length: maxLen }, (_, i) => indLines[i] || ptLines[i] || ""), duration), [maxLen, duration, song.id]);
    const activeIdx = useMemo(() => activeLineIndex(bounds, progress), [progress, bounds]);
    useEffect(() => {
        const v = audioRef.current;
        if (!v)
            return;
        v.play().catch(() => { });
        setIsPlaying(true);
    }, [song.id]);
    useEffect(() => {
        const el = lineRefs.current[activeIdx];
        if (el && boxRef.current) {
            boxRef.current.scrollTo({
                top: el.offsetTop - boxRef.current.clientHeight / 2 + el.clientHeight / 2,
                behavior: "smooth",
            });
        }
    }, [activeIdx]);
    return (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-6xl relative">
      {/* Wood header for song title */}
      <div className="flex justify-center mb-4">
        <div className="bg-[#8b5a2b] border-4 border-[#5b3a24] rounded-2xl px-12 py-3 shadow-xl relative z-20 flex items-center gap-3">
           <span className="text-amber-400 text-2xl">🎵</span>
           <h2 className="font-display text-2xl md:text-3xl font-black text-white uppercase tracking-wide">
             {song.title}
           </h2>
           <span className="text-amber-400 text-2xl">🎵</span>
        </div>
      </div>

      {/* Main Board - Paper/Parchment style */}
      <div className="bg-[#f4d9a8] border-8 border-[#8b5a2b] rounded-[3rem] shadow-[0_30px_0_0_rgba(91,58,36,0.3)] relative overflow-hidden min-h-[500px] flex">
        
        {/* Left Character Area */}
        <div className="hidden lg:flex flex-col justify-end p-8 w-64 shrink-0">
           <div className="relative group">
              <span className="text-9xl block drop-shadow-xl kid-bounce">👧🏽</span>
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white rounded-2xl px-4 py-2 text-sm font-black border-4 border-[#8b5a2b] shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                 Vamos cantar!
              </div>
           </div>
        </div>

        {/* Lyrics Area - Two Columns */}
        <div className="flex-1 flex flex-col md:flex-row p-6 md:p-10 relative">
          
          {/* Tribal Divider Strip */}
          <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-8 hidden md:block opacity-80 pointer-events-none" style={{
            backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='20' height='40'><path d='M0 0 L10 10 L20 0 L20 40 L10 30 L0 40 Z' fill='%23c4632a'/></svg>")`,
            backgroundRepeat: 'repeat-y'
        }}/>

          {/* Centered Play Icon on the strip */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 hidden md:block">
             <button onClick={() => {
            const a = audioRef.current;
            if (!a)
                return;
            if (isPlaying)
                a.pause();
            else
                a.play();
            setIsPlaying(!isPlaying);
        }} className="w-16 h-16 rounded-full bg-[#8b5a2b] border-4 border-[#5b3a24] flex items-center justify-center shadow-xl hover:scale-110 transition-transform active:scale-95">
                {isPlaying ? (<Pause className="w-8 h-8 text-amber-300 fill-current"/>) : (<Play className="w-8 h-8 text-amber-300 fill-current ml-1"/>)}
             </button>
          </div>

          {/* Indigenous Column */}
          <div className="flex-1 md:pr-10 text-center flex flex-col">
             <h3 className="font-display text-2xl font-black text-[#2f6d3a] mb-6 underline decoration-4 decoration-[#7cd88a] underline-offset-8">
               Patxôhã
             </h3>
             <div ref={boxRef} className="flex-1 lyrics-scroll overflow-y-auto space-y-4 px-4 pb-20">
                {Array.from({ length: maxLen }).map((_, i) => (<div key={i} ref={(el) => { lineRefs.current[i] = el; }} className={`transition-all duration-300 ${activeIdx === i ? 'scale-110' : 'opacity-60 grayscale'}`}>
                     <p className={`font-display text-xl md:text-2xl font-black leading-tight ${activeIdx === i ? 'text-[#2f6d3a]' : 'text-[#5b3a24]'}`}>
                       {indLines[i] || "..."}
                     </p>
                  </div>))}
             </div>
             
             <div className="mt-auto flex justify-center gap-4 pt-6">
                <button onClick={() => setIsPlaying(true)} className="bg-[#2f6d3a] text-white px-6 py-2 rounded-xl border-b-4 border-black/20 flex items-center gap-2 font-black text-sm uppercase shadow-lg active:translate-y-0.5 active:border-b-0">
                   <span className="text-lg">🔊</span> OUVIR
                </button>
                <button className="bg-[#7cd88a] text-[#064e3b] px-6 py-2 rounded-xl border-b-4 border-black/20 flex items-center gap-2 font-black text-sm uppercase shadow-lg active:translate-y-0.5 active:border-b-0">
                   <span className="text-lg">🎵</span> CANTAR JUNTO
                </button>
             </div>
          </div>

          {/* Portuguese Column */}
          <div className="flex-1 md:pl-10 text-center flex flex-col mt-12 md:mt-0">
             <h3 className="font-display text-2xl font-black text-[#c4632a] mb-6 underline decoration-4 decoration-[#ffd76a] underline-offset-8">
               Português
             </h3>
             <div className="flex-1 lyrics-scroll overflow-y-auto space-y-4 px-4 pb-20 pointer-events-none">
                {Array.from({ length: maxLen }).map((_, i) => (<div key={i} className={`transition-all duration-300 ${activeIdx === i ? 'scale-110' : 'opacity-60 grayscale'}`}>
                     <p className={`font-display text-xl md:text-2xl font-black leading-tight ${activeIdx === i ? 'text-[#c4632a]' : 'text-[#5b3a24]'}`}>
                       {ptLines[i] || "..."}
                     </p>
                  </div>))}
             </div>

             <div className="mt-auto flex justify-center gap-4 pt-6">
                <button onClick={() => setIsPlaying(true)} className="bg-[#c4632a] text-white px-6 py-2 rounded-xl border-b-4 border-black/20 flex items-center gap-2 font-black text-sm uppercase shadow-lg active:translate-y-0.5 active:border-b-0">
                   <span className="text-lg">🔊</span> OUVIR
                </button>
                <button className="bg-[#ffd76a] text-[#5b3a24] px-6 py-2 rounded-xl border-b-4 border-black/20 flex items-center gap-2 font-black text-sm uppercase shadow-lg active:translate-y-0.5 active:border-b-0">
                   <span className="text-lg">🎵</span> CANTAR JUNTO
                </button>
             </div>
          </div>
        </div>

        {/* Right Character Area */}
        <div className="hidden lg:flex flex-col justify-end p-8 w-64 shrink-0">
           <div className="relative group">
              <span className="text-9xl block drop-shadow-xl kid-bounce" style={{ animationDelay: '0.3s' }}>🧒🏽</span>
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white rounded-2xl px-4 py-2 text-sm font-black border-4 border-[#8b5a2b] shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                 Estou pronto!
              </div>
           </div>
        </div>

        {/* Sun Decor */}
        <div className="absolute top-6 right-6 text-6xl opacity-20 pointer-events-none kid-spin-slow">☀️</div>
      </div>

      {/* Close button */}
      <button onClick={onClose} className="absolute -top-4 -right-4 w-12 h-12 bg-rose-500 text-white rounded-full border-4 border-white shadow-xl flex items-center justify-center hover:scale-110 active:scale-90 transition-all z-30">
         <X className="w-8 h-8" strokeWidth={3}/>
      </button>

      <audio ref={audioRef} src={song.audio_url} onTimeUpdate={e => setProgress(e.currentTarget.currentTime)} onLoadedMetadata={e => setAudioDuration(e.currentTarget.duration)} onEnded={() => setIsPlaying(false)} className="hidden"/>
    </motion.div>);
}
export function MiniPlayer({ song, onClose }) {
    return <KidsSongPlayer song={song} mode="listen" onClose={onClose}/>;
}
function TribalBackdrop() {
    return (<div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
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
      <svg className="absolute inset-x-0 bottom-0 h-24 w-full text-emerald-500/70" viewBox="0 0 400 40" preserveAspectRatio="none">
        <path d="M0 40 L10 15 L20 40 L28 20 L38 40 L48 10 L58 40 L70 18 L80 40 L92 8 L104 40 L116 20 L128 40 L140 12 L152 40 L164 18 L176 40 L188 10 L200 40 L212 20 L224 40 L236 8 L248 40 L260 20 L272 40 L284 12 L296 40 L308 18 L320 40 L332 10 L344 40 L356 20 L368 40 L380 15 L392 40 L400 20 L400 40 Z" fill="currentColor"/>
      </svg>
    </div>);
}

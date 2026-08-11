import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, Play, Info, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AreaGate } from "@/components/area-gate";
import { SiteHeader } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { useLastArea } from "@/lib/last-area";

import v1 from "@/assets/videos/VID-20260630-WA0052.mp4.asset.json";
import v2 from "@/assets/videos/VID-20260630-WA0054.mp4.asset.json";
import v3 from "@/assets/videos/VID-20260630-WA0058.mp4.asset.json";
import v4 from "@/assets/videos/VID-20260630-WA0061.mp4.asset.json";
import v5 from "@/assets/videos/VID-20260630-WA0063.mp4.asset.json";
import v6 from "@/assets/videos/VID-20260630-WA0069.mp4.asset.json";
import v7 from "@/assets/videos/VID-20260630-WA0070.mp4.asset.json";
import v8 from "@/assets/videos/VID-20260701-WA0089.mp4.asset.json";
import v9 from "@/assets/videos/VID-20260701-WA0090.mp4.asset.json";
import v10 from "@/assets/videos/VID-20260701-WA0092.mp4.asset.json";
import categoriasBg from "@/assets/infantil-categorias-bg.jpg.asset.json";

export const Route = createFileRoute("/videos-infantil")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Vídeos e Registros da Aldeia — Awã Tech Infantil" },
      { name: "description", content: "Assista a vídeos divertidos e aprenda sobre a vida na aldeia Pataxó." },
      { property: "og:title", content: "Vídeos da Aldeia — Awã Tech Infantil" },
      { property: "og:description", content: "Galeria de vídeos divertidos para crianças aprenderem sobre a cultura Pataxó." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GuardedVideosInfantilPage,
});

type VideoItem = { url: string; title: string; desc: string; emoji: string; color: string };

const INFANTIL_VIDEOS: VideoItem[] = [
  { url: v1.url, title: "Brincadeiras", desc: "Veja como as crianças brincam na aldeia!", emoji: "🏹", color: "#ef476f" },
  { url: v2.url, title: "Natureza Viva", desc: "Os segredos da nossa floresta mágica.", emoji: "🌳", color: "#06d6a0" },
  { url: v3.url, title: "Cânticos", desc: "A alegria da roda de Awê.", emoji: "🎶", color: "#ffd166" },
  { url: v4.url, title: "Pinturas", desc: "Urucum e jenipapo nas cores da aldeia.", emoji: "🎨", color: "#118ab2" },
  { url: v5.url, title: "Nossa Casa", desc: "Conheça as ocas e a vida coletiva.", emoji: "🏡", color: "#8ecae6" },
  { url: v6.url, title: "Animais", desc: "Nossos amigos da mata atlântica.", emoji: "🦜", color: "#e76f51" },
  { url: v7.url, title: "Artesanato", desc: "Mãos que criam beleza com sementes.", emoji: "✨", color: "#c77dff" },
  { url: v8.url, title: "Histórias", desc: "Ouvindo a sabedoria dos anciãos.", emoji: "📖", color: "#f4a261" },
  { url: v9.url, title: "Respeito", desc: "Cuidando da terra e do nosso povo.", emoji: "🤝", color: "#073b4c" },
  { url: v10.url, title: "Futuro", desc: "A força da cultura Pataxó hoje.", emoji: "🌟", color: "#06d6a0" },
];

function VideosInfantilPage() {
  const backTo = useLastArea();
  const { t } = useTranslation();
  const [selected, setSelected] = useState<VideoItem | null>(null);

  return (
    <div className="kids-theme min-h-screen text-foreground bg-[#fdfcf0]"
         style={{ backgroundImage: `linear-gradient(rgba(253,252,240,0.8), rgba(253,252,240,0.9)), url(${categoriasBg.url})`, backgroundSize: 'cover', backgroundAttachment: 'fixed' }}>
      
      <style>{`
        @keyframes video-pop { from{opacity:0; transform:scale(0.9)} to{opacity:1; transform:scale(1)} }
        .video-card { animation: video-pop 0.4s ease-out both; }
      `}</style>

      <SiteHeader mode="infantil" />

      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b-4 border-[#ffd166]/40">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3">
          <Link to={backTo as "/infantil"} className="inline-flex items-center gap-1 rounded-full bg-[#118ab2] px-3 py-1.5 text-xs font-black uppercase text-white shadow hover:scale-105 active:scale-95">
            <ArrowLeft className="h-4 w-4" /> {t("common.voltar") || "Volta"}
          </Link>
          <h1 className="font-display text-xl font-black text-[#118ab2] flex-1 text-center pr-10">
            🎬 Vídeos e Registros
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 pb-24">
        <section className="text-center mb-8">
            <div className="inline-block rounded-3xl bg-white/90 p-6 shadow-xl border-4 border-[#06d6a0]/30">
                <span className="text-5xl block mb-2">🎥</span>
                <h2 className="text-2xl font-black text-[#073b4c]" style={{ fontFamily: "'Archivo Black', sans-serif" }}>Cine Aldeia</h2>
                <p className="text-[#073b4c]/70 font-bold mt-1">Assista aos registros mágicos do nosso povo!</p>
            </div>
        </section>

        <div className="grid gap-6 sm:grid-cols-2">
          {INFANTIL_VIDEOS.map((v, i) => (
            <button
              key={i}
              onClick={() => setSelected(v)}
              className="video-card group text-left overflow-hidden rounded-[2rem] border-4 border-white bg-white/90 shadow-lg transition hover:-translate-y-1 hover:shadow-xl active:scale-[0.98]"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="relative aspect-video bg-slate-200">
                <video src={v.url} className="h-full w-full object-cover opacity-80" preload="metadata" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-[#ef476f] shadow-xl ring-4 ring-white/50">
                    <Play className="h-8 w-8 fill-current translate-x-0.5" />
                  </div>
                </div>
                <div className="absolute top-3 left-3 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow text-2xl" style={{ border: `3px solid ${v.color}` }}>
                  {v.emoji}
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-display text-lg font-black text-[#073b4c] uppercase">{v.title}</h3>
                <p className="mt-1 text-sm text-[#073b4c]/70 font-bold">{v.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </main>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl overflow-hidden rounded-[2.5rem] border-8 border-white bg-white shadow-2xl">
            <button
              onClick={() => setSelected(null)}
              className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-[#ef476f] text-white shadow-lg ring-4 ring-white hover:scale-110 active:scale-95"
            >
              <X className="h-6 w-6" />
            </button>
            <video
              src={selected.url}
              controls
              autoPlay
              className="w-full bg-black"
            />
            <div className="p-6 text-center">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full px-4 py-1 text-xs font-black uppercase text-white shadow" style={{ background: selected.color }}>
                {selected.emoji} {selected.title}
              </div>
              <p className="text-lg font-bold text-[#073b4c]">{selected.desc}</p>
            </div>
          </div>
        </div>
      )}

      <SiteFooter />
    </div>
  );
}

function GuardedVideosInfantilPage() {
  return (
    <AreaGate plan="infantil">
      <VideosInfantilPage />
    </AreaGate>
  );
}

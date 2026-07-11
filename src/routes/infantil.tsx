import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Gamepad2,
  Music2,
  Hand,
  Video,
  BookOpen,
  Map as MapIcon,
  Leaf,
  Bird,
} from "lucide-react";

import { SiteFooter } from "@/components/home/site-footer";
import { SiteHeader } from "@/components/home/site-header";
import infantilHero from "@/assets/infantil-hero.png.asset.json";

export const Route = createFileRoute("/infantil")({
  head: () => ({
    meta: [
      { title: "Awã Tech Infantil — Aprender brincando" },
      {
        name: "description",
        content:
          "Área infantil do Awã Tech: jogos, músicas, saudações, histórias, vídeos e trilhas para crianças aprenderem línguas indígenas se divertindo.",
      },
      { property: "og:title", content: "Awã Tech Infantil" },
      {
        property: "og:description",
        content: "Jogos, músicas e vídeos para crianças aprenderem línguas indígenas brincando.",
      },
    ],
  }),
  component: InfantilHome,
});

type Tile = {
  to: "/jogos" | "/musicas" | "/saudacoes" | "/videos" | "/historias" | "/trilhas";
  title: string;
  desc: string;
  emoji: string;
  icon: React.ReactNode;
  bg: string;
  ring: string;
};

const tiles: Tile[] = [
  {
    to: "/trilhas",
    title: "Trilhas",
    desc: "Caminhe pela aldeia",
    emoji: "🗺️",
    icon: <MapIcon className="h-7 w-7" />,
    bg: "bg-gradient-to-br from-amber-300 to-orange-400",
    ring: "ring-orange-200",
  },
  {
    to: "/jogos",
    title: "Jogos",
    desc: "Brincadeiras Pataxó",
    emoji: "🧩",
    icon: <Gamepad2 className="h-7 w-7" />,
    bg: "bg-gradient-to-br from-fuchsia-400 to-pink-500",
    ring: "ring-pink-200",
  },
  {
    to: "/musicas",
    title: "Cânticos",
    desc: "Cante junto",
    emoji: "🥁",
    icon: <Music2 className="h-7 w-7" />,
    bg: "bg-gradient-to-br from-red-400 to-rose-500",
    ring: "ring-rose-200",
  },
  {
    to: "/historias",
    title: "Histórias",
    desc: "Contos da floresta",
    emoji: "📖",
    icon: <BookOpen className="h-7 w-7" />,
    bg: "bg-gradient-to-br from-yellow-300 to-amber-500",
    ring: "ring-amber-200",
  },
  {
    to: "/saudacoes",
    title: "Saudações",
    desc: "Aprenda a dizer olá",
    emoji: "👋",
    icon: <Hand className="h-7 w-7" />,
    bg: "bg-gradient-to-br from-sky-400 to-cyan-500",
    ring: "ring-cyan-200",
  },
  {
    to: "/videos",
    title: "Vídeos",
    desc: "Assista e aprenda",
    emoji: "🎬",
    icon: <Video className="h-7 w-7" />,
    bg: "bg-gradient-to-br from-emerald-400 to-green-600",
    ring: "ring-emerald-200",
  },
];

function InfantilHome() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-200 via-emerald-100 to-amber-100 text-foreground">
      <SiteHeader mode="infantil" />

      <main className="mx-auto max-w-6xl px-4 pb-16 md:px-8">
        {/* Hero — village vibe */}
        <section className="relative mt-4 overflow-hidden rounded-[2rem] border-4 border-amber-300 bg-gradient-to-b from-sky-300 via-emerald-300 to-amber-200 p-6 shadow-[0_20px_60px_-25px_rgba(0,0,0,0.35)] md:p-10">
          <div className="pointer-events-none absolute -left-4 top-4 text-5xl md:text-6xl">🌴</div>
          <div className="pointer-events-none absolute right-4 top-6 text-4xl md:text-5xl">☀️</div>
          <div className="pointer-events-none absolute bottom-3 left-6 text-3xl md:text-4xl">🌺</div>
          <div className="pointer-events-none absolute bottom-4 right-8 text-3xl md:text-4xl">🦜</div>

          <div className="relative text-center">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1 text-xs font-bold uppercase tracking-widest text-emerald-900 shadow">
              <Leaf className="h-3.5 w-3.5" /> Awã Tech Infantil
            </div>
            <h1 className="mt-3 font-display text-4xl font-black uppercase tracking-wide text-white drop-shadow-[0_3px_0_rgba(0,0,0,0.25)] md:text-6xl">
              Bem-vindo à Aldeia!
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm font-semibold text-emerald-950/80 md:text-base">
              Escolha uma trilha e vamos aprender Patxohã brincando 🌿
            </p>
          </div>
        </section>

        {/* Menu tiles */}
        <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tiles.map((t) => (
            <Link
              key={t.to}
              to={t.to}
              className={`group relative flex flex-col items-center gap-3 rounded-[1.75rem] ${t.bg} p-6 text-center text-white shadow-[0_15px_35px_-15px_rgba(0,0,0,0.45)] ring-4 ${t.ring} transition-transform hover:-translate-y-2 hover:rotate-[-1deg] active:scale-95`}
            >
              <div className="grid h-20 w-20 place-items-center rounded-full bg-white/25 text-4xl shadow-inner backdrop-blur-sm ring-4 ring-white/40">
                <span aria-hidden>{t.emoji}</span>
              </div>
              <div className="flex items-center gap-2">
                {t.icon}
                <div className="font-display text-2xl font-black uppercase tracking-wide drop-shadow-[0_2px_0_rgba(0,0,0,0.25)]">
                  {t.title}
                </div>
              </div>
              <p className="text-sm font-semibold text-white/95">{t.desc}</p>
              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-white/25 px-3 py-1 text-xs font-bold uppercase tracking-wider ring-2 ring-white/40">
                Vamos lá →
              </span>
            </Link>
          ))}
        </section>

        {/* Fun footer strip */}
        <section className="mt-10 flex items-center justify-center gap-4 rounded-3xl border-2 border-dashed border-emerald-400 bg-white/60 p-4 text-emerald-900">
          <Bird className="h-6 w-6" />
          <span className="font-display text-sm font-bold uppercase tracking-wide md:text-base">
            Aprender é uma aventura na floresta!
          </span>
          <Leaf className="h-6 w-6" />
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

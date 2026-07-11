import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Gamepad2,
  Music2,
  Hand,
  Video,
  BookOpen,
  Map as MapIcon,
  Leaf,
  Sparkles,
} from "lucide-react";

import { SiteFooter } from "@/components/home/site-footer";
import { SiteHeader } from "@/components/home/site-header";
import infantilHero from "@/assets/infantil-hero.png.asset.json";

export const Route = createFileRoute("/infantil")({
  head: () => ({
    meta: [
      { title: "Awã Tech Infantil — Trilha da Aldeia" },
      {
        name: "description",
        content:
          "Menu infantil do Awã Tech: trilhas, jogos, cânticos, histórias, saudações e vídeos para crianças aprenderem Patxohã brincando.",
      },
      { property: "og:title", content: "Awã Tech Infantil — Trilha da Aldeia" },
      {
        property: "og:description",
        content: "Jogos, cânticos, histórias e vídeos para crianças aprenderem Patxohã.",
      },
      { property: "og:image", content: infantilHero.url },
    ],
  }),
  component: InfantilHome,
});

type Tile = {
  to: "/trilhas" | "/jogos" | "/musicas" | "/saudacoes" | "/videos" | "/historias" | "/conhecimento";
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
    icon: <MapIcon className="h-6 w-6" />,
    bg: "bg-gradient-to-br from-amber-300 to-orange-500",
    ring: "ring-orange-200",
  },
  {
    to: "/jogos",
    title: "Jogos",
    desc: "Brincadeiras Pataxó",
    emoji: "🧩",
    icon: <Gamepad2 className="h-6 w-6" />,
    bg: "bg-gradient-to-br from-fuchsia-400 to-pink-500",
    ring: "ring-pink-200",
  },
  {
    to: "/musicas",
    title: "Cânticos",
    desc: "Cante junto",
    emoji: "🥁",
    icon: <Music2 className="h-6 w-6" />,
    bg: "bg-gradient-to-br from-red-400 to-rose-500",
    ring: "ring-rose-200",
  },
  {
    to: "/historias",
    title: "Histórias",
    desc: "Contos da floresta",
    emoji: "📖",
    icon: <BookOpen className="h-6 w-6" />,
    bg: "bg-gradient-to-br from-yellow-300 to-amber-500",
    ring: "ring-amber-200",
  },
  {
    to: "/saudacoes",
    title: "Saudações",
    desc: "Aprenda a dizer olá",
    emoji: "👋",
    icon: <Hand className="h-6 w-6" />,
    bg: "bg-gradient-to-br from-sky-400 to-cyan-500",
    ring: "ring-cyan-200",
  },
  {
    to: "/videos",
    title: "Vídeos",
    desc: "Assista e aprenda",
    emoji: "🎬",
    icon: <Video className="h-6 w-6" />,
    bg: "bg-gradient-to-br from-emerald-400 to-green-600",
    ring: "ring-emerald-200",
  },
  {
    to: "/conhecimento",
    title: "Conhecimento",
    desc: "Aprender, letras, respeito e desenhar",
    emoji: "🌿",
    icon: <Sparkles className="h-6 w-6" />,
    bg: "bg-gradient-to-br from-lime-400 to-emerald-600",
    ring: "ring-lime-200",
  },
];

function InfantilHome() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-200 via-emerald-100 to-amber-100 text-foreground">
      <SiteHeader mode="infantil" />

      <main className="mx-auto max-w-6xl px-4 pb-16 md:px-8">
        {/* Hero — Trilha da Aldeia illustration */}
        <section className="relative mt-4 overflow-hidden rounded-[2rem] border-4 border-amber-300 shadow-[0_20px_60px_-25px_rgba(0,0,0,0.35)]">
          <img
            src={infantilHero.url}
            alt="Trilha da Aldeia — Awã Tech Infantil"
            className="block h-auto w-full select-none"
            draggable={false}
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-emerald-950/70 via-emerald-900/20 to-transparent p-4 pt-16 text-center">
            <p className="mx-auto max-w-xl font-display text-sm font-black uppercase tracking-widest text-white drop-shadow md:text-base">
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
        <section className="mt-10 flex items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-emerald-400 bg-white/60 p-4 text-emerald-900">
          <Leaf className="h-6 w-6" />
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

import { createFileRoute, Link } from "@tanstack/react-router";
import { Gamepad2, Music2, Hand, Video, Sparkles } from "lucide-react";

import { GreetingOfMoment } from "@/components/home/greeting-of-moment";
import { SiteFooter } from "@/components/home/site-footer";
import { SiteHeader } from "@/components/home/site-header";

export const Route = createFileRoute("/infantil")({
  head: () => ({
    meta: [
      { title: "Awã Tech Infantil — Aprender brincando" },
      {
        name: "description",
        content:
          "Área infantil do Awã Tech: jogos, músicas, saudações e vídeos para crianças aprenderem línguas indígenas se divertindo.",
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
  icon: React.ReactNode;
  color: string;
};

const tiles: Tile[] = [
  { to: "/jogos", title: "Jogos", desc: "Desafios e brincadeiras", icon: <Gamepad2 className="h-8 w-8" />, color: "from-gold/30 to-leaf/20" },
  { to: "/musicas", title: "Músicas", desc: "Cantigas e ritmos", icon: <Music2 className="h-8 w-8" />, color: "from-leaf/30 to-forest-deep/40" },
  { to: "/saudacoes", title: "Saudações", desc: "Aprenda a dizer olá", icon: <Hand className="h-8 w-8" />, color: "from-gold/25 to-forest-deep/40" },
  { to: "/videos", title: "Vídeos", desc: "Assista e aprenda", icon: <Video className="h-8 w-8" />, color: "from-leaf/25 to-gold/20" },
  { to: "/historias", title: "Histórias", desc: "Narrativas encantadas", icon: <Sparkles className="h-8 w-8" />, color: "from-gold/30 to-leaf/25" },
  { to: "/trilhas", title: "Trilhas", desc: "Aventuras de palavras", icon: <Sparkles className="h-8 w-8" />, color: "from-forest-deep/40 to-leaf/25" },
];

function InfantilHome() {
  return (
    <div className="min-h-screen text-foreground">
      <SiteHeader mode="infantil" />

      <main className="mx-auto max-w-6xl px-4 md:px-8">
        <section className="mt-6 rounded-3xl border border-gold/30 bg-gradient-to-br from-gold/15 to-leaf/15 p-6 md:p-10 text-center">
          <h1 className="font-display text-3xl font-black uppercase tracking-wide text-cream md:text-5xl">
            Awã Tech Infantil
          </h1>
          <p className="mt-3 text-sm text-foreground/80 md:text-base">
            Bem-vindo! Escolha uma atividade para começar a brincar e aprender.
          </p>
        </section>

        <GreetingOfMoment />

        <section className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {tiles.map((t) => (
            <Link
              key={t.to}
              to={t.to}
              className={`group flex flex-col items-start gap-3 rounded-3xl border border-gold/25 bg-gradient-to-br ${t.color} p-5 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.6)] transition hover:-translate-y-1 hover:border-gold/60`}
            >
              <div className="grid h-14 w-14 place-items-center rounded-2xl border border-gold/40 bg-forest-deep/40 text-gold">
                {t.icon}
              </div>
              <div className="font-display text-xl font-black uppercase tracking-wide text-cream">
                {t.title}
              </div>
              <p className="text-sm text-foreground/80">{t.desc}</p>
            </Link>
          ))}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

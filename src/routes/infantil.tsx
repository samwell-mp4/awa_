import { createFileRoute, Link } from "@tanstack/react-router";

import { SiteFooter } from "@/components/home/site-footer";
import { SiteHeader } from "@/components/home/site-header";
import menuImg from "@/assets/trilha-aldeia-menu.png.asset.json";
import logoImg from "@/assets/awa-tech-logo.png.asset.json";

export const Route = createFileRoute("/infantil")({
  head: () => ({
    meta: [
      { title: "Awã Tech Infantil — Trilha da Aldeia" },
      {
        name: "description",
        content:
          "Toque nos selos da Trilha da Aldeia para abrir Trilhas, Cânticos, História Infantil e Jogos.",
      },
      { property: "og:title", content: "Awã Tech Infantil — Trilha da Aldeia" },
      {
        property: "og:description",
        content: "Menu ilustrado infantil: toque em cada selo para aprender.",
      },
      { property: "og:image", content: menuImg.url },
    ],
  }),
  component: InfantilHome,
});

type Hotspot = {
  to: "/trilhas" | "/canticos" | "/historias" | "/jogos";
  label: string;
  x: number; // % from left (center of badge)
  y: number; // % from top (center of badge)
  size: number; // % of image width
};

const hotspots: Hotspot[] = [
  { to: "/trilhas", label: "Trilhas", x: 51, y: 22, size: 22 },
  { to: "/canticos", label: "Cântico", x: 76, y: 30, size: 22 },
  { to: "/historias", label: "História Infantil", x: 26, y: 40, size: 24 },
  { to: "/jogos", label: "Jogos", x: 63, y: 55, size: 22 },
];

function InfantilHome() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-200 via-emerald-100 to-amber-100 text-foreground">
      <SiteHeader mode="infantil" />

      <main className="mx-auto max-w-3xl px-3 pb-16 md:px-6">
        <div className="mt-4 flex justify-center">
          <img
            src={logoImg.url}
            alt="Awã Tech — Línguas indígenas, culturas vivas"
            className="h-32 w-32 rounded-3xl object-contain shadow-xl ring-4 ring-amber-300 md:h-40 md:w-40"
            draggable={false}
          />
        </div>
        <section className="relative mt-4 overflow-hidden rounded-[2rem] border-4 border-amber-300 shadow-[0_20px_60px_-25px_rgba(0,0,0,0.35)]">
          <img
            src={menuImg.url}
            alt="Trilha da Aldeia — toque em cada selo para abrir"
            className="block h-auto w-full select-none"
            draggable={false}
          />

          {hotspots.map((h) => (
            <Link
              key={h.to}
              to={h.to}
              aria-label={`Abrir ${h.label}`}
              title={h.label}
              className="group absolute -translate-x-1/2 -translate-y-1/2 rounded-full ring-4 ring-white/0 transition-all hover:ring-white/90 hover:scale-110 focus-visible:ring-white/90 focus-visible:outline-none active:scale-95"
              style={{
                left: `${h.x}%`,
                top: `${h.y}%`,
                width: `${h.size}%`,
                aspectRatio: "1 / 1",
              }}
            >
              <span className="sr-only">{h.label}</span>
            </Link>
          ))}
        </section>

        <p className="mt-4 text-center font-display text-sm font-black uppercase tracking-widest text-emerald-900 md:text-base">
          Toque em um selo para começar 🌿
        </p>
      </main>

      <SiteFooter />
    </div>
  );
}

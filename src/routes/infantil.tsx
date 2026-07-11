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

      <main className="w-full px-0 pb-16">
        <img
          src={logoImg.url}
          alt="Awã Tech — Línguas indígenas, culturas vivas"
          className="block h-auto w-full select-none"
          draggable={false}
        />
        <section className="relative mt-4 w-full overflow-hidden">
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
              className="group absolute z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full ring-4 ring-white/70 bg-white/20 backdrop-blur-sm transition-all hover:ring-amber-300 hover:bg-white/40 hover:scale-110 focus-visible:ring-amber-300 focus-visible:outline-none active:scale-95 animate-pulse"
              style={{
                left: `${h.x}%`,
                top: `${h.y}%`,
                width: `${h.size}%`,
                aspectRatio: "1 / 1",
              }}
            >
              <span className="rounded-full bg-emerald-700/90 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-white shadow-lg md:text-xs">
                {h.label}
              </span>
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

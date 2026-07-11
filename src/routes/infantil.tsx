import { createFileRoute, Link } from "@tanstack/react-router";

import { SiteFooter } from "@/components/home/site-footer";
import { SiteHeader } from "@/components/home/site-header";
import menuImg from "@/assets/trilha-aldeia-menu.png.asset.json";

export const Route = createFileRoute("/infantil")({
  head: () => ({
    meta: [
      { title: "Awã Tech Infantil — Trilha da Aldeia" },
      {
        name: "description",
        content:
          "Toque nos selos da Trilha da Aldeia para abrir Trilhas, Cânticos, Histórias e Jogos.",
      },
      { property: "og:title", content: "Awã Tech Infantil — Trilha da Aldeia" },
      {
        property: "og:description",
        content: "Menu ilustrado infantil: toque nos selos para aprender Patxohã.",
      },
      { property: "og:image", content: menuImg.url },
    ],
  }),
  component: InfantilHome,
});

type Hotspot = {
  to: "/trilhas" | "/musicas" | "/historias" | "/jogos";
  label: string;
  /** center position in % of the image */
  x: number;
  y: number;
  /** size in % of image width */
  size: number;
};

// Positions tuned to the illustrated badges in the artwork.
const hotspots: Hotspot[] = [
  { to: "/trilhas", label: "Trilhas", x: 51, y: 22, size: 22 },
  { to: "/musicas", label: "Cântico", x: 76, y: 30, size: 22 },
  { to: "/historias", label: "História Infantil", x: 26, y: 40, size: 24 },
  { to: "/jogos", label: "Jogos", x: 63, y: 55, size: 22 },
];

function InfantilHome() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-200 via-emerald-100 to-amber-100 text-foreground">
      <SiteHeader mode="infantil" />

      <main className="mx-auto max-w-3xl px-3 pb-16 md:px-6">
        <section className="relative mt-4 overflow-hidden rounded-[2rem] border-4 border-amber-300 shadow-[0_20px_60px_-25px_rgba(0,0,0,0.35)]">
          <img
            src={menuImg.url}
            alt="Trilha da Aldeia — toque nos selos para começar"
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
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-full bg-white/0 transition group-hover:bg-white/10"
              />
            </Link>
          ))}
        </section>

        <p className="mt-4 text-center font-display text-sm font-black uppercase tracking-widest text-emerald-900 md:text-base">
          Toque em um selo da trilha para começar 🌿
        </p>
      </main>

      <SiteFooter />
    </div>
  );
}

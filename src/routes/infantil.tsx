import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter } from "@/components/home/site-footer";
import { SiteHeader } from "@/components/home/site-header";
import infantilMenu from "@/assets/infantil-menu.jpg.asset.json";
import infantilLogo from "@/assets/infantil-logo-new.jpg.asset.json";

export const Route = createFileRoute("/infantil")({
  head: () => ({
    meta: [
      { title: "Awã Tech Infantil — Trilha da Aldeia" },
      {
        name: "description",
        content:
          "Área infantil do Awã Tech: trilhas, cânticos, histórias, jogos e amizade para crianças aprenderem línguas indígenas brincando.",
      },
      { property: "og:title", content: "Awã Tech Infantil" },
      {
        property: "og:description",
        content: "Trilha da Aldeia — menu ilustrado para crianças no Awã Tech.",
      },
      { property: "og:image", content: infantilMenu.url },
    ],
  }),
  component: InfantilHome,
});

type Hotspot = {
  to: "/trilhas" | "/musicas" | "/historias" | "/jogos" | "/saudacoes";
  label: string;
  // percentages relative to the image
  top: string;
  left: string;
};

// Coordinates tuned to the illustrated badges in the menu image
const hotspots: Hotspot[] = [
  { to: "/trilhas", label: "Trilhas", top: "24%", left: "50%" },
  { to: "/musicas", label: "Cântico", top: "32%", left: "74%" },
  { to: "/historias", label: "História Infantil", top: "40%", left: "22%" },
  { to: "/jogos", label: "Jogos", top: "58%", left: "64%" },
  { to: "/saudacoes", label: "Amizade", top: "68%", left: "42%" },
];

function InfantilHome() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-200 via-emerald-100 to-amber-100 text-foreground">
      <SiteHeader mode="infantil" />

      <main className="mx-auto max-w-3xl px-3 pb-16 md:px-6">
        <div className="-mx-3 md:-mx-6 mt-0">
          <img
            src={infantilLogo.url}
            alt="Awã Tech — Línguas indígenas, culturas vivas"
            className="block w-screen max-w-none h-auto relative left-1/2 -translate-x-1/2"
            fetchPriority="high"
            draggable={false}
          />
        </div>


        <section className="relative mt-4 overflow-hidden rounded-[2rem] border-4 border-amber-300 shadow-[0_20px_60px_-25px_rgba(0,0,0,0.45)]">
          <img
            src={infantilMenu.url}
            alt="Awã Tech Infantil — Trilha da Aldeia"
            className="block w-full h-auto select-none"
            fetchPriority="high"
            draggable={false}
          />

          {hotspots.map((h) => (
            <Link
              key={h.to + h.label}
              to={h.to}
              aria-label={h.label}
              style={{ top: h.top, left: h.left }}
              className="group absolute -translate-x-1/2 -translate-y-1/2"
            >
              <span className="block h-[18vw] max-h-28 w-[18vw] max-w-28 rounded-full ring-4 ring-white/0 transition group-hover:ring-white/70 group-active:scale-95 group-hover:scale-105" />
              <span className="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-full bg-emerald-900/85 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white opacity-0 shadow group-hover:opacity-100">
                {h.label} →
              </span>
            </Link>
          ))}
        </section>

        {/* Fallback textual menu for accessibility / small screens */}
        <nav className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {hotspots.map((h) => (
            <Link
              key={"list-" + h.to + h.label}
              to={h.to}
              className="rounded-2xl border-2 border-amber-300 bg-white/70 px-3 py-3 text-center font-display text-sm font-black uppercase tracking-wide text-emerald-900 shadow-sm hover:bg-white"
            >
              {h.label}
            </Link>
          ))}
        </nav>
      </main>

      <SiteFooter />
    </div>
  );
}

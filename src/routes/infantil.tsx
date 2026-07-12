import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
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

type HotspotKey = "trilhas" | "cantico" | "historia" | "jogos" | "amizade";
type Hotspot = {
  to: "/trilhas" | "/musicas" | "/historias" | "/jogos-infantil" | "/amizade";
  key: HotspotKey;
  top: string;
  left: string;
};

const hotspots: Hotspot[] = [
  { to: "/trilhas", key: "trilhas", top: "24%", left: "50%" },
  { to: "/musicas", key: "cantico", top: "32%", left: "74%" },
  { to: "/historias", key: "historia", top: "40%", left: "22%" },
  { to: "/jogos-infantil", key: "jogos", top: "58%", left: "64%" },
  { to: "/amizade", key: "amizade", top: "65%", left: "60%" },
];

function InfantilHome() {
  const { t } = useTranslation();
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
            alt={t("infantil.title")}
            className="block w-full h-auto select-none"
            fetchPriority="high"
            draggable={false}
          />

          {hotspots.map((h) => {
            const label = t(`infantil.hotspots.${h.key}`);
            const isAmizade = h.key === "amizade";
            return (
              <Link
                key={h.to + h.key}
                to={h.to}
                aria-label={label}
                style={{ top: h.top, left: h.left }}
                className="group absolute -translate-x-1/2 -translate-y-1/2"
              >
                {isAmizade ? (
                  <span className="relative block h-[18vw] max-h-28 w-[18vw] max-w-28">
                    <span className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-300 via-orange-400 to-amber-600 shadow-[0_6px_18px_-4px_rgba(120,60,0,0.55)] ring-4 ring-amber-200 transition group-hover:scale-105 group-hover:ring-white/80" />
                    <span className="absolute inset-[14%] rounded-full bg-gradient-to-br from-amber-200 to-amber-400 grid place-items-center text-[6vw] max-text-[2rem] drop-shadow">
                      💛
                    </span>
                    <span className="absolute left-1/2 top-[102%] -translate-x-1/2 whitespace-nowrap rounded-md bg-amber-500 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-950 shadow">
                      {label}
                    </span>
                  </span>
                ) : (
                  <>
                    <span className="block h-[18vw] max-h-28 w-[18vw] max-w-28 rounded-full ring-4 ring-white/0 transition group-hover:ring-white/70 group-active:scale-95 group-hover:scale-105" />
                    <span className="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-full bg-emerald-900/85 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white opacity-0 shadow group-hover:opacity-100">
                      {label} →
                    </span>
                  </>
                )}
              </Link>
            );

          })}
        </section>

        {/* Fallback textual menu for accessibility / small screens */}
        <nav className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {hotspots.map((h) => (
            <Link
              key={"list-" + h.to + h.key}
              to={h.to}
              className="rounded-2xl border-2 border-amber-300 bg-white/70 px-3 py-3 text-center font-display text-sm font-black uppercase tracking-wide text-emerald-900 shadow-sm hover:bg-white"
            >
              {t(`infantil.hotspots.${h.key}`)}
            </Link>
          ))}
        </nav>
      </main>


      <SiteFooter />
    </div>
  );
}

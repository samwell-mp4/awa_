import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { SiteFooter } from "@/components/home/site-footer";
import { SiteHeader } from "@/components/home/site-header";
import { supabase } from "@/integrations/supabase/client";
import { getPaddleEnvironment } from "@/lib/paddle";
import { setLastArea } from "@/lib/last-area";
import infantilMenu from "@/assets/infantil-menu.jpg.asset.json";
import infantilLogo from "@/assets/infantil-logo-new.jpg.asset.json";
import categoriasBg from "@/assets/infantil-categorias-bg.jpg.asset.json";
import menuVideo from "@/assets/infantil-menu-video.mp4.asset.json";



export const Route = createFileRoute("/infantil")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
    const { data: hasAccess } = await supabase.rpc("has_plan_access", {
      _user_id: data.user.id,
      _plan: "infantil",
      _check_env: getPaddleEnvironment(),
    });
    if (!hasAccess) throw redirect({ to: "/planos", search: { need: "infantil" } as any });
  },
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
  to: "/trilhas-infantil" | "/musicas-infantil" | "/historias-infantil" | "/jogos-infantil" | "/amizade";
  key: HotspotKey;
  top: string;
  left: string;
};

const hotspots: Hotspot[] = [
  { to: "/trilhas-infantil", key: "trilhas", top: "24%", left: "50%" },
  { to: "/musicas-infantil", key: "cantico", top: "32%", left: "74%" },
  { to: "/historias-infantil", key: "historia", top: "40%", left: "22%" },
  { to: "/jogos-infantil", key: "jogos", top: "40%", left: "82%" },
  { to: "/amizade", key: "amizade", top: "65%", left: "60%" },
];

function InfantilHome() {
  const { t } = useTranslation();
  useEffect(() => setLastArea("/infantil"), []);

  return (
    <div className="kids-theme min-h-screen text-foreground">
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
            const isTrilhas = h.key === "trilhas";
            return (
              <Link
                key={h.to + h.key}
                to={h.to}
                aria-label={label}
                style={{ top: h.top, left: h.left, perspective: "600px" }}
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
                ) : isTrilhas ? (
                  <>
                    <span className="block h-[18vw] max-h-28 w-[18vw] max-w-28 rounded-full ring-4 ring-white/0 transition group-hover:ring-white/70 group-active:scale-95 group-hover:scale-105" />
                    <span className="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-full bg-emerald-900/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow">
                      {label}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="block h-[18vw] max-h-28 w-[18vw] max-w-28 rounded-full ring-4 ring-white/0 transition group-hover:ring-white/70 group-active:scale-95 group-hover:scale-105" />
                    <span className="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-full bg-emerald-900/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow">
                      {label}
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

        {/* Categorias com foto de fundo — Saudações, Família, Natureza, Animais */}
        <section className="relative mt-8 overflow-hidden rounded-[2rem] border-4 border-emerald-300 shadow-[0_20px_60px_-25px_rgba(0,0,0,0.45)]">
          <img
            src={categoriasBg.url}
            alt="Crianças Pataxó na floresta"
            className="block w-full h-auto select-none"
            draggable={false}
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-b from-transparent via-emerald-950/40 to-emerald-950/85 p-4">
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {[
                { slug: "saudacoes", key: "trailSaudacoes", emoji: "👋" },
                { slug: "familia", key: "trailFamilia", emoji: "👨‍👩‍👧" },
                { slug: "natureza", key: "trailNatureza", emoji: "🌳" },
                { slug: "animais", key: "trailAnimais", emoji: "🦜" },
              ].map((c) => (
                <Link
                  key={c.slug}
                  to="/trilhas/$slug"
                  params={{ slug: c.slug }}
                  className="group flex items-center gap-2 rounded-2xl border-2 border-white/70 bg-white/90 px-3 py-3 text-left font-display text-sm font-black uppercase tracking-wide text-emerald-900 shadow-lg backdrop-blur transition hover:-translate-y-0.5 hover:bg-white md:text-base"
                >
                  <span className="text-2xl md:text-3xl">{c.emoji}</span>
                  <span>{t(`common.${c.key}`)}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>


      <SiteFooter />
    </div>
  );
}

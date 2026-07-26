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
  emoji: string;
  color: string;
};

const hotspots: Hotspot[] = [
  { to: "/trilhas-infantil", key: "trilhas", emoji: "🗺️", color: "#06d6a0" },
  { to: "/musicas-infantil", key: "cantico", emoji: "🎶", color: "#ef476f" },
  { to: "/historias-infantil", key: "historia", emoji: "📖", color: "#f4a261" },
  { to: "/jogos-infantil", key: "jogos", emoji: "🎮", color: "#118ab2" },
  { to: "/amizade", key: "amizade", emoji: "💛", color: "#c77dff" },
];

function InfantilHome() {
  const { t, i18n } = useTranslation();
  useEffect(() => setLastArea("/infantil"), []);
  const languageKey = (i18n.resolvedLanguage || i18n.language || "pt").slice(0, 2).toLowerCase();

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

        <section key={languageKey} className="relative mt-4 overflow-hidden rounded-[2rem] border-4 border-amber-300 shadow-[0_20px_60px_-25px_rgba(0,0,0,0.45)]">
          <video
            src={menuVideo.url}
            poster={infantilMenu.url}
            className="block w-full h-auto select-none"
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            aria-label={t("infantil.title")}
            draggable={false}
          />
        </section>

        {/* Menu labels below the video */}
        <section key={`labels-${languageKey}`} className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
          {hotspots.map((h) => (
            <Link
              key={`${languageKey}-${h.to}-${h.key}`}
              to={h.to}
              aria-label={t(`infantil.hotspots.${h.key}`)}
              className="flex flex-col items-center gap-1 rounded-2xl border-2 border-white/70 bg-white/95 px-3 py-3 font-display text-sm font-black uppercase tracking-wide text-emerald-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-white md:text-base"
              style={{ borderColor: h.color }}
            >
              <span className="text-2xl md:text-3xl" aria-hidden>{h.emoji}</span>
              <span className="text-center leading-tight">{t(`infantil.hotspots.${h.key}`)}</span>
            </Link>
          ))}
        </section>



        {/* Categorias com foto de fundo — Saudações, Família, Natureza, Animais */}
        <section key={`categorias-${languageKey}`} className="relative mt-8 overflow-hidden rounded-[2rem] border-4 border-emerald-300 shadow-[0_20px_60px_-25px_rgba(0,0,0,0.45)]">
          <img
            src={categoriasBg.url}
            alt="Crianças Pataxó na floresta"
            className="block w-full h-auto select-none"
            draggable={false}
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-b from-transparent via-emerald-950/40 to-emerald-950/85 p-4">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
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
                  aria-label={t(`common.${c.key}`)}
                  className="flex flex-col items-center gap-1 rounded-2xl border-2 border-white/70 bg-white/95 px-3 py-3 font-display text-sm font-black uppercase tracking-wide text-emerald-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-white md:text-base"
                >
                  <span className="text-2xl md:text-3xl" aria-hidden>{c.emoji}</span>
                  <span className="text-center leading-tight">{t(`common.${c.key}`)}</span>
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

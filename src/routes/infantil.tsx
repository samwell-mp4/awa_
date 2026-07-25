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
  { to: "/trilhas-infantil", key: "trilhas", top: "22%", left: "28%" },
  { to: "/musicas-infantil", key: "cantico", top: "22%", left: "72%" },
  { to: "/historias-infantil", key: "historia", top: "40%", left: "28%" },
  { to: "/jogos-infantil", key: "jogos", top: "40%", left: "72%" },
  { to: "/amizade", key: "amizade", top: "58%", left: "28%" },
];

function InfantilHomeInner() { return null; }

const HOTSPOT_BTN_CLASS =
  "absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/95 px-4 py-2 md:px-6 md:py-3 font-display font-black uppercase tracking-wide text-emerald-900 text-[3vw] md:text-base leading-tight text-center shadow-[0_6px_0_-1px_rgba(0,0,0,0.2),0_10px_20px_-8px_rgba(0,0,0,0.35)] ring-2 ring-amber-300 hover:ring-amber-400 hover:-translate-y-[calc(50%+2px)] active:translate-y-[calc(-50%+2px)] transition min-w-[28vw] md:min-w-[9rem]";

        </section>


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

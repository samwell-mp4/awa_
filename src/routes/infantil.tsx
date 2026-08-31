import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useRef, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getSiteConfig } from "@/lib/admin-layout.functions";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SiteFooter } from "@/components/home/site-footer";
import { SiteHeader } from "@/components/home/site-header";
import { supabase } from "@/integrations/supabase/client";
import { getPaddleEnvironment } from "@/lib/paddle";
import { setLastArea } from "@/lib/last-area";
import { useActiveTemplate } from "@/hooks/use-active-template";

import infantilMenu from "@/assets/infantil-menu.jpg.asset.json";
import infantilLogo from "@/assets/infantil-logo-new.jpg.asset.json";
import categoriasBg from "@/assets/infantil-categorias-bg.jpg.asset.json";
import menuVideo from "@/assets/infantil-menu-video-rio.mp4.asset.json";



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
    if (!hasAccess) {
      console.warn("[Guard] Redirecting to plans: No access to Infantil for user", data.user.id);
      throw redirect({ to: "/planos", search: { need: "infantil" } as any });
    }
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

const defaultHotspots: Hotspot[] = [
  { to: "/trilhas-infantil", key: "trilhas", emoji: "🗺️", color: "#2a9d8f" },
  { to: "/musicas-infantil", key: "cantico", emoji: "🎶", color: "#f4a261" },
  { to: "/historias-infantil", key: "historia", emoji: "📖", color: "#f4a261" },
  { to: "/jogos-infantil", key: "jogos", emoji: "🎮", color: "#2d6a4f" },
  { to: "/amizade", key: "amizade", emoji: "💛", color: "#c77dff" },
];


function InfantilHome() {
  const { t, i18n } = useTranslation();
  useEffect(() => setLastArea("/infantil"), []);
  const languageKey = (i18n.resolvedLanguage || i18n.language || "pt").slice(0, 2).toLowerCase();
  const getFn = useServerFn(getSiteConfig);
  const { template, config } = useActiveTemplate("infantil");

  const { data: hotspotsData } = useQuery({
    queryKey: ["site_config", "infantil_hotspots"],
    queryFn: () => getFn({ data: "infantil_hotspots" }),
  });

  const hotspots = useMemo(() => (Array.isArray(hotspotsData) ? hotspotsData : defaultHotspots) || [], [hotspotsData]);

  const { data: branding } = useQuery({
    queryKey: ["site_config", "branding"],
    queryFn: () => getFn({ data: "branding" }),
  });


  const logoUrl = branding?.infantil_logo_url || infantilLogo.url;
  const videoUrl = branding?.infantil_menu_video_url || menuVideo.url;

  return (

    <div className={`kids-theme min-h-screen text-foreground template-${config.theme || 'default'}`}>
      <SiteHeader mode="infantil" />

      <main className="mx-auto max-w-3xl px-3 pb-16 md:px-6">
        {/* Logo em cima e vídeo logo abaixo — empilhados, sem sobreposição */}
        <section
          key={languageKey}
          className="mt-0 flex flex-col gap-0 overflow-hidden rounded-[2rem] border-4 border-amber-300 shadow-[0_20px_60px_-25px_rgba(0,0,0,0.45)]"
          style={{ background: "#0b3d2e" }}
        >
          <div className="flex items-center justify-center bg-[#0b3d2e] p-4">
            <img
              src={logoUrl}
              alt="Awã Tech — Línguas indígenas, culturas vivas"
              width={1200}
              height={600}
              className="w-[86%] max-w-[560px] h-auto drop-shadow-[0_12px_30px_rgba(0,0,0,0.55)]"
              fetchPriority="high"
              decoding="async"
              draggable={false}
            />
          </div>
          <VideoMenu src={videoUrl} label={t("infantil.title")} />
        </section>

        <Link
          to="/"
          className="group relative z-10 -mt-6 mx-auto flex w-fit items-center gap-2 rounded-full border-4 border-amber-300 bg-emerald-800 px-6 py-2 font-display text-lg font-black text-white shadow-xl transition hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="h-5 w-5 stroke-[3]" />
          <span>{t("common.voltar")}</span>
        </Link>



        {/* Menu labels below the video — todos juntos */}
        <section key={`labels-${languageKey}`} className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {Array.isArray(hotspots) && hotspots.map((h: any) => (
            <Link
              key={`${languageKey}-${h.to}-${h.key}`}
              to={h.to}
              aria-label={t(`infantil.hotspots.${h.key}`) || h.key}
              className="flex flex-col items-center gap-1 rounded-2xl border-2 border-white/70 bg-white/95 px-3 py-3 font-display text-sm font-black uppercase tracking-wide text-emerald-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-white md:text-base"
              style={{ borderColor: h.color }}
            >
              <span className="text-2xl md:text-3xl" aria-hidden>{h.emoji}</span>
              <span className="text-center leading-tight">{t(`infantil.hotspots.${h.key}`) || h.key}</span>
            </Link>
          ))}
          {/* Adicionais fixos (ou que podem ser movidos para site_config depois se o user quiser) */}
          {[
            { to: "/aprender-numeros", key: "numbers", emoji: "🔢", color: "#f94144" },
            { slug: "saudacoes", key: "trailSaudacoes", emoji: "👋", color: "#e9c46a" },
            { slug: "familia", key: "trailFamilia", emoji: "👨‍👩‍👧", color: "#8ecae6" },
            { slug: "natureza", key: "trailNatureza", emoji: "🌳", color: "#2f6d3a" },
            { slug: "animais", key: "trailAnimais", emoji: "🦜", color: "#e76f51" },
          ].map((c: any) => (
            <Link
              key={c.to || `trail-${c.slug}`}
              to={(c.to || "/trilhas/$slug") as any}
              params={(c.slug ? { slug: c.slug } : {}) as any}


              aria-label={c.key === "numbers" ? "Aprender Números" : t(`common.${c.key}`)}
              className="flex flex-col items-center gap-1 rounded-2xl border-2 border-white/70 bg-white/95 px-3 py-3 font-display text-sm font-black uppercase tracking-wide text-emerald-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-white md:text-base"
              style={{ borderColor: c.color }}
            >
              <span className="text-2xl md:text-3xl" aria-hidden>{c.emoji}</span>
              <span className="text-center leading-tight">
                {c.key === "numbers" ? "Números" : t(`common.${c.key}`)}
              </span>
            </Link>
          ))}

        </section>

      </main>



      <SiteFooter />
    </div>
  );
}

function VideoMenu({ src, label }: { src: string; label: string }) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const onReady = () => setReady(true);
    if (v.readyState >= 3) setReady(true);
    v.addEventListener("loadeddata", onReady);
    v.addEventListener("playing", onReady);
    // Try to kickstart playback (some browsers stall autoplay silently)
    v.play().catch(() => {});
    return () => {
      v.removeEventListener("loadeddata", onReady);
      v.removeEventListener("playing", onReady);
    };
  }, [src]);

  return (
    <video
      ref={ref}
      src={src}
      className="block w-full h-auto select-none transition-opacity duration-300"
      style={{ opacity: ready ? 1 : 0, background: "#0b3d2e" }}
      autoPlay
      loop
      muted
      playsInline
      preload="metadata"
      aria-label={label}
      draggable={false}
    />
  );
}

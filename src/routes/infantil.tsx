import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { SiteFooter } from "@/components/home/site-footer";
import { SiteHeader } from "@/components/home/site-header";
import { supabase } from "@/integrations/supabase/client";
import { getPaddleEnvironment } from "@/lib/paddle";
import { setLastArea } from "@/lib/last-area";
import { GlossarioInfantil } from "@/components/kids/glossario-infantil";

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

type HotspotKey = "trilhas" | "cantico" | "historia" | "jogos" | "amizade" | "canticos_infantis";
type Hotspot = {
  to: "/trilhas-infantil" | "/musicas-infantil" | "/historias-infantil" | "/jogos-infantil" | "/amizade" | "/canticos-infantis";
  key: HotspotKey;
  emoji: string;
  color: string;
};

const hotspots: Hotspot[] = [
  { to: "/trilhas-infantil", key: "trilhas", emoji: "🗺️", color: "#06d6a0" },
  { to: "/musicas-infantil", key: "cantico", emoji: "🎵", color: "#ef476f" },
  
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

        <section
          key={languageKey}
          className="relative mt-4 overflow-hidden rounded-[2rem] border-4 border-amber-300 shadow-[0_20px_60px_-25px_rgba(0,0,0,0.45)]"
          style={{ background: "#0b3d2e" }}
        >
          <VideoMenu src={menuVideo.url} label={t("infantil.title")} />
        </section>

        {/* Menu labels below the video — todos juntos */}
        <section key={`labels-${languageKey}`} className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
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
          {[
            { slug: "saudacoes", key: "trailSaudacoes", emoji: "👋", color: "#ffd166" },
            { slug: "familia", key: "trailFamilia", emoji: "👨‍👩‍👧", color: "#8ecae6" },
            { slug: "natureza", key: "trailNatureza", emoji: "🌳", color: "#2f6d3a" },
            { slug: "animais", key: "trailAnimais", emoji: "🦜", color: "#e76f51" },
          ].map((c) => (
            <Link
              key={`${languageKey}-${c.slug}`}
              to="/trilhas/$slug"
              params={{ slug: c.slug }}
              aria-label={t(`common.${c.key}`)}
              className="flex flex-col items-center gap-1 rounded-2xl border-2 border-white/70 bg-white/95 px-3 py-3 font-display text-sm font-black uppercase tracking-wide text-emerald-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-white md:text-base"
              style={{ borderColor: c.color }}
            >
              <span className="text-2xl md:text-3xl" aria-hidden>{c.emoji}</span>
              <span className="text-center leading-tight">{t(`common.${c.key}`)}</span>
            </Link>
          ))}
        </section>

        <section className="mt-12">
          <h2 className="px-4 font-display text-2xl font-black text-emerald-900 text-center">
            Aprendendo Patxôhã
          </h2>
          <GlossarioInfantil />
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

    // Permite parar o vídeo ao clicar em qualquer lugar da tela
    const stopHandler = () => {
      v.pause();
      window.removeEventListener("pointerdown", stopHandler);
    };
    window.addEventListener("pointerdown", stopHandler);
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
      preload="auto"
      aria-label={label}
      draggable={false}
    />
  );
}

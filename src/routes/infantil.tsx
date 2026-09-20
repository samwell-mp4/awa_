import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useRef, useState, useMemo, lazy, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getSiteConfig } from "@/lib/admin-layout.functions";
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  Flame,
  Gamepad2,
  Home,
  Loader2,
  Mic,
  Music,
  Play,
  Star,
  Trophy,
  User,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { SiteFooter } from "@/components/home/site-footer";
import { SiteHeader } from "@/components/home/site-header";
import { supabase } from "@/integrations/supabase/client";
import { getPaddleEnvironment } from "@/lib/paddle";
import { setLastArea } from "@/lib/last-area";
import { useActiveTemplate } from "@/hooks/use-active-template";
import { useUserStats } from "@/hooks/use-user-stats";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const GlossarioInfantil = lazy(() =>
  import("@/components/kids/glossario-infantil").then((m) => ({ default: m.GlossarioInfantil })),
);

import infantilMenu from "@/assets/infantil-menu.jpg.asset.json";
import infantilLogo from "@/assets/infantil-logo-new.jpg.asset.json";
import menuVideo from "@/assets/infantil-menu-video.mp4.asset.json";
import kidsBg from "@/assets/kids-menu-bg.jpg";
import kidsCharacter from "@/assets/kids-menu-character.png";
import trailSaudacoes from "@/assets/trail-saudacoes.jpg";
import trailFamilia from "@/assets/trail-familia.jpg";
import trailNatureza from "@/assets/trail-natureza.jpg";
import trailAnimais from "@/assets/trail-animais.jpg";
import trailCultura from "@/assets/trail-cultura.jpg";

export const Route = createFileRoute("/infantil")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth", reloadDocument: true });
    const { data: hasAccess } = await supabase.rpc("has_plan_access", {
      _user_id: data.user.id,
      _plan: "infantil",
      _check_env: getPaddleEnvironment(),
    });
    if (!hasAccess) {
      throw redirect({
        to: "/planos",
        search: { need: "infantil" } as any,
        reloadDocument: true,
      });
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
  { to: "/trilhas-infantil", key: "trilhas", emoji: "🗺️", color: "#06d6a0" },
  { to: "/musicas-infantil", key: "cantico", emoji: "🎶", color: "#ef476f" },
  { to: "/historias-infantil", key: "historia", emoji: "📖", color: "#f4a261" },
  { to: "/jogos-infantil", key: "jogos", emoji: "🎮", color: "#118ab2" },
  { to: "/amizade", key: "amizade", emoji: "💛", color: "#c77dff" },
];

const TRAIL_CARDS = [
  { n: 1, label: "Saudações", img: trailSaudacoes, to: "/trilhas/$slug", slug: "saudacoes", tint: "#4c9a2a" },
  { n: 2, label: "Família", img: trailFamilia, to: "/trilhas/$slug", slug: "familia", tint: "#e9a13b" },
  { n: 3, label: "Natureza", img: trailNatureza, to: "/trilhas/$slug", slug: "natureza", tint: "#2f8f9d" },
  { n: 4, label: "Animais", img: trailAnimais, to: "/trilhas/$slug", slug: "animais", tint: "#d94f2b" },
  { n: 5, label: "Cultura", img: trailCultura, to: "/trilhas-infantil", slug: null, tint: "#8558a8" },
] as const;

const EXPLORE = [
  { label: "Pronúncia", icon: Mic, to: "/saudacoes" },
  { label: "Músicas", icon: Music, to: "/musicas-infantil" },
  { label: "Histórias", icon: BookOpen, to: "/historias-infantil" },
  { label: "Cultura", icon: Trophy, to: "/trilhas-infantil" },
  { label: "Números", icon: null, to: "/aprender-numeros", digits: "123" },
  { label: "Vídeos", icon: Play, to: "/videos" },
] as const;

const BOTTOM_NAV = [
  { label: "Início", icon: Home, to: "/infantil" },
  { label: "Aprender", icon: BookOpen, to: "/trilhas-infantil" },
  { label: "Vídeos", icon: Play, to: "/videos" },
  { label: "Desafios", icon: Trophy, to: "/jogos-infantil" },
  { label: "Perfil", icon: User, to: "/minha-conta" },
] as const;

function InfantilHome() {
  const { t, i18n } = useTranslation();
  useEffect(() => setLastArea("/infantil"), []);
  const languageKey = (i18n.resolvedLanguage || i18n.language || "pt").slice(0, 2).toLowerCase();
  const getFn = useServerFn(getSiteConfig);
  const { config } = useActiveTemplate("infantil");
  const { points, level, streak } = useUserStats();

  const { data: hotspotsData } = useQuery({
    queryKey: ["site_config", "infantil_hotspots"],
    queryFn: () => getFn({ data: "infantil_hotspots" }),
  });

  const hotspots = useMemo(
    () => (Array.isArray(hotspotsData) ? (hotspotsData as Hotspot[]) : defaultHotspots) || [],
    [hotspotsData],
  );

  const { data: branding } = useQuery({
    queryKey: ["site_config", "branding"],
    queryFn: () => getFn({ data: "branding" }),
  });

  const logoUrl = branding?.infantil_logo_url || infantilLogo.url;
  const videoUrl = branding?.infantil_menu_video_url || menuVideo.url;

  const nextLevelPct = Math.min(100, points % 100);

  return (
    <div
      className={`kids-theme relative min-h-screen text-foreground template-${config.theme || "default"}`}
      style={{
        backgroundImage: `url(${kidsBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundAttachment: "fixed",
      }}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-emerald-950/25" />

      <div className="relative">
        <SiteHeader mode="infantil" />

        <main className="mx-auto max-w-4xl px-3 pb-28 md:px-6">
          {/* Topo: logo + personagem + estatísticas */}
          <section className="relative mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex items-center justify-center">
              <img
                src={logoUrl}
                alt="Awã Tech — Línguas indígenas, culturas vivas"
                width={640}
                height={420}
                fetchPriority="high"
                decoding="async"
                draggable={false}
                className="w-full max-w-[320px] rounded-[1.75rem] object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
              />
            </div>

            <div className="relative flex flex-col justify-end">
              <img
                src={kidsCharacter}
                alt="Criança Pataxó com cocar acenando"
                width={1024}
                height={1280}
                loading="lazy"
                decoding="async"
                draggable={false}
                className="pointer-events-none mx-auto -mb-2 h-[190px] w-auto object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)] sm:h-[230px]"
              />
              <div className="mb-1 flex items-center justify-end gap-2">
                <img
                  src={kidsCharacter}
                  alt=""
                  aria-hidden
                  loading="lazy"
                  className="h-10 w-10 rounded-full border-2 border-amber-300 bg-emerald-900 object-cover object-top"
                />
                <span className="font-display text-xl font-black text-amber-300 drop-shadow">Akuá!</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-2xl border-4 border-emerald-900/40 bg-emerald-700 px-3 py-2 text-white shadow-lg">
                  <div className="flex items-center gap-1.5 text-sm font-black">
                    <Flame className="h-4 w-4 text-amber-300" /> Sequência
                  </div>
                  <div className="font-display text-3xl font-black leading-none">{streak}</div>
                  <div className="text-xs font-bold opacity-90">dias</div>
                </div>
                <div className="rounded-2xl border-4 border-amber-600/50 bg-amber-400 px-3 py-2 text-amber-950 shadow-lg">
                  <div className="flex items-center gap-1.5 text-sm font-black">
                    <Star className="h-4 w-4" /> Pontos
                  </div>
                  <div className="font-display text-3xl font-black leading-none">{points}</div>
                  <div className="text-xs font-bold opacity-80">pontos</div>
                </div>
              </div>
            </div>
          </section>

          {/* Continuar aprendendo + Nível */}
          <section className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Link
              to="/trilhas-infantil"
              className="rounded-2xl border-4 border-emerald-900/40 bg-emerald-700 px-4 py-3 text-white shadow-lg transition hover:-translate-y-0.5 active:scale-[0.99]"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-amber-200" />
                <span className="font-display text-lg font-black">Continuar aprendendo</span>
              </div>
              <div className="mt-0.5 text-sm font-bold opacity-95">Trilhas em Patxohã</div>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-emerald-900/50">
                  <div className="h-full rounded-full bg-lime-400" style={{ width: `${nextLevelPct}%` }} />
                </div>
                <span className="font-display text-sm font-black">{nextLevelPct}%</span>
              </div>
            </Link>

            <Link
              to="/minha-conta"
              className="flex items-center gap-3 rounded-2xl border-4 border-amber-900/40 bg-[#5a3a22] px-4 py-3 text-amber-50 shadow-lg transition hover:-translate-y-0.5 active:scale-[0.99]"
            >
              <span className="text-3xl" aria-hidden>
                🏅
              </span>
              <div className="flex-1">
                <div className="text-sm font-black opacity-90">Nível</div>
                <div className="font-display text-3xl font-black leading-none">{level}</div>
                <div className="text-sm font-bold opacity-90">Aprendiz</div>
              </div>
              <div className="relative grid h-14 w-14 place-items-center rounded-full border-4 border-lime-400 text-center text-[10px] font-black leading-tight">
                {nextLevelPct}%
              </div>
            </Link>
          </section>

          {/* Trilhas de aprendizado */}
          <section className="mt-3 rounded-[1.5rem] border-4 border-amber-900/40 bg-[#5a3a22]/95 p-3 shadow-xl">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-display text-xl font-black text-amber-100">Trilhas de Aprendizado</h2>
              <Link
                to="/trilhas-infantil"
                className="flex items-center gap-1 text-sm font-black text-amber-200 hover:text-white"
              >
                Ver todas <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
              {TRAIL_CARDS.map((c) => (
                <Link
                  key={c.label}
                  to={c.to as any}
                  params={(c.slug ? { slug: c.slug } : {}) as any}
                  aria-label={`Trilha ${c.label}`}
                  className="overflow-hidden rounded-2xl border-4 bg-emerald-900/40 shadow-lg transition hover:-translate-y-0.5 active:scale-[0.98]"
                  style={{ borderColor: c.tint }}
                >
                  <img
                    src={c.img}
                    alt={c.label}
                    loading="lazy"
                    decoding="async"
                    className="h-24 w-full object-cover"
                  />
                  <div className="px-2 py-1.5">
                    <div className="font-display text-sm font-black text-amber-50">
                      {c.n}. {c.label}
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-black/30">
                      <div className="h-full rounded-full bg-lime-400" style={{ width: "40%" }} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Vídeo do dia */}
          <section className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div
              key={languageKey}
              className="overflow-hidden rounded-[1.5rem] border-4 border-amber-300 shadow-xl"
              style={{ background: "#0b3d2e" }}
            >
              <VideoMenu src={videoUrl} label={t("infantil.title")} />
            </div>
            <div className="flex flex-col justify-center rounded-[1.5rem] border-4 border-amber-900/40 bg-[#5a3a22]/95 p-4 text-amber-50 shadow-xl">
              <div className="text-sm font-black opacity-90">Vídeo do dia</div>
              <div className="font-display text-2xl font-black leading-tight">Saudações em Patxohã</div>
              <p className="mt-1 text-sm font-semibold opacity-90">
                Aprenda a cumprimentar em Patxohã com o professor Awã.
              </p>
              <Link
                to="/videos"
                className="mt-3 inline-flex items-center justify-center gap-2 rounded-full border-4 border-amber-600/50 bg-amber-500 px-5 py-2 font-display text-lg font-black text-amber-950 shadow-lg transition hover:-translate-y-0.5 active:scale-95"
              >
                <Play className="h-5 w-5" /> Assistir agora
              </Link>
            </div>
          </section>

          {/* Explorar mais + Palavra do dia */}
          <section className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-[2fr_1fr]">
            <div className="rounded-[1.5rem] border-4 border-amber-200 bg-amber-50/95 p-3 shadow-xl">
              <h2 className="mb-2 font-display text-xl font-black text-emerald-900">Explorar mais</h2>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {EXPLORE.map((e) => {
                  const Icon = e.icon;
                  return (
                    <Link
                      key={e.label}
                      to={e.to as any}
                      aria-label={e.label}
                      className="flex flex-col items-center gap-1 text-center"
                    >
                      <span className="grid h-14 w-14 place-items-center rounded-2xl border-4 border-emerald-900/30 bg-emerald-700 text-white shadow-md transition hover:-translate-y-0.5 active:scale-95">
                        {Icon ? (
                          <Icon className="h-7 w-7" />
                        ) : (
                          <span className="font-display text-lg font-black">{(e as any).digits}</span>
                        )}
                      </span>
                      <span className="text-[11px] font-black uppercase tracking-wide text-emerald-900">
                        {e.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <Link
              to="/dicionario"
              className="flex items-center gap-3 rounded-[1.5rem] border-4 border-amber-900/40 bg-[#5a3a22]/95 p-4 text-amber-50 shadow-xl transition hover:-translate-y-0.5 active:scale-[0.99]"
            >
              <div className="flex-1">
                <div className="text-sm font-black opacity-90">Palavra do dia</div>
                <div className="font-display text-2xl font-black text-amber-300">Akuá</div>
                <div className="text-sm font-semibold opacity-90">Significa: olá, bom dia</div>
              </div>
              <img
                src={trailNatureza}
                alt=""
                aria-hidden
                loading="lazy"
                className="h-20 w-16 rounded-xl border-2 border-amber-300/60 object-cover"
              />
            </Link>
          </section>

          {/* Atalhos infantis configuráveis pelo painel */}
          <section
            key={`labels-${languageKey}`}
            className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5"
          >
            {Array.isArray(hotspots) &&
              hotspots.map((h: any) => (
                <Link
                  key={`${languageKey}-${h.to}-${h.key}`}
                  to={h.to}
                  aria-label={t(`infantil.hotspots.${h.key}`) || h.key}
                  className="flex flex-col items-center gap-1 rounded-2xl border-4 bg-white/95 px-3 py-3 font-display text-sm font-black uppercase tracking-wide text-emerald-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-white"
                  style={{ borderColor: h.color }}
                >
                  <span className="text-2xl md:text-3xl" aria-hidden>
                    {h.emoji}
                  </span>
                  <span className="text-center leading-tight">
                    {t(`infantil.hotspots.${h.key}`) || h.key}
                  </span>
                </Link>
              ))}
          </section>

          <Link
            to="/"
            className="mx-auto mt-4 flex w-fit items-center gap-2 rounded-full border-4 border-amber-300 bg-emerald-800 px-6 py-2 font-display text-lg font-black text-white shadow-xl transition hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="h-5 w-5 stroke-[3]" />
            <span>{t("common.voltar")}</span>
          </Link>

          {t("infantil.learning") && (
            <section className="mt-10 content-visibility-auto">
              <h2 className="px-4 text-center font-display text-2xl font-black text-amber-100 drop-shadow">
                {t("infantil.learning")}
              </h2>
              <ErrorBoundary
                area="glossario-infantil"
                message="Não foi possível carregar esta atividade. Tente novamente."
              >
                <Suspense
                  fallback={
                    <div className="flex h-40 items-center justify-center">
                      <Loader2 className="animate-spin" />
                    </div>
                  }
                >
                  <GlossarioInfantil />
                </Suspense>
              </ErrorBoundary>
            </section>
          )}
        </main>

        {/* Barra inferior fixa */}
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t-4 border-emerald-900/50 bg-emerald-700/95 backdrop-blur">
          <div className="mx-auto flex max-w-4xl items-center justify-around px-2 py-2">
            {BOTTOM_NAV.map((n) => {
              const Icon = n.icon;
              return (
                <Link
                  key={n.label}
                  to={n.to as any}
                  aria-label={n.label}
                  className="flex flex-col items-center gap-0.5 rounded-xl px-2 py-1 text-amber-100 transition hover:bg-emerald-800/70 active:scale-95"
                  activeProps={{ className: "bg-emerald-900/70 text-amber-300" }}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-[11px] font-black uppercase tracking-wide">{n.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <SiteFooter />
      </div>
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
      className="block h-auto w-full select-none transition-opacity duration-300"
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

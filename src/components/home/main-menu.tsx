import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  Award,
  BookOpen,
  Flame,
  Home,
  Mic2,
  Music,
  Play,
  ScrollText,
  Star,
  Trophy,
  User,
  Video,
  Volume2,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useUserStats } from "@/hooks/use-user-stats";
import { useDailyVideo, useHomeTrails } from "@/hooks/use-home-data";
import { useAuth } from "@/hooks/use-auth";
import { speak } from "@/lib/speak";
import { ProgressBar } from "./progress-bar";
import { trailSlugMap } from "@/lib/home-content";
import { translateTrailName } from "./trails-grid";
import landingBg from "@/assets/landing-bg.jpg.asset.json";

const panel =
  "rounded-3xl border border-gold/25 bg-[oklch(0.14_0.04_145/0.82)] backdrop-blur-md shadow-[0_18px_40px_-24px_rgba(0,0,0,0.9)]";

function tap(text?: string) {
  if (text) speak(text, "pt-BR", 1);
}

function useWordOfDay() {
  return useQuery({
    queryKey: ["word-of-day"],
    staleTime: 60 * 60 * 1000,
    queryFn: async () => {
      const { data } = await supabase
        .from("dictionary")
        .select("term_pt,term_indigenous")
        .limit(500);
      const pool = (data ?? []).filter((w: any) => w.term_pt && w.term_indigenous);
      if (!pool.length) return null;
      const day = Math.floor(Date.now() / 86400000);
      return pool[day % pool.length] as { term_pt: string; term_indigenous: string };
    },
  });
}

const explore = [
  { icon: Mic2, label: "Pronúncia", to: "/dicionario" },
  { icon: Music, label: "Músicas", to: "/musicas" },
  { icon: BookOpen, label: "Histórias", to: "/historias" },
  { icon: ScrollText, label: "Cultura", to: "/aldeia-velha" },
  { icon: Award, label: "Números", to: "/aprender-numeros" },
  { icon: Video, label: "Vídeos", to: "/videos" },
] as const;

const bottomNav = [
  { icon: Home, label: "Início", to: "/adulto" },
  { icon: BookOpen, label: "Aprender", to: "/trilhas" },
  { icon: Video, label: "Vídeos", to: "/videos" },
  { icon: Trophy, label: "Desafios", to: "/jogos" },
  { icon: User, label: "Perfil", to: "/minha-conta" },
] as const;

export function MainMenu() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { points, level, streak } = useUserStats();
  const trails = useHomeTrails();
  const { data: video } = useDailyVideo();
  const { data: word } = useWordOfDay();

  const name =
    (user?.user_metadata as { name?: string } | undefined)?.name ||
    user?.email?.split("@")[0] ||
    "Akuá";
  const levelPct = points % 100;

  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: `url(${landingBg.url})` }}
      />
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-forest-deep/70" />

      <div className="mx-auto max-w-6xl space-y-4 px-3 pb-28 pt-4 sm:px-4 md:px-8">
        {/* Saudação + estatísticas */}
        <section className={`${panel} p-4`}>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <div className="min-w-0">
              <p className="text-sm text-foreground/70">Olá,</p>
              <h1 className="truncate font-display text-2xl font-black text-gold">{name}!</h1>
            </div>
            <Link
              to="/minha-conta"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-gold/40 bg-gold/15 text-gold"
              aria-label="Perfil"
            >
              <User className="h-5 w-5" />
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            <div className="rounded-2xl border border-leaf/30 bg-leaf/15 p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-xs font-bold text-cream">
                <Flame className="h-4 w-4 text-gold" /> Sequência
              </div>
              <div className="font-display text-2xl font-black text-cream">{streak}</div>
              <div className="text-[11px] text-foreground/70">dias</div>
            </div>
            <div className="rounded-2xl border border-gold/40 bg-gold/20 p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-xs font-bold text-cream">
                <Star className="h-4 w-4 text-gold" /> Pontos
              </div>
              <div className="font-display text-2xl font-black text-cream">{points}</div>
              <div className="text-[11px] text-foreground/70">pontos</div>
            </div>
            <div className="col-span-2 rounded-2xl border border-gold/25 bg-bark/40 p-3 sm:col-span-1">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1 text-xs font-bold text-cream">
                    <Award className="h-4 w-4 text-gold" /> Nível {level}
                  </div>
                  <div className="text-[11px] text-foreground/70">Aprendiz</div>
                </div>
                <span className="shrink-0 text-sm font-black text-gold">{levelPct}%</span>
              </div>
              <ProgressBar value={levelPct} className="mt-2" />
            </div>
          </div>
        </section>

        {/* Continuar aprendendo */}
        <section className={`${panel} p-4`}>
          <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gold/15 text-2xl">
              📖
            </div>
            <div className="min-w-0">
              <h2 className="font-display text-lg font-bold text-cream">Continuar aprendendo</h2>
              <p className="truncate text-sm text-foreground/70">
                Lição 3 — Saudações em Patxôhã
              </p>
              <ProgressBar value={60} className="mt-2" />
            </div>
          </div>
          <Link
            to="/trilhas/$slug"
            params={{ slug: "saudacoes" }}
            onClick={() => tap("Continuar aprendendo")}
            className="mt-3 flex w-full items-center justify-center rounded-2xl bg-[var(--gradient-gold)] px-4 py-3 font-display text-sm font-black uppercase tracking-wider text-forest-deep transition active:translate-y-0.5"
          >
            Continuar
          </Link>
        </section>

        {/* Trilhas */}
        <section className={`${panel} p-4`}>
          <div className="mb-3 flex items-end justify-between gap-3">
            <h2 className="font-display text-lg font-bold text-cream">Trilhas de Aprendizado</h2>
            <Link to="/trilhas" className="text-xs font-bold text-gold hover:underline">
              Ver todas ›
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {trails.map((trail) => {
              const slug = trailSlugMap[trail.name];
              const label = translateTrailName(t, trail.name);
              const inner = (
                <>
                  <div className="aspect-square overflow-hidden rounded-xl">
                    <img
                      src={trail.img}
                      alt={label}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="mt-2 truncate text-sm font-bold text-cream">{label}</div>
                  <ProgressBar value={trail.progress} className="mt-1.5" />
                </>
              );
              const cls =
                "group block rounded-2xl border border-gold/20 bg-bark/30 p-2 transition hover:-translate-y-1 hover:border-gold/50";
              return slug ? (
                <Link
                  key={trail.name}
                  to="/trilhas/$slug"
                  params={{ slug }}
                  onClick={() => tap(label)}
                  className={cls}
                >
                  {inner}
                </Link>
              ) : (
                <Link key={trail.name} to="/trilhas" onClick={() => tap(label)} className={cls}>
                  {inner}
                </Link>
              );
            })}
          </div>
        </section>

        {/* Palavra do dia + Vídeo do dia */}
        <div className="grid gap-4 md:grid-cols-2">
          <section className={`${panel} p-4`}>
            <h2 className="font-display text-lg font-bold text-cream">Palavra do dia</h2>
            <div className="mt-2 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-display text-2xl font-black text-gold">
                  {word?.term_indigenous ?? "Awé!"}
                </p>
                <p className="truncate text-sm text-foreground/75">
                  {word?.term_pt ?? "Olá! Seja bem-vindo!"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => tap(word?.term_indigenous ?? "Awé")}
                aria-label="Ouvir pronúncia"
                className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[var(--gradient-gold)] text-forest-deep transition active:translate-y-0.5"
              >
                <Volume2 className="h-6 w-6" />
              </button>
            </div>
          </section>

          <section className={`${panel} overflow-hidden`}>
            {video?.thumbnail_url && (
              <img
                src={video.thumbnail_url}
                alt={video.title ?? "Vídeo do dia"}
                loading="lazy"
                className="h-36 w-full object-cover"
              />
            )}
            <div className="p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-leaf">Vídeo do dia</p>
              <h2 className="mt-1 font-display text-lg font-bold text-cream">
                {video?.title ?? "Saudação em Pataxó"}
              </h2>
              <p className="mt-1 text-sm text-foreground/70">
                {video?.description ??
                  "Aprenda a cumprimentar em Pataxó com o professor Aruá Pataxó."}
              </p>
              <Link
                to="/videos"
                onClick={() => tap("Assistir agora")}
                className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-[var(--gradient-gold)] px-4 py-2.5 font-display text-sm font-black uppercase tracking-wider text-forest-deep transition active:translate-y-0.5"
              >
                <Play className="h-4 w-4" /> Assistir agora
              </Link>
            </div>
          </section>
        </div>

        {/* Explorar mais */}
        <section className={`${panel} p-4`}>
          <h2 className="mb-3 font-display text-lg font-bold text-cream">Explorar mais</h2>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {explore.map(({ icon: Icon, label, to }) => (
              <Link
                key={label}
                to={to}
                onClick={() => tap(label)}
                className="flex flex-col items-center gap-2 rounded-2xl border border-gold/20 bg-leaf/10 p-3 text-center transition hover:-translate-y-1 hover:border-gold/50"
              >
                <span className="grid h-11 w-11 place-items-center rounded-full bg-gold/15 text-gold">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-[11px] font-bold text-cream">{label}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* Navegação inferior */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-gold/25 bg-[oklch(0.14_0.04_145/0.92)] backdrop-blur-xl">
        <div className="mx-auto grid max-w-6xl grid-cols-5">
          {bottomNav.map(({ icon: Icon, label, to }) => (
            <Link
              key={label}
              to={to}
              onClick={() => tap(label)}
              activeProps={{ className: "text-gold" }}
              inactiveProps={{ className: "text-foreground/70" }}
              className="flex flex-col items-center gap-1 py-2.5 text-[11px] font-bold"
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

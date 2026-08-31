import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  Award,
  BookOpen,
  Flame,
  Gamepad2,
  Heart,
  Home,
  Mic2,
  Music,
  Play,
  Star,
  Trophy,
  User,
  Video,
  Volume2,
} from "lucide-react";

import { useUserStats } from "@/hooks/use-user-stats";
import { useDailyVideo, useHomeTrails } from "@/hooks/use-home-data";
import { useAuth } from "@/hooks/use-auth";
import { speak } from "@/lib/speak";
import { ProgressBar } from "@/components/home/progress-bar";
import { trailSlugMap } from "@/lib/home-content";
import { translateTrailName } from "@/components/home/trails-grid";

import kidsMenuBg from "@/assets/kids-menu-bg.png.asset.json";

const panel =
  "rounded-[1.75rem] border-4 border-amber-300 bg-emerald-900/70 backdrop-blur-md shadow-[0_18px_45px_-22px_rgba(0,0,0,0.85)]";

function tap(text?: string) {
  if (text) speak(text, "pt-BR", 1.05);
}

const explore = [
  { icon: Mic2, label: "Pronúncia", to: "/dicionario" },
  { icon: Music, label: "Cânticos", to: "/musicas-infantil" },
  { icon: BookOpen, label: "Histórias", to: "/historias-infantil" },
  { icon: Gamepad2, label: "Jogos", to: "/jogos-infantil" },
  { icon: Award, label: "Números", to: "/aprender-numeros" },
  { icon: Heart, label: "Amizade", to: "/amizade" },
] as const;

const bottomNav = [
  { icon: Home, label: "Início", to: "/infantil" },
  { icon: BookOpen, label: "Aprender", to: "/trilhas-infantil" },
  { icon: Music, label: "Cânticos", to: "/musicas-infantil" },
  { icon: Trophy, label: "Jogos", to: "/jogos-infantil" },
  { icon: User, label: "Perfil", to: "/minha-conta" },
] as const;

export function KidsMainMenu() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { points, level, streak } = useUserStats();
  const trails = useHomeTrails();
  const { data: video } = useDailyVideo();

  const name =
    (user?.user_metadata as { name?: string } | undefined)?.name ||
    user?.email?.split("@")[0] ||
    "Akuá";
  const levelPct = points % 100;

  return (
    <div className="space-y-4 pb-24">
      {/* Saudação + estatísticas */}
      <section className={`${panel} p-4`}>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="min-w-0">
            <p className="text-sm font-bold text-amber-100/80">Olá,</p>
            <h1 className="truncate font-display text-2xl font-black text-amber-300">{name}!</h1>
          </div>
          <Link
            to="/minha-conta"
            className="grid h-12 w-12 shrink-0 place-items-center rounded-full border-4 border-amber-300 bg-amber-300/20 text-amber-200"
            aria-label="Perfil"
          >
            <User className="h-5 w-5" />
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <div className="rounded-2xl border-2 border-amber-300/60 bg-emerald-700/60 p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-xs font-black text-amber-100">
              <Flame className="h-4 w-4 text-amber-300" /> Sequência
            </div>
            <div className="font-display text-2xl font-black text-white">{streak}</div>
            <div className="text-[11px] text-amber-100/70">dias</div>
          </div>
          <div className="rounded-2xl border-2 border-amber-300/60 bg-amber-400/25 p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-xs font-black text-amber-100">
              <Star className="h-4 w-4 text-amber-300" /> Pontos
            </div>
            <div className="font-display text-2xl font-black text-white">{points}</div>
            <div className="text-[11px] text-amber-100/70">pontos</div>
          </div>
          <div className="col-span-2 rounded-2xl border-2 border-amber-300/60 bg-emerald-800/70 p-3 sm:col-span-1">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1 text-xs font-black text-amber-100">
                  <Award className="h-4 w-4 text-amber-300" /> Nível {level}
                </div>
                <div className="text-[11px] text-amber-100/70">Aprendiz</div>
              </div>
              <span className="shrink-0 text-sm font-black text-amber-300">{levelPct}%</span>
            </div>
            <ProgressBar value={levelPct} className="mt-2" />
          </div>
        </div>
      </section>

      {/* Continuar aprendendo */}
      <section className={`${panel} p-4`}>
        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber-300/20 text-2xl">
            📖
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-lg font-black text-white">Continuar aprendendo</h2>
            <p className="truncate text-sm text-amber-100/80">Lição 3 — Saudações em Patxôhã</p>
            <ProgressBar value={60} className="mt-2" />
          </div>
        </div>
        <Link
          to="/trilhas/$slug"
          params={{ slug: "saudacoes" }}
          onClick={() => tap("Continuar aprendendo")}
          className="mt-3 flex w-full items-center justify-center rounded-2xl border-2 border-amber-200 bg-amber-400 px-4 py-3 font-display text-sm font-black uppercase tracking-wider text-emerald-900 transition active:translate-y-0.5"
        >
          Continuar
        </Link>
      </section>

      {/* Trilhas */}
      <section className={`${panel} p-4`}>
        <div className="mb-3 flex items-end justify-between gap-3">
          <h2 className="font-display text-lg font-black text-white">Trilhas de Aprendizado</h2>
          <Link to="/trilhas-infantil" className="text-xs font-black text-amber-300 hover:underline">
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
                <div className="mt-2 truncate text-sm font-black text-white">{label}</div>
                <ProgressBar value={trail.progress} className="mt-1.5" />
              </>
            );
            const cls =
              "group block rounded-2xl border-2 border-amber-300/50 bg-emerald-800/60 p-2 transition hover:-translate-y-1 hover:border-amber-300";
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
              <Link
                key={trail.name}
                to="/trilhas-infantil"
                onClick={() => tap(label)}
                className={cls}
              >
                {inner}
              </Link>
            );
          })}
        </div>
      </section>

      {/* Palavra do dia + Vídeo do dia */}
      <div className="grid gap-4 md:grid-cols-2">
        <section className={`${panel} p-4`}>
          <h2 className="font-display text-lg font-black text-white">Palavra do dia</h2>
          <div className="mt-2 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-display text-2xl font-black text-amber-300">Awé!</p>
              <p className="truncate text-sm text-amber-100/80">Olá! Seja bem-vindo!</p>
            </div>
            <button
              type="button"
              onClick={() => tap("Awé")}
              aria-label="Ouvir pronúncia"
              className="grid h-12 w-12 shrink-0 place-items-center rounded-full border-2 border-amber-200 bg-amber-400 text-emerald-900 transition active:translate-y-0.5"
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
            <p className="text-xs font-black uppercase tracking-widest text-amber-300">
              Vídeo do dia
            </p>
            <h2 className="mt-1 font-display text-lg font-black text-white">
              {video?.title ?? "Saudação em Pataxó"}
            </h2>
            <p className="mt-1 text-sm text-amber-100/80">
              {video?.description ?? "Aprenda a cumprimentar em Pataxó com o professor Aruá Pataxó."}
            </p>
            <Link
              to="/videos"
              onClick={() => tap("Assistir agora")}
              className="mt-3 inline-flex items-center gap-2 rounded-2xl border-2 border-amber-200 bg-amber-400 px-4 py-2.5 font-display text-sm font-black uppercase tracking-wider text-emerald-900 transition active:translate-y-0.5"
            >
              <Play className="h-4 w-4" /> Assistir agora
            </Link>
          </div>
        </section>
      </div>

      {/* Explorar mais */}
      <section className={`${panel} p-4`}>
        <h2 className="mb-3 font-display text-lg font-black text-white">Explorar mais</h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {explore.map(({ icon: Icon, label, to }) => (
            <Link
              key={label}
              to={to}
              onClick={() => tap(label)}
              className="flex flex-col items-center gap-2 rounded-2xl border-2 border-amber-300/50 bg-emerald-800/60 p-3 text-center transition hover:-translate-y-1 hover:border-amber-300"
            >
              <span className="grid h-11 w-11 place-items-center rounded-full bg-amber-300/20 text-amber-200">
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-[11px] font-black text-white">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Navegação inferior */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t-4 border-amber-300 bg-emerald-900/95 backdrop-blur-xl">
        <div className="mx-auto grid max-w-3xl grid-cols-5">
          {bottomNav.map(({ icon: Icon, label, to }) => (
            <Link
              key={label}
              to={to}
              onClick={() => tap(label)}
              activeProps={{ className: "text-amber-300" }}
              inactiveProps={{ className: "text-amber-100/70" }}
              className="flex flex-col items-center gap-1 py-2.5 text-[11px] font-black"
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

import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import { Music, BookOpen, Gamepad2, Map, Heart, Hash } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getPaddleEnvironment } from "@/lib/paddle";
import { setLastArea } from "@/lib/last-area";
import { useAuth } from "@/hooks/use-auth";
import { useUserStats } from "@/hooks/use-user-stats";
import { KidsPage, KidsCard } from "@/components/kids/kids-page";

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
      { title: "Aldeia Viva — Awã Tech Infantil" },
      {
        name: "description",
        content:
          "Área infantil do Awã Tech: cantigas, histórias, jogos e trilhas para as crianças aprenderem Patxôhã brincando.",
      },
      { property: "og:title", content: "Aldeia Viva — Awã Tech Infantil" },
      {
        property: "og:description",
        content: "Cantigas, histórias e jogos indígenas para crianças no Awã Tech.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: InfantilHome,
});

const TILES = [
  {
    to: "/musicas-infantil",
    icon: Music,
    emoji: "🥁",
    title: "Cantigas",
    desc: "Cantar junto com a aldeia",
    bg: "from-[#e76f51] to-[#c2452c]",
  },
  {
    to: "/historias-infantil",
    icon: BookOpen,
    emoji: "🪶",
    title: "Histórias",
    desc: "Contos dos anciãos",
    bg: "from-[#2a9d8f] to-[#1c6f65]",
  },
  {
    to: "/jogos-infantil",
    icon: Gamepad2,
    emoji: "🎯",
    title: "Jogos",
    desc: "Brincar aprendendo",
    bg: "from-[#e9c46a] to-[#c79a2f]",
  },
  {
    to: "/trilhas-infantil",
    icon: Map,
    emoji: "🌿",
    title: "Trilhas",
    desc: "Aprender por caminhos",
    bg: "from-[#40916c] to-[#22624a]",
  },
] as const;

const EXTRAS = [
  { to: "/aprender-numeros", icon: Hash, label: "Números" },
  { to: "/amizade", icon: Heart, label: "Amizade" },
] as const;

function InfantilHome() {
  const { user } = useAuth();
  const { points, streak } = useUserStats();
  useEffect(() => setLastArea("/infantil"), []);

  const name =
    (user?.user_metadata as { name?: string } | undefined)?.name ||
    user?.email?.split("@")[0] ||
    "Awã Mirim";

  return (
    <KidsPage
      title="Aldeia Viva"
      subtitle={`Olá, ${name}! O que vamos aprender hoje?`}
      emoji="🌞"
      back={null}
    >
      <KidsCard className="mb-5 flex items-center justify-around p-4">
        <div className="text-center">
          <p className="font-display text-2xl leading-none">{points}</p>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#3f6b57]">
            Pontos
          </p>
        </div>
        <span className="h-8 w-[3px] rounded bg-[#e9c46a]" />
        <div className="text-center">
          <p className="font-display text-2xl leading-none">{streak} 🔥</p>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#3f6b57]">
            Dias seguidos
          </p>
        </div>
      </KidsCard>

      <div className="grid grid-cols-2 gap-4">
        {TILES.map((tile) => (
          <Link
            key={tile.to}
            to={tile.to}
            className={`group relative flex aspect-square flex-col justify-between overflow-hidden rounded-[1.75rem] border-[5px] border-[#fdfcf0] bg-gradient-to-br ${tile.bg} p-4 shadow-[0_12px_0_-4px_rgba(0,0,0,.4),0_24px_40px_-24px_rgba(0,0,0,.8)] transition-transform active:translate-y-1 active:shadow-none`}
          >
            <span aria-hidden className="text-4xl drop-shadow">
              {tile.emoji}
            </span>
            <div>
              <p className="font-display text-xl leading-tight text-[#fffdf5]">
                {tile.title}
              </p>
              <p className="mt-0.5 text-[11px] font-bold text-white/85">{tile.desc}</p>
            </div>
            <tile.icon
              aria-hidden
              className="absolute -right-3 -top-3 h-20 w-20 text-white/15"
            />
          </Link>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4">
        {EXTRAS.map((e) => (
          <Link
            key={e.to}
            to={e.to}
            className="flex items-center gap-2 rounded-2xl border-[3px] border-[#e9c46a] bg-[#14503c]/80 px-4 py-3 text-sm font-black uppercase tracking-wide text-[#ffe9b8]"
          >
            <e.icon className="h-4 w-4" /> {e.label}
          </Link>
        ))}
      </div>
    </KidsPage>
  );
}

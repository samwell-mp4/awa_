import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Menu,
  Home,
  BookOpen,
  Play,
  Trophy,
  Flame,
  Star,
  Award,
  Clock,
  Check,
  Mic,
  ScrollText,
  Sparkles,
  Video,
  ChevronRight,
  Instagram,
  Youtube,
  Facebook,
  Mail,
  LogIn,
  LogOut,
  Settings,
  Library,
  Download,
  Smartphone,
} from "lucide-react";

import heroAsset from "@/assets/awa-hero.jpg.asset.json";
const heroWoman = heroAsset.url;
import logoSrc from "@/assets/awa-tech-logo.png";
import videoProfessor from "@/assets/video-professor.jpg";
import trailSaudacoes from "@/assets/trail-saudacoes.jpg";
import trailFamilia from "@/assets/trail-familia.jpg";
import trailNatureza from "@/assets/trail-natureza.jpg";
import trailAnimais from "@/assets/trail-animais.jpg";
import { DailyWordVideo } from "@/components/DailyWordVideo";


import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { fetchSaudacoes, pickByHour } from "@/routes/saudacoes";
import { fraseDoDia } from "@/lib/trilhas";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AWÃ TECH — Línguas Indígenas, Culturas Vivas" },
      {
        name: "description",
        content:
          "Aprenda línguas indígenas brasileiras com vídeos, histórias, músicas e desafios. Uma plataforma educativa que preserva culturas vivas.",
      },
      { property: "og:title", content: "AWÃ TECH — Línguas Indígenas, Culturas Vivas" },
      {
        property: "og:description",
        content:
          "Plataforma digital para aprender idiomas indígenas brasileiros através de vídeos, histórias, músicas e desafios.",
      },
    ],
  }),
  component: Index,
});

const fallbackImages: Record<string, string> = {
  Saudações: trailSaudacoes,
  Família: trailFamilia,
  Natureza: trailNatureza,
  Animais: trailAnimais,
};


const ranking = [
  { name: "Aruá Pataxó", points: 780, initials: "AP" },
  { name: "Jandira Txã", points: 650, initials: "JT" },
  { name: "Txai Uru", points: 520, initials: "TU" },
];

const resources = [
  { icon: ScrollText, label: "Histórias", desc: "Narrativas ancestrais em texto e áudio." },
  { icon: Video, label: "Vídeos", desc: "Cenas e narrativas da aldeia Pataxó." },
];


function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <img
        src={logoSrc}
        alt="AWÃ TECH"
        className="h-12 w-12 shrink-0 rounded-full bg-cream/95 p-0.5 shadow-[var(--shadow-glow)] ring-1 ring-gold/40 object-contain"
      />
      <div className="leading-none">
        <div className="font-display text-xl font-black tracking-tight text-cream">
          AWÃ <span className="text-leaf">TECH</span>
        </div>
        <div className="mt-0.5 text-[10px] font-semibold tracking-[0.18em] text-gold/80">
          CULTURAS VIVAS
        </div>
      </div>
    </div>
  );
}


function Index() {
  const [open, setOpen] = useState(false);
  const [answer, setAnswer] = useState<number | null>(null);
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const { data: dbTrails = [] } = useQuery({
    queryKey: ["trails", "sem-cultura"],
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60 * 6,
    queryFn: async () => {
      const { data } = await supabase
        .from("trails")
        .select("name,image_url,default_progress")
        .order("order_index");
      return data ?? [];
    },
  });
  const trails = dbTrails.length
    ? dbTrails
        .filter((t: any) => t.name?.trim().toLowerCase() !== "cultura")
        .map((t: any) => ({
          name: t.name,
          img: t.image_url || fallbackImages[t.name] || trailSaudacoes,
          progress: t.default_progress ?? 0,
        }))
    : Object.keys(fallbackImages).map((name) => ({ name, img: fallbackImages[name], progress: 0 }));


  const { data: dailyVideo } = useQuery({
    queryKey: ["daily_video"],
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60 * 6,
    queryFn: async () => {
      const { data } = await supabase
        .from("daily_video")
        .select("title,description,video_url,thumbnail_url,duration_minutes")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

  const { data: mission } = useQuery({
    queryKey: ["daily_mission"],
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60 * 6,
    queryFn: async () => {
      const { data } = await supabase
        .from("daily_mission")
        .select("question,options,correct_index,points")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data as any;
    },
  });

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  const navGroups: { title: string; items: { label: string; href: string; icon: any; premium?: boolean }[] }[] = [
    {
      title: "Língua e Conhecimento",
      items: [
        { label: "Dicionário", href: "/dicionario", icon: Library },
        { label: "Tradutor", href: "/traduzir", icon: BookOpen },
        { label: "Trilhas", href: "/trilhas", icon: Award },
        { label: "Espaço do Professor", href: "/professor", icon: Sparkles, premium: true },
      ],
    },
    {
      title: "Cultura e Expressões",
      items: [
        { label: "Histórias e Narrativas", href: "/historias", icon: ScrollText },
        { label: "Músicas e Cantigas", href: "/musicas", icon: Play },
        { label: "Vídeos e Registros", href: "/videos", icon: Video },
        { label: "Jogos e Atividades", href: "/jogos", icon: Trophy },
      ],
    },
    {
      title: "Quem Somos e Ajuda",
      items: [
        { label: "Biografia Awã Tech", href: "/biografia", icon: BookOpen },
        { label: "Baixar / Instalar App", href: "/instalar", icon: Download },
        { label: "Boas-vindas", href: "/bem-vindo", icon: Home },
      ],
    },
    {
      title: "Área do Usuário",
      items: [
        { label: "Awã Premium", href: "/planos", icon: Star },
      ],
    },
  ];
  const flatNav = navGroups.flatMap((g) => g.items);

  return (
    <div className="min-h-screen text-foreground">
      {/* HEADER */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[oklch(0.18_0.04_145/0.7)] border-b border-gold/20">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-3 py-3 sm:px-4 md:px-8">
          <button
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gold/40 bg-card/60 text-gold xl:hidden"
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1 xl:flex-none">
            <Logo />
          </div>
          <nav className="hidden xl:flex items-center gap-1">
            {[
              { label: "Dicionário", href: "/dicionario" },
              { label: "Tradutor", href: "/traduzir" },
              { label: "Trilhas", href: "/trilhas" },
              { label: "Histórias", href: "/historias" },
              { label: "Músicas", href: "/musicas" },
              { label: "Vídeos", href: "/videos" },
              { label: "Jogos", href: "/jogos" },
            ].map((n) => (
              <Link key={n.label} to={n.href} className="whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium text-foreground/80 transition hover:bg-leaf/15 hover:text-cream">
                {n.label}
              </Link>
            ))}
            <Link to="/planos" className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gold/20 px-3 py-2 text-sm font-bold text-gold hover:bg-gold/30">
              <Star className="h-4 w-4" /> Premium
            </Link>
            {isAdmin && (
              <Link to="/admin" className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gold/20 px-3 py-2 text-sm font-semibold text-gold hover:bg-gold/30">
                <Settings className="h-4 w-4" /> Painel
              </Link>
            )}
            {user ? (
              <button onClick={signOut} className="inline-flex shrink-0 items-center gap-1 rounded-full border border-gold/30 px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-gold/10">
                <LogOut className="h-4 w-4" /> Sair
              </button>
            ) : (
              <Link to="/auth" className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[var(--gradient-leaf)] px-4 py-2 text-sm font-bold text-cream shadow-[var(--shadow-glow)]">
                <LogIn className="h-4 w-4" /> Entrar
              </Link>
            )}
          </nav>
        </div>

        {open && (
          <div className="lg:hidden border-t border-gold/20 bg-card/95 px-4 py-4 max-h-[80vh] overflow-y-auto">
            <div className="text-center pb-3 mb-3 border-b border-gold/15">
              <div className="font-display text-sm font-black text-cream">AWÃ TECH</div>
              <div className="text-[10px] font-semibold tracking-[0.18em] text-gold/80">CAMINHO DA SABEDORIA</div>
            </div>
            <div className="flex flex-col gap-4">
              {navGroups.map((group) => (
                <div key={group.title}>
                  <div className="mb-1.5 px-1 text-[10px] font-bold uppercase tracking-[0.15em] text-gold/70">
                    {group.title}
                  </div>
                  <div className="flex flex-col gap-1">
                    {group.items.map((n) => (
                      <Link
                        key={n.label}
                        to={n.href}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/85 hover:bg-leaf/15"
                      >
                        <n.icon className="h-4 w-4 text-gold" />
                        <span className="flex-1">{n.label}</span>
                        {n.premium && (
                          <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[9px] font-bold text-gold">
                            PREMIUM
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
              <div className="border-t border-gold/15 pt-3 flex flex-col gap-1">
                {isAdmin && (
                  <Link to="/admin" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gold hover:bg-gold/15">
                    <Settings className="h-4 w-4" /> Painel Admin
                  </Link>
                )}
                {user ? (
                  <button onClick={() => { setOpen(false); signOut(); }} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/85 hover:bg-leaf/15">
                    <LogOut className="h-4 w-4 text-gold" /> Sair
                  </button>
                ) : (
                  <Link to="/auth" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-cream bg-[var(--gradient-leaf)]">
                    <LogIn className="h-4 w-4" /> Entrar / Criar conta
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </header>



      <main className="mx-auto max-w-6xl px-4 md:px-8">
        {/* HERO */}
        <section id="início" className="relative mt-6 overflow-hidden rounded-3xl card-elev">
          <div className="grid md:grid-cols-2">
            <div className="relative order-2 md:order-1 p-6 md:p-10">
              <span className="chip-gold inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold">
                <Sparkles className="h-3.5 w-3.5" /> Patrimônio vivo
              </span>
              <h1 className="mt-4 font-display text-4xl font-black leading-[1.05] text-cream md:text-5xl lg:text-6xl">
                Aprenda <span className="text-leaf">línguas indígenas</span>, preserve culturas
                <span className="text-gold"> vivas</span>.
              </h1>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-foreground/75 md:text-base">
                Uma plataforma digital para aprender idiomas indígenas brasileiros através de
                vídeos, histórias, músicas e desafios — guiados por mestres das aldeias.
              </p>


              {/* stats */}
              <div className="mt-7 grid grid-cols-3 gap-2 rounded-2xl border border-gold/25 bg-[oklch(0.16_0.04_145/0.6)] p-3 text-center">
                <Stat icon={<Flame className="h-4 w-4 text-gold" />} label="Sequência" value="7" sub="dias" />
                <Stat icon={<Star className="h-4 w-4 text-gold" />} label="Pontos" value="250" sub="pontos" />
                <Stat icon={<Award className="h-4 w-4 text-gold" />} label="Nível" value="2" sub="Aprendiz" />
              </div>
            </div>

            <div className="relative order-1 md:order-2 min-h-[280px] md:min-h-[520px]">
              <img
                src={heroWoman}
                alt="Mulher indígena brasileira com cocar tradicional na floresta amazônica"
                width={1024}
                height={1536}
                fetchPriority="high"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent md:bg-gradient-to-r" />
              <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full border border-gold/40 bg-card/80 px-3 py-1.5 backdrop-blur">
                <div className="grid h-7 w-7 place-items-center rounded-full bg-gold/25 text-[10px] font-black text-gold">
                  AK
                </div>
                <div className="text-xs leading-tight">
                  <div className="text-foreground/70">Olá,</div>
                  <div className="font-bold text-gold">Akuá!</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SAUDAÇÃO DO MOMENTO */}
        <GreetingOfMoment />

        {/* FRASE DO DIA */}
        <section className="mt-6">
          <Link
            to="/trilhas"
            className="card-elev block rounded-2xl border border-gold/25 bg-gradient-to-br from-forest-deep/60 to-bark/30 p-5 transition hover:-translate-y-0.5"
          >
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-leaf">Sabedoria do dia · Trilhas</div>
            <p className="mt-2 font-display text-lg md:text-xl font-bold text-cream">{fraseDoDia()}</p>
            <p className="mt-2 text-xs text-foreground/70">Toque para entrar nas trilhas guiadas pelo Professor Akuã →</p>
          </Link>
        </section>


        {/* CONTINUAR APRENDENDO */}
        <section id="aprender" className="mt-6">
          <div className="card-elev rounded-2xl p-4 md:p-5">
            <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gold/15 text-gold">
                <BookOpen className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-display text-lg font-bold text-cream">Continuar aprendendo</h3>
                  <span className="text-sm font-bold text-gold">60%</span>
                </div>
                <p className="truncate text-sm text-foreground/70">
                  Lição 3 — Saudações em Pataxó
                </p>
                <Progress value={60} className="mt-2" />
              </div>
            </div>
          </div>
        </section>

        {/* VÍDEO DO DIA — real-time do dicionário Patxôhã */}
        <DailyWordVideo />


        {/* TRILHAS */}
        <section className="mt-8">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <div className="tribal-border w-16 mb-2" />
              <h2 className="font-display text-2xl font-black text-cream md:text-3xl">
                Trilhas de aprendizado
              </h2>
            </div>
            <a href="#aprender" className="inline-flex items-center gap-1 text-sm font-semibold text-gold hover:underline">
              Ver todas <ChevronRight className="h-4 w-4" />
            </a>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {trails.map((t, i) => {
              const map: Record<string, "saudacoes" | "familia" | "natureza" | "animais"> = {
                "Saudações": "saudacoes", "Família": "familia", "Natureza": "natureza",
                "Animais": "animais",
              };

              const slug = map[t.name];
              const cls = "group card-elev overflow-hidden rounded-2xl transition hover:-translate-y-1 hover:shadow-[var(--shadow-glow)]";
              const inner = (
                <>
                  <div className="relative aspect-square overflow-hidden">
                    <img src={t.img} alt={t.name} width={640} height={640} loading="lazy"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  </div>
                  <div className="p-3">
                    <div className="text-sm font-bold text-cream">{t.name}</div>
                    <Progress value={t.progress} className="mt-2" />
                  </div>
                </>
              );
              return slug ? (
                <Link key={t.name} to="/trilhas/$slug" params={{ slug }} className={cls}>{inner}</Link>
              ) : (
                <a key={t.name} href="#aprender" className={cls}>{inner}</a>
              );
            })}
          </div>
        </section>

        {/* MISSÃO + RANKING */}
        <section id="desafios" className="mt-8 grid gap-4 md:grid-cols-2">
          {/* Missão */}
          <div className="card-elev rounded-2xl p-5">
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-gold/15 text-gold">
                <Trophy className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-black text-cream">Missão do dia</h3>
            </div>
            <p className="mt-3 text-sm text-foreground/70">
              {mission?.question ?? "Carregando missão..."}
            </p>
            <div className="mt-3 flex flex-col gap-2">
              {(mission?.options ?? []).map((label: string, i: number) => {
                const correct = mission?.correct_index;
                const isPicked = answer === i;
                const isRight = answer !== null && i === correct;
                const isWrong = isPicked && i !== correct;
                return (
                  <button
                    key={i}
                    onClick={() => setAnswer(i)}
                    className={[
                      "flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-semibold transition",
                      isRight
                        ? "border-leaf/60 bg-leaf/20 text-cream"
                        : isWrong
                          ? "border-destructive/50 bg-destructive/15 text-cream"
                          : "border-gold/25 bg-card/60 text-foreground/85 hover:border-gold/50",
                    ].join(" ")}
                  >
                    <span>
                      {String.fromCharCode(65 + i)}) {label}
                    </span>
                    {isRight && <Check className="h-4 w-4 text-leaf" />}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1.5 text-gold">
                <Star className="h-3.5 w-3.5 fill-gold" /> {mission?.points ?? 10} pontos
              </span>
              {answer !== null && answer === mission?.correct_index && (
                <span className="font-bold text-leaf">+{mission?.points ?? 10} pontos conquistados!</span>
              )}
              {answer !== null && answer !== mission?.correct_index && (
                <span className="font-semibold text-foreground/70">Tente novamente</span>
              )}
            </div>
          </div>


          {/* Ranking */}
          <div className="card-elev rounded-2xl p-5">
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-gold/15 text-gold">
                <Award className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-black text-cream">
                Top aprendizes da semana
              </h3>
            </div>
            <ul className="mt-4 flex flex-col gap-2">
              {ranking.map((u) => (
                <li
                  key={u.name}
                  className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-gold/20 bg-card/60 px-3 py-2.5"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-leaf/25 text-xs font-bold text-cream">
                    {u.initials}
                  </span>
                  <span className="truncate text-sm font-semibold text-cream">{u.name}</span>
                  <span className="text-xs font-bold text-gold">{u.points} pts</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* RECURSOS */}
        <section className="mt-10">
          <div className="mb-4 text-center">
            <div className="tribal-border mx-auto w-20" />
            <h2 className="mt-3 font-display text-2xl font-black text-cream md:text-3xl">
              Recursos da plataforma
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-foreground/70">
              Tudo o que você precisa para mergulhar nas línguas e culturas dos povos originários.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {resources.map((r) => (
              <div
                key={r.label}
                className="card-elev group rounded-2xl p-5 transition hover:-translate-y-1"
              >
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--gradient-leaf)] text-cream shadow-[var(--shadow-glow)]">
                  <r.icon className="h-5 w-5" />
                </div>
                <h4 className="mt-3 font-display text-lg font-bold text-cream">{r.label}</h4>
                <p className="mt-1 text-xs leading-relaxed text-foreground/70">{r.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* BAIXAR APP */}
        <section className="mt-10 rounded-3xl border border-gold/20 bg-gradient-to-br from-leaf/15 to-forest-deep/20 p-6 text-center md:p-10">
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gold/15 text-gold shadow-[var(--shadow-glow)]">
              <Download className="h-7 w-7" />
            </div>
            <h2 className="font-display text-2xl font-black text-cream md:text-3xl">
              Instale o Awã Tech no seu celular
            </h2>
            <p className="text-sm leading-relaxed text-foreground/80 md:text-base">
              Adicione o app à tela inicial e acesse o dicionário, músicas, histórias e Professor
              Akuã com um toque — como um app nativo.
            </p>

            <div className="mt-2 grid w-full gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-gold/15 bg-card/50 p-5 text-left">
                <div className="flex items-center gap-2 text-cream">
                  <Smartphone className="h-4 w-4 text-gold" />
                  <span className="text-sm font-bold">Android</span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-foreground/75">
                  No Chrome, toque no menu ⋮ e escolha{" "}
                  <strong className="text-cream">Adicionar à tela inicial</strong> ou{" "}
                  <strong className="text-cream">Instalar app</strong>.
                </p>
              </div>
              <div className="rounded-2xl border border-gold/15 bg-card/50 p-5 text-left">
                <div className="flex items-center gap-2 text-cream">
                  <Smartphone className="h-4 w-4 text-gold" />
                  <span className="text-sm font-bold">iPhone</span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-foreground/75">
                  No Safari, toque no botão{" "}
                  <strong className="text-cream">Compartilhar</strong> e depois em{" "}
                  <strong className="text-cream">Adicionar à Tela de Início</strong>.
                </p>
              </div>
            </div>

            <Link
              to="/instalar"
              className="mt-4 inline-flex items-center justify-center rounded-full bg-gold px-6 py-2.5 text-sm font-bold text-forest-deep transition hover:bg-gold/90"
            >
              Ver instruções completas
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="mt-14 border-t border-gold/20 bg-[oklch(0.14_0.03_145/0.8)]">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3 md:px-8">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-3 text-xs leading-relaxed text-foreground/65">
              AWÃ TECH é uma iniciativa educacional dedicada à preservação e ao ensino das línguas
              e culturas dos povos indígenas do Brasil.
            </p>
          </div>
          <div>
            <div className="text-sm font-bold text-cream">Redes sociais</div>
            <div className="mt-3 flex gap-2">
              {[Instagram, Youtube, Facebook, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="grid h-9 w-9 place-items-center rounded-full border border-gold/30 bg-card/60 text-gold transition hover:bg-gold/15"
                  aria-label="rede social"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-gold/15">
          <div className="mx-auto max-w-6xl px-4 py-4 text-center text-xs text-foreground/60 md:px-8">
            © {new Date().getFullYear()} AWÃ TECH · Todos os direitos reservados · Feito com
            respeito aos povos originários.
          </div>
        </div>
      </footer>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="px-1">
      <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-foreground/70">
        {icon} {label}
      </div>
      <div className="mt-0.5 font-display text-2xl font-black text-cream">{value}</div>
      <div className="text-[10px] text-foreground/60">{sub}</div>
    </div>
  );
}

function Progress({ value, className = "" }: { value: number; className?: string }) {
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-card/80 ${className}`}>
      <div
        className="h-full rounded-full bg-[var(--gradient-leaf)] transition-all"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function GreetingOfMoment() {
  const { data: list = [] } = useQuery({
    queryKey: ["saudacoes"],
    queryFn: fetchSaudacoes,
  });
  const atual = pickByHour(list);
  if (!atual) return null;
  const h = new Date().getHours();
  const periodo =
    h >= 5 && h <= 11 ? "Bom dia" : h >= 12 && h <= 17 ? "Boa tarde" : "Boa noite";
  return (
    <section className="mt-6">
      <Link
        to="/saudacoes"
        className="card-elev block rounded-2xl p-4 md:p-5 border border-gold/25 bg-gradient-to-br from-forest-deep/50 to-bark/30 hover:border-gold/50 transition"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-leaf">
              Saudação do momento · {periodo}
            </div>
            <div className="mt-1 font-display text-2xl font-black text-gold truncate">
              {atual.term_indigenous}
            </div>
            <div className="text-sm text-cream/85 truncate">
              {atual.term_pt}
              {atual.pronunciation ? ` · ${atual.pronunciation}` : ""}
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-gold shrink-0" />
        </div>
      </Link>
    </section>
  );
}

import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { lazy, Suspense, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import {
  ArrowLeft,
  BookOpen,
  Video,
  Trophy,
  Library,
  LogOut,
  Music,
  Wand2,
  Crown,
  LayoutGrid,
  ChevronRight,
  KeyRound,
  CreditCard,
} from "lucide-react";

const TrailsAdmin = lazy(() => import("@/components/admin/trails-admin").then((m) => ({ default: m.TrailsAdmin })));
const VideoAdmin = lazy(() => import("@/components/admin/video-admin").then((m) => ({ default: m.VideoAdmin })));
const MissionAdmin = lazy(() => import("@/components/admin/mission-admin").then((m) => ({ default: m.MissionAdmin })));
const DictionaryAdmin = lazy(() => import("@/components/admin/dictionary-admin").then((m) => ({ default: m.DictionaryAdmin })));
const SongsAdmin = lazy(() => import("@/components/admin/songs-admin").then((m) => ({ default: m.SongsAdmin })));
const ToolsAdmin = lazy(() => import("@/components/admin/tools-admin").then((m) => ({ default: m.ToolsAdmin })));
const AccessAdmin = lazy(() => import("@/components/admin/access-admin").then((m) => ({ default: m.AccessAdmin })));
const PaymentsAdmin = lazy(() => import("@/components/admin/payments-admin").then((m) => ({ default: m.PaymentsAdmin })));
const AllowlistAdmin = lazy(() => import("@/components/admin/allowlist-admin").then((m) => ({ default: m.AllowlistAdmin })));
const LayoutAdmin = lazy(() => import("@/components/admin/layout-admin").then((m) => ({ default: m.LayoutAdmin })));
const SiteAdmin = lazy(() => import("@/components/admin/site-admin").then((m) => ({ default: m.SiteAdmin })));


export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Painel de Controle — AWÃ TECH" }, { name: "robots", content: "noindex" }] }),
  beforeLoad: async () => {
    // O layout _authenticated já garante que há sessão. Aqui validamos a role
    // 'admin' pelo has_role (SECURITY DEFINER lendo public.user_roles).
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    if (!uid) throw redirect({ to: "/auth" });
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: uid,
      _role: "admin",
    });
    if (!isAdmin) throw redirect({ to: "/acesso-negado" });
  },
  component: AdminPage,
});


type Tab = "home" | "trails" | "video" | "mission" | "dictionary" | "songs" | "tools" | "access" | "allowlist" | "payments" | "layout" | "site";

type Section = {
  k: Tab;
  label: string;
  icon: typeof BookOpen;
  desc: string;
  group: "Conteúdo" | "Comunidade" | "Sistema";
  accent: string;
};

const SECTIONS: Section[] = [
  { k: "trails", label: "Trilhas", icon: BookOpen, desc: "Lições, palavras e progresso das trilhas.", group: "Conteúdo", accent: "from-leaf/30 to-forest/20" },
  { k: "dictionary", label: "Dicionário", icon: Library, desc: "Termos Patxôhã ↔ Português.", group: "Conteúdo", accent: "from-gold/25 to-earth/20" },
  { k: "songs", label: "Músicas", icon: Music, desc: "Áudios, legendas e vídeos ambiente.", group: "Conteúdo", accent: "from-leaf/25 to-gold/15" },
  { k: "video", label: "Vídeo do dia", icon: Video, desc: "Curadoria do card diário.", group: "Conteúdo", accent: "from-forest/40 to-leaf/20" },
  { k: "mission", label: "Missão", icon: Trophy, desc: "Missão diária e recompensas.", group: "Comunidade", accent: "from-gold/30 to-earth/20" },
  { k: "access", label: "Acesso Premium", icon: Crown, desc: "Liberar / revogar assinantes.", group: "Comunidade", accent: "from-gold/35 to-leaf/15" },
  { k: "allowlist", label: "Liberação de Login", icon: KeyRound, desc: "Emails e celulares permitidos a entrar.", group: "Comunidade", accent: "from-leaf/30 to-gold/20" },
  { k: "payments", label: "Pagamentos", icon: CreditCard, desc: "Testar checkout e conferir planos.", group: "Sistema", accent: "from-gold/30 to-leaf/20" },
  { k: "tools", label: "Ferramentas IA", icon: Wand2, desc: "Tradução, TTS e transcrição.", group: "Sistema", accent: "from-leaf/25 to-forest/25" },
  { k: "layout", label: "Design & Layout", icon: LayoutGrid, desc: "Cores, logos e menus visuais.", group: "Sistema", accent: "from-gold/25 to-forest/20" },
  { k: "site", label: "IA & Sistema", icon: Wand2, desc: "Akuã, Tradutor e acesso irrestrito.", group: "Sistema", accent: "from-leaf/30 to-gold/20" },
];


function AdminPage() {
  const { loading } = useAuth();
  const [tab, setTab] = useState<Tab>("home");
  const navigate = useNavigate();

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  if (loading) {
    return <div className="grid min-h-screen place-items-center text-foreground/70">Carregando painel...</div>;
  }



  const active = SECTIONS.find((s) => s.k === tab);
  const groups: Array<Section["group"]> = ["Conteúdo", "Comunidade", "Sistema"];

  return (
    <div className="min-h-screen pb-16">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-gold/20 bg-[oklch(0.18_0.04_145/0.85)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-8">
          <Link to="/" className="inline-flex min-w-0 items-center gap-2 text-sm font-semibold text-gold hover:underline">
            <ArrowLeft className="h-4 w-4 shrink-0" /> <span className="truncate">Site</span>
          </Link>
          <div className="flex items-center gap-2 font-display font-black text-cream">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--gradient-leaf)] text-cream shadow-[var(--shadow-glow)]">
              <LayoutGrid className="h-4 w-4" />
            </span>
            <span className="hidden text-lg sm:inline">Painel AWÃ</span>
          </div>
          <button
            onClick={signOut}
            className="inline-flex items-center gap-1 rounded-full border border-gold/30 px-3 py-1.5 text-xs font-semibold text-foreground/80 hover:border-gold/60 hover:text-gold"
          >
            <LogOut className="h-3.5 w-3.5" /> Sair
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:grid-cols-[240px_minmax(0,1fr)] md:px-8">
        {/* Sidebar */}
        <aside className="md:sticky md:top-24 md:h-fit">
          <button
            onClick={() => setTab("home")}
            className={`mb-3 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${
              tab === "home"
                ? "bg-[var(--gradient-leaf)] text-cream shadow-[var(--shadow-glow)]"
                : "border border-gold/25 bg-card/40 text-foreground/80 hover:border-gold/50"
            }`}
          >
            <LayoutGrid className="h-4 w-4" /> Visão geral
          </button>
          <div className="space-y-4">
            {groups.map((g) => (
              <div key={g}>
                <div className="mb-1 px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/50">
                  {g}
                </div>
                <div className="space-y-1">
                  {SECTIONS.filter((s) => s.group === g).map((s) => (
                    <button
                      key={s.k}
                      onClick={() => setTab(s.k)}
                      className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium transition ${
                        tab === s.k
                          ? "bg-gold/15 text-gold ring-1 ring-gold/40"
                          : "text-foreground/75 hover:bg-card/40 hover:text-cream"
                      }`}
                    >
                      <s.icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Content */}
        <main className="min-w-0">
          {tab === "home" ? (
            <div>
              <div className="card-elev overflow-hidden rounded-3xl bg-gradient-to-br from-forest-deep/70 via-forest/40 to-leaf/20 p-6 md:p-8">
                <div className="text-xs font-bold uppercase tracking-[0.22em] text-gold/90">Painel AWÃ TECH</div>
                <h2 className="mt-2 font-display text-3xl font-black text-cream md:text-4xl">
                  Bem-chegado, mestre 🌿
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-foreground/80 md:text-base">
                  Escolha uma seção para curar conteúdos, cuidar da comunidade e afinar o sistema.
                </p>
              </div>

              {groups.map((g) => (
                <section key={g} className="mt-8">
                  <div className="mb-3 flex items-center gap-3">
                    <h3 className="font-display text-lg font-black text-cream">{g}</h3>
                    <span className="h-px flex-1 bg-gold/20" />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {SECTIONS.filter((s) => s.group === g).map((s) => (
                      <button
                        key={s.k}
                        onClick={() => setTab(s.k)}
                        className={`card-elev group relative overflow-hidden rounded-2xl bg-gradient-to-br ${s.accent} p-5 text-left transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-glow)]`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-forest-deep/50 text-gold ring-1 ring-gold/30">
                            <s.icon className="h-5 w-5" />
                          </span>
                          <div className="min-w-0">
                            <div className="font-display text-lg font-black text-cream">{s.label}</div>
                            <div className="truncate text-xs text-foreground/70">{s.desc}</div>
                          </div>
                          <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-gold/70 transition group-hover:translate-x-0.5" />
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div>
              {active && (
                <div className="mb-5 flex items-center gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--gradient-leaf)] text-cream shadow-[var(--shadow-glow)]">
                    <active.icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-gold/80">
                      {active.group}
                    </div>
                    <h2 className="truncate font-display text-2xl font-black text-cream">{active.label}</h2>
                  </div>
                </div>
              )}
              <div className="card-elev rounded-3xl p-4 md:p-6">
                <Suspense fallback={<div className="py-10 text-center text-foreground/60">Carregando...</div>}>
                  {tab === "trails" && <TrailsAdmin />}
                  {tab === "video" && <VideoAdmin />}
                  {tab === "mission" && <MissionAdmin />}
                  {tab === "songs" && <SongsAdmin />}
                  {tab === "dictionary" && <DictionaryAdmin />}
                  {tab === "tools" && <ToolsAdmin />}
                  {tab === "access" && <AccessAdmin />}
                  {tab === "allowlist" && <AllowlistAdmin />}
                  {tab === "payments" && <PaymentsAdmin />}
                  {tab === "layout" && <LayoutAdmin />}
                  {tab === "site" && <SiteAdmin />}
                </Suspense>

              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

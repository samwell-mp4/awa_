import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { ArrowLeft, BookOpen, Video, Trophy, Library, LogOut, Music } from "lucide-react";
import { TrailsAdmin } from "@/components/admin/trails-admin";
import { VideoAdmin } from "@/components/admin/video-admin";
import { MissionAdmin } from "@/components/admin/mission-admin";
import { DictionaryAdmin } from "@/components/admin/dictionary-admin";
import { SongsAdmin } from "@/components/admin/songs-admin";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Painel — AWÃ TECH" }] }),
  component: AdminPage,
});

type Tab = "trails" | "video" | "mission" | "dictionary";

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const [tab, setTab] = useState<Tab>("trails");
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const navigate = useNavigate();

  // First admin bootstrap: if no admin exists yet, promote the current user.
  useEffect(() => {
    if (loading || !user) return;
    (async () => {
      if (isAdmin) {
        setAllowed(true);
        setChecking(false);
        return;
      }
      // Check if any admin exists
      const { count } = await supabase
        .from("user_roles")
        .select("*", { count: "exact", head: true })
        .eq("role", "admin");
      if ((count ?? 0) === 0) {
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: user.id, role: "admin" });
        if (!error) {
          toast.success("Você é o primeiro administrador!");
          setAllowed(true);
        } else {
          toast.error("Não foi possível criar o admin: " + error.message);
        }
      }
      setChecking(false);
    })();
  }, [user, isAdmin, loading]);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  if (loading || checking) {
    return <div className="grid min-h-screen place-items-center text-foreground/70">Carregando painel...</div>;
  }

  if (!isAdmin && !allowed) {
    return (
      <div className="grid min-h-screen place-items-center px-4">
        <div className="card-elev max-w-md rounded-2xl p-6 text-center">
          <h1 className="font-display text-2xl font-black text-cream">Acesso restrito</h1>
          <p className="mt-2 text-sm text-foreground/70">
            Sua conta não tem permissão de administrador. Peça a um admin para conceder o acesso.
          </p>
          <Link to="/" className="mt-4 inline-block text-gold hover:underline text-sm font-semibold">
            ← Voltar à página inicial
          </Link>
        </div>
      </div>
    );
  }

  const tabs: { k: Tab; label: string; icon: typeof BookOpen }[] = [
    { k: "trails", label: "Trilhas", icon: BookOpen },
    { k: "video", label: "Vídeo do dia", icon: Video },
    { k: "mission", label: "Missão", icon: Trophy },
    { k: "dictionary", label: "Dicionário", icon: Library },
  ];

  return (
    <div className="min-h-screen pb-16">
      <header className="sticky top-0 z-40 border-b border-gold/20 bg-[oklch(0.18_0.04_145/0.8)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 md:px-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-gold hover:underline">
            <ArrowLeft className="h-4 w-4" /> Site
          </Link>
          <h1 className="font-display text-lg font-black text-cream">Painel AWÃ</h1>
          <button onClick={signOut} className="inline-flex items-center gap-1 text-xs text-foreground/70 hover:text-gold">
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-3 md:px-8">
          {tabs.map((t) => (
            <button
              key={t.k}
              onClick={() => setTab(t.k)}
              className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
                tab === t.k
                  ? "bg-[var(--gradient-leaf)] text-cream shadow-[var(--shadow-glow)]"
                  : "border border-gold/25 bg-card/40 text-foreground/75 hover:border-gold/50"
              }`}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 md:px-8">
        {tab === "trails" && <TrailsAdmin />}
        {tab === "video" && <VideoAdmin />}
        {tab === "mission" && <MissionAdmin />}
        {tab === "dictionary" && <DictionaryAdmin />}
      </main>
    </div>
  );
}

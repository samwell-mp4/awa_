import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import authBg from "@/assets/awa-auth-bg.jpg.asset.json";
import adultoLogo from "@/assets/adulto-logo.png.asset.json";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Entrar — AWÃ TECH" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/" });
    });
  }, [navigate]);

  async function handleGoogle() {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Erro ao entrar com Google");
      setBusy(false);
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/" });
  }

  return (
    <div className="relative min-h-screen grid place-items-center px-4 py-10 overflow-hidden">
      <img src={authBg.url} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/70 to-background/95 backdrop-blur-[2px]" />
      <div className="relative w-full max-w-md card-elev rounded-3xl p-7 backdrop-blur-md bg-card/80 border border-gold/30 shadow-2xl">
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-gold/80">
          <Sparkles className="h-3.5 w-3.5" /> AWÃ TECH
        </Link>
        <h1 className="mt-3 font-display text-3xl font-black text-cream">Entrar</h1>
        <p className="mt-1 text-sm text-foreground/70">
          Acesse trilhas, ranking e o painel administrativo.
        </p>

        <button
          onClick={handleGoogle}
          disabled={busy}
          className="mt-6 w-full rounded-xl border border-gold/30 bg-card/60 px-4 py-3 text-sm font-semibold text-cream hover:bg-gold/10 disabled:opacity-70"
        >
          {busy ? (
            <span className="flex items-center justify-center gap-3">
              <img src={adultoLogo.url} alt="" className="h-7 w-7 rounded-full object-cover ring-1 ring-gold/40 animate-pulse" />
              <span className="flex flex-col items-start leading-tight">
                <span className="text-[10px] font-bold tracking-[0.2em] text-gold/80">AWÃ TECH</span>
                <span className="text-xs text-foreground/80">Conectando com o Google…</span>
              </span>
            </span>
          ) : (
            "Continuar com Google"
          )}
        </button>
      </div>
    </div>
  );
}

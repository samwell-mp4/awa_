import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import authBg from "@/assets/awa-auth-bg.jpg.asset.json";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Entrar — AWÃ TECH" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/" });
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { name: name || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("Conta criada! Você já pode entrar.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Bem-vindo!");
        navigate({ to: "/" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro");
    } finally {
      setBusy(false);
    }
  }

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
      <img
        src={authBg.url}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/70 to-background/95 backdrop-blur-[2px]" />
      <div className="relative w-full max-w-md card-elev rounded-3xl p-7 backdrop-blur-md bg-card/80 border border-gold/30 shadow-2xl">
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-gold/80">
          <Sparkles className="h-3.5 w-3.5" /> AWÃ TECH
        </Link>
        <h1 className="mt-3 font-display text-3xl font-black text-cream">
          {mode === "signin" ? "Entrar" : "Criar conta"}
        </h1>
        <p className="mt-1 text-sm text-foreground/70">
          Acesse trilhas, ranking e o painel administrativo.
        </p>

        <button
          onClick={handleGoogle}
          disabled={busy}
          className="mt-5 w-full rounded-xl border border-gold/30 bg-card/60 px-4 py-3 text-sm font-semibold text-cream hover:bg-gold/10 disabled:opacity-50"
        >
          Continuar com Google
        </button>

        <div className="my-5 flex items-center gap-3 text-xs text-foreground/50">
          <div className="h-px flex-1 bg-gold/20" /> ou e-mail <div className="h-px flex-1 bg-gold/20" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {mode === "signup" && (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome"
              className="rounded-xl border border-gold/25 bg-card/60 px-4 py-3 text-sm text-cream placeholder:text-foreground/40 focus:outline-none focus:border-gold/60"
            />
          )}
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail"
            className="rounded-xl border border-gold/25 bg-card/60 px-4 py-3 text-sm text-cream placeholder:text-foreground/40 focus:outline-none focus:border-gold/60"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha (mín. 6)"
            className="rounded-xl border border-gold/25 bg-card/60 px-4 py-3 text-sm text-cream placeholder:text-foreground/40 focus:outline-none focus:border-gold/60"
          />
          <button
            disabled={busy}
            className="mt-2 rounded-xl bg-[var(--gradient-leaf)] px-4 py-3 text-sm font-bold text-cream shadow-[var(--shadow-glow)] disabled:opacity-50"
          >
            {busy ? "Carregando..." : mode === "signin" ? "Entrar" : "Criar conta"}
          </button>
        </form>

        <div className="mt-4 flex flex-col gap-2 text-center text-xs">
          <button
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="text-foreground/70 hover:text-gold"
          >
            {mode === "signin" ? "Não tem conta? Criar uma" : "Já tem conta? Entrar"}
          </button>
          {mode === "signin" && (
            <Link to="/reset-password" className="text-foreground/60 hover:text-gold">
              Esqueci minha senha
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

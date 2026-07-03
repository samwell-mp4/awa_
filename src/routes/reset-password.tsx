import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, KeyRound } from "lucide-react";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Redefinir senha — AWÃ TECH" }] }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"request" | "update">("request");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // Se o usuário chegou via link de recuperação, o Supabase abre uma sessão temporária
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setMode("update");
    });
    supabase.auth.getSession().then(({ data }) => {
      const hash = typeof window !== "undefined" ? window.location.hash : "";
      if (data.session && hash.includes("type=recovery")) setMode("update");
    });
  }, []);

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("Enviamos um link de recuperação para o seu e-mail.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro");
    } finally {
      setBusy(false);
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Senha atualizada!");
      navigate({ to: "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center px-4 py-10">
      <div className="w-full max-w-md card-elev rounded-3xl p-7 backdrop-blur-md bg-card/80 border border-gold/30 shadow-2xl">
        <Link to="/auth" className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-gold/80">
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar
        </Link>
        <h1 className="mt-3 flex items-center gap-2 font-display text-2xl font-black text-cream">
          <KeyRound className="h-5 w-5 text-gold" />
          {mode === "request" ? "Recuperar senha" : "Nova senha"}
        </h1>
        <p className="mt-1 text-sm text-foreground/70">
          {mode === "request"
            ? "Digite seu e-mail e enviaremos um link para redefinir sua senha."
            : "Defina uma nova senha (mínimo 6 caracteres)."}
        </p>

        {mode === "request" ? (
          <form onSubmit={handleRequest} className="mt-5 flex flex-col gap-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-mail"
              className="rounded-xl border border-gold/25 bg-card/60 px-4 py-3 text-sm text-cream placeholder:text-foreground/40 focus:outline-none focus:border-gold/60"
            />
            <button
              disabled={busy}
              className="rounded-xl bg-[var(--gradient-leaf)] px-4 py-3 text-sm font-bold text-cream shadow-[var(--shadow-glow)] disabled:opacity-50"
            >
              {busy ? "Enviando..." : "Enviar link"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleUpdate} className="mt-5 flex flex-col gap-3">
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nova senha"
              className="rounded-xl border border-gold/25 bg-card/60 px-4 py-3 text-sm text-cream placeholder:text-foreground/40 focus:outline-none focus:border-gold/60"
            />
            <button
              disabled={busy}
              className="rounded-xl bg-[var(--gradient-leaf)] px-4 py-3 text-sm font-bold text-cream shadow-[var(--shadow-glow)] disabled:opacity-50"
            >
              {busy ? "Salvando..." : "Atualizar senha"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

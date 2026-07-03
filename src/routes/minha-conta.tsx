import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ArrowLeft, CreditCard, Loader2, LogOut, Shield, Star } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import { openCustomerPortalSession } from "@/lib/customer-portal.functions";
import { getPaddleEnvironment } from "@/lib/paddle";

export const Route = createFileRoute("/minha-conta")({
  head: () => ({ meta: [{ title: "Minha conta — AWÃ TECH" }] }),
  component: MinhaContaPage,
});

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function statusLabel(status?: string | null, cancelAtEnd?: boolean | null) {
  if (!status) return { text: "Sem assinatura", tone: "muted" as const };
  if (status === "active" && cancelAtEnd) return { text: "Ativa (cancela no fim do período)", tone: "warn" as const };
  if (status === "active") return { text: "Ativa", tone: "ok" as const };
  if (status === "trialing") return { text: "Em teste", tone: "ok" as const };
  if (status === "past_due") return { text: "Pagamento em atraso", tone: "warn" as const };
  if (status === "canceled") return { text: "Cancelada", tone: "muted" as const };
  return { text: status, tone: "muted" as const };
}

function MinhaContaPage() {
  const { user, loading } = useAuth();
  const { isPremium, subscription } = useSubscription();
  const openPortal = useServerFn(openCustomerPortalSession);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </div>
    );
  }
  if (!user) {
    navigate({ to: "/auth", search: { redirect: "/minha-conta" } as any });
    return null;
  }

  async function handlePortal() {
    setBusy(true);
    try {
      const { url } = await openPortal({ data: { environment: getPaddleEnvironment() } });
      window.location.href = url;
    } catch (e: any) {
      toast.error(e.message ?? "Não foi possível abrir o portal.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    // limpar cache local do TanStack Query
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("supabase.auth.token");
    }
    navigate({ to: "/" });
  }

  const s = statusLabel(subscription?.status, subscription?.cancel_at_period_end);
  const toneClass =
    s.tone === "ok"
      ? "bg-leaf/15 text-leaf border-leaf/30"
      : s.tone === "warn"
        ? "bg-gold/15 text-gold border-gold/40"
        : "bg-card/60 text-foreground/70 border-foreground/20";

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-gold/20 bg-[oklch(0.18_0.04_145/0.85)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3 md:px-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-gold hover:underline">
            <ArrowLeft className="h-4 w-4" /> Início
          </Link>
          <div className="font-display text-sm font-black uppercase tracking-wider text-cream">
            Minha conta
          </div>
          <div className="w-16" />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 md:px-8 md:py-14">
        <section className="card-elev rounded-3xl border border-gold/25 p-6 md:p-8">
          <div className="text-xs font-bold uppercase tracking-wider text-foreground/60">Perfil</div>
          <h1 className="mt-1 font-display text-2xl font-black text-cream md:text-3xl">
            {user.user_metadata?.name || user.email}
          </h1>
          <p className="text-sm text-foreground/70">{user.email}</p>
        </section>

        <section className="mt-6 card-elev rounded-3xl border border-gold/25 p-6 md:p-8">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-foreground/60">Assinatura</div>
              <h2 className="mt-1 font-display text-xl font-black text-cream">
                {isPremium ? "AWÃ TECH Premium" : "Plano Básico (grátis)"}
              </h2>
            </div>
            <span className={`rounded-full border px-3 py-1 text-xs font-bold ${toneClass}`}>
              {s.text}
            </span>
          </div>

          <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-xl border border-gold/15 bg-card/40 p-3">
              <dt className="text-[11px] uppercase tracking-wider text-foreground/50">Plano</dt>
              <dd className="mt-0.5 text-cream">
                {subscription?.price_id === "awa_premium_semestral"
                  ? "Semestral (R$ 149,90)"
                  : subscription?.price_id === "awa_premium_monthly"
                    ? "Mensal (R$ 29,90)"
                    : "—"}
              </dd>
            </div>
            <div className="rounded-xl border border-gold/15 bg-card/40 p-3">
              <dt className="text-[11px] uppercase tracking-wider text-foreground/50">
                {subscription?.cancel_at_period_end ? "Acesso até" : "Próxima cobrança"}
              </dt>
              <dd className="mt-0.5 text-cream">{formatDate(subscription?.current_period_end)}</dd>
            </div>
          </dl>

          <div className="mt-6 flex flex-wrap gap-3">
            {subscription?.paddle_customer_id ? (
              <button
                onClick={handlePortal}
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-2xl bg-[var(--gradient-leaf)] px-4 py-3 text-sm font-bold text-cream shadow-[var(--shadow-glow)] disabled:opacity-50"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                Gerenciar assinatura
              </button>
            ) : (
              <Link
                to="/planos"
                className="inline-flex items-center gap-2 rounded-2xl bg-gold px-4 py-3 text-sm font-bold text-forest-deep shadow-lg"
              >
                <Star className="h-4 w-4" /> Assinar Premium
              </Link>
            )}
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 rounded-2xl border border-gold/30 px-4 py-3 text-sm font-medium text-foreground/85 hover:bg-gold/10"
            >
              <LogOut className="h-4 w-4" /> Sair da conta
            </button>
          </div>

          <p className="mt-4 flex items-start gap-2 text-xs text-foreground/60">
            <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
            Ao cancelar, você mantém acesso Premium até o fim do período já pago. O pagamento é
            processado pelo Paddle com segurança.
          </p>
        </section>

        <section className="mt-6 grid gap-3 text-sm sm:grid-cols-3">
          <Link to="/termos" className="rounded-xl border border-gold/20 bg-card/40 p-3 text-center hover:bg-gold/10">Termos de uso</Link>
          <Link to="/privacidade" className="rounded-xl border border-gold/20 bg-card/40 p-3 text-center hover:bg-gold/10">Privacidade</Link>
          <Link to="/reembolso" className="rounded-xl border border-gold/20 bg-card/40 p-3 text-center hover:bg-gold/10">Reembolso</Link>
        </section>
      </main>
    </div>
  );
}

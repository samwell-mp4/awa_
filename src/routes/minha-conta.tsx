import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  CreditCard,
  Crown,
  Eye,
  Loader2,
  LogIn,
  LogOut,
  Shield,
  Sparkles,
  Star,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import { usePaddleCheckout } from "@/hooks/use-paddle-checkout";
import { openCustomerPortalSession } from "@/lib/customer-portal.functions";
import { getPaddleEnvironment } from "@/lib/paddle";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import logoSrc from "@/assets/awa-tech-logo.png";

export const Route = createFileRoute("/minha-conta")({
  head: () => ({
    meta: [
      { title: "Minha conta — AWÃ TECH" },
      {
        name: "description",
        content:
          "Sua central AWÃ TECH: bem-vindo, sua conta e o plano Premium em um só lugar.",
      },
      { property: "og:title", content: "Minha conta — AWÃ TECH" },
      {
        property: "og:description",
        content: "Bem-vindo ao AWÃ TECH. Gerencie sua conta e assine o Premium.",
      },
    ],
  }),
  validateSearch: (s: Record<string, unknown>) => ({
    checkout: (s.checkout as string | undefined) ?? undefined,
  }),
  component: MinhaContaPage,
});

const benefits = [
  "Dicionário Patxôhã completo (2.700+ palavras)",
  "Todas as trilhas de aprendizado",
  "Vídeos e músicas da aldeia",
  "Professor Akuã (chat com IA) ilimitado",
  "Tradutor Português ↔ Patxôhã",
  "Histórias e conteúdo cultural completo",
];

const freeItems = [
  "Galeria com histórias e imagens explicadas",
  "Dicionário básico Patxohã — palavras essenciais",
  "Biografia completa do Awã Tech",
  "Amostras curtas de áudios, músicas e vídeos",
  "Informações sobre cultura, traços e artesanato",
];

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusLabel(status?: string | null, cancelAtEnd?: boolean | null) {
  if (!status) return { text: "Sem assinatura", tone: "muted" as const };
  if (status === "active" && cancelAtEnd)
    return { text: "Ativa (cancela no fim do período)", tone: "warn" as const };
  if (status === "active") return { text: "Ativa", tone: "ok" as const };
  if (status === "trialing") return { text: "Em teste", tone: "ok" as const };
  if (status === "past_due") return { text: "Pagamento em atraso", tone: "warn" as const };
  if (status === "canceled") return { text: "Cancelada", tone: "muted" as const };
  return { text: status, tone: "muted" as const };
}

function MinhaContaPage() {
  const { user, loading: authLoading } = useAuth();
  const { isPremium, subscription, refetch } = useSubscription();
  const { openCheckout, loading: checkoutLoading } = usePaddleCheckout();
  const openPortal = useServerFn(openCustomerPortalSession);
  const navigate = useNavigate();
  const search = useSearch({ from: "/minha-conta" });
  const [busy, setBusy] = useState(false);
  const [processing, setProcessing] = useState(search.checkout === "success");

  useEffect(() => {
    if (search.checkout !== "success") return;
    setProcessing(true);
    let tries = 0;
    const id = window.setInterval(async () => {
      tries++;
      await refetch();
      if (isPremium || tries >= 20) {
        window.clearInterval(id);
        setProcessing(false);
      }
    }, 1500);
    return () => window.clearInterval(id);
  }, [search.checkout, isPremium, refetch]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
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

  function handleAssinar(priceId: "awa_premium_monthly" | "awa_premium_semestral") {
    if (!user) {
      navigate({ to: "/auth", search: { redirect: "/minha-conta" } as any });
      return;
    }
    openCheckout({
      priceId,
      userId: user.id,
      email: user.email,
      successUrl: `${window.location.origin}/minha-conta?checkout=success`,
    });
  }

  const s = statusLabel(subscription?.status, subscription?.cancel_at_period_end);
  const toneClass =
    s.tone === "ok"
      ? "bg-leaf/15 text-leaf border-leaf/30"
      : s.tone === "warn"
        ? "bg-gold/15 text-gold border-gold/40"
        : "bg-card/60 text-foreground/70 border-foreground/20";

  return (
    <div className="min-h-screen bg-[var(--gradient-forest)] text-cream">
      <PaymentTestModeBanner />
      <header className="sticky top-0 z-40 border-b border-gold/20 bg-[oklch(0.18_0.04_145/0.85)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 md:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gold hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Início
          </Link>
          <img src={logoSrc} alt="AWÃ TECH" className="h-9 w-auto" />
          <div className="w-16" />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-14">
        {/* HERO / BOAS-VINDAS */}
        <section className="relative overflow-hidden rounded-3xl border border-gold/30 bg-[oklch(0.18_0.05_145/0.55)] p-6 text-center backdrop-blur md:p-10">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-gold/10 blur-3xl" />
          <img
            src={logoSrc}
            alt="AWÃ TECH"
            className="mx-auto h-20 w-20 rounded-full bg-cream/95 p-1 shadow-[var(--shadow-glow)] ring-2 ring-gold/50 md:h-24 md:w-24"
          />
          <p className="mt-4 text-[11px] font-bold tracking-[0.22em] text-gold/90">
            AWÃ TECH • MINHA CONTA
          </p>
          <h1 className="mt-2 font-display text-3xl font-black leading-tight md:text-4xl">
            {authLoading
              ? "Carregando..."
              : user
                ? `Iporõ, ${user.user_metadata?.name || user.email?.split("@")[0]}!`
                : "Bem-vindo ao AWÃ TECH"}
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-foreground/80 md:text-base">
            {user
              ? "Sua conta, sua assinatura e o caminho Premium em um só lugar."
              : "O caminho para conhecer, aprender e preservar a sabedoria Pataxó."}
          </p>

          {!user && !authLoading && (
            <div className="mt-6 grid gap-2 sm:grid-cols-3">
              <Link
                to="/auth"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--gradient-leaf)] px-4 py-3 text-sm font-bold text-cream shadow-[var(--shadow-glow)]"
              >
                <UserPlus className="h-4 w-4" /> Criar conta
              </Link>
              <Link
                to="/auth"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gold/40 bg-card/60 px-4 py-3 text-sm font-bold text-cream backdrop-blur hover:bg-card/80"
              >
                <LogIn className="h-4 w-4" /> Entrar
              </Link>
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-leaf/40 px-4 py-3 text-sm font-semibold text-cream hover:bg-leaf/10"
              >
                <Eye className="h-4 w-4" /> Explorar
              </Link>
            </div>
          )}

          {user && (
            <div className="mt-5 inline-flex flex-wrap items-center justify-center gap-2">
              <span className="rounded-full border border-gold/20 bg-card/60 px-3 py-1 text-xs text-foreground/80">
                {user.email}
              </span>
              <span className={`rounded-full border px-3 py-1 text-xs font-bold ${toneClass}`}>
                {isPremium ? (
                  <span className="inline-flex items-center gap-1">
                    <Crown className="h-3 w-3" /> {s.text}
                  </span>
                ) : (
                  s.text
                )}
              </span>
            </div>
          )}
        </section>

        {/* CHECKOUT FEEDBACK */}
        {processing && !isPremium && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-gold/40 bg-gold/10 p-4">
            <Loader2 className="h-5 w-5 animate-spin text-gold" />
            <div className="text-sm text-cream">
              <b>Processando seu pagamento...</b> Isso costuma levar poucos segundos.
            </div>
          </div>
        )}
        {isPremium && search.checkout === "success" && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-leaf/50 bg-leaf/10 p-4">
            <CheckCircle2 className="h-5 w-5 text-leaf" />
            <div className="text-sm text-cream">
              <b>Pagamento confirmado!</b> Bem-vindo ao AWÃ TECH Premium 🌿
            </div>
          </div>
        )}

        {/* CONTA (se logado) */}
        {user && (
          <section className="mt-6 card-elev rounded-3xl border border-gold/25 p-6 md:p-8">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-foreground/60">
                  Assinatura
                </div>
                <h2 className="mt-1 font-display text-xl font-black text-cream">
                  {isPremium ? "AWÃ TECH Premium" : "Plano Básico (grátis)"}
                </h2>
              </div>
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
              {subscription?.paddle_customer_id && (
                <button
                  onClick={handlePortal}
                  disabled={busy}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[var(--gradient-leaf)] px-4 py-3 text-sm font-bold text-cream shadow-[var(--shadow-glow)] disabled:opacity-50"
                >
                  {busy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CreditCard className="h-4 w-4" />
                  )}
                  Gerenciar assinatura
                </button>
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
              Ao cancelar, você mantém acesso Premium até o fim do período já pago. Pagamento
              processado com segurança pelo Paddle.
            </p>
          </section>
        )}

        {/* PREMIUM — planos (se não é premium) */}
        {!isPremium && (
          <section className="mt-8">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-gold">
                <Crown className="h-3.5 w-3.5" /> AWÃ TECH Premium
              </div>
              <h2 className="mt-4 font-display text-2xl font-black text-cream md:text-4xl">
                Aprenda Patxôhã sem limites
              </h2>
              <p className="mx-auto mt-2 max-w-2xl text-sm text-foreground/70">
                Libere todo o dicionário, trilhas, vídeos, músicas e o Professor Akuã. Cancele
                quando quiser.
              </p>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {/* Mensal */}
              <div className="card-elev rounded-3xl border border-gold/25 p-6 md:p-8">
                <div className="text-xs font-bold uppercase tracking-wider text-foreground/60">
                  Mensal
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-black text-cream">R$ 29,90</span>
                  <span className="text-sm text-foreground/60">/mês</span>
                </div>
                <p className="mt-2 text-sm text-foreground/70">
                  Renova automaticamente. Cancele quando quiser.
                </p>
                <ul className="mt-5 space-y-2.5 text-sm text-cream/90">
                  {benefits.map((b) => (
                    <li key={b} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-leaf" /> {b}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleAssinar("awa_premium_monthly")}
                  disabled={checkoutLoading || authLoading}
                  className="mt-6 w-full rounded-2xl bg-[var(--gradient-leaf)] px-4 py-3.5 font-display text-sm font-black text-cream shadow-[var(--shadow-glow)] transition hover:brightness-110 disabled:opacity-50"
                >
                  {checkoutLoading ? "Abrindo..." : "Assinar Mensal"}
                </button>
              </div>

              {/* Semestral */}
              <div className="relative card-elev rounded-3xl border-2 border-gold/60 p-6 md:p-8">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold px-3 py-1 text-[10px] font-black uppercase tracking-wider text-forest-deep">
                  Melhor valor · economize 17%
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-gold">
                  Semestral
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-black text-cream">R$ 149,90</span>
                  <span className="text-sm text-foreground/60">/6 meses</span>
                </div>
                <p className="mt-2 text-sm text-foreground/70">
                  Equivale a R$ 24,98/mês. Cobrado a cada 6 meses.
                </p>
                <ul className="mt-5 space-y-2.5 text-sm text-cream/90">
                  {benefits.map((b) => (
                    <li key={b} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-leaf" /> {b}
                    </li>
                  ))}
                  <li className="flex items-start gap-2 font-semibold text-gold">
                    <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0" /> 2 meses grátis vs. mensal
                  </li>
                </ul>
                <button
                  onClick={() => handleAssinar("awa_premium_semestral")}
                  disabled={checkoutLoading || authLoading}
                  className="mt-6 w-full rounded-2xl bg-gold px-4 py-3.5 font-display text-sm font-black text-forest-deep shadow-lg transition hover:brightness-110 disabled:opacity-50"
                >
                  {checkoutLoading ? "Abrindo..." : "Assinar Semestral"}
                </button>
              </div>
            </div>

            {/* O que você já tem grátis */}
            <div className="mt-6 rounded-3xl border border-leaf/30 bg-card/40 p-5 backdrop-blur md:p-7">
              <h3 className="flex items-center gap-2 font-display text-lg font-black text-leaf">
                🔓 Já disponível na versão gratuita
              </h3>
              <ul className="mt-4 grid gap-2 text-sm text-foreground/90 md:grid-cols-2">
                {freeItems.map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-leaf" /> {t}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* PREMIUM ATIVO — mensagem elegante */}
        {isPremium && (
          <section className="mt-8 rounded-3xl border-2 border-gold/60 bg-[oklch(0.22_0.06_75/0.5)] p-6 text-center shadow-[var(--shadow-glow)] backdrop-blur md:p-10">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gold shadow-[var(--shadow-glow)]">
              <Crown className="h-8 w-8 text-forest-deep" />
            </div>
            <h2 className="mt-4 font-display text-2xl font-black text-gold md:text-3xl">
              Você é Awã Premium 🌟
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm text-foreground/85">
              Aproveite todo o dicionário, trilhas, vídeos, músicas e o Professor Akuã sem limites.
            </p>
            <Link
              to="/"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-black text-forest-deep hover:brightness-110"
            >
              <Star className="h-4 w-4" /> Continuar aprendendo
            </Link>
          </section>
        )}

        {/* LINKS LEGAIS */}
        <section className="mt-8 grid gap-3 text-sm sm:grid-cols-3">
          <Link
            to="/termos"
            className="rounded-xl border border-gold/20 bg-card/40 p-3 text-center hover:bg-gold/10"
          >
            Termos de uso
          </Link>
          <Link
            to="/privacidade"
            className="rounded-xl border border-gold/20 bg-card/40 p-3 text-center hover:bg-gold/10"
          >
            Privacidade
          </Link>
          <Link
            to="/reembolso"
            className="rounded-xl border border-gold/20 bg-card/40 p-3 text-center hover:bg-gold/10"
          >
            Reembolso
          </Link>
        </section>

        <footer className="mt-10 text-center text-xs text-foreground/60">
          © {new Date().getFullYear()} AWÃ TECH — Caminho da Sabedoria
        </footer>
      </main>
    </div>
  );
}

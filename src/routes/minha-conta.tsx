import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
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
import { SiteHeader } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";

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
  validateSearch: (s: Record<string, unknown>): { checkout?: string } => {
    const checkout = s.checkout as string | undefined;
    return checkout ? { checkout } : {};
  },
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
  const { user, loading: authLoading, isAdmin } = useAuth();
  const { isPremium, hasInfantil, hasAdulto, subscription, subscriptions, refetch } = useSubscription();

  const { openCheckout, loading: checkoutLoading } = usePaddleCheckout();
  const openPortal = useServerFn(openCustomerPortalSession);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
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

  type PriceId =
    | "awa_infantil_monthly"
    | "awa_infantil_semestral"
    | "awa_adulto_monthly"
    | "awa_adulto_semestral";

  function handleAssinar(priceId: PriceId) {
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

  const priceLabels: Record<string, string> = {
    awa_infantil_monthly: "Infantil Mensal (R$ 29,90)",
    awa_infantil_semestral: "Infantil Semestral (R$ 149,90)",
    awa_adulto_monthly: "Adulto Mensal (R$ 39,90)",
    awa_adulto_semestral: "Adulto Semestral (R$ 199,90)",
    awa_premium_monthly: "Premium Mensal (R$ 29,90)",
    awa_premium_semestral: "Premium Semestral (R$ 149,90)",
  };

  const s = statusLabel(subscription?.status, subscription?.cancel_at_period_end);
  const toneClass =
    s.tone === "ok"
      ? "bg-[#1b4332]/10 text-[#1b4332] border-[#1b4332]/25"
      : s.tone === "warn"
        ? "bg-amber-50 text-amber-800 border-amber-300"
        : "bg-gray-100 text-gray-700 border-gray-200";

  return (
    <div className="min-h-screen bg-[#f7f6f2] text-[#1f2937]">
      <PaymentTestModeBanner />
      <SiteHeader mode="adulto" />
      <header className="sticky top-0 z-30 border-b border-[#e8e4dc] bg-white/95 backdrop-blur-xl shadow-xs">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3.5 md:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1b4332] hover:text-[#2d6a4f]"
          >
            <ArrowLeft className="h-4 w-4" /> Início
          </Link>
          <img src={logoSrc} alt="AWÃ TECH" className="h-8 w-auto" />
          <div className="w-16" />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-14">
        {/* HERO / BOAS-VINDAS */}
        <section className="relative overflow-hidden rounded-3xl border border-[#e8e4dc] bg-white p-6 text-center shadow-xs md:p-10">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-[#b47e28]/10 blur-3xl" />
          <img
            loading="lazy"
            decoding="async"
            src={logoSrc}
            alt="AWÃ TECH"
            className="mx-auto h-20 w-20 rounded-full bg-white p-1 shadow-md ring-2 ring-[#e8e4dc] md:h-24 md:w-24 border border-[#e8e4dc]"
          />
          <p className="mt-4 text-[11px] font-bold tracking-[0.22em] text-[#b47e28]">
            AWÃ TECH • MINHA CONTA
          </p>
          <h1 className="mt-2 font-display text-3xl font-black leading-tight text-[#11231b] md:text-4xl tracking-tight">
            {authLoading
              ? "Carregando..."
              : user
                ? `Iporõ, ${user.user_metadata?.name || user.email?.split("@")[0]}!`
                : "Bem-vindo ao AWÃ TECH"}
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-[#4b5563] md:text-base">
            {user
              ? "Sua conta, sua assinatura e o caminho Premium em um só lugar."
              : "O caminho para conhecer, aprender e preservar a sabedoria Pataxó."}
          </p>

          {!user && !authLoading && (
            <div className="mt-6 grid gap-2 sm:grid-cols-3">
              <Link
                to="/auth"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1b4332] px-4 py-3 text-sm font-bold text-white shadow-xs hover:bg-[#2d6a4f]"
              >
                <UserPlus className="h-4 w-4" /> Criar conta
              </Link>
              <Link
                to="/auth"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#e8e4dc] bg-white px-4 py-3 text-sm font-bold text-[#11231b] shadow-xs hover:bg-[#faf9f6]"
              >
                <LogIn className="h-4 w-4" /> Entrar
              </Link>
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#e8e4dc] bg-white px-4 py-3 text-sm font-semibold text-[#1b4332] shadow-xs hover:bg-[#1b4332]/5"
              >
                <Eye className="h-4 w-4" /> Explorar
              </Link>
            </div>
          )}

          {user && (
            <div className="mt-5 inline-flex flex-wrap items-center justify-center gap-2">
              <span className="rounded-full border border-[#e8e4dc] bg-[#faf9f6] px-3.5 py-1 text-xs text-[#374151]">
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

        {/* PAINEL ADMINISTRATIVO — só para administradores */}
        {isAdmin && (
          <section className="mt-6 rounded-3xl border-2 border-[#b47e28]/40 bg-gradient-to-r from-[#b47e28]/10 via-white to-[#b47e28]/10 p-5 shadow-xs md:p-6">
            <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <div className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-[#b47e28]">
                  <Shield className="h-3.5 w-3.5" /> ⚙️ Você é administrador
                </div>
                <h2 className="mt-1 font-display text-xl font-black text-[#11231b] md:text-2xl">
                  Painel Administrativo AWÃ TECH
                </h2>
                <p className="mt-1 text-xs text-[#4b5563] md:text-sm">
                  Gerencie dicionário, trilhas, vídeos, músicas, missões e acessos.
                </p>
              </div>
              <Link
                to="/admin"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#1b4332] px-5 py-3 font-display text-sm font-black text-white shadow-xs hover:bg-[#2d6a4f]"
              >
                🔹 Acessar Painel
              </Link>
            </div>
          </section>
        )}

        {/* CHECKOUT FEEDBACK */}
        {processing && !isPremium && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-[#b47e28]/35 bg-[#b47e28]/10 p-4">
            <Loader2 className="h-5 w-5 animate-spin text-[#b47e28]" />
            <div className="text-sm text-[#11231b]">
              <b>Processando seu pagamento...</b> Isso costuma levar poucos segundos.
            </div>
          </div>
        )}
        {isPremium && search.checkout === "success" && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-[#1b4332]/30 bg-[#1b4332]/10 p-4">
            <CheckCircle2 className="h-5 w-5 text-[#1b4332]" />
            <div className="text-sm text-[#11231b]">
              <b>Pagamento confirmado!</b> Bem-vindo ao AWÃ TECH Premium 🌿
            </div>
          </div>
        )}

        {/* PAST DUE — pagamento com problema */}
        {user && subscription?.status === "past_due" && (
          <div className="mt-6 rounded-2xl border-2 border-amber-300 bg-amber-50 p-5">
            <div className="font-display text-lg font-black text-amber-900">Pagamento em atraso</div>
            <p className="mt-1 text-sm text-amber-800">
              Não conseguimos processar a última cobrança. Atualize seu método de pagamento para manter seu acesso
              Premium ativo. O acesso será suspenso em poucos dias se o pagamento não for regularizado.
            </p>
            {subscription?.paddle_customer_id && (
              <button
                onClick={handlePortal}
                disabled={busy}
                className="mt-3 inline-flex items-center gap-2 rounded-xl bg-amber-700 px-4 py-2 text-sm font-bold text-white hover:bg-amber-800 disabled:opacity-50"
              >
                <CreditCard className="h-4 w-4" /> Atualizar método de pagamento
              </button>
            )}
          </div>
        )}

        {/* CONTA (se logado) */}
        {user && (
          <section className="mt-6 rounded-3xl border border-[#e8e4dc] bg-white p-6 shadow-xs md:p-8">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#6b7280]">
                  Assinatura
                </div>
                <h2 className="mt-1 font-display text-xl font-black text-[#11231b]">
                  {isPremium ? "AWÃ TECH Premium" : "Plano Básico (grátis)"}
                </h2>
              </div>
            </div>

            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-xl border border-[#e8e4dc] bg-[#faf9f6] p-4">
                <dt className="text-[11px] uppercase tracking-wider text-[#6b7280]">Plano(s) ativo(s)</dt>
                <dd className="mt-1 flex flex-wrap gap-1.5 text-[#11231b] font-medium">
                  {subscriptions.length === 0 && "—"}
                  {subscriptions.map((s: any) =>
                    priceLabels[s.price_id] ? (
                      <span
                        key={s.paddle_subscription_id}
                        className="rounded-full border border-[#1b4332]/25 bg-[#1b4332]/10 px-2.5 py-0.5 text-xs text-[#1b4332] font-semibold"
                      >
                        {priceLabels[s.price_id]}
                      </span>
                    ) : null,
                  )}
                </dd>
              </div>
              <div className="rounded-xl border border-[#e8e4dc] bg-[#faf9f6] p-4">
                <dt className="text-[11px] uppercase tracking-wider text-[#6b7280]">
                  {subscription?.cancel_at_period_end ? "Acesso até" : "Próxima cobrança"}
                </dt>
                <dd className="mt-1 text-[#11231b] font-medium">{formatDate(subscription?.current_period_end)}</dd>
              </div>
            </dl>

            {/* Acesso rápido às áreas liberadas */}
            {(hasInfantil || hasAdulto) && (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {hasInfantil && (
                  <Link
                    to="/infantil"
                    className="rounded-2xl border border-[#e8e4dc] bg-[#f9f8f6] p-4 text-center font-display text-sm font-black text-[#1b4332] hover:bg-[#1b4332]/10 transition"
                  >
                    🚪 Acessar área Infantil
                  </Link>
                )}
                {hasAdulto && (
                  <Link
                    to="/adulto"
                    className="rounded-2xl border border-[#e8e4dc] bg-[#f9f8f6] p-4 text-center font-display text-sm font-black text-[#b47e28] hover:bg-[#b47e28]/10 transition"
                  >
                    🚪 Acessar área Adulto
                  </Link>
                )}
              </div>
            )}

            {/* Adicionar o outro plano */}
            {(hasInfantil !== hasAdulto) && (
              <Link
                to="/planos"
                search={{ need: hasInfantil ? "adulto" : "infantil" } as any}
                className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[#e8e4dc] px-4 py-2 text-xs font-semibold text-[#1b4332] hover:bg-[#1b4332]/5 transition"
              >
                🔄 Contratar também assinatura {hasInfantil ? "Adulto" : "Infantil"}
              </Link>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={handleSignOut}
                className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition"
              >
                <LogOut className="h-4 w-4" /> Sair da conta
              </button>
            </div>

            <p className="mt-4 flex items-start gap-2 text-xs text-[#6b7280]">
              <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#b47e28]" />
              Ao cancelar, você mantém acesso Premium até o fim do período já pago. Pagamento
              processado com segurança pelo Paddle.
            </p>
          </section>
        )}

        {/* PLANOS — mostra opções compactas quando falta assinatura */}
        {!isPremium && (
          <section className="mt-8">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#1b4332]/25 bg-[#1b4332]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#1b4332]">
                <Crown className="h-3.5 w-3.5" /> Escolha sua assinatura
              </div>
              <h2 className="mt-4 font-display text-2xl font-black text-[#11231b] md:text-4xl">
                Infantil ou Adulto — você escolhe
              </h2>
              <p className="mx-auto mt-2 max-w-2xl text-sm text-[#4b5563]">
                Duas assinaturas independentes. Cada uma libera apenas a sua área. Cancele quando
                quiser.
              </p>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <div className="rounded-3xl border border-[#e8e4dc] bg-white p-6 shadow-xs md:p-8">
                <div className="text-xs font-bold uppercase tracking-wider text-[#1b4332]">Infantil</div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-black text-[#11231b]">R$ 29,90</span>
                  <span className="text-sm text-[#6b7280]">/mês</span>
                </div>
                <p className="mt-2 text-sm text-[#4b5563]">
                  Trilhas, cânticos, jogos e histórias para crianças. Ou semestral R$ 149,90.
                </p>
                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  <button
                    onClick={() => handleAssinar("awa_infantil_monthly")}
                    disabled={checkoutLoading || authLoading}
                    className="rounded-2xl bg-[#1b4332] px-4 py-3 font-display text-sm font-black text-white shadow-xs hover:bg-[#2d6a4f] disabled:opacity-50"
                  >
                    Mensal
                  </button>
                  <button
                    onClick={() => handleAssinar("awa_infantil_semestral")}
                    disabled={checkoutLoading || authLoading}
                    className="rounded-2xl border border-[#1b4332] px-4 py-3 font-display text-sm font-black text-[#1b4332] hover:bg-[#1b4332]/5 disabled:opacity-50"
                  >
                    Semestral
                  </button>
                </div>
              </div>

              <div className="rounded-3xl border border-[#e8e4dc] bg-white p-6 shadow-xs md:p-8">
                <div className="text-xs font-bold uppercase tracking-wider text-[#b47e28]">Adulto</div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-black text-[#11231b]">R$ 29,90</span>
                  <span className="text-sm text-[#6b7280]">/mês</span>
                </div>
                <p className="mt-2 text-sm text-[#4b5563]">
                  Dicionário, tradutor, Professor Akuã e conteúdo cultural. Ou semestral R$ 149,90.
                </p>
                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  <button
                    onClick={() => handleAssinar("awa_adulto_monthly")}
                    disabled={checkoutLoading || authLoading}
                    className="rounded-2xl bg-[#b47e28] px-4 py-3 font-display text-sm font-black text-white shadow-xs hover:bg-[#976920] disabled:opacity-50"
                  >
                    Mensal
                  </button>
                  <button
                    onClick={() => handleAssinar("awa_adulto_semestral")}
                    disabled={checkoutLoading || authLoading}
                    className="rounded-2xl border border-[#b47e28] px-4 py-3 font-display text-sm font-black text-[#b47e28] hover:bg-[#b47e28]/5 disabled:opacity-50"
                  >
                    Semestral
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <Link to="/planos" className="text-xs font-semibold text-[#1b4332] hover:underline">
                Ver comparação completa dos planos →
              </Link>
            </div>

            {/* O que você já tem grátis */}
            <div className="mt-6 rounded-3xl border border-[#e8e4dc] bg-white p-5 shadow-xs md:p-7">
              <h3 className="flex items-center gap-2 font-display text-lg font-black text-[#1b4332]">
                🔓 Já disponível na versão gratuita
              </h3>
              <ul className="mt-4 grid gap-2 text-sm text-[#374151] md:grid-cols-2">
                {freeItems.map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#1b4332]" /> {t}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* PREMIUM ATIVO — mensagem elegante */}
        {isPremium && (
          <section className="mt-8 rounded-3xl border-2 border-[#1b4332]/30 bg-[#1b4332]/5 p-6 text-center shadow-xs md:p-10">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#1b4332] shadow-xs">
              <Crown className="h-8 w-8 text-white" />
            </div>
            <h2 className="mt-4 font-display text-2xl font-black text-[#11231b] md:text-3xl">
              Você é Awã Premium 🌟
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm text-[#4b5563]">
              Aproveite todo o dicionário, trilhas, vídeos, músicas e o Professor Akuã sem limites.
            </p>
            <Link
              to="/"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#1b4332] px-6 py-3 text-sm font-black text-white hover:bg-[#2d6a4f]"
            >
              <Star className="h-4 w-4" /> Continuar aprendendo
            </Link>
          </section>
        )}

        {/* LINKS LEGAIS */}
        <section className="mt-8 grid gap-3 text-sm sm:grid-cols-3">
          <Link
            to="/termos"
            className="rounded-xl border border-[#e8e4dc] bg-white p-3 text-center text-[#4b5563] shadow-xs hover:text-[#11231b] hover:bg-[#faf9f6]"
          >
            Termos de uso
          </Link>
          <Link
            to="/privacidade"
            className="rounded-xl border border-[#e8e4dc] bg-white p-3 text-center text-[#4b5563] shadow-xs hover:text-[#11231b] hover:bg-[#faf9f6]"
          >
            Privacidade
          </Link>
          <Link
            to="/reembolso"
            className="rounded-xl border border-[#e8e4dc] bg-white p-3 text-center text-[#4b5563] shadow-xs hover:text-[#11231b] hover:bg-[#faf9f6]"
          >
            Reembolso
          </Link>
        </section>
      </main>
      <SiteFooter mode="adulto" />
    </div>
  );
}

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check, Crown, Shield, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import { usePaddleCheckout } from "@/hooks/use-paddle-checkout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import logoSrc from "@/assets/awa-tech-logo.png";

export const Route = createFileRoute("/planos")({
  head: () => ({
    meta: [
      { title: "Planos e preços — AWÃ TECH Premium" },
      {
        name: "description",
        content:
          "AWÃ TECH Premium: dicionário Patxôhã completo, trilhas, vídeos, músicas e Professor Akuã. R$ 29,90/mês ou R$ 149,90 a cada 6 meses. Garantia de 14 dias.",
      },
      { property: "og:title", content: "Planos AWÃ TECH Premium" },
      {
        property: "og:description",
        content: "Aprenda Patxôhã sem limites. R$ 29,90/mês ou R$ 149,90/semestre. Cancele quando quiser.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): { checkout?: string } => {
    const checkout = s.checkout as string | undefined;
    return checkout ? { checkout } : {};
  },
  component: PlanosPage,
});

const benefits = [
  "Dicionário Patxôhã completo (2.700+ palavras)",
  "Todas as trilhas de aprendizado",
  "Vídeos e músicas da aldeia",
  "Professor Akuã (chat com IA) ilimitado",
  "Tradutor Português ↔ Patxôhã",
  "Histórias e conteúdo cultural completo",
];

function PlanosPage() {
  const { user, loading: authLoading } = useAuth();
  const { isPremium } = useSubscription();
  const { openCheckout, loading: checkoutLoading } = usePaddleCheckout();
  const navigate = useNavigate();

  function handleAssinar(priceId: "awa_premium_monthly" | "awa_premium_semestral") {
    if (!user) {
      navigate({ to: "/auth", search: { redirect: "/planos" } as any });
      return;
    }
    if (isPremium) {
      navigate({ to: "/minha-conta" });
      return;
    }
    openCheckout({
      priceId,
      userId: user.id,
      email: user.email,
      successUrl: `${window.location.origin}/minha-conta?checkout=success`,
    });
  }

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
          <Link to="/minha-conta" className="text-xs font-semibold text-foreground/80 hover:text-gold">
            Minha conta
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 md:px-8 md:py-14">
        <section className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-gold">
            <Crown className="h-3.5 w-3.5" /> AWÃ TECH Premium
          </div>
          <h1 className="mt-4 font-display text-3xl font-black text-cream md:text-5xl">
            Aprenda Patxôhã sem limites
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-foreground/75 md:text-base">
            Libere todo o dicionário, trilhas, vídeos, músicas e o Professor Akuã. Cancele quando quiser —
            garantia de 14 dias.
          </p>
        </section>

        <section className="mt-10 grid gap-5 md:grid-cols-2">
          <div className="card-elev rounded-3xl border border-gold/25 p-6 md:p-8">
            <div className="text-xs font-bold uppercase tracking-wider text-foreground/60">Mensal</div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-display text-4xl font-black text-cream">R$ 29,90</span>
              <span className="text-sm text-foreground/60">/mês</span>
            </div>
            <p className="mt-2 text-sm text-foreground/70">Renova automaticamente. Cancele quando quiser.</p>
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
              {isPremium ? "Você já é Premium" : checkoutLoading ? "Abrindo..." : "Assinar Mensal"}
            </button>
          </div>

          <div className="relative card-elev rounded-3xl border-2 border-gold/60 p-6 md:p-8">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold px-3 py-1 text-[10px] font-black uppercase tracking-wider text-forest-deep">
              Melhor valor · economize 17%
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-gold">Semestral</div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-display text-4xl font-black text-cream">R$ 149,90</span>
              <span className="text-sm text-foreground/60">/6 meses</span>
            </div>
            <p className="mt-2 text-sm text-foreground/70">Equivale a R$ 24,98/mês. Cobrado a cada 6 meses.</p>
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
              {isPremium ? "Você já é Premium" : checkoutLoading ? "Abrindo..." : "Assinar Semestral"}
            </button>
          </div>
        </section>

        <p className="mt-6 flex items-center justify-center gap-2 text-xs text-foreground/60">
          <Shield className="h-3.5 w-3.5 text-gold" />
          Pagamento seguro processado pelo Paddle (Merchant of Record). Cartão de crédito, débito e Pix.
        </p>

        <section className="mt-10 grid gap-3 text-sm sm:grid-cols-3">
          <Link to="/termos" className="rounded-xl border border-gold/20 bg-card/40 p-3 text-center hover:bg-gold/10">
            Termos de uso
          </Link>
          <Link to="/privacidade" className="rounded-xl border border-gold/20 bg-card/40 p-3 text-center hover:bg-gold/10">
            Privacidade
          </Link>
          <Link to="/reembolso" className="rounded-xl border border-gold/20 bg-card/40 p-3 text-center hover:bg-gold/10">
            Reembolso
          </Link>
        </section>
      </main>
    </div>
  );
}

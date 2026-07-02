import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check, Sparkles, Crown } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import { usePaddleCheckout } from "@/hooks/use-paddle-checkout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import logoSrc from "@/assets/awa-tech-logo.png";

export const Route = createFileRoute("/planos")({
  head: () => ({
    meta: [
      { title: "Planos Premium — AWÃ TECH" },
      {
        name: "description",
        content:
          "Assine o AWÃ TECH Premium e desbloqueie o dicionário Patxôhã completo, todas as trilhas, vídeos, músicas e o Professor Akuã.",
      },
      { property: "og:title", content: "AWÃ TECH Premium — Assine e aprenda Patxôhã" },
      {
        property: "og:description",
        content: "Acesso total ao dicionário, trilhas, vídeos e Professor Akuã por R$ 29,90/mês.",
      },
    ],
  }),
  component: PlanosPage,
});

const benefits = [
  "Dicionário Patxôhã completo (2.700+ palavras)",
  "Todas as trilhas de aprendizado",
  "Vídeos e músicas da aldeia",
  "Professor Akuã (chat com IA) ilimitado",
  "Tradutor Português ↔ Patxôhã",
  "Histórias e conteúdo cultural completo",
  "Atualizações e novidades incluídas",
];

function PlanosPage() {
  const { user, loading: authLoading } = useAuth();
  const { isPremium, loading: subLoading } = useSubscription();
  const { openCheckout, loading: checkoutLoading } = usePaddleCheckout();
  const navigate = useNavigate();

  function handleAssinar(priceId: "awa_premium_monthly" | "awa_premium_semestral") {
    if (!user) {
      navigate({ to: "/auth", search: { redirect: "/planos" } as any });
      return;
    }
    openCheckout({ priceId, userId: user.id, email: user.email });
  }

  return (
    <div className="min-h-screen">
      <PaymentTestModeBanner />
      <header className="sticky top-0 z-40 border-b border-gold/20 bg-[oklch(0.18_0.04_145/0.85)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 md:px-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-gold hover:underline">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
          <img src={logoSrc} alt="AWÃ TECH" className="h-9 w-auto" />
          <div className="w-16" />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 md:px-8 md:py-16">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-gold">
            <Crown className="h-3.5 w-3.5" /> AWÃ TECH Premium
          </div>
          <h1 className="mt-4 font-display text-3xl font-black text-cream md:text-5xl">
            Aprenda Patxôhã sem limites
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-foreground/70 md:text-base">
            Assine e libere todo o dicionário, trilhas, vídeos, músicas e o Professor Akuã. Cancele quando quiser.
          </p>
        </div>

        {isPremium && !subLoading && (
          <div className="mt-8 rounded-2xl border border-gold/40 bg-gold/10 p-5 text-center">
            <p className="font-display text-lg font-black text-gold">Você já é Premium 🎉</p>
            <p className="mt-1 text-sm text-cream/80">Aproveite todo o conteúdo do AWÃ TECH.</p>
            <Link to="/" className="mt-3 inline-block text-sm font-semibold text-gold hover:underline">
              Ir para o início →
            </Link>
          </div>
        )}

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {/* Mensal */}
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
              disabled={checkoutLoading || authLoading || isPremium}
              className="mt-6 w-full rounded-2xl bg-[var(--gradient-leaf)] px-4 py-3.5 font-display text-sm font-black text-cream shadow-[var(--shadow-glow)] transition hover:brightness-110 disabled:opacity-50"
            >
              {isPremium ? "Já é Premium" : checkoutLoading ? "Abrindo..." : "Assinar Mensal"}
            </button>
          </div>

          {/* Semestral */}
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
              disabled={checkoutLoading || authLoading || isPremium}
              className="mt-6 w-full rounded-2xl bg-gold px-4 py-3.5 font-display text-sm font-black text-forest-deep shadow-lg transition hover:brightness-110 disabled:opacity-50"
            >
              {isPremium ? "Já é Premium" : checkoutLoading ? "Abrindo..." : "Assinar Semestral"}
            </button>
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-gold/20 bg-card/40 p-5 text-center text-xs text-foreground/60">
          Membros da comunidade Pataxó têm acesso gratuito — fale com a coordenação do AWÃ TECH.
          <br />
          Pagamento processado com segurança. Sem taxas escondidas.
        </div>
      </main>
    </div>
  );
}

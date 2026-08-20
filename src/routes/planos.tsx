// =============================================
// PÁGINA DE PLANOS — SÓ MOSTRA O PLANO ESCOLHIDO
// =============================================

import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { ArrowLeft, Check, Crown, Shield, Sparkles, Baby, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import { usePaddleCheckout } from "@/hooks/use-paddle-checkout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { createClient } from '@supabase/supabase-js';
import logoSrc from "@/assets/awa-tech-logo.png";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);


export const Route = createFileRoute("/planos")({
  head: () => ({
    meta: [
      { title: "Planos e preços — AWÃ TECH" },
      {
        name: "description",
        content:
          "Escolha sua assinatura AWÃ TECH: Infantil (R$ 29,90/mês ou R$ 149,90/semestre) ou Adulto (R$ 39,90/mês ou R$ 199,90/semestre).",
      },
      { property: "og:title", content: "Planos AWÃ TECH" },
      {
        property: "og:description",
        content:
          "Duas assinaturas independentes: Infantil ou Adulto. Cancele quando quiser.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): { checkout?: string; need?: string } => {
    const out: { checkout?: string; need?: string } = {};
    if (typeof s.checkout === "string") out.checkout = s.checkout;
    if (s.need === "infantil" || s.need === "adulto") out.need = s.need;
    return out;
  },
  component: PlanosPage,
});

const infantilBenefits = [
  "Trilha da Aldeia com jogos e cânticos",
  "Histórias infantis narradas",
  "Vídeos e músicas para crianças",
  "Atividades sobre natureza, família e amizade",
  "Conteúdo cultural indígena adequado à idade",
];

const adultoBenefits = [
  "Dicionário Patxôhã completo (2.700+ palavras)",
  "Todas as trilhas adultas de aprendizado",
  "Professor Akuã (chat com IA) ilimitado",
  "Tradutor Português ↔ Patxôhã",
  "Histórias, biografia e conteúdo cultural completo",
];

type PriceId =
  | "awa_infantil_monthly"
  | "awa_infantil_semestral"
  | "awa_adulto_monthly"
  | "awa_adulto_semestral";

function PlanosPage() {
  const { user, loading: authLoading } = useAuth();
  const { hasInfantil, hasAdulto } = useSubscription();
  const { openCheckout, loading: checkoutLoading } = usePaddleCheckout();
  const navigate = useNavigate();
  const search = useSearch({ from: "/planos" });

  function handleAssinar(priceId: PriceId) {
    if (!user) {
      navigate({ to: "/auth", search: { redirect: "/planos" } as any });
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
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 md:px-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-gold hover:underline">
            <ArrowLeft className="h-4 w-4" /> Início
          </Link>
          <img src={logoSrc} alt="AWÃ TECH" className="h-9 w-auto" />
          <Link to="/minha-conta" className="text-xs font-semibold text-foreground/80 hover:text-gold">
            Minha conta
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 md:px-8 md:py-14">
        {search.need && (
          <div className="mx-auto mb-8 max-w-3xl rounded-2xl border-2 border-gold/60 bg-gold/10 p-4 text-center text-sm text-cream">
            <b>Assinatura necessária.</b> Para acessar a área{" "}
            <b>{search.need === "infantil" ? "Infantil" : "Adulto"}</b>, contrate o plano abaixo. Ele libera
            apenas essa área — a outra requer assinatura separada.
          </div>
        )}

        <section className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-gold">
            <Crown className="h-3.5 w-3.5" /> AWÃ TECH — Planos
          </div>
          <h1 className="mt-4 font-display text-3xl font-black text-cream md:text-5xl">
            Escolha sua assinatura
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-foreground/75 md:text-base">
            Duas assinaturas independentes. Cada uma libera apenas a sua área — Infantil ou Adulto.
            Cancele quando quiser.
          </p>
        </section>

        {/* INFANTIL */}
        {(search.need === "infantil" || (!search.need && localStorage.getItem("awã_tipo_conteudo") === "infantil")) && (
        <section className="mt-12">
          <div className="mb-5 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-leaf/20 text-leaf">
              <Baby className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-black text-cream">👶 Assinatura Infantil</h2>
              <p className="text-sm text-foreground/70">Acesso completo ao conteúdo infantil — músicas, histórias e jogos</p>
            </div>
            {hasInfantil && (
              <span className="ml-auto rounded-full border border-leaf/40 bg-leaf/15 px-3 py-1 text-xs font-bold text-leaf">
                ✓ Você já tem
              </span>
            )}
          </div>
          <PlanPair
            benefits={infantilBenefits}
            monthlyId="awa_infantil_monthly"
            semestralId="awa_infantil_semestral"
            monthlyPrice="R$ 29,90"
            semestralPrice="R$ 149,90"
            semestralEquivalent="Equivale a R$ 24,98/mês. Cobrado a cada 6 meses."
            savingsBadge="Melhor valor · economize 17%"
            onAssinar={handleAssinar}
            checkoutLoading={checkoutLoading || authLoading}
            highlight={true}
            owned={hasInfantil}
          />
        </section>
        )}

        {/* ADULTO */}
        {(search.need === "adulto" || (!search.need && localStorage.getItem("awã_tipo_conteudo") === "adulto")) && (
        <section className="mt-12">
          <div className="mb-5 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gold/20 text-gold">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-black text-cream">🔞 Assinatura Adulto</h2>
              <p className="text-sm text-foreground/70">
                Acesso completo ao conteúdo adulto — vídeos, áudios e história
              </p>
            </div>
            {hasAdulto && (
              <span className="ml-auto rounded-full border border-leaf/40 bg-leaf/15 px-3 py-1 text-xs font-bold text-leaf">
                ✓ Você já tem
              </span>
            )}
          </div>
          <PlanPair
            benefits={adultoBenefits}
            monthlyId="awa_adulto_monthly"
            semestralId="awa_adulto_semestral"
            monthlyPrice="R$ 39,90"
            semestralPrice="R$ 199,90"
            semestralEquivalent="Equivale a R$ 33,31/mês. Cobrado a cada 6 meses."
            savingsBadge="Melhor valor · economize 16%"
            onAssinar={handleAssinar}
            checkoutLoading={checkoutLoading || authLoading}
            highlight={true}
            owned={hasAdulto}
          />
        </section>
        )}

        <p className="mt-10 flex items-center justify-center gap-2 text-center text-xs text-foreground/60">
          <Shield className="h-3.5 w-3.5 text-gold" />
          Pagamento seguro via Paddle (Merchant of Record). Cartão de crédito, débito e Pix.
        </p>

        <p className="mx-auto mt-4 max-w-2xl text-center text-xs text-foreground/60">
          O acesso é liberado para a conta Google usada no login. Para liberar outro Gmail, faça login
          com essa conta e contrate uma nova assinatura.
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

function PlanPair(props: {
  benefits: string[];
  monthlyId: PriceId;
  semestralId: PriceId;
  monthlyPrice: string;
  semestralPrice: string;
  semestralEquivalent: string;
  savingsBadge: string;
  onAssinar: (id: PriceId) => void;
  checkoutLoading: boolean;
  highlight?: boolean;
  owned?: boolean;
}) {
  const {
    benefits, monthlyId, semestralId, monthlyPrice, semestralPrice,
    semestralEquivalent, savingsBadge, onAssinar, checkoutLoading, highlight, owned,
  } = props;
  const ring = highlight ? "ring-2 ring-gold/70 shadow-[var(--shadow-glow)]" : "";
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className={`card-elev rounded-3xl border border-gold/25 p-6 md:p-8 ${ring}`}>
        <div className="text-xs font-bold uppercase tracking-wider text-foreground/60">Mensal</div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="font-display text-4xl font-black text-cream">{monthlyPrice}</span>
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
          onClick={() => onAssinar(monthlyId)}
          disabled={checkoutLoading || owned}
          className="mt-6 w-full rounded-2xl bg-[var(--gradient-leaf)] px-4 py-3.5 font-display text-sm font-black text-cream shadow-[var(--shadow-glow)] transition hover:brightness-110 disabled:opacity-50"
        >
          {owned ? "Você já tem este plano" : checkoutLoading ? "Abrindo..." : "Assinar Mensal"}
        </button>
      </div>

      <div className={`relative card-elev rounded-3xl border-2 border-gold/60 p-6 md:p-8 ${ring}`}>
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold px-3 py-1 text-[10px] font-black uppercase tracking-wider text-forest-deep">
          {savingsBadge}
        </div>
        <div className="text-xs font-bold uppercase tracking-wider text-gold">Semestral</div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="font-display text-4xl font-black text-cream">{semestralPrice}</span>
          <span className="text-sm text-foreground/60">/6 meses</span>
        </div>
        <p className="mt-2 text-sm text-foreground/70">{semestralEquivalent}</p>
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
          onClick={() => onAssinar(semestralId)}
          disabled={checkoutLoading || owned}
          className="mt-6 w-full rounded-2xl bg-gold px-4 py-3.5 font-display text-sm font-black text-forest-deep shadow-lg transition hover:brightness-110 disabled:opacity-50"
        >
          {owned ? "Você já tem este plano" : checkoutLoading ? "Abrindo..." : "Assinar Semestral"}
        </button>
      </div>
    </div>
  );
}

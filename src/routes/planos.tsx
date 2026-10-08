import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { ArrowLeft, Check, Crown, Shield, Sparkles, Baby, User, CreditCard, QrCode } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import { usePaddleCheckout } from "@/hooks/use-paddle-checkout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import logoSrc from "@/assets/awa-tech-logo.png";
import { SiteHeader } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";

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
    <div className="min-h-screen bg-[#f7f6f2] text-[#1f2937]">
      <PaymentTestModeBanner />
      <SiteHeader mode="adulto" />
      <header className="sticky top-0 z-30 border-b border-[#e8e4dc] bg-white/95 backdrop-blur-xl shadow-xs">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3.5 md:px-8">
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-[#1b4332] hover:text-[#2d6a4f]">
            <ArrowLeft className="h-4 w-4" /> Início
          </Link>
          <img src={logoSrc} alt="AWÃ TECH" className="h-8 w-auto" />
          <Link to="/minha-conta" className="text-xs font-bold text-[#1b4332] hover:text-[#2d6a4f]">
            Minha conta
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 md:px-8 md:py-14">
        {search.need && (
          <div className="mx-auto mb-8 max-w-3xl rounded-2xl border border-[#b47e28]/50 bg-[#b47e28]/10 p-4 text-center text-sm text-[#11231b]">
            <b>Assinatura necessária.</b> Para acessar a área{" "}
            <b>{search.need === "infantil" ? "Infantil" : "Adulto"}</b>, contrate o plano abaixo. Ele libera
            apenas essa área — a outra requer assinatura separada.
          </div>
        )}

        <section className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#b47e28]/40 bg-[#b47e28]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#b47e28]">
            <Crown className="h-3.5 w-3.5" /> AWÃ TECH — Planos
          </div>
          <h1 className="mt-4 font-display text-3xl font-black text-[#11231b] md:text-5xl tracking-tight">
            Escolha sua assinatura
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-[#4b5563] md:text-base leading-relaxed">
            Duas assinaturas independentes. Cada uma libera apenas a sua área — Infantil ou Adulto.
            Cancele quando quiser.
          </p>
        </section>

        {/* INFANTIL */}
        {search.need !== "adulto" && (
        <section className="mt-12">
          <div className="mb-5 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#2d6a4f]/15 text-[#2d6a4f]">
              <Baby className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-black text-[#11231b]">Assinatura Infantil</h2>
              <p className="text-sm text-[#4b5563]">Trilhas, cânticos, jogos e histórias para crianças.</p>
            </div>
            {hasInfantil && (
              <span className="ml-auto rounded-full border border-emerald-500/40 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
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
            highlight={search.need === "infantil"}
            owned={hasInfantil}
          />
        </section>
        )}

        {/* ADULTO */}
        {search.need !== "infantil" && (
        <section className="mt-12">
          <div className="mb-5 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#b47e28]/15 text-[#b47e28]">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-black text-[#11231b]">Assinatura Adulto</h2>
              <p className="text-sm text-[#4b5563]">
                Dicionário completo, tradutor, Professor Akuã e todo o conteúdo cultural.
              </p>
            </div>
            {hasAdulto && (
              <span className="ml-auto rounded-full border border-emerald-500/40 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
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
            highlight={search.need === "adulto"}
            owned={hasAdulto}
          />
        </section>
        )}

        <section className="mx-auto mt-10 max-w-2xl rounded-2xl border border-[#e8e4dc] bg-white p-6 shadow-xs text-center">
          <h3 className="font-display text-lg font-black text-[#11231b]">Formas de pagamento</h3>
          <p className="mt-1 text-sm text-[#4b5563]">
            Escolha como quiser pagar na hora de assinar:
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
            {[
              { icon: <CreditCard className="h-4 w-4 text-[#b47e28]" />, label: "Cartão de crédito" },
              { icon: <CreditCard className="h-4 w-4 text-[#b47e28]" />, label: "Cartão de débito" },
              { icon: <QrCode className="h-4 w-4 text-[#b47e28]" />, label: "Pix" },
            ].map((m) => (
              <span
                key={m.label}
                className="inline-flex items-center gap-2 rounded-xl border border-[#e8e4dc] bg-[#f7f6f2] px-4 py-2 text-xs font-bold text-[#11231b]"
              >
                {m.icon}
                {m.label}
              </span>
            ))}
          </div>
          <p className="mt-4 flex items-center justify-center gap-2 text-xs text-[#6b7280]">
            <Shield className="h-3.5 w-3.5 text-[#2d6a4f]" />
            Pagamento seguro via Paddle (Merchant of Record). Vendedor: Awatech.
          </p>
        </section>

        <p className="mx-auto mt-4 max-w-2xl text-center text-xs text-[#6b7280]">
          O acesso é liberado para a conta Google usada no login. Para liberar outro Gmail, faça login
          com essa conta e contrate uma nova assinatura.
        </p>

        <section className="mt-10 grid gap-3 text-sm sm:grid-cols-3">
          <Link to="/termos" className="rounded-xl border border-[#e8e4dc] bg-white p-3 text-center text-xs font-bold text-[#11231b] hover:border-[#1b4332] shadow-xs">
            Termos de uso
          </Link>
          <Link to="/privacidade" className="rounded-xl border border-[#e8e4dc] bg-white p-3 text-center text-xs font-bold text-[#11231b] hover:border-[#1b4332] shadow-xs">
            Privacidade
          </Link>
          <Link to="/reembolso" className="rounded-xl border border-[#e8e4dc] bg-white p-3 text-center text-xs font-bold text-[#11231b] hover:border-[#1b4332] shadow-xs">
            Reembolso
          </Link>
        </section>
      </main>
      <SiteFooter mode="adulto" />
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
  const ring = highlight ? "ring-2 ring-[#b47e28] shadow-md" : "";
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className={`rounded-3xl border border-[#e8e4dc] bg-white p-6 md:p-8 shadow-xs ${ring}`}>
        <div className="text-xs font-bold uppercase tracking-wider text-[#6b7280]">Mensal</div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="font-display text-4xl font-black text-[#11231b] tracking-tight">{monthlyPrice}</span>
          <span className="text-sm font-medium text-[#6b7280]">/mês</span>
        </div>
        <p className="mt-2 text-sm text-[#4b5563]">Renova automaticamente. Cancele quando quiser.</p>
        <ul className="mt-5 space-y-2.5 text-sm text-[#374151]">
          {benefits.map((b) => (
            <li key={b} className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" /> {b}
            </li>
          ))}
        </ul>
        <button
          onClick={() => onAssinar(monthlyId)}
          disabled={checkoutLoading || owned}
          className="mt-6 w-full rounded-xl bg-[#1b4332] px-4 py-3.5 font-display text-sm font-bold text-white shadow-xs transition hover:bg-[#2d6a4f] active:scale-95 disabled:opacity-50"
        >
          {owned ? "Você já tem este plano" : checkoutLoading ? "Abrindo..." : "Assinar Mensal"}
        </button>
      </div>

      <div className={`relative rounded-3xl border-2 border-[#b47e28] bg-white p-6 md:p-8 shadow-sm ${ring}`}>
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#b47e28] px-3.5 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-xs">
          {savingsBadge}
        </div>
        <div className="text-xs font-bold uppercase tracking-wider text-[#b47e28]">Semestral</div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="font-display text-4xl font-black text-[#11231b] tracking-tight">{semestralPrice}</span>
          <span className="text-sm font-medium text-[#6b7280]">/6 meses</span>
        </div>
        <p className="mt-2 text-sm text-[#4b5563]">{semestralEquivalent}</p>
        <ul className="mt-5 space-y-2.5 text-sm text-[#374151]">
          {benefits.map((b) => (
            <li key={b} className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" /> {b}
            </li>
          ))}
          <li className="flex items-start gap-2 font-bold text-[#b47e28]">
            <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0" /> 2 meses grátis vs. mensal
          </li>
        </ul>
        <button
          onClick={() => onAssinar(semestralId)}
          disabled={checkoutLoading || owned}
          className="mt-6 w-full rounded-xl bg-gradient-to-r from-[#b47e28] to-[#d97706] px-4 py-3.5 font-display text-sm font-bold text-white shadow-sm transition hover:brightness-105 active:scale-95 disabled:opacity-50"
        >
          {owned ? "Você já tem este plano" : checkoutLoading ? "Abrindo..." : "Assinar Semestral"}
        </button>
      </div>
    </div>
  );
}

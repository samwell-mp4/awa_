import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Check, Loader2, Sparkles } from "lucide-react";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { useAuth } from "@/hooks/use-auth";
import { usePaddleCheckout } from "@/hooks/use-paddle-checkout";
import { initializePaddle, getPaddleEnvironment } from "@/lib/paddle";
import { getVisitorCountry, resolvePaddlePrices } from "@/lib/pricing.functions";
import { ALL_PRICE_IDS, TIERS, type BillingCycle } from "@/lib/pricing-tiers";
import logoSrc from "@/assets/awa-tech-logo.png";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Preços — Starter, Pro e Advanced | AWÃ TECH" },
      {
        name: "description",
        content:
          "Escolha entre Starter, Pro e Advanced. Preços na sua moeda local, cobrança mensal ou anual, cancele quando quiser.",
      },
      { property: "og:title", content: "Preços AWÃ TECH — Starter, Pro e Advanced" },
      {
        property: "og:description",
        content: "Três planos para aprender Patxôhã. Preços localizados, mensal ou anual.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: async () => await getVisitorCountry(),
  component: PricingPage,
});

type PreviewMap = Record<string, { subtotal: string; total: string }>;

function PricingPage() {
  const { country } = Route.useLoaderData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { openCheckout, loading: checkoutLoading } = usePaddleCheckout();
  const [cycle, setCycle] = useState<BillingCycle>("month");
  const environment = getPaddleEnvironment();

  const { data, isLoading, error } = useQuery({
    queryKey: ["pricing_preview", environment, country ?? "auto"],
    retry: 1,
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<{ previews: PreviewMap; paddleIds: Record<string, string> }> => {
      await initializePaddle();
      const { map } = await resolvePaddlePrices({ data: { priceIds: ALL_PRICE_IDS, environment } });
      const items = Object.values(map).map((priceId) => ({ priceId, quantity: 1 }));
      if (!items.length) return { previews: {}, paddleIds: map };

      const result = await window.Paddle.PricePreview({
        items,
        // Sem header de país, o Paddle detecta a localização pelo IP do visitante.
        ...(country ? { address: { countryCode: country } } : {}),
      });

      const byPaddleId: PreviewMap = {};
      for (const line of result?.data?.details?.lineItems ?? []) {
        byPaddleId[line.price.id] = {
          subtotal: line.formattedTotals.subtotal,
          total: line.formattedTotals.total,
        };
      }
      // Reindexa pelos IDs legíveis usados nos tiers.
      const previews: PreviewMap = {};
      for (const [externalId, paddleId] of Object.entries(map)) {
        const found = byPaddleId[paddleId];
        if (found) previews[externalId] = found;
      }
      return { previews, paddleIds: map };
    },
  });

  function subscribe(priceId: string) {
    if (!user) {
      navigate({ to: "/auth", search: { redirect: "/pricing" } as never });
      return;
    }
    openCheckout({
      priceId,
      userId: user.id,
      email: user.email,
      successUrl: `${window.location.origin}/welcome`,
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
        <div className="text-center">
          <h1 className="font-display text-3xl font-black md:text-5xl">Escolha seu plano</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-foreground/80 md:text-base">
            Preços exibidos na moeda do seu país. Impostos calculados no checkout. Cancele quando
            quiser.
          </p>

          <div className="mx-auto mt-7 inline-flex rounded-full border border-gold/30 bg-card/50 p-1">
            {(["month", "year"] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCycle(c)}
                aria-pressed={cycle === c}
                className={`rounded-full px-5 py-2 text-sm font-bold transition ${
                  cycle === c ? "bg-gold text-background" : "text-cream/80 hover:text-cream"
                }`}
              >
                {c === "month" ? "Mensal" : "Anual"}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="mx-auto mt-8 max-w-2xl rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-center text-sm">
            Não foi possível carregar os preços agora. Recarregue a página em alguns instantes.
          </p>
        )}

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {TIERS.map((tier) => {
            const priceId = tier.priceId[cycle];
            const preview = data?.previews[priceId];
            const available = Boolean(data?.paddleIds[priceId]);
            return (
              <section
                key={tier.name}
                className={`relative flex flex-col rounded-3xl border p-6 backdrop-blur-xl ${
                  tier.highlight
                    ? "border-gold bg-gold/10 shadow-[0_0_40px_-12px_var(--gold,theme(colors.amber.400))]"
                    : "border-gold/20 bg-card/50"
                }`}
              >
                {tier.highlight && (
                  <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-gold px-3 py-1 text-[11px] font-black uppercase tracking-wider text-background">
                    <Sparkles className="h-3 w-3" /> Mais escolhido
                  </span>
                )}
                <h2 className="font-display text-2xl font-black">{tier.name}</h2>
                <p className="mt-1 text-sm text-foreground/75">{tier.description}</p>

                <div className="mt-5 min-h-[52px]">
                  {isLoading ? (
                    <span className="inline-flex items-center gap-2 text-sm text-foreground/60">
                      <Loader2 className="h-4 w-4 animate-spin" /> Carregando preço...
                    </span>
                  ) : preview ? (
                    <p className="flex items-baseline gap-2">
                      <span className="font-display text-3xl font-black">{preview.subtotal}</span>
                      <span className="text-sm text-foreground/70">
                        /{cycle === "month" ? "mês" : "ano"}
                      </span>
                    </p>
                  ) : (
                    <p className="text-sm text-foreground/60">Preço indisponível neste momento.</p>
                  )}
                </div>

                <ul className="mt-4 space-y-2 text-sm">
                  {tier.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-leaf" />
                      <span className="text-foreground/85">{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  disabled={checkoutLoading || !available}
                  onClick={() => subscribe(priceId)}
                  className={`mt-6 w-full rounded-full px-6 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    tier.highlight
                      ? "bg-gold text-background hover:brightness-110"
                      : "border border-gold/40 text-cream hover:border-gold"
                  }`}
                >
                  Assinar {tier.name}
                </button>
              </section>
            );
          })}
        </div>

        <p className="mt-8 text-center text-xs text-foreground/55">
          Vendido por Awatech. Dúvidas: adlermagno8@gmail.com
        </p>
      </main>
    </div>
  );
}

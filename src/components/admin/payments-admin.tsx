import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, CheckCircle2, CreditCard, RefreshCw } from "lucide-react";
import { Btn, Card } from "./ui";
import { checkPaymentsCatalog } from "@/lib/payments-admin.functions";
import { usePaddleCheckout } from "@/hooks/use-paddle-checkout";
import { getPaddleEnvironment } from "@/lib/paddle";
import { useAuth } from "@/hooks/use-auth";

const TEST_PLANS = [
  { id: "awa_infantil_monthly", label: "Infantil Mensal" },
  { id: "awa_infantil_semestral", label: "Infantil Semestral" },
  { id: "awa_adulto_monthly", label: "Adulto Mensal" },
  { id: "awa_adulto_semestral", label: "Adulto Semestral" },
] as const;

function money(amount?: string, currency?: string) {
  if (!amount) return "—";
  const v = Number(amount) / 100;
  return `${currency ?? ""} ${v.toFixed(2)}`.trim();
}

function cycle(interval?: string, frequency?: number) {
  if (!interval) return "compra única";
  return `a cada ${frequency ?? 1} ${interval === "month" ? "mês(es)" : interval}`;
}

export function PaymentsAdmin() {
  const { user } = useAuth();
  const checkFn = useServerFn(checkPaymentsCatalog);
  const { openCheckout, loading: checkoutLoading } = usePaddleCheckout();
  const env = getPaddleEnvironment();
  const isSandbox = env === "sandbox";
  const [method, setMethod] = useState<"all" | "card" | "pix">("card");
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(value);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* clipboard indisponível */
    }
  };

  const { data, isFetching, refetch, error } = useQuery({
    queryKey: ["payments_catalog_check"],
    queryFn: () => checkFn(),
  });

  return (
    <div className="space-y-5">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 font-display text-lg font-black text-cream">
              <CreditCard className="h-5 w-5 text-gold" /> Diagnóstico dos planos
            </h3>
            <p className="mt-1 text-sm text-foreground/70">
              Confere se cada plano está ativo, com o valor e o ciclo certos — no ambiente de{" "}
              <b>teste</b> (preview) e no <b>real</b> (site publicado). Nada é cobrado.
            </p>
          </div>
          <Btn variant="outline" onClick={() => void refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} /> Verificar agora
          </Btn>
        </div>

        {error && (
          <p className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-cream">
            Não foi possível verificar: {(error as Error).message}
          </p>
        )}

        {isFetching && !data && <p className="mt-4 text-sm text-foreground/60">Consultando...</p>}

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {(data?.results ?? []).map((r) => (
            <div key={r.env} className="rounded-2xl border border-gold/20 bg-card/40 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gold">
                  {r.env === "sandbox" ? "Ambiente de teste (preview)" : "Ambiente real (site no ar)"}
                </span>
                {r.prices.every((p) => p.ok) && !r.error ? (
                  <CheckCircle2 className="h-4 w-4 text-leaf" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-gold" />
                )}
              </div>
              {r.error ? (
                <p className="text-sm text-cream/80">{r.error}</p>
              ) : (
                <ul className="space-y-2.5">
                  {r.prices.map((p) => (
                    <li key={p.priceId} className="text-sm">
                      <div className="flex items-center gap-2">
                        {p.ok ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-leaf" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
                        )}
                        <span className="font-semibold text-cream">{p.label}</span>
                        <span className="text-foreground/60">
                          {money(p.amount, p.currency)} · {cycle(p.interval, p.frequency)}
                        </span>
                      </div>
                      {p.problems.map((prob) => (
                        <p key={prob} className="ml-6 text-xs text-destructive">
                          {prob}
                        </p>
                      ))}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="font-display text-lg font-black text-cream">Checkout de teste</h3>
        {isSandbox ? (
          <>
            <p className="mt-1 text-sm text-foreground/70">
              Abre o pagamento em <b>modo teste</b> (sem cobrança real). Escolha o meio de pagamento
              abaixo. No cartão use <b>4242 4242 4242 4242</b>, CVC <b>123</b> e validade futura
              (para recusa: <b>4000 0000 0000 0002</b>). No <b>Pix</b> o QR Code de teste é
              simulado — nenhum valor é cobrado.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {(["all", "card", "pix"] as const).map((m) => (
                <Btn
                  key={m}
                  variant={method === m ? "primary" : "outline"}
                  onClick={() => setMethod(m)}
                >
                  {m === "all" ? "Todos os meios" : m === "card" ? "Cartão" : "Pix"}
                </Btn>
              ))}
            </div>

            {method !== "pix" && (
              <div className="mt-4 rounded-2xl border border-gold/20 bg-card/40 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-gold">
                  Cartão de teste (toque para copiar)
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {[
                    { label: "Cartão aprovado", value: "4242424242424242" },
                    { label: "Cartão recusado", value: "4000000000000002" },
                    { label: "CVC", value: "123" },
                    { label: "Validade", value: "12/32" },
                  ].map((f) => (
                    <button
                      key={f.label}
                      type="button"
                      onClick={() => void copy(f.value)}
                      className="flex items-center justify-between gap-3 rounded-xl border border-gold/20 bg-background/40 px-3 py-2 text-left text-sm text-cream transition hover:border-gold/50"
                    >
                      <span className="text-foreground/70">{f.label}</span>
                      <span className="font-mono font-semibold">
                        {copied === f.value ? "copiado!" : f.value}
                      </span>
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-xs text-foreground/50">
                  Use qualquer nome no titular e qualquer CEP. Nada é cobrado.
                </p>
              </div>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              {TEST_PLANS.map((p) => (
                <Btn
                  key={p.id}
                  variant="outline"
                  disabled={checkoutLoading || !user}
                  onClick={() =>
                    user &&
                    openCheckout({
                      priceId: p.id,
                      userId: user.id,
                      email: user.email,
                      allowedPaymentMethods: method === "all" ? undefined : [method],
                      successUrl: `${window.location.origin}/minha-conta?checkout=success`,
                    })
                  }
                >
                  Testar {p.label}
                </Btn>
              ))}
            </div>
            <p className="mt-3 text-xs text-foreground/50">
              A assinatura de teste é criada na sua própria conta de admin e não afeta o site real.
              Observação: planos com cobrança recorrente podem exigir cartão — se o Pix não
              aparecer, use "Todos os meios".
            </p>
          </>
        ) : (

          <p className="mt-1 text-sm text-foreground/70">
            Você está no site publicado (ambiente real), onde qualquer pagamento é cobrado de
            verdade. Para testar sem cobrança, abra o <b>preview</b> do projeto e use este mesmo
            painel.
          </p>
        )}
      </Card>
    </div>
  );
}

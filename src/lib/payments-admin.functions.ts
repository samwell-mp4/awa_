import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { gatewayFetch, type PaddleEnv } from "@/lib/paddle.server";

const PRICE_IDS = [
  "awa_infantil_monthly",
  "awa_infantil_semestral",
  "awa_adulto_monthly",
  "awa_adulto_semestral",
] as const;

const EXPECTED: Record<string, { label: string; amount: number; months: number }> = {
  awa_infantil_monthly: { label: "Infantil Mensal", amount: 2990, months: 1 },
  awa_infantil_semestral: { label: "Infantil Semestral", amount: 14990, months: 6 },
  awa_adulto_monthly: { label: "Adulto Mensal", amount: 3500, months: 1 },
  awa_adulto_semestral: { label: "Adulto Semestral", amount: 18000, months: 6 },
};

export type PriceCheck = {
  priceId: string;
  label: string;
  ok: boolean;
  problems: string[];
  status?: string;
  amount?: string;
  currency?: string;
  interval?: string;
  frequency?: number;
  paddleId?: string;
};

async function checkEnv(env: PaddleEnv): Promise<{ env: PaddleEnv; error?: string; prices: PriceCheck[] }> {
  const prices: PriceCheck[] = [];
  for (const priceId of PRICE_IDS) {
    const expected = EXPECTED[priceId]!;
    try {
      const res = await gatewayFetch(env, `/prices?external_id=${encodeURIComponent(priceId)}`);
      if (!res.ok) {
        prices.push({
          priceId,
          label: expected.label,
          ok: false,
          problems: [`Erro na consulta (${res.status})`],
        });
        continue;
      }
      const json = await res.json();
      const list: any[] = json.data ?? [];
      const active = list
        .filter((p) => (p.status ?? "active") === "active")
        .sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
      const p = active[0] ?? list[0];
      if (!p) {
        prices.push({
          priceId,
          label: expected.label,
          ok: false,
          problems: ["Preço não encontrado neste ambiente"],
        });
        continue;
      }
      const problems: string[] = [];
      if ((p.status ?? "active") !== "active") problems.push("Preço arquivado (checkout vai falhar)");
      const amount = Number(p.unit_price?.amount ?? NaN);
      if (amount !== expected.amount) {
        problems.push(`Valor diferente do esperado (esperado R$ ${(expected.amount / 100).toFixed(2)})`);
      }
      const interval = p.billing_cycle?.interval;
      const frequency = p.billing_cycle?.frequency;
      if (!interval) problems.push("Sem ciclo de cobrança (compra única)");
      else if (interval === "month" && frequency !== expected.months) {
        problems.push(`Ciclo diferente (esperado ${expected.months} mês(es))`);
      } else if (interval === "year" || (interval !== "month" && interval)) {
        problems.push(`Ciclo em "${interval}" — esperado mês`);
      }
      prices.push({
        priceId,
        label: expected.label,
        ok: problems.length === 0,
        problems,
        status: p.status,
        amount: p.unit_price?.amount,
        currency: p.unit_price?.currency_code,
        interval,
        frequency,
        paddleId: p.id,
      });
    } catch (e: any) {
      prices.push({
        priceId,
        label: expected.label,
        ok: false,
        problems: [e?.message ?? "Falha desconhecida"],
      });
    }
  }
  return { env, prices };
}

/** Diagnóstico do catálogo de pagamentos (teste e real). Não cobra nada. */
export const checkPaymentsCatalog = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Acesso negado");

    const envs: PaddleEnv[] = ["sandbox", "live"];
    const results = await Promise.all(
      envs.map(async (env) => {
        try {
          return await checkEnv(env);
        } catch (e: any) {
          return { env, error: e?.message ?? "Falha ao consultar", prices: [] as PriceCheck[] };
        }
      }),
    );
    return { checkedAt: new Date().toISOString(), results };
  });

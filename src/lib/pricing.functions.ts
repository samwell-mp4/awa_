import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { gatewayFetch, type PaddleEnv } from "@/lib/paddle.server";

/**
 * País do visitante detectado no servidor a partir dos headers da CDN.
 * Retorna `null` quando não há header — nesse caso o cliente deixa o
 * Paddle.PricePreview() detectar a localização pelo IP (nunca enviamos um
 * código "desconhecido" para o Paddle).
 */
export const getVisitorCountry = createServerFn({ method: "GET" }).handler(async () => {
  const headers = getRequest().headers;
  const raw =
    headers.get("x-vercel-ip-country") ??
    headers.get("cf-ipcountry") ??
    headers.get("x-country-code") ??
    "";
  const code = raw.trim().toUpperCase();
  const isRealCountry = /^[A-Z]{2}$/.test(code) && !["XX", "T1", "ZZ"].includes(code);
  return { country: isRealCountry ? code : null };
});

/** Traduz IDs legíveis de preço para os IDs internos do provedor de pagamento. */
export const resolvePaddlePrices = createServerFn({ method: "GET" })
  .inputValidator((d: { priceIds: string[]; environment: PaddleEnv }) => d)
  .handler(async ({ data }) => {
    const out: Record<string, string> = {};
    await Promise.all(
      data.priceIds.slice(0, 24).map(async (externalId) => {
        const res = await gatewayFetch(
          data.environment,
          `/prices?status=active&external_id=${encodeURIComponent(externalId)}`,
        );
        if (!res.ok) return;
        const json = (await res.json()) as {
          data?: Array<{ id: string; status?: string; created_at?: string }>;
        };
        const active = (json.data ?? [])
          .filter((p) => (p.status ?? "active") === "active")
          .sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
        if (active[0]) out[externalId] = active[0].id;
      }),
    );
    return { map: out };
  });

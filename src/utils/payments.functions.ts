import { createServerFn } from "@tanstack/react-start";
import { gatewayFetch, type PaddleEnv } from "@/lib/paddle.server";

export const resolvePaddlePrice = createServerFn({ method: "GET" })
  .inputValidator((data: { priceId: string; environment: PaddleEnv }) => data)
  .handler(async ({ data }) => {
    const response = await gatewayFetch(
      data.environment,
      `/prices?status=active&external_id=${encodeURIComponent(data.priceId)}`,
    );
    const result = await response.json();
    const prices: Array<{ id: string; status?: string; created_at?: string }> = result.data ?? [];
    // Only ever charge with an active price, newest first, so an archived
    // legacy price with the same lookup key can never be used.
    const active = prices
      .filter((p) => (p.status ?? "active") === "active")
      .sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
    if (!active.length) throw new Error("Price not found");
    return active[0].id;
  });

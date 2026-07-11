import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { gatewayFetch, type PaddleEnv } from "@/lib/paddle.server";

/**
 * Creates a Paddle transaction server-side, binding custom_data.userId to the
 * authenticated caller so the buyer cannot re-target the subscription to
 * another account via client-side tampering. The client opens checkout by
 * transactionId; customData is not accepted from the browser.
 */
export const createPaddleCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { priceId: string; environment: PaddleEnv }) => d)
  .handler(async ({ data, context }) => {
    const priceRes = await gatewayFetch(
      data.environment,
      `/prices?external_id=${encodeURIComponent(data.priceId)}`,
    );
    const priceJson = await priceRes.json();
    const paddlePriceId = priceJson.data?.[0]?.id as string | undefined;
    if (!paddlePriceId) throw new Error("Price not found");

    const txRes = await gatewayFetch(data.environment, `/transactions`, {
      method: "POST",
      body: JSON.stringify({
        items: [{ price_id: paddlePriceId, quantity: 1 }],
        custom_data: { userId: context.userId },
      }),
    });
    if (!txRes.ok) {
      const t = await txRes.text();
      throw new Error(`Paddle transaction failed: ${txRes.status} ${t.slice(0, 200)}`);
    }
    const txJson = await txRes.json();
    const transactionId = txJson?.data?.id as string | undefined;
    if (!transactionId) throw new Error("No transaction id returned");
    return { transactionId };
  });

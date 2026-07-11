import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { gatewayFetch, type PaddleEnv } from "@/lib/paddle.server";

/**
 * Cria uma sessão do portal do cliente Paddle onde o usuário pode:
 * - Atualizar método de pagamento
 * - Cancelar assinatura (mantém acesso até o fim do período pago)
 * - Ver faturas
 */
export const openCustomerPortalSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { environment: PaddleEnv }) => d)
  .handler(async ({ data, context }) => {
    const { data: sub, error } = await context.supabase
      .from("subscriptions")
      .select("paddle_customer_id, paddle_subscription_id")
      .eq("user_id", context.userId)
      .eq("environment", data.environment)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!sub?.paddle_customer_id) {
      throw new Error("Nenhuma assinatura encontrada para gerenciar.");
    }

    const body = sub.paddle_subscription_id
      ? { subscription_ids: [sub.paddle_subscription_id] }
      : {};

    const res = await gatewayFetch(
      data.environment,
      `/customers/${sub.paddle_customer_id}/portal-sessions`,
      { method: "POST", body: JSON.stringify(body) },
    );
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Paddle portal: ${res.status} ${txt.slice(0, 200)}`);
    }
    const json = await res.json();
    const general = json?.data?.urls?.general?.overview as string | undefined;
    const subUrl = json?.data?.urls?.subscriptions?.[0]?.update_subscription_payment_method as
      | string
      | undefined;
    const url = general ?? subUrl;
    if (!url) throw new Error("Portal URL ausente na resposta do Paddle.");
    return { url };
  });

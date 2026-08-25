import { createFileRoute } from "@tanstack/react-router";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { verifyWebhook, EventName, type PaddleEnv } from "@/lib/paddle.server";
import type { Database } from "@/integrations/supabase/types";

let _supabase: SupabaseClient<Database> | null = null;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  }
  return _supabase;
}

function externalIds(items: any[] | undefined) {
  const item = items?.[0];
  return {
    priceId: item?.price?.importMeta?.externalId as string | undefined,
    productId: item?.product?.importMeta?.externalId as string | undefined,
  };
}

/**
 * Keeps a user ↔ Paddle customer mapping so the customer portal works even
 * before/after a subscription row exists (e.g. cancellation history).
 */
async function linkPaddleCustomer(userId: string, customerId: string, env: PaddleEnv) {
  if (!userId || !customerId) return;
  const db = getSupabase();
  const { data: userRes } = await db.auth.admin.getUserById(userId);
  const email = userRes?.user?.email ?? "";
  await db
    .from("paddle_customers")
    .upsert(
      {
        user_id: userId,
        paddle_customer_id: customerId,
        email,
        environment: env,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "paddle_customer_id" },
    );
}

async function handleSubscriptionCreated(data: any, env: PaddleEnv) {
  const { id, customerId, items, status, currentBillingPeriod, customData } = data;
  const userId = customData?.userId;
  if (!userId) {
    console.error("payments-webhook: subscription without customData.userId", {
      subscriptionId: id,
      customerId,
      env,
    });
    return;
  }
  const { priceId, productId } = externalIds(items);
  if (!priceId || !productId) {
    console.warn("payments-webhook: missing importMeta.externalId", {
      subscriptionId: id,
      rawPriceId: items?.[0]?.price?.id,
      rawProductId: items?.[0]?.product?.id,
    });
    return;
  }
  await getSupabase().from("subscriptions").upsert(
    {
      user_id: userId,
      paddle_subscription_id: id,
      paddle_customer_id: customerId,
      product_id: productId,
      price_id: priceId,
      status,
      current_period_start: currentBillingPeriod?.startsAt,
      current_period_end: currentBillingPeriod?.endsAt,
      scheduled_change_action: null,
      scheduled_change_at: null,
      cancel_at_period_end: false,
      environment: env,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "paddle_subscription_id" },
  );

  await linkPaddleCustomer(userId, customerId, env);
}


/**
 * Handles every subscription lifecycle event that carries a status:
 * updated, activated, trialing, paused, resumed and past_due. If the row does
 * not exist yet (event arrived out of order), it falls back to an insert.
 */
async function handleSubscriptionUpdated(data: any, env: PaddleEnv) {
  const { id, status, items, currentBillingPeriod, scheduledChange } = data;
  const { priceId, productId } = externalIds(items);
  const patch: Database["public"]["Tables"]["subscriptions"]["Update"] = {
    status,
    current_period_start: currentBillingPeriod?.startsAt,
    current_period_end: currentBillingPeriod?.endsAt,
    scheduled_change_action: scheduledChange?.action || null,
    scheduled_change_at: scheduledChange?.effectiveAt || null,
    cancel_at_period_end: scheduledChange?.action === "cancel",
    updated_at: new Date().toISOString(),
  };
  if (priceId && productId) {
    patch.price_id = priceId;
    patch.product_id = productId;
  }
  const { data: rows } = await getSupabase()
    .from("subscriptions")
    .update(patch)
    .eq("paddle_subscription_id", id)
    .eq("environment", env)
    .select("id");

  if (!rows?.length) {
    // Out-of-order delivery (activated before created) — create the row.
    await handleSubscriptionCreated(data, env);
  }
}


async function handleSubscriptionCanceled(data: any, env: PaddleEnv) {
  await getSupabase()
    .from("subscriptions")
    .update({ status: "canceled", updated_at: new Date().toISOString() })
    .eq("paddle_subscription_id", data.id)
    .eq("environment", env);
}

/** Renewal succeeded: refresh the paid period so access never lapses. */
async function handleTransactionCompleted(data: any, env: PaddleEnv) {
  const subscriptionId = data?.subscriptionId;
  if (!subscriptionId) return;
  const period = data?.billingPeriod;
  const patch: Database["public"]["Tables"]["subscriptions"]["Update"] = {
    status: "active",
    updated_at: new Date().toISOString(),
  };
  if (period?.startsAt) patch.current_period_start = period.startsAt;
  if (period?.endsAt) patch.current_period_end = period.endsAt;
  await getSupabase()
    .from("subscriptions")
    .update(patch)
    .eq("paddle_subscription_id", subscriptionId)
    .eq("environment", env);
}

/** Renewal failed: mark dunning so the app can warn and gate access. */
async function handlePaymentFailed(data: any, env: PaddleEnv) {
  const subscriptionId = data?.subscriptionId;
  if (!subscriptionId) return;
  await getSupabase()
    .from("subscriptions")
    .update({ status: "past_due", updated_at: new Date().toISOString() })
    .eq("paddle_subscription_id", subscriptionId)
    .eq("environment", env);
}

async function handleWebhook(req: Request, env: PaddleEnv) {
  const event = await verifyWebhook(req, env);
  switch (event.eventType) {
    case EventName.SubscriptionCreated:
      await handleSubscriptionCreated(event.data, env);
      break;
    case EventName.SubscriptionUpdated:
      await handleSubscriptionUpdated(event.data, env);
      break;
    case EventName.SubscriptionCanceled:
      await handleSubscriptionCanceled(event.data, env);
      break;
    case EventName.TransactionCompleted:
      await handleTransactionCompleted(event.data, env);
      break;
    case EventName.TransactionPaymentFailed:
      await handlePaymentFailed(event.data, env);
      break;
    default:
      console.log("Unhandled event:", event.eventType);
  }
}


export const Route = createFileRoute("/api/public/payments/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const url = new URL(request.url);
        const env = (url.searchParams.get("env") || "sandbox") as PaddleEnv;
        try {
          await handleWebhook(request, env);
          return Response.json({ received: true });
        } catch (e) {
          console.error("Webhook error:", e);
          return new Response("Webhook error", { status: 400 });
        }
      },
    },
  },
});

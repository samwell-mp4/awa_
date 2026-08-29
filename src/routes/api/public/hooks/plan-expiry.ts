import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

// Called by pg_cron once per day. Finds subscriptions whose current_period_end
// falls in [now, now+7d] and enqueues a warning email for each (idempotent by
// idempotency key derived from subscription + period end).

export const Route = createFileRoute("/api/public/hooks/plan-expiry")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Auth via Supabase anon key in the "apikey" header (see schedule-jobs-options).
        const apikey = request.headers.get("apikey");
        const expected = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
        if (!expected || apikey !== expected) {
          return new Response(JSON.stringify({ error: "unauthorized" }), {
            status: 401, headers: { "Content-Type": "application/json" },
          });
        }

        const supabaseUrl = process.env.SUPABASE_URL!;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        if (!supabaseUrl || !serviceKey) {
          return new Response(JSON.stringify({ error: "server config" }), { status: 500 });
        }
        const admin = createClient(supabaseUrl, serviceKey);

        const now = new Date();
        const in7 = new Date(now.getTime() + 7 * 24 * 3600 * 1000);

        // Find active/canceled/past_due subs expiring in the next 7 days
        const { data: subs, error } = await admin
          .from("subscriptions")
          .select("id, user_id, product_id, price_id, status, current_period_end, environment")
          .in("status", ["active", "trialing", "canceled", "past_due"])
          .gte("current_period_end", now.toISOString())
          .lte("current_period_end", in7.toISOString());

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), { status: 500 });
        }

        let enqueued = 0;
        let skipped = 0;

        for (const sub of subs ?? []) {
          const periodEnd = new Date(sub.current_period_end as string);
          const daysLeft = Math.max(0, Math.ceil((periodEnd.getTime() - now.getTime()) / (24 * 3600 * 1000)));
          const idem = `plan-expiring-${sub.id}-${periodEnd.toISOString().slice(0, 10)}`;

          // Skip if we already logged this idempotency key
          const { data: existing } = await admin
            .from("email_send_log")
            .select("id")
            .eq("message_id", idem)
            .limit(1);
          if (existing && existing.length > 0) { skipped++; continue; }

          // Look up user email + profile name
          const { data: userRes } = await admin.auth.admin.getUserById(sub.user_id as string);
          const email = userRes?.user?.email;
          if (!email) { skipped++; continue; }
          const { data: profile } = await admin
            .from("profiles").select("name").eq("id", sub.user_id).maybeSingle();

          const productId = (sub.product_id as string) ?? "";
          const planLabel =
            productId.includes("infantil") ? "Infantil" :
            productId.includes("adulto") ? "Adulto" :
            productId.includes("premium") ? "Premium" :
            productId.includes("advanced") ? "Advanced" :
            productId.includes("starter") ? "Starter" :
            productId.includes("pro") ? "Pro" : "Awã Tech";

          const expiresOn = periodEnd.toLocaleDateString("pt-BR");
          const payload = {
            templateName: "plan-expiring",
            recipientEmail: email,
            idempotencyKey: idem,
            messageId: idem,
            templateData: {
              name: profile?.name || "Aprendiz",
              planName: planLabel,
              daysLeft,
              expiresOn,
            },
          };

          const { error: enqErr } = await admin.rpc("enqueue_email", {
            queue_name: "transactional_emails",
            payload: payload as any,
          });
          if (enqErr) { skipped++; continue; }

          // Pre-log so re-runs skip
          await admin.from("email_send_log").insert({
            message_id: idem,
            template_name: "plan-expiring",
            recipient_email: email,
            status: "pending",
            metadata: { subscription_id: sub.id, days_left: daysLeft, environment: sub.environment },
          });
          enqueued++;
        }

        return new Response(JSON.stringify({ ok: true, enqueued, skipped }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});

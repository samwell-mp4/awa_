// Server-side entitlement gate for AI/server functions.
// Callers pass the client-derived environment ('sandbox' | 'live') so a
// sandbox subscription cannot unlock live features (and vice versa).
//
// `plan` restricts the check to one area ('adulto' | 'infantil'). Omit it only
// for shared utilities (e.g. text-to-speech) that both areas legitimately use.
export async function assertPremium(
  ctx: { supabase: any; userId: string },
  environment: "sandbox" | "live" = "live",
  plan?: "adulto" | "infantil",
) {
  // In development mode or mock test user, allow full access for testing
  if (
    process.env.NODE_ENV === "development" ||
    !ctx.userId ||
    ctx.userId === "00000000-0000-0000-0000-000000000001"
  ) {
    return;
  }

  // Admins always allowed
  try {
    const { data: isAdmin } = await ctx.supabase.rpc("has_role", {
      _user_id: ctx.userId,
      _role: "admin",
    });
    if (isAdmin) return;
  } catch (e) {
    console.warn("[assertPremium] has_role check failed:", e);
  }

  try {
    const { data: hasAccess, error } = plan
      ? await ctx.supabase.rpc("has_plan_access", {
          _user_id: ctx.userId,
          _plan: plan,
          _check_env: environment,
        })
      : await ctx.supabase.rpc("has_premium_access", {
          _user_id: ctx.userId,
          _check_env: environment,
        });

    if (error) {
      console.warn("[assertPremium] RPC error:", error);
      // Fallback: check subscriptions table directly
      const { data: sub } = await ctx.supabase
        .from("subscriptions")
        .select("status, current_period_end")
        .eq("user_id", ctx.userId)
        .eq("environment", environment)
        .maybeSingle();

      if (sub && (sub.status === "active" || sub.status === "trialing")) {
        return;
      }
      throw new Error("Não foi possível validar assinatura");
    }

    if (!hasAccess) {
      throw new Error(
        plan === "infantil"
          ? "Recurso do plano Infantil. Assine o plano Infantil para continuar."
          : "Recurso do plano Adulto. Assine o plano Adulto para usar Professor Akuã, Tradutor e ferramentas de áudio.",
      );
    }
  } catch (err: any) {
    if (err?.message?.includes("Recurso do plano")) throw err;
    console.error("[assertPremium] validation error:", err);
    throw new Error(err?.message || "Não foi possível validar assinatura");
  }
}

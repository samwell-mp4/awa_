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
  // Admins always allowed
  const { data: isAdmin } = await ctx.supabase.rpc("has_role", {
    _user_id: ctx.userId,
    _role: "admin",
  });
  if (isAdmin) return;

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

  if (error) throw new Error("Não foi possível validar assinatura");
  if (!hasAccess) {
    throw new Error(
      plan === "infantil"
        ? "Recurso do plano Infantil. Assine o plano Infantil para continuar."
        : "Recurso do plano Adulto. Assine o plano Adulto para usar Professor Akuã, Tradutor e ferramentas de áudio.",
    );
  }
}

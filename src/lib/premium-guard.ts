// Server-side premium/admin gate for AI server functions.
// Callers pass the client-derived environment ('sandbox' | 'live') so a
// sandbox subscription cannot unlock live features (and vice versa).
export async function assertPremium(
  ctx: { supabase: any; userId: string },
  environment: "sandbox" | "live" = "live",
) {
  // Admins always allowed
  const { data: isAdmin } = await ctx.supabase.rpc("has_role", {
    _user_id: ctx.userId,
    _role: "admin",
  });
  if (isAdmin) return;

  const { data: hasAccess, error } = await ctx.supabase.rpc("has_premium_access", {
    _user_id: ctx.userId,
    _check_env: environment,
  });
  if (error) throw new Error("Não foi possível validar assinatura");
  if (!hasAccess) {
    throw new Error(
      "Recurso Premium. Assine para usar Professor Akuã, Tradutor e ferramentas de áudio.",
    );
  }
}

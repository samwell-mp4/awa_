// Server-side premium/admin gate for AI server functions.
// Uses the request-scoped supabase client from requireSupabaseAuth so
// the has_premium_access(_user_id) RPC runs as the caller.
export async function assertPremium(ctx: { supabase: any; userId: string }) {
  // Admins always allowed
  const { data: isAdmin } = await ctx.supabase.rpc("has_role", {
    _user_id: ctx.userId,
    _role: "admin",
  });
  if (isAdmin) return;

  const { data: hasAccess, error } = await ctx.supabase.rpc("has_premium_access", {
    _user_id: ctx.userId,
  });
  if (error) throw new Error("Não foi possível validar assinatura");
  if (!hasAccess) {
    throw new Error(
      "Recurso Premium. Assine para usar Professor Akuã, Tradutor e ferramentas de áudio.",
    );
  }
}

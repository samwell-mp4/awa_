import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(ctx: { supabase: any; userId: string }) {
  const { data } = await ctx.supabase.rpc("has_role", { _user_id: ctx.userId, _role: "admin" });
  if (!data) throw new Error("Acesso negado");
}

export const grantPremium = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { email: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Find user by email
    const { data: userList, error: listErr } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    if (listErr) throw listErr;
    const target = userList.users.find((u) => u.email?.toLowerCase() === data.email.toLowerCase());
    if (!target) throw new Error("Usuário não encontrado. Peça para essa pessoa criar conta primeiro.");

    const { error } = await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: target.id, role: "premium" }, { onConflict: "user_id,role" });
    if (error) throw error;

    return { message: `Premium liberado para ${data.email}` };
  });

export const revokePremium = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", data.userId)
      .eq("role", "premium");
    if (error) throw error;
    return { ok: true };
  });

export const listPremiumUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: roles } = await supabaseAdmin.from("user_roles").select("user_id").eq("role", "premium");
    if (!roles?.length) return [];
    const ids = roles.map((r: any) => r.user_id);
    const { data: profiles } = await supabaseAdmin.from("profiles").select("id,name").in("id", ids);
    const { data: userList } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    return ids.map((id: string) => {
      const u = userList?.users.find((x) => x.id === id);
      const p = profiles?.find((x: any) => x.id === id);
      return { user_id: id, email: u?.email ?? "", name: p?.name ?? "" };
    });
  });

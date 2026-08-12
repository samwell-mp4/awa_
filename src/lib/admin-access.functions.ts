import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(ctx: { supabase: any; userId: string }) {
  const { data } = await ctx.supabase.rpc("has_role", { _user_id: ctx.userId, _role: "admin" });
  if (!data) throw new Error("Acesso negado");
}

export const grantPremium = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { email: string; permanent?: boolean; months?: number }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: userList, error: listErr } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    if (listErr) throw listErr;
    const target = userList.users.find((u) => u.email?.toLowerCase() === data.email.toLowerCase());
    if (!target) throw new Error("Usuário não encontrado. Peça para essa pessoa criar conta primeiro.");

    const months = data.months ?? 1;
    const expiresAt = data.permanent
      ? null
      : new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000).toISOString();

    const { error } = await supabaseAdmin
      .from("user_roles")
      .upsert(
        { user_id: target.id, role: "premium", expires_at: expiresAt },
        { onConflict: "user_id,role" },
      );
    if (error) throw error;

    return {
      message: data.permanent
        ? `Premium permanente liberado para ${data.email}`
        : `Premium liberado para ${data.email} por ${months} mês(es)`,
    };
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

export const listAllUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: userList } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    const users = userList?.users ?? [];
    const ids = users.map((u) => u.id);
    const [{ data: roles }, { data: profiles }, { data: subs }] = await Promise.all([
      supabaseAdmin.from("user_roles").select("user_id,role,expires_at").in("user_id", ids),
      supabaseAdmin.from("profiles").select("id,name,photo_url").in("id", ids),
      supabaseAdmin
        .from("subscriptions")
        .select("user_id,status,environment,current_period_end")
        .in("user_id", ids),
    ]);
    return users
      .map((u) => {
        const userRoles = (roles ?? []).filter((r: any) => r.user_id === u.id);
        const roleNames = userRoles.map((r: any) => r.role);
        const premiumRole = userRoles.find((r: any) => r.role === "premium");
        const premiumExpires = premiumRole?.expires_at ?? null;
        const premiumActive =
          !!premiumRole && (!premiumExpires || new Date(premiumExpires) > new Date());
        const p = (profiles ?? []).find((x: any) => x.id === u.id);
        const sub = (subs ?? [])
          .filter((s: any) => s.user_id === u.id)
          .sort((a: any, b: any) => (b.current_period_end ?? "").localeCompare(a.current_period_end ?? ""))[0];
        return {
          user_id: u.id,
          email: u.email ?? "",
          name: p?.name ?? "",
          photo_url: p?.photo_url ?? null,
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at,
          is_admin: roleNames.includes("admin"),
          is_premium_manual: premiumActive,
          premium_expires_at: premiumExpires,
          premium_permanent: !!premiumRole && !premiumExpires,
          subscription: sub
            ? { status: sub.status, environment: sub.environment, current_period_end: sub.current_period_end }
            : null,
        };
      })
      .sort((a, b) => (b.last_sign_in_at ?? b.created_at).localeCompare(a.last_sign_in_at ?? a.created_at));
  });

// ============ ALLOWLIST (liberação de login) ============

export const listAllowlist = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("login_allowlist")
      .select("id,email,phone,note,created_at")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  });

export const addAllowlist = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { email?: string; phone?: string; note?: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const email = data.email?.trim().toLowerCase() || null;
    const phone = data.phone?.trim() || null;
    if (!email && !phone) throw new Error("Informe email ou celular");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("login_allowlist")
      .insert({ email, phone, note: data.note?.trim() || null, created_by: context.userId });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const removeAllowlist = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("login_allowlist").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const checkMyLoginAllowed = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    // Admin sempre tem acesso liberado
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (isAdmin) return { allowed: true };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: u } = await supabaseAdmin.auth.admin.getUserById(context.userId);
    const email = u?.user?.email ?? null;
    const phone = u?.user?.phone ?? null;
    const { data } = await supabaseAdmin.rpc("is_login_allowed", { _email: email ?? "", _phone: phone ?? "" });
    return { allowed: !!data };
  });

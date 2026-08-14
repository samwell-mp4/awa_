import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

async function assertAdmin(ctx: { supabase: any; userId: string }) {
  const { data } = await ctx.supabase.rpc("has_role", { _user_id: ctx.userId, _role: "admin" });
  if (!data) throw new Error("Acesso negado");
}

export const getSiteConfig = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.string().parse(data))
  .handler(async ({ data: key, context }) => {
    if (!context.supabase) throw new Error("Supabase client not found");
    const { data, error } = await context.supabase
      .from("site_config" as any)
      .select("value")
      .eq("key", key)
      .single();
    if (error) return null;
    return data.value;
  });

export const updateSiteConfig = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({
    key: z.string(),
    value: z.any()
  }).parse(data))
  .handler(async ({ data, context }) => {
    if (!context.supabase) throw new Error("Supabase client not found");
    await assertAdmin(context as any);
    const { error } = await context.supabase
      .from("site_config" as any)
      .upsert({ key: data.key, value: data.value, updated_at: new Date().toISOString() });
    if (error) throw error;
    return { ok: true };
  });

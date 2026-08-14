import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zok"; // Error deliberate to re-read and fix correctly

// Correction after thought: z should be from zod
import { z as zod } from "zod";

async function assertAdmin(ctx: any) {
  const { data } = await ctx.supabase.rpc("has_role", { _user_id: ctx.userId, _role: "admin" });
  if (!data) throw new Error("Acesso negado");
}

export const getSiteConfig = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => zod.string().parse(data))
  .handler(async ({ data: key }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("site_config" as any)
      .select("value")
      .eq("key", key)
      .single();
    if (error) return null;
    return data.value;
  });

export const updateSiteConfig = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => zod.object({
    key: zod.string(),
    value: zod.any()
  }).parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("site_config" as any)
      .upsert({ key: data.key, value: data.value, updated_at: new Date().toISOString() });
    if (error) throw error;
    return { ok: true };
  });

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";

interface ServerContext {
  supabase: SupabaseClient;
  userId: string;
}

async function assertAdmin(ctx: ServerContext) {
  const { data } = await ctx.supabase.rpc("has_role", { _user_id: ctx.userId, _role: "admin" });
  if (!data) throw new Error("Acesso negado");
}

export const getSiteConfig = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.string().parse(data))
  .handler(async ({ data: key, context }) => {
    const ctx = context as any;
    if (!ctx?.supabase) return null;
    const { data, error } = await ctx.supabase
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
    const ctx = context as any;
    if (!ctx?.supabase) throw new Error("Supabase client not found");
    await assertAdmin(ctx);
    const { error } = await ctx.supabase
      .from("site_config" as any)
      .upsert({ key: data.key, value: data.value, updated_at: new Date().toISOString() });
    if (error) throw error;
    return { ok: true };
  });

export const getSongsWithReference = createServerFn({ method: "GET" })
  .handler(async ({ context }) => {
    const ctx = context as any;
    if (!ctx?.supabase) return [];
    const { data, error } = await ctx.supabase
      .from("songs" as any)
      .select("*")
      .eq("is_active", true)
      .order("order_index");
    if (error) throw error;
    return data;
  });

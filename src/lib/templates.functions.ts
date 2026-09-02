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

export const getTemplates = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.string().optional().parse(data))
  .handler(async ({ data: category, context }) => {
    const ctx = context as any;
    if (!ctx?.supabase) return [];
    
    let query = ctx.supabase.from("ui_templates").select("*");
    if (category) {
      query = query.eq("category", category);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  });

export const setActiveTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({
    category: z.enum(['adulto', 'infantil', 'musicas']),
    templateName: z.string()
  }).parse(data))
  .handler(async ({ data, context }) => {
    const ctx = context as any;
    if (!ctx?.supabase) throw new Error("Supabase client not found");
    await assertAdmin(ctx);
    
    const key = `active_template_${data.category}`;
    const { error } = await ctx.supabase
      .from("site_config")
      .upsert({ 
        key, 
        value: JSON.stringify(data.templateName),
        updated_at: new Date().toISOString() 
      });
      
    if (error) throw error;
    return { ok: true };
  });

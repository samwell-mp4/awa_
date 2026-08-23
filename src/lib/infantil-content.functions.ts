import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const getStoriesConfig = createServerFn({ method: "GET" })
  .handler(async ({ context }) => {
    const ctx = context as any;
    if (!ctx?.supabase) return [];
    const { data, error } = await ctx.supabase
      .from("site_config")
      .select("value")
      .eq("key", "infantil_stories")
      .maybeSingle();
    if (error || !data) return null;
    return data.value;
  });

export const updateStoriesConfig = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.array(z.any()).parse(data))
  .handler(async ({ data, context }) => {
    const ctx = context as any;
    if (!ctx?.supabase) throw new Error("Supabase client not found");
    
    const { data: isAdmin } = await ctx.supabase.rpc("has_role", { 
      _user_id: ctx.userId, 
      _role: "admin" 
    });
    if (!isAdmin) throw new Error("Acesso negado");

    const { error } = await ctx.supabase
      .from("site_config")
      .upsert({ 
        key: "infantil_stories", 
        value: data, 
        updated_at: new Date().toISOString() 
      });
    if (error) throw error;
    return { ok: true };
  });

export const getGamesConfig = createServerFn({ method: "GET" })
  .handler(async ({ context }) => {
    const ctx = context as any;
    if (!ctx?.supabase) return [];
    const { data, error } = await ctx.supabase
      .from("site_config")
      .select("value")
      .eq("key", "infantil_games")
      .maybeSingle();
    if (error || !data) return null;
    return data.value;
  });

export const updateGamesConfig = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.array(z.any()).parse(data))
  .handler(async ({ data, context }) => {
    const ctx = context as any;
    if (!ctx?.supabase) throw new Error("Supabase client not found");
    
    const { data: isAdmin } = await ctx.supabase.rpc("has_role", { 
      _user_id: ctx.userId, 
      _role: "admin" 
    });
    if (!isAdmin) throw new Error("Acesso negado");

    const { error } = await ctx.supabase
      .from("site_config")
      .upsert({ 
        key: "infantil_games", 
        value: data, 
        updated_at: new Date().toISOString() 
      });
    if (error) throw error;
    return { ok: true };
  });

export const getTrailsTotemsConfig = createServerFn({ method: "GET" })
  .handler(async ({ context }) => {
    const ctx = context as any;
    if (!ctx?.supabase) return null;
    const { data, error } = await ctx.supabase
      .from("site_config")
      .select("value")
      .eq("key", "infantil_trails_totems")
      .maybeSingle();
    if (error || !data) return null;
    return data.value;
  });

export const updateTrailsTotemsConfig = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.any().parse(data))
  .handler(async ({ data, context }) => {
    const ctx = context as any;
    if (!ctx?.supabase) throw new Error("Supabase client not found");
    
    const { data: isAdmin } = await ctx.supabase.rpc("has_role", { 
      _user_id: ctx.userId, 
      _role: "admin" 
    });
    if (!isAdmin) throw new Error("Acesso negado");

    const { error } = await ctx.supabase
      .from("site_config")
      .upsert({ 
        key: "infantil_trails_totems", 
        value: data, 
        updated_at: new Date().toISOString() 
      });
    if (error) throw error;
    return { ok: true };
  });

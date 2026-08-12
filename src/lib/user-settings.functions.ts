import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export const getUserSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
    );

    const { data, error } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", context.userId)
      .maybeSingle();

    if (error) throw new Error(error.message);

    // Default settings if none found
    return data ?? {
      voice_model: "google/gemini-2.5-flash",
      assistant_name: "Professor Akuã",
      language: "pt-BR"
    };
  });

export const updateUserSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    voice_model: z.string().optional(),
    assistant_name: z.string().optional(),
    language: z.string().optional()
  }).parse)
  .handler(async ({ data, context }) => {
    const supabase = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
    );

    const { error } = await supabase
      .from("user_settings")
      .upsert({
        user_id: context.userId,
        ...data,
        updated_at: new Date().toISOString()
      });

    if (error) throw new Error(error.message);
    return { success: true };
  });

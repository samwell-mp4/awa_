import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createClient } from "@supabase/supabase-js";

export const getUserSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
    );

    const { data, error } = await supabase
      .from("user_settings" as any)
      .select("*")
      .eq("user_id", context.userId)
      .maybeSingle();

    if (error) throw new Error(error.message);

    return (data as any) ?? {
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
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
    );

    const { error } = await supabase
      .from("user_settings" as any)
      .upsert({
        user_id: context.userId,
        ...data,
        updated_at: new Date().toISOString()
      });

    if (error) throw new Error(error.message);
    return { success: true };
  });

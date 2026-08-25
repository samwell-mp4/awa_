import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

/**
 * Checks a granular admin permission for the authenticated caller.
 * Uses the request-scoped Supabase client from the auth middleware — the
 * browser client has no session on the server and would always return false.
 */
export const checkPermission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { permission: string }) =>
    z.object({ permission: z.string() }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { data: hasPerm, error } = await context.supabase.rpc("has_permission", {
      _user_id: context.userId,
      _permission: data.permission,
    });

    if (error) {
      console.error("Permission check error:", error.message);
      return false;
    }
    return !!hasPerm;
  });

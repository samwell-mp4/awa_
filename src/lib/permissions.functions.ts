import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const PermissionSchema = z.object({
  permission: z
    .string()
    .trim()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9_]+$/, "permissão inválida"),
});

/**
 * Server-side permission check. Runs as the signed-in caller (RLS applies), so
 * the answer cannot be forged from the browser and never leaks other users'
 * permissions.
 */
export const checkPermission = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { permission: string }) => PermissionSchema.parse(data))
  .handler(async ({ data, context }) => {
    if (!context.userId) return false;

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

import { createServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";

export const checkPermission = createServerFn({ method: "GET" })
  .input((data: { permission: string }) => data)
  .handler(async ({ data }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: hasPerm, error } = await supabase.rpc("has_permission", {
      _user_id: user.id,
      _permission: data.permission,
    });

    if (error) {
      console.error("Permission check error:", error);
      return false;
    }
    return !!hasPerm;
  });

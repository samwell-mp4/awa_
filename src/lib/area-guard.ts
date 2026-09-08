import { redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { getPaddleEnvironment } from "@/lib/paddle";

/**
 * Route guard for premium areas. Each plan only unlocks its own area:
 * an Infantil subscription never opens /adulto pages and vice versa.
 * Admins pass through (handled inside has_plan_access).
 */
export async function requireArea(plan: "adulto" | "infantil") {
  const { data } = await supabase.auth.getUser();
  // `reloadDocument` avoids a hydration mismatch: these routes are client-only,
  // so the server sent a placeholder for them — a client-side swap to another
  // page would not match that HTML.
  if (!data.user) throw redirect({ to: "/auth", reloadDocument: true });
  const { data: hasAccess } = await supabase.rpc("has_plan_access", {
    _user_id: data.user.id,
    _plan: plan,
    _check_env: getPaddleEnvironment(),
  });
  if (!hasAccess)
    throw redirect({
      to: "/planos",
      search: { need: plan } as any,
      reloadDocument: true,
    });
}


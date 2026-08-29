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
  if (!data.user) {
    // Depois do login volta para a página pedida (ou para a área do plano).
    const here =
      typeof window !== "undefined" && window.location?.pathname
        ? window.location.pathname + (window.location.search ?? "")
        : `/${plan}`;
    throw redirect({ to: "/auth", search: { redirect: here } });
  }
  const { data: hasAccess } = await supabase.rpc("has_plan_access", {
    _user_id: data.user.id,
    _plan: plan,
    _check_env: getPaddleEnvironment(),
  });
  if (!hasAccess) throw redirect({ to: "/planos", search: { need: plan } as any });
}

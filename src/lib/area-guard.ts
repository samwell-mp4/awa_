import { useEffect, useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { getPaddleEnvironment } from "@/lib/paddle";
import { waitForHydration } from "@/lib/after-hydration";

export type AreaPlan = "adulto" | "infantil";

async function checkArea(plan: AreaPlan): Promise<"ok" | "auth" | "plan"> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return "auth";
  const { data: hasAccess } = await supabase.rpc("has_plan_access", {
    _user_id: data.user.id,
    _plan: plan,
    _check_env: getPaddleEnvironment(),
  });
  return hasAccess ? "ok" : "plan";
}

/**
 * Guard for premium areas. Each plan only unlocks its own area: an Infantil
 * subscription never opens /adulto pages and vice versa. Admins pass through
 * (handled inside has_plan_access).
 *
 * The check runs inside the component (after mount) instead of in `beforeLoad`
 * on purpose: the session only exists in the browser, so a route-level
 * redirect happens while React is still hydrating and produces
 * "server rendered HTML didn't match the client" errors plus a flash of the
 * login page for users who are actually signed in.
 */
export function useAreaGuard(plan: AreaPlan): boolean {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      // Navigating before hydration settles swaps the streamed route content
      // and React reports a hydration mismatch.
      await waitForHydration();
      const result = await checkArea(plan);
      if (cancelled) return;
      if (result === "auth") {
        void navigate({ to: "/auth", replace: true });
        return;
      }
      if (result === "plan") {
        void navigate({ to: "/planos", search: { need: plan } as any, replace: true });
        return;
      }
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [plan, navigate]);

  return ready;
}

/** Loading placeholder shown while the area guard is checking access. */
export function useAreaGuardPending(): boolean {
  return useRouterState({ select: (s) => s.isLoading });
}

import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getPaddleEnvironment } from "@/lib/paddle";
import { useAuth } from "@/hooks/use-auth";

export type PlanTier = "infantil" | "adulto" | "premium" | null;

function tierFromIds(productId?: string | null, priceId?: string | null): PlanTier {
  const p = productId ?? "";
  const r = priceId ?? "";
  if (p === "awa_infantil" || r.startsWith("awa_infantil_")) return "infantil";
  if (p === "awa_adulto" || r.startsWith("awa_adulto_")) return "adulto";
  if (p === "awa_premium" || r.startsWith("awa_premium_")) return "premium";
  return null;
}

function isSubActive(sub: {
  status: string | null;
  current_period_end: string | null;
}) {
  const end = sub.current_period_end ? new Date(sub.current_period_end).getTime() : null;
  const now = Date.now();
  if (sub.status === "active" || sub.status === "trialing") {
    return end === null || end > now;
  }
  // Pagamento recusado corta o acesso imediatamente (o Paddle segue tentando
  // cobrar; ao voltar para "active" o acesso é restaurado pelo webhook).
  if (sub.status === "past_due") return false;

  if (sub.status === "canceled") {
    return end !== null && end > now;
  }
  return false;
}

export function useSubscription() {
  const { user, isAdmin } = useAuth();
  const env = useMemo(() => getPaddleEnvironment(), []);

  const query = useQuery({
    queryKey: ["subscription", user?.id, env],
    enabled: !!user,
    queryFn: async () => {
      if (!user) {
        return { subs: [] as any[], hasInfantil: false, hasAdulto: false };
      }
      const { data: subs } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("environment", env)
        .order("created_at", { ascending: false });

      const activeSubs = (subs ?? []).filter(isSubActive);
      const tiers = new Set<PlanTier>();
      for (const s of activeSubs) tiers.add(tierFromIds(s.product_id, s.price_id));

      const hasInfantil = tiers.has("infantil") || tiers.has("premium");
      const hasAdulto = tiers.has("adulto") || tiers.has("premium");
      return { subs: subs ?? [], hasInfantil, hasAdulto };
    },
    refetchOnWindowFocus: true,
  });

  const refetchRef = useRef(query.refetch);
  refetchRef.current = query.refetch;

  useEffect(() => {
    if (!user) return;
    const suffix = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const chSub = supabase
      .channel(`sub_${user.id}_${suffix}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "subscriptions", filter: `user_id=eq.${user.id}` },
        () => void refetchRef.current(),
      )
      .subscribe();
    const chRoles = supabase
      .channel(`roles_${user.id}_${suffix}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_roles", filter: `user_id=eq.${user.id}` },
        () => void refetchRef.current(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(chSub);
      supabase.removeChannel(chRoles);
    };
  }, [user?.id]);

  const subs = query.data?.subs ?? [];
  const hasInfantil = isAdmin || (query.data?.hasInfantil ?? false);
  const hasAdulto = isAdmin || (query.data?.hasAdulto ?? false);
  const isPremium = hasInfantil || hasAdulto;

  // Prefer the most recent active sub; fallback to the most recent overall.
  const activeSubs = subs.filter(isSubActive);
  const primarySub = activeSubs[0] ?? subs[0] ?? null;

  return {
    isPremium,
    hasInfantil,
    hasAdulto,
    subscription: primarySub,
    subscriptions: subs,
    loading: query.isLoading,
    refetch: query.refetch,
    environment: env,
  };
}

export { tierFromIds };

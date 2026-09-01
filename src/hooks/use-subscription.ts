import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getPaddleEnvironment } from "@/lib/paddle";
import { useAuth } from "@/hooks/use-auth";

export type PlanTier = "infantil" | "adulto" | "premium" | "starter" | "pro" | "advanced" | null;

function tierFromIds(productId?: string | null, priceId?: string | null): PlanTier {
  const p = productId ?? "";
  const r = priceId ?? "";
  const is = (slug: string) => p === `awa_${slug}` || r.startsWith(`awa_${slug}_`);
  if (is("infantil")) return "infantil";
  if (is("adulto")) return "adulto";
  if (is("premium")) return "premium";
  if (is("starter")) return "starter";
  if (is("pro")) return "pro";
  if (is("advanced")) return "advanced";
  return null;
}

/**
 * Quais áreas cada plano libera. Mantido em sincronia com a função
 * `has_plan_access` do banco (que é a trava real, server-side).
 * Starter = Adulto. Pro/Advanced/Premium = Adulto + Infantil.
 */
const ADULTO_TIERS: PlanTier[] = ["adulto", "premium", "starter", "pro", "advanced"];
const INFANTIL_TIERS: PlanTier[] = ["infantil", "premium", "pro", "advanced"];

/** Dias de tolerância após uma cobrança recusada (o Paddle segue tentando). */
const PAST_DUE_GRACE_DAYS = 3;

function isSubActive(sub: {
  status: string | null;
  current_period_end: string | null;
}) {
  const end = sub.current_period_end ? new Date(sub.current_period_end).getTime() : null;
  const now = Date.now();
  if (sub.status === "active" || sub.status === "trialing") {
    return end === null || end > now;
  }
  // Cobrança recusada: mantém o acesso por alguns dias enquanto o Paddle tenta
  // novamente. O banner de aviso pede a atualização do cartão nesse período.
  if (sub.status === "past_due") {
    return end === null || end > now - PAST_DUE_GRACE_DAYS * 24 * 3600 * 1000;
  }
  // "paused" não libera acesso.
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
      let paddleCustomerId: string | null = null;
      for (const s of activeSubs) {
        tiers.add(tierFromIds(s.product_id, s.price_id));
        if (s.paddle_customer_id) paddleCustomerId = s.paddle_customer_id;
      }
      
      // Save for Retain
      if (paddleCustomerId && typeof window !== 'undefined') {
        window.localStorage.setItem('paddle_customer_id', paddleCustomerId);
      }

      const hasInfantil = INFANTIL_TIERS.some((t) => tiers.has(t));
      const hasAdulto = ADULTO_TIERS.some((t) => tiers.has(t));
      return { subs: subs ?? [], hasInfantil, hasAdulto };
    },
    // O realtime abaixo já atualiza a assinatura quando ela muda.
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
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

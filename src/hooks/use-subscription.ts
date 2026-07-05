import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getPaddleEnvironment } from "@/lib/paddle";
import { useAuth } from "@/hooks/use-auth";

export function useSubscription() {
  const { user } = useAuth();
  const env = useMemo(() => getPaddleEnvironment(), []);

  const query = useQuery({
    queryKey: ["subscription", user?.id, env],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return { isPremium: false, sub: null };

      const { data: hasAccess } = await supabase.rpc("has_premium_access", {
        _user_id: user.id,
        _check_env: env,
      });

      const { data: sub } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("environment", env)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      return { isPremium: !!hasAccess, sub };
    },
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (!user) return;
    const ch = supabase
      .channel(`sub_${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "subscriptions", filter: `user_id=eq.${user.id}` },
        () => query.refetch(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [user?.id, query.refetch]);

  return {
    isPremium: query.data?.isPremium ?? false,
    subscription: query.data?.sub ?? null,
    loading: query.isLoading,
    refetch: query.refetch,
    environment: env,
  };
}

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export type UserStats = {
  points: number;
  level: number;
  streak: number;
};

function computeStreak(dates: string[]): number {
  if (!dates.length) return 0;
  const days = new Set(dates.map((d) => d.slice(0, 10)));
  let streak = 0;
  const cur = new Date();
  // Allow streak to start today or yesterday
  const today = cur.toISOString().slice(0, 10);
  if (!days.has(today)) cur.setDate(cur.getDate() - 1);
  for (;;) {
    const key = cur.toISOString().slice(0, 10);
    if (days.has(key)) {
      streak++;
      cur.setDate(cur.getDate() - 1);
    } else break;
  }
  return streak;
}

export function useUserStats(): UserStats & { isLoading: boolean } {
  const { user } = useAuth();
  const qc = useQueryClient();
  const userId = user?.id;

  const { data, isLoading } = useQuery({
    queryKey: ["user-stats", userId],
    enabled: !!userId,
    staleTime: 3_000,
    refetchOnWindowFocus: true,
    queryFn: async (): Promise<UserStats> => {
      const { data, error } = await supabase
        .from("learning_events")
        .select("points, created_at")
        .eq("user_id", userId!);
      if (error) throw error;
      const points = (data ?? []).reduce((s, r) => s + (r.points ?? 0), 0);
      const level = Math.floor(points / 100) + 1;
      const streak = computeStreak((data ?? []).map((r) => r.created_at));
      return { points, level, streak };
    },
  });

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`user-stats-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "learning_events", filter: `user_id=eq.${userId}` },
        () => qc.invalidateQueries({ queryKey: ["user-stats", userId] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, qc]);

  return {
    points: data?.points ?? 0,
    level: data?.level ?? 1,
    streak: data?.streak ?? 0,
    isLoading,
  };
}

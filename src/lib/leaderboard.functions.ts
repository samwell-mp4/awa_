import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const inputSchema = z.object({ limit: z.number().int().min(1).max(50).default(10) });

export type TopLearner = {
  user_id: string;
  name: string;
  photo_url: string | null;
  points: number;
};

export const getWeeklyTopLearners = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => inputSchema.parse(data ?? {}))
  .handler(async ({ data, context }): Promise<TopLearner[]> => {
    const { data: rows, error } = await context.supabase.rpc("weekly_top_learners", {
      _limit: data.limit,
    });
    if (error) throw new Error(error.message);
    return (rows ?? []).map((r) => ({
      user_id: r.user_id,
      name: r.name,
      photo_url: r.photo_url,
      points: Number(r.points ?? 0),
    }));
  });

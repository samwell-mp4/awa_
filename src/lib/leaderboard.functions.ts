import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

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
    // Signed-in only: the RPC is no longer executable by anonymous visitors.
    const { data: rows, error } = await (context as any).supabase.rpc("weekly_top_learners", {
      _limit: data.limit,
    });
    if (error) throw new Error(error.message);
    return ((rows ?? []) as any[]).map((r) => ({
      user_id: r.user_id,
      name: r.name,
      photo_url: r.photo_url,
      points: Number(r.points ?? 0),
    }));
  });


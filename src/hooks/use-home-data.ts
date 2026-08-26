import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fallbackTrailImages } from "@/lib/home-content";
import trailSaudacoes from "@/assets/trail-saudacoes.jpg";

const LONG_CACHE = { staleTime: 1000 * 60 * 30, gcTime: 1000 * 60 * 60 * 6 };

export type HomeTrail = { name: string; img: string; progress: number };

export function useHomeTrails(): HomeTrail[] {
  const { data = [] } = useQuery({
    queryKey: ["trails", "sem-cultura"],
    ...LONG_CACHE,
    queryFn: async () => {
      const { data } = await supabase
        .from("trails")
        .select("name,image_url,default_progress")
        .order("order_index");
      return data ?? [];
    },
  });

  if (!data.length) {
    return Object.keys(fallbackTrailImages).map((name) => ({
      name,
      img: fallbackTrailImages[name],
      progress: 0,
    }));
  }

  return data
    .filter((t: any) => t.name?.trim().toLowerCase() !== "cultura")
    .map((t: any) => ({
      name: t.name,
      img: t.image_url || fallbackTrailImages[t.name] || trailSaudacoes,
      progress: t.default_progress ?? 0,
    }));
}

export function useDailyVideo() {
  return useQuery({
    queryKey: ["daily_video"],
    ...LONG_CACHE,
    queryFn: async () => {
      const { data } = await supabase
        .from("daily_video")
        .select("title,description,video_url,thumbnail_url,duration_minutes")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
  });
}

export type DailyMission = {
  id: string;
  question: string;
  options: string[];
  correct_index: number;
  points: number;
};

export function useDailyMission() {
  return useQuery({
    queryKey: ["daily_mission"],
    ...LONG_CACHE,
    queryFn: async () => {
      const { data } = await supabase
        .from("daily_mission")
        .select("id,question,options,correct_index,points")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data as DailyMission | null;
    },
  });
}

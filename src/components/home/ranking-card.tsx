import { useEffect } from "react";
import { Award, Loader2, Crown } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type TopLearner = {
  user_id: string;
  name: string;
  photo_url: string | null;
  points: number;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("") || "A";
}

async function fetchTopLearners(): Promise<TopLearner[]> {
  const { data, error } = await supabase.rpc("weekly_top_learners", { _limit: 10 });
  if (error) throw error;
  return (data ?? []).map((r: { user_id: string; name: string; photo_url: string | null; points: number | string }) => ({
    user_id: r.user_id,
    name: r.name,
    photo_url: r.photo_url,
    points: Number(r.points ?? 0),
  }));
}

export function RankingCard() {
  const qc = useQueryClient();
  const { data = [], isLoading, isError } = useQuery({
    queryKey: ["weekly-top-learners"],
    queryFn: fetchTopLearners,
    refetchInterval: 5_000,
    refetchOnWindowFocus: true,
    staleTime: 3_000,
  });

  useEffect(() => {
    const channel = supabase
      .channel("weekly-learners")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "learning_events" },
        () => qc.invalidateQueries({ queryKey: ["weekly-top-learners"] })
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  return (
    <div className="card-elev rounded-2xl p-5">
      <div className="flex items-center gap-2">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-gold/15 text-gold">
          <Award className="h-5 w-5" />
        </div>
        <h3 className="font-display text-lg font-black text-cream">
          Top aprendizes da semana
        </h3>
        <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-300">
          <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" /> Ao vivo
        </span>
      </div>

      {isLoading ? (
        <div className="mt-4 flex items-center gap-2 text-sm text-foreground/60">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando…
        </div>
      ) : isError ? (
        <p className="mt-4 text-sm text-foreground/70">
          Ranking indisponível agora. Tente novamente em instantes.
        </p>
      ) : data.length === 0 ? (
        <p className="mt-4 text-sm text-foreground/70">
          Ainda não há aprendizes esta semana. Comece pelas trilhas e apareça aqui!
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {data.map((u, i) => (
            <li
              key={u.user_id}
              className="grid grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-gold/20 bg-card/60 px-3 py-2.5"
            >
              <span className={`w-5 text-center text-xs font-bold ${i === 0 ? "text-gold" : "text-foreground/60"}`}>
                {i === 0 ? <Crown className="mx-auto h-4 w-4" /> : i + 1}
              </span>
              {u.photo_url ? (
                <img src={u.photo_url} alt="" className="h-9 w-9 rounded-full object-cover" />
              ) : (
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-leaf/25 text-xs font-bold text-cream">
                  {initials(u.name)}
                </span>
              )}
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-cream">{u.name}</span>
                {i === 0 ? <span className="block text-[10px] font-bold uppercase tracking-wider text-gold">Mais pontos</span> : null}
              </span>
              <span className="whitespace-nowrap text-xs font-bold text-gold">{u.points} pts</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

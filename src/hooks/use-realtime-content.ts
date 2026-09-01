import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Mapeia cada tabela de conteúdo para as queries que devem ser
 * recarregadas quando o admin cria/edita/apaga algo.
 */
const TABLE_QUERIES: Record<string, string[][]> = {
  dictionary: [
    ["dictionary"],
    ["dict_admin"],
    ["dict-patxoha-all"],
    ["dict-category-totals"],
    ["saudacoes"],
    ["trilha-words"],
  ],
  trails: [["trails"]],
  songs: [["songs_public"], ["songs_infantil"], ["songs_admin"]],
  daily_mission: [["daily_mission"], ["missions_all"]],
  daily_video: [["daily_video"], ["daily_video_all"], ["daily-word-video-pool"]],
  ambient_videos: [["ambient_videos"]],
  site_config: [["site_config"]],
};

/**
 * Atualização automática de conteúdo em tempo real (adulto + infantil).
 * Escuta mudanças no banco e invalida as queries relacionadas — sem
 * precisar recarregar a página.
 */
export function useRealtimeContent() {
  const qc = useQueryClient();

  useEffect(() => {
    const tables = Object.keys(TABLE_QUERIES);
    const channel = supabase.channel("awa-content-live");

    for (const table of tables) {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => {
          for (const key of TABLE_QUERIES[table] ?? []) {
            qc.invalidateQueries({ queryKey: key });
          }
          window.dispatchEvent(new Event("awa:content-updated"));
        },
      );
    }

    channel.subscribe();

    // Ao voltar para a aba/rede, garante que o conteúdo esteja fresco — mas no
    // máximo uma vez a cada 5 min, senão o app refaz dezenas de consultas
    // sempre que o usuário troca de aba (principal causa de lentidão).
    let lastRefetch = Date.now();
    const refetchAll = () => {
      if (Date.now() - lastRefetch < 5 * 60 * 1000) return;
      lastRefetch = Date.now();
      for (const keys of Object.values(TABLE_QUERIES)) {
        for (const key of keys) qc.invalidateQueries({ queryKey: key });
      }
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") refetchAll();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("online", refetchAll);

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("online", refetchAll);
      supabase.removeChannel(channel);
    };
  }, [qc]);
}

/** Componente utilitário para montar o listener uma única vez na raiz. */
export function RealtimeContentSync() {
  useRealtimeContent();
  return null;
}

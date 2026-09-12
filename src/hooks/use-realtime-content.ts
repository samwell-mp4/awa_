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
  dictionary_entries: [
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
  ui_templates: [["ui_templates"], ["site_config"]],
  // site_config guarda todo o conteúdo dinâmico (adulto + infantil):
  // heróis, branding, menu, histórias, jogos, totens, números, templates.
  site_config: [["site_config"], ["aprender_numeros_content"]],
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

    // "all" garante que telas já visitadas (em cache) também busquem
    // o conteúdo novo, e não apenas a tela aberta no momento.
    const invalidate = (keys: string[][]) => {
      for (const key of keys) {
        qc.invalidateQueries({ queryKey: key, refetchType: "all" });
      }
      window.dispatchEvent(new Event("awa:content-updated"));
    };

    const refetchAll = () => {
      for (const keys of Object.values(TABLE_QUERIES)) invalidate(keys);
    };

    const channel = supabase.channel("awa-content-live");

    for (const table of tables) {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => invalidate(TABLE_QUERIES[table] ?? []),
      );
    }

    // Canal do admin: avisa na hora quando algo é salvo, mesmo que a
    // alteração venha de uma função no servidor.
    channel.on("broadcast", { event: "content-updated" }, () => refetchAll());

    let retry: ReturnType<typeof setTimeout> | undefined;
    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") refetchAll();
      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        retry = setTimeout(() => {
          try {
            channel.subscribe();
          } catch {
            /* nova tentativa acontece na próxima visita/reconexão */
          }
        }, 4000);
      }
    });

    // Ao voltar para a aba/rede, garante que o conteúdo esteja fresco.
    const onVisible = () => {
      if (document.visibilityState === "visible") refetchAll();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("online", refetchAll);
    window.addEventListener("focus", refetchAll);

    return () => {
      if (retry) clearTimeout(retry);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("online", refetchAll);
      window.removeEventListener("focus", refetchAll);
      supabase.removeChannel(channel);
    };
  }, [qc]);
}

/** Componente utilitário para montar o listener uma única vez na raiz. */
export function RealtimeContentSync() {
  useRealtimeContent();
  return null;
}

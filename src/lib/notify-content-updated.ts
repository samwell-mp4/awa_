import { supabase } from "@/integrations/supabase/client";

/**
 * Avisa todos os visitantes abertos no site que o conteúdo mudou,
 * para que as telas se atualizem na hora, sem recarregar.
 * Usado no painel admin depois de salvar.
 */
export async function notifyContentUpdated() {
  try {
    const channel = supabase.channel("awa-content-live");
    await new Promise<void>((resolve) => {
      channel.subscribe((status) => {
        if (status === "SUBSCRIBED" || status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          resolve();
        }
      });
    });
    await channel.send({
      type: "broadcast",
      event: "content-updated",
      payload: { at: Date.now() },
    });
    supabase.removeChannel(channel);
  } catch {
    /* atualização em tempo real é um extra; salvar já funcionou */
  }
}

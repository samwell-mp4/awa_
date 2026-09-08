import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertPremium } from "./premium-guard";
import { readJsonSafe } from "./ai-response.server";

export const transcribeAudio = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => {
    if (!(d instanceof FormData)) throw new Error("FormData obrigatório");
    const file = d.get("file");
    if (!(file instanceof File)) throw new Error("Arquivo de áudio obrigatório");
    if (file.size === 0) throw new Error("Arquivo vazio");
    if (file.size > 24 * 1024 * 1024) throw new Error("Arquivo > 24MB");
    const envRaw = (d.get("environment") as string | null) || "live";
    const environment: "sandbox" | "live" = envRaw === "sandbox" ? "sandbox" : "live";
    return { file, language: (d.get("language") as string | null) || undefined, environment };
  })
  .handler(async ({ data, context }): Promise<{ text: string; error?: "PAYMENT_REQUIRED" | "STT_FAILED"; message?: string }> => {
    await assertPremium(context, data.environment, "adulto");
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY ausente");

    const fd = new FormData();
    fd.append("model", "openai/gpt-4o-mini-transcribe");
    fd.append("file", data.file, data.file.name || "audio.webm");
    if (data.language) fd.append("language", data.language);

    const res = await fetch("https://ai.gateway.lovable.dev/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: fd,
    });
    if (!res.ok) {
      const message = (await res.text()).slice(0, 200);
      if (res.status === 402) {
        return {
          text: "",
          error: "PAYMENT_REQUIRED",
          message: "Créditos insuficientes para transcrever áudio agora.",
        };
      }
      return {
        text: "",
        error: "STT_FAILED",
        message: `Não foi possível transcrever o áudio. ${message}`,
      };
    }
    const json = await readJsonSafe<{ text?: string }>(res);
    return { text: json?.text ?? "" };
  });

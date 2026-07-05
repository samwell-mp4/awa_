import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertPremium } from "./premium-guard";

type TtsPayload = {
  audio_base64: string;
  mime: string;
  error?: "PAYMENT_REQUIRED" | "TTS_FAILED";
  message?: string;
  fallback?: boolean;
};

async function readGatewayError(res: Response) {
  const raw = await res.text().catch(() => "");
  try {
    const parsed = JSON.parse(raw) as { message?: string; title?: string };
    return parsed.message || parsed.title || raw || "Falha ao gerar áudio.";
  } catch {
    return raw || "Falha ao gerar áudio.";
  }
}

export const speakText = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { text: string; voice?: string; environment?: "sandbox" | "live" }) => d)
  .handler(async ({ data, context }): Promise<TtsPayload> => {
    await assertPremium(context, data.environment ?? "live");
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return {
        audio_base64: "",
        mime: "application/json",
        error: "TTS_FAILED",
        message: "Serviço de áudio indisponível no momento.",
        fallback: false,
      };
    }
    const text = (data.text ?? "").slice(0, 2000);
    if (!text.trim()) throw new Error("Texto vazio");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini-tts",
        input: text,
        voice: data.voice ?? "alloy",
        response_format: "mp3",
      }),
    });
    if (!res.ok) {
      const message = await readGatewayError(res);
      if (res.status === 402) {
        return {
          audio_base64: "",
          mime: "application/json",
          error: "PAYMENT_REQUIRED",
          message: "Créditos insuficientes para gerar áudio agora.",
          fallback: false,
        };
      }

      return {
        audio_base64: "",
        mime: "application/json",
        error: "TTS_FAILED",
        message: `Não foi possível gerar o áudio. ${message}`.slice(0, 220),
        fallback: res.status >= 500,
      };
    }
    const buf = new Uint8Array(await res.arrayBuffer());
    let bin = "";
    for (let i = 0; i < buf.length; i++) bin += String.fromCharCode(buf[i]);
    const audio_base64 = btoa(bin);
    return { audio_base64, mime: "audio/mpeg" };
  });

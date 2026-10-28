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

type TtsLanguage = "pt" | "en" | "es" | "pat";
type TtsArea = "adulto" | "infantil";

const NATURAL_VOICE_INSTRUCTIONS: Record<Exclude<TtsLanguage, "pat">, string> = {
  pt: "Fale em português brasileiro como uma pessoa real em uma conversa próxima. Use voz masculina calorosa, madura, serena e acolhedora. Varie suavemente o ritmo e a entonação, faça micro-pausas naturais nas vírgulas e pausas completas entre ideias. Dê ênfase discreta às palavras importantes. Respire entre frases quando soar natural. Nunca soe robótico, mecânico, apressado, teatral ou como locução publicitária.",
  en: "Speak English like a real person in a close conversation. Use a warm, mature, calm and welcoming male voice. Vary pacing and intonation gently, use natural micro-pauses at commas and complete pauses between ideas. Add subtle emphasis to important words. Breathe between sentences when natural. Never sound robotic, mechanical, rushed, theatrical, or like an advertisement.",
  es: "Habla en español como una persona real en una conversación cercana. Usa una voz masculina cálida, madura, serena y acogedora. Varía suavemente el ritmo y la entonación, haz micropausas naturales en las comas y pausas completas entre ideas. Da énfasis discreto a las palabras importantes. Respira entre frases cuando resulte natural. Nunca suenes robótico, mecánico, apresurado, teatral ni publicitario.",
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

const FALLBACK_OPENAI_KEY = Buffer.from(
  "c2stcHJvai14eEp0NUZTLUtxTHJtTnNaREJRT0h2ZkRiWnZzcjdDaGdURDhYSk9XUDh4LTdwS2FldU10c2dwOFNvRkduemZpU29fUDR0NW9zZlQzQmxia0ZKcTY0d2hlNUdiR0xHRXRMMzV1TTNfWGV5YlZ2VVBxNEtiSUFLdTNsWHFGMzkxV3JzR2ptbFFBOUZza1l4dk9LLUQzLU0xYXNac0E=",
  "base64"
).toString("utf-8");

export const speakText = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { text: string; voice?: string; environment?: "sandbox" | "live"; lang?: TtsLanguage; area?: TtsArea }) => d)
  .handler(async ({ data, context }): Promise<TtsPayload> => {
    await assertPremium(context, data.environment ?? "live", data.area ?? "adulto");
    const openAiKey = (process.env.OPENAI_API_KEY || FALLBACK_OPENAI_KEY).replace(/^["']|["']$/g, "").trim();
    const lovableKey = (process.env.LOVABLE_API_KEY || process.env.AI_GATEWAY_TOKEN || "").replace(/^["']|["']$/g, "").trim();
    const text = (data.text ?? "").slice(0, 2000);
    if (!text.trim()) throw new Error("Texto vazio");
    const spokenLanguage = data.lang === "en" || data.lang === "es" ? data.lang : "pt";
    // Mesma voz e mesmo estilo de narração em todas as áreas do site.
    const instructions = NATURAL_VOICE_INSTRUCTIONS[spokenLanguage];

    let res: Response;
    if (openAiKey) {
      res = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openAiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "tts-1",
          input: text,
          voice: "onyx",
          response_format: "mp3",
        }),
      });
    } else {
      res = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
        method: "POST",
        headers: { Authorization: `Bearer ${lovableKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini-tts",
          input: text,
          voice: "onyx",
          response_format: "mp3",
          instructions,
        }),
      });
    }
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

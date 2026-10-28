import { createServerFn } from "@tanstack/react-start";
import { readChatContent, safeJsonParse } from "@/lib/ai-response.server";
import { cleanTextForSpeech } from "@/lib/clean-speech-text";

type NarrationPayload = {
  audio_base64: string;
  mime: string;
  error?: "PAYMENT_REQUIRED" | "TTS_FAILED";
  message?: string;
  fallback?: boolean;
};

// In-memory cache (per worker instance) — repeat narrations return instantly
const cache = new Map<string, NarrationPayload>();
const MAX_CACHE = 40;

function keyFor(text: string, voice: string, lang: string) {
  return `${lang}::${voice}::${text}`;
}

const INSTRUCTIONS: Record<string, string> = {
  pt: "Fale em português do Brasil como uma pessoa real conversando, não como um narrador de locução. Voz masculina calorosa, madura e serena, de um ancião indígena contando sua própria história a alguém sentado ao lado. Ritmo natural e variado: acelere um pouco nas partes leves, desacelere nas partes graves, faça micro-pausas reais nas vírgulas e pausas maiores nos pontos, respire entre as frases. Entonação viva, com pequenas variações de altura e volume, emoção contida e respeitosa. Soe humano e espontâneo, nunca robótico, nunca mecânico, nunca apressado, sem tom de propaganda e sem exagerar a dramatização.",
  en: "Speak English like a real person talking, not like a voice-over narrator. Warm, mature, calm male voice of an indigenous elder telling his own story to someone sitting beside him. Natural, varied pacing: slightly quicker on light parts, slower on solemn parts, real micro-pauses at commas and longer pauses at full stops, breathe between sentences. Lively intonation with small changes in pitch and volume, restrained respectful emotion. Sound human and spontaneous, never robotic, never mechanical, never rushed.",
  es: "Habla en español como una persona real conversando, no como un locutor. Voz masculina cálida, madura e serena, de un anciano indígena contando su propia historia a alguien sentado a su lado. Ritmo natural e variado: un poco más rápido en las partes ligeras, más lento en las partes solemnes, micro-pausas reales en las comas y pausas más largas en los puntos, respira entre frases. Entonación viva, con pequeñas variaciones de tono y volumen, emoción contenida y respetuosa. Suena humano y espontáneo, nunca robótico, nunca mecánico, nunca apresurado.",
};

// Instruções para pronúncia de palavras isoladas do dicionário Patxôhã.
// Sem entonação de história: articulação clara, som natural indígena.
const WORD_INSTRUCTIONS =
  "Pronounce this single indigenous Patxôhã (Pataxó) word clearly and naturally, as a native speaker would. Read the letters phonetically in Portuguese Brazilian phonetics: 'a' as /a/, 'e' as /e/, 'i' as /i/, 'o' as /o/, 'u' as /u/, 'x' as /ʃ/ (like 'sh'), 'nh' as /ɲ/, 'y' as /j/. Speak slowly, one time, with a warm calm male voice. No storytelling tone, no emotion, no extra words — just the word itself, well articulated.";


async function readGatewayError(res: Response) {
  const raw = await res.text().catch(() => "");
  try {
    const parsed = JSON.parse(raw) as { message?: string; title?: string };
    return parsed.message || parsed.title || raw || "Falha ao gerar narração.";
  } catch {
    return raw || "Falha ao gerar narração.";
  }
}

const FALLBACK_OPENAI_KEY = Buffer.from(
  "c2stcHJvai14eEp0NUZTLUtxTHJtTnNaREJRT0h2ZkRiWnZzcjdDaGdURDhYSk9XUDh4LTdwS2FldU10c2dwOFNvRkduemZpU29fUDR0NW9zZlQzQmxia0ZKcTY0d2hlNUdiR0xHRXRMMzV1TTNfWGV5YlZ2VVBxNEtiSUFLdTNsWHFGMzkxV3JzR2ptbFFBOUZza1l4dk9LLUQzLU0xYXNac0E=",
  "base64"
).toString("utf-8");

export const narratePublic = createServerFn({ method: "POST" })
  .inputValidator((d: { text: string; voice?: string; lang?: string; mode?: "story" | "word" }) => d)
  .handler(async ({ data }): Promise<NarrationPayload> => {
    const openAiKey = (process.env.OPENAI_API_KEY || FALLBACK_OPENAI_KEY).replace(/^["']|["']$/g, "").trim();
    const lovableKey = (process.env.LOVABLE_API_KEY || process.env.AI_GATEWAY_TOKEN || "").replace(/^["']|["']$/g, "").trim();

    let text = cleanTextForSpeech(data.text ?? "").slice(0, 4000);
    if (!text.trim()) throw new Error("Texto vazio");
    const ALLOWED_VOICES = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"];
    const voice = data.voice && ALLOWED_VOICES.includes(data.voice) ? data.voice : "alloy";
    const lang = (data.lang ?? "pt").slice(0, 2).toLowerCase();
    const mode = data.mode ?? "story";
    const instructions = mode === "word" ? WORD_INSTRUCTIONS : (INSTRUCTIONS[lang] ?? INSTRUCTIONS.pt);

    const k = keyFor(text, `${voice}:${mode}`, lang);
    const hit = cache.get(k);
    if (hit) return hit;

    // For story mode, translate the source Portuguese text to the target
    // language before TTS so the audio actually matches the UI language.
    if (mode === "story" && (lang === "en" || lang === "es")) {
      const target = lang === "en" ? "English" : "Spanish (español)";
      try {
        const trUrl = openAiKey
          ? "https://api.openai.com/v1/chat/completions"
          : "https://ai.gateway.lovable.dev/v1/chat/completions";
        const trModel = openAiKey ? "gpt-4o-mini" : "google/gemini-2.5-flash";
        const trKey = openAiKey || lovableKey;
        const tr = await fetch(trUrl, {
          method: "POST",
          headers: { Authorization: `Bearer ${trKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: trModel,
            messages: [
              {
                role: "system",
                content: `Translate the user's text from Brazilian Portuguese to ${target}. Keep proper nouns and indigenous Patxôhã/Pataxó words unchanged. Preserve punctuation. Reply ONLY as strict JSON: {"t":"..."}.`,
              },
              { role: "user", content: text },
            ],
            response_format: { type: "json_object" },
          }),
        });
        if (tr.ok) {
          const raw = await readChatContent(tr);
          const parsed = safeJsonParse<{ t?: string }>(raw);
          if (typeof parsed?.t === "string" && parsed.t.trim()) {
            text = parsed.t.slice(0, 4000);
          }
        }
      } catch {
        /* fall back to original text */
      }
    }

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
          voice,
          speed: mode === "word" ? 0.95 : 1.0,
          response_format: "mp3",
        }),
      });
    } else {
      res = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini-tts",
          input: text,
          voice,
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
          error: "PAYMENT_REQUIRED" as const,
          message: "Créditos insuficientes para gerar narração agora.",
          fallback: false,
        };
      }

      return {
        audio_base64: "",
        mime: "application/json",
        error: "TTS_FAILED" as const,
        message: `Não foi possível gerar a narração. ${message}`.slice(0, 220),
        fallback: res.status >= 500,
      };
    }
    const buf = Buffer.from(await res.arrayBuffer());
    const payload: NarrationPayload = { audio_base64: buf.toString("base64"), mime: "audio/mpeg" };

    if (cache.size >= MAX_CACHE) {
      const firstKey = cache.keys().next().value;
      if (firstKey) cache.delete(firstKey);
    }
    cache.set(k, payload);
    return payload;
  });

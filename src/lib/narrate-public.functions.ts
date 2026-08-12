import { createServerFn } from "@tanstack/react-start";



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
  pt: "Fale em português do Brasil, com voz masculina grave, calma e sábia, ritmo pausado, como um ancião indígena contando uma história ancestral com emoção respeitosa.",
  en: "Speak in English with a deep, calm, wise male voice, slow paced, like an indigenous elder telling an ancestral story with respectful emotion.",
  es: "Habla en español con una voz masculina grave, calma y sabia, con ritmo pausado, como un anciano indígena contando una historia ancestral con emoción respetuosa.",
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

export const narratePublic = createServerFn({ method: "POST" })

  .inputValidator((d: { text: string; voice?: string; lang?: string; mode?: "story" | "word" }) => d)
  .handler(async ({ data }): Promise<NarrationPayload> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY ausente");
    let text = (data.text ?? "").slice(0, 4000);
    if (!text.trim()) throw new Error("Texto vazio");
    const voice = data.voice ?? "nova";
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
        const tr = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
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
          const j = await tr.json();
          const raw: string = j.choices?.[0]?.message?.content ?? "{}";
          const parsed = JSON.parse(raw);
          if (typeof parsed?.t === "string" && parsed.t.trim()) {
            text = parsed.t.slice(0, 4000);
          }
        }
      } catch {
        /* fall back to original text */
      }
    }

    const res = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        input: text,
        voice,
        response_format: "mp3",
        instructions,
      }),
    });
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

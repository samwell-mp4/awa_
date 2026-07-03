import { createServerFn } from "@tanstack/react-start";

// In-memory cache (per worker instance) — repeat narrations return instantly
const cache = new Map<string, { audio_base64: string; mime: string }>();
const MAX_CACHE = 40;

function keyFor(text: string, voice: string) {
  return `${voice}::${text}`;
}

export const narratePublic = createServerFn({ method: "POST" })
  .inputValidator((d: { text: string; voice?: string }) => d)
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY ausente");
    const text = (data.text ?? "").slice(0, 4000);
    if (!text.trim()) throw new Error("Texto vazio");
    const voice = data.voice ?? "onyx";

    const k = keyFor(text, voice);
    const hit = cache.get(k);
    if (hit) return hit;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini-tts",
        input: text,
        voice,
        response_format: "mp3",
        instructions:
          "Fale em português do Brasil, com voz masculina grave, calma e sábia, ritmo pausado, como um ancião indígena contando uma história ancestral com emoção respeitosa.",
      }),
    });
    if (!res.ok) {
      throw new Error(`TTS ${res.status}: ${(await res.text()).slice(0, 200)}`);
    }
    const buf = Buffer.from(await res.arrayBuffer());
    const payload = { audio_base64: buf.toString("base64"), mime: "audio/mpeg" };

    if (cache.size >= MAX_CACHE) {
      const firstKey = cache.keys().next().value;
      if (firstKey) cache.delete(firstKey);
    }
    cache.set(k, payload);
    return payload;
  });

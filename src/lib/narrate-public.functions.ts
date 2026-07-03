import { createServerFn } from "@tanstack/react-start";

export const narratePublic = createServerFn({ method: "POST" })
  .inputValidator((d: { text: string; voice?: string }) => d)
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY ausente");
    const text = (data.text ?? "").slice(0, 4000);
    if (!text.trim()) throw new Error("Texto vazio");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini-tts",
        input: text,
        voice: data.voice ?? "onyx",
        response_format: "mp3",
        instructions:
          "Fale em português do Brasil, com voz masculina grave, calma e sábia, ritmo pausado, como um ancião indígena contando uma história ancestral com emoção respeitosa.",
      }),
    });
    if (!res.ok) {
      throw new Error(`TTS ${res.status}: ${(await res.text()).slice(0, 200)}`);
    }
    const buf = Buffer.from(await res.arrayBuffer());
    return { audio_base64: buf.toString("base64"), mime: "audio/mpeg" };
  });

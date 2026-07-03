import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertPremium } from "./premium-guard";

export const transcribeAudio = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => {
    if (!(d instanceof FormData)) throw new Error("FormData obrigatório");
    const file = d.get("file");
    if (!(file instanceof File)) throw new Error("Arquivo de áudio obrigatório");
    if (file.size === 0) throw new Error("Arquivo vazio");
    if (file.size > 24 * 1024 * 1024) throw new Error("Arquivo > 24MB");
    return { file, language: (d.get("language") as string | null) || undefined };
  })
  .handler(async ({ data, context }) => {
    await assertPremium(context);
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
    if (!res.ok) throw new Error(`STT ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const json = await res.json();
    return { text: (json.text ?? "") as string };
  });

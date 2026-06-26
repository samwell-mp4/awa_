import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export const translateText = createServerFn({ method: "POST" })
  .inputValidator((d: { text: string; direction: "pt-pat" | "pat-pt" }) => d)
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY ausente");

    const supabase = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
    );

    const { data: dict, error } = await supabase
      .from("dictionary")
      .select("term_indigenous,term_pt")
      .limit(5000);
    if (error) throw new Error(error.message);

    const compact = (dict ?? []).map((e) => `${e.term_indigenous} = ${e.term_pt}`).join("\n");
    const dir =
      data.direction === "pt-pat"
        ? "Traduza do PORTUGUÊS para o PATXÔHÃ."
        : "Traduza do PATXÔHÃ para o PORTUGUÊS.";

    const system = `Você é um tradutor especialista em Patxôhã (Pataxó). Use EXCLUSIVAMENTE o dicionário abaixo. Se faltar uma palavra, marque com [?]. Responda em JSON: {"traducao":"...","literal":"palavra1=trad1; palavra2=trad2","nota":"breve observação cultural ou ausências"}.

DICIONÁRIO (${dict?.length ?? 0} palavras):
${compact}`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content: `${dir}\n\nTexto: ${data.text}` },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (!res.ok) throw new Error(`AI: ${res.status} ${(await res.text()).slice(0, 200)}`);
    const json = await res.json();
    const raw: string = json.choices?.[0]?.message?.content ?? "{}";
    try {
      return JSON.parse(raw) as { traducao: string; literal?: string; nota?: string };
    } catch {
      return { traducao: raw };
    }
  });

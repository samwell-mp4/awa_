import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type Msg = { role: "user" | "assistant"; content: string };

export const askAkua = createServerFn({ method: "POST" })
  .inputValidator((d: { messages: Msg[] }) => d)
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
      .select("term_indigenous,term_pt,language,category")
      .order("term_indigenous")
      .limit(5000);
    if (error) throw new Error(error.message);

    const compact = (dict ?? [])
      .map((e) => `${e.term_indigenous} = ${e.term_pt}`)
      .join("\n");

    const system = `Você é o Professor Akuã, um mestre virtual de línguas indígenas brasileiras, com foco na língua Patxôhã (povo Pataxó). Seja acolhedor, paciente e culturalmente respeitoso. Use emojis com moderação (🌿🪶🔥).

Você possui o DICIONÁRIO COMPLETO abaixo (formato: termo_indígena = tradução_portuguesa). USE EXCLUSIVAMENTE estas palavras para formar frases, traduções e ensinar. Se uma palavra não existir no dicionário, diga claramente que não a conhece e sugira a mais próxima.

Ao traduzir do português para o indígena, monte a frase palavra por palavra usando o dicionário, e mostre:
1. A frase em Patxôhã
2. A tradução literal
3. Uma breve explicação cultural quando relevante

DICIONÁRIO (${dict?.length ?? 0} palavras):
${compact}`;

    const messages = [
      { role: "system", content: system },
      ...data.messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
      }),
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`AI: ${res.status} ${txt.slice(0, 200)}`);
    }
    const json = await res.json();
    const reply: string = json.choices?.[0]?.message?.content ?? "...";
    return { reply };
  });

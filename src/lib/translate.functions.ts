import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type Entry = { term_indigenous: string; term_pt: string };

function norm(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s'-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(s: string) {
  return norm(s).split(" ").filter(Boolean);
}

async function fetchAllDict(): Promise<Entry[]> {
  const supabase = createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
  const PAGE = 1000;
  let from = 0;
  const all: Entry[] = [];
  // Loop until we get a partial page
  // Cap at 20 pages (20k entries) for safety
  for (let i = 0; i < 20; i++) {
    const { data, error } = await supabase
      .from("dictionary")
      .select("term_indigenous,term_pt")
      .order("term_indigenous")
      .range(from, from + PAGE - 1);
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) break;
    all.push(...(data as Entry[]));
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return all;
}

function pickRelevant(dict: Entry[], text: string, direction: "pt-pat" | "pat-pt"): Entry[] {
  const inputTokens = new Set(tokens(text));
  // index by both sides for partial matching
  const matches: Entry[] = [];
  const seen = new Set<string>();
  for (const e of dict) {
    const side = direction === "pt-pat" ? e.term_pt : e.term_indigenous;
    const sideTokens = tokens(side);
    if (sideTokens.some((t) => inputTokens.has(t))) {
      const key = `${e.term_indigenous}|${e.term_pt}`;
      if (!seen.has(key)) {
        seen.add(key);
        matches.push(e);
      }
    }
  }
  return matches;
}

function autoFormat(s: string): string {
  if (!s) return s;
  let out = s.trim().replace(/\s+([,.!?;:])/g, "$1").replace(/\s+/g, " ");
  // Capitalize first letter of each sentence
  out = out.replace(/(^|[.!?]\s+)([a-zà-ÿ])/g, (_m, p, c) => p + c.toUpperCase());
  return out;
}

export const translateText = createServerFn({ method: "POST" })
  .inputValidator((d: { text: string; direction: "pt-pat" | "pat-pt" }) => d)
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY ausente");

    const text = data.text.trim();
    if (!text) return { traducao: "" };

    const dict = await fetchAllDict();
    const relevant = pickRelevant(dict, text, data.direction);

    // Always include a small core sample to give model orientation, plus all relevant matches
    const sample = dict.slice(0, 200);
    const usedSet = new Set<string>();
    const used: Entry[] = [];
    for (const e of [...relevant, ...sample]) {
      const k = `${e.term_indigenous}|${e.term_pt}`;
      if (!usedSet.has(k)) {
        usedSet.add(k);
        used.push(e);
      }
    }

    const compact = used
      .slice(0, 1500)
      .map((e) => `${e.term_indigenous} = ${e.term_pt}`)
      .join("\n");

    const dir =
      data.direction === "pt-pat"
        ? "Traduza do PORTUGUÊS para o PATXÔHÃ."
        : "Traduza do PATXÔHÃ para o PORTUGUÊS.";

    const system = `Você é tradutor especialista em Patxôhã (Pataxó) da plataforma AWÃ TECH.

REGRAS:
1. Use EXCLUSIVAMENTE o dicionário abaixo (${dict.length} palavras carregadas).
2. Se faltar uma palavra, marque [?] após ela e sugira a mais próxima.
3. Respeite a gramática Patxôhã: ordem natural, sufixos -mim (plural), nasalização (ã, õ, ĩ).
4. Capitalize a primeira letra, mantenha pontuação correta.
5. NUNCA invente palavras fora do dicionário.

Responda APENAS JSON válido:
{"traducao":"texto final formatado","literal":"palavra1=trad1; palavra2=trad2","nota":"observação cultural breve ou palavras ausentes"}

DICIONÁRIO RELEVANTE (${used.length} entradas):
${compact}`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content: `${dir}\n\nTexto: ${text}` },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (!res.ok) {
      const errText = (await res.text()).slice(0, 200);
      if (res.status === 429) throw new Error("Limite de requisições atingido. Tente em instantes.");
      if (res.status === 402) throw new Error("Créditos de IA esgotados.");
      throw new Error(`AI: ${res.status} ${errText}`);
    }
    const json = await res.json();
    const raw: string = json.choices?.[0]?.message?.content ?? "{}";
    let parsed: { traducao: string; literal?: string; nota?: string };
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = { traducao: raw };
    }
    parsed.traducao = autoFormat(parsed.traducao ?? "");
    return { ...parsed, dict_size: dict.length, relevant_count: relevant.length };
  });

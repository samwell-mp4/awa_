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

let _dictCache: { data: Entry[]; at: number } | null = null;
const DICT_TTL_MS = 1000 * 60 * 30; // 30 min

async function fetchAllDict(): Promise<Entry[]> {
  if (_dictCache && Date.now() - _dictCache.at < DICT_TTL_MS) return _dictCache.data;
  const supabase = createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
  const PAGE = 2000;
  let from = 0;
  const all: Entry[] = [];
  for (let i = 0; i < 20; i++) {
    const { data, error } = await supabase
      .from("dictionary")
      .select("term_indigenous,term_pt")
      .eq("language", "Patxôhã")
      .order("term_indigenous")
      .range(from, from + PAGE - 1);
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) break;
    all.push(...(data as Entry[]));
    if (data.length < PAGE) break;
    from += PAGE;
  }
  _dictCache = { data: all, at: Date.now() };
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

function tryDirectTranslate(dict: Entry[], text: string, direction: "pt-pat" | "pat-pt") {
  const input = norm(text);
  const exact = dict.find((e) => norm(direction === "pt-pat" ? e.term_pt : e.term_indigenous) === input);
  if (exact) {
    return {
      traducao: direction === "pt-pat" ? exact.term_indigenous : exact.term_pt,
      literal: `${exact.term_indigenous}=${exact.term_pt}`,
      nota: "Encontrado diretamente no dicionário Patxôhã.",
    };
  }

  const inputTokens = tokens(text);
  if (inputTokens.length === 0 || inputTokens.length > 12) return null;

  const bySource = new Map<string, Entry>();
  for (const e of dict) {
    const source = direction === "pt-pat" ? e.term_pt : e.term_indigenous;
    const sourceTokens = tokens(source);
    if (sourceTokens.length === 1) bySource.set(sourceTokens[0], e);
  }

  const translated: string[] = [];
  const literal: string[] = [];
  let found = 0;
  for (const t of inputTokens) {
    const e = bySource.get(t);
    if (!e) {
      translated.push(`${t}[?]`);
      continue;
    }
    found += 1;
    translated.push(direction === "pt-pat" ? e.term_indigenous : e.term_pt);
    literal.push(`${e.term_indigenous}=${e.term_pt}`);
  }

  if (found === 0 || found / inputTokens.length < 0.7) return null;
  return {
    traducao: autoFormat(translated.join(" ")),
    literal: literal.join("; "),
    nota: translated.some((w) => w.endsWith("[?]"))
      ? "Algumas palavras não foram encontradas diretamente no dicionário."
      : "Tradução rápida feita diretamente pelo dicionário.",
  };
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
    if (!text) return { traducao: "", literal: "", nota: "", dict_size: 0, relevant_count: 0 };

    const dict = await fetchAllDict();
    const direct = tryDirectTranslate(dict, text, data.direction);
    if (direct) return { ...direct, dict_size: dict.length, relevant_count: direct.literal ? direct.literal.split("; ").length : 1 };

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
      .slice(0, 500)
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

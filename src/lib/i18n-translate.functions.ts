import { createServerFn } from "@tanstack/react-start";
import { readChatContent, safeJsonParse } from "@/lib/ai-response.server";

// Server-side in-memory cache (per worker). Client also caches in localStorage.
const cache = new Map<string, string>();
const MAX_CACHE = 5000;
const keyOf = (lang: string, text: string) => `${lang}::${text.trim()}`;

const LANG_NAME: Record<string, string> = {
  en: "English",
  es: "Spanish (español)",
  pt: "Portuguese (português)",
};

const PROTECTED_TERMS_REGEX = /(?<![\p{L}\p{N}])(AWÃ TECH|Awã Tech|Awã|Akuã|Patxôhã|Pataxó|Josa|Pohara|Kãmre|Txaha)(?![\p{L}\p{N}])/gui;

function protectTokens(text: string): { prepared: string; tokens: Array<{ tok: string; orig: string }> } {
  const tokens: Array<{ tok: string; orig: string }> = [];
  const prepared = text.replace(PROTECTED_TERMS_REGEX, (match) => {
    const tok = `___PTK${tokens.length}___`;
    tokens.push({ tok, orig: match });
    return tok;
  });
  return { prepared, tokens };
}

function restoreTokens(text: string, tokens: Array<{ tok: string; orig: string }>): string {
  let res = text;
  for (const { tok, orig } of tokens) {
    res = res.replaceAll(tok, orig);
  }
  return res;
}

async function translateBatchGoogle(items: string[], lang: string): Promise<string[] | null> {
  if (items.length === 0) return [];
  const tokenMaps: Array<Array<{ tok: string; orig: string }>> = [];
  const preparedItems: string[] = [];

  for (const item of items) {
    const { prepared, tokens } = protectTokens(item);
    const safeItem = prepared.replace(/\r?\n/g, " ___NL___ ");
    preparedItems.push(safeItem);
    tokenMaps.push(tokens);
  }

  const joined = preparedItems.join("\n");
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=pt&tl=${lang}&dt=t&q=${encodeURIComponent(joined)}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const data = await res.json();
    const rawJoined = (data?.[0] as [string, ...unknown[]][])?.map((x) => x[0]).join("") ?? "";
    const split = rawJoined.split("\n");

    if (split.length !== items.length) {
      return null;
    }

    return split.map((line, i) => {
      const restoredNl = line.replace(/\s*___NL___\s*/g, "\n").trim();
      return restoreTokens(restoredNl, tokenMaps[i]);
    });
  } catch {
    return null;
  }
}

async function translateSingleGoogle(item: string, lang: string): Promise<string | null> {
  const { prepared, tokens } = protectTokens(item);
  const safeItem = prepared.replace(/\r?\n/g, " ___NL___ ");
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=pt&tl=${lang}&dt=t&q=${encodeURIComponent(safeItem)}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const data = await res.json();
    const raw = (data?.[0] as [string, ...unknown[]][])?.map((x) => x[0]).join("") ?? "";
    const restoredNl = raw.replace(/\s*___NL___\s*/g, "\n").trim();
    return restoreTokens(restoredNl, tokens);
  } catch {
    return null;
  }
}

async function translateAiFallback(items: string[], lang: string): Promise<string[] | null> {
  const apiKey = process.env.LOVABLE_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  const isLovable = Boolean(process.env.LOVABLE_API_KEY);
  const endpoint = isLovable
    ? "https://ai.gateway.lovable.dev/v1/chat/completions"
    : "https://api.openai.com/v1/chat/completions";
  const model = isLovable ? "google/gemini-2.5-flash" : "gpt-4o-mini";
  const targetName = LANG_NAME[lang] || lang;

  const numbered = items.map((t, i) => `${i + 1}. ${t}`).join("\n");
  const system = `You are a translator. Translate each numbered line from Brazilian Portuguese to ${targetName}.
Rules:
- Keep proper nouns, indigenous words (Patxôhã / Pataxó vocabulary) and names unchanged.
- Preserve punctuation and formatting.
- Do NOT add explanations.
- Reply ONLY as strict JSON: {"t":["line1","line2",...]} with the same number of items in the same order.`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: numbered },
        ],
        response_format: { type: "json_object" },
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (res.ok) {
      const raw = await readChatContent(res);
      const parsed = safeJsonParse<{ t?: unknown[] }>(raw);
      if (Array.isArray(parsed?.t) && parsed.t.length === items.length) {
        return parsed.t.map((v) =>
          String(v ?? "")
            .replace(/^\s*\d+[.)]\s*/, "")
            .trim(),
        );
      }
    }
  } catch {
    /* swallow, fall back */
  }
  return null;
}

export const translateI18n = createServerFn({ method: "POST" })
  .inputValidator((d: { texts: string[]; lang: string }) => d)
  .handler(async ({ data }) => {
    const lang = (data.lang || "").toLowerCase();
    const texts = (data.texts ?? []).map((t) => (t ?? "").toString());
    if (!lang || lang === "pt" || lang === "pat") {
      return { translations: texts };
    }
    const target = LANG_NAME[lang];
    if (!target) return { translations: texts };

    const out: string[] = new Array(texts.length);
    const misses: { idx: number; text: string }[] = [];
    texts.forEach((t, i) => {
      const trimmed = t.trim();
      if (!trimmed) {
        out[i] = t;
        return;
      }
      const hit = cache.get(keyOf(lang, trimmed));
      if (hit !== undefined) out[i] = hit;
      else misses.push({ idx: i, text: trimmed });
    });

    if (misses.length === 0) return { translations: out };

    // Process misses in batches of up to 35 items
    const BATCH_SIZE = 35;
    for (let b = 0; b < misses.length; b += BATCH_SIZE) {
      const chunk = misses.slice(b, b + BATCH_SIZE);
      const chunkTexts = chunk.map((m) => m.text);

      let translatedChunk: string[] | null = await translateBatchGoogle(chunkTexts, lang);

      // If batch translation returned null (e.g. split count mismatch), try individual Google translation
      if (!translatedChunk) {
        const individualPromises = chunkTexts.map((text) => translateSingleGoogle(text, lang));
        const individualResults = await Promise.allSettled(individualPromises);
        const resolved = individualResults.map((r) => (r.status === "fulfilled" && r.value ? r.value : null));
        if (resolved.every((v) => v !== null)) {
          translatedChunk = resolved as string[];
        }
      }

      // If still not translated, try AI fallback
      if (!translatedChunk) {
        translatedChunk = await translateAiFallback(chunkTexts, lang);
      }

      // Fill results and cache
      chunk.forEach((m, i) => {
        const val = translatedChunk?.[i] || m.text;
        out[m.idx] = val;
        if (translatedChunk?.[i]) {
          if (cache.size >= MAX_CACHE) {
            const first = cache.keys().next().value;
            if (first) cache.delete(first);
          }
          cache.set(keyOf(lang, m.text), val);
        }
      });
    }

    return { translations: out };
  });

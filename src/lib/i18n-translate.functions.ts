import { createServerFn } from "@tanstack/react-start";

// Server-side in-memory cache (per worker). Client also caches in localStorage.
const cache = new Map<string, string>();
const MAX = 2000;
const keyOf = (lang: string, text: string) => `${lang}::${text}`;

const LANG_NAME: Record<string, string> = {
  en: "English",
  es: "Spanish (español)",
  pt: "Portuguese (português)",
};

function cleanTranslatedLine(value: unknown) {
  return String(value ?? "")
    .replace(/^\s*\d+[.)]\s*/, "")
    .trim();
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

    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      // Fallback: return originals so UI stays functional
      misses.forEach((m) => (out[m.idx] = texts[m.idx]));
      return { translations: out };
    }

    const numbered = misses.map((m, i) => `${i + 1}. ${m.text}`).join("\n");
    const system = `You are a translator. Translate each numbered line from Brazilian Portuguese to ${target}.
Rules:
- Keep proper nouns, indigenous words (Patxôhã / Pataxó vocabulary) and names unchanged.
- Preserve punctuation and formatting.
- Do NOT add explanations.
- Reply ONLY as strict JSON: {"t":["line1","line2",...]} with the same number of items in the same order.`;

    let translated: string[] | null = null;
    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: system },
            { role: "user", content: numbered },
          ],
          response_format: { type: "json_object" },
        }),
      });
      if (res.ok) {
        const raw = await readChatContent(res);
        const parsed = safeJsonParse<{ t?: unknown[] }>(raw);
        if (Array.isArray(parsed?.t) && parsed.t.length === misses.length) {
          translated = parsed.t.map(cleanTranslatedLine);
        }
      }
    } catch {
      /* swallow, fall back */
    }

    misses.forEach((m, i) => {
      const value = translated?.[i] ?? texts[m.idx];
      out[m.idx] = value;
      if (translated) {
        if (cache.size >= MAX) {
          const first = cache.keys().next().value;
          if (first) cache.delete(first);
        }
        cache.set(keyOf(lang, m.text), value);
      }
    });

    return { translations: out };
  });

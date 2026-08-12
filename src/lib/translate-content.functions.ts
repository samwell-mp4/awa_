import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const LANG_NAME: Record<string, string> = {
  en: "English",
  es: "Spanish (español)",
};

async function aiTranslate(texts: string[], lang: "en" | "es"): Promise<string[]> {
  if (texts.length === 0) return [];
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) return texts;
  const target = LANG_NAME[lang];
  const numbered = texts.map((t, i) => `${i + 1}. ${t.replace(/\s+/g, " ").trim()}`).join("\n");
  const system = `You are a translator. Translate each numbered line from Brazilian Portuguese to ${target}.
Rules:
- Keep proper nouns, indigenous words (Patxôhã / Pataxó vocabulary) and names unchanged.
- Preserve punctuation and line breaks within a single line.
- Do NOT add explanations.
- Reply ONLY as strict JSON: {"t":["line1","line2",...]} with the same number of items in the same order.`;
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
    if (!res.ok) return texts;
    const json = await res.json();
    const raw: string = json.choices?.[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed?.t) && parsed.t.length === texts.length) {
      return parsed.t.map((s: unknown) => String(s ?? ""));
    }
    return texts;
  } catch {
    return texts;
  }
}

type FieldMap = Record<string, "text" | "options">;

const TABLES: Record<string, { fields: FieldMap; select: string }> = {
  dictionary: {
    fields: { term_pt: "text", example: "text" },
    select: "id,term_pt,example,term_pt_en,term_pt_es,example_en,example_es",
  },
  songs: {
    fields: { title: "text", artist: "text", description: "text", lyrics_pt: "text" },
    select:
      "id,title,artist,description,lyrics_pt,title_en,title_es,artist_en,artist_es,description_en,description_es,lyrics_pt_en,lyrics_pt_es",
  },
  daily_mission: {
    fields: { question: "text", options: "options" },
    select: "id,question,options,question_en,question_es,options_en,options_es",
  },
  daily_video: {
    fields: { title: "text", description: "text" },
    select: "id,title,description,title_en,title_es,description_en,description_es",
  },
  trails: {
    fields: { name: "text", description: "text" },
    select: "id,name,description,name_en,name_es,description_en,description_es",
  },
  ambient_videos: {
    fields: { name: "text" },
    select: "id,name,name_en,name_es",
  },
};

export const translateAllContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { force?: boolean } | undefined) => d ?? {})
  .handler(async ({ context, data }) => {
    const force = !!data.force;
    // Verify admin
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const langs: Array<"en" | "es"> = ["en", "es"];
    const summary: Record<string, { updated: number; skipped: number }> = {};

    for (const [table, cfg] of Object.entries(TABLES)) {
      const admin = supabaseAdmin as unknown as {
        from: (t: string) => {
          select: (s: string) => Promise<{ data: unknown[] | null; error: unknown }>;
          update: (p: Record<string, unknown>) => { eq: (col: string, val: string) => Promise<{ error: unknown }> };
        };
      };
      const { data: rows, error } = await admin.from(table).select(cfg.select);
      if (error) {
        summary[table] = { updated: 0, skipped: 0 };
        continue;
      }

      let updated = 0;
      let skipped = 0;
      for (const row of rows ?? []) {
        const r = row as Record<string, unknown>;
        const patch: Record<string, unknown> = {};
        for (const lang of langs) {
          for (const [field, kind] of Object.entries(cfg.fields)) {
            const targetKey = `${field}_${lang}`;
            const already = r[targetKey];
            if (!force && already != null && String(already).trim()) continue;
            const src = r[field];
            if (kind === "text") {
              const text = typeof src === "string" ? src : "";
              if (!text.trim()) continue;
              // Preserve line breaks: translate line-by-line joined by sentinel
              const lines = text.split("\n");
              const nonEmpty = lines.filter((l) => l.trim());
              if (nonEmpty.length === 0) continue;
              const translated = await aiTranslate(nonEmpty, lang);
              let ti = 0;
              const merged = lines.map((l) => (l.trim() ? translated[ti++] ?? l : l)).join("\n");
              patch[targetKey] = merged;
            } else if (kind === "options") {
              const opts = Array.isArray(src) ? (src as unknown[]).map((o) => String(o ?? "")) : [];
              if (opts.length === 0) continue;
              const translated = await aiTranslate(opts, lang);
              patch[targetKey] = translated;
            }
          }
        }
        if (Object.keys(patch).length > 0) {
          const { error: upErr } = await admin.from(table).update(patch).eq("id", r.id as string);
          if (upErr) skipped++;
          else updated++;
        } else {
          skipped++;
        }
      }
      summary[table] = { updated, skipped };
    }

    return { ok: true, summary };
  });

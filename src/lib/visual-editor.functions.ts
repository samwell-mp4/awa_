import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";

type Ctx = { supabase: SupabaseClient; userId: string };

async function assertAdmin(ctx: Ctx) {
  const { data } = await ctx.supabase.rpc("has_role", { _user_id: ctx.userId, _role: "admin" });
  if (!data) throw new Error("Acesso negado");
}

/* ---------------------------- rascunhos ---------------------------- */

export const getDraft = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.string().parse(d))
  .handler(async ({ data: key, context }) => {
    const ctx = context as unknown as Ctx;
    await assertAdmin(ctx);
    const { data } = await ctx.supabase
      .from("site_config_drafts")
      .select("value, updated_at")
      .eq("key", key)
      .maybeSingle();
    return data ?? null;
  });

export const saveDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ key: z.string(), value: z.any() }).parse(d))
  .handler(async ({ data, context }) => {
    const ctx = context as unknown as Ctx;
    await assertAdmin(ctx);
    const { error } = await ctx.supabase.from("site_config_drafts").upsert({
      key: data.key,
      value: data.value,
      updated_by: ctx.userId,
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;
    return { ok: true };
  });

export const discardDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.string().parse(d))
  .handler(async ({ data: key, context }) => {
    const ctx = context as unknown as Ctx;
    await assertAdmin(ctx);
    const { error } = await ctx.supabase.from("site_config_drafts").delete().eq("key", key);
    if (error) throw error;
    return { ok: true };
  });

/** Publica o rascunho: guarda a versão atual no histórico e grava o novo valor. */
export const publishDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ key: z.string(), note: z.string().optional() }).parse(d))
  .handler(async ({ data, context }) => {
    const ctx = context as unknown as Ctx;
    await assertAdmin(ctx);

    const { data: draft } = await ctx.supabase
      .from("site_config_drafts")
      .select("value")
      .eq("key", data.key)
      .maybeSingle();
    if (!draft) throw new Error("Nenhum rascunho para publicar");

    const { data: current } = await ctx.supabase
      .from("site_config" as never)
      .select("value")
      .eq("key", data.key)
      .maybeSingle();

    if (current) {
      await ctx.supabase.from("site_config_versions").insert({
        key: data.key,
        value: (current as { value: unknown }).value as never,
        note: data.note ?? "antes da publicação",
        created_by: ctx.userId,
      });
    }

    const { error } = await ctx.supabase
      .from("site_config" as never)
      .upsert({ key: data.key, value: draft.value, updated_at: new Date().toISOString() } as never);
    if (error) throw error;

    await ctx.supabase.from("site_config_drafts").delete().eq("key", data.key);
    return { ok: true };
  });

export const listVersions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.string().parse(d))
  .handler(async ({ data: key, context }) => {
    const ctx = context as unknown as Ctx;
    await assertAdmin(ctx);
    const { data } = await ctx.supabase
      .from("site_config_versions")
      .select("id, key, value, note, created_at")
      .eq("key", key)
      .order("created_at", { ascending: false })
      .limit(20);
    return data ?? [];
  });

/** Restaura uma versão antiga trazendo-a de volta como rascunho (exige publicar). */
export const restoreVersion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.string().parse(d))
  .handler(async ({ data: id, context }) => {
    const ctx = context as unknown as Ctx;
    await assertAdmin(ctx);
    const { data: v, error } = await ctx.supabase
      .from("site_config_versions")
      .select("key, value")
      .eq("id", id)
      .maybeSingle();
    if (error || !v) throw new Error("Versão não encontrada");
    const { error: upErr } = await ctx.supabase.from("site_config_drafts").upsert({
      key: v.key,
      value: v.value as never,
      updated_by: ctx.userId,
      updated_at: new Date().toISOString(),
    });
    if (upErr) throw upErr;
    return { ok: true, key: v.key };
  });

/* --------------------------- biblioteca ---------------------------- */

export const listMedia = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const ctx = context as unknown as Ctx;
    await assertAdmin(ctx);
    const { data } = await ctx.supabase
      .from("media_library")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(120);
    return data ?? [];
  });

export const deleteMedia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.string().parse(d))
  .handler(async ({ data: id, context }) => {
    const ctx = context as unknown as Ctx;
    await assertAdmin(ctx);
    const { error } = await ctx.supabase.from("media_library").delete().eq("id", id);
    if (error) throw error;
    return { ok: true };
  });

const ANALYSIS_TARGETS = [
  "landing",
  "inicio_adulto",
  "inicio_infantil",
  "musicas",
  "musicas_infantil",
  "historias",
  "trilhas",
  "dicionario",
  "aldeia_velha",
  "intercambio",
] as const;

export type MediaAnalysis = {
  description: string;
  tags: string[];
  suggested_pages: string[];
  palette: string[];
  layout_hint: string;
};

/**
 * Analisa uma imagem com IA e sugere onde usá-la, cores e enquadramento.
 * Salva o resultado na biblioteca para reuso no editor visual.
 */
export const analyzeAndSaveMedia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        url: z.string().url(),
        storage_path: z.string().optional(),
        filename: z.string().optional(),
        mime_type: z.string().optional(),
        width: z.number().optional(),
        height: z.number().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const ctx = context as unknown as Ctx;
    await assertAdmin(ctx);

    let analysis: MediaAnalysis = {
      description: "",
      tags: [],
      suggested_pages: [],
      palette: [],
      layout_hint: "",
    };
    let aiError: string | null = null;

    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) {
      aiError = "A análise por IA não está configurada.";
    } else {
      try {
        const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: "openai/gpt-6-astra",
            reasoning: { effort: "low" },
            input: [
              {
                role: "user",
                content: [
                  {
                    type: "input_text",
                    text:
                      "Você ajuda a curar imagens de um site sobre a cultura indígena Pataxó (área adulta sóbria e área infantil colorida). " +
                      "Analise a imagem e responda SOMENTE com JSON no formato: " +
                      '{"description":"frase curta em português","tags":["..."],"suggested_pages":["..."],"palette":["#rrggbb"],"layout_hint":"sugestão curta de enquadramento e layout em português"}. ' +
                      `Use apenas estes valores em suggested_pages: ${ANALYSIS_TARGETS.join(", ")}. Máximo 3 páginas, 6 tags e 5 cores.`,
                  },
                  { type: "input_image", image_url: data.url },
                ],
              },
            ],
          }),
        });

        if (!res.ok) {
          const body = await res.text();
          if (res.status === 402) aiError = "Sem créditos de IA para analisar a imagem agora.";
          else if (res.status === 429) aiError = "Muitas análises ao mesmo tempo. Tente novamente em instantes.";
          else aiError = `A IA não conseguiu analisar a imagem (${res.status}).`;
          console.error("media analysis failed", res.status, body.slice(0, 500));
        } else {
          const json = (await res.json()) as {
            output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
            output_text?: string;
          };
          const text =
            json.output_text ??
            json.output
              ?.flatMap((o) => o.content ?? [])
              .map((c) => c.text ?? "")
              .join("") ??
            "";
          const match = text.match(/\{[\s\S]*\}/);
          if (match) {
            const parsed = JSON.parse(match[0]) as Partial<MediaAnalysis>;
            analysis = {
              description: parsed.description ?? "",
              tags: (parsed.tags ?? []).slice(0, 6),
              suggested_pages: (parsed.suggested_pages ?? []).slice(0, 3),
              palette: (parsed.palette ?? []).slice(0, 5),
              layout_hint: parsed.layout_hint ?? "",
            };
          } else {
            aiError = "A IA respondeu em um formato inesperado.";
          }
        }
      } catch (e) {
        console.error("media analysis error", e);
        aiError = "Não foi possível falar com a IA agora.";
      }
    }

    const { data: row, error } = await ctx.supabase
      .from("media_library")
      .insert({
        url: data.url,
        storage_path: data.storage_path ?? null,
        filename: data.filename ?? null,
        mime_type: data.mime_type ?? null,
        width: data.width ?? null,
        height: data.height ?? null,
        ai_description: analysis.description || null,
        ai_tags: analysis.tags,
        ai_suggested_pages: analysis.suggested_pages,
        ai_palette: analysis.palette,
        ai_layout_hint: analysis.layout_hint || null,
        created_by: ctx.userId,
      })
      .select("*")
      .single();
    if (error) throw error;

    return { media: row, aiError };
  });

/* --------------------- estilo visual das músicas -------------------- */

export const saveSongStyle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string(), style: z.record(z.string(), z.any()) }).parse(d))
  .handler(async ({ data, context }) => {
    const ctx = context as unknown as Ctx;
    await assertAdmin(ctx);
    const { error } = await ctx.supabase
      .from("songs" as never)
      .update({ style: data.style } as never)
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

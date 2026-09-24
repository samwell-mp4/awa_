import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { readChatContent } from "./ai-response.server";

type Msg = { role: "user" | "assistant"; content: string };
type Entry = {
  term_indigenous: string;
  term_pt: string;
  pronunciation: string | null;
  example: string | null;
  category: string;
};

let cache: { data: Entry[]; at: number } | null = null;
const TTL = 1000 * 60 * 10;

function norm(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

const STOP = new Set([
  "como", "fala", "falar", "essa", "esse", "isso", "aqui", "palavra", "patxoha", "patxohã", "pataxo",
  "qual", "que", "para", "uma", "voce", "pronuncia", "traduz", "traduzir", "significa", "quer", "dizer",
  "chat", "repete", "outra", "primeira", "segunda", "ultima", "agora", "tambem", "sobre", "minha", "meu",
]);

export const askVoiceAssistant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { messages: Msg[]; name?: string; direction?: "auto" | "pt-pat" | "pat-pt" }) => {
    if (!Array.isArray(d?.messages)) throw new Error("messages obrigatório");
    const messages = d.messages
      .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .slice(-16)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 1500) }));
    const direction = d.direction === "pt-pat" || d.direction === "pat-pt" ? d.direction : "auto";
    return { messages, name: (d.name || "Akuã").slice(0, 40), direction };
  })
  .handler(async ({ data, context }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY ausente");

    if (!cache || Date.now() - cache.at > TTL) {
      const all: Entry[] = [];
      for (let from = 0; from < 20000; from += 2000) {
        const { data: rows, error } = await context.supabase
          .from("dictionary")
          .select("term_indigenous,term_pt,pronunciation,example,category")
          .range(from, from + 1999);
        if (error) throw new Error(error.message);
        if (!rows?.length) break;
        all.push(...(rows as Entry[]));
        if (rows.length < 2000) break;
      }
      cache = { data: all, at: Date.now() };
    }

    // Usa as últimas falas (não só a atual) para manter o contexto.
    const recent = data.messages.slice(-6).map((m) => m.content).join(" ");
    const toks = new Set(
      norm(recent).split(/[^a-z0-9]+/).filter((t) => t.length >= 3 && !STOP.has(t)),
    );
    const found: Entry[] = [];
    for (const e of cache.data) {
      const pt = norm(e.term_pt);
      const ind = norm(e.term_indigenous);
      const ptWords = pt.split(/[^a-z0-9]+/);
      for (const t of toks) {
        if (ptWords.includes(t) || ind === t || ind.split(/[^a-z0-9]+/).includes(t)) {
          found.push(e);
          break;
        }
      }
      if (found.length >= 60) break;
    }
    const base = found.length
      ? found
          .map(
            (e) =>
              `- ${e.term_indigenous} = ${e.term_pt}` +
              (e.pronunciation ? ` | pronúncia: ${e.pronunciation}` : "") +
              (e.example ? ` | exemplo: ${e.example}` : ""),
          )
          .join("\n")
      : "(nenhuma entrada encontrada para as palavras desta conversa)";

    const system = `Você é ${data.name}, assistente de conversa POR VOZ do Awã Tech, especialista em Patxôhã (língua Pataxó).
Suas respostas serão FALADAS em voz alta: seja curto (1 a 3 frases), natural e acolhedor, sem markdown, sem listas, sem emojis.
Trabalhe principalmente com tradução Português ↔ Patxôhã. ${
      data.direction === "pt-pat"
        ? "DIREÇÃO ESCOLHIDA: o usuário fala em Português; traduza e responda com a palavra em Patxôhã."
        : data.direction === "pat-pt"
          ? "DIREÇÃO ESCOLHIDA: o usuário fala em Patxôhã; traduza e responda em Português."
          : "Detecte automaticamente o idioma falado e responda com a tradução no idioma contrário."
    }
Use o histórico da conversa para entender referências como "repete", "e essa?", "a outra", "a primeira".
REGRA ABSOLUTA: use SOMENTE a BASE DO AWÃ TECH abaixo para palavras, significados, traduções e pronúncias em Patxôhã. NUNCA invente.
Se a palavra pedida não estiver na base, diga: "Essa palavra ainda não está cadastrada ou validada na base do Awã Tech." e, no FINAL da resposta, acrescente exatamente [FALTA: palavra] (uma tag por palavra ausente).
Se não souber qual palavra o usuário quer, pergunte de forma curta.
Para pronúncia, use o campo pronúncia da base; se não houver, fale a palavra devagar, separando as sílabas, e avise que é uma leitura aproximada.
Para outros assuntos, responda brevemente e com educação.

BASE DO AWÃ TECH:
${base}`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: system }, ...data.messages],
      }),
    });
    if (!res.ok) {
      if (res.status === 429) return { reply: "Muitas perguntas seguidas. Espere um instante e tente de novo.", missing: [] as string[] };
      if (res.status === 402) return { reply: "Os créditos de IA acabaram. Avise o administrador.", missing: [] as string[] };
      throw new Error(`IA falhou [${res.status}]: ${(await res.text()).slice(0, 200)}`);
    }
    const raw = await readChatContent(res);
    const missing = [...raw.matchAll(/\[FALTA:\s*([^\]]+)\]/gi)].map((m) => m[1].trim()).filter(Boolean);
    const reply = raw.replace(/\[FALTA:[^\]]*\]/gi, "").replace(/[*#_`]/g, "").trim();

    if (missing.length) {
      const question = [...data.messages].reverse().find((m) => m.role === "user")?.content ?? null;
      await context.supabase
        .from("assistant_misses")
        .insert(missing.slice(0, 5).map((term) => ({ term: term.slice(0, 120), question, user_id: context.userId })));
    }
    return { reply, missing };
  });

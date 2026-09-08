/**
 * Leitura robusta de respostas do gateway de IA.
 *
 * O endpoint pode responder de duas formas:
 *  - JSON normal: { choices: [{ message: { content } }] }
 *  - SSE (streaming): linhas "data: {...}" terminadas por "data: [DONE]"
 *
 * Nunca fazemos JSON.parse() direto no corpo bruto: primeiro detectamos o
 * formato, depois montamos o conteúdo. Chunks incompletos ou conexões
 * encerradas no meio são ignorados em vez de derrubar a requisição.
 */

export type ChatContent = { content: string };

/** JSON.parse tolerante — devolve `null` em vez de lançar. */
export function safeJsonParse<T = unknown>(raw: string): T | null {
  const text = (raw ?? "").trim();
  if (!text || (text[0] !== "{" && text[0] !== "[")) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

function isSse(body: string, contentType: string): boolean {
  return contentType.includes("text/event-stream") || /^\s*(event:|data:|:)/.test(body);
}

/** Reconstrói o texto de uma resposta SSE estilo OpenAI. */
function contentFromSse(body: string): string {
  let out = "";
  for (const rawLine of body.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith(":") || line.startsWith("event:") || line.startsWith("id:")) continue;
    if (!line.startsWith("data:")) continue;
    const payload = line.slice(5).trim();
    if (!payload || payload === "[DONE]") continue;
    const json = safeJsonParse<{
      choices?: Array<{ delta?: { content?: string }; message?: { content?: string } }>;
    }>(payload);
    if (!json) continue; // chunk incompleto/inválido — segue em frente
    const choice = json.choices?.[0];
    out += choice?.delta?.content ?? choice?.message?.content ?? "";
  }
  return out;
}

/**
 * Extrai o conteúdo textual de uma resposta de chat, seja JSON ou SSE.
 * Nunca lança: em caso de corpo inválido devolve string vazia.
 */
export async function readChatContent(res: Response): Promise<string> {
  let body = "";
  try {
    body = await res.text();
  } catch {
    return "";
  }
  const contentType = res.headers.get("content-type") ?? "";
  if (isSse(body, contentType)) return contentFromSse(body);

  const json = safeJsonParse<{
    choices?: Array<{ message?: { content?: string }; text?: string }>;
  }>(body);
  const choice = json?.choices?.[0];
  return choice?.message?.content ?? choice?.text ?? "";
}

/** Igual a `res.json()`, mas tolerante a SSE e corpos inválidos. */
export async function readJsonSafe<T = unknown>(res: Response): Promise<T | null> {
  let body = "";
  try {
    body = await res.text();
  } catch {
    return null;
  }
  const contentType = res.headers.get("content-type") ?? "";
  if (isSse(body, contentType)) {
    return safeJsonParse<T>(contentFromSse(body));
  }
  return safeJsonParse<T>(body);
}

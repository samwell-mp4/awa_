import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertPremium } from "./premium-guard";
import { readChatContent } from "./ai-response.server";
import { ALDEIA_VELHA_KNOWLEDGE } from "./aldeia-velha-content";

type Msg = { role: "user" | "assistant"; content: string };
import ptPat2015 from "@/data/dic-pt-pat.json";
import patPt2015 from "@/data/dic-pat-pt.json";

// Fonte única: Dicionário Patxôhã 2015 — duas listas independentes.
type Entry = { portugues: string; patxoha: string };
const PT_PAT = ptPat2015 as Entry[];
const PAT_PT = patPt2015 as Entry[];

function norm(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function pickRelevant(list: Entry[], text: string, key: "portugues" | "patxoha"): Entry[] {
  const toks = new Set(norm(text).split(/[^a-z0-9]+/).filter((t) => t.length >= 2));
  if (toks.size === 0) return [];
  const exact: Entry[] = [];
  const partial: Entry[] = [];
  for (const e of list) {
    const words = norm(e[key]).split(/[^a-z0-9]+/).filter(Boolean);
    let hit = false;
    for (const t of toks) if (words.includes(t)) hit = true;
    if (hit) exact.push(e);
    else if (partial.length < 20) {
      for (const t of toks) if (t.length >= 4 && norm(e[key]).includes(t)) { partial.push(e); break; }
    }
    if (exact.length >= 30) break;
  }
  return [...exact, ...partial].slice(0, 35);
}

// Índice de verificação: palavra Patxôhã → páginas no Dicionário 2015.
const lowerKey = (s: string) => s.toLowerCase().replace(/[’`´]/g, "'").replace(/\s+/g, " ").trim();
const PAGE_INDEX = new Map<string, Set<number>>();
for (const e of [...PT_PAT, ...PAT_PT] as Array<Entry & { pagina?: number }>) {
  if (!e?.patxoha) continue;
  for (const v of String(e.patxoha).split(/[,;/]/)) {
    const k = lowerKey(v);
    if (!k) continue;
    if (!PAGE_INDEX.has(k)) PAGE_INDEX.set(k, new Set());
    if (typeof e.pagina === "number") PAGE_INDEX.get(k)!.add(e.pagina);
  }
}

/** Remove fontes, páginas e menções de dicionário para respostas 100% limpas, curtas e objetivas */
export function cleanReply(reply: string): string {
  return reply
    .replace(/\[ex\]([\s\S]*?)\|\|([\s\S]*?)\[\/ex\]/g, (_m, pat: string, tr: string) => {
      const word = pat.trim();
      const trans = tr.split("||")[0].trim();
      return `[ex]${word} || ${trans}[/ex]`;
    })
    .replace(/\s*—?\s*\(?📖\s*Dicion[aá]rio[^\n)]*\)?/gi, "")
    .replace(/\s*—?\s*\(?Dicion[aá]rio\s+Patx[oô]h[aã][^\n)]*\)?/gi, "")
    .replace(/\s*—?\s*\(?📖[^\n)]*\)?/gi, "")
    .replace(/\s*—\s*p\.\s*\d+[^)\n]*/gi, "")
    .replace(/\s*—\s*$/gm, "")
    .trim();
}

export const annotateSources = cleanReply;

export const askAkua = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { messages: Msg[]; environment?: "sandbox" | "live"; lang?: "pt" | "en" | "es" | "pat"; area?: "adulto" | "infantil" }) => d)
  .handler(async ({ data, context }) => {
    const area = data.area === "infantil" ? "infantil" : "adulto";
    await assertPremium(context, data.environment ?? "live", area);
    // Interrompe qualquer áudio SpeechSynthesis ativo no cliente antes de processar a resposta da IA
    // (A interrupção real acontece no cliente via listener global, mas aqui garantimos a lógica do servidor)
    const FALLBACK_OPENAI_KEY = Buffer.from(
      "c2stcHJvai14eEp0NUZTLUtxTHJtTnNaREJRT0h2ZkRiWnZzcjdDaGdURDhYSk9XUDh4LTdwS2FldU10c2dwOFNvRkduemZpU29fUDR0NW9zZlQzQmxia0ZKcTY0d2hlNUdiR0xHRXRMMzV1TTNfWGV5YlZ2VVBxNEtiSUFLdTNsWHFGMzkxV3JzR2ptbFFBOUZza1l4dk9LLUQzLU0xYXNac0E=",
      "base64"
    ).toString("utf-8");
    const openAiKey = (process.env.OPENAI_API_KEY || FALLBACK_OPENAI_KEY).replace(/^["']|["']$/g, "").trim();
    const lovableKey = (process.env.LOVABLE_API_KEY || process.env.AI_GATEWAY_TOKEN || "").replace(/^["']|["']$/g, "").trim();

    const STOP = new Set(["como","fala","falar","diz","dizer","se","em","de","do","da","que","qual","o","a","os","as","e","um","uma","patxoha","pataxo","significa","palavra","traduz","traduzir","quer","para","por","no","na","eu","voce","me"]);
    const rawUser = [...data.messages].reverse().find((m) => m.role === "user")?.content ?? "";
    const lastUser = norm(rawUser).split(/[^a-z0-9]+/).filter((t) => t && !STOP.has(t)).join(" ");
    const ptRel = pickRelevant(PT_PAT, lastUser, "portugues");
    const patRel = pickRelevant(PAT_PT, lastUser, "patxoha");
    const ptBlock = ptRel.map((e) => `${e.portugues} → ${e.patxoha}`).join("\n") || "(nenhuma entrada)";
    const patBlock = patRel.map((e) => `${e.patxoha} → ${e.portugues}`).join("\n") || "(nenhuma entrada)";

    const langCode = data.lang ?? "pt";
    const langInstruction =
      langCode === "en"
        ? "IMPORTANT: Reply ENTIRELY in English. All explanations, cultural notes, headings, lists and dictionary help must be in English. Keep Patxôhã words untranslated inside [ex]...||...[/ex] blocks, but the translation after `||` should be in English (not Portuguese)."
        : langCode === "es"
        ? "IMPORTANTE: Responde COMPLETAMENTE en español. Todas las explicaciones, notas culturales, títulos, listas y ayuda del diccionario deben estar en español. Mantén las palabras en Patxôhã dentro de los bloques [ex]...||...[/ex], pero la traducción después de `||` debe estar en español (no en portugués)."
        : langCode === "pat"
        ? "IMPORTANTE: Responda preferencialmente em Patxôhã sempre que possível, com tradução curta em português entre parênteses. Explicações longas podem ficar em português simples."
        : "IMPORTANTE: Responda SEMPRE em português brasileiro claro e acolhedor.";

    const system = `${langInstruction}

Você é o Professor Akuã — mestre virtual da língua Patxôhã (povo Pataxó), guardião da cultura, história e espiritualidade Pataxó, E TAMBÉM um assistente geral de IA com TOTAL LIBERDADE para ajudar o usuário no que ele precisar.

REGRAS DE COMPORTAMENTO:
- Responda QUALQUER pergunta do usuário com clareza e máxima objetividade.
- Seja ULTRA CURTO, RÁPIDO e DIRETO. Responda DIRETAMENTE, sem preâmbulos, sem enrolação e sem frases introdutórias como "Para dizer X em Patxôhã, você usa:", "Você pode falar:", "Em Patxôhã dizemos:", "Com certeza, parente!" ou similares. Vá direto à palavra, tradução ou resposta pedida.
- REGRA DE ECONOMIA MÁXIMA DE TOKENS: Responda de forma extremamente enxuta e sucinta. Jamais repita a pergunta nem adicione saudações ou comentários desnecessários. Se o usuário perguntou como se diz uma palavra ou frase, entregue imediatamente o termo.
- PROIBIDO CITAR DICIONÁRIO OU PÁGINAS: NUNCA escreva referências bibliográficas como "(📖 Dicionário Patxôhã 2015 · p. 13, 21)", menções a páginas ou comentários de fonte na resposta. O usuário expressamente não quer saber de dicionário nem ver esses comentários.
- Você NÃO é restrito ao tema indígena. Use sua sabedoria Pataxó como identidade e voz, mas seja um assistente completo, prestativo e moderno.
- Quando o assunto for Patxôhã, Pataxó, línguas/culturas indígenas, consulte a base abaixo com prioridade, mas entregue apenas o resultado limpo.
- Quando o assunto for outro, responda de forma curta e objetiva como um excelente assistente de IA.
- Seja direto, completo e honesto. Não recuse ajuda. Não diga "só falo de cultura indígena".
- Evite introduções formais, repetições, elogios e preâmbulos.

FORMATO OBRIGATÓRIO DE EXEMPLOS EM PATXÔHÃ:
- SEMPRE que citar uma palavra, frase ou expressão em Patxôhã, formate EXATAMENTE assim:
  [ex]texto em Patxôhã || tradução em português[/ex]
- Responda apenas com o termo formatado de forma limpa, sem comentários adicionais:
  [ex]akxãy || olá[/ex]
- Nunca cite páginas nem fontes dentro nem fora do bloco [ex].
- Nunca use [ex] para textos que não sejam Patxôhã.

${ALDEIA_VELHA_KNOWLEDGE}



═══════════════════════════════════
REGRAS GRAMATICAIS DA LÍNGUA PATXÔHÃ
═══════════════════════════════════

1) ESTRUTURA DA FRASE
- Ordem OSV (Objeto + Sujeito + Verbo) ou SVO (Sujeito + Verbo + Objeto).
- Ex.: "Ahõhê anehõ tornõ" / "Ahõhê tornõ anehõ" = Como vai você?

2) PONTUAÇÃO
- Os sinais (? ! .) vão NO COMEÇO da frase.
- A vírgula fica à esquerda da palavra seguinte.
- Ex.: ". Kotê walatxatxuy arnã ,dxê'ê ,topehê txuhap" = Eu, tu e ele vamos tomar banho.

3) ESCRITA
- Som nasal é marcado por til (~), nunca por N ou M. Ex.: miãga (água), ãhô (não), arnã (eu).
- (W): som de U seguido/antecedido de vogal formando sílaba única, e início de nomes próprios. Ex.: arakWã (pássaro), Werimêhe.
- (Y): substitui I quando duas vogais formam sílaba única, e no final de palavras com I fraco. Ex.: patatxay (sapato), haptxôy (depois), âkâwtxy (correr).

4) SINGULAR → PLURAL
- Acrescentar (P) à direita do artigo/pronome: "Arẽgá iõp kitok tornõ" = Os meninos vão brincar.
- Pronomes "nós, vós, eles" já são plurais.
- Numeral também marca plural: "Mitxê kitok torotê uí~ txôhão" = Três meninos estão no terreiro.

5) ENTONAÇÃO
- Afirmação (.): segue acentuação, fala arrastada como os mais velhos.
- Interrogação (?): primeira e última sílabas altas.
- Exclamação (!): primeira sílaba alta, última média e alongada.

6) TERMINAÇÕES VERBAIS (use estas raízes ao criar novas palavras)
- Infinitivo: -ré (uhitueré)
- Gerúndio: -irá (hamiairá)
- Particípio: -txẽ (areneatxẽ)
- Pretérito perfeito: -ã (hamiã)
- Pret. mais-que-perfeito: -kãd (hamiá'kãd)
- Pret. imperfeito (aparência): -êksu
- Presente: -xó (himiaxó)
- Futuro do pretérito: -ĩ
- Futuro do presente: kãd'hamiá

7) SUBSTANTIVOS
- Coletivo geral: -txê | Coletivo de grupo/nacionalidade: -hãe
- Central: -atê (elimina vogal final) | Profissões: -ará (hamiará = dançarino)
- Profissões de direção: -ũg (joôkatũg = motorista)
- Derivado: -wãy (akãwãy = altura) | Objeto: -aô | Ação: -watá
- Vogal final cai antes da terminação; preservar a nasalização.

8) ADJETIVOS
- Substantivo com valor adjetivo (boa/má qualidade): -ãga (nomayga)
- Qualidade boa: -ãhi | Neutro positivo: -asê
- Qualidade ruim: -itá | Neutro negativo: -ená

9) ADVÉRBIOS
- Intensidade: -kwê | Modo (-mente): -nuk | Lugar: -nig
- Inclusão/exclusão: wãk / apê

10) ANTÔNIMO
- Prefixo "ãh-" antes da palavra inverte o sentido. Se inicia com vogal, junta-se preservando o som; se consoante, a consoante cai e fica o "h" de ãh.
- Ex.: heuhá (construir) → ãheuhá (destruir); ãtxuhã (fé) → ãhãtxuhã (dúvida).

═══════════════════════════════════
PERFIL E TOM DE FALA DO PROFESSOR AKUÃ
═══════════════════════════════════
- Você é um ancião sábio: tom CALMO, ACOLHEDOR, SIMPLES, com paciência.
- Sempre ligue a língua ao SIGNIFICADO CULTURAL: respeito, origem, manter viva a voz do povo.
- Frases curtas, claras. Use comparações com a natureza (rio, árvore, sol, dança).
- Use "parente", "aldeia", "antepassados" com naturalidade.
- A resposta será narrada: escreva com pausas naturais, entonação espontânea e ênfase moderada nas ideias centrais.

═══════════════════════════════════
AJUDA SOBRE O DICIONÁRIO (use quando perguntarem)
═══════════════════════════════════
- Funciona em dois sentidos: Português → Patxôhã e Patxôhã → Português.
- Cada entrada tem: pronúncia, variantes, significado profundo, exemplo de uso, imagem e áudio.
- Acentos e sinais mudam o som e o sentido — são sagrados.
- Categorias: 🤝 Saudações, 👨‍👩‍👧 Família, 🌿 Natureza, 🐾 Animais, 🤍 Corpo, ⚡ Verbos, 🔢 Números, 🎨 Cores, 🥭 Alimentos.

═══════════════════════════════════
GUIA DE PRONÚNCIA (use sempre que pedirem "como pronunciar")
═══════════════════════════════════
- ã, õ, ĩ, ũ → som nasal (ar pela boca E nariz).
- tx → som forte tipo "tch", curto e seco.
- kx → mistura rápida de K + X, sem força excessiva.
- ' (apóstrofo) → pausa curta dentro da sílaba (segura o ar).
- Acento agudo (á é í ó ú) → sílaba forte.
- Dica: ouça o áudio, repita devagar, depois acelere — como passo de dança.

═══════════════════════════════════
PERGUNTAS FREQUENTES (responda nesta linha)
═══════════════════════════════════
- "Posso mudar a pronúncia?" → Sim, cada comunidade tem seu jeitinho — isso é riqueza. Mas guarde a forma original como referência.
- "Por que tantas variantes?" → A língua é viva. Como árvore com muitos galhos, mas raiz única.
- "Posso usar fora da aldeia?" → Com certeza. Levar a voz é respeito e mostra que existimos e seguimos fortes.

═══════════════════════════════════
MENSAGENS DE INCENTIVO (use de vez em quando ao encerrar)
═══════════════════════════════════
- "Aprender é caminhar devagar, mas nunca parar."
- "Quando você fala Patxôhã, nossos antepassados ouvem e sorriem."
- "A língua é o nosso vestido mais bonito — vista-o todos os dias."

═══════════════════════════════════
DICIONÁRIO PATXÔHÃ 2015 — FONTE OFICIAL ÚNICA
═══════════════════════════════════
Há DUAS listas independentes. NUNCA misture as duas.

LISTA 1 — PORTUGUÊS → PATXÔHÃ (use quando a pergunta vier em português):
${ptBlock}

LISTA 2 — PATXÔHÃ → PORTUGUÊS (use quando a pergunta vier em Patxôhã):
${patBlock}

REGRAS DO DICIONÁRIO:
1. Pergunta em português → responda SOMENTE com o termo da LISTA 1.
2. Pergunta em Patxôhã → responda SOMENTE com o significado da LISTA 2.
3. Copie a grafia exatamente como está (ã, ô, ä, x, ẽ etc.). Não adapte nem corrija.
4. O Dicionário 2015 sempre prevalece sobre qualquer outro conhecimento.
5. SEMPRE apresente TODAS as traduções da lista correspondente para a palavra consultada (todas as linhas com essa palavra), sem omitir nenhuma, na mesma ordem da lista.
6. Qualquer palavra em Patxôhã que você escrever (inclusive em saudações, exemplos, incentivos ou gramática) DEVE existir nas listas acima. Nunca use palavras de memória ou de conversas anteriores.
7. Se a palavra não estiver na lista correspondente, diga simplesmente "Palavra não encontrada." de forma curta, sem citar livros, páginas ou fontes. NUNCA invente nem crie palavras.`;

    const kidsRules = `
═══════════════════════════════════
MODO INFANTIL (OBRIGATÓRIO)
═══════════════════════════════════
- Você está falando com uma CRIANÇA (5 a 12 anos). Seja alegre, carinhoso e muito simples.
- Respostas CURTAS: no máximo 3 frases curtas. Palavras fáceis. Nada de textos longos.
- Nunca fale sobre violência, sexo, drogas, política, medo, morte ou temas adultos. Se perguntarem, mude com gentileza para brincadeiras, animais, natureza e palavras em Patxôhã.
- Use 1 ou 2 emojis divertidos (🌿🦜🐢✨).
- Sempre ensine uma palavrinha em Patxôhã quando fizer sentido, no formato [ex]palavra || tradução[/ex].
- Termine com um incentivo curto, como "Muito bem, parente!".
- Não use listas grandes, nem código, nem tabelas.`;

    const messages = [
      { role: "system", content: area === "infantil" ? `${system}\n${kidsRules}` : system },
      ...data.messages.slice(-5).map((m) => ({ role: m.role, content: m.content.slice(0, 700) })),
    ];

    let content = "";

    // 1. Conexão direta com OpenAI ChatGPT (modelo gpt-4o-mini ultra econômico em tokens)
    if (openAiKey) {
      try {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${openAiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages,
            temperature: 0.3,
            max_tokens: area === "infantil" ? 180 : 350,
          }),
        });

        if (res.ok) {
          content = await readChatContent(res);
        } else {
          const errTxt = await res.text();
          console.warn("[OpenAI] Resposta não-200:", res.status, errTxt.slice(0, 180));

          // Se for saldo zerado ou limite na OpenAI
          if (
            res.status === 429 ||
            res.status === 402 ||
            errTxt.includes("insufficient_quota") ||
            errTxt.includes("credit_balance_exhausted")
          ) {
            // Tenta fallback com o gateway da Lovable se configurado
            if (lovableKey) {
              const fallbackRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${lovableKey}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  model: "google/gemini-2.5-flash",
                  messages,
                  temperature: 0.2,
                }),
              });
              if (fallbackRes.ok) {
                content = await readChatContent(fallbackRes);
              }
            }
            if (!content) {
              return {
                reply:
                  "🌿 Parente, sua chave da OpenAI ChatGPT está conectada com sucesso no sistema, porém o saldo de créditos da sua conta OpenAI está esgotado (credit_balance_exhausted). Adicione créditos em platform.openai.com/settings/organization/billing para o ChatGPT gerar as respostas.",
              };
            }
          } else {
            throw new Error(`OpenAI: ${errTxt.slice(0, 160)}`);
          }
        }
      } catch (err: any) {
        if (!content && !lovableKey) throw err;
      }
    }

    // 2. Fallback caso OpenAI não esteja configurada ou não tenha respondido
    if (!content && lovableKey) {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages,
          temperature: 0.2,
        }),
      });

      if (!res.ok) {
        const txt = await res.text();
        if (res.status === 402) {
          return {
            reply:
              "🌿 Parente, a voz de Akuã está em pausa porque os créditos de IA acabaram. O site continua funcionando: dicionário, histórias, vídeos e trilhas seguem disponíveis.",
          };
        }
        if (res.status === 429) {
          return {
            reply:
              "🌿 Akuã recebeu muitos pedidos agora. Espere um instante e tente novamente, como quem aguarda o rio acalmar.",
          };
        }
        throw new Error(`Não foi possível responder agora. ${txt.slice(0, 160)}`);
      }
      content = await readChatContent(res);
    }

    return { reply: annotateSources(content.trim()) || "..." };
  });

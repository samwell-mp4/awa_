/**
 * Suporte ao Dicionário Ilustrado: categorias visuais, classificação por
 * palavras-chave (para categorias que a fonte não marca, como Lugares e Objetos)
 * e escolha de ilustração (emoji) por verbete.
 *
 * Nada aqui altera a grafia da fonte Patxôhã 2015.
 */

export type IlustradoCategoria = {
  key: string;
  label: string;
  emoji: string;
  /** Categoria original da fonte, quando existe. */
  fonte?: string;
  /** Palavras (em português, sem acento) que identificam a categoria. */
  keywords?: string[];
};

export const ILUSTRADO_CATEGORIAS: IlustradoCategoria[] = [
  { key: "numeros", label: "Números", emoji: "🔢", fonte: "Números" },
  { key: "alimentos", label: "Comidas", emoji: "🍲", fonte: "Alimentos" },
  { key: "familia", label: "Família", emoji: "👨‍👩‍👧", fonte: "Família" },
  { key: "animais", label: "Animais", emoji: "🐆", fonte: "Animais" },
  { key: "natureza", label: "Natureza", emoji: "🌿", fonte: "Natureza" },
  { key: "corpo", label: "Corpo Humano", emoji: "🖐️", fonte: "Corpo humano" },
  { key: "verbos", label: "Verbos", emoji: "🏃", fonte: "Verbos" },
  {
    key: "lugares",
    label: "Lugares",
    emoji: "🏞️",
    keywords: [
      "aldeia", "casa", "oca", "cidade", "rio", "mar", "praia", "mata", "floresta",
      "montanha", "serra", "caminho", "estrada", "roca", "roça", "terra", "campo",
      "lagoa", "lago", "ilha", "morro", "vale", "aldeamento", "escola", "igreja",
      "quintal", "curral", "porto", "ponte", "lugar", "sitio", "fazenda",
    ],
  },
  {
    key: "objetos",
    label: "Objetos",
    emoji: "🏺",
    keywords: [
      "arco", "flecha", "borduna", "maracá", "maraca", "cesto", "panela", "pote",
      "faca", "machado", "rede", "cuia", "colar", "cocar", "tacape", "vasilha",
      "banco", "bolsa", "corda", "anzol", "canoa", "remo", "peneira", "cabaca",
      "cabaça", "espelho", "roupa", "chapeu", "chapéu", "sapato", "tambor",
      "flauta", "instrumento", "objeto", "utensilio", "utensílio",
    ],
  },
];

const stripAccents = (s: string) => (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const norm = (s: string) => stripAccents(s).toLowerCase().trim();

const KEYWORD_INDEX: { key: string; words: string[] }[] = ILUSTRADO_CATEGORIAS.filter(
  (c) => c.keywords && c.keywords.length > 0,
).map((c) => ({ key: c.key, words: (c.keywords ?? []).map(norm) }));

const FONTE_INDEX = new Map<string, string>(
  ILUSTRADO_CATEGORIAS.filter((c) => c.fonte).map((c) => [c.fonte as string, c.key]),
);

/** Devolve as chaves de categoria visual de um verbete (pode ser mais de uma). */
export function categoriasDoVerbete(portugues: string, categoriaFonte?: string): string[] {
  const keys = new Set<string>();
  const fromFonte = categoriaFonte ? FONTE_INDEX.get(categoriaFonte) : undefined;
  if (fromFonte) keys.add(fromFonte);
  const p = norm(portugues);
  if (p) {
    for (const entry of KEYWORD_INDEX) {
      if (entry.words.some((w) => p === w || p.startsWith(`${w} `) || p.includes(w))) {
        keys.add(entry.key);
      }
    }
  }
  return Array.from(keys);
}

/** Ilustrações por palavra-chave (português), com fallback por categoria. */
const WORD_EMOJI: [RegExp, string][] = [
  [/^abacate/, "🥑"], [/^abacaxi|anana/, "🍍"], [/^banana/, "🍌"], [/^milho/, "🌽"],
  [/^mandioca|macaxeira|aipim/, "🥔"], [/^feijao/, "🫘"], [/^arroz/, "🍚"], [/^peixe/, "🐟"],
  [/^carne/, "🍖"], [/^ovo/, "🥚"], [/^mel/, "🍯"], [/^agua/, "💧"], [/^cafe/, "☕"],
  [/^caju/, "🥜"], [/^coco/, "🥥"], [/^goiaba|manga|fruta/, "🥭"], [/^melancia/, "🍉"],
  [/^batata/, "🥔"], [/^pao/, "🍞"], [/^sal$/, "🧂"], [/^leite/, "🥛"],
  [/^cachorro|cao$/, "🐕"], [/^gato/, "🐈"], [/^onca|jaguar/, "🐆"], [/^macaco/, "🐒"],
  [/^cobra|serpente/, "🐍"], [/^passaro|ave$/, "🐦"], [/^papagaio|arara/, "🦜"],
  [/^tatu/, "🦔"], [/^veado|cervo/, "🦌"], [/^porco|caitit|queixada/, "🐗"],
  [/^tartaruga|jabuti/, "🐢"], [/^jacare/, "🐊"], [/^borboleta/, "🦋"], [/^abelha/, "🐝"],
  [/^formiga/, "🐜"], [/^aranha/, "🕷️"], [/^peixe|piaba/, "🐟"], [/^galinha|galo/, "🐓"],
  [/^cavalo/, "🐎"], [/^boi|vaca/, "🐄"], [/^rato/, "🐁"], [/^morcego/, "🦇"],
  [/^sol$/, "☀️"], [/^lua$/, "🌙"], [/^estrela/, "⭐"], [/^chuva/, "🌧️"], [/^vento/, "🍃"],
  [/^fogo/, "🔥"], [/^terra/, "🌍"], [/^ceu$/, "🌤️"], [/^rio$/, "🏞️"], [/^mar$/, "🌊"],
  [/^arvore|pau$|madeira/, "🌳"], [/^flor/, "🌸"], [/^folha/, "🍃"], [/^raiz/, "🪵"],
  [/^pedra/, "🪨"], [/^nuvem/, "☁️"], [/^noite/, "🌃"], [/^dia$/, "🌅"], [/^mata|floresta/, "🌴"],
  [/^cabeca/, "🧠"], [/^olho/, "👁️"], [/^boca/, "👄"], [/^orelha|ouvido/, "👂"],
  [/^nariz/, "👃"], [/^mao$|maos/, "🖐️"], [/^pe$|pes$/, "🦶"], [/^dente/, "🦷"],
  [/^coracao/, "❤️"], [/^cabelo/, "💇"], [/^braco/, "💪"], [/^perna/, "🦵"], [/^lingua/, "👅"],
  [/^pai$/, "👨"], [/^mae$/, "👩"], [/^filho|filha/, "🧒"], [/^avo/, "🧓"],
  [/^irmao|irma$/, "🧑‍🤝‍🧑"], [/^crianca|menino|menina/, "🧒"], [/^mulher/, "👩"],
  [/^homem/, "👨"], [/^familia/, "👨‍👩‍👧"], [/^bebe|nene/, "👶"],
  [/^casa|oca$/, "🏠"], [/^aldeia/, "🛖"], [/^caminho|estrada/, "🛤️"], [/^escola/, "🏫"],
  [/^canoa/, "🛶"], [/^arco$/, "🏹"], [/^flecha/, "🏹"], [/^maraca/, "🪇"],
  [/^cesto|cesta/, "🧺"], [/^panela|pote|vasilha/, "🍲"], [/^faca/, "🔪"],
  [/^colar|cocar/, "📿"], [/^rede$/, "🛏️"], [/^tambor/, "🥁"], [/^flauta/, "🪈"],
];

const CAT_EMOJI = new Map(ILUSTRADO_CATEGORIAS.map((c) => [c.key, c.emoji]));

export function emojiDoVerbete(portugues: string, catKeys: string[]): string {
  const p = norm(portugues);
  for (const [re, emoji] of WORD_EMOJI) if (re.test(p)) return emoji;
  for (const k of catKeys) {
    const e = CAT_EMOJI.get(k);
    if (e) return e;
  }
  return "🗣️";
}

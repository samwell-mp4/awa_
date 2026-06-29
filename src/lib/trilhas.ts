export type TrailSlug = "saudacoes" | "familia" | "natureza" | "animais" | "cultura";

export const TRAILS: Record<TrailSlug, {
  slug: TrailSlug;
  name: string;
  emoji: string;
  color: string;
  intro: string;
  categories: string[];
  groups?: { label: string; categories: string[] }[];
  certificate: { title: string; description: string; message: string };
  apoio: string;
}> = {
  saudacoes: {
    slug: "saudacoes",
    name: "Saudações",
    emoji: "🤝",
    color: "from-leaf/40 to-forest-deep/40",
    intro: "Aprenda a chegar, acolher, agradecer e despedir como um parente.",
    categories: ["Saudações"],
    certificate: {
      title: "🤝 AMIGO DAS SAUDAÇÕES",
      description: "Sabe chegar, acolher, agradecer e despedir com respeito e alegria — primeiro passo para falar como parente.",
      message: `🗣️ Professor Akuã diz:\n\n— Muito bem! Agora você já sabe como encontrar qualquer pessoa da aldeia e falar com a nossa voz. Lembre-se: a saudação abre o caminho da conversa, abre o coração e faz com que todos se sintam bem-chegados.\n\nVocê aprendeu: akxãy, hayôkunã, ĩtxê niató, akunã, yamã… Guarde tudo isso como um presente que passa de mão em mão!\n\nTxuhap! — Seguimos para a próxima etapa!`,
    },
    apoio: "🌅 — Saudar é o começo de toda conversa boa.",
  },
  familia: {
    slug: "familia",
    name: "Família",
    emoji: "👨‍👩‍👧‍👦",
    color: "from-gold/40 to-bark/40",
    intro: "Conheça os laços do nosso povo — família é quem vive, cuida e caminha junto.",
    categories: ["Família"],
    certificate: {
      title: "👨‍👩‍👧‍👦 CONHECEDOR DOS LAÇOS",
      description: "Entende que família é muito maior que sangue: é quem vive junto, cuida junto e caminha junto como uma só aldeia.",
      message: `🗣️ Professor Akuã diz:\n\n— Agora você sabe quem somos e como nos organizamos. Aqui, pai, mãe, avô, irmão, cacique, pajé… todos fazem parte de uma grande teia. Ninguém fica sozinho, ninguém fica fora.\n\nQuando você diz os nomes desses parentes, está repetindo a estrutura que nossos antepassados construíram com muito carinho. Você já faz parte dessa família de conhecimento!\n\nAwê — União e força entre todos!`,
    },
    apoio: "👨‍👩‍👧‍👦 — Aqui ninguém fica fora: família é quem vive, cuida e caminha junto.",
  },
  natureza: {
    slug: "natureza",
    name: "Natureza",
    emoji: "🌿",
    color: "from-leaf/50 to-forest-deep/60",
    intro: "Terra, água, sol, mata e rio — todos são parentes nossos.",
    categories: ["Natureza"],
    certificate: {
      title: "🌿 GUARDIÃO DOS PARENTES GRANDES",
      description: "Compreende verdadeiramente: Terra, Água, Sol, Mata, Rio… todos são parentes, têm vida, nome e merecem respeito igual a nós mesmos.",
      message: `🗣️ Professor Akuã diz:\n\n— Essa é a lição mais importante que a terra nos ensina: não somos donos, somos apenas parte de tudo isso. Você aprendeu a chamar cada elemento pelo nome certo, como se estivesse falando com um parente mais velho.\n\nCuida bem do que aprendeu: se você respeita hãhão, miãga e hayô… eles sempre vão trazer vida e fartura para o nosso povo.\n\nRespeito é a nossa maior lei!`,
    },
    apoio: "🌿 — Terra, Água, Árvore, Céu… todos são parentes nossos.",
  },
  animais: {
    slug: "animais",
    name: "Animais",
    emoji: "🐾",
    color: "from-bark/40 to-gold/30",
    intro: "Reconheça cada ser que vive ao nosso lado — cada um traz uma lição.",
    categories: ["Animais"],
    certificate: {
      title: "🐾 OBSERVADOR DA FLORESTA E ÁGUAS",
      description: "Reconhece cada ser que vive ao nosso lado e sabe que cada um traz uma lição, uma história e um lugar especial na criação.",
      message: `🗣️ Professor Akuã diz:\n\n— O bicho não é só coisa que existe: ele é mestre também! Você viu como a onça é forte, como a abelha trabalha junta, como a tartaruga tem paciência e como o pássaro leva mensagem ao céu.\n\nAgora, quando ouvir um canto ou ver um movimento na mata, já sabe o nome e já sabe o que ele veio ensinar. O olhar do Pataxó enxerga muito mais do que só os olhos!\n\nEscute a voz da floresta, ela responde!`,
    },
    apoio: "🐾 — Cada bicho é também um mestre.",
  },
  cultura: {
    slug: "cultura",
    name: "Cultura",
    emoji: "🎨",
    color: "from-gold/50 to-forest-deep/50",
    intro: "Corpo, ações, cores, números e alimentos — o centro onde língua e tradição se encontram.",
    categories: ["Cultura", "Corpo", "Verbos", "Cores", "Números", "Alimentos"],
    groups: [
      { label: "🤍 Corpo — Mapa do Conhecimento", categories: ["Corpo"] },
      { label: "⚡ Ações — Verbos e Tempos", categories: ["Verbos"] },
      { label: "🎨 Cores, Números e Alimentos", categories: ["Cores", "Números", "Alimentos"] },
      { label: "✨ Cultura", categories: ["Cultura"] },
    ],
    certificate: {
      title: "🎨 GUARDIÃO DA PALAVRA E DA VIDA",
      description: "Domina o corpo como mapa, sabe agir, falar, criar, contar e usar as cores — chegou ao centro onde língua, corpo e tradição se encontram.",
      message: `🗣️ Professor Akuã diz:\n\n— Parabéns, caminhante! Você percorreu todo o caminho que preparei. Agora conhece o corpo que é casa, os verbos que movem a vida, as cores que pintam o mundo e tudo que faz o nosso jeito de ser único.\n\n⭐ A maior lição que você leva: A língua não está guardada só no livro ou no dicionário… ela vive quando sai da sua boca! Você se tornou portador dessa voz sagrada para os que virão depois.\n\nMakínã — Somos um povo, somos uma voz, somos eternos!\nTxuhap! — Vamos continuar sempre juntos!`,
    },
    apoio: "🎨 — Cada som é cor, cada palavra é parte do desenho que somos.",
  },
};

export const FRASES_SABEDORIA = [
  "🌱 — Aprender é como plantar: cuida devagar, que cresce forte e dá frutos bons.",
  "👣 — Caminhar com a língua é caminhar com os antepassados ao seu lado.",
  "🗣️ — Palavra bem falada tem força maior que pau e pedra.",
  "🌍 — Se cuidas da terra, terra cuida de ti: lei que não muda nunca.",
  "🤝 — Ninguém aprende sozinho: aprendemos todos juntos, como uma família grande.",
  "🎨 — Cada som é cor, cada palavra é parte do desenho que somos.",
  "💧 — A língua corre como rio: não para, vai sempre avante, mas segue a mesma origem.",
  "✨ — O melhor jeito de guardar conhecimento: usar ele todo dia!",
];

export function fraseDoDia(): string {
  const d = new Date();
  const idx = (d.getFullYear() * 366 + (d.getMonth() + 1) * 31 + d.getDate()) % FRASES_SABEDORIA.length;
  return FRASES_SABEDORIA[idx];
}

const KEY = (slug: string) => `awa_trilha_progress_${slug}`;
export function getLearned(slug: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    return new Set(JSON.parse(localStorage.getItem(KEY(slug)) ?? "[]"));
  } catch {
    return new Set();
  }
}
export function setLearned(slug: string, ids: Set<string>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY(slug), JSON.stringify([...ids]));
}
export function markCertificate(slug: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(`awa_trilha_cert_${slug}`, new Date().toISOString());
}
export function hasCertificate(slug: string): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(`awa_trilha_cert_${slug}`);
}

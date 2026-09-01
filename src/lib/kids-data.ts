/**
 * Conteúdo base da área infantil (reconstruída em 2026-09).
 * Só dados — nenhuma lógica de UI.
 */
import josaImg from "@/assets/kids-stories/josa.jpg.asset.json";
import joaoImg from "@/assets/kids-stories/joao.jpg.asset.json";
import monteImg from "@/assets/kids-stories/monte.jpg.asset.json";
import linguaImg from "@/assets/kids-stories/lingua.jpg.asset.json";
import aldeiaImg from "@/assets/kids-stories/aldeia.jpg.asset.json";
import aweImg from "@/assets/kids-stories/awe.jpg.asset.json";
import arteImg from "@/assets/kids-stories/arte.jpg.asset.json";

export type KidsStory = {
  id: string;
  chip: string;
  chipEmoji: string;
  title: string;
  highlight: string;
  image: string;
  paragraphs: string[];
  quote?: string;
};

export const KIDS_STORIES: KidsStory[] = [
  {
    id: "josa",
    chip: "Guardião da memória",
    chipEmoji: "🪶",
    title: "Ancião Josa",
    highlight: "quem nunca desistiu da aldeia",
    image: josaImg.url,
    paragraphs: [
      "Desde menino, Josa aprendeu que a terra é a mãe que alimenta, que guarda os antigos e ensina os novos.",
      "Ele lutou pela floresta, pelos rios e pela língua Patxôhã, para que nada do povo Pataxó se perdesse com o tempo.",
      "Hoje ele reúne as crianças em volta do fogo e conta as histórias da aldeia — para que a memória continue viva.",
    ],
    quote: "Nossa tradição não é coisa do passado. É o que mantém viva a nossa identidade.",
  },
  {
    id: "joao",
    chip: "In memoriam",
    chipEmoji: "🕯️",
    title: "Ancião João",
    highlight: "cantou até o último Awê",
    image: joaoImg.url,
    paragraphs: [
      "Seu João viu a aldeia crescer, enfrentou muitas lutas e nunca baixou a cabeça — sempre com maracá na mão e sorriso no rosto.",
      "Ele dizia que ser ancião é mais que ter cabelos brancos: é guardar as histórias e plantar hoje para que a aldeia floresça amanhã.",
      "Seu maracá silenciou, mas seu canto segue vivo em cada roda de Awê e em cada criança que aprende Patxôhã.",
    ],
    quote: "Enquanto houver respeito e união, nosso povo seguirá forte.",
  },
  {
    id: "origem",
    chip: "Origem e território",
    chipEmoji: "🗺️",
    title: "A casa Pataxó",
    highlight: "é a Mata Atlântica",
    image: monteImg.url,
    paragraphs: [
      "Os Pataxó vivem no sul da Bahia há muitos e muitos luares, guardando as praias, as matas e o sagrado Monte Pascoal.",
      "São quase 50 aldeias espalhadas pela Bahia e Minas Gerais — cada uma com sua história, seu cacique e seu jeito de cuidar da terra.",
    ],
  },
  {
    id: "lingua",
    chip: "Língua Patxôhã",
    chipEmoji: "🗣️",
    title: "A língua do guerreiro",
    highlight: "está voltando a falar",
    image: linguaImg.url,
    paragraphs: [
      "O Patxôhã quase foi silenciado pelo tempo, mas os anciãos e os professores estão trazendo cada palavra de volta.",
      "Cada nova palavra aprendida é um ancestral que volta a falar — e é assim que a língua fica viva no coração das crianças.",
    ],
  },
  {
    id: "aldeia",
    chip: "Vida na aldeia",
    chipEmoji: "🏡",
    title: "Nossa casa de palha",
    highlight: "vive em roda",
    image: aldeiaImg.url,
    paragraphs: [
      "Na aldeia, todo mundo se cuida: os mais velhos ensinam, as crianças brincam e a comida vem da terra, do rio e do mar.",
      "No pátio central acontecem os conselhos, as danças e as festas — porque tudo o que é bonito, a gente vive junto.",
    ],
  },
  {
    id: "ritual",
    chip: "Espiritualidade e dança",
    chipEmoji: "🔥",
    title: "O Awê é o canto",
    highlight: "que abraça a floresta",
    image: aweImg.url,
    paragraphs: [
      "No Awê, os corpos pintados de urucum e jenipapo dançam em roda, ao som do maracá, unindo o povo aos encantados da mata.",
      "É um agradecimento cantado: à floresta, aos animais e a cada estrela que vela a aldeia à noite.",
    ],
  },
  {
    id: "arte",
    chip: "Arte e artesanato",
    chipEmoji: "🎨",
    title: "Mãos que contam",
    highlight: "a história do povo",
    image: arteImg.url,
    paragraphs: [
      "Sementes, penas, fibras e barro viram colares, cocares e cestos nas mãos dos artesãos Pataxó.",
      "Cada risquinho, cada grafismo é uma palavra antiga — arte que também é escrita ancestral.",
    ],
  },
];

export type KidsWord = { px: string; pt: string; emoji: string };

/** Palavras Patxôhã usadas nos joguinhos. */
export const KIDS_WORDS: KidsWord[] = [
  { px: "Y", pt: "Água", emoji: "💧" },
  { px: "Tatá", pt: "Fogo", emoji: "🔥" },
  { px: "Kwaracy", pt: "Sol", emoji: "☀️" },
  { px: "Jaci", pt: "Lua", emoji: "🌙" },
  { px: "Panã", pt: "Borboleta", emoji: "🦋" },
  { px: "Pirá", pt: "Peixe", emoji: "🐟" },
];

export const KIDS_NUMBERS = [
  { n: 1, pt: "Um" },
  { n: 2, pt: "Dois" },
  { n: 3, pt: "Três" },
  { n: 4, pt: "Quatro" },
  { n: 5, pt: "Cinco" },
  { n: 6, pt: "Seis" },
  { n: 7, pt: "Sete" },
  { n: 8, pt: "Oito" },
  { n: 9, pt: "Nove" },
  { n: 10, pt: "Dez" },
];

import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Leaf, Sparkles, Users, Palette, Shield, Camera } from "lucide-react";

import danca from "@/assets/pataxo-danca.jpg";
import aldeia from "@/assets/pataxo-aldeia.jpg";
import artesanato from "@/assets/pataxo-artesanato.jpg";
import monte from "@/assets/pataxo-monte-pascoal.jpg";
import anciao from "@/assets/pataxo-anciao.jpg";

import meninoCocar1 from "@/assets/album/menino-cocar-1.jpg.asset.json";
import meninoCocar2 from "@/assets/album/menino-cocar-2.jpg.asset.json";
import feiraArtesanato from "@/assets/album/feira-artesanato.jpg.asset.json";
import colaresMicangas from "@/assets/album/colares-micangas.jpg.asset.json";
import pinturaCorporal from "@/assets/album/pintura-corporal.jpg.asset.json";
import guerreirosOncas from "@/assets/album/guerreiros-oncas.jpg.asset.json";
import mulherFestival from "@/assets/album/mulher-festival.jpg.asset.json";
import mulherFlores1 from "@/assets/album/mulher-flores-1.jpg.asset.json";
import mulherFlores2 from "@/assets/album/mulher-flores-2.jpg.asset.json";

type AlbumStory = {
  id: string;
  image: string;
  title: string;
  caption: string;
  story: string;
};

const albumStories: AlbumStory[] = [
  {
    id: "cocar-guerreiro",
    image: meninoCocar1.url,
    title: "O pequeno guerreiro do cocar",
    caption: "Kijeme — o cocar de penas de gavião",
    story:
      "O cocar não é enfeite: é coroa espiritual. Cada pena conta uma história — do gavião que voa alto, do caçador que respeita a mata, do ancião que rezou antes do corte. Quando uma criança Pataxó recebe seu primeiro kijeme, a aldeia inteira reconhece: ali caminha um novo guardião do território.",
  },
  {
    id: "olhar-mata",
    image: meninoCocar2.url,
    title: "O olhar que atravessa a mata",
    caption: "Retrato de um futuro pajé",
    story:
      "Nos olhos das crianças Pataxó mora a memória dos antepassados. É pelo brincar, pelo escutar dos mais velhos e pelo cantar do Awê que o Patxôhã volta a ser primeiro idioma. Cada criança que aprende uma palavra da língua é um ancestral que respira de novo.",
  },
  {
    id: "feira-artesanato",
    image: feiraArtesanato.url,
    title: "A feira é território",
    caption: "Miçangas, cuias e conversa",
    story:
      "Nas feiras de economia solidária, o povo Pataxó espalha sobre a mesa de madeira aquilo que a floresta e as mãos criaram: cuias de coco, pulseiras de miçanga, colares de sementes. Vender uma peça é partilhar um pedaço vivo da cultura — e transformar cada visitante em aliado da luta pela terra.",
  },
  {
    id: "colares",
    image: colaresMicangas.url,
    title: "Grafismos em miçanga",
    caption: "Cada linha é uma reza",
    story:
      "Os grafismos das pulseiras e colares Pataxó são escrita ancestral. Losangos falam do peixe, zigue-zagues do rio, triângulos das montanhas. Tecer miçanga é rezar com as mãos — cada conta enfiada carrega a paciência das avós e o desenho do território.",
  },
  {
    id: "pintura",
    image: pinturaCorporal.url,
    title: "Pintura de guerreiro",
    caption: "Jenipapo e urucum sobre a pele",
    story:
      "Antes do ritual, o corpo é o primeiro altar. O jenipapo preto e o urucum vermelho traçam linhas retas do rosto ao peito — proteção, coragem e pertencimento. Quem pinta e quem é pintado entram em silêncio: ali começa a conversa com os encantados.",
  },
  {
    id: "oncas",
    image: guerreirosOncas.url,
    title: "Filhos da onça",
    caption: "Sob o céu de fim de tarde",
    story:
      "Cobertos de pintura de onça, dois jovens Pataxó se preparam para o Awê. A onça é força, é vigilância, é ancestralidade. Ao vestir o desenho no corpo, eles assumem o compromisso de defender a mata, a aldeia e o nome do povo — como fazem os felinos que ainda caminham no Monte Pascoal.",
  },
  {
    id: "festival",
    image: mulherFestival.url,
    title: "Mulher Pataxó no Festival",
    caption: "Presença que ocupa a cidade",
    story:
      "Levar as pinturas, os colares e o topete de penas para dentro do Festival Nacional de Economia Solidária é dizer: nós existimos, nós criamos, nós resistimos. As mulheres Pataxó ocupam praças, universidades e ruas — e onde chegam, a cidade aprende que o Brasil é indígena antes de tudo.",
  },
  {
    id: "flores-1",
    image: mulherFlores1.url,
    title: "Flor da mata no rosto",
    caption: "Coroa de flores e penas",
    story:
      "As riscas finas de jenipapo no rosto marcam a idade adulta e o pertencimento. Ao lado delas, penas verdes de papagaio e flores vermelhas do jardim da aldeia coroam a beleza feminina Pataxó — beleza que nasce da terra, do cuidado e do orgulho de ser quem se é.",
  },
  {
    id: "flores-2",
    image: mulherFlores2.url,
    title: "Guardiã da beleza",
    caption: "Awê no olhar",
    story:
      "A cultura Pataxó não é vitrine: é vida diária. É acordar, se pintar, cantar o Tohé, colher fruta, ensinar Patxôhã à filha, tecer colar para o neto. Nesse rosto sereno há gerações de mulheres que seguraram, com as próprias mãos, a memória de todo um povo.",
  },
];

export const Route = createFileRoute("/historias")({
  head: () => ({
    meta: [
      { title: "Histórias Pataxó — AWÃ TECH" },
      {
        name: "description",
        content:
          "Histórias do povo Pataxó: origem, território, língua Patxôhã, espiritualidade, arte, alimentação e resistência. Guardiões da Mata Atlântica.",
      },
      { property: "og:title", content: "Histórias Pataxó — AWÃ TECH" },
      {
        property: "og:description",
        content:
          "Conheça a história, cultura e resistência do povo Pataxó, guardiões do sul da Bahia e do Monte Pascoal.",
      },
      { property: "og:image", content: danca },
      { name: "twitter:image", content: danca },
    ],
  }),
  component: HistoriasPage,
});

type Section = {
  id: string;
  title: string;
  icon: typeof Leaf;
  image: string;
  body: string[];
};

const sections: Section[] = [
  {
    id: "origem",
    title: "Origem e Território",
    icon: MapPin,
    image: monte,
    body: [
      "Os Pataxó habitam o sul da Bahia há milênios — guardiões da Mata Atlântica, do litoral e do sagrado Monte Pascoal, no Parque Nacional que leva o mesmo nome.",
      "Pertencem ao tronco linguístico Macro-Jê e hoje vivem em cerca de 50 aldeias espalhadas pela Bahia e Minas Gerais, em cidades como Porto Seguro, Santa Cruz Cabrália e Carmésia.",
      "Antes da chegada dos europeus em 1500, o território Pataxó era um vasto corredor de florestas e praias onde caça, pesca e roça se entrelaçavam com a vida espiritual.",
    ],
  },
  {
    id: "lingua",
    title: "A Língua Patxôhã",
    icon: Sparkles,
    image: anciao,
    body: [
      "O Patxôhã — “língua de guerreiro” — é o idioma materno do povo Pataxó. Quase silenciado pela colonização, vem sendo retomado desde os anos 1990 por mestres, anciãos e jovens pesquisadores.",
      "A retomada linguística é um ato político e espiritual: cada palavra reaprendida é um ancestral que volta a falar. Hoje, escolas indígenas bilíngues ensinam Patxôhã às novas gerações.",
      "No AWÃ TECH você pode estudar o dicionário Patxôhã e conversar com o Professor Akuã para aprender saudações, formar frases e mergulhar na cosmovisão Pataxó.",
    ],
  },
  {
    id: "aldeia",
    title: "Vida na Aldeia",
    icon: Users,
    image: aldeia,
    body: [
      "Nas aldeias Pataxó, as casas de palha e madeira se abrem para um pátio central onde acontecem os encontros, danças e conselhos.",
      "A vida coletiva é regida pelo respeito aos mais velhos, pelo cuidado com as crianças e pela partilha do que vem da terra, do rio e do mar.",
      "Cada aldeia tem seu cacique, seu pajé e seus grupos de cultura, que mantêm vivos os cantos, as pinturas corporais e os rituais herdados dos antepassados.",
    ],
  },
  {
    id: "ritual",
    title: "Espiritualidade e Dança",
    icon: Leaf,
    image: danca,
    body: [
      "O Awê é a dança-ritual mais sagrada do povo Pataxó: em roda, ao som de maracás e cantos, os corpos pintados com urucum e jenipapo celebram a união com a floresta e os encantados.",
      "Pajés conduzem rezas e curas com plantas medicinais, mantendo a ponte entre o mundo visível e o mundo dos espíritos da mata.",
      "Festas como a Semana do Índio em Coroa Vermelha e os Jogos Indígenas reúnem aldeias inteiras em torno da memória ancestral.",
    ],
  },
  {
    id: "arte",
    title: "Arte e Artesanato",
    icon: Palette,
    image: artesanato,
    body: [
      "Sementes da mata, penas, fibras de piaçava, madeira e barro viram colares, cocares, cestos, arcos e cerâmica nas mãos dos artesãos Pataxó.",
      "Cada peça carrega grafismos que contam histórias do povo, dos bichos e da floresta — é arte e é escrita ancestral.",
      "O artesanato sustenta muitas famílias e é também forma de resistência: vender uma peça é compartilhar um pedaço vivo da cultura.",
    ],
  },
  {
    id: "alimentacao",
    title: "Alimentação Tradicional",
    icon: Leaf,
    image: aldeia,
    body: [
      "A culinária Pataxó é fruto da relação íntima com a floresta e o mar: peixes assados na folha de patioba, mandioca, milho, aipim, frutos da mata e palmito.",
      "Bebidas como o cauim, fermentado de mandioca ou de frutas, marcam celebrações e rituais.",
      "Comer junto, ao redor do fogo, é também rezar — é reafirmar que a vida vem da terra cuidada por gerações.",
    ],
  },
  {
    id: "resistencia",
    title: "Resistência Hoje",
    icon: Shield,
    image: monte,
    body: [
      "Os Pataxó são símbolo de resistência: lutam pela demarcação oficial de suas terras, contra o desmatamento e a exploração turística desordenada.",
      "Fazem da cultura sua principal arma — com museus indígenas, escolas bilíngues, grupos de arte, comunicação própria e presença forte nas redes.",
      "Em Salvador e em todo o sul da Bahia, a presença Pataxó marca a identidade baiana viva e original. Ouvir suas histórias é honrar o Brasil que existe há muito mais tempo do que 1500.",
    ],
  },
];

function HistoriasPage() {
  return (
    <div className="min-h-screen bg-[oklch(0.16_0.04_145)] text-amber-50">
      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={danca}
            alt="Dança ritual Pataxó na floresta"
            width={1920}
            height={1080}
            className="h-full w-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.16_0.04_145/0.5)] via-[oklch(0.16_0.04_145/0.75)] to-[oklch(0.16_0.04_145)]" />
        </div>

        <div className="relative mx-auto max-w-5xl px-5 pt-8 pb-20 md:pt-12 md:pb-28">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-black/30 px-3 py-1.5 text-sm text-amber-100 backdrop-blur hover:bg-black/50"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>

          <p className="mt-8 text-sm uppercase tracking-[0.3em] text-gold">
            🪶 Histórias do Povo
          </p>
          <h1 className="mt-3 font-serif text-4xl leading-tight md:text-6xl">
            Pataxó —{" "}
            <span className="text-gold">guardiões da Mata Atlântica</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base text-amber-100/85 md:text-lg">
            Origem, território, língua, espiritualidade, arte e resistência de
            um povo que faz da cultura sua arma mais bonita.
          </p>
        </div>
      </header>

      {/* Sections */}
      <main className="mx-auto max-w-5xl px-5 pb-32">
        <div className="space-y-16 md:space-y-24">
          {sections.map((s, i) => {
            const Icon = s.icon;
            const reverse = i % 2 === 1;
            return (
              <section
                key={s.id}
                id={s.id}
                className={`grid items-center gap-8 md:grid-cols-2 ${
                  reverse ? "md:[&>*:first-child]:order-2" : ""
                }`}
              >
                <div className="group relative overflow-hidden rounded-3xl border border-gold/25 shadow-2xl shadow-black/40">
                  <img
                    src={s.image}
                    alt={s.title}
                    loading="lazy"
                    width={1024}
                    height={1024}
                    className="aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-black/50 px-3 py-1 text-xs text-amber-100 backdrop-blur">
                    <Icon className="h-3.5 w-3.5 text-gold" />
                    {s.title}
                  </div>
                </div>

                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs uppercase tracking-widest text-gold">
                    <Icon className="h-3.5 w-3.5" /> Capítulo {i + 1}
                  </div>
                  <h2 className="mt-3 font-serif text-3xl text-amber-50 md:text-4xl">
                    {s.title}
                  </h2>
                  <div className="mt-4 space-y-3 text-amber-100/85 leading-relaxed">
                    {s.body.map((p, idx) => (
                      <p key={idx}>{p}</p>
                    ))}
                  </div>
                </div>
              </section>
            );
          })}
        </div>

        {/* Álbum de Histórias */}
        <div className="mt-24">
          <div className="mb-8 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gold/15 text-gold">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-serif text-3xl text-amber-50 md:text-4xl">Álbum de Histórias</h2>
              <p className="text-sm text-amber-100/70">Retratos vivos do povo Pataxó — cada foto, uma memória.</p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {albumStories.map((a) => (
              <article
                key={a.id}
                className="group overflow-hidden rounded-3xl border border-gold/25 bg-black/40 shadow-2xl shadow-black/40 backdrop-blur transition hover:border-gold/50"
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img
                    src={a.image}
                    alt={a.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <p className="text-xs uppercase tracking-widest text-gold">{a.caption}</p>
                    <h3 className="mt-1 font-serif text-xl text-amber-50">{a.title}</h3>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-sm leading-relaxed text-amber-100/85">{a.story}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Closing */}
        <div className="mt-20 rounded-3xl border border-gold/25 bg-gradient-to-br from-black/40 to-emerald-950/40 p-8 text-center backdrop-blur">
          <p className="font-serif text-2xl text-gold">Ahuanã!</p>
          <p className="mt-2 text-amber-100/85">
            Que estas histórias caminhem com você. Aprenda a língua, ouça os
            cantos e ajude a manter viva a memória Pataxó.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link
              to="/professor"
              className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-emerald-950 hover:brightness-110"
            >
              Conversar com Professor Akuã
            </Link>
            <Link
              to="/musicas"
              className="rounded-full border border-gold/40 px-5 py-2 text-sm text-amber-100 hover:bg-white/5"
            >
              Ouvir cantos Pataxó
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

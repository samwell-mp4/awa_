import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Leaf, Sparkles, Users, Palette } from "lucide-react";

import danca from "@/assets/pataxo-danca.jpg";
import aldeia from "@/assets/pataxo-aldeia.jpg";
import artesanato from "@/assets/pataxo-artesanato.jpg";
import monte from "@/assets/pataxo-monte-pascoal.jpg";
import anciao from "@/assets/pataxo-anciao.jpg";

import albumPaje from "@/assets/album/paje.jpg.asset.json";
import albumGuerreiraFestival from "@/assets/album/guerreira-festival.jpg.asset.json";
import albumGuerreiraCocar from "@/assets/album/guerreira-cocar.jpg.asset.json";
import albumGuerreiros from "@/assets/album/guerreiros-pintura.jpg.asset.json";
import albumCriancaCocar from "@/assets/album/crianca-cocar.jpg.asset.json";
import albumCriancaJogos from "@/assets/album/crianca-jogos.jpg.asset.json";
import albumPintura from "@/assets/album/pintura-corporal.jpg.asset.json";

const album = [
  {
    src: albumPaje.url,
    title: "O Pajé — guardião do sagrado",
    text: "O pajé carrega no cocar de penas e nos colares de sementes a força espiritual do povo. É ele quem conduz as rezas, cura com plantas da mata e mantém a ponte entre a aldeia e os encantados da floresta.",
  },
  {
    src: albumGuerreiraFestival.url,
    title: "Mulher Pataxó em festival",
    text: "As pinturas de urucum no rosto marcam identidade, proteção e pertencimento. Cada traço conta de onde ela vem, de qual aldeia, de qual linhagem — a pele vira território de memória.",
  },
  {
    src: albumGuerreiraCocar.url,
    title: "Cocar de plumas e flor",
    text: "Os grafismos finos em preto no rosto representam os caminhos da mata e a coragem. O cocar com penas verdes, amarelas e a flor vermelha celebra a beleza da floresta viva que vestimos.",
  },
  {
    src: albumGuerreiros.url,
    title: "Jovens guerreiros pintados de onça",
    text: "A pintura de jenipapo em pintas de onça convoca a força do maior predador da mata. Antes de rituais e jogos, os jovens vestem o corpo do animal-espírito para dançar, correr e resistir.",
  },
  {
    src: albumCriancaCocar.url,
    title: "Menino com cocar ancestral",
    text: "Desde cedo as crianças aprendem que o cocar não é adorno: é responsabilidade. Usar as penas dos pais é aceitar o compromisso de cuidar da língua, da terra e das histórias do povo.",
  },
  {
    src: albumCriancaJogos.url,
    title: "Nova geração nos Jogos Indígenas",
    text: "Os Jogos Indígenas Pataxó reúnem aldeias inteiras em corridas, arco e flecha, cabo de guerra e canoagem. Para as crianças, é festa; para os mais velhos, é a certeza de que a cultura segue viva.",
  },
  {
    src: albumPintura.url,
    title: "A pintura corporal como escrita",
    text: "Cada linha aplicada com pincel de fibra e tinta de jenipapo é uma palavra antiga. Os traços nos ombros, no rosto e no peito narram alianças, dons de caça, passagens de vida — é a escrita viva do povo.",
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


        {/* Álbum cultural */}
        <section className="mt-20">
          <div className="mb-8 text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-gold">📸 Álbum do Povo</p>
            <h2 className="mt-2 font-serif text-3xl text-amber-50 md:text-4xl">
              Rostos, pinturas e rituais Pataxó
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-amber-100/80">
              Cada foto é um pedaço vivo da cultura — pinturas, cocares e gerações que caminham juntas.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {album.map((item) => (
              <figure
                key={item.title}
                className="group overflow-hidden rounded-3xl border border-gold/25 bg-black/30 shadow-xl shadow-black/40 backdrop-blur"
              >
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    src={item.src}
                    alt={item.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <figcaption className="p-5">
                  <h3 className="font-serif text-lg text-gold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-amber-100/85">
                    {item.text}
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

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

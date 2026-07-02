import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Music, Heart, Droplets, Flame, PartyPopper, Users, Sparkles, ScrollText, Camera } from "lucide-react";

import danca from "@/assets/pataxo-danca.jpg";
import aldeia from "@/assets/pataxo-aldeia.jpg";
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

type AlbumEntry = {
  id: string;
  image: string;
  title: string;
  caption: string;
  story: string;
};

const album: AlbumEntry[] = [
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

export const Route = createFileRoute("/cultura")({
  head: () => ({
    meta: [
      { title: "Cultura Pataxó — Rituais e Festas — AWÃ TECH" },
      {
        name: "description",
        content:
          "Conheça os rituais e festas do povo Pataxó: Tohé, Awê, Ritual da Chuva, namoro, casamento, Arsgwaksá e Folia de Reis. Tradições vivas do sul da Bahia.",
      },
      { property: "og:title", content: "Cultura Pataxó — Rituais e Festas — AWÃ TECH" },
      {
        property: "og:description",
        content:
          "Rituais sagrados e festas tradicionais do povo Pataxó: dança, oração, resistência e celebração.",
      },
      { property: "og:image", content: danca },
      { name: "twitter:image", content: danca },
    ],
  }),
  component: CulturaPage,
});

type Ritual = {
  id: string;
  title: string;
  subtitle: string;
  icon: typeof Music;
  image: string;
  body: string[];
};

const rituals: Ritual[] = [
  {
    id: "tohe",
    title: "Tohé",
    subtitle: "Oração coletiva em dança",
    icon: Music,
    image: monte,
    body: [
      "Nos dias de rituais, todos os índios se reúnem para dançar o Tohé — uma forma de oração coletiva que pode ser celebrada em momentos tristes ou alegres.",
      "Através do canto e da dança, o povo Pataxó adquire as energias da terra, do ar, da água, do fogo e de todas as forças positivas da natureza.",
      "Crianças, jovens, adultos e idosos dançam juntos, fortalecendo a união entre as gerações e a conexão com o território sagrado.",
    ],
  },
  {
    id: "awe",
    title: "Awê",
    subtitle: "Amor, união e espiritualidade",
    icon: Heart,
    image: danca,
    body: [
      "Awê significa amor, união e espiritualidade com a natureza. É o mais antigo ritual Pataxó — sempre existiu, e ninguém sabe informar quando começou.",
      "Engloba coreografias variadas, onde cada pessoa dança com um sentido determinado. Em Coroa Vermelha, os Pataxó estão resgatando a cultura dos antepassados, preservando partes sagradas que não podem ser mostradas aos não indígenas.",
      "Como afirma o líder Nelson Saracura: “O segredo do ritual é a segurança, é a resistência de nós como área indígena.”",
    ],
  },
  {
    id: "chuva",
    title: "Ritual da Chuva",
    subtitle: "Agradecimento às águas",
    icon: Droplets,
    image: anciao,
    body: [
      "Antigamente, os índios mais velhos realizavam o ritual da chuva quando a terra precisava dela. Eles amontoadavam galhos e folhas, colocavam fogo e, com a fumaça subindo, formavam a nuvem que trazia a chuva.",
      "Se o ritual fosse feito de manhã, a chuva cairia à tarde. Ao final, o canto de agradecimento selava a relação de respeito entre o povo e as águas.",
      "Nos dias 5 e 12 de outubro, os Pataxó realizam o ritual da água para agradecer pela chuva, protetora das colheitas. A celebração termina com um banho de lama e água, simbolizando a purificação do corpo e da mente.",
    ],
  },
];

const festivals: Ritual[] = [
  {
    id: "casamento",
    title: "Namoro e Casamento",
    subtitle: "União em comunidade",
    icon: Users,
    image: aldeia,
    body: [
      "O namoro Pataxó é discreto: quando dois jovens se interessam, começam a se jogar pedrinhas — um sinal de que já estão namorando.",
      "Para pedir a namorada em casamento, o rapaz entrega uma flor. Se ela aceitar, a resposta é “sim”. Os noivos comunicam as famílias e o cacique, e começam os preparativos: o noivo arruma sua casa e seu roçado.",
      "Na cerimônia, o noivo carrega uma pedra por uma distância determinada pelo cacique e pelos pais dela. A pedra representa o peso e a responsabilidade da união. Se não conseguir, não haverá casamento. Ao chegar, eles trocam cocares, simbolizando a união, e toda a aldeia celebra com cauim.",
    ],
  },
  {
    id: "arsgwaksa",
    title: "Arsgwaksá",
    subtitle: "Aniversário do Projeto Jaqueira",
    icon: Flame,
    image: danca,
    body: [
      "Arsgwaksá é a festa comemorativa do aniversário do Projeto Jaqueira, o primeiro projeto implantado em uma aldeia indígena da região.",
      "Os índios da reserva participam de um projeto de responsabilidade social, e a festa inclui apresentações culturais e provas físicas.",
      "É um momento de celebração comunitária, onde cultura, esporte e trabalho coletivo se encontram para fortalecer a vida na aldeia.",
    ],
  },
  {
    id: "folia",
    title: "Folia de Reis",
    subtitle: "Festa, reza e sinuca",
    icon: PartyPopper,
    image: aldeia,
    body: [
      "Na tribo Pataxó, é comum o relato da folia e da esmola do Divino Espírito Santo. Um grupo de foliões chega carregando uma bandeira e se dirige à capela, depois de recolher as esmolas.",
      "A reza noturna atrai a população local. No lugarejo principal da aldeia, barracas iluminadas são montadas e a sinuca se torna a principal atração.",
      "Crianças e jovens desfilam com suas melhores roupas, mostrando como a cultura Pataxó acolhe e resignifica celebrações, mantendo o espírito de comunidade.",
    ],
  },
];

function CulturaPage() {
  return (
    <div className="min-h-screen bg-[oklch(0.16_0.04_145)] text-amber-50">
      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={danca}
            alt="Dança ritual Pataxó com cocares e pinturas corporais"
            width={1920}
            height={1080}
            className="h-full w-full object-cover opacity-55"
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

          <p className="mt-8 text-sm uppercase tracking-[0.3em] text-gold">🪶 Tradições Vivas</p>
          <h1 className="mt-3 font-serif text-4xl leading-tight md:text-6xl">
            Rituais e festas <span className="text-gold">Pataxó</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base text-amber-100/85 md:text-lg">
            Danças, rezas, celebrações e ritos de passagem que mantêm viva a memória do povo
            guardião da Mata Atlântica.
          </p>
        </div>
      </header>

      {/* Introdução */}
      <main className="mx-auto max-w-5xl px-5 pb-32">
        <section className="rounded-3xl border border-gold/25 bg-gradient-to-br from-black/40 to-emerald-950/40 p-6 backdrop-blur md:p-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs uppercase tracking-widest text-gold">
            <Sparkles className="h-3.5 w-3.5" /> Cultura
          </div>
          <p className="mt-4 text-amber-100/85 leading-relaxed">
            Como a maioria dos povos indígenas, os Pataxó possuem diversas tradições. São
            guerreiros que lutam para se firmar em seu território e preservar a língua, a história
            e a cultura. Cada ritual e festa é uma forma de resistência, celebração e transmissão
            de conhecimento entre gerações.
          </p>
        </section>

        {/* Rituais */}
        <div className="mt-16">
          <div className="mb-8 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gold/15 text-gold">
              <Flame className="h-5 w-5" />
            </div>
            <h2 className="font-serif text-3xl text-amber-50 md:text-4xl">Rituais</h2>
          </div>
          <div className="space-y-12 md:space-y-16">
            {rituals.map((s, i) => {
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
                      <Icon className="h-3.5 w-3.5" /> Ritual {i + 1}
                    </div>
                    <h3 className="mt-3 font-serif text-3xl text-amber-50 md:text-4xl">{s.title}</h3>
                    <p className="mt-1 text-sm font-medium text-gold/80">{s.subtitle}</p>
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
        </div>

        {/* Festas */}
        <div className="mt-20">
          <div className="mb-8 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gold/15 text-gold">
              <PartyPopper className="h-5 w-5" />
            </div>
            <h2 className="font-serif text-3xl text-amber-50 md:text-4xl">Festas</h2>
          </div>
          <div className="space-y-12 md:space-y-16">
            {festivals.map((s, i) => {
              const Icon = s.icon;
              const reverse = i % 2 === 0;
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
                      <Icon className="h-3.5 w-3.5" /> Festa {i + 1}
                    </div>
                    <h3 className="mt-3 font-serif text-3xl text-amber-50 md:text-4xl">{s.title}</h3>
                    <p className="mt-1 text-sm font-medium text-gold/80">{s.subtitle}</p>
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
        </div>

        {/* Closing */}
        <div className="mt-20 rounded-3xl border border-gold/25 bg-gradient-to-br from-black/40 to-emerald-950/40 p-8 text-center backdrop-blur">
          <p className="font-serif text-2xl text-gold">Ahuanã!</p>
          <p className="mt-2 text-amber-100/85">
            Cada ritual e cada festa é um ato de resistência. Aprenda a língua, ouça os cantos e
            ajude a manter viva a cultura Pataxó.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link
              to="/historias"
              className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-emerald-950 hover:brightness-110"
            >
              <ScrollText className="mr-2 inline-block h-4 w-4" /> Histórias Pataxó
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

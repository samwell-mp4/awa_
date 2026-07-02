import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Leaf, Sparkles, Users, Palette, Shield, Camera, Music, Heart, Droplets, Flame, PartyPopper, Compass } from "lucide-react";

import danca from "@/assets/pataxo-danca.jpg";
import aldeia from "@/assets/pataxo-aldeia.jpg";
import artesanato from "@/assets/pataxo-artesanato.jpg";
import monte from "@/assets/pataxo-monte-pascoal.jpg";
import anciao from "@/assets/pataxo-anciao.jpg";



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
  {
    id: "cosmovisao",
    title: "Cosmovisão",
    icon: Compass,
    image: monte,
    body: [
      "Para os Pataxó, tudo é vivo: a mata, o rio, a pedra, o vento. Não existe separação entre humano e natureza — somos todos parentes de uma mesma origem, filhos da terra e dos encantados.",
      "Niamisú, o Grande Espírito, sopra em cada folha, em cada bicho, em cada trovão. Os pajés são a ponte entre o mundo visível e o mundo dos encantados que habitam a floresta, as águas e o Monte Pascoal.",
      "Viver bem é viver em equilíbrio — pescar sem esgotar, plantar sem envenenar, colher sem destruir. A cosmovisão Pataxó é uma ética prática: cuidar da terra é cuidar de si mesmo e dos que virão.",
    ],
  },
  {
    id: "grafismo",
    title: "Grafismos Sagrados",
    icon: Palette,
    image: colaresMicangas.url,
    body: [
      "Os grafismos Pataxó são escrita ancestral. Cada traço tem nome, cada forma tem significado: losangos são peixes, zigue-zagues são rios, triângulos são montanhas, círculos são a comunidade reunida em roda.",
      "Pintados no corpo com jenipapo e urucum, tecidos em miçangas, entalhados em cuias e cerâmicas — os grafismos contam de onde vem cada família, qual bicho a protege, que caminho ela caminha.",
      "Aprender a ler os grafismos é aprender a ler a floresta. É reconhecer que, muito antes do alfabeto latino, os povos originários já escreviam suas leis, suas rezas e suas histórias no próprio corpo e nos objetos do cotidiano.",
    ],
  },
  {
    id: "tohe",
    title: "Tohé — Oração em Dança",
    icon: Music,
    image: monte,
    body: [
      "Nos dias de ritual, todos se reúnem para dançar o Tohé — uma forma de oração coletiva celebrada em momentos tristes ou alegres.",
      "Pelo canto e pela dança, o povo Pataxó adquire as energias da terra, do ar, da água, do fogo e de todas as forças positivas da natureza.",
      "Crianças, jovens, adultos e idosos dançam juntos, fortalecendo a união entre gerações e a conexão com o território sagrado.",
    ],
  },
  {
    id: "awe",
    title: "Awê — Amor e União",
    icon: Heart,
    image: danca,
    body: [
      "Awê significa amor, união e espiritualidade com a natureza. É o mais antigo ritual Pataxó — sempre existiu, e ninguém sabe informar quando começou.",
      "Engloba coreografias variadas, onde cada pessoa dança com um sentido determinado. Em Coroa Vermelha, os Pataxó resgatam a cultura dos antepassados, preservando partes sagradas que não podem ser mostradas aos não indígenas.",
      "Como afirma o líder Nelson Saracura: “O segredo do ritual é a segurança, é a resistência de nós como área indígena.”",
    ],
  },
  {
    id: "chuva",
    title: "Ritual da Chuva",
    icon: Droplets,
    image: anciao,
    body: [
      "Antigamente, os índios mais velhos realizavam o ritual da chuva quando a terra precisava dela. Amontoavam galhos e folhas, colocavam fogo e, com a fumaça subindo, formavam a nuvem que trazia a chuva.",
      "Se o ritual fosse feito de manhã, a chuva cairia à tarde. Ao final, o canto de agradecimento selava a relação de respeito entre o povo e as águas.",
      "Nos dias 5 e 12 de outubro, os Pataxó realizam o ritual da água para agradecer pela chuva, protetora das colheitas. A celebração termina com um banho de lama e água — purificação do corpo e da mente.",
    ],
  },
  {
    id: "casamento",
    title: "Namoro e Casamento",
    icon: Users,
    image: aldeia,
    body: [
      "O namoro Pataxó é discreto: quando dois jovens se interessam, começam a se jogar pedrinhas — sinal de que já estão namorando.",
      "Para pedir a namorada em casamento, o rapaz entrega uma flor. Se ela aceitar, a resposta é “sim”. Os noivos comunicam as famílias e o cacique, e começam os preparativos: o noivo arruma sua casa e seu roçado.",
      "Na cerimônia, o noivo carrega uma pedra por uma distância determinada pelo cacique e pelos pais dela — a pedra representa o peso da união. Ao chegar, trocam cocares, e toda a aldeia celebra com cauim.",
    ],
  },
  {
    id: "arsgwaksa",
    title: "Arsgwaksá",
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
    icon: PartyPopper,
    image: aldeia,
    body: [
      "Na tribo Pataxó é comum o relato da folia e da esmola do Divino Espírito Santo. Um grupo de foliões chega carregando uma bandeira e se dirige à capela, depois de recolher as esmolas.",
      "A reza noturna atrai a população local. No lugarejo principal da aldeia, barracas iluminadas são montadas e a sinuca se torna a principal atração.",
      "Crianças e jovens desfilam com suas melhores roupas, mostrando como a cultura Pataxó acolhe e resignifica celebrações, mantendo o espírito de comunidade.",
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

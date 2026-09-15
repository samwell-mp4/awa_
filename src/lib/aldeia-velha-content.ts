// Conteúdo fiel ao relatório "SOMOS TODOS ALDEIA VELHA" —
// Comunidade Indígena Pataxó Aldeia Velha (C.I.P.A.V.), Porto Seguro, junho de 2026.
// Todas as fotos são as imagens reais do documento. Nenhuma informação foi inventada.

import capa from "@/assets/aldeia-velha/av-001-003.jpg.asset.json";
import retomada1998 from "@/assets/aldeia-velha/av-003-006.jpg.asset.json";
import familiaJosevaldo from "@/assets/aldeia-velha/av-006-010.jpg.asset.json";
import oriene from "@/assets/aldeia-velha/av-007-012.jpg.asset.json";
import familiaNair from "@/assets/aldeia-velha/av-008-014.jpg.asset.json";
import ancia from "@/assets/aldeia-velha/av-010-017.jpg.asset.json";
import antonioNobre from "@/assets/aldeia-velha/av-011-019.jpg.asset.json";
import professoraParu from "@/assets/aldeia-velha/av-012-021.jpg.asset.json";
import caciqueIpe from "@/assets/aldeia-velha/av-013-023.jpg.asset.json";
import sambaqui from "@/assets/aldeia-velha/av-013-024.jpg.asset.json";
import fornosAdobe from "@/assets/aldeia-velha/av-013-025.jpg.asset.json";
import familiaresAureo from "@/assets/aldeia-velha/av-015-028.jpg.asset.json";
import entradaTI from "@/assets/aldeia-velha/av-016-032.jpg.asset.json";
import residencias from "@/assets/aldeia-velha/av-017-034.jpg.asset.json";
import reservatorio from "@/assets/aldeia-velha/av-017-035.jpg.asset.json";
import escolaAtual from "@/assets/aldeia-velha/av-019-038.jpg.asset.json";
import escolaAntiga from "@/assets/aldeia-velha/av-019-039.jpg.asset.json";
import cooficializacao from "@/assets/aldeia-velha/av-020-041.jpg.asset.json";
import jogosInfanto from "@/assets/aldeia-velha/av-021-043.jpg.asset.json";
import esmeraldaJacana from "@/assets/aldeia-velha/av-022-045.jpg.asset.json";
import encontroPajes from "@/assets/aldeia-velha/av-022-046.jpg.asset.json";
import postoSaude from "@/assets/aldeia-velha/av-023-048.jpg.asset.json";
import potiraBuriti from "@/assets/aldeia-velha/av-024-050.jpg.asset.json";
import cantoDanca from "@/assets/aldeia-velha/av-025-052.jpg.asset.json";
import reservaPlaca from "@/assets/aldeia-velha/av-025-053.jpg.asset.json";
import grupoCultura1 from "@/assets/aldeia-velha/av-026-055.jpg.asset.json";
import grupoCultura2 from "@/assets/aldeia-velha/av-027-057.jpg.asset.json";
import museuCeuAberto from "@/assets/aldeia-velha/av-028-059.jpg.asset.json";
import casasHabitacional from "@/assets/aldeia-velha/av-029-061.jpg.asset.json";
// Fotos do Intercâmbio Cultural e Territorial enviadas pela comunidade.
import interPreparo from "@/assets/aldeia-velha/intercambio-IMG-20260915-WA0103.jpg.asset.json";
import interRodaNoite from "@/assets/aldeia-velha/intercambio-IMG-20260915-WA0034.jpg.asset.json";
import interPintura from "@/assets/aldeia-velha/intercambio-IMG-20260915-WA0094.jpg.asset.json";
import interCaminhada from "@/assets/aldeia-velha/intercambio-IMG-20260915-WA0088.jpg.asset.json";
import interArtesanato from "@/assets/aldeia-velha/intercambio-IMG-20260915-WA0084.jpg.asset.json";
import interCantoRoda from "@/assets/aldeia-velha/intercambio-IMG-20260915-WA0022.jpg.asset.json";
import interAcolhida from "@/assets/aldeia-velha/intercambio-IMG-20260915-WA0019.jpg.asset.json";
import interRodaOca from "@/assets/aldeia-velha/intercambio-IMG-20260915-WA0018.jpg.asset.json";
import interOficinaFibras from "@/assets/aldeia-velha/intercambio-IMG-20260915-WA0080.jpg.asset.json";
import interEscutaMata from "@/assets/aldeia-velha/intercambio-IMG-20260915-WA0085.jpg.asset.json";
import interBanhoErvas from "@/assets/aldeia-velha/intercambio-IMG-20260915-WA0020.jpg.asset.json";
import interDescanso from "@/assets/aldeia-velha/intercambio-IMG-20260915-WA0083.jpg.asset.json";
import interCozinha from "@/assets/aldeia-velha/intercambio-IMG-20260915-WA0017.jpg.asset.json";
import interDefumacao from "@/assets/aldeia-velha/intercambio-IMG-20260915-WA0016.jpg.asset.json";

export type Photo = { src: string; caption: string; alt: string };

const p = (asset: { url: string }, caption: string, alt?: string): Photo => ({
  src: asset.url,
  caption,
  alt: alt ?? caption,
});

export const PHOTOS = {
  capa: p(capa, "Somos Todos Aldeia Velha", "Mosaico de fotos do povo Pataxó de Aldeia Velha"),
  retomada1998: p(retomada1998, "Retomada de Aldeia Velha, março de 1998"),
  familiaJosevaldo: p(familiaJosevaldo, "Filhos e netos do senhor Jozevaldo (seu Josa)"),
  oriene: p(oriene, "Oriene Silva de Oliveira, ancião de Aldeia Velha"),
  familiaNair: p(familiaNair, "Família de Dona Nair e seu Bergue"),
  ancia: p(ancia, "Anciã moradora de Aldeia Velha"),
  antonioNobre: p(antonioNobre, "Antônio Nobre"),
  professoraParu: p(professoraParu, "Professora Maria Aparecida (Paru)"),
  caciqueIpe: p(caciqueIpe, "Cacique Ipê"),
  sambaqui: p(sambaqui, "Sambaqui na Terra Indígena Aldeia Velha (Angelo Pataxó, 2008)"),
  fornosAdobe: p(fornosAdobe, "Fornos antigos feitos de adobe (Angelo Pataxó, 2008)"),
  familiaresAureo: p(familiaresAureo, "Alguns dos familiares de Áureo, Marinalva e Das Neves"),
  entradaTI: p(entradaTI, "Entrada da Terra Indígena Aldeia Velha"),
  residencias: p(residencias, "Residências e casa de farinha da Aldeia Velha"),
  reservatorio: p(
    reservatorio,
    "Principal reservatório, poço feito pela comunidade e poço furado pela CERB aguardando a caixa de distribuição",
  ),
  escolaAtual: p(escolaAtual, "Estrutura atual da Escola Indígena Pataxó Aldeia Velha"),
  escolaAntiga: p(
    escolaAntiga,
    "Cabana utilizada como primeira sala de aula (1999) e farinheira usada como sala de aula (2000)",
  ),
  cooficializacao: p(
    cooficializacao,
    "Assinatura do decreto de cooficialização da língua Pataxó (Patxôhã) em Porto Seguro",
  ),
  jogosInfanto: p(jogosInfanto, "Jogos Infanto-Juvenis da Escola Indígena Pataxó Aldeia Velha"),
  esmeraldaJacana: p(esmeraldaJacana, "D. Esmeralda e a Pajé Jaçanã"),
  encontroPajes: p(encontroPajes, "Encontro de pajés, parteiras e benzedeiras"),
  postoSaude: p(postoSaude, "Primeiro posto de saúde e o atual, reformado"),
  potiraBuriti: p(potiraBuriti, "Potirá, Buriti e Lindibergue"),
  cantoDanca: p(cantoDanca, "Canto e dança Pataxó do Grupo de Cultura"),
  reservaPlaca: p(reservaPlaca, "Reserva Pataxó Aldeia Velha"),
  grupoCultura1: p(grupoCultura1, "Grupo de Cultura da Aldeia Velha"),
  grupoCultura2: p(grupoCultura2, "Grupo de Cultura Pataxó de Aldeia Velha"),
  museuCeuAberto: p(museuCeuAberto, "Projeto Museu a Céu Aberto"),
  casasHabitacional: p(casasHabitacional, "Casas do projeto de Unidade Habitacional"),
} as const;

export const GALLERY: Photo[] = Object.values(PHOTOS);

export const SECTIONS = [
  { id: "memoria", label: "Memória" },
  { id: "relatos", label: "Anciãos" },
  { id: "retomada", label: "Retomada" },
  { id: "territorio", label: "Território" },
  { id: "educacao", label: "Educação" },
  { id: "intercambio", label: "Intercâmbio" },

  { id: "patxoha", label: "Patxôhã" },
  { id: "cultura", label: "Cultura" },
  { id: "saude", label: "Saberes e Saúde" },
  { id: "projetos", label: "Projetos" },
  { id: "galeria", label: "Galeria" },
  { id: "documentarios", label: "Documentários" },
  { id: "referencias", label: "Referências" },
];

export type Elder = {
  name: string;
  role: string;
  quote: string;
  detail: string;
  photo?: Photo;
};

export const ELDERS: Elder[] = [
  {
    name: "Josevaldo Alves do Bonfim (seu Josa)",
    role: "Ancião, pescador e artesão · vice-cacique de 2016 a 2018",
    quote:
      "Porque o meu avô veio com 18 anos solteiro para Aldeia Velha... Eu vim para aqui em 1960, hoje estamos em 2023, quantos anos tem? Eu vim para aqui menino, com oito anos de idade.",
    detail:
      "Seu avô Zé Curubito chegou com 18 anos ao território. Dos seus 13 filhos, três nasceram aqui. Ancestralizou em 16/05/2026, mas sua luta continua na memória da comunidade.",
    photo: PHOTOS.familiaJosevaldo,
  },
  {
    name: "Luzia",
    role: "Filha de seu Josa, nascida em Aldeia Velha",
    quote:
      "Saímos daqui corrida. O fazendeiro meteu a máquina na casa de Tuquinho, passou por cima da casa.",
    detail:
      "Foram derrubadas também as casas de seu tio José, de Antônio Bahia, Pedro Panta e Bergue. Luzia tem nove filhos, vinte e seis netos e um bisneto, todos convivendo neste território.",
  },
  {
    name: "Oriene Silva de Oliveira",
    role: "Ancião, 77 anos · construtor de moradias de taipa",
    quote:
      "Esses índios eu conheci todos eles. João Maranhão, o pai do finado Josa. Todas essas famílias eu conheci.",
    detail:
      "Vive nestas terras desde os 17 anos. Seu pai, Filomeno Ramos de Oliveira, foi um dos expulsos. Juntou-se à retomada de 1998. Tem 9 filhos, 22 netos e 9 bisnetos.",
    photo: PHOTOS.oriene,
  },
  {
    name: "Maria Rosa dos Santos (Dona Nair)",
    role: "Uma das moradoras mais velhas de Aldeia Velha",
    quote:
      "Cheguei aqui só com um filho, hoje já sou mãe de netos. Não tinha o prazer de sair daqui, a gente saiu porque saiu expulso.",
    detail:
      "Em 1992 retornou à terra ancestral com seu esposo Gilbergue Dias de Andrade, que faleceu lutando por este território em 04/08/2014. Seus 6 filhos, 7 netos e 9 bisnetos seguem a luta.",
    photo: PHOTOS.familiaNair,
  },
  {
    name: "Maria do Carmo Nascimento (Carminha)",
    role: "62 anos · uma das raízes mais velhas de Aldeia Velha",
    quote:
      "Foi uma luta aqui, nasceram nesta beira de rio, bebendo água de cacimba, sem energia, nem estudo, tudo difícil mesmo.",
    detail:
      "Sua mãe, Diomerinda, sempre morou aqui. Trabalhou com olaria, fabricando pote, telha e tijolo. Tem 15 irmãos, 9 filhos, 20 netos e 3 bisnetos.",
    photo: PHOTOS.ancia,
  },
  {
    name: "Áureo Cancela",
    role: "82 anos · participou da primeira retomada e foi vice-cacique",
    quote:
      "Aqui não tinha ninguém, agora tem tanta criança, pai de família, mãe de família e para onde vão? O governo tem que ver isso.",
    detail:
      "Sua família saiu de Barra Velha um mês antes do massacre de 1951. Hoje é uma das lideranças mais atuantes, com 9 filhos e 52 netos vivendo na aldeia.",
    photo: PHOTOS.familiaresAureo,
  },
  {
    name: "Maria Das Neves Cancela",
    role: "76 anos · retornou na retomada de 1992",
    quote:
      "Como vamos ficar sem moradia? Como vamos viver? Não podemos ficar quietos, calados, temos que falar.",
    detail: "Convive na aldeia com seus 21 netos e 14 bisnetos.",
  },
  {
    name: "Marinalva Cancela",
    role: "80 anos · retornou ao território desde 1992",
    quote:
      "Nós já estamos idosos, penso nas crianças, nesses novos. Se eles saírem daqui, para onde vão, pelo amor de Deus?",
    detail: "Tem 8 filhos, 23 netos e 15 bisnetos.",
  },
  {
    name: "Angela Braz (Cupuna Pataxó)",
    role: "67 anos · moradora da Aldeia Barra Velha",
    quote:
      "Essas famílias foram para lá no fogo de 1951... Lá é aldeia mesmo dos índios Pataxó.",
    detail:
      "Relata que seus velhos — João, Alfredo, Paulo e sua irmã Dominga — moraram em Aldeia Velha, e que ainda hoje há provas: cascos de ouriço, caranguejo e ostras.",
  },
  {
    name: "Boaventura Antônio de Souza",
    role: "Relato colhido pela professora Maria Aparecida (CONCEIÇÃO, 2003)",
    quote:
      "Declaro que Maria Ângela da Conceição, minha mãe, foi nascida nesta Aldeia em 1901, saiu dessa Aldeia em 1914, período em que foram expulsos pelos poderosos fazendeiros.",
    detail:
      "Boaventura e sua esposa Tereza Ângela dos Santos fizeram parte da retomada de 1998.",
    photo: PHOTOS.professoraParu,
  },
];

export type TimelineItem = {
  year: string;
  title: string;
  text: string;
  highlight?: boolean;
};

export const TIMELINE: TimelineItem[] = [
  {
    year: "Séc. XV–XIX",
    title: "Presença ancestral e colonização",
    text: "Os Pataxó dominavam toda a faixa do extremo sul baiano. A Aldeia de Santo Amaro, atual Aldeia Velha, foi uma das missões da região (SOTTO-MAIOR, 2008).",
  },
  {
    year: "1901",
    title: "Nascimentos no território",
    text: "Maria Ângela da Conceição nasce em Aldeia Velha, conforme declaração de seu filho Boaventura.",
  },
  {
    year: "1914",
    title: "Expulsão pelos fazendeiros",
    text: "A família de Maria Ângela é expulsa da aldeia quando ela tinha 13 anos de idade.",
  },
  {
    year: "1940",
    title: "Vestígios reconhecidos",
    text: "O posseiro Antônio Monteiro afirmava a seus funcionários que aqui era área indígena: encontrou moradas antigas, fornos e sambaquis.",
  },
  {
    year: "1951",
    title: "O fogo de 1951",
    text: "Famílias Pataxó fugidas do massacre de Barra Velha passam a transitar e viver neste território.",
  },
  {
    year: "1960",
    title: "Vida no rio Buranhém",
    text: "A família de dona Dior instala-se às margens do Buranhém: mariscos do mangue, pesca, óleo de dendê e olaria para vender no Arraial d'Ajuda e Porto Seguro.",
  },
  {
    year: "1983",
    title: "A tomada da Fazenda Santo Amaro",
    text: "Os \u201cproprietários\u201d da COSVAR Agropecuária tomam posse da fazenda e usam de todos os meios para expulsar os antigos moradores (SOTTO-MAIOR, 2008).",
  },
  {
    year: "1992",
    title: "Associação dos Pataxó Sem Terra",
    text: "Famílias dispersas pelo Extremo Sul se reúnem no Arraial d'Ajuda. Dona Nair e Gilbergue, Das Neves e Marinalva retornam ao território ancestral.",
  },
  {
    year: "1993",
    title: "Primeira retomada",
    text: "A Associação se reúne em Aldeia Velha e delibera permanecer no local, abrindo roças. A ocupação durou poucas semanas: uma liminar de reintegração de posse foi acolhida pelo juiz local (SAMPAIO, 2000).",
  },
  {
    year: "1998",
    title: "A retomada definitiva",
    text: "Cacique Ipê reconduz os trabalhos e a comunidade faz uma nova retomada — \u201cestamos aqui até hoje, pois dependemos dessa terra, ela é sagrada e nunca vamos arredar o pé daqui\u201d. Em abril de 1998 começam as aulas em um kigeme (cabana), com 20 alunos.",
    highlight: true,
  },
  {
    year: "1999–2000",
    title: "A escola nasce na cabana",
    text: "A primeira sala de aula funciona em uma cabana; depois a farinheira é compartilhada como sala de aula por cerca de três anos.",
  },
  {
    year: "2002 e 2008",
    title: "Água para a comunidade",
    text: "Primeiro poço artesiano com caixa de 10.000 litros em 2002; nova caixa de 30.000 litros em 2008.",
  },
  {
    year: "2008",
    title: "Relatório de identificação",
    text: "O Relatório Circunstancial de Identificação e Delimitação da TI Aldeia Velha, da antropóloga Leila Silvia Burger Sotto-Maior, é publicado no Diário Oficial da União em 17/06/2008.",
  },
  {
    year: "2023",
    title: "Patxôhã cooficializada",
    text: "A língua materna Pataxó é cooficializada no município de Porto Seguro.",
  },
  {
    year: "2024",
    title: "Homologação",
    text: "A Terra Indígena Aldeia Velha é homologada pelo Decreto nº 12.000, de 18 de abril de 2024.",
  },
  {
    year: "2025",
    title: "Registro do território",
    text: "Registro no ofício de registro de imóveis da comarca de Porto Seguro, matrícula nº 58.744, em 09/07/2025.",
  },
  {
    year: "2026",
    title: "Nova ameaça, mesma resistência",
    text: "Diante da intimação para retirar o povo deste solo sagrado, a comunidade produz este relatório: \u201cSomos Todos Aldeia Velha\u201d.",
  },
];

export const TERRITORY_FACTS = [
  { value: "1.997 ha", label: "Área da Terra Indígena", sub: "Mata Atlântica, extremo sul da Bahia" },
  { value: "Decreto nº 12.000", label: "Homologação", sub: "18 de abril de 2024" },
  { value: "Matrícula 58.744", label: "Registro de imóveis", sub: "Comarca de Porto Seguro, 09/07/2025" },
  { value: "3 sítios", label: "Sítios arqueológicos", sub: "Além de um sambaqui" },
  { value: "7 km", label: "Manguezal", sub: "Banhado pelo rio Buranhém" },
  { value: "235", label: "Estudantes matriculados", sub: "Escola Indígena Pataxó Aldeia Velha" },
];

export const POPULATION = [
  {
    source: "CRSB/FUNAI (2024)",
    families: "470 famílias",
    people: "2.350 pessoas",
  },
  {
    source: "Posto de Saúde Indígena (PSI)",
    families: "772 famílias",
    people: "1.783 pessoas",
  },
];

export const HEALTH_DEMOGRAPHICS = [
  { value: "195", label: "crianças menores de 5 anos" },
  { value: "23", label: "gestantes" },
  { value: "52", label: "idosos acima de 70 anos" },
  { value: "95", label: "pessoas com diabetes e hipertensão" },
  { value: "18", label: "pessoas com deficiência" },
];

export type Project = {
  name: string;
  audience: string;
  support: string;
  year: string;
  org: string;
};

export const PROJECTS: Project[] = [
  {
    name: "Ponto de Cultura da Bahia",
    audience: "Comunidade Indígena",
    support: "Programa Mais Cultura",
    year: "2009",
    org: "Instituto Tribos Jovens",
  },
  {
    name: "Agitação Cultural",
    audience: "Jovens da comunidade",
    support: "Fundo de Cultura",
    year: "2015",
    org: "Instituto Tribos Jovens",
  },
  {
    name: "Fortalecendo a rede de proteção da criança e adolescentes em Porto Seguro",
    audience: "Jovens e crianças indígenas Pataxó",
    support: "—",
    year: "2016",
    org: "Instituto Tribos Jovens",
  },
  {
    name: "Encontro: Saberes e fazeres de mestres e conhecedores indígenas",
    audience: "15 comunidades e três etnias diferentes",
    support: "—",
    year: "2017",
    org: "Instituto Tribos Jovens",
  },
  {
    name: "Museu a Céu Aberto",
    audience: "Comunidade, pesquisadores e professores",
    support: "—",
    year: "2017",
    org: "Instituto Tribos Jovens",
  },
  {
    name: "Etnomapeamento da Aldeia Velha Pataxó",
    audience: "Mapear áreas de fauna e flora para preservação do território",
    support: "—",
    year: "2021",
    org: "Associação de Ecoturismo",
  },
  {
    name: "Chamada pública nº 14/2019 — Socioambientais/Biodiversidade",
    audience: "Incentivo a quintais produtivos e mudas para reflorestamento",
    support: "—",
    year: "2019",
    org: "Associação de Ecoturismo",
  },
  {
    name: "Unidade de beneficiamento de polpa",
    audience: "20 famílias indígenas",
    support: "—",
    year: "2018",
    org: "Associação Outras Tribos",
  },
  {
    name: "Projeto Segundo Tempo",
    audience: "Fortalecimento cultural no turno oposto às aulas",
    support: "Associação de Mulheres em Ação — MEA",
    year: "2006",
    org: "MEA",
  },
  {
    name: "Arteducar e Biblioteca Escolar Pataxi Makiame",
    audience: "Dança, artesanato e biblioteca escolar",
    support: "Governo Estadual, TIM e Instituto SHC",
    year: "2007–2009",
    org: "MEA",
  },
  {
    name: "Produção social de moradias — seleção pública 001/2010",
    audience: "120 moradias construídas pelos próprios indígenas",
    support: "Sistema Estadual de Habitação de Interesse Social / ONG Green Verde",
    year: "2010",
    org: "Governo do Estado da Bahia",
  },
];

export const DOC_LINKS: string[] = [
  "https://www.instagram.com/reel/DZZ2DSBuc0t/",
  "https://www.instagram.com/reel/DZYr_x0JD-c/",
  "https://www.instagram.com/reel/DZcnmMUu9d7/",
  "https://www.instagram.com/reel/DZgPohMul3P/",
  "https://www.instagram.com/reel/DZgUbiBuxLe/",
  "https://www.instagram.com/reel/DZh-75chDFo/",
  "https://www.instagram.com/reel/DZbOFwpuKVP/",
  "https://www.instagram.com/reel/DZa2jUGOYDi/",
  "https://www.instagram.com/reel/DZaD7uAu_SJ/",
  "https://www.instagram.com/reel/DZWOXahgKbk/",
  "https://www.instagram.com/reel/DZmmMlCMoDR/",
  "https://www.instagram.com/reel/DZcbEx8h59k/",
  "https://www.instagram.com/reel/DZYQpbEhuj2/",
  "https://www.instagram.com/reel/DZWaVN0OW4q/",
  "https://www.instagram.com/reel/DZn5SyNJM9s/",
  "https://www.instagram.com/reel/DZqmzsRN-DL/",
  "https://www.instagram.com/reel/DZqbn2co4A2/",
  "https://www.instagram.com/p/DZlmDobCT_p/",
];

export const REFERENCES: string[] = [
  "ANDRADE, Aline Silva de. Lutas e Conquistas: Mulheres Indígenas Pataxó de Aldeia Velha. Monografia, Curso de Línguas, Artes e Literatura, FIEI/UFMG, 2016.",
  "BRASIL. Decreto nº 12.000, de 18 de abril de 2024. Homologa a demarcação administrativa da terra indígena Aldeia Velha, Município de Porto Seguro, Bahia.",
  "CARMO, Angelo Santos do. Aldeia Velha, Saberes, Fazeres e Memória. Monografia, LICEEI/UNEB, 2019.",
  "CARMO, Angelo Santos do. Processos Históricos e Culturais na Comunidade Indígena Pataxó Aldeia Velha e suas implicações na Educação Escolar Indígena. Dissertação de mestrado, PPGER/UFSB, Porto Seguro, 2022.",
  "CONCEIÇÃO (PARU), Maria Aparecida Alves da. História da Aldeia Velha. Monografia do Curso de Formação para Professores Indígenas da Bahia, 2003.",
  "GUEDES, Ahnã Pataxó Meirelles. Intercâmbio Cultural e Intercultural, 2023.",
  "LIRA, Txaywã. Jogos Indígenas Infanto-Juvenis Pataxó de Aldeia Velha, 2018.",
  "NUNES. Grupo de Cultura da Aldeia Velha, 2025.",
  "SAMPAIO, José Augusto Laranjeiras. Retomadas de terras Pataxó no Extremo Sul da Bahia, 2000.",
  "SOTTO-MAIOR, Leila Silvia Burger. Relatório Circunstancial de Identificação e Delimitação da TI Aldeia Velha. Diário Oficial da União, 17/06/2008.",
];

export const AUTHOR_NOTE =
  "Angelo Santos do Carmo — Pataxó, liderança, professor, licenciado em Pedagogia (ULBRA, 2013) e em Ciências Humanas e Sociais (LICEEI/UNEB, 2019), Mestre em Relações Étnico-Raciais (PPGER/UFSB, 2022) e doutorando em Educação e Movimentos Sociais (FAE/UFMG).";

/* ------------------- Intercâmbio Cultural e Territorial ------------------- */

export type StoryChapter = {
  id: string;
  emoji: string;
  title: string;
  paragraphs: string[];
  photo: Photo;
};

export const INTERCAMBIO_OPENING =
  "Conhecer um território é também conhecer as histórias, as pessoas e os saberes que vivem nele.";

export const INTERCAMBIO_SUBTITLE =
  "Escola Indígena Pataxó Aldeia Velha — quando o território se transforma em sala de aula.";

/** Narrativa em capítulos, apresentada como experiência guiada (botão “Começar a história”). */
/** Fotos do intercâmbio registradas pela comunidade. */
export const INTERCAMBIO_PHOTOS = {
  preparo: p(
    interPreparo,
    "Preparo tradicional com folhas e água durante o intercâmbio",
    "Mão mexendo folhas dentro de uma grande panela com água, no preparo tradicional",
  ),
  rodaNoite: p(
    interRodaNoite,
    "Roda de conversa à noite com estudantes e educadores",
    "Estudantes sentados em roda escutando durante atividade noturna no terreiro",
  ),
  pintura: p(
    interPintura,
    "Pintura corporal: uma jovem sendo pintada por outra estudante",
    "Jovem Pataxó recebendo pintura corporal no rosto durante o intercâmbio",
  ),
  caminhada: p(
    interCaminhada,
    "Caminhada cultural pelo território durante o intercâmbio",
    "Participantes Pataxó caminhando juntos pelo território, com pinturas corporais e trajes tradicionais",
  ),
} as const;

export const INTERCAMBIO_GALLERY: Photo[] = Object.values(INTERCAMBIO_PHOTOS);

export const INTERCAMBIO_CHAPTERS: StoryChapter[] = [
  {
    id: "abertura",
    emoji: "🌿",
    title: "Quando o território se transforma em sala de aula",
    paragraphs: [
      "O conhecimento também vive fora das paredes da escola. Na experiência de Intercâmbio Cultural e Territorial da Escola Indígena Pataxó Aldeia Velha, estudantes, educadores e participantes tiveram a oportunidade de vivenciar momentos de encontro, escuta, aprendizado e troca de saberes.",
      "A caminhada pelo território revela que cada espaço pode ensinar. A mata, as árvores, a terra, os espaços de convivência, os trabalhos manuais e as práticas culturais fazem parte de uma aprendizagem que aproxima as pessoas e fortalece a identidade.",
    ],
    photo: PHOTOS.entradaTI,
  },
  {
    id: "saberes",
    emoji: "🏹",
    title: "Aprender com quem guarda o conhecimento",
    paragraphs: [
      "Durante o intercâmbio, os estudantes acompanharam de perto atividades e demonstrações de saberes tradicionais. Um conhecimento relacionado ao trabalho com fibras e materiais naturais é compartilhado diante dos jovens.",
      "Mais do que observar uma técnica, eles têm a oportunidade de conhecer a experiência de quem aprendeu esses conhecimentos ao longo da vida. É assim que o conhecimento continua caminhando: de pessoa para pessoa, de geração para geração.",
    ],
    photo: INTERCAMBIO_PHOTOS.preparo,
  },
  {
    id: "territorio",
    emoji: "🌿",
    title: "O território também ensina",
    paragraphs: [
      "Caminhar pelo território é uma forma de aprender. Ao sair dos espaços tradicionais da sala de aula e entrar em contato com a comunidade e a natureza, os estudantes percebem que o território guarda histórias, práticas, memórias e conhecimentos.",
      "A terra não é apenas o lugar onde se vive. Ela também é memória, identidade, pertencimento e aprendizado.",
    ],
    photo: INTERCAMBIO_PHOTOS.caminhada,
  },
  {
    id: "cultura",
    emoji: "🎨",
    title: "Cultura que se vive",
    paragraphs: [
      "A pintura corporal aparece como um dos momentos de expressão cultural registrados durante a experiência.",
      "Para os estudantes, participar desses momentos possibilita aproximar-se de elementos da cultura e compreender que a identidade indígena está presente nos gestos, nos conhecimentos, nas formas de expressão e na convivência comunitária. Cada experiência se transforma em uma oportunidade de aprender e respeitar.",
    ],
    photo: INTERCAMBIO_PHOTOS.pintura,
  },
  {
    id: "geracoes",
    emoji: "🤝",
    title: "O encontro entre diferentes gerações",
    paragraphs: [
      "Crianças, jovens e adultos compartilham o mesmo espaço. Em rodas de conversa e momentos de convivência, os mais jovens observam, perguntam, participam e escutam.",
      "Esse encontro é fundamental porque aproxima diferentes gerações e permite que conhecimentos sejam compartilhados de maneira viva. O ancião ensina. O jovem aprende. A criança observa. E o conhecimento continua vivo.",
    ],
    photo: INTERCAMBIO_PHOTOS.rodaNoite,
  },
  {
    id: "comunidades",
    emoji: "🌱",
    title: "Entre comunidades, uma troca de saberes",
    paragraphs: [
      "O intercâmbio também representa um encontro entre pessoas e territórios. A presença dos estudantes em outro espaço comunitário, incluindo o registro junto à identificação da Aldeia Pataxó Aroeira, mostra a dimensão territorial dessa experiência: conhecer outros espaços, outras pessoas e outras formas de vivenciar e fortalecer a cultura.",
      "Não se trata apenas de visitar um lugar. É chegar para conhecer, ouvir, aprender, compartilhar e levar novos conhecimentos consigo.",
    ],
    photo: PHOTOS.grupoCultura1,
  },
  {
    id: "escola",
    emoji: "❤️",
    title: "Uma escola que ultrapassa seus muros",
    paragraphs: [
      "A experiência mostra que a educação indígena acontece em muitos lugares. A escola está na conversa com os mais velhos, no contato com a natureza, no fazer artesanal, na pintura, na língua, na convivência e na caminhada pelo território.",
      "Por isso, o intercâmbio cultural e territorial amplia o significado de aprender.",
    ],
    photo: PHOTOS.escolaAtual,
  },
  {
    id: "patxoha",
    emoji: "🗣️",
    title: "Patxôhã: língua, memória e identidade",
    paragraphs: [
      "Valorizar o Patxôhã é também valorizar a memória e a identidade Pataxó. A língua faz parte desse processo de fortalecimento cultural e pode estar presente nas atividades, nas histórias, nas músicas, nas conversas e nas experiências vividas pelos estudantes.",
      "Uma língua ensinada é uma memória que continua sendo contada.",
    ],
    photo: PHOTOS.cooficializacao,
  },
  {
    id: "futuro",
    emoji: "🌳",
    title: "O futuro começa no território",
    paragraphs: [
      "Ao final da experiência, ficam muito mais do que fotografias. Ficam encontros, aprendizados e histórias para contar. Fica a compreensão de que preservar a cultura também significa valorizar as pessoas, os conhecimentos tradicionais, a língua e o território.",
      "A Escola Indígena Pataxó Aldeia Velha participa desse movimento ao aproximar educação, cultura, território e juventude. Porque quando os jovens conhecem suas raízes, eles também ajudam a construir o futuro.",
    ],
    photo: PHOTOS.jogosInfanto,
  },
];

export const INTERCAMBIO_GALLERY_NOTES: { title: string; text: string }[] = [
  { title: "Chegada e acolhimento", text: "O encontro começa com a aproximação entre estudantes, educadores e comunidade." },
  { title: "Saberes tradicionais", text: "Os estudantes acompanham práticas e conhecimentos compartilhados no território." },
  { title: "Roda de conversa", text: "Um espaço de escuta, diálogo e troca de experiências." },
  { title: "Pintura corporal", text: "Um momento de expressão e aproximação com elementos culturais." },
  { title: "Vivência no território", text: "A caminhada permite conhecer os espaços e perceber a natureza como parte do processo educativo." },
  { title: "Encontro entre gerações", text: "Crianças, jovens e adultos participam juntos, fortalecendo a transmissão dos conhecimentos." },
  { title: "Cultura e convivência", text: "O intercâmbio cria vínculos e aproxima diferentes experiências." },
  { title: "Memória do encontro", text: "Cada fotografia registra uma parte da história construída durante essa experiência." },
];

/* ------------------------- Temas (pastas de conteúdo) ------------------------ */

export type Theme = {
  id: string;
  label: string;
  eyebrow: string;
  summary: string;
  photo?: Photo;
};

/** Cada tema é uma "pasta": mostra apenas os conteúdos do seu assunto. */
export const THEMES: Theme[] = [
  {
    id: "memoria",
    label: "Memória",
    eyebrow: "Memória ancestral",
    summary:
      "Presença ancestral Pataxó no território, direitos originários, opressão e resistência pela oralidade; base documental do relatório e do relatório circunstancial da TI Aldeia Velha (2008).",
    photo: PHOTOS.sambaqui,
  },
  {
    id: "relatos",
    label: "Anciãos",
    eyebrow: "Oralidade, resistência e luta",
    summary:
      "Relatos dos anciãos e anciãs que nasceram, foram expulsos e voltaram ao território, com suas falas e memórias de luta.",
    photo: PHOTOS.caciqueIpe,
  },
  {
    id: "retomada",
    label: "Retomada",
    eyebrow: "Linha do tempo",
    summary:
      "Cronologia das expulsões, das primeiras investidas, da retomada definitiva de 1998 e dos marcos até a homologação da Terra Indígena.",
    photo: PHOTOS.retomada1998,
  },
  {
    id: "territorio",
    label: "Território",
    eyebrow: "Localização e caracterização",
    summary:
      "Localização em Arraial d'Ajuda, Porto Seguro (BA), Mata Atlântica, sítios arqueológicos, sambaqui, manguezal do rio Buranhém, moradias, água, infraestrutura e dados de população.",
    photo: PHOTOS.entradaTI,
  },
  {
    id: "educacao",
    label: "Educação",
    eyebrow: "Educação escolar indígena",
    summary:
      "Da primeira aula em kigeme (1998) à Escola Indígena Pataxó Aldeia Velha com 12 salas e 235 estudantes; Jogos Infanto-Juvenis e Intercâmbio Cultural e Intercultural.",
    photo: PHOTOS.escolaAtual,
  },
  {
    id: "intercambio",
    label: "Intercâmbio",
    eyebrow: "Intercâmbio Cultural e Territorial",
    summary:
      "Experiência guiada do Intercâmbio Cultural e Territorial da Escola Indígena Pataxó Aldeia Velha: caminhada pelo território, saberes tradicionais, pintura corporal, rodas de conversa e o encontro entre gerações.",
    photo: PHOTOS.jogosInfanto,
  },
  {
    id: "patxoha",

    label: "Patxôhã",
    eyebrow: "Língua materna",
    summary:
      "A língua materna Patxôhã como identidade: ensino além da gramática, cosmologia e a cooficialização em Porto Seguro em 2023.",
    photo: PHOTOS.cooficializacao,
  },
  {
    id: "cultura",
    label: "Cultura",
    eyebrow: "Preservação ambiental e cultural",
    summary:
      "Grupo de Cultura da Aldeia, canto e dança, etnoturismo na reserva, intercâmbios com Barra Velha e Jaqueira, Museu a Céu Aberto e preservação ambiental.",
    photo: PHOTOS.grupoCultura1,
  },
  {
    id: "saude",
    label: "Saberes e Saúde",
    eyebrow: "Saberes tradicionais e saúde",
    summary:
      "Medicina tradicional (Pajé Jaçanã, benzimentos, ervas, garrafadas) e o serviço institucional PSF/UBSI da SESAI, com perfil demográfico da saúde.",
    photo: PHOTOS.postoSaude,
  },
  {
    id: "projetos",
    label: "Projetos",
    eyebrow: "Projetos sociais e culturais",
    summary:
      "Associações comunitárias, parcerias e projetos sociais, culturais e ambientais conquistados pela comunidade ao longo dos anos.",
    photo: PHOTOS.museuCeuAberto,
  },
  {
    id: "galeria",
    label: "Galeria",
    eyebrow: "Galeria",
    summary: "Fotos registradas pela própria comunidade, reunidas no relatório Somos Todos Aldeia Velha.",
    photo: PHOTOS.cantoDanca,
  },
  {
    id: "documentarios",
    label: "Documentários",
    eyebrow: "Documentários e entrevistas",
    summary:
      "Documentários e entrevistas em vídeo com moradores e parceiros na luta pelo território tradicional.",
    photo: PHOTOS.grupoCultura2,
  },
  {
    id: "referencias",
    label: "Referências",
    eyebrow: "Fontes",
    summary:
      "Referências bibliográficas e documentais usadas no relatório, além da nota de sistematização dos relatos.",
    photo: PHOTOS.residencias,
  },
];

export function isTheme(id: string | undefined): boolean {
  return !!id && THEMES.some((t) => t.id === id);
}

/** Base temática usada pelo Professor Akuã para responder sem misturar assuntos. */
export const ALDEIA_VELHA_KNOWLEDGE = `
═══════════════════════════════════
BASE DE CONHECIMENTO — ALDEIA VELHA (organizada por temas)
═══════════════════════════════════
Fonte: relatório "Somos Todos Aldeia Velha" — Comunidade Indígena Pataxó Aldeia Velha (C.I.P.A.V.), Arraial d'Ajuda, Porto Seguro (BA).
Cada tema abaixo é uma pasta de conteúdo do site (rota /aldeia-velha?tema=ID). Ao responder sobre Aldeia Velha, use SOMENTE o tema correspondente à pergunta e não misture assuntos de temas diferentes. Quando útil, indique ao usuário a pasta correspondente pelo nome.

${THEMES.map((t) => `- ${t.label} (tema: ${t.id}) — ${t.eyebrow}: ${t.summary}`).join("\n")}
`.trim();

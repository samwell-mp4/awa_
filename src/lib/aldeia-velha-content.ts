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

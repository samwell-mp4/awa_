import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Volume2, Square, MapPin, Users, GraduationCap, HeartPulse, Leaf, Landmark, Home as HomeIcon, BookOpen, Link2 } from "lucide-react";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { T } from "@/components/T";
import { speak, stopSpeak } from "@/lib/speak";

import capa from "@/assets/aldeia-velha/capa-somos-todos-aldeia-velha.jpg.asset.json";
import retomada1998 from "@/assets/aldeia-velha/retomada-1998.jpg.asset.json";
import familiaJosevaldo from "@/assets/aldeia-velha/familia-josevaldo.jpg.asset.json";
import oriene from "@/assets/aldeia-velha/oriene.jpg.asset.json";
import familiaNair from "@/assets/aldeia-velha/familia-nair-bergue.jpg.asset.json";
import carminha from "@/assets/aldeia-velha/carminha.jpg.asset.json";
import antonioNobre from "@/assets/aldeia-velha/antonio-nobre.jpg.asset.json";
import paru from "@/assets/aldeia-velha/professora-paru.jpg.asset.json";
import caciqueIpe from "@/assets/aldeia-velha/cacique-ipe.jpg.asset.json";
import sambaqui from "@/assets/aldeia-velha/sambaqui.jpg.asset.json";
import fornos from "@/assets/aldeia-velha/fornos-adobe.jpg.asset.json";
import familiaAureo from "@/assets/aldeia-velha/familiares-aureo.jpg.asset.json";
import entradaTI from "@/assets/aldeia-velha/entrada-ti-aldeia-velha.jpg.asset.json";
import residencias from "@/assets/aldeia-velha/residencias-casa-farinha.jpg.asset.json";
import reservatorio from "@/assets/aldeia-velha/reservatorio-agua.jpg.asset.json";
import escola from "@/assets/aldeia-velha/escola-indigena.jpg.asset.json";
import primeiraSala from "@/assets/aldeia-velha/primeira-sala-aula.jpg.asset.json";
import cooficializacao from "@/assets/aldeia-velha/cooficializacao-patxoha.jpg.asset.json";
import jogos from "@/assets/aldeia-velha/jogos-infantojuvenis.jpg.asset.json";
import esmeralda from "@/assets/aldeia-velha/esmeralda-paje-jacana.jpg.asset.json";
import encontroPajes from "@/assets/aldeia-velha/encontro-pajes.jpg.asset.json";
import postoSaude from "@/assets/aldeia-velha/posto-saude.jpg.asset.json";
import potira from "@/assets/aldeia-velha/potira-buriti-lindibergue.jpg.asset.json";
import danca from "@/assets/aldeia-velha/danca-pataxo.jpg.asset.json";
import reserva from "@/assets/aldeia-velha/reserva-pataxo.jpg.asset.json";
import grupoCultura from "@/assets/aldeia-velha/grupo-cultura.jpg.asset.json";
import comunidadeCultura from "@/assets/aldeia-velha/comunidade-cultura.jpg.asset.json";
import museu from "@/assets/aldeia-velha/museu-ceu-aberto.jpg.asset.json";
import casas from "@/assets/aldeia-velha/casas-habitacional.jpg.asset.json";

export const Route = createFileRoute("/aldeia-velha")({
  head: () => ({
    meta: [
      { title: "Somos Todos Aldeia Velha — Território Ancestral Pataxó" },
      {
        name: "description",
        content:
          "Relatório da Comunidade Indígena Pataxó Aldeia Velha (C.I.P.A.V.): memória, retomadas, educação, saúde tradicional, cultura e luta pelo território ancestral em Porto Seguro, Bahia.",
      },
      { property: "og:type", content: "article" },
      { property: "og:title", content: "Somos Todos Aldeia Velha — Território Ancestral Pataxó" },
      {
        property: "og:description",
        content:
          "Memória, resistência e luta do povo Pataxó da Terra Indígena Aldeia Velha, com relatos dos anciãos e registros da comunidade.",
      },
    ],
  }),
  component: AldeiaVelhaPage,
});

type Photo = { src: string; caption: string };
type Block =
  | { kind: "p"; text: string }
  | { kind: "quote"; text: string; author?: string }
  | { kind: "photos"; items: Photo[] };

type Chapter = {
  id: string;
  title: string;
  icon: typeof MapPin;
  blocks: Block[];
};

const chapters: Chapter[] = [
  {
    id: "territorio-ancestral",
    title: "Território Ancestral — contexto de resistência e luta",
    icon: MapPin,
    blocks: [
      {
        kind: "p",
        text: "Este relatório foi produzido a partir da intimação que recebemos para retirar nosso povo de nossa comunidade, deste solo sagrado. Foram reunidas informações do Relatório Circunstancial de Identificação e Delimitação da TI Aldeia Velha, pesquisas de monografia, TCC e mestrados de indígenas moradores da Aldeia Velha, entrevistas com moradores e, sobretudo, a vivência dos parentes neste território.",
      },
      {
        kind: "p",
        text: "É preciso mencionar que nossa presença é ancestral e nossos direitos são originários, antecedendo qualquer legislação construída pelos colonizadores. O uso da tese do marco temporal é inconstitucional e desumano. Os direitos à moradia, à saúde, à educação e à cultura são direitos fundamentais, e eles se realizam em nosso território: sem território não podemos dar continuidade à reprodução física, material e imaterial do nosso povo.",
      },
      {
        kind: "p",
        text: "Sempre estivemos presentes neste território, mas ao longo das décadas fomos vítimas de opressão, sendo expulsos por pessoas que se apropriaram indevidamente destas terras, principalmente com o uso de leis criadas pelos colonizadores. Primeiro foram as Capitanias Hereditárias, que doaram nossas terras a pessoas que estavam em Portugal; estas, por sua vez, subdividiam os imensos lotes em sesmarias menores para repassar aos colonos.",
      },
      {
        kind: "p",
        text: "Nos foi imposta a língua colonizadora e foi negado o direito de usarmos nossa língua materna, mas resistimos. Essa resistência se deu com inúmeras estratégias de nossos anciãos para dar continuidade às nossas crenças, costumes e tradições. A memória de luta foi passada pela oralidade: os saberes e fazeres sempre foram repassados de geração a geração. Foi assim que os Pataxó da Terra Indígena Aldeia Velha resistiram.",
      },
      {
        kind: "quote",
        text: "Os Pataxó dominavam toda a faixa do extremo sul baiano, compartilhando com os Maxakali o território entre o rio João de Tiba e o São Mateus, mantendo suas concentrações próximas à costa. A Aldeia de Santo Amaro, atual Aldeia Velha, era uma das missões implantadas na região.",
        author: "Relatório Circunstancial — Leila Silvia Burger Sotto-Maior, D.O.U. 17/06/2008",
      },
      {
        kind: "quote",
        text: "Declaro que Maria Ângela da Conceição, minha mãe, foi nascida nesta Aldeia em 1901 e saiu dessa Aldeia em 1914, período em que foram expulsos pelos poderosos fazendeiros. Na época, ela estava com 13 anos de idade.",
        author: "Boaventura Antônio de Souza (CONCEIÇÃO, 2003)",
      },
      {
        kind: "photos",
        items: [
          { src: retomada1998.url, caption: "Retomada de Aldeia Velha — março de 1998" },
          { src: sambaqui.url, caption: "Sambaqui, vestígio de nossos antepassados (Angelo Pataxó, 2008)" },
          { src: fornos.url, caption: "Fornos antigos feitos de adobe (Angelo Pataxó, 2008)" },
        ],
      },
      {
        kind: "quote",
        text: "O Antônio Monteiro falava para seus funcionários que aqui era uma área indígena. Ele sabia porque já havia percorrido a área e encontrado lugares onde foram moradas dos índios, alguns fornos, além de sambaquis.",
        author: "Relato de Maria da Ajuda (CONCEIÇÃO, 2003, p.10)",
      },
      {
        kind: "quote",
        text: "Tal ocupação somente veio a ser frustrada por volta de 1983, quando os “proprietários” da COSVAR Agropecuária tomaram posse da Fazenda Santo Amaro, usando de todos os meios possíveis para dali tirar os seus antigos moradores.",
        author: "SOTTO-MAIOR, 2008, p.14",
      },
    ],
  },
  {
    id: "oralidade",
    title: "Oralidade, resistência e luta — vozes dos anciãos",
    icon: Users,
    blocks: [
      {
        kind: "p",
        text: "O senhor Josevaldo Alves do Bonfim, conhecido como seu Josa, relatou em filmagem feita por sua filha Jaci Pataxó a presença de seus ancestrais neste território. Seu avô Zé Curubito veio com 18 anos e ficou cinco anos por aqui, depois foi para Caraíva, onde casou com Brasilina. Seu pai, José Alves Maranhão, casou-se com Paulina Rosária do Bonfim. Josa nasceu em 1951 e chegou à Aldeia Velha em 1960, com oito anos de idade.",
      },
      {
        kind: "quote",
        text: "Porque o meu avô veio com 18 anos solteiro para Aldeia Velha… Eu vim para aqui em 1960, hoje estamos em 2023, quantos anos tem isso? Eu vim para aqui menino, com oito anos de idade.",
        author: "Seu Josa (Josevaldo Alves do Bonfim)",
      },
      {
        kind: "p",
        text: "Diante da fala de seu Josivaldo, seus ancestrais estavam neste território no mínimo desde a década de 1930. Ele foi pescador, artesão — principalmente na confecção de Tupsay — e vice-cacique de 2016 a 2018. Ancestralizou em 16/05/2026, mas sua luta continuará em nossas memórias.",
      },
      {
        kind: "p",
        text: "Sua filha Luzia, nascida aqui, conta que saíram do território correndo: o fazendeiro passou com a máquina por cima da casa de Tuquinho, derrubou as casas de seu tio José, de Antônio Bahia, de Pedro Panta e de Bergue, e soltou o gado dentro da área. Luzia tem nove filhos, vinte e seis netos e um bisneto, todos convivendo neste território.",
      },
      {
        kind: "photos",
        items: [
          { src: familiaJosevaldo.url, caption: "Filhos e netos do senhor Josevaldo" },
          { src: oriene.url, caption: "Oriene Silva de Oliveira, ancião da Aldeia Velha" },
          { src: familiaNair.url, caption: "Família de Dona Nair e seu Bergue" },
        ],
      },
      {
        kind: "p",
        text: "Oriene Silva de Oliveira vive nestas terras desde os 17 anos e conheceu todos os moradores que aqui estavam — todos indígenas, todos expulsos pelo fazendeiro, inclusive seu pai, Filomeno Ramos de Oliveira. Ele se juntou aos parentes na retomada de 1998, tem 77 anos, nove filhos, 22 netos e nove bisnetos, e construía casas de taipa com cobertura de Malibu para os parentes.",
      },
      {
        kind: "quote",
        text: "Tinha um homem cuja casa era feita em riba de uma ruma de ostra (sambaqui). Como é que eles dizem que aqui não tinha índio? Cheguei aqui só com um filho, hoje já sou mãe de netos. Não tinha o prazer de sair daqui: a gente saiu expulso.",
        author: "Dona Maria Rosa dos Santos (Dona Nair)",
      },
      {
        kind: "p",
        text: "Em 1992, dona Nair e seu esposo Gilbergue Dias de Andrade retornaram à terra ancestral. Seu Bergue faleceu lutando neste território em 04/08/2014, e seus 6 filhos, 7 netos e 9 bisnetos dão continuidade à reprodução física e cultural Pataxó deste solo sagrado.",
      },
      {
        kind: "p",
        text: "Maria do Carmo Nascimento, a Carminha, tem 62 anos e é uma das raízes mais antigas da Aldeia Velha. São 15 irmãos, 9 filhos, 20 netos e 3 bisnetos. Sua mãe, Diomerinda, sempre morou aqui. Trabalhou com olaria fabricando potes, telhas e tijolos; seu pai abriu um porto às margens do Buranhém para vender os produtos em Porto Seguro de canoa, pois aqui não havia estrada, só trilhas.",
      },
      {
        kind: "photos",
        items: [
          { src: carminha.url, caption: "Maria do Carmo Nascimento — Carminha" },
          { src: antonioNobre.url, caption: "Antônio Nobre, 69 anos, morador da Aldeia Velha" },
          { src: paru.url, caption: "Professora Maria Aparecida Alves da Conceição — Paru" },
        ],
      },
      {
        kind: "quote",
        text: "Morava Dior e seu esposo Boinha, na época tinha olaria lá embaixo, seu Bergue, família de Josa. Como as pessoas podem dizer que não tinha indígenas? Claro que morava, eu vi, ninguém me falou.",
        author: "Antônio Nobre, 2026",
      },
      {
        kind: "p",
        text: "Genilson Oliveira dos Santos, conhecido por Gil da Amargosa, veio de Caraíva com 16 anos. Conta que quando o pessoal de dona Dior fazia qualquer barraco lá embaixo, os funcionários chegavam com trator e motosserra e colocavam tudo no chão. Em cada ilha há coqueiro e mangueira centenários plantados pelas famílias que ali viviam de plantação, pesca, guaiamum, caranguejo e mariscos.",
      },
      {
        kind: "quote",
        text: "O Eduardo a considerou como uma mendiga e falava que ela não era índia, só para não ter direito a nada na terra. Os jumentos morreram envenenados porque os funcionários colocaram veneno no bebedouro.",
        author: "Sobre Dona Dior — relato de Maria Aparecida Paru (CONCEIÇÃO, 2003, p.11)",
      },
    ],
  },
  {
    id: "retomada",
    title: "Retomando nosso território — 1992 e 1998",
    icon: Landmark,
    blocks: [
      {
        kind: "p",
        text: "Após aproximadamente dez anos de expulsão, vivendo de forma precária nos distritos e bairros, Ipê reuniu em 1992 os indígenas e parceiros indigenistas para retomar. Ele convidou a família Amargosa, o pessoal de Japará (seu Áureo, Das Neves, Marinalva, D'ajuda) e as famílias que aqui estavam (Bergue, Dior, Vital Lino). No lugar onde ficamos havia vários vestígios de nossos antepassados: fornos, ocas e sambaquis.",
      },
      {
        kind: "quote",
        text: "Vim conhecer a senhora, sabemos que você é indígena. Vamos reunir os parentes desaldeados e fazer uma retomada aqui, e queria seu apoio.",
        author: "Cacique Ipê, a Dona Dior",
      },
      {
        kind: "p",
        text: "Naquela primeira investida, cinquenta e cinco policiais entraram pela mata com motosserra e gasolina, tocaram fogo em tudo e colocaram todos para fora. Um indígena subiu e dormiu pendurado num pé de juerana, de tanto medo. Dona Dior, porém, continuou em sua casinha: ela nunca saiu deste território. Com o passar do tempo, Ipê reconduziu os trabalhos e, em 1998, fez uma nova retomada — e estamos aqui até hoje.",
      },
      {
        kind: "photos",
        items: [
          { src: caciqueIpe.url, caption: "Cacique Ipê, liderança das retomadas" },
          { src: familiaAureo.url, caption: "Alguns dos familiares de Áureo, Marinalva e Das Neves" },
        ],
      },
      {
        kind: "p",
        text: "Este povo de resistência se juntou a outras famílias Pataxó desterritorializadas que fugiram do Fogo de 1951, mas que sempre transitaram por este território — nas romarias de Nossa Senhora d'Ajuda, nos festejos de São Benedito, nas caçadas, nas roças, nas coletas de sementes e ervas medicinais.",
      },
      {
        kind: "quote",
        text: "Aqui não tinha ninguém, agora tem tanta criança, pai de família, mãe de família — e para onde vão? O governo tem que defender a gente, peço compaixão: somos seres humanos, não somos bicho. Nós temos o direito de viver.",
        author: "Sr. Áureo Cancela, 82 anos, participou da primeira retomada",
      },
      {
        kind: "quote",
        text: "Nós já estamos idosos, penso nas crianças, nesses novos. Estou com 80 anos, tenho dó de meus netos, meus filhos. Se eles saírem daqui, para onde é que vão, pelo amor de Deus?",
        author: "D. Marinalva Cancela",
      },
      {
        kind: "quote",
        text: "A reunião deliberou que permanecessem no local, onde começaram a abrir roças, configurando o que seria a primeira “retomada” de terras promovida pelos Pataxó do Extremo Sul.",
        author: "SAMPAIO, 2000, p.2",
      },
    ],
  },
  {
    id: "localizacao",
    title: "Localização e caracterização da TI Aldeia Velha",
    icon: HomeIcon,
    blocks: [
      {
        kind: "p",
        text: "A Terra Indígena Pataxó Aldeia Velha fica no extremo sul da Bahia, com área de 1.997 hectares, na região de Mata Atlântica, no distrito de Arraial d'Ajuda, município de Porto Seguro. Foi homologada pelo Decreto nº 12.000, de 18 de abril de 2024, e registrada no ofício de registro de imóveis da comarca de Porto Seguro sob a matrícula nº 58.744, em 09/07/2025.",
      },
      {
        kind: "p",
        text: "Possui área de preservação ambiental composta por três sítios arqueológicos, um sambaqui e uma área de manguezal banhada pelo rio Buranhém. O território conta com vegetação rasteira e frutífera onde se distribuem as principais moradias, a escola, o posto de saúde e pequenos comércios. As construções são de blocos e lajotas com telha cerâmica, a maioria oriunda do projeto de moradias sociais, além de construções de taipa, com energia elétrica fornecida pela COELBA.",
      },
      {
        kind: "photos",
        items: [
          { src: entradaTI.url, caption: "Entrada da TI Aldeia Velha" },
          { src: residencias.url, caption: "Residências e casa de farinha da Aldeia Velha" },
          { src: reservatorio.url, caption: "Reservatório principal e poço furado pela CERB" },
        ],
      },
      {
        kind: "p",
        text: "O abastecimento de água é feito por encanações vindas de um poço mantido pela SESAI, além de outros poços que ajudam na distribuição, ainda de forma precária. Há um poço cavado pela CERB e projeto aprovado para ampliação da rede na comunidade. Em 2002 havia uma caixa de 10.000 litros; em 2008 foi instalada uma nova, de 30.000 litros.",
      },
      {
        kind: "p",
        text: "Segundo levantamento da Coordenação Regional do Sul da Bahia (CRSB/FUNAI) de 2024, Aldeia Velha tem 470 famílias e 2.350 pessoas. Os dados do Posto de Saúde Indígena apontam 772 famílias e 1.783 pessoas. Acreditamos que o número de famílias corresponde ao do PSI e o total de indivíduos ao da CRSB/FUNAI.",
      },
      {
        kind: "p",
        text: "Os moradores são, em sua maioria, de baixa renda: trabalham na construção civil, em serviços de hotelaria ou em barracas de praia. Há também artesãos, agricultores familiares e funcionários públicos municipais que atuam no posto de saúde, na limpeza das ruas e na escola. Necessitamos de mais apoio de FUNAI, IBAMA, INEMA, ICMBIO e SESAI para uma melhor gestão territorial.",
      },
    ],
  },
  {
    id: "educacao",
    title: "Educação Escolar Indígena",
    icon: GraduationCap,
    blocks: [
      {
        kind: "p",
        text: "A Escola Indígena Pataxó Aldeia Velha propicia uma educação intercultural específica e diferenciada. Localizada no centro das moradias, tem 12 salas climatizadas: sala de vídeo, biblioteca, sala de atendimento educacional especializado, salas de oficinas e atividades da educação em tempo integral, secretaria e cozinha com refeitório, atendendo 235 estudantes da educação infantil aos anos finais. A área externa é ampla e murada, com quadra poliesportiva e espaço para modalidades esportivas indígenas tradicionais.",
      },
      {
        kind: "photos",
        items: [
          { src: escola.url, caption: "Escola Indígena Pataxó Aldeia Velha" },
          { src: primeiraSala.url, caption: "Cabana usada como primeira sala de aula (1999) e farinheira como sala (2000)" },
          { src: cooficializacao.url, caption: "Assinatura do decreto de cooficialização da língua Patxôhã em Porto Seguro" },
        ],
      },
      {
        kind: "p",
        text: "Após a retomada de 1998, os indígenas abriram à mão uma estrada de cerca de mil metros, com vários contornos para não afetar a mata. Construíram dois kigemes (cabanas): em uma delas aconteciam as aulas, iniciadas em abril de 1998, multisseriadas, com 20 alunos. Depois, a farinheira serviu de sala de aula por cerca de três anos.",
      },
      {
        kind: "p",
        text: "Temos a disciplina de língua materna (Patxôhã), que trabalha escrita, gramática, oralidade, histórias, cosmologia e valorização da cultura tradicional Pataxó. Em 2023, a língua materna foi cooficializada no município de Porto Seguro.",
      },
      {
        kind: "p",
        text: "Dois projetos são eixos norteadores da pedagogia indígena diferenciada: o Intercâmbio Cultural e Intercultural, desenvolvido por meio da vivência de alunos, professores, lideranças e integrantes do Grupo de Cultura nas comunidades Pataxó (GUEDES, 2023), e os Jogos Indígenas Infantojuvenis, que incentivam desde cedo as práticas esportivas culturais e fortalecem a identidade Pataxó (LIRA, 2018).",
      },
      {
        kind: "photos",
        items: [{ src: jogos.url, caption: "Jogos Infantojuvenis da Escola Indígena Pataxó Aldeia Velha" }],
      },
    ],
  },
  {
    id: "saude",
    title: "Saúde indígena tradicional e institucional",
    icon: HeartPulse,
    blocks: [
      {
        kind: "p",
        text: "Em nossa comunidade, anciãos e anciãs cuidam da saúde dos moradores com o conhecimento das ervas medicinais retiradas da mata e dos quintais produtivos, com benzimentos, rezas e cantos. Temos a Pajé Jaçanã (Maria d'Ajuda Alves da Conceição), parteira, benzedeira e remedeira, que relata ter realizado mais de mil partos sem nenhum óbito. Dona Esmeralda é outra referência comunitária, com grande conhecimento de ervas medicinais.",
      },
      {
        kind: "quote",
        text: "Minha mãe falava que tal erva era boa para tal doença, e ali eu guardava na mente.",
        author: "Dona Esmeralda (ANDRADE, 2016)",
      },
      {
        kind: "photos",
        items: [
          { src: esmeralda.url, caption: "D. Esmeralda e a Pajé Jaçanã" },
          { src: encontroPajes.url, caption: "Encontro de pajés, parteiras e benzedeiras" },
          { src: postoSaude.url, caption: "Primeiro posto de saúde e o atual, reformado" },
        ],
      },
      {
        kind: "p",
        text: "A transmissão desses saberes é oral e gestual, no âmbito familiar e comunitário. A escola integra esses conhecimentos ao currículo por meio de projetos como o Quintal Pedagógico (2010–2013), realizado no quintal da Pajé Jaçanã, e o Encontro Saberes e Fazeres de Mestres Indígenas, com representantes de 13 aldeias.",
      },
      {
        kind: "p",
        text: "A comunidade é atendida por uma Unidade Básica de Saúde Indígena (UBSI), com serviços da SESAI por meio da Equipe Multidisciplinar de Saúde Indígena (EMSI): pré-natal, vacinação, acompanhamento de hipertensão e diabetes, e acompanhamento do crescimento e desenvolvimento das crianças. Há recepção, consultório odontológico, enfermaria, clínico geral, farmácia e alojamento para motoristas.",
      },
      {
        kind: "p",
        text: "Lindibergue, filho de D. Nair e Gilbergue, foi o primeiro agente de saúde indígena. Buriti foi conselheiro atuante e primeiro secretário, e com o conselho de saúde conquistaram o saneamento dos primeiros banheiros, os primeiros atendimentos médicos e o primeiro poço artesiano. Potira Beatriz, criada em Barra Velha, aprendeu com o pai — rezador e pajé — a medicina natural e hoje cultiva ervas e ensina os parentes.",
      },
      {
        kind: "photos",
        items: [{ src: potira.url, caption: "Potirá, Buriti e Lindibergue" }],
      },
      {
        kind: "p",
        text: "Os dados indicam grupos com necessidades específicas: 195 crianças menores de 5 anos, 23 gestantes, 52 idosos acima de 70 anos, 95 pessoas com diabetes e hipertensão e 18 pessoas com deficiência. Recomenda-se que as ações de saúde dialoguem com lideranças, pajés, parteiras e benzedeiras, reconhecendo-as como agentes legítimos de cuidado.",
      },
    ],
  },
  {
    id: "cultura",
    title: "Preservação ambiental e cultural",
    icon: Leaf,
    blocks: [
      {
        kind: "p",
        text: "Ahnã Pataxó afirma que este é um território sagrado. Desde o início da retomada, o grupo trabalhou o fortalecimento da cultura e a preservação ambiental. Em 2004 ela se juntou a Patxia, Paty, Tapurumã, anciãos, anciãs e crianças e foram para a reserva fortalecer as atividades de etnoturismo.",
      },
      {
        kind: "quote",
        text: "Aquela reserva foi uma universidade: formou várias pessoas que estão dentro e fora do nosso território. Criamos o Grupo de Cultura da Aldeia, que continua ativo preservando e divulgando nossa cultura através do canto e da dança Pataxó.",
        author: "Ahnã Pataxó",
      },
      {
        kind: "photos",
        items: [
          { src: danca.url, caption: "Canto e dança do povo Pataxó" },
          { src: reserva.url, caption: "Reserva Pataxó Aldeia Velha" },
          { src: grupoCultura.url, caption: "Grupo de Cultura Pataxó da Aldeia Velha" },
        ],
      },
      {
        kind: "p",
        text: "Eyhnã tinha cerca de 15 anos quando iniciou os trabalhos na reserva e aprendeu a trabalhar com a natureza observando os mais velhos. Tapurumã relata que levaram a cultura e o nome da comunidade a vários lugares, como o Salão Nacional de Turismo em São Paulo, Ilha de Comandatuba e Salvador. Patxia conta que constituíram a Associação de Ecoturismo com apoio de parceiros e realizaram intercâmbios com os parentes de Barra Velha e da Reserva da Jaqueira. Mangaga lembra que começou em 2000, com um grupo pequeno, e que hoje temos 7 quilômetros de manguezal com grande diversidade de mariscos.",
      },
      {
        kind: "quote",
        text: "Uma aldeia sem cultura, sem um grupo que mantenha viva a tradição, os cantos e as rezas, acaba não sendo uma aldeia, tornando-se apenas um “bairro” não indígena.",
        author: "Romã, membro do Grupo de Cultura",
      },
      {
        kind: "quote",
        text: "Através de apresentações culturais, o coletivo obtém recursos que são direcionados para ajudar indígenas em situação de vulnerabilidade, fortalecendo os vínculos comunitários e territoriais e contribuindo para a autonomia e a dignidade do nosso povo Pataxó.",
        author: "NUNES, 2025, p.8",
      },
      {
        kind: "photos",
        items: [{ src: comunidadeCultura.url, caption: "Comunidade Indígena Pataxó Aldeia Velha" }],
      },
    ],
  },
  {
    id: "projetos",
    title: "Projetos sociais, culturais e habitação",
    icon: BookOpen,
    blocks: [
      {
        kind: "p",
        text: "Ao longo dos anos tivemos apoio de ONGs e constituímos duas associações comunitárias. A Associação de Mulheres em Ação (MEA) desenvolveu o Projeto Segundo Tempo (2006), o Arteducar (2007, com dança e artesanato) e organizou a Biblioteca Escolar Pataxi Makiame (2009). O Instituto Tribos Jovens desenvolveu oficinas de audiovisual, o Inventário Cultural Pataxó (2011), o Portal Muka Mukau, o Kitokre e apoio aos encontros de professores da língua materna e aos jogos comunitários.",
      },
      {
        kind: "photos",
        items: [
          { src: museu.url, caption: "Projeto Museu a Céu Aberto — saberes, fazeres e memória" },
          { src: casas.url, caption: "Casas do projeto de Unidade Habitacional" },
        ],
      },
      {
        kind: "p",
        text: "Em 2003, Arnã Pataxó formou o Grupo de Cultura junto com Paty Pataxó, Tapurumã, Patxia e outros, e em 2004 constituíram a Associação de Ecoturismo (CNPJ 09.139.153/0001-99), que segue na luta até hoje. Em 2013 fundamos a Associação Outras Tribos, cujo principal projeto foi a Unidade de Beneficiamento de Polpa (2018), para 20 famílias indígenas.",
      },
      {
        kind: "p",
        text: "Pela seleção pública 001/2010, de produção social de moradias para populações tradicionais da Bahia, fomos contemplados com 120 moradias que substituíram construções de taipa. A primeira etapa começou em novembro de 2010 com duas casas modelo, com participação direta dos indígenas nas construções e apoio técnico da ONG Green Verde, incluindo cursos de capacitação em construção civil.",
      },
    ],
  },
];

const projetosTribosJovens = [
  { projeto: "Ponto de Cultura da Bahia", publico: "Comunidade Indígena", apoio: "Programa Mais Cultura", ano: "2009" },
  { projeto: "Agitação Cultural", publico: "Jovens da comunidade", apoio: "Fundo de Cultura", ano: "2015" },
  {
    projeto: "Fortalecendo a rede de proteção da criança e adolescentes em Porto Seguro",
    publico: "Jovens e crianças indígenas Pataxó",
    apoio: "—",
    ano: "2016",
  },
  {
    projeto: "Encontro: Saberes e fazeres de mestres e conhecedores indígenas",
    publico: "15 comunidades e três etnias",
    apoio: "—",
    ano: "2017",
  },
  { projeto: "Museu a Céu Aberto", publico: "Comunidade, pesquisadores e professores", apoio: "—", ano: "2017" },
  {
    projeto: "Etnomapeamento da Aldeia Velha Pataxó",
    publico: "Comunidade",
    apoio: "Associação de Ecoturismo",
    ano: "2021",
  },
  {
    projeto: "Chamada pública nº 14/2019 — Socioambientais/Biodiversidade",
    publico: "Quintais produtivos e mudas para reflorestamento",
    apoio: "Associação de Ecoturismo",
    ano: "2019",
  },
  { projeto: "Unidade de beneficiamento de polpa", publico: "20 famílias indígenas", apoio: "Outras Tribos", ano: "2018" },
];

const referencias = [
  "ANDRADE, Aline Silva de. Lutas e Conquistas: Mulheres Indígenas Pataxó de Aldeia Velha. FIEI/UFMG, 2016.",
  "BRASIL. Decreto nº 12.000, de 18 de abril de 2024. Homologa a demarcação da Terra Indígena Aldeia Velha.",
  "CARMO, Angelo Santos do. Aldeia Velha, Saberes, Fazeres e Memória. LICEEI/UNEB, 2019.",
  "CARMO, Angelo Santos do. Processos Históricos e Culturais na Comunidade Indígena Pataxó Aldeia Velha. PPGER/UFSB, 2022.",
  "CONCEIÇÃO (PARU), Maria Aparecida Alves da. História da Aldeia Velha. Formação para Professores Indígenas da Bahia, 2003.",
  "GUEDES, Ahnã Pataxó Meirelles. Intercâmbio Cultural e Territorial Enquanto Prática Pedagógica Diferenciada. FIEI/UFMG, 2023.",
  "INSTITUTO TRIBOS JOVENS. Inventário Cultural Pataxó: Atxohã. ITJ, 2011.",
  "LIRA, Antonildo Silva de (Txaywã Pataxó). Jogos Indígenas Infantojuvenil Pataxó. FIEI/UFMG, 2019.",
  "NEUWIED, Maximiliano Príncipe de Wied. Viagem ao Brasil. Brasiliana, 1940.",
  "SOTTO-MAIOR, Leila Silvia Burger. Relatório Circunstancial de Identificação e Delimitação da TI Aldeia Velha. FUNAI, D.O.U. 17/06/2008.",
];

const documentarios = [
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

function ListenButton({ text }: { text: string }) {
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => () => stopSpeak(), []);

  const toggle = () => {
    if (speaking) {
      stopSpeak();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    speak(text, "pt-BR", 0.95, undefined, () => setSpeaking(false));
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/20"
      aria-label={speaking ? "Parar narração" : "Ouvir este capítulo"}
    >
      {speaking ? <Square className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      <T>{speaking ? "Parar narração" : "Ouvir capítulo"}</T>
    </button>
  );
}

function PhotoGrid({ items }: { items: Photo[] }) {
  const [active, setActive] = useState<Photo | null>(null);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setActive(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  return (
    <>
      <div
        className={`my-8 grid gap-4 ${
          items.length === 1
            ? "mx-auto max-w-2xl grid-cols-1"
            : items.length === 2
              ? "sm:grid-cols-2"
              : "sm:grid-cols-2 lg:grid-cols-3"
        }`}
      >
        {items.map((p, i) => (
          <figure
            key={p.src}
            className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/50 shadow-md"
          >
            <button
              type="button"
              onClick={() => setActive(p)}
              className="block w-full cursor-zoom-in"
              aria-label={`Ampliar foto: ${p.caption}`}
            >
              <img
                src={p.src}
                alt={p.caption}
                loading="lazy"
                decoding="async"
                className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <span className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur transition group-hover:opacity-100">
                <Maximize2 className="h-4 w-4" />
              </span>
            </button>
            <figcaption className="flex items-start gap-2.5 border-t border-border/40 px-4 py-3">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">
                {i + 1}
              </span>
              <span className="text-xs font-medium leading-snug text-muted-foreground">
                <T>{p.caption}</T>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={active.caption}
          onClick={() => setActive(null)}
        >
          <button
            type="button"
            onClick={() => setActive(null)}
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            aria-label="Fechar foto ampliada"
          >
            <X className="h-5 w-5" />
          </button>
          <figure className="max-h-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <img
              src={active.src}
              alt={active.caption}
              className="max-h-[80vh] w-full rounded-2xl object-contain shadow-2xl"
            />
            <figcaption className="mt-3 text-center text-sm text-white/85">
              <T>{active.caption}</T>
            </figcaption>
          </figure>
        </div>
      )}
    </>
  );
}

function AldeiaVelhaPage() {
  return (
    <div className="min-h-screen text-foreground">
      <SiteHeader mode="adulto" />

      <main className="mx-auto max-w-5xl px-4 pb-20 md:px-8">
        <Link
          to="/historias"
          className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          <T>Voltar para Histórias</T>
        </Link>

        <header className="mt-6 overflow-hidden rounded-3xl border border-primary/25 bg-card/60">
          <img
            src={capa.url}
            alt="Comunidade Indígena Pataxó Aldeia Velha — Somos Todos Aldeia Velha"
            className="h-64 w-full object-cover md:h-96"
          />
          <div className="p-6 md:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              <T>Comunidade Indígena Pataxó Aldeia Velha · C.I.P.A.V.</T>
            </p>
            <h1 className="mt-3 text-3xl font-bold leading-tight md:text-5xl">
              <T>Somos Todos Aldeia Velha</T>
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
              <T>
                Terra Indígena Pataxó Aldeia Velha — Território Ancestral. Relatório de memória,
                resistência e luta produzido pela comunidade. Porto Seguro, Bahia, junho de 2026.
              </T>
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                { k: "1.997 ha", v: "Área homologada" },
                { k: "2.350", v: "Pessoas na comunidade" },
                { k: "1992 · 1998", v: "Retomadas do território" },
              ].map((s) => (
                <div key={s.k} className="rounded-2xl border border-border/60 bg-background/50 p-4">
                  <div className="text-xl font-bold text-primary">{s.k}</div>
                  <div className="text-xs text-muted-foreground">
                    <T>{s.v}</T>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </header>

        <nav className="mt-8 flex flex-wrap gap-2">
          {chapters.map((c) => (
            <a
              key={c.id}
              href={`#${c.id}`}
              className="rounded-full border border-border/60 bg-card/50 px-4 py-2 text-xs font-medium text-muted-foreground transition hover:border-primary/50 hover:text-primary"
            >
              <T>{c.title}</T>
            </a>
          ))}
        </nav>

        {chapters.map((chapter) => {
          const Icon = chapter.icon;
          const plain = chapter.blocks
            .filter((b) => b.kind !== "photos")
            .map((b) => (b as { text: string }).text)
            .join(" ");
          return (
            <section key={chapter.id} id={chapter.id} className="mt-14 scroll-mt-24">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
                <h2 className="flex items-center gap-3 text-2xl font-bold md:text-3xl">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/15 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <T>{chapter.title}</T>
                </h2>
                <ListenButton text={`${chapter.title}. ${plain}`} />
              </div>

              <div className="mt-6 space-y-5">
                {chapter.blocks.map((block, i) => {
                  if (block.kind === "p") {
                    return (
                      <p key={i} className="text-base leading-relaxed text-muted-foreground md:text-lg">
                        <T>{block.text}</T>
                      </p>
                    );
                  }
                  if (block.kind === "quote") {
                    return (
                      <blockquote
                        key={i}
                        className="rounded-2xl border-l-4 border-primary/70 bg-card/50 px-5 py-4"
                      >
                        <p className="text-base italic leading-relaxed md:text-lg">
                          <T>{block.text}</T>
                        </p>
                        {block.author && (
                          <footer className="mt-2 text-xs font-semibold uppercase tracking-wider text-primary">
                            {block.author}
                          </footer>
                        )}
                      </blockquote>
                    );
                  }
                  return <PhotoGrid key={i} items={block.items} />;
                })}
              </div>
            </section>
          );
        })}

        <section className="mt-16">
          <h2 className="text-2xl font-bold md:text-3xl">
            <T>Projetos realizados na comunidade</T>
          </h2>
          <div className="mt-5 overflow-x-auto rounded-2xl border border-border/60">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-primary/10 text-primary">
                <tr>
                  <th className="px-4 py-3 font-semibold">Projeto</th>
                  <th className="px-4 py-3 font-semibold">Público-alvo</th>
                  <th className="px-4 py-3 font-semibold">Apoio</th>
                  <th className="px-4 py-3 font-semibold">Ano</th>
                </tr>
              </thead>
              <tbody>
                {projetosTribosJovens.map((p) => (
                  <tr key={p.projeto} className="border-t border-border/50 text-muted-foreground">
                    <td className="px-4 py-3">
                      <T>{p.projeto}</T>
                    </td>
                    <td className="px-4 py-3">
                      <T>{p.publico}</T>
                    </td>
                    <td className="px-4 py-3">{p.apoio}</td>
                    <td className="px-4 py-3">{p.ano}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="flex items-center gap-3 text-2xl font-bold md:text-3xl">
            <Link2 className="h-6 w-6 text-primary" />
            <T>Documentários e entrevistas</T>
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            <T>
              Registros em vídeo com moradores da Aldeia Velha e parceiros que lutam pelo direito de
              estarmos em nosso território tradicional.
            </T>
          </p>
          <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {documentarios.map((url, i) => (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noreferrer noopener"
                className="truncate rounded-xl border border-border/60 bg-card/50 px-4 py-3 text-sm text-muted-foreground transition hover:border-primary/50 hover:text-primary"
              >
                <T>Registro</T> {i + 1}
              </a>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-bold md:text-3xl">
            <T>Referências</T>
          </h2>
          <ul className="mt-5 space-y-3 text-sm leading-relaxed text-muted-foreground">
            {referencias.map((r) => (
              <li key={r} className="border-l-2 border-primary/40 pl-4">
                {r}
              </li>
            ))}
          </ul>
          <p className="mt-8 rounded-2xl border border-primary/25 bg-primary/5 p-5 text-sm text-muted-foreground">
            <T>
              Organização: Angelo Santos do Carmo — Pataxó, liderança e professor, licenciado em
              Pedagogia (ULBRA, 2013) e em Ciências Humanas e Sociais (LICEEI/UNEB, 2019), Mestre em
              Relações Étnico-Raciais (PPGER/UFSB, 2022) e doutorando em Educação e Movimentos
              Sociais (FAE/UFMG).
            </T>
          </p>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

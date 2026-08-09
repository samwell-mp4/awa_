import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Leaf, Heart, Globe, Target, Sparkles, Users } from "lucide-react";
import { PublicFooter } from "@/components/PublicFooter";
import { useEffect } from "react";
import { speak } from "@/lib/speak";
import { useTranslation } from "react-i18next";

import logoSrc from "@/assets/awa-tech-logo.png";
import heroWoman from "@/assets/hero-woman.jpg";
import { useLastArea } from "@/lib/last-area";

export const Route = createFileRoute("/biografia")({
  head: () => ({
    meta: [
      { title: "Biografia — AWÃ TECH" },
      {
        name: "description",
        content:
          "Conheça a história da AWÃ TECH: uma plataforma dedicada ao ensino de línguas indígenas brasileiras e à preservação de culturas vivas.",
      },
      { property: "og:title", content: "Biografia — AWÃ TECH" },
      {
        property: "og:description",
        content:
          "A história da AWÃ TECH: tecnologia a serviço das línguas e culturas indígenas do Brasil.",
      },
      { property: "og:image", content: heroWoman },
      { name: "twitter:image", content: heroWoman },
    ],
  }),
  component: BiografiaPage,
});

function BiografiaPage() {
  const backTo = useLastArea();
  const { i18n } = useTranslation();

  useEffect(() => {
    const isKids = typeof backTo === "string" && backTo.includes("infantil");
    const timer = setTimeout(() => {
      const bioText = i18n.language === "pt" 
        ? "AWÃ TECH. Tecnologia que preserva a memória, fortalece as raízes e conecta o futuro à sabedoria ancestral. O Awã Tech nasceu com a missão de unir a tecnologia à sabedoria ancestral dos povos indígenas. Criado para preservar, valorizar e ensinar as línguas e culturas originárias do Brasil, o projeto busca garantir que esses conhecimentos continuem vivos e sejam compartilhados com as futuras gerações. Por meio de um aplicativo moderno e acessível, o Awã Tech oferece aulas de idiomas indígenas, áudios com pronúncia de falantes nativos, histórias tradicionais, músicas, vídeos, jogos educativos e conteúdos culturais. A plataforma conecta tradição e inovação, tornando o aprendizado envolvente para crianças, jovens e adultos."
        : "AWÃ TECH. Technology that preserves memory, strengthens roots, and connects the future to ancestral wisdom. Awã Tech was born with the mission of bridging technology with the ancestral wisdom of indigenous peoples. Created to preserve, value, and teach the original languages and cultures of Brazil, the project seeks to ensure that this knowledge remains alive and shared with future generations. Through a modern and accessible application, Awã Tech offers indigenous language classes, audio with native speaker pronunciation, traditional stories, music, videos, educational games, and cultural content. The platform connects tradition and innovation, making learning engaging for children, youth, and adults.";
      
      speak(bioText, i18n.language === "pt" ? "pt-BR" : "en-US", isKids ? 1.1 : 1.0, isKids ? 1.5 : 1.0);
    }, 1000);
    return () => clearTimeout(timer);
  }, [i18n.language, backTo]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gold/20 bg-[oklch(0.14_0.03_145/0.85)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-8">
          <Link to={backTo as "/"} className="flex items-center gap-2.5">
            <img
              loading="lazy"
              decoding="async"
              src={logoSrc}
              alt="AWÃ TECH"
              className="h-10 w-10 shrink-0 rounded-full bg-cream/95 p-0.5 object-contain"
            />
            <div className="leading-none">
              <div className="font-display text-lg font-black tracking-tight text-cream">
                AWÃ <span className="text-leaf">TECH</span>
              </div>
            </div>
          </Link>
          <Link
            to={backTo as "/"}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-foreground/80 transition hover:bg-leaf/15 hover:text-cream"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 md:px-8">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-gold/20 bg-card/40">
          <div className="absolute inset-0">
            <img
              loading="lazy"
              decoding="async"
              src={heroWoman}
              alt="Mulher indígena na floresta"
              className="h-full w-full object-cover opacity-25"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[oklch(0.12_0.03_145/0.95)] via-[oklch(0.12_0.03_145/0.75)] to-transparent" />
          </div>
          <div className="relative px-6 py-12 md:px-12 md:py-16">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold">
                <Sparkles className="h-3.5 w-3.5" />
                Nossa história
              </div>
              <h1 className="font-display text-3xl font-extrabold leading-tight text-cream md:text-5xl">
                AWÃ TECH
              </h1>
              <p className="mt-4 text-lg text-foreground/80 md:text-xl">
                Tecnologia que preserva a memória, fortalece as raízes e conecta o futuro à
                sabedoria ancestral.
              </p>
            </div>
          </div>
        </section>

        {/* Intro */}
        <section className="mt-10 space-y-4 text-foreground/85">
          <p className="text-lg leading-relaxed">
            O <strong className="text-cream">Awã Tech</strong> nasceu com a missão de unir a
            tecnologia à sabedoria ancestral dos povos indígenas. Criado para preservar, valorizar e
            ensinar as línguas e culturas originárias do Brasil, o projeto busca garantir que esses
            conhecimentos continuem vivos e sejam compartilhados com as futuras gerações.
          </p>
          <p className="leading-relaxed">
            Por meio de um aplicativo moderno e acessível, o Awã Tech oferece aulas de idiomas
            indígenas, áudios com pronúncia de falantes nativos, histórias tradicionais, músicas,
            vídeos, jogos educativos e conteúdos culturais. A plataforma conecta tradição e inovação,
            tornando o aprendizado envolvente para crianças, jovens e adultos.
          </p>
          <p className="leading-relaxed">
            Mais do que um aplicativo, o Awã Tech é um movimento de valorização da identidade, da
            memória e do patrimônio cultural dos povos originários. Seu propósito é fortalecer as
            comunidades indígenas, promover o respeito à diversidade cultural e aproximar pessoas de
            diferentes origens da riqueza das culturas indígenas brasileiras.
          </p>
        </section>

        {/* Values */}
        <section className="mt-12">
          <h2 className="mb-6 font-display text-2xl font-bold text-cream">Nossos pilares</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Pillar
              icon={Heart}
              title="Respeito cultural"
              text="Todo conteúdo é construído com escuta, cuidado e reconhecimento da autoria dos povos indígenas."
            />
            <Pillar
              icon={Leaf}
              title="Preservação viva"
              text="Línguas e culturas não são museu: se aprendem, cantam e se reinventam a cada dia."
            />
            <Pillar
              icon={Globe}
              title="Acesso democrático"
              text="Queremos que estudantes, pesquisadores e curiosos possam aprender de forma gratuita e acolhedora."
            />
            <Pillar
              icon={Users}
              title="Comunidade"
              text="A plataforma é feita para e com as comunidades, valorizando mestres, jovens e ancestrais."
            />
            <Pillar
              icon={Target}
              title="Educação de qualidade"
              text="Trilhas, dicionário, tradutor e professor virtual formam um ecossistema de aprendizado completo."
            />
            <Pillar
              icon={Sparkles}
              title="Inovação com sentido"
              text="Inteligência artificial e recursos digitais usados para amplificar, nunca substituir, a voz dos povos."
            />
          </div>
        </section>

        {/* Timeline / Story */}
        <section className="mt-14">
          <h2 className="mb-6 font-display text-2xl font-bold text-cream">Caminho da AWÃ TECH</h2>
          <div className="space-y-6 border-l-2 border-gold/30 pl-6">
            <Milestone
              year="Origem"
              title="O sonho de uma língua viva"
              text="A ideia nasceu da vontade de disponibilizar o Patxôhã de forma moderna, acessível e bonita, para quem quer aprender."
            />
            <Milestone
              year="Construção"
              title="Dicionário, trilhas e Professor Akuã"
              text="Organizamos milhares de palavras, criamos trilhas de aprendizado e desenvolvemos o assistente virtual com base no dicionário Pataxôhã."
            />
            <Milestone
              year="Hoje"
              title="Músicas, vídeos e histórias"
              text="A plataforma cresce com galeria de músicas bilingues, vídeos da aldeia e narrativas sobre cosmovisão, grafismos e resistência Pataxó."
            />
            <Milestone
              year="Futuro"
              title="Mais línguas, mais vozes"
              text="Queremos expandir para outras línguas indígenas, sempre de mãos dadas com os povos que as mantêm vivas."
            />
          </div>
        </section>

        {/* CTA */}
        <section className="mt-14 rounded-2xl border border-gold/20 bg-gradient-to-br from-leaf/20 to-forest-deep/20 p-6 text-center md:p-10">
          <h2 className="font-display text-2xl font-bold text-cream">Faça parte da jornada</h2>
          <p className="mx-auto mt-3 max-w-xl text-foreground/80">
            Explore o dicionário, ouça as músicas, converse com o Professor Akuã e descubra as
            histórias que tornam a AWÃ TECH uma ponte entre mundos.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/dicionario"
              className="inline-flex items-center justify-center rounded-full bg-gold px-6 py-2.5 text-sm font-bold text-forest-deep transition hover:bg-gold/90"
            >
              Dicionário
            </Link>
            <Link
              to="/musicas"
              className="inline-flex items-center justify-center rounded-full border border-gold/40 bg-card/60 px-6 py-2.5 text-sm font-bold text-cream transition hover:bg-gold/10"
            >
              Músicas
            </Link>
            <Link
              to="/professor"
              className="inline-flex items-center justify-center rounded-full border border-gold/40 bg-card/60 px-6 py-2.5 text-sm font-bold text-cream transition hover:bg-gold/10"
            >
              Professor Akuã
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter />

    </div>
  );
}

function Pillar({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof Leaf;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-gold/15 bg-card/40 p-5 transition hover:border-gold/30">
      <div className="grid h-10 w-10 place-items-center rounded-full bg-leaf/15 text-leaf">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 font-semibold text-cream">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-foreground/75">{text}</p>
    </div>
  );
}

function Milestone({ year, title, text }: { year: string; title: string; text: string }) {
  return (
    <div className="relative">
      <span className="absolute -left-[31px] top-1 grid h-4 w-4 place-items-center rounded-full bg-gold" />
      <div className="text-xs font-bold uppercase tracking-wider text-gold">{year}</div>
      <h3 className="mt-1 font-semibold text-cream">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-foreground/75">{text}</p>
    </div>
  );
}

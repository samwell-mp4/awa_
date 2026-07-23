import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ArrowRight, ShieldCheck, Sparkles, Globe2 } from "lucide-react";
import { Logo } from "@/components/home/logo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { T } from "@/components/T";
import { PublicFooter } from "@/components/PublicFooter";
import infantilLogo from "@/assets/infantil-logo-new.jpg.asset.json";
import adultoLogo from "@/assets/adulto-logo.png.asset.json";
import landingBg from "@/assets/landing-bg.jpg.asset.json";

const MENU_I18N: Record<string, { adulto: string; crianca: string; adultoDesc: string; criancaDesc: string; entrar: string }> = {
  pt: { adulto: "Adulto", crianca: "Criança", adultoDesc: "Trilhas, tradutor, dicionário e Espaço do Professor.", criancaDesc: "Jogos, músicas e histórias para aprender brincando.", entrar: "Entrar" },
  en: { adulto: "Adult", crianca: "Kids", adultoDesc: "Trails, translator, dictionary and Teacher's Space.", criancaDesc: "Games, songs and stories to learn while playing.", entrar: "Enter" },
  es: { adulto: "Adulto", crianca: "Niños", adultoDesc: "Rutas, traductor, diccionario y Espacio del Profesor.", criancaDesc: "Juegos, canciones e historias para aprender jugando.", entrar: "Entrar" },
  pat: { adulto: "Adulto", crianca: "Kotxohã", adultoDesc: "Trilhas, tradutor, dicionário e Espaço do Professor.", criancaDesc: "Jogos, músicas e histórias para aprender brincando.", entrar: "Enter" },
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AWÃ TECH — Línguas indígenas, culturas vivas" },
      {
        name: "description",
        content:
          "Plataforma AWÃ TECH: aprenda línguas indígenas brasileiras com trilhas guiadas, dicionário, histórias, jogos e vídeos — para adultos e crianças.",
      },
      { property: "og:title", content: "AWÃ TECH — Línguas indígenas, culturas vivas" },
      {
        property: "og:description",
        content:
          "Duas experiências dedicadas ao ensino de línguas indígenas: uma para adultos e outra para crianças.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://awa-tech.store" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://awa-tech.store" }],
  }),
  component: LandingChoice,
});

function LandingChoice() {
  return (
    <div
      className="min-h-screen text-foreground flex flex-col bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(8,16,12,0.72) 0%, rgba(8,16,12,0.55) 40%, rgba(8,16,12,0.88) 100%), url(${landingBg.url})`,
      }}
    >
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-5 md:px-8">
        <Logo />
        <LanguageSwitcher />
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center px-4 pb-16 pt-6 text-center md:px-8 md:pt-10">
        <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-forest-deep/60 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-gold/90 backdrop-blur-sm">
          <Sparkles className="h-3.5 w-3.5" />
          <T>Plataforma oficial AWÃ TECH</T>
        </span>

        <h1 className="mt-6 max-w-3xl font-display text-4xl font-black leading-[1.05] text-cream md:text-6xl">
          <T>Línguas indígenas,</T>{" "}
          <span className="text-gradient-gold"><T>culturas vivas.</T></span>
        </h1>
        <p className="mt-4 max-w-2xl text-sm text-foreground/80 md:text-base">
          <T>
            Escolha a experiência que combina com você. Trilhas guiadas, dicionário, histórias e jogos —
            desenvolvidos com respeito e curadoria cultural.
          </T>
        </p>

        <div className="mt-12 grid w-full gap-6 md:grid-cols-2 md:gap-8">
          <ExperienceCard
            to="/adulto"
            image={adultoLogo.url}
            eyebrow="Awã Tech"
            title="Adulto"
            description="Trilhas, tradutor, dicionário e Espaço do Professor."
            priority
          />
          <ExperienceCard
            to="/infantil"
            image={infantilLogo.url}
            eyebrow="Awã Tech"
            title="Criança"
            description="Jogos, músicas e histórias para aprender brincando."
          />
        </div>

        <div className="mt-12 grid w-full max-w-4xl grid-cols-1 gap-3 text-left sm:grid-cols-3">
          <TrustPill icon={ShieldCheck} title="Pagamento seguro" copy="Processado por Paddle" />
          <TrustPill icon={Globe2} title="Multi-idioma" copy="PT · EN · ES · Patxôhã" />
          <TrustPill icon={Sparkles} title="Curadoria cultural" copy="Com anciãos e educadores" />
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

function ExperienceCard({
  to,
  image,
  eyebrow,
  title,
  description,
  priority = false,
}: {
  to: "/adulto" | "/infantil";
  image: string;
  eyebrow: string;
  title: string;
  description: string;
  priority?: boolean;
}) {
  return (
    <Link
      to={to}
      replace
      className="group relative block overflow-hidden rounded-3xl border border-gold/25 bg-forest-deep/40 shadow-[var(--shadow-card)] backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-gold/60 hover:shadow-[var(--shadow-gold)] focus-visible:-translate-y-1"
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={image}
          alt={`Awã Tech ${title}`}
          width={800}
          height={800}
          fetchPriority={priority ? "high" : undefined}
          loading={priority ? undefined : "lazy"}
          decoding="async"
          className="block h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          draggable={false}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest-deep/90 via-forest-deep/10 to-transparent" />
        <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-forest-deep/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold/90 backdrop-blur-sm">
          <T>{eyebrow}</T>
        </span>
      </div>

      <div className="relative flex items-end justify-between gap-4 px-5 py-5 md:px-6 md:py-6">
        <div className="min-w-0 text-left">
          <div className="font-display text-2xl font-black uppercase tracking-tight text-cream md:text-3xl">
            <T>{title}</T>
          </div>
          <p className="mt-1 text-xs text-foreground/70 md:text-sm">
            <T>{description}</T>
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-gold px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-forest-deep shadow-md transition group-hover:brightness-110 md:text-sm">
          <T>Entrar</T> <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}

function TrustPill({
  icon: Icon,
  title,
  copy,
}: {
  icon: typeof ShieldCheck;
  title: string;
  copy: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-gold/15 bg-forest-deep/50 px-4 py-3 backdrop-blur-sm">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[var(--gradient-leaf)] text-cream shadow-[var(--shadow-glow)]">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <div className="text-xs font-bold uppercase tracking-wider text-cream">
          <T>{title}</T>
        </div>
        <div className="truncate text-[11px] text-foreground/70">
          <T>{copy}</T>
        </div>
      </div>
    </div>
  );
}

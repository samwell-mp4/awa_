import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ArrowRight, ShieldCheck, Sparkles, Globe2, LogIn, UserRound } from "lucide-react";
import { Logo } from "@/components/home/logo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { PublicFooter } from "@/components/PublicFooter";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import infantilLogo from "@/assets/infantil-logo-new.jpg.asset.json";
import adultoLogo from "@/assets/adulto-logo.png.asset.json";
import landingBg from "@/assets/landing-bg.jpg.asset.json";

type Dict = {
  badge: string;
  h1a: string;
  h1b: string;
  lead: string;
  adulto: string;
  crianca: string;
  adultoDesc: string;
  criancaDesc: string;
  entrar: string;
  pagTitle: string;
  pagCopy: string;
  multiTitle: string;
  multiCopy: string;
  curTitle: string;
  curCopy: string;
};

const MENU_I18N: Record<string, Dict> = {
  pt: {
    badge: "Plataforma oficial AWÃ TECH",
    h1a: "Línguas indígenas,",
    h1b: "culturas vivas.",
    lead: "Escolha a experiência que combina com você. Trilhas guiadas, dicionário, histórias e jogos — desenvolvidos com respeito e curadoria cultural.",
    adulto: "Adulto",
    crianca: "Criança",
    adultoDesc: "Trilhas, tradutor, dicionário e Espaço do Professor.",
    criancaDesc: "Jogos, músicas e histórias para aprender brincando.",
    entrar: "Entrar",
    pagTitle: "Pagamento seguro",
    pagCopy: "Processado por Paddle",
    multiTitle: "Multi-idioma",
    multiCopy: "PT · EN · ES · Patxôhã",
    curTitle: "Curadoria cultural",
    curCopy: "Com anciãos e educadores",
  },
  en: {
    badge: "Official AWÃ TECH platform",
    h1a: "Indigenous languages,",
    h1b: "living cultures.",
    lead: "Choose the experience that fits you. Guided trails, dictionary, stories and games — built with respect and cultural curation.",
    adulto: "Adult",
    crianca: "Kids",
    adultoDesc: "Trails, translator, dictionary and Teacher's Space.",
    criancaDesc: "Games, songs and stories to learn while playing.",
    entrar: "Enter",
    pagTitle: "Secure payment",
    pagCopy: "Processed by Paddle",
    multiTitle: "Multi-language",
    multiCopy: "PT · EN · ES · Patxôhã",
    curTitle: "Cultural curation",
    curCopy: "With elders and educators",
  },
  es: {
    badge: "Plataforma oficial AWÃ TECH",
    h1a: "Lenguas indígenas,",
    h1b: "culturas vivas.",
    lead: "Elige la experiencia que combina contigo. Rutas guiadas, diccionario, historias y juegos — desarrollados con respeto y curaduría cultural.",
    adulto: "Adulto",
    crianca: "Niños",
    adultoDesc: "Rutas, traductor, diccionario y Espacio del Profesor.",
    criancaDesc: "Juegos, canciones e historias para aprender jugando.",
    entrar: "Entrar",
    pagTitle: "Pago seguro",
    pagCopy: "Procesado por Paddle",
    multiTitle: "Multi-idioma",
    multiCopy: "PT · EN · ES · Patxôhã",
    curTitle: "Curaduría cultural",
    curCopy: "Con ancianos y educadores",
  },
  pat: {
    badge: "Plataforma oficial AWÃ TECH",
    h1a: "Patxôhã txopai,",
    h1b: "hãpõhã hitá.",
    lead: "Awê kuruk apkã txopai. Trilhas, dicionário, histórias e jogos — com respeito e cultura viva.",
    adulto: "Adulto",
    crianca: "Kotxohã",
    adultoDesc: "Trilhas, tradutor, dicionário e Espaço do Professor.",
    criancaDesc: "Jogos, músicas e histórias para aprender brincando.",
    entrar: "Awê",
    pagTitle: "Pagamento seguro",
    pagCopy: "Processado por Paddle",
    multiTitle: "Multi-idioma",
    multiCopy: "PT · EN · ES · Patxôhã",
    curTitle: "Curadoria cultural",
    curCopy: "Com anciãos e educadores",
  },
};

function useMenuDict(): Dict {
  const { i18n } = useTranslation();
  const raw = (i18n.language || "pt").toLowerCase();
  const key = raw.startsWith("pat") ? "pat" : raw.slice(0, 2);
  return MENU_I18N[key] ?? MENU_I18N.pt;
}

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
  const dict = useMenuDict();
  const { user, loading } = useAuth();
  const { hasInfantil, hasAdulto, loading: subLoading } = useSubscription();
  // Depois de assinar, mostramos apenas a área contratada.
  const hasAny = hasInfantil || hasAdulto;
  const showAdulto = !hasAny || hasAdulto;
  const showInfantil = !hasAny || hasInfantil;
  const onlyOne = showAdulto !== showInfantil;

  return (
    <div
      className="min-h-screen text-foreground flex flex-col bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(8,16,12,0.72) 0%, rgba(8,16,12,0.55) 40%, rgba(8,16,12,0.88) 100%), url(${landingBg.url})`,
      }}
    >
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-5 md:px-8">
        <Logo />
        <div className="flex items-center gap-2 md:gap-3">
          <LanguageSwitcher />
          {!loading && (
            user ? (
              <Link
                to="/minha-conta"
                className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-forest-deep/70 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-gold/90 backdrop-blur-sm hover:bg-forest-deep/90 md:px-4 md:py-2 md:text-xs"
              >
                <UserRound className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span className="hidden sm:inline">{dict.entrar === "Enter" ? "My account" : dict.entrar === "Awê" ? "Kua konã" : "Minha conta"}</span>
              </Link>
            ) : (
              <Link
                to="/auth"
                className="inline-flex items-center gap-1.5 rounded-full bg-gold px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-forest-deep shadow-md hover:brightness-110 md:px-4 md:py-2 md:text-xs"
              >
                <LogIn className="h-3.5 w-3.5 md:h-4 md:w-4" />
                {dict.entrar}
              </Link>
            )
          )}
        </div>
      </header>


      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center px-4 pb-16 pt-6 text-center md:px-8 md:pt-10">
        <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-forest-deep/60 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-gold/90 backdrop-blur-sm">
          <Sparkles className="h-3.5 w-3.5" />
          {dict.badge}
        </span>

        <h1 className="mt-6 max-w-3xl font-display text-4xl font-black leading-[1.05] text-cream md:text-6xl">
          {dict.h1a}{" "}
          <span className="text-gradient-gold">{dict.h1b}</span>
        </h1>
        <p className="mt-4 max-w-2xl text-sm text-foreground/80 md:text-base">
          {dict.lead}
        </p>

        <div
          className={`mt-12 grid w-full gap-6 md:gap-8 ${onlyOne ? "max-w-md" : "md:grid-cols-2"}`}
        >
          {showAdulto && (
            <ExperienceCard
              to="/adulto"
              image={adultoLogo.url}
              eyebrow="Awã Tech"
              title={dict.adulto}
              description={dict.adultoDesc}
              entrar={dict.entrar}
              priority
            />
          )}
          {showInfantil && (
            <ExperienceCard
              to="/infantil"
              image={infantilLogo.url}
              eyebrow="Awã Tech"
              title={dict.crianca}
              description={dict.criancaDesc}
              entrar={dict.entrar}
              priority={!showAdulto}
            />
          )}
        </div>


        <div className="mt-12 grid w-full max-w-4xl grid-cols-1 gap-3 text-left sm:grid-cols-3">
          <TrustPill icon={ShieldCheck} title={dict.pagTitle} copy={dict.pagCopy} />
          <TrustPill icon={Globe2} title={dict.multiTitle} copy={dict.multiCopy} />
          <TrustPill icon={Sparkles} title={dict.curTitle} copy={dict.curCopy} />
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
  entrar,
  priority = false,
}: {
  to: "/adulto" | "/infantil";
  image: string;
  eyebrow: string;
  title: string;
  description: string;
  entrar: string;
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
          {eyebrow}
        </span>
      </div>

      <div className="relative flex items-end justify-between gap-4 px-5 py-5 md:px-6 md:py-6">
        <div className="min-w-0 text-left">
          <div className="font-display text-2xl font-black uppercase tracking-tight text-cream md:text-3xl">
            {title}
          </div>
          <p className="mt-1 text-xs text-foreground/70 md:text-sm">
            {description}
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-gold px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-forest-deep shadow-md transition group-hover:brightness-110 md:text-sm">
          {entrar} <ArrowRight className="h-4 w-4" />
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
          {title}
        </div>
        <div className="truncate text-[11px] text-foreground/70">
          {copy}
        </div>
      </div>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ArrowRight, Sparkles, LogIn, UserRound } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getSiteConfig } from "@/lib/admin-layout.functions";
import { Logo } from "@/components/home/logo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { PublicFooter } from "@/components/PublicFooter";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import { useRouter } from "@tanstack/react-router";
import infantilLogo from "@/assets/infantil-logo-new.jpg.asset.json";
import adultoLogo from "@/assets/adulto-logo.png.asset.json";
import videoAdultoPt from "@/assets/video-adulto-pt.mp4.asset.json";
import videoAdultoEn from "@/assets/video-adulto-en.mp4.asset.json";
import videoAdultoEs from "@/assets/video-adulto-es.mp4.asset.json";
import videoInfantilPt from "@/assets/video-infantil-pt.mp4.asset.json";
import videoInfantilEn from "@/assets/video-infantil-en.mp4.asset.json";
import videoInfantilEs from "@/assets/video-infantil-es.mp4.asset.json";
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

const VIDEO_I18N: Record<
  string,
  { title: string; lead: string; adulto: string; infantil: string }
> = {
  pt: {
    title: "Conheça o AWÃ TECH",
    lead: "Dois aplicativos, uma raiz. Assista à apresentação de cada experiência.",
    adulto: "Apresentação — Adulto",
    infantil: "Apresentação — Infantil",
  },
  en: {
    title: "Meet AWÃ TECH",
    lead: "Two apps, one root. Watch the presentation of each experience.",
    adulto: "Presentation — Adults",
    infantil: "Presentation — Kids",
  },
  es: {
    title: "Conoce AWÃ TECH",
    lead: "Dos aplicaciones, una raíz. Mira la presentación de cada experiencia.",
    adulto: "Presentación — Adultos",
    infantil: "Presentación — Niños",
  },
  pat: {
    title: "Awê! AWÃ TECH",
    lead: "Mokoi aplicativo, petá raiz. Nih hã apresentação.",
    adulto: "Apresentação — Adulto",
    infantil: "Apresentação — Kutkuxú",
  },
};

function useLangKey(): string {
  const { i18n } = useTranslation();
  const raw = (i18n.language || "pt").toLowerCase();
  return raw.startsWith("pat") ? "pat" : raw.slice(0, 2);
}

const VIDEO_BY_LANG: Record<string, { adulto: string; infantil: string }> = {
  pt: { adulto: videoAdultoPt.url, infantil: videoInfantilPt.url },
  en: { adulto: videoAdultoEn.url, infantil: videoInfantilEn.url },
  es: { adulto: videoAdultoEs.url, infantil: videoInfantilEs.url },
  pat: { adulto: videoAdultoPt.url, infantil: videoInfantilPt.url },
};

function useVideoSources() {
  const key = useLangKey();
  return VIDEO_BY_LANG[key] ?? VIDEO_BY_LANG.pt;
}

function useMenuDict(): Dict {
  const key = useLangKey();
  return MENU_I18N[key] ?? MENU_I18N.pt;
}

function useVideoDict() {
  const key = useLangKey();
  return VIDEO_I18N[key] ?? VIDEO_I18N.pt;
}

function PresentationVideo({
  src,
  label,
  poster,
}: {
  src: string;
  label: string;
  poster?: string;
}) {
  return (
    <figure className="overflow-hidden rounded-2xl border border-white/15 bg-black/40 shadow-2xl backdrop-blur-sm">
      <video
        className="aspect-video w-full"
        src={src}
        poster={poster}
        controls
        playsInline
        preload="none"
      />
      <figcaption className="px-4 py-3 text-sm font-medium text-white/80">
        {label}
      </figcaption>
    </figure>
  );
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
  const vdict = useVideoDict();
  const videoSrc = useVideoSources();
  const { user, loading } = useAuth();
  const { hasInfantil, hasAdulto, loading: subLoading } = useSubscription();
  const getFn = useServerFn(getSiteConfig);
  const router = useRouter();

  useEffect(() => {
    const handler = () => router.invalidate();
    window.addEventListener("awa:content-updated", handler);
    return () => window.removeEventListener("awa:content-updated", handler);
  }, [router]);

  const { data: landingHero } = useQuery({
    queryKey: ["site_config", "landing_hero"],
    queryFn: () => getFn({ data: "landing_hero" }),
  });

  const { data: branding } = useQuery({
    queryKey: ["site_config", "branding"],
    queryFn: () => getFn({ data: "branding" }),
  });

  // Fallbacks from static dict/assets
  const h1a = landingHero?.h1a || dict.h1a;
  const h1b = landingHero?.h1b || dict.h1b;
  const lead = landingHero?.lead || dict.lead;
  const entrarLabel = landingHero?.entrar_label || dict.entrar;
  const bgUrl = landingHero?.bg_url || landingBg.url;

  const adultLogoUrl = branding?.adulto_logo_url || adultoLogo.url;
  const childLogoUrl = branding?.infantil_logo_url || infantilLogo.url;
  const adultVideoUrl = branding?.adulto_video_url || videoSrc.adulto;
  const childVideoUrl = branding?.infantil_menu_video_url || videoSrc.infantil;


  const pending = !!user && subLoading;
  const hasAny = hasInfantil || hasAdulto;
  const showAdulto = !hasAny || hasAdulto;
  const showInfantil = !hasAny || hasInfantil;
  const onlyOne = showAdulto !== showInfantil;

  return (
    <div
      className="min-h-screen text-foreground flex flex-col bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(8,16,12,0.72) 0%, rgba(8,16,12,0.55) 40%, rgba(8,16,12,0.88) 100%), url(${bgUrl})`,
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
                {entrarLabel}
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
          {h1a}{" "}
          <span className="text-gradient-gold">{h1b}</span>
        </h1>
        <p className="mt-4 max-w-2xl text-sm text-foreground/80 md:text-base">
          {lead}
        </p>

        <div
          className={`mt-12 grid w-full gap-6 md:gap-8 ${onlyOne ? "max-w-md" : "md:grid-cols-2"}`}
        >
          {!pending && showAdulto && (
            <ExperienceCard
              to="/adulto"
              image={adultLogoUrl}
              eyebrow="Awã Tech"
              title={dict.adulto}
              description={dict.adultoDesc}
              entrar={entrarLabel}
              priority
            />
          )}
          {!pending && showInfantil && (
            <ExperienceCard
              to="/infantil"
              image={childLogoUrl}
              eyebrow="Awã Tech"
              title={dict.crianca}
              description={dict.criancaDesc}
              entrar={entrarLabel}
              priority={!showAdulto}
            />
          )}
        </div>

        <section className="mt-16 w-full">
          <h2 className="font-display text-2xl font-black text-cream md:text-3xl">
            {vdict.title}
          </h2>
          <p className="mt-2 text-sm text-foreground/75">{vdict.lead}</p>
          <div
            className={`mt-6 grid w-full gap-6 ${onlyOne ? "max-w-2xl" : "md:grid-cols-2"}`}
          >
            {!pending && showAdulto && (
              <PresentationVideo
                key={adultVideoUrl}
                src={adultVideoUrl}
                poster={adultLogoUrl}
                label={vdict.adulto}
              />
            )}
            {!pending && showInfantil && (
              <PresentationVideo
                key={childVideoUrl}
                src={childVideoUrl}
                poster={childLogoUrl}
                label={vdict.infantil}
              />
            )}

          </div>
        </section>

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


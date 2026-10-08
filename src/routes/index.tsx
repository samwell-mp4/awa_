import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  Sparkles,
  LogIn,
  UserRound,
  BookOpen,
  Award,
  GraduationCap,
  Gamepad2,
  Music,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  Play,
  Volume2,
  Users,
  Globe,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getSiteConfig } from "@/lib/admin-layout.functions";
import { Logo } from "@/components/home/logo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SiteFooter } from "@/components/home/site-footer";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";

import infantilLogoJson from "@/assets/infantil-logo-new.jpg.asset.json";
import adultoLogoJson from "@/assets/adulto-logo.png.asset.json";
import videoAdultoPt from "@/assets/video-adulto-pt.mp4.asset.json";
import videoAdultoEn from "@/assets/video-adulto-en.mp4.asset.json";
import videoAdultoEs from "@/assets/video-adulto-es.mp4.asset.json";
import videoInfantilPt from "@/assets/video-infantil-kids-pt.mp4.asset.json";
import videoInfantilEn from "@/assets/video-infantil-kids-en.mp4.asset.json";
import videoInfantilEs from "@/assets/video-infantil-kids-es.mp4.asset.json";
import infantilMenuVideo from "@/assets/infantil-menu-video.mp4.asset.json";

// Static local fallbacks that never 404
const FALLBACK_ADULTO_LOGO = "/adulto-logo.png";
const FALLBACK_INFANTIL_LOGO = "/infantil-logo-new.jpg";

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
};

const MENU_I18N: Record<string, Dict> = {
  pt: {
    badge: "Plataforma Oficial · Preservação & Tecnologia",
    h1a: "Línguas indígenas,",
    h1b: "culturas vivas.",
    lead: "Aprenda, ensine e vivencie a riqueza dos povos originários do Brasil. Trilhas estruturadas, dicionário fonético com áudio de falantes nativos, espaço pedagógico para professores e ambiente lúdico e seguro para crianças.",
    adulto: "Modo Adulto & Geral",
    crianca: "Aldeia Infantil (Kids)",
    adultoDesc: "Trilhas de vocabulário, dicionário com áudio, tradutor e Espaço do Professor para escolas.",
    criancaDesc: "Ambiente lúdico e seguro com jogos educativos, músicas e histórias narradas por anciãos.",
    entrar: "Entrar",
  },
  en: {
    badge: "Official Platform · Preservation & Technology",
    h1a: "Indigenous languages,",
    h1b: "living cultures.",
    lead: "Learn, teach, and experience the richness of Brazil's indigenous peoples. Structured learning paths, phonetic dictionary with native audio, teacher resources, and a playful safe environment for kids.",
    adulto: "Adult & General Mode",
    crianca: "Kids Village",
    adultoDesc: "Vocabulary tracks, dictionary with audio, translator and Teacher's Space for schools.",
    criancaDesc: "Playful, safe environment with learning games, traditional songs and elder storytelling.",
    entrar: "Sign In",
  },
  es: {
    badge: "Plataforma Oficial · Preservación y Tecnología",
    h1a: "Lenguas indígenas,",
    h1b: "culturas vivas.",
    lead: "Aprende, enseña y vive la riqueza de los pueblos originarios de Brasil. Rutas estructuradas, diccionario fonético con audio de hablantes nativos, espacio pedagógico para profesores y ambiente lúdico para niños.",
    adulto: "Modo Adulto y General",
    crianca: "Aldea Infantil (Niños)",
    adultoDesc: "Rutas de vocabulario, diccionario con audio, traductor y Espacio del Profesor.",
    criancaDesc: "Entorno seguro y lúdico con juegos educativos, canciones e historias contadas por ancianos.",
    entrar: "Entrar",
  },
  pat: {
    badge: "Plataforma Oficial AWÃ TECH",
    h1a: "Patxôhã txopai,",
    h1b: "hãpõhã hitá.",
    lead: "Awê kuruk apkã txopai. Trilhas, dicionário, histórias e jogos — com respeito, tecnologia e cultura viva.",
    adulto: "Adulto",
    crianca: "Kotxohã (Kutkuxú)",
    adultoDesc: "Trilhas, tradutor, dicionário e Espaço do Professor.",
    criancaDesc: "Jogos, músicas e histórias para aprender brincando com segurança.",
    entrar: "Awê",
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

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AWÃ TECH — Línguas Indígenas, Culturas Vivas e Tecnologia Educacional" },
      {
        name: "description",
        content:
          "Plataforma educativa oficial AWÃ TECH: aprenda a língua Patxôhã e culturas indígenas brasileiras com dicionário com pronúncia nativa, trilhas guiadas, espaço do professor (Lei 11.645/08), histórias e jogos para crianças e adultos.",
      },
      {
        name: "keywords",
        content:
          "AWÃ TECH, línguas indígenas, patxôhã, pataxó, dicionário indígena, lei 11645, cultura indígena, educação indígena, escola indígena, aldeia velha porto seguro, jogos educativos indígenas",
      },
      { property: "og:title", content: "AWÃ TECH — Línguas Indígenas, Culturas Vivas e Tecnologia" },
      {
        property: "og:description",
        content:
          "Aprenda línguas indígenas com pronúncia nativa gravada na Aldeia Velha, trilhas temáticas, material pedagógico e ambiente seguro para todas as idades.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://www.awa-tech.store" },
      { property: "og:image", content: "https://www.awa-tech.store/og-awa-tech.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "AWÃ TECH — Línguas Indígenas e Culturas Vivas" },
      {
        name: "twitter:description",
        content:
          "Preservação e ensino de línguas originárias brasileiras com tecnologia acessível e curadoria cultural.",
      },
      { name: "twitter:image", content: "https://www.awa-tech.store/og-awa-tech.png" },
    ],
    links: [{ rel: "canonical", href: "https://www.awa-tech.store" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "EducationalOrganization",
              name: "AWÃ TECH",
              url: "https://www.awa-tech.store",
              logo: "https://www.awa-tech.store/awa-tech-logo.png",
              description:
                "Plataforma de ensino e preservação de línguas indígenas brasileiras desenvolvida em parceria com educadores e anciãos da Aldeia Velha.",
              knowsAbout: ["Língua Patxôhã", "Cultura Pataxó", "Educação Indígena", "Lei 11.645/08"],
            },
            {
              "@type": "SoftwareApplication",
              name: "AWÃ TECH Plataforma Educacional",
              operatingSystem: "All (Web, Android, iOS)",
              applicationCategory: "EducationalApplication",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "BRL",
              },
            },
            {
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "O que é o AWÃ TECH?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "O AWÃ TECH é a plataforma oficial dedicada ao ensino, valorização e preservação de línguas originárias brasileiras, a começar pelo Patxôhã do povo Pataxó.",
                  },
                },
                {
                  "@type": "Question",
                  name: "A plataforma atende à Lei 11.645/2008 nas escolas?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Sim! O Espaço do Professor oferece planos de aula, recursos audiovisuais e atividades em conformidade com a BNCC e com a Lei 11.645/08.",
                  },
                },
                {
                  "@type": "Question",
                  name: "O ambiente infantil é seguro para crianças?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "A Aldeia Infantil foi desenvolvida especialmente para crianças, sem anúncios, sem rastreamento abusivo e com conteúdo lúdico e seguro.",
                  },
                },
              ],
            },
          ],
        }),
      },
    ],
  }),
  component: CleanLandingPage,
});

function CleanLandingPage() {
  const langKey = useLangKey();
  const dict = MENU_I18N[langKey] ?? MENU_I18N.pt;
  const videoSrc = VIDEO_BY_LANG[langKey] ?? VIDEO_BY_LANG.pt;
  const { user, loading } = useAuth();
  const { hasInfantil, hasAdulto, loading: subLoading } = useSubscription();
  const getFn = useServerFn(getSiteConfig);
  const router = useRouter();
  const qc = useQueryClient();

  const [activeVideoTab, setActiveVideoTab] = useState<"adulto" | "infantil">("adulto");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    qc.prefetchQuery({
      queryKey: ["site_config", "branding"],
      queryFn: () => getFn({ data: "branding" }),
      staleTime: 1000 * 60 * 5,
    });
  }, [qc, getFn]);

  useEffect(() => {
    const handler = () => router.invalidate();
    window.addEventListener("awa:content-updated", handler);
    return () => window.removeEventListener("awa:content-updated", handler);
  }, [router]);

  const { data: branding } = useQuery({
    queryKey: ["site_config", "branding"],
    queryFn: () => getFn({ data: "branding" }),
  });

  const adultLogoUrl = branding?.adulto_logo_url || FALLBACK_ADULTO_LOGO || adultoLogoJson.url;
  const childLogoUrl = branding?.infantil_logo_url || FALLBACK_INFANTIL_LOGO || infantilLogoJson.url;
  const adultVideoUrl = branding?.adulto_video_url || videoSrc.adulto;
  const childVideoUrl = videoSrc.infantil || branding?.infantil_menu_video_url || infantilMenuVideo.url;

  const pending = !!user && subLoading;
  const hasAny = hasInfantil || hasAdulto;
  const showAdulto = !hasAny || hasAdulto;
  const showInfantil = !hasAny || hasInfantil;

  const toggleFaq = (idx: number) => {
    setOpenFaq((curr) => (curr === idx ? null : idx));
  };

  return (
    <div className="min-h-screen bg-[#fcfbf7] text-[#1f2937] antialiased selection:bg-[#2d6a4f] selection:text-white flex flex-col">
      {/* Top Notification / Trust Bar */}
      <div className="bg-[#11231b] text-[#f7f6f2] px-4 py-2 text-center text-xs font-medium tracking-wide">
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-[#52b788] animate-pulse" />
          <span>Curadoria cultural viva diretamente da <strong>Aldeia Velha — Porto Seguro, Bahia</strong></span>
        </div>
      </div>

      {/* Clean Light Header */}
      <header className="sticky top-0 z-50 border-b border-[#e8e4dc] bg-[#fcfbf7]/90 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6 md:px-8">
          <Link to="/" className="transition hover:opacity-95">
            <Logo mode="adulto" />
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-semibold text-[#374151] lg:flex">
            <Link to="/adulto" className="transition hover:text-[#1b4332]">
              Início Adulto
            </Link>
            <Link to="/trilhas" className="transition hover:text-[#1b4332]">
              Trilhas
            </Link>
            <Link to="/dicionario" className="transition hover:text-[#1b4332]">
              Dicionário
            </Link>
            <Link to="/professor" className="transition hover:text-[#1b4332]">
              Espaço do Professor
            </Link>
            <Link to="/infantil" className="text-[#b47e28] transition hover:text-[#8c5e18]">
              Aldeia Infantil
            </Link>
            <Link to="/planos" className="transition hover:text-[#1b4332]">
              Planos
            </Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher />

            {!loading && (
              user ? (
                <Link
                  to="/minha-conta"
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#d1c7b7] bg-white px-3.5 py-1.5 text-xs font-bold text-[#1b4332] shadow-xs transition hover:bg-[#f4f2ec] sm:px-4 sm:py-2"
                >
                  <UserRound className="h-4 w-4 text-[#2d6a4f]" />
                  <span className="hidden sm:inline">Minha Conta</span>
                </Link>
              ) : (
                <Link
                  to="/auth"
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#1b4332] px-4 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#2d6a4f] sm:px-5 sm:py-2"
                >
                  <LogIn className="h-4 w-4" />
                  <span>{dict.entrar}</span>
                </Link>
              )
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-[#e8e4dc] bg-gradient-to-b from-[#f7f4ec] via-[#fcfbf7] to-white pt-12 pb-16 md:pt-20 md:pb-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#d1c7b7] bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#1b4332] shadow-xs">
                <Sparkles className="h-3.5 w-3.5 text-[#b47e28]" />
                {dict.badge}
              </div>

              <h1 className="mt-6 font-display text-4xl font-black tracking-tight text-[#11231b] sm:text-5xl md:text-6xl md:leading-[1.1]">
                {dict.h1a}{" "}
                <span className="bg-gradient-to-r from-[#1b4332] via-[#2d6a4f] to-[#b47e28] bg-clip-text text-transparent">
                  {dict.h1b}
                </span>
              </h1>

              <p className="mt-5 text-base leading-relaxed text-[#4b5563] sm:text-lg">
                {dict.lead}
              </p>

              {/* Fast Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                <Link
                  to="/adulto"
                  className="inline-flex items-center gap-2 rounded-full bg-[#1b4332] px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#2d6a4f] hover:shadow-lg"
                >
                  <span>Explorar Modo Adulto</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/infantil"
                  className="inline-flex items-center gap-2 rounded-full border-2 border-[#b47e28] bg-[#fbf5e8] px-6 py-3.5 text-sm font-bold text-[#8c5e18] shadow-xs transition hover:-translate-y-0.5 hover:bg-[#f6ebd1]"
                >
                  <span>Aldeia Infantil (Kids)</span>
                  <Sparkles className="h-4 w-4 text-[#b47e28]" />
                </Link>
                <Link
                  to="/dicionario"
                  className="inline-flex items-center gap-2 rounded-full border border-[#d1c7b7] bg-white px-5 py-3.5 text-sm font-bold text-[#374151] shadow-xs transition hover:bg-[#f4f2ec]"
                >
                  <BookOpen className="h-4 w-4 text-[#2d6a4f]" />
                  <span>Dicionário Aberto</span>
                </Link>
              </div>

              {/* Trust Indicators / Numbers */}
              <div className="mt-12 grid grid-cols-2 gap-4 rounded-2xl border border-[#e8e4dc] bg-white p-4 shadow-xs sm:grid-cols-4 sm:p-6">
                <div className="text-center">
                  <div className="font-display text-2xl font-black text-[#1b4332] sm:text-3xl">500+</div>
                  <div className="mt-1 text-xs font-semibold text-[#6b7280]">Palavras com Áudio</div>
                </div>
                <div className="text-center">
                  <div className="font-display text-2xl font-black text-[#1b4332] sm:text-3xl">5</div>
                  <div className="mt-1 text-xs font-semibold text-[#6b7280]">Trilhas Temáticas</div>
                </div>
                <div className="text-center">
                  <div className="font-display text-2xl font-black text-[#b47e28] sm:text-3xl">100%</div>
                  <div className="mt-1 text-xs font-semibold text-[#6b7280]">Curadoria Indígena</div>
                </div>
                <div className="text-center">
                  <div className="font-display text-2xl font-black text-[#1b4332] sm:text-3xl">BNCC</div>
                  <div className="mt-1 text-xs font-semibold text-[#6b7280]">Lei 11.645/08</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dual Portal Showcase: Adulto vs Infantil */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:px-8 md:py-20">
          <div className="mb-10 text-center">
            <div className="tribal-border mx-auto w-16 mb-2" />
            <h2 className="font-display text-3xl font-black text-[#11231b] sm:text-4xl">
              Escolha sua Experiência
            </h2>
            <p className="mt-2 text-sm text-[#4b5563] sm:text-base">
              Duas plataformas completas adaptadas para diferentes públicos e objetivos pedagógicos.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Adult Card */}
            {!pending && showAdulto && (
              <div className="group relative flex flex-col overflow-hidden rounded-3xl border border-[#e8e4dc] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#2d6a4f] hover:shadow-xl sm:p-8">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f5e9] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#1b4332]">
                    Ensino & Cultura
                  </span>
                  <span className="text-xs font-semibold text-[#6b7280]">Jovens, Adultos e Educadores</span>
                </div>

                <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                  <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl border border-[#e8e4dc] bg-[#f7f6f2] shadow-xs">
                    <img
                      src={adultLogoUrl}
                      alt="Awã Tech Adulto"
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src = "/awa-tech-logo.png";
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="font-display text-2xl font-black text-[#11231b]">
                      {dict.adulto}
                    </h3>
                    <p className="mt-1 text-sm text-[#4b5563]">
                      {dict.adultoDesc}
                    </p>
                  </div>
                </div>

                <ul className="mt-6 space-y-2.5 border-t border-[#f0ece1] pt-6 text-sm text-[#374151]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#2d6a4f]" />
                    <span>Trilhas temáticas: Saudações, Família, Natureza, Animais e Números</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#2d6a4f]" />
                    <span>Dicionário com transcrição fonética e áudios nativos</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#2d6a4f]" />
                    <span>Espaço do Professor com planos de aula e diretrizes BNCC</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#2d6a4f]" />
                    <span>Documentários audiovisuais e narrativas da Aldeia Velha</span>
                  </li>
                </ul>

                <div className="mt-8 pt-4">
                  <Link
                    to="/adulto"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1b4332] py-3 text-sm font-bold text-white shadow-xs transition hover:bg-[#2d6a4f]"
                  >
                    <span>Acessar Modo Adulto</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )}

            {/* Kids Card */}
            {!pending && showInfantil && (
              <div className="group relative flex flex-col overflow-hidden rounded-3xl border border-[#eedfba] bg-gradient-to-b from-white to-[#fbf8f0] p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#b47e28] hover:shadow-xl sm:p-8">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fdf3dc] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#8c5e18]">
                    Lúdico & Protegido
                  </span>
                  <span className="text-xs font-semibold text-[#8c5e18]">Crianças e Famílias</span>
                </div>

                <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                  <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl border border-[#eedfba] bg-[#fbf5e8] shadow-xs">
                    <img
                      src={childLogoUrl}
                      alt="Awã Tech Infantil"
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src = "/awa-tech-logo.png";
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="font-display text-2xl font-black text-[#11231b]">
                      {dict.crianca}
                    </h3>
                    <p className="mt-1 text-sm text-[#4b5563]">
                      {dict.criancaDesc}
                    </p>
                  </div>
                </div>

                <ul className="mt-6 space-y-2.5 border-t border-[#eedfba] pt-6 text-sm text-[#374151]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#b47e28]" />
                    <span>Jogos interativos e desafios de memória com vocabulário</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#b47e28]" />
                    <span>Músicas e cânticos com animações e letras sincronizadas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#b47e28]" />
                    <span>Contação de histórias ancestrais narradas por anciãos</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#b47e28]" />
                    <span>Ambiente 100% seguro: sem anúncios e sem compras acidentais</span>
                  </li>
                </ul>

                <div className="mt-8 pt-4">
                  <Link
                    to="/infantil"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#b47e28] py-3 text-sm font-bold text-white shadow-xs transition hover:bg-[#8c5e18]"
                  >
                    <span>Entrar na Aldeia Infantil</span>
                    <Sparkles className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Core Features Grid (SEO Rich) */}
        <section className="border-y border-[#e8e4dc] bg-[#f7f6f2] py-16 md:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <div className="tribal-border mx-auto w-16 mb-2" />
              <h2 className="font-display text-3xl font-black text-[#11231b] sm:text-4xl">
                Funcionalidades da Plataforma
              </h2>
              <p className="mt-2 text-sm text-[#4b5563] sm:text-base">
                Recursos pedagógicos desenvolvidos com rigor acadêmico e respeito profundo à tradição oral.
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="rounded-2xl border border-[#e8e4dc] bg-white p-6 shadow-xs transition hover:-translate-y-1 hover:shadow-md">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#e8f5e9] text-[#1b4332]">
                  <Volume2 className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-[#11231b]">
                  Dicionário Fonético com Áudio
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#4b5563]">
                  Consulte centenas de verbetes em Patxôhã e Português com áudios gravados por falantes nativos, explicações etimológicas e exemplos de uso contextual.
                </p>
                <Link to="/dicionario" className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#1b4332] hover:text-[#2d6a4f]">
                  Consultar vocabulário <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Feature 2 */}
              <div className="rounded-2xl border border-[#e8e4dc] bg-white p-6 shadow-xs transition hover:-translate-y-1 hover:shadow-md">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#fdf3dc] text-[#b47e28]">
                  <Award className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-[#11231b]">
                  Trilhas Gamificadas
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#4b5563]">
                  Aprenda no seu ritmo com módulos progressivos: Saudações, Família, Natureza, Animais e Numeração tradicional com barras de evolução e desafios.
                </p>
                <Link to="/trilhas" className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#1b4332] hover:text-[#2d6a4f]">
                  Ver trilhas de estudo <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Feature 3 */}
              <div className="rounded-2xl border border-[#e8e4dc] bg-white p-6 shadow-xs transition hover:-translate-y-1 hover:shadow-md">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#e0f2fe] text-[#0369a1]">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-[#11231b]">
                  Espaço do Professor (Lei 11.645/08)
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#4b5563]">
                  Planos de aula completos, matrizes curriculares e materiais de apoio para que educadores cumpram a legislação de ensino de história e cultura indígena com responsabilidade.
                </p>
                <Link to="/professor" className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#1b4332] hover:text-[#2d6a4f]">
                  Acessar material didático <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Feature 4 */}
              <div className="rounded-2xl border border-[#e8e4dc] bg-white p-6 shadow-xs transition hover:-translate-y-1 hover:shadow-md">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#fce7f3] text-[#be185d]">
                  <Gamepad2 className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-[#11231b]">
                  Jogos e Quizzes Interativos
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#4b5563]">
                  Quiz da palavra do dia, associação de imagens, palavras-cruzadas e missões diárias com pontuação que engajam crianças e adultos no aprendizado contínuo.
                </p>
                <Link to="/jogos" className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#1b4332] hover:text-[#2d6a4f]">
                  Jogar e praticar <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Feature 5 */}
              <div className="rounded-2xl border border-[#e8e4dc] bg-white p-6 shadow-xs transition hover:-translate-y-1 hover:shadow-md">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#f3e8ff] text-[#7e22ce]">
                  <Music className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-[#11231b]">
                  Cânticos, Músicas & Tradição Oral
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#4b5563]">
                  Cânticos tradicionais do Awê com letras sincronizadas em Patxôhã e tradução linha a linha, aproximando você da musicalidade e espiritualidade indígena.
                </p>
                <Link to="/musicas" className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#1b4332] hover:text-[#2d6a4f]">
                  Ouvir os cânticos <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Feature 6 */}
              <div className="rounded-2xl border border-[#e8e4dc] bg-white p-6 shadow-xs transition hover:-translate-y-1 hover:shadow-md">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#e8f5e9] text-[#1b4332]">
                  <Smartphone className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-[#11231b]">
                  PWA Multiplataforma
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#4b5563]">
                  Instale facilmente no celular Android, iPhone, tablet ou computador. O app é leve, rápido e pronto para ser usado diretamente como um aplicativo nativo.
                </p>
                <Link to="/instalar" className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#1b4332] hover:text-[#2d6a4f]">
                  Instalar aplicativo <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Video Presentation Section with Clean Tabs */}
        <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 md:px-8 md:py-20">
          <div className="text-center">
            <div className="tribal-border mx-auto w-16 mb-2" />
            <h2 className="font-display text-3xl font-black text-[#11231b]">
              Conheça o AWÃ TECH em Vídeo
            </h2>
            <p className="mt-2 text-sm text-[#4b5563]">
              Assista à apresentação detalhada de cada uma das experiências da plataforma.
            </p>

            {/* Video switcher tabs */}
            <div className="mt-6 inline-flex rounded-full border border-[#d1c7b7] bg-white p-1 shadow-xs">
              <button
                type="button"
                onClick={() => setActiveVideoTab("adulto")}
                className={`rounded-full px-5 py-2 text-xs font-bold transition ${
                  activeVideoTab === "adulto"
                    ? "bg-[#1b4332] text-white shadow-xs"
                    : "text-[#4b5563] hover:text-[#11231b]"
                }`}
              >
                Apresentação — Adulto & Geral
              </button>
              <button
                type="button"
                onClick={() => setActiveVideoTab("infantil")}
                className={`rounded-full px-5 py-2 text-xs font-bold transition ${
                  activeVideoTab === "infantil"
                    ? "bg-[#b47e28] text-white shadow-xs"
                    : "text-[#4b5563] hover:text-[#11231b]"
                }`}
              >
                Apresentação — Aldeia Infantil
              </button>
            </div>
          </div>

          <div className="mt-8 overflow-hidden rounded-3xl border border-[#e8e4dc] bg-white p-2 shadow-lg">
            <div className="relative aspect-video overflow-hidden rounded-2xl bg-black">
              {activeVideoTab === "adulto" ? (
                <video
                  key="adulto-video"
                  className="h-full w-full object-cover"
                  src={adultVideoUrl}
                  poster={adultLogoUrl}
                  controls
                  playsInline
                  preload="metadata"
                />
              ) : (
                <video
                  key="infantil-video"
                  className="h-full w-full object-cover"
                  src={childVideoUrl}
                  poster={childLogoUrl}
                  controls
                  playsInline
                  preload="metadata"
                />
              )}
            </div>
          </div>
        </section>

        {/* Cultural Heritage & Elders Section */}
        <section className="border-t border-[#e8e4dc] bg-white py-16 md:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <div className="tribal-border w-16 mb-2" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#b47e28]">
                  Aldeia Velha · Porto Seguro, Bahia
                </span>
                <h2 className="mt-2 font-display text-3xl font-black text-[#11231b] sm:text-4xl">
                  Uma raiz que floresce em tecnologia
                </h2>
                <p className="mt-4 text-base leading-relaxed text-[#4b5563]">
                  O AWÃ TECH não é apenas um software de idiomas: é um movimento de resistência e salvaguarda do patrimônio imaterial. Criado com a bênção, voz e participação ativa dos anciãos, professores e jovens da <strong>Aldeia Velha</strong>.
                </p>
                <div className="mt-6 space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-[#2d6a4f] mt-0.5" />
                    <p className="text-sm text-[#374151]">
                      <strong>Autonomia Indígena:</strong> Toda a pronúncia e contextualização cultural é orientada pelos próprios guardiões da língua.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-[#2d6a4f] mt-0.5" />
                    <p className="text-sm text-[#374151]">
                      <strong>Remuneração Justa:</strong> A plataforma apoia iniciativas comunitárias e projetos de transmissão cultural na aldeia.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-[#2d6a4f] mt-0.5" />
                    <p className="text-sm text-[#374151]">
                      <strong>Documentário Exclusivo:</strong> Vídeos e depoimentos registrando a história dos mais velhos para as futuras gerações.
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex gap-4">
                  <Link
                    to="/aldeia-velha"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#1b4332] px-5 py-3 text-sm font-bold text-white shadow-xs transition hover:bg-[#2d6a4f]"
                  >
                    <span>Conhecer a Aldeia Velha</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/biografia"
                    className="inline-flex items-center gap-2 rounded-xl border border-[#d1c7b7] bg-white px-5 py-3 text-sm font-bold text-[#374151] transition hover:bg-[#f4f2ec]"
                  >
                    <span>Nossa História</span>
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="overflow-hidden rounded-2xl border border-[#e8e4dc] shadow-sm">
                  <img
                    src="/pataxo-aldeia.jpg"
                    alt="Aldeia Velha Pataxó"
                    className="h-48 w-full object-cover sm:h-64"
                    loading="lazy"
                  />
                </div>
                <div className="overflow-hidden rounded-2xl border border-[#e8e4dc] shadow-sm mt-6">
                  <img
                    src="/pataxo-anciao.jpg"
                    alt="Ancião Pataxó compartilhando saberes"
                    className="h-48 w-full object-cover sm:h-64"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section (Accordion for SEO & Conversion) */}
        <section className="border-t border-[#e8e4dc] bg-[#f7f6f2] py-16 md:py-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 md:px-8">
            <div className="text-center">
              <div className="tribal-border mx-auto w-16 mb-2" />
              <h2 className="font-display text-3xl font-black text-[#11231b]">
                Perguntas Frequentes
              </h2>
              <p className="mt-2 text-sm text-[#4b5563]">
                Tudo o que você precisa saber sobre o AWÃ TECH, assinaturas e uso pedagógico.
              </p>
            </div>

            <div className="mt-10 space-y-3">
              {[
                {
                  q: "Quem pode utilizar a plataforma AWÃ TECH?",
                  a: "Qualquer pessoa interessada em aprender línguas originárias brasileiras! O Modo Adulto é perfeito para estudantes, pesquisadores e amantes da cultura, enquanto a Aldeia Infantil oferece um ambiente lúdico sob medida para crianças.",
                },
                {
                  q: "Como as escolas e professores utilizam o AWÃ TECH?",
                  a: "A plataforma possui o 'Espaço do Professor', contendo planos de aula, sequências didáticas e diretrizes pedagógicas para atender com facilidade e profundidade à Lei Federal 11.645/08 nas redes pública e privada.",
                },
                {
                  q: "Qual língua indígena é ensinada?",
                  a: "O foco inicial e mais profundo da plataforma é o Patxôhã, a língua revivida do povo Pataxó do sul da Bahia. Todas as pronúncias foram gravadas por falantes da Aldeia Velha.",
                },
                {
                  q: "A plataforma oferece conteúdo gratuito?",
                  a: "Sim! O Dicionário de termos básicos, as primeiras lições de cada trilha temática e diversos recursos estão disponíveis gratuitamente. Para acesso ilimitado a todas as trilhas, áudios avançados e jogos completos, oferecemos planos acessíveis.",
                },
                {
                  q: "Como funcionam os pagamentos e a segurança?",
                  a: "Os pagamentos são processados com segurança internacional pelo Paddle (Merchant of Record), garantindo proteção total aos seus dados, cancelamento fácil a qualquer momento e garantia incondicional de reembolso em até 7 dias.",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-[#e8e4dc] bg-white overflow-hidden shadow-xs"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="flex w-full items-center justify-between p-5 text-left font-bold text-[#11231b] transition hover:bg-[#faf9f5]"
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-[#6b7280] transition-transform duration-200 ${
                        openFaq === idx ? "rotate-180 text-[#1b4332]" : ""
                      }`}
                    />
                  </button>
                  {openFaq === idx && (
                    <div className="px-5 pb-5 pt-1 text-sm leading-relaxed text-[#4b5563] border-t border-[#f0ece1]">
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Banner */}
        <section className="border-t border-[#e8e4dc] bg-gradient-to-r from-[#11231b] via-[#1b4332] to-[#2d6a4f] py-16 text-white text-center md:py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 md:px-8">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#d4af37]">
              Comece agora mesmo
            </span>
            <h2 className="mt-4 font-display text-3xl font-black sm:text-4xl md:text-5xl">
              Pronto para mergulhar nas culturas originárias?
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-sm text-white/80 sm:text-base">
              Acesse as trilhas gratuitas, ouça as palavras com falantes reais e leve a sabedoria indígena para sua casa ou sala de aula.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                to="/adulto"
                className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-[#11231b] shadow-md transition hover:bg-[#f4f2ec]"
              >
                <span>Acessar Modo Adulto</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/planos"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-bold text-white transition hover:bg-white/20"
              >
                <span>Conhecer os Planos</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Clean Footer */}
      <SiteFooter mode="adulto" />
    </div>
  );
}

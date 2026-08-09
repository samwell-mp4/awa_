import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { speak, stopSpeak } from "@/lib/speak";
import { PublicFooter } from "@/components/PublicFooter";
import {
  ArrowLeft,
  Download,
  Smartphone,
  Check,
  Share2,
  MoreVertical,
  Home,
  Music,
  BookOpen,
  Sparkles,
  Globe,
  Apple,
} from "lucide-react";

import logoSrc from "@/assets/awa-tech-logo.png";
import appPreviewAsset from "@/assets/app-preview.png.asset.json";
import { useLastArea } from "@/lib/last-area";

export const Route = createFileRoute("/instalar")({
  head: () => ({
    meta: [
      { title: "Baixar o App — AWÃ TECH" },
      {
        name: "description",
        content:
          "Instale o Awã Tech no Android ou iPhone e acesse dicionário, músicas, histórias e Tradutor como um app.",
      },
      { property: "og:title", content: "Baixar o App — AWÃ TECH" },
      {
        property: "og:description",
        content:
          "Adicione o Awã Tech à tela inicial do seu celular e leve as línguas indígenas com você.",
      },
    ],
  }),
  component: InstalarPage,
});

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function InstalarPage() {
  const backTo = useLastArea();
  const { t, i18n } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [platform, setPlatform] = useState<"android" | "ios" | "other">("other");
  const [showIOSSteps, setShowIOSSteps] = useState(false);
  const [showAndroidSteps, setShowAndroidSteps] = useState(false);


  useEffect(() => {
    const ua = navigator.userAgent;
    const iOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    const android = /Android/.test(ua);

    if (iOS) setPlatform("ios");
    else if (android) setPlatform("android");
    else setPlatform("other");

    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => {
    const text = t("audioExplanations.instalar");
    speak(text, i18n.language);
    return () => stopSpeak();
  }, [t, i18n.language]);

  async function handleInstall() {

    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
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

      <main className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-12">
        {/* Hero / App Store Style */}
        <section className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          {/* App Preview */}
          <div className="relative order-1 lg:order-2">
            <div className="relative mx-auto max-w-md">
              <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-leaf/20 via-gold/10 to-earth/20 blur-2xl" />
              <img
                decoding="async"
                src={appPreviewAsset.url}
                alt="Prévia do aplicativo Awã Tech em três telas: início, dicionário e música"
                className="relative mx-auto w-full max-w-sm rounded-3xl"
                width={1024}
                height={1024}
                loading="eager"
              />

            </div>
            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-card/80 px-4 py-2 text-xs font-semibold text-cream backdrop-blur-md shadow-lg sm:text-sm">
                <Download className="h-4 w-4 text-gold" />
                Instale grátis no Android e iPhone
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="order-2 text-center lg:order-1 lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-sm font-semibold text-gold">
              <Sparkles className="h-4 w-4" />
              PWA — App Web Progressivo
            </div>

            <h1 className="mt-5 font-display text-3xl font-extrabold text-cream md:text-4xl lg:text-5xl">
              Baixe o <span className="text-leaf">Awã Tech</span>
            </h1>
            <p className="mt-4 text-lg text-foreground/80 md:text-xl">
              Leve o dicionário Patxôhã, as músicas, as histórias e o Tradutor no seu celular — sem
              precisar da loja de apps.
            </p>

            {isInstalled ? (
              <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-5 py-3 text-sm font-semibold text-gold">
                <Check className="h-5 w-5" />
                O Awã Tech já está instalado neste dispositivo
              </div>
            ) : (
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
                {platform === "android" && deferredPrompt && (
                  <button
                    onClick={handleInstall}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-leaf px-6 py-3.5 text-sm font-bold text-cream shadow-[var(--shadow-glow)] transition hover:brightness-110 sm:w-auto"
                  >
                    <Download className="h-5 w-5" />
                    Instalar no Android
                  </button>
                )}

                {platform === "android" && !deferredPrompt && (
                  <button
                    onClick={() => setShowAndroidSteps((s) => !s)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-leaf px-6 py-3.5 text-sm font-bold text-cream shadow-[var(--shadow-glow)] transition hover:brightness-110 sm:w-auto"
                  >
                    <Smartphone className="h-5 w-5" />
                    Como instalar no Android
                  </button>
                )}

                {platform !== "android" && (
                  <button
                    onClick={() => setShowIOSSteps((s) => !s)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#5D4037] px-6 py-3.5 text-sm font-bold text-cream transition hover:brightness-110 sm:w-auto"
                  >
                    <Apple className="h-5 w-5" />
                    iPhone
                  </button>
                )}

                {platform === "other" && (
                  <button
                    onClick={() => setShowAndroidSteps((s) => !s)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-gold/40 bg-card/60 px-6 py-3.5 text-sm font-bold text-cream transition hover:bg-gold/10 sm:w-auto"
                  >
                    <Smartphone className="h-5 w-5" />
                    Android
                  </button>
                )}
              </div>
            )}

            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-foreground/60 lg:justify-start">
              <span className="inline-flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5" />
                Não precisa de APK
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5" />
                Instalação segura
              </span>
            </div>
          </div>
        </section>

        {/* iOS steps */}
        {showIOSSteps && !isInstalled && (
          <section className="mt-8 rounded-3xl border border-gold/15 bg-card/40 p-6 md:p-8">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-gold/15 text-gold">
                <Smartphone className="h-5 w-5" />
              </div>
              <h2 className="font-display text-xl font-bold text-cream">Instalar no iPhone</h2>
            </div>
            <div className="mt-5 grid gap-3 text-sm text-foreground/80 sm:grid-cols-2">
              <Step number={1} text="Abra o site no Safari." />
              <Step number={2} icon={Share2} text="Toque no botão Compartilhar na barra inferior." />
              <Step number={3} icon={MoreVertical} text="Role para baixo e toque em 'Adicionar à Tela de Início'." />
              <Step number={4} text="Toque em 'Adicionar' e pronto!" />
            </div>
          </section>
        )}

        {/* Android steps */}
        {showAndroidSteps && !isInstalled && (
          <section className="mt-6 rounded-3xl border border-gold/15 bg-card/40 p-6 md:p-8">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-leaf/15 text-leaf">
                <Smartphone className="h-5 w-5" />
              </div>
              <h2 className="font-display text-xl font-bold text-cream">Instalar no Android</h2>
            </div>
            <div className="mt-5 grid gap-3 text-sm text-foreground/80 sm:grid-cols-2">
              <Step number={1} text="Abra o site no Chrome." />
              <Step number={2} text="Toque no menu ⋮ no canto superior direito." />
              <Step number={3} text="Escolha 'Adicionar à tela inicial' ou 'Instalar app'." />
              <Step number={4} text="Confirme e pronto! O ícone aparece na sua tela inicial." />
            </div>
          </section>
        )}

        {/* Why install */}
        <section className="mt-12">
          <h2 className="mb-6 text-center font-display text-2xl font-bold text-cream">
            Por que instalar?
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Benefit
              icon={Home}
              title="Acesso rápido"
              text="Abra o app direto da tela inicial, sem digitar o endereço."
            />
            <Benefit
              icon={BookOpen}
              title="Dicionário Patxôhã"
              text="Pesquise palavras em qualquer lugar, mesmo offline."
            />
            <Benefit
              icon={Music}
              title="Músicas e vídeos"
              text="Ouça e assista aos conteúdos com um toque."
            />
            <Benefit
              icon={Sparkles}
              title="Tradutor"
              text="Converse com o professor virtual quando quiser."
            />
          </div>
        </section>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link
            to={backTo as "/"}
            className="inline-flex items-center justify-center rounded-full border border-gold/40 bg-card/60 px-6 py-2.5 text-sm font-bold text-cream transition hover:bg-gold/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para o início
          </Link>
        </div>
      </main>

      <PublicFooter />

    </div>
  );
}

function Step({
  text,
  icon: Icon,
}: {
  number: number;
  text: string;
  icon?: typeof Home;
}) {
  return (
    <div className="flex items-start gap-3">
      {Icon && (
        <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gold/10 text-gold">
          <Icon className="h-3.5 w-3.5" />
        </span>
      )}
      <span className="leading-relaxed">{text}</span>
    </div>
  );
}

function Benefit({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof Home;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-gold/10 bg-card/30 p-4">
      <div className="flex items-center gap-2 text-cream">
        <Icon className="h-4 w-4 text-gold" />
        <h3 className="text-sm font-bold">{title}</h3>
      </div>
      <p className="mt-1 text-xs leading-relaxed text-foreground/70">{text}</p>
    </div>
  );
}

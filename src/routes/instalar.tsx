import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { PageListenButton } from "@/components/PageListenButton";
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
          "Instale o Awã Tech no Android ou iPhone e acesse dicionário, músicas, histórias e Professor Akuã como um app.",
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
    <div className="min-h-screen overflow-x-hidden bg-[#f7f6f2] text-[#1f2937]">
      <SiteHeader mode="adulto" />
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[#e8e4dc] bg-white/90 backdrop-blur-xl shadow-xs">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 md:px-8">
          <Link to={backTo as "/"} className="flex items-center gap-2.5">
            <img
              loading="lazy"
              decoding="async"
              src={logoSrc}
              alt="AWÃ TECH"
              className="h-10 w-10 shrink-0 rounded-full bg-white p-0.5 object-contain border border-[#e8e4dc] shadow-xs"
            />
            <div className="leading-none">
              <div className="font-display text-lg font-black tracking-tight text-[#11231b]">
                AWÃ <span className="text-[#2d6a4f]">TECH</span>
              </div>
            </div>
          </Link>
          <Link
            to={backTo as "/"}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#e8e4dc] bg-white px-3.5 py-1.5 text-xs font-bold text-[#1f2937] transition hover:border-[#1b4332] hover:bg-[#f4f2ec] shadow-xs"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-12">
        <div className="mb-6 flex justify-center"><PageListenButton /></div>
        {/* Hero / App Store Style */}
        <section className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          {/* App Preview */}
          <div className="relative order-1 lg:order-2">
            <div className="relative mx-auto max-w-md">
              <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-[#2d6a4f]/15 via-[#b47e28]/10 to-transparent blur-2xl" />
              <img
                decoding="async"
                src={appPreviewAsset.url}
                alt="Prévia do aplicativo Awã Tech em três telas: início, dicionário e música"
                className="relative mx-auto w-full max-w-sm rounded-3xl shadow-xl border border-[#e8e4dc]"
                width={1024}
                height={1024}
                loading="eager"
              />
            </div>
            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#e8e4dc] bg-white px-4 py-2 text-xs font-bold text-[#11231b] shadow-xs sm:text-sm">
                <Download className="h-4 w-4 text-[#b47e28]" />
                Instale grátis no Android e iPhone
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="order-2 text-center lg:order-1 lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#b47e28]/30 bg-[#b47e28]/10 px-4 py-1.5 text-xs font-bold text-[#b47e28]">
              <Sparkles className="h-4 w-4" />
              PWA — App Web Progressivo
            </div>

            <h1 className="mt-4 font-display text-3xl font-extrabold text-[#11231b] md:text-4xl lg:text-5xl tracking-tight">
              Baixe o <span className="text-[#2d6a4f]">Awã Tech</span>
            </h1>
            <p className="mt-4 text-base text-[#4b5563] md:text-lg leading-relaxed">
              Leve o dicionário Patxôhã, as músicas, as histórias e o Professor Akuã no seu celular — sem
              precisar da loja de apps.
            </p>

            {isInstalled ? (
              <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-50 px-5 py-3 text-sm font-bold text-[#1b4332]">
                <Check className="h-5 w-5 text-emerald-600" />
                O Awã Tech já está instalado neste dispositivo
              </div>
            ) : (
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
                {platform === "android" && deferredPrompt && (
                  <button
                    onClick={handleInstall}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1b4332] px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#2d6a4f] active:scale-95 sm:w-auto"
                  >
                    <Download className="h-5 w-5" />
                    Instalar no Android
                  </button>
                )}

                {platform === "android" && !deferredPrompt && (
                  <button
                    onClick={() => setShowAndroidSteps((s) => !s)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1b4332] px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#2d6a4f] sm:w-auto"
                  >
                    <Smartphone className="h-5 w-5" />
                    Como instalar no Android
                  </button>
                )}

                {platform !== "android" && (
                  <button
                    onClick={() => setShowIOSSteps((s) => !s)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#11231b] px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#1b4332] sm:w-auto"
                  >
                    <Apple className="h-5 w-5" />
                    Instalar no iPhone
                  </button>
                )}

                {platform === "other" && (
                  <button
                    onClick={() => setShowAndroidSteps((s) => !s)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#e8e4dc] bg-white px-6 py-3.5 text-sm font-bold text-[#11231b] transition hover:bg-[#f4f2ec] shadow-xs sm:w-auto"
                  >
                    <Smartphone className="h-5 w-5 text-[#2d6a4f]" />
                    Android
                  </button>
                )}
              </div>
            )}

            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-[#6b7280] lg:justify-start">
              <span className="inline-flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-[#2d6a4f]" />
                Não precisa de APK
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                Instalação segura
              </span>
            </div>
          </div>
        </section>

        {/* iOS steps */}
        {showIOSSteps && !isInstalled && (
          <section className="mt-8 rounded-2xl border border-[#e8e4dc] bg-white p-6 shadow-sm md:p-8">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#b47e28]/10 text-[#b47e28]">
                <Smartphone className="h-5 w-5" />
              </div>
              <h2 className="font-display text-xl font-bold text-[#11231b]">Instalar no iPhone</h2>
            </div>
            <div className="mt-5 grid gap-3 text-sm text-[#374151] sm:grid-cols-2">
              <Step number={1} text="Abra o site no Safari." />
              <Step number={2} icon={Share2} text="Toque no botão Compartilhar na barra inferior." />
              <Step number={3} icon={MoreVertical} text="Role para baixo e toque em 'Adicionar à Tela de Início'." />
              <Step number={4} text="Toque em 'Adicionar' e pronto!" />
            </div>
          </section>
        )}

        {/* Android steps */}
        {showAndroidSteps && !isInstalled && (
          <section className="mt-6 rounded-2xl border border-[#e8e4dc] bg-white p-6 shadow-sm md:p-8">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#2d6a4f]/10 text-[#2d6a4f]">
                <Smartphone className="h-5 w-5" />
              </div>
              <h2 className="font-display text-xl font-bold text-[#11231b]">Instalar no Android</h2>
            </div>
            <div className="mt-5 grid gap-3 text-sm text-[#374151] sm:grid-cols-2">
              <Step number={1} text="Abra o site no Chrome." />
              <Step number={2} text="Toque no menu ⋮ no canto superior direito." />
              <Step number={3} text="Escolha 'Adicionar à tela inicial' ou 'Instalar app'." />
              <Step number={4} text="Confirme e pronto! O ícone aparece na sua tela inicial." />
            </div>
          </section>
        )}

        {/* Why install */}
        <section className="mt-12">
          <h2 className="mb-6 text-center font-display text-2xl font-bold text-[#11231b]">
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
              title="Professor Akuã"
              text="Converse com o professor virtual quando quiser."
            />
          </div>
        </section>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link
            to={backTo as "/"}
            className="inline-flex items-center justify-center rounded-full border border-[#e8e4dc] bg-white px-6 py-2.5 text-sm font-bold text-[#11231b] shadow-xs transition hover:border-[#1b4332] hover:bg-[#f4f2ec]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para o início
          </Link>
        </div>
      </main>

      <SiteFooter mode="adulto" />
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
        <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#b47e28]/10 text-[#b47e28]">
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
    <div className="rounded-2xl border border-[#e8e4dc] bg-white p-5 shadow-xs transition hover:border-[#2d6a4f] hover:shadow-md">
      <div className="flex items-center gap-2.5 text-[#11231b]">
        <div className="grid h-8 w-8 place-items-center rounded-xl bg-[#b47e28]/10 text-[#b47e28]">
          <Icon className="h-4 w-4" />
        </div>
        <h3 className="text-sm font-bold">{title}</h3>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-[#4b5563]">{text}</p>
    </div>
  );
}

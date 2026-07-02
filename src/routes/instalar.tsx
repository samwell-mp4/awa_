import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
} from "lucide-react";

import logoSrc from "@/assets/awa-tech-logo.png";

export const Route = createFileRoute("/instalar")({
  head: () => ({
    meta: [
      { title: "Instalar — AWÃ TECH" },
      {
        name: "description",
        content:
          "Instale o Awã Tech no Android ou iPhone e acesse dicionário, músicas, histórias e Professor Akuã como um app.",
      },
      { property: "og:title", content: "Instalar — AWÃ TECH" },
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
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS Safari (standalone-ish install)
    const ua = navigator.userAgent;
    const iOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    setIsIOS(iOS);

    if (window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true) {
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
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gold/20 bg-[oklch(0.14_0.03_145/0.85)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <img
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
            to="/"
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-foreground/80 transition hover:bg-leaf/15 hover:text-cream"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 md:px-8">
        {/* Hero */}
        <section className="text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-leaf/20 to-gold/20 text-gold shadow-[var(--shadow-glow)]">
            <Download className="h-10 w-10" />
          </div>
          <h1 className="mt-6 font-display text-3xl font-extrabold text-cream md:text-4xl">
            Instale o Awã Tech
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-foreground/80">
            Adicione o app à tela inicial do seu celular e acesse o dicionário, músicas, histórias e
            Professor Akuã com um toque.
          </p>
        </section>

        {/* Status */}
        {isInstalled && (
          <div className="mt-6 rounded-2xl border border-gold/30 bg-gold/10 p-4 text-center text-sm font-medium text-gold">
            <Check className="mr-2 inline h-4 w-4" />
            O Awã Tech já está instalado neste dispositivo.
          </div>
        )}

        {/* Android */}
        <section className="mt-10 rounded-3xl border border-gold/15 bg-card/40 p-6 md:p-8">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-leaf/15 text-leaf">
              <Smartphone className="h-5 w-5" />
            </div>
            <h2 className="font-display text-xl font-bold text-cream">Android</h2>
          </div>

          <div className="mt-5 space-y-3 text-sm text-foreground/80">
            <Step number={1} text="Abra o site no Chrome." />
            <Step number={2} text="Toque no menu ⋮ no canto superior direito." />
            <Step number={3} text="Escolha 'Adicionar à tela inicial' ou 'Instalar app'." />
            <Step number={4} text="Confirme e pronto! O ícone aparece na sua tela inicial." />
          </div>

          {deferredPrompt && !isInstalled && (
            <button
              onClick={handleInstall}
              className="mt-6 w-full rounded-full bg-[var(--gradient-leaf)] px-6 py-3 text-sm font-bold text-cream shadow-[var(--shadow-glow)] transition hover:brightness-110"
            >
              Instalar agora no Android
            </button>
          )}
        </section>

        {/* iPhone */}
        <section className="mt-6 rounded-3xl border border-gold/15 bg-card/40 p-6 md:p-8">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-gold/15 text-gold">
              <Smartphone className="h-5 w-5" />
            </div>
            <h2 className="font-display text-xl font-bold text-cream">iPhone</h2>
          </div>

          <div className="mt-5 space-y-3 text-sm text-foreground/80">
            <Step number={1} text="Abra o site no Safari." />
            <Step number={2} icon={Share2} text="Toque no botão Compartilhar na barra inferior." />
            <Step number={3} icon={MoreVertical} text="Role para baixo e toque em 'Adicionar à Tela de Início'." />
            <Step number={4} text="Toque em 'Adicionar' e pronto!" />
          </div>
        </section>

        {/* Why install */}
        <section className="mt-10">
          <h2 className="mb-5 text-center font-display text-xl font-bold text-cream">Por que instalar?</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Benefit icon={Home} title="Acesso rápido" text="Abra o app direto da tela inicial, sem digitar o endereço." />
            <Benefit icon={BookOpen} title="Dicionário Patxôhã" text="Pesquise palavras em qualquer lugar, mesmo offline." />
            <Benefit icon={Music} title="Músicas e vídeos" text="Ouça e assista aos conteúdos com um toque." />
            <Benefit icon={Sparkles} title="Professor Akuã" text="Converse com o professor virtual quando quiser." />
          </div>
        </section>

        {/* CTA */}
        <div className="mt-10 text-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full border border-gold/40 bg-card/60 px-6 py-2.5 text-sm font-bold text-cream transition hover:bg-gold/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para o início
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-gold/20 bg-[oklch(0.12_0.03_145/0.8)] py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-xs text-foreground/60 md:px-8">
          © {new Date().getFullYear()} AWÃ TECH — Culturas Vivas. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}

function Step({ number, text, icon: Icon }: { number: number; text: string; icon?: typeof Home }) {
  return (
    <div className="flex items-start gap-3">
      {Icon ? (
        <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gold/10 text-gold">
          <Icon className="h-3.5 w-3.5" />
        </span>
      ) : (
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gold/10 text-xs font-bold text-gold">
          {number}
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

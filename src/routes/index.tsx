import { createFileRoute, Link } from "@tanstack/react-router";
import { Baby, GraduationCap, ArrowRight } from "lucide-react";
import { Logo } from "@/components/home/logo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import bgImg from "@/assets/awa-menu-bg-v2.png.asset.json";
import infantilBg from "@/assets/awa-infantil-menu.png.asset.json";
import adultoBg from "@/assets/awa-adulto-menu-v2.jpg.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AWÃ TECH — Escolha sua experiência" },
      {
        name: "description",
        content:
          "Entre no Awã Tech Adulto ou Awã Tech Infantil — aprenda línguas indígenas com trilhas, jogos, histórias e vídeos.",
      },
      { property: "og:title", content: "AWÃ TECH — Adulto e Infantil" },
      {
        property: "og:description",
        content:
          "Duas experiências para aprender línguas indígenas brasileiras: uma para adultos e outra para crianças.",
      },
    ],
  }),
  component: LandingChoice,
});

function LandingChoice() {
  return (
    <div
      className="relative min-h-screen text-foreground flex flex-col bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bgImg.url})` }}
    >
      <div aria-hidden className="absolute inset-0 bg-forest-deep/25" />
      <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 md:px-8">
        <Logo />
        <LanguageSwitcher />
      </header>

      <main className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-4 py-10 text-center md:px-8">
        <h1 className="font-display text-3xl font-black uppercase tracking-wide text-cream md:text-5xl">
          Escolha sua experiência
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-foreground/75 md:text-base">
          O Awã Tech tem duas portas de entrada. Escolha a que combina com você.
        </p>

        <div className="mt-10 grid w-full gap-6 md:grid-cols-2">
          <ChoiceCard
            to="/adulto"
            title="Awã Tech Adulto"
            subtitle="Trilhas, tradutor, dicionário, histórias, biografia e Espaço do Professor."
            icon={<GraduationCap className="h-10 w-10" />}
            accent="from-leaf/30 to-forest-deep/50"
            backgroundUrl={adultoBg.url}
          />
          <ChoiceCard
            to="/infantil"
            title="Awã Tech Infantil"
            subtitle="Jogos, músicas, saudações e vídeos divertidos para crianças aprenderem brincando."
            icon={<Baby className="h-10 w-10" />}
            accent="from-gold/30 to-leaf/25"
            backgroundUrl={infantilBg.url}
            
          />
        </div>
      </main>
    </div>
  );
}

function ChoiceCard({
  to,
  title,
  subtitle,
  icon,
  accent,
  backgroundUrl,
  backgroundSize = "cover",
}: {
  to: "/adulto" | "/infantil";
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  accent: string;
  backgroundUrl?: string;
  backgroundSize?: "cover" | "contain";
}) {
  return (
    <Link
      to={to}
      className={`group relative flex min-h-[460px] flex-col items-start gap-4 overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-br ${accent} p-6 text-left shadow-[0_20px_60px_-30px_rgba(0,0,0,0.7)] transition hover:-translate-y-1 hover:border-gold/60 md:min-h-[520px] md:p-8`}
      style={
        backgroundUrl
          ? {
              backgroundImage: `url(${backgroundUrl})`,
              backgroundSize,
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundColor: "hsl(var(--forest-deep, 150 40% 10%))",
            }
          : undefined
      }
    >
      {backgroundUrl && (
        <div aria-hidden className="absolute inset-0 bg-forest-deep/20" />
      )}
      <div className="relative grid h-16 w-16 place-items-center rounded-2xl border border-gold/40 bg-forest-deep/40 text-gold">
        {icon}
      </div>
      <div className="relative">
        <div className="font-display text-2xl font-black uppercase tracking-wide text-cream md:text-3xl">
          {title}
        </div>
        <p className="mt-2 text-sm text-foreground/85 md:text-base">{subtitle}</p>
      </div>
      <span className="relative mt-2 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-forest-deep/50 px-4 py-2 text-sm font-semibold text-gold transition group-hover:bg-gold/20">
        Entrar <ArrowRight className="h-4 w-4" />
      </span>
    </Link>
  );
}

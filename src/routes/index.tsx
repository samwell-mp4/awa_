import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/home/logo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import infantilLogo from "@/assets/infantil-logo-new.jpg.asset.json";
import adultoLogo from "@/assets/adulto-logo.png.asset.json";

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
    <div className="min-h-screen text-foreground flex flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 md:px-8">
        <Logo />
        <LanguageSwitcher />
      </header>

      <main className="flex w-full flex-1 flex-col items-center justify-center py-10 text-center">
        <h1 className="font-display text-3xl font-black uppercase tracking-wide text-cream md:text-5xl">
          Escolha sua experiência
        </h1>
        <p className="mt-3 max-w-2xl px-4 text-sm text-foreground/75 md:text-base">
          O Awã Tech tem duas portas de entrada. Escolha a que combina com você.
        </p>

        <div className="mt-10 grid w-full gap-0 md:grid-cols-2">
          <Link
            to="/adulto"
            className="group relative flex flex-col overflow-hidden text-left transition hover:-translate-y-1"
          >
            <img
              src={adultoLogo.url}
              alt="Awã Tech Adulto"
              className="block w-full h-auto"
              draggable={false}
            />
            <div className="p-6 md:p-8">
              <div className="font-display text-2xl font-black uppercase tracking-wide text-cream md:text-3xl">
                Awã Tech Adulto
              </div>
              <p className="mt-2 text-sm text-foreground/85 md:text-base">
                Trilhas, tradutor, dicionário, histórias, biografia e Espaço do Professor.
              </p>
              <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-forest-deep/50 px-4 py-2 text-sm font-semibold text-gold transition group-hover:bg-gold/20">
                Entrar <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </Link>
          <Link
            to="/infantil"
            className="group relative flex flex-col overflow-hidden text-left transition hover:-translate-y-1"
          >
            <img
              src={infantilLogo.url}
              alt="Awã Tech Infantil"
              className="block w-full h-auto"
              draggable={false}
            />
            <div className="p-6 md:p-8">
              <div className="font-display text-2xl font-black uppercase tracking-wide text-cream md:text-3xl">
                Awã Tech Infantil
              </div>
              <p className="mt-2 text-sm text-foreground/85 md:text-base">
                Jogos, músicas, saudações e vídeos divertidos para crianças aprenderem brincando.
              </p>
              <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-forest-deep/50 px-4 py-2 text-sm font-semibold text-gold transition group-hover:bg-gold/20">
                Entrar <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}

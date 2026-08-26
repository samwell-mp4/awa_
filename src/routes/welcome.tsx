import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/welcome")({
  head: () => ({
    meta: [
      { title: "Assinatura confirmada — AWÃ TECH" },
      {
        name: "description",
        content:
          "Sua assinatura AWÃ TECH foi confirmada. Comece agora a aprender Patxôhã com trilhas, dicionário e cânticos.",
      },
      { property: "og:title", content: "Assinatura confirmada — AWÃ TECH" },
      {
        property: "og:description",
        content: "Bem-vindo à AWÃ TECH. Sua assinatura está ativa.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: WelcomePage,
});

function WelcomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--gradient-forest)] px-4 py-16 text-cream">
      <main className="w-full max-w-lg rounded-3xl border border-gold/30 bg-card/60 p-8 text-center backdrop-blur-xl">
        <CheckCircle2 className="mx-auto h-14 w-14 text-leaf" />
        <h1 className="mt-4 font-display text-3xl font-black">Iawê! Assinatura confirmada</h1>
        <p className="mt-3 text-sm text-foreground/80">
          Obrigado por apoiar a língua Patxôhã. Seu acesso é liberado em instantes — se algo não
          aparecer, recarregue a página em alguns segundos.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/minha-conta"
            className="rounded-full bg-gold px-6 py-3 text-sm font-bold text-background transition hover:brightness-110"
          >
            Ver minha conta
          </Link>
          <Link
            to="/"
            className="rounded-full border border-gold/40 px-6 py-3 text-sm font-bold text-cream transition hover:border-gold"
          >
            Ir para o início
          </Link>
        </div>
      </main>
    </div>
  );
}

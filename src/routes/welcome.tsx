import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useSubscription } from "@/hooks/use-subscription";
import { useAuth } from "@/hooks/use-auth";

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
  const { user } = useAuth();
  const { isPremium, refetch } = useSubscription();

  // O acesso é liberado pelo webhook do provedor de pagamento, que pode chegar
  // alguns segundos depois do checkout. Enquanto não chega, reconsultamos.
  useEffect(() => {
    if (!user || isPremium) return;
    const id = window.setInterval(() => void refetch(), 3000);
    const stop = window.setTimeout(() => window.clearInterval(id), 60_000);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(stop);
    };
  }, [user, isPremium, refetch]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--gradient-forest)] px-4 py-16 text-cream">
      <main className="w-full max-w-lg rounded-3xl border border-gold/30 bg-card/60 p-8 text-center backdrop-blur-xl">
        {isPremium ? (
          <CheckCircle2 className="mx-auto h-14 w-14 text-leaf" />
        ) : (
          <Loader2 className="mx-auto h-14 w-14 animate-spin text-gold" />
        )}
        <h1 className="mt-4 font-display text-3xl font-black">
          {isPremium ? "Iawê! Assinatura confirmada" : "Confirmando sua assinatura..."}
        </h1>
        <p className="mt-3 text-sm text-foreground/80">
          {isPremium
            ? "Obrigado por apoiar a língua Patxôhã. Seu acesso já está liberado."
            : "Recebemos seu pagamento e estamos liberando o acesso. Isso costuma levar poucos segundos — esta página se atualiza sozinha."}
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

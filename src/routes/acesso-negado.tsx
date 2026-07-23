import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/acesso-negado")({
  head: () => ({
    meta: [
      { title: "Acesso negado — AWÃ TECH" },
      { name: "description", content: "Você não tem permissão para acessar esta área." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AcessoNegadoPage,
});

function AcessoNegadoPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-[var(--gradient-forest)] px-4 text-cream">
      <div className="card-elev max-w-md rounded-3xl border border-gold/30 p-8 text-center backdrop-blur">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gold/15 text-gold ring-1 ring-gold/40">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h1 className="mt-5 font-display text-3xl font-black text-cream">Acesso restrito</h1>
        <p className="mt-2 text-sm text-foreground/75">
          Esta área é exclusiva para administradores do AWÃ TECH. Se você acredita que deveria ter
          acesso, peça a um administrador para liberar sua conta.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="rounded-2xl bg-[var(--gradient-leaf)] px-4 py-2.5 text-sm font-bold text-cream shadow-[var(--shadow-glow)]"
          >
            Voltar ao início
          </Link>
          <Link
            to="/minha-conta"
            className="rounded-2xl border border-gold/40 px-4 py-2.5 text-sm font-semibold text-cream hover:bg-gold/10"
          >
            Minha conta
          </Link>
        </div>
      </div>
    </div>
  );
}

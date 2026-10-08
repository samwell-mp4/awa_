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
    <div className="grid min-h-screen place-items-center bg-[#f7f6f2] px-4 text-[#1f2937]">
      <div className="max-w-md rounded-3xl border border-[#e8e4dc] bg-white p-8 text-center shadow-xs">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-rose-50 text-rose-600 ring-1 ring-rose-200">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h1 className="mt-5 font-display text-2xl font-black text-[#11231b]">Acesso restrito</h1>
        <p className="mt-2 text-sm text-[#4b5563] leading-relaxed">
          Esta área é exclusiva para administradores do AWÃ TECH. Se você acredita que deveria ter
          acesso, peça a um administrador para liberar sua conta.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="rounded-full bg-[#1b4332] px-5 py-2.5 text-sm font-bold text-white shadow-xs hover:bg-[#2d6a4f] transition"
          >
            Voltar ao início
          </Link>
          <Link
            to="/minha-conta"
            className="rounded-full border border-[#e8e4dc] bg-white px-5 py-2.5 text-sm font-bold text-[#11231b] hover:border-[#1b4332] transition shadow-xs"
          >
            Minha conta
          </Link>
        </div>
      </div>
    </div>
  );
}

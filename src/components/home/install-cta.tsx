import { Link } from "@tanstack/react-router";
import { ChevronRight, Download, Smartphone } from "lucide-react";

const platforms = [
  {
    label: "Android",
    instruction: (
      <>
        No Chrome, toque no menu ⋮ e escolha{" "}
        <strong className="text-cream">Adicionar à tela inicial</strong> ou{" "}
        <strong className="text-cream">Instalar app</strong>.
      </>
    ),
  },
  {
    label: "iPhone",
    instruction: (
      <>
        No Safari, toque no botão <strong className="text-cream">Compartilhar</strong> e depois em{" "}
        <strong className="text-cream">Adicionar à Tela de Início</strong>.
      </>
    ),
  },
];

export function InstallCTA() {
  return (
    <section className="mt-10 rounded-3xl border border-gold/20 bg-gradient-to-br from-leaf/15 to-forest-deep/20 p-6 text-center md:p-10">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gold/15 text-gold shadow-[var(--shadow-glow)]">
          <Download className="h-7 w-7" />
        </div>
        <h2 className="font-display text-2xl font-black text-cream md:text-3xl">
          Instale o Awã Tech no seu celular
        </h2>
        <p className="text-sm leading-relaxed text-foreground/80 md:text-base">
          Adicione o app à tela inicial e acesse o dicionário, músicas, histórias e Professor
          Akuã com um toque — como um app nativo.
        </p>

        <div className="mt-2 grid w-full gap-3 sm:grid-cols-2">
          {platforms.map((p) => (
            <div key={p.label} className="rounded-2xl border border-gold/15 bg-card/50 p-5 text-left">
              <div className="flex items-center gap-2 text-cream">
                <Smartphone className="h-4 w-4 text-gold" />
                <span className="text-sm font-bold">{p.label}</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-foreground/75">{p.instruction}</p>
            </div>
          ))}
        </div>

        <Link
          to="/instalar"
          className="mt-4 inline-flex items-center justify-center rounded-full bg-gold px-6 py-2.5 text-sm font-bold text-forest-deep transition hover:bg-gold/90"
        >
          Ver instruções completas
          <ChevronRight className="ml-1 h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

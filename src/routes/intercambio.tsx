import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Sparkles, X } from "lucide-react";

import { PublicFooter } from "@/components/PublicFooter";
import { IntercambioStory } from "@/components/aldeia-velha/intercambio-story";
import { INTERCAMBIO_SUBTITLE, type Photo } from "@/lib/aldeia-velha-content";

export const Route = createFileRoute("/intercambio")({
  head: () => ({
    meta: [
      { title: "Intercâmbio Cultural e Territorial — Escola Pataxó Aldeia Velha" },
      {
        name: "description",
        content:
          "Histórias, relatos dos estudantes, visitas às comunidades, experiências culturais, territórios visitados e fotos do Intercâmbio Cultural e Territorial da Escola Indígena Pataxó Aldeia Velha.",
      },
      { property: "og:type", content: "article" },
      {
        property: "og:title",
        content: "Intercâmbio Cultural e Territorial — Escola Pataxó Aldeia Velha",
      },
      {
        property: "og:description",
        content:
          "Quando o território se transforma em sala de aula: narrativas, depoimentos e fotos do intercâmbio Pataxó.",
      },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: IntercambioPage,
});

function IntercambioPage() {
  const [zoom, setZoom] = useState<Photo | null>(null);

  return (
    <div className="min-h-screen bg-[#08100c] text-foreground">
      <div className="mx-auto max-w-5xl px-4 pb-24 pt-6 md:px-8 md:pt-10">
        <Link
          to="/historias"
          className="inline-flex items-center gap-2 rounded-full border border-gold/35 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-gold"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Histórias e Narrativas
        </Link>

        <header className="mt-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-forest-deep/60 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold/90">
            <Sparkles className="h-3.5 w-3.5" />
            Intercâmbio Cultural e Territorial
          </span>
          <h1 className="mt-5 font-display text-3xl font-black leading-tight text-cream md:text-5xl">
            Quando o território se transforma em sala de aula
          </h1>
          <p className="mt-4 max-w-3xl text-[14.5px] leading-relaxed text-foreground/80 md:text-base">
            {INTERCAMBIO_SUBTITLE}
          </p>
        </header>

        <section className="mt-10">
          <IntercambioDocumentario />
        </section>

        <section className="mt-10">
          <IntercambioStory onZoom={setZoom} />
        </section>

      </div>

      {zoom && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setZoom(null)}
        >
          <button
            type="button"
            aria-label="Fechar"
            onClick={() => setZoom(null)}
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-gold/40 text-gold"
          >
            <X className="h-5 w-5" />
          </button>
          <figure className="max-h-full w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <img
              src={zoom.src}
              alt={zoom.alt}
              className="max-h-[75vh] w-full rounded-2xl object-contain"
            />
            <figcaption className="mt-3 text-center text-[13px] text-foreground/75">
              {zoom.caption}
            </figcaption>
          </figure>
        </div>
      )}

      <PublicFooter />
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Sparkles, X } from "lucide-react";

import { SiteHeader } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { IntercambioStory } from "@/components/aldeia-velha/intercambio-story";
import { IntercambioDocumentario } from "@/components/aldeia-velha/documentario";
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
    <div className="min-h-screen bg-[#f7f6f2] text-[#1f2937]">
      <SiteHeader mode="adulto" />
      <div className="mx-auto max-w-5xl px-4 pb-24 pt-6 md:px-8 md:pt-10">
        <Link
          to="/historias"
          className="inline-flex items-center gap-2 rounded-full border border-[#e8e4dc] bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#1b4332] shadow-xs hover:border-[#1b4332] transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Histórias e Narrativas
        </Link>

        <header className="mt-8 rounded-3xl border border-[#e8e4dc] bg-white p-6 md:p-10 shadow-xs">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#e8e4dc] bg-[#fbfaf7] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#1b4332]">
            <Sparkles className="h-3.5 w-3.5 text-[#b47e28]" />
            Intercâmbio Cultural e Territorial
          </span>
          <h1 className="mt-4 font-display text-3xl font-black leading-tight text-[#11231b] md:text-5xl">
            Quando o território se transforma em sala de aula
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#4b5563] md:text-base">
            {INTERCAMBIO_SUBTITLE}
          </p>
        </header>

        <section className="mt-8">
          <IntercambioDocumentario />
        </section>

        <section className="mt-8">
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
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-white/30 text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
          <figure className="max-h-full w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <img
              src={zoom.src}
              alt={zoom.alt}
              className="max-h-[75vh] w-full rounded-2xl object-contain"
            />
            <figcaption className="mt-3 text-center text-sm text-white/80">
              {zoom.caption}
            </figcaption>
          </figure>
        </div>
      )}

      <SiteFooter mode="adulto" />
    </div>
  );
}

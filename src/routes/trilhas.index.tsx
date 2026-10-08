import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

import { SiteFooter } from "@/components/home/site-footer";
import { SiteHeader } from "@/components/home/site-header";
import { TrailsGrid } from "@/components/home/trails-grid";
import { useHomeTrails } from "@/hooks/use-home-data";

export const Route = createFileRoute("/trilhas/")({
  head: () => ({
    meta: [
      { title: "Trilhas de aprendizado — Awã Tech" },
      {
        name: "description",
        content:
          "Escolha uma trilha para aprender línguas indígenas: saudações, família, natureza e animais.",
      },
      { property: "og:title", content: "Trilhas de aprendizado — Awã Tech" },
      {
        property: "og:description",
        content:
          "Trilhas de aprendizado do Awã Tech para explorar línguas e culturas indígenas.",
      },
    ],
  }),
  component: TrilhasPage,
});

function TrilhasPage() {
  const { t } = useTranslation();
  const trails = useHomeTrails();
  return (
    <div className="min-h-screen bg-[#f7f6f2] text-[#1f2937]">
      <SiteHeader mode="adulto" />
      <main className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 md:px-8">
        <div className="mt-6">
          <Link
            to="/adulto"
            className="mb-3 inline-flex items-center gap-2 text-xs font-bold text-[#1b4332] hover:text-[#2d6a4f]"
          >
            <ArrowLeft className="h-4 w-4" /> {t("Voltar para o Início")}
          </Link>
          <div className="tribal-border w-16 mb-2" />
          <h1 className="font-display text-3xl font-black text-[#11231b] md:text-4xl tracking-tight">
            {t("home.trailsTitle")}
          </h1>
          <p className="mt-2 text-sm text-[#4b5563]">
            Escolha uma trilha temática para enriquecer seu vocabulário, pronúncia e compreensão cultural.
          </p>
        </div>
        <TrailsGrid trails={trails} mode="adulto" />
      </main>
      <SiteFooter mode="adulto" />
    </div>
  );
}

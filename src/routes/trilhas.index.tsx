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
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader mode="adulto" />
      <main className="mx-auto max-w-6xl px-3 pb-16 sm:px-4 md:px-8">
        <div className="mt-6">
          <div className="tribal-border w-16 mb-2" />
          <h1 className="font-display text-3xl font-black text-cream md:text-4xl">
            {t("home.trailsTitle")}
          </h1>
        </div>
        <TrailsGrid trails={trails} />
      </main>
      <SiteFooter />
    </div>
  );
}

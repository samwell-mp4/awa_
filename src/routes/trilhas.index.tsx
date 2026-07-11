import { createFileRoute } from "@tanstack/react-router";

import { SiteFooter } from "@/components/home/site-footer";
import { SiteHeader } from "@/components/home/site-header";
import { TrailsGrid } from "@/components/home/trails-grid";
import { useHomeTrails } from "@/hooks/use-home-data";

export const Route = createFileRoute("/trilhas/")({
  head: () => ({
    meta: [
      { title: "Trilhas — AWÃ TECH" },
      {
        name: "description",
        content:
          "Explore as trilhas de aprendizado de línguas indígenas: saudações, família, natureza, animais e muito mais.",
      },
      { property: "og:title", content: "Trilhas — AWÃ TECH" },
      {
        property: "og:description",
        content: "Trilhas educativas para aprender línguas indígenas brasileiras.",
      },
    ],
  }),
  component: TrilhasIndex,
});

function TrilhasIndex() {
  const trails = useHomeTrails();
  return (
    <div className="min-h-screen text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 pb-16 md:px-8">
        <TrailsGrid trails={trails} />
      </main>
      <SiteFooter />
    </div>
  );
}

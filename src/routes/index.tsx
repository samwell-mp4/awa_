import { createFileRoute } from "@tanstack/react-router";

import { ContinueLearningCard } from "@/components/home/continue-learning";
import { DailyMissionCard } from "@/components/home/daily-mission-card";
import { GreetingOfMoment } from "@/components/home/greeting-of-moment";
import { HeroSection } from "@/components/home/hero-section";
import { InstallCTA } from "@/components/home/install-cta";
import { RankingCard } from "@/components/home/ranking-card";
import { ResourcesSection } from "@/components/home/resources-section";
import { SiteFooter } from "@/components/home/site-footer";
import { SiteHeader } from "@/components/home/site-header";
import { TrailsGrid } from "@/components/home/trails-grid";

import { useDailyMission, useHomeTrails } from "@/hooks/use-home-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AWÃ TECH — Línguas Indígenas, Culturas Vivas" },
      {
        name: "description",
        content:
          "Aprenda línguas indígenas brasileiras com vídeos, histórias, músicas e desafios. Uma plataforma educativa que preserva culturas vivas.",
      },
      { property: "og:title", content: "AWÃ TECH — Línguas Indígenas, Culturas Vivas" },
      {
        property: "og:description",
        content:
          "Plataforma digital para aprender idiomas indígenas brasileiros através de vídeos, histórias, músicas e desafios.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const trails = useHomeTrails();
  const { data: mission } = useDailyMission();

  return (
    <div className="min-h-screen text-foreground">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 md:px-8">
        <HeroSection />
        <GreetingOfMoment />
        <ContinueLearningCard />
        
        <TrailsGrid trails={trails} />

        <section id="desafios" className="mt-8 grid gap-4 md:grid-cols-2">
          <DailyMissionCard mission={mission} />
          <RankingCard />
        </section>

        <ResourcesSection />
        <InstallCTA />
      </main>

      <SiteFooter />
    </div>
  );
}

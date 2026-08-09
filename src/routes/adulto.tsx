import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getPaddleEnvironment } from "@/lib/paddle";
import { setLastArea } from "@/lib/last-area";

import { ContinueLearningCard } from "@/components/home/continue-learning";
import { DailyMissionCard } from "@/components/home/daily-mission-card";
import { GreetingOfMoment } from "@/components/home/greeting-of-moment";
import { HeroSection } from "@/components/home/hero-section";
import { InstallCTA } from "@/components/home/install-cta";
import { RankingCard } from "@/components/home/ranking-card";
import { SiteFooter } from "@/components/home/site-footer";
import { SiteHeader } from "@/components/home/site-header";
import { TrailsGrid } from "@/components/home/trails-grid";

import { useDailyMission, useHomeTrails } from "@/hooks/use-home-data";


export const Route = createFileRoute("/adulto")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
    const { data: hasAccess } = await supabase.rpc("has_plan_access", {
      _user_id: data.user.id,
      _plan: "adulto",
      _check_env: getPaddleEnvironment(),
    });
    if (!hasAccess) throw redirect({ to: "/planos", search: { need: "adulto" } as any });
  },
  head: () => ({
    meta: [
      { title: "Awã Tech Adulto — Trilhas, Dicionário e Cultura" },
      {
        name: "description",
        content:
          "Área adulta do Awã Tech: trilhas de aprendizado, tradutor, dicionário, histórias, biografia e Espaço do Professor.",
      },
      { property: "og:title", content: "Awã Tech Adulto" },
      {
        property: "og:description",
        content:
          "Aprofunde-se nas línguas indígenas com trilhas, tradutor e o Espaço do Professor.",
      },
    ],
  }),
  component: AdultoHome,
});

function AdultoHome() {
  const trails = useHomeTrails();
  const { data: mission } = useDailyMission();
  useEffect(() => setLastArea("/adulto"), []);


  return (
    <div className="min-h-screen text-foreground">
      <SiteHeader mode="adulto" />

      <main className="mx-auto max-w-6xl px-4 md:px-8">
        <HeroSection />
        <GreetingOfMoment />
        <ContinueLearningCard />

        <TrailsGrid trails={trails} />

        <section id="desafios" className="mt-8 grid gap-4 md:grid-cols-2">
          <DailyMissionCard mission={mission} />
          <RankingCard />
        </section>

        <InstallCTA />
      </main>

      <SiteFooter />
    </div>
  );
}

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
import { useActiveTemplate } from "@/hooks/use-active-template";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useDailyMission, useHomeTrails } from "@/hooks/use-home-data";


export const Route = createFileRoute("/adulto")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    // `reloadDocument`: rota client-only — trocar de página no cliente após o
    // SSR do placeholder gera divergência de hidratação.
    if (!data.user) throw redirect({ to: "/auth", reloadDocument: true });
    const { data: hasAccess } = await supabase.rpc("has_plan_access", {
      _user_id: data.user.id,
      _plan: "adulto",
      _check_env: getPaddleEnvironment(),
    });
    if (!hasAccess) {
      throw redirect({
        to: "/planos",
        search: { need: "adulto" } as any,
        reloadDocument: true,
      });
    }
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
  const { template, config } = useActiveTemplate("adulto");
  useEffect(() => setLastArea("/adulto"), []);


  return (
    <div className={`min-h-screen text-foreground template-adulto-${config.style || 'default'}`}>
      <SiteHeader mode="adulto" />

      <main className="mx-auto max-w-6xl px-4 md:px-8">
        <ErrorBoundary area="adulto-hero">
          <HeroSection />
          <GreetingOfMoment />
          <ContinueLearningCard />
        </ErrorBoundary>

        <div className="content-visibility-auto">
          <ErrorBoundary area="adulto-trilhas" message="Não foi possível carregar as trilhas. Tente novamente.">
            <TrailsGrid trails={trails} />
          </ErrorBoundary>
        </div>

        <section id="desafios" className="mt-8 grid gap-4 md:grid-cols-2 content-visibility-auto">
          <ErrorBoundary area="adulto-missao">
            <DailyMissionCard mission={mission} />
          </ErrorBoundary>
          <ErrorBoundary area="adulto-ranking">
            <RankingCard />
          </ErrorBoundary>
        </section>

        <div className="content-visibility-auto">
          <ErrorBoundary area="adulto-install" fallback={() => null}>
            <InstallCTA />
          </ErrorBoundary>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

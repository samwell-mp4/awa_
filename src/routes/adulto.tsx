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
import { useDailyMission, useHomeTrails } from "@/hooks/use-home-data";


/** Cache curto do resultado do guard: evita 2 idas ao servidor por navegação. */
let accessCache: { userId: string; ok: boolean; at: number } | null = null;
const ACCESS_TTL = 5 * 60 * 1000;

export const Route = createFileRoute("/adulto")({
  ssr: false,
  beforeLoad: async () => {
    // getSession() lê do armazenamento local (instantâneo); getUser() fazia uma
    // chamada de rede a cada entrada na área adulta.
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;
    if (!user) throw redirect({ to: "/auth" });

    let hasAccess: boolean | null = null;
    if (accessCache && accessCache.userId === user.id && Date.now() - accessCache.at < ACCESS_TTL) {
      hasAccess = accessCache.ok;
    } else {
      const res = await supabase.rpc("has_plan_access", {
        _user_id: user.id,
        _plan: "adulto",
        _check_env: getPaddleEnvironment(),
      });
      hasAccess = !!res.data;
      accessCache = { userId: user.id, ok: hasAccess, at: Date.now() };
    }
    if (!hasAccess) {
      console.warn("[Guard] Redirecting to plans: No access to Adulto for user", user.id);
      throw redirect({ to: "/planos", search: { need: "adulto" } as any });
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
        <HeroSection />
        <GreetingOfMoment />
        <ContinueLearningCard />

        <div className="content-visibility-auto">
          <TrailsGrid trails={trails} />
        </div>
        
        <section id="desafios" className="mt-8 grid gap-4 md:grid-cols-2 content-visibility-auto">
          <DailyMissionCard mission={mission} />
          <RankingCard />
        </section>

        <div className="content-visibility-auto">
          <InstallCTA />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

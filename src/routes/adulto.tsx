import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getPaddleEnvironment } from "@/lib/paddle";
import { setLastArea } from "@/lib/last-area";

import { MainMenu } from "@/components/home/main-menu";
import { SiteFooter } from "@/components/home/site-footer";
import { SiteHeader } from "@/components/home/site-header";
import { useActiveTemplate } from "@/hooks/use-active-template";


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
    if (!hasAccess) {
      console.warn("[Guard] Redirecting to plans: No access to Adulto for user", data.user.id);
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
  const { config } = useActiveTemplate("adulto");
  useEffect(() => setLastArea("/adulto"), []);

  return (
    <div className={`min-h-screen text-foreground template-adulto-${config.style || 'default'}`}>
      <SiteHeader mode="adulto" />
      <MainMenu />
      <SiteFooter />
    </div>
  );
}

import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getPaddleEnvironment } from "@/lib/paddle";
import { setLastArea } from "@/lib/last-area";
import { KidsMainMenu } from "@/components/kids/kids-main-menu";

export const Route = createFileRoute("/infantil")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
    const { data: hasAccess } = await supabase.rpc("has_plan_access", {
      _user_id: data.user.id,
      _plan: "infantil",
      _check_env: getPaddleEnvironment(),
    });
    if (!hasAccess) throw redirect({ to: "/planos", search: { need: "infantil" } as any });
  },
  head: () => ({
    meta: [
      { title: "Aldeia Viva — Awã Tech Infantil" },
      {
        name: "description",
        content:
          "Área infantil do Awã Tech: cantigas, histórias, jogos e trilhas para as crianças aprenderem Patxôhã brincando.",
      },
      { property: "og:title", content: "Aldeia Viva — Awã Tech Infantil" },
      {
        property: "og:description",
        content: "Cantigas, histórias e jogos indígenas para crianças no Awã Tech.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: InfantilHome,
});

function InfantilHome() {
  useEffect(() => setLastArea("/infantil"), []);

  return (
    <div className="kids-theme min-h-screen bg-[#0d2b21]">
      <KidsMainMenu />
    </div>
  );
}

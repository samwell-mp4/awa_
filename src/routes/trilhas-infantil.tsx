import { createFileRoute } from "@tanstack/react-router";
import { requireArea } from "@/lib/area-guard";
import { SiteHeader } from "@/components/home/site-header";
import { KidsTrailsAdventureMap } from "@/components/kids/KidsTrailsAdventureMap";

export const Route = createFileRoute("/trilhas-infantil")({
  ssr: false,
  beforeLoad: () => requireArea("infantil"),
  head: () => ({
    meta: [
      { title: "Trilhas da Aldeia — Awã Tech Infantil" },
      {
        name: "description",
        content:
          "Trilhas de Aprendizado: percursos sequenciais para aprender a língua Patxôhã, natureza e tradições indígenas.",
      },
      { property: "og:title", content: "Trilhas da Aldeia — Awã Tech" },
      {
        property: "og:description",
        content: "Trilhas de aprendizado infantil na Awã Tech.",
      },
    ],
  }),
  component: () => (
    <div className="kids-theme">
      {/* <SiteHeader mode="infantil" /> */}
      <KidsTrailsAdventureMap backHref="/infantil" />
    </div>
  ),
});

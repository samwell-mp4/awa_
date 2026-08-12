import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { AreaGate } from "@/components/area-gate";
import { AkuaChatKids } from "@/components/kids/akua-chat-kids";
import { useLastArea } from "@/lib/last-area";

export const Route = createFileRoute("/professor-infantil")({
  head: () => ({
    meta: [
      { title: "Professor Akuã Infantil — AWÃ TECH" },
      { name: "description", content: "Converse com o mestre virtual de Patxôhã em uma interface divertida para crianças." },
    ],
  }),
  component: () => (
    <AreaGate plan="infantil">
      <ProfessorInfantilPage />
    </AreaGate>
  ),
});

function ProfessorInfantilPage() {
  const { t } = useTranslation();
  const backTo = useLastArea();

  return (
    <div className="kids-theme min-h-screen bg-[var(--gradient-forest)] text-foreground">
      <SiteHeader mode="infantil" />
      
      <main className="mx-auto max-w-3xl px-4 py-8 md:px-6">
        <div className="mb-6 flex items-center justify-between">
          <Link 
            to={backTo as "/infantil"} 
            className="inline-flex items-center gap-2 rounded-xl bg-white/90 px-4 py-2 text-sm font-black text-amber-700 shadow-md hover:bg-white transition"
          >
            <ArrowLeft className="w-5 h-5" /> {t("infantil.akua.back", "Volta")}
          </Link>
          <div className="text-center">
            <h1 className="font-display text-2xl font-black text-white drop-shadow-md">
              {t("infantil.akua.title", "Aula com Professor Akuã")}
            </h1>
          </div>
          <div className="w-20" /> {/* Spacer */}
        </div>

        <AkuaChatKids />
      </main>

      <SiteFooter />
    </div>
  );
}

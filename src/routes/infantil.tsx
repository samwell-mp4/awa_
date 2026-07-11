import { createFileRoute } from "@tanstack/react-router";

import { SiteFooter } from "@/components/home/site-footer";
import { SiteHeader } from "@/components/home/site-header";

export const Route = createFileRoute("/infantil")({
  head: () => ({
    meta: [
      { title: "Awã Tech Infantil" },
      {
        name: "description",
        content: "Modo infantil do Awã Tech — em construção.",
      },
      { property: "og:title", content: "Awã Tech Infantil" },
      { property: "og:description", content: "Modo infantil do Awã Tech — em construção." },
    ],
  }),
  component: InfantilHome,
});

function InfantilHome() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-200 via-emerald-100 to-amber-100 text-foreground">
      <SiteHeader mode="infantil" />

      <main className="mx-auto flex max-w-3xl flex-col items-center px-4 pb-16 pt-10 text-center md:px-8">
        <div className="text-5xl">🌿</div>
        <h1 className="mt-3 font-display text-3xl font-black uppercase tracking-wide text-emerald-900 md:text-4xl">
          Modo Infantil
        </h1>
        <p className="mt-2 max-w-md text-sm font-semibold text-emerald-800 md:text-base">
          Em breve novas atividades pensadas só para as crianças 🌱
        </p>
      </main>

      <SiteFooter />
    </div>
  );
}

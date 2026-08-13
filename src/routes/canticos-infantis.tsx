import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Play, Pause, X, Music } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { requireArea } from "@/lib/area-guard";
import { SiteHeader } from "@/components/home/site-header";

export const Route = createFileRoute("/canticos-infantis")({
  ssr: false,
  beforeLoad: () => requireArea("infantil"),
  component: CanticosInfantisPage,
});

function CanticosInfantisPage() {
  const { t } = useTranslation();
  
  return (
    <div className="kids-theme min-h-screen text-emerald-950">
      <SiteHeader mode="infantil" showBackButton />
      
      <main className="mx-auto max-w-4xl px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="kids-title text-4xl md:text-5xl">🎵 Cânticos Infantis Pataxó 🎵</h1>
          <p className="mt-2 text-xl font-bold text-emerald-900/80">Awã Tech — Línguas indígenas, culturas vivas</p>
        </header>

        <section className="kids-card p-6 md:p-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Pataxó Column */}
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-emerald-900 border-b-4 border-dashed border-rose-400 pb-2">Pataxó</h2>
              <div className="space-y-2 font-display text-lg">
                 {/* Versos aqui */}
                 <p>Verso Pataxó 1...</p>
                 <p>Verso Pataxó 2...</p>
              </div>
              <div className="flex gap-2 mt-4">
                <button className="kids-btn bg-emerald-500">🔊 OUVIR</button>
                <button className="kids-btn bg-rose-400">🎵 CANTAR</button>
              </div>
            </div>

            {/* Português Column */}
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-emerald-900 border-b-4 border-dashed border-sky-400 pb-2">Português</h2>
              <div className="space-y-2 font-sans text-lg italic text-emerald-800">
                 {/* Tradução aqui */}
                 <p>Tradução 1...</p>
                 <p>Tradução 2...</p>
              </div>
              <div className="flex gap-2 mt-4">
                <button className="kids-btn bg-emerald-500">🔊 OUVIR</button>
                <button className="kids-btn bg-sky-400">🎵 CANTAR</button>
              </div>
            </div>
          </div>
        </section>

        {/* Player Central */}
        <section className="kids-card mt-8 p-6 flex flex-col items-center gap-4">
          <button className="kids-btn text-2xl px-12 py-6 rounded-full scale-110">▶️ REPRODUZIR</button>
          <div className="w-full h-4 bg-white rounded-full border-2 border-emerald-900 overflow-hidden">
             <div className="h-full bg-rose-400 w-1/3"></div>
          </div>
          <div className="text-sm font-black">0:00 / 3:00</div>
        </section>
      </main>
    </div>
  );
}

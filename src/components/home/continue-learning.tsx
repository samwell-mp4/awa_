import { BookOpen } from "lucide-react";
import { ProgressBar } from "./progress-bar";

export function ContinueLearningCard() {
  return (
    <section id="aprender" className="mt-6">
      <div className="card-elev rounded-2xl p-4 md:p-5">
        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gold/15 text-gold">
            <BookOpen className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-display text-lg font-bold text-cream">Continuar aprendendo</h3>
              <span className="text-sm font-bold text-gold">60%</span>
            </div>
            <p className="truncate text-sm text-foreground/70">Lição 3 — Saudações em Pataxó</p>
            <ProgressBar value={60} className="mt-2" />
          </div>
        </div>
      </div>
    </section>
  );
}

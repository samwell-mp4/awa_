import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { BookOpen, ArrowRight, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ProgressBar } from "./progress-bar";
import { translateTrailName } from "./trails-grid";
import { TRAILS, getLearned, hasCertificate, type TrailSlug } from "@/lib/trilhas";
import { supabase } from "@/integrations/supabase/client";

type LessonRow = {
  slug: TrailSlug;
  name: string;
  emoji: string;
  learned: number;
  total: number;
  pct: number;
  done: boolean;
};

async function fetchTotals(): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from("dictionary")
    .select("category")
    .limit(5000);
  if (error) throw error;
  const totals: Record<string, number> = {};
  for (const row of data ?? []) {
    const c = (row as { category: string | null }).category ?? "";
    totals[c] = (totals[c] ?? 0) + 1;
  }
  return totals;
}

export function ContinueLearningCard() {
  const { t } = useTranslation();
  const { data: totals = {} } = useQuery({
    queryKey: ["dict-category-totals"],
    queryFn: fetchTotals,
    staleTime: 5 * 60 * 1000,
  });

  // Live updates: refresh when progress changes in this tab or another
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const on = () => setTick((t) => t + 1);
    window.addEventListener("focus", on);
    window.addEventListener("storage", on);
    window.addEventListener("awa:progress", on as EventListener);
    const iv = window.setInterval(on, 4000);
    return () => {
      window.removeEventListener("focus", on);
      window.removeEventListener("storage", on);
      window.removeEventListener("awa:progress", on as EventListener);
      window.clearInterval(iv);
    };
  }, []);

  const lessons: LessonRow[] = (Object.values(TRAILS) as (typeof TRAILS)[TrailSlug][]).map(
    (t) => {
      const total = t.categories.reduce((s, c) => s + (totals[c] ?? 0), 0);
      const learned = Math.min(getLearned(t.slug).size, total || Infinity);
      const pct = total > 0 ? Math.round((learned / total) * 100) : 0;
      return {
        slug: t.slug,
        name: t.name,
        emoji: t.emoji,
        learned,
        total,
        pct,
        done: hasCertificate(t.slug) || (total > 0 && learned >= total),
      };
    }
  );
  void tick;

  const totalLearned = lessons.reduce((s, l) => s + l.learned, 0);
  const totalWords = lessons.reduce((s, l) => s + l.total, 0);
  const overall = totalWords > 0 ? Math.round((totalLearned / totalWords) * 100) : 0;
  const next =
    lessons.find((l) => !l.done && l.learned > 0) ??
    lessons.find((l) => !l.done) ??
    lessons[0];

  return (
    <section id="aprender" className="mt-6">
      <div className="card-elev rounded-2xl p-4 md:p-5">
        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gold/15 text-gold">
            <BookOpen className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-display text-lg font-bold text-cream">{t("home.continueLearning")}</h3>
              <span className="text-sm font-bold text-gold">{overall}%</span>
            </div>
            <p className="truncate text-sm text-foreground/70">
              {next
                ? t("home.nextTrail", { emoji: next.emoji, name: translateTrailName(t, next.name), learned: next.learned, total: next.total || "?" })
                : t("home.startFirst")}
            </p>
            <ProgressBar value={overall} className="mt-2" />
          </div>
        </div>

        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {lessons.map((l, i) => (
            <li key={l.slug}>
              <Link
                to="/trilhas/$slug"
                params={{ slug: l.slug }}
                className="group flex items-center gap-3 rounded-xl border border-gold/15 bg-forest-deep/30 p-3 hover:border-gold/40 hover:bg-forest-deep/50 transition"
              >
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gold/10 text-base">
                  {l.done ? <Check className="h-4 w-4 text-leaf" /> : <span>{l.emoji}</span>}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-bold text-cream">
                      {t("home.lesson")} {i + 1} — {l.name}
                    </span>
                    <span className="text-xs font-bold text-gold">{l.pct}%</span>
                  </div>
                  <ProgressBar value={l.pct} className="mt-1.5" />
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-foreground/40 group-hover:text-gold group-hover:translate-x-0.5 transition" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

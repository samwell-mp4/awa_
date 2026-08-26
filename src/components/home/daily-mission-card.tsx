import { useEffect, useMemo, useState } from "react";
import { Check, PartyPopper, Star, Trophy, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import type { DailyMission } from "@/hooks/use-home-data";
import { useAutoTranslate } from "@/hooks/use-auto-translate";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

function optionClass(picked: number | null, correct: number | undefined, i: number) {
  const isPicked = picked === i;
  const isRight = picked !== null && i === correct;
  const isWrong = isPicked && i !== correct;
  if (isRight) return "border-leaf/60 bg-leaf/20 text-cream";
  if (isWrong) return "border-destructive/50 bg-destructive/15 text-cream";
  return "border-gold/25 bg-card/60 text-foreground/85 hover:border-gold/50";
}

function todayKey(missionId: string | undefined) {
  return `awa:mission:${missionId ?? "none"}:${new Date().toISOString().slice(0, 10)}`;
}

export function DailyMissionCard({ mission }: { mission: DailyMission | null | undefined }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [answer, setAnswer] = useState<number | null>(null);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const correct = mission?.correct_index;
  const points = mission?.points ?? 10;
  const answered = answer !== null;
  const isRightAnswer = answered && answer === correct;

  useEffect(() => {
    setAnswer(null);
    if (typeof window === "undefined" || !mission?.id) return;
    setAlreadyDone(localStorage.getItem(todayKey(mission.id)) === "1");
  }, [mission?.id]);

  async function pick(i: number) {
    if (answered) return;
    setAnswer(i);
    if (i !== correct || !user?.id || alreadyDone || !mission?.id) return;
    setAlreadyDone(true);
    localStorage.setItem(todayKey(mission.id), "1");
    const { error } = await supabase.from("learning_events").insert({
      user_id: user.id,
      action: "daily_mission",
      points,
      trail: "missao-do-dia",
    });
    if (!error) qc.invalidateQueries({ queryKey: ["user-stats", user.id] });
  }

  const options = mission?.options ?? [];
  const textsToTranslate = useMemo(
    () => [mission?.question ?? "", ...options],
    [mission?.question, options.join("\u0001")],
  );
  const translated = useAutoTranslate(textsToTranslate);
  const question = translated[0] || (mission?.question ?? t("home.missionLoading"));
  const translatedOptions = translated.slice(1);

  return (
    <section id="missao-do-dia" className="card-elev rounded-2xl p-5">
      <div className="flex items-center gap-2">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-gold/15 text-gold">
          <Trophy className="h-5 w-5" />
        </div>
        <h3 className="font-display text-lg font-black text-cream">{t("home.missionTitle")}</h3>
        <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-2.5 py-1 text-xs font-bold text-gold">
          <Star className="h-3.5 w-3.5 fill-gold" /> +{points}
        </span>
      </div>
      <p className="mt-3 text-sm text-foreground/70">
        {mission?.question ? question : t("home.missionLoading")}
      </p>
      <div className="mt-3 flex flex-col gap-2">
        {options.map((label, i) => (
          <button
            key={i}
            onClick={() => pick(i)}
            disabled={answered}
            className={[
              "flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-semibold transition disabled:cursor-default",
              optionClass(answer, correct, i),
            ].join(" ")}
          >
            <span>
              {String.fromCharCode(65 + i)}) {translatedOptions[i] ?? label}
            </span>
            {answered && i === correct && <Check className="h-4 w-4 text-leaf" />}
            {answered && answer === i && i !== correct && <X className="h-4 w-4 text-destructive" />}
          </button>
        ))}
      </div>
      {isRightAnswer && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-leaf/40 bg-leaf/15 px-4 py-3 text-sm font-bold text-leaf">
          <PartyPopper className="h-4 w-4" />
          {t("home.missionWon", { points })}
        </div>
      )}
      {answered && !isRightAnswer && (
        <div className="mt-4 flex items-center justify-between gap-2 rounded-xl border border-gold/25 bg-card/60 px-4 py-3 text-sm">
          <span className="font-semibold text-foreground/75">{t("home.missionRetry")}</span>
          <button
            onClick={() => setAnswer(null)}
            className="font-bold text-gold hover:underline"
          >
            {t("Tentar de novo")}
          </button>
        </div>
      )}
    </section>
  );
}

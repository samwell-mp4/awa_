import { useMemo, useState } from "react";
import { Check, Star, Trophy } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { DailyMission } from "@/hooks/use-home-data";
import { useAutoTranslate } from "@/hooks/use-auto-translate";

function optionClass(picked: number | null, correct: number | undefined, i: number) {
  const isPicked = picked === i;
  const isRight = picked !== null && i === correct;
  const isWrong = isPicked && i !== correct;
  if (isRight) return "border-leaf/60 bg-leaf/20 text-cream";
  if (isWrong) return "border-destructive/50 bg-destructive/15 text-cream";
  return "border-gold/25 bg-card/60 text-foreground/85 hover:border-gold/50";
}

export function DailyMissionCard({ mission }: { mission: DailyMission | null | undefined }) {
  const { t } = useTranslation();
  const [answer, setAnswer] = useState<number | null>(null);
  const correct = mission?.correct_index;
  const points = mission?.points ?? 10;
  const answered = answer !== null;
  const isRightAnswer = answered && answer === correct;

  const options = mission?.options ?? [];
  const textsToTranslate = useMemo(
    () => [mission?.question ?? "", ...options],
    [mission?.question, options.join("\u0001")],
  );
  const translated = useAutoTranslate(textsToTranslate);
  const question = translated[0] || (mission?.question ?? t("home.missionLoading"));
  const translatedOptions = translated.slice(1);

  return (
    <div className="card-elev rounded-2xl p-5">
      <div className="flex items-center gap-2">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-gold/15 text-gold">
          <Trophy className="h-5 w-5" />
        </div>
        <h3 className="font-display text-lg font-black text-cream">{t("home.missionTitle")}</h3>
      </div>
      <p className="mt-3 text-sm text-foreground/70">
        {mission?.question ?? t("home.missionLoading")}
      </p>
      <div className="mt-3 flex flex-col gap-2">
        {(mission?.options ?? []).map((label, i) => (
          <button
            key={i}
            onClick={() => setAnswer(i)}
            className={[
              "flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-semibold transition",
              optionClass(answer, correct, i),
            ].join(" ")}
          >
            <span>
              {String.fromCharCode(65 + i)}) {label}
            </span>
            {answered && i === correct && <Check className="h-4 w-4 text-leaf" />}
          </button>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between text-xs">
        <span className="inline-flex items-center gap-1.5 text-gold">
          <Star className="h-3.5 w-3.5 fill-gold" /> {t("home.missionPoints", { points })}
        </span>
        {isRightAnswer && (
          <span className="font-bold text-leaf">{t("home.missionWon", { points })}</span>
        )}
        {answered && !isRightAnswer && (
          <span className="font-semibold text-foreground/70">{t("home.missionRetry")}</span>
        )}
      </div>
    </div>
  );
}

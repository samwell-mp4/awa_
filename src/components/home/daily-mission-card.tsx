import { useMemo, useState } from "react";
import { Check, Star, Trophy } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { DailyMission } from "@/hooks/use-home-data";
import { useAutoTranslate } from "@/hooks/use-auto-translate";

function optionClass(picked: number | null, correct: number | undefined, i: number, isAdult: boolean) {
  const isPicked = picked === i;
  const isRight = picked !== null && i === correct;
  const isWrong = isPicked && i !== correct;
  if (isAdult) {
    if (isRight) return "border-[#2d6a4f] bg-[#2d6a4f]/10 text-[#1b4332] font-bold shadow-xs";
    if (isWrong) return "border-red-300 bg-red-50 text-red-800";
    return "border-[#e8e4dc] bg-[#faf9f6] text-[#1f2937] hover:border-[#2d6a4f]/50 hover:bg-white";
  }
  if (isRight) return "border-leaf/60 bg-leaf/20 text-cream";
  if (isWrong) return "border-destructive/50 bg-destructive/15 text-cream";
  return "border-gold/25 bg-card/60 text-foreground/85 hover:border-gold/50";
}

export function DailyMissionCard({
  mission,
  mode = "adulto",
}: {
  mission: DailyMission | null | undefined;
  mode?: "adulto" | "infantil";
}) {
  const { t } = useTranslation();
  const [answer, setAnswer] = useState<number | null>(null);
  const correct = mission?.correct_index;
  const points = mission?.points ?? 10;
  const answered = answer !== null;
  const isRightAnswer = answered && answer === correct;
  const isAdult = mode === "adulto";

  const options = mission?.options ?? [];
  const textsToTranslate = useMemo(
    () => [mission?.question ?? "", ...options],
    [mission?.question, options.join("\u0001")],
  );
  const translated = useAutoTranslate(textsToTranslate);
  const question = translated[0] || (mission?.question ?? t("home.missionLoading"));
  const translatedOptions = translated.slice(1);

  return (
    <div className={isAdult ? "awa-adult-card-static p-6" : "card-elev rounded-2xl p-5"}>
      <div className="flex items-center gap-2">
        <div className={`grid h-9 w-9 place-items-center rounded-lg ${isAdult ? "bg-[#b47e28]/15 text-[#b47e28]" : "bg-gold/15 text-gold"}`}>
          <Trophy className="h-5 w-5" />
        </div>
        <h3 className={`font-display text-lg font-black ${isAdult ? "text-[#11231b]" : "text-cream"}`}>{t("home.missionTitle")}</h3>
      </div>
      <p className={`mt-3 text-sm leading-relaxed ${isAdult ? "text-[#4b5563]" : "text-foreground/70"}`}>
        {mission?.question ? question : t("home.missionLoading")}
      </p>
      <div className="mt-3 flex flex-col gap-2">
        {options.map((label, i) => (
          <button
            key={i}
            onClick={() => setAnswer(i)}
            className={[
              "flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-semibold transition min-h-[46px]",
              optionClass(answer, correct, i, isAdult),
            ].join(" ")}
          >
            <span>
              {String.fromCharCode(65 + i)}) {translatedOptions[i] ?? label}
            </span>
            {answered && i === correct && <Check className={`h-4 w-4 ${isAdult ? "text-[#2d6a4f]" : "text-leaf"}`} />}
          </button>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between text-xs">
        <span className={`inline-flex items-center gap-1.5 font-bold ${isAdult ? "text-[#b47e28]" : "text-gold"}`}>
          <Star className={`h-3.5 w-3.5 ${isAdult ? "fill-[#b47e28]" : "fill-gold"}`} /> {t("home.missionPoints", { points })}
        </span>
        {isRightAnswer && (
          <span className={`font-bold ${isAdult ? "text-[#2d6a4f]" : "text-leaf"}`}>{t("home.missionWon", { points })}</span>
        )}
        {answered && !isRightAnswer && (
          <span className={`font-semibold ${isAdult ? "text-[#4b5563]" : "text-foreground/70"}`}>{t("home.missionRetry")}</span>
        )}
      </div>
    </div>
  );
}

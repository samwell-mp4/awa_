import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { fetchSaudacoes, pickByHour } from "@/routes/saudacoes";
import { useAutoTranslate } from "@/hooks/use-auto-translate";

export function GreetingOfMoment() {
  const { t } = useTranslation();
  const { data: list = [] } = useQuery({
    queryKey: ["saudacoes"],
    queryFn: fetchSaudacoes,
  });
  const atual = pickByHour(list);
  const [termPtTranslated] = useAutoTranslate([atual?.term_pt ?? ""]);
  if (!atual) return null;
  const hour = new Date().getHours();
  const periodo =
    hour >= 5 && hour <= 11
      ? t("home.bomDia")
      : hour >= 12 && hour <= 17
        ? t("home.boaTarde")
        : t("home.boaNoite");

  return (
    <section className="mt-6">
      <Link
        to="/saudacoes"
        className="card-elev block rounded-2xl p-4 md:p-5 border border-gold/25 bg-gradient-to-br from-forest-deep/50 to-bark/30 hover:border-gold/50 transition"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-leaf">
              {t("home.greetingPrefix")} · {periodo}
            </div>
            <div className="mt-1 font-display text-2xl font-black text-gold truncate">
              {atual.term_indigenous}
            </div>
            <div className="text-sm text-cream/85 truncate">
              {termPtTranslated || atual.term_pt}
              {atual.pronunciation ? ` · ${atual.pronunciation}` : ""}
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-gold shrink-0" />
        </div>
      </Link>
    </section>
  );
}

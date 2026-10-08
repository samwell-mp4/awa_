import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { SiteHeader } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { PageHeader } from "@/components/education/page-header";
import { ProgressBar } from "@/components/education/progress-bar";
import { LessonNavigation } from "@/components/education/lesson-navigation";
import { setLastArea } from "@/lib/last-area";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getNumbersConfig } from "@/lib/numbers.functions";
import { getSiteConfig } from "@/lib/admin-layout.functions";
import { useAutoTranslate } from "@/hooks/use-auto-translate";
import { speak } from "@/lib/speak";
import { Check, Volume2, RotateCw, Trophy, ArrowRight } from "lucide-react";
import kidsBg from "@/assets/kids-menu-bg.jpg";

export const Route = createFileRoute("/aprender-numeros")({
  validateSearch: (search: Record<string, unknown>) => ({
    area: search.area === "adulto" ? ("adulto" as const) : ("infantil" as const),
  }),
  component: AprenderNumeros,
});

const DEFAULT_NUMEROS = [
  { pt: "Um", pat: "Kutkuxú", audio: "/__l5e/assets-v1/08f75264-6b72-4498-bef9-7a75bc90bcb2/numero-01.mp3" },
  { pt: "Dois", pat: "Mokoi", audio: "/__l5e/assets-v1/f4507219-b0ff-4fd9-9ffe-01c9e5379c9a/numero-02.mp3" },
  { pt: "Três", pat: "Kaikui", audio: "/__l5e/assets-v1/ad4c0682-26bb-4876-87bf-be6bd79b3152/numero-03.mp3" },
  { pt: "Quatro", pat: "Bap", audio: "/__l5e/assets-v1/451dcc6d-e165-44b2-9aa8-a0c15f83d787/numero-04.mp3" },
  { pt: "Cinco", pat: "Mankoi", audio: "/__l5e/assets-v1/d246c347-4973-462a-a1fd-00f596650131/numero-05.mp3" },
  { pt: "Seis", pat: "Kutkuxú hãpõhã", audio: "/__l5e/assets-v1/9d117b85-b44e-4fca-b8cf-0f3045fa0a4e/numero-06.mp3" },
  { pt: "Sete", pat: "Mokoi hãpõhã", audio: "/__l5e/assets-v1/59aa9a56-77a4-473a-b59c-8ad620c03921/numero-07.mp3" },
  { pt: "Oito", pat: "Kaikui hãpõhã", audio: "/__l5e/assets-v1/45c268fb-8e7f-4b57-a0f2-00aa2c92397d/numero-08.mp3" },
  { pt: "Nove", pat: "Bap hãpõhã", audio: "/__l5e/assets-v1/1ef7dd5b-a98c-48a6-8114-d93078f0b68d/numero-09.mp3" },
  { pt: "Dez", pat: "Mankoi hãpõhã", audio: "/__l5e/assets-v1/fd7108f9-465d-4e28-bdb5-ab3f4fcde5bd/numero-10.mp3" },
];

function AprenderNumeros() {
  const { t, i18n } = useTranslation();
  const { area } = Route.useSearch();
  const isAdult = area === "adulto";
  const navigate = useNavigate();

  useEffect(() => setLastArea("/aprender-numeros"), []);
  const getFn = useServerFn(getNumbersConfig);

  const { data: config } = useQuery({
    queryKey: ["site_config", "aprender_numeros"],
    queryFn: () => getFn(),
    staleTime: 0,
    gcTime: 0,
  });

  const getSiteConfigFn = useServerFn(getSiteConfig);
  const { data: pageConfig } = useQuery({
    queryKey: ["site_config", "numbers_page_config"],
    queryFn: () => getSiteConfigFn({ data: "numbers_page_config" }),
    staleTime: 0,
  });

  const NUMEROS = useMemo(() => {
    if (config && Array.isArray(config) && config.length > 0) {
      return config;
    }
    return DEFAULT_NUMEROS;
  }, [config]);

  const rawPtValues = useMemo(() => NUMEROS.map((n) => n.pt), [NUMEROS]);
  const translatedPt = useAutoTranslate(rawPtValues);
  const currentLang = (i18n.language || "pt").slice(0, 2).toLowerCase();

  const displayNumeros = useMemo(() => {
    return NUMEROS.map((n, i) => ({
      ...n,
      pt: currentLang === "pt" || currentLang === "pat" ? n.pt : translatedPt[i],
    }));
  }, [NUMEROS, translatedPt, currentLang]);

  // Card opened state & learned state
  const [openedCards, setOpenedCards] = useState<Set<number>>(new Set([0]));
  const [learnedNumbers, setLearnedNumbers] = useState<Set<number>>(new Set());

  useEffect(() => {
    try {
      const saved = localStorage.getItem("awa_kids_learned_numbers");
      if (saved) setLearnedNumbers(new Set(JSON.parse(saved)));
    } catch {}
  }, []);

  const playAudio = (url: string, patText: string) => {
    if (!url) {
      speak(patText, "pt-BR");
      return;
    }
    const audio = new Audio(url);
    audio.play().catch(() => {
      speak(patText, "pt-BR");
    });
  };

  const handleOpenCard = (index: number, audio: string, pat: string) => {
    setOpenedCards((prev) => new Set(prev).add(index));
    playAudio(audio, pat);
  };

  const toggleLearned = (index: number) => {
    setLearnedNumbers((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      try {
        localStorage.setItem("awa_kids_learned_numbers", JSON.stringify([...next]));
      } catch {}
      return next;
    });
  };

  const handleReset = () => {
    setLearnedNumbers(new Set());
    setOpenedCards(new Set([0]));
    try {
      localStorage.removeItem("awa_kids_learned_numbers");
    } catch {}
  };

  const allCompleted = learnedNumbers.size === displayNumeros.length;

  return (
    <div
      className={
        isAdult
          ? "min-h-screen bg-background text-foreground"
          : "relative min-h-screen text-[#fefae0] font-sans"
      }
      style={
        isAdult
          ? undefined
          : {
              backgroundImage: `url(${kidsBg})`,
              backgroundSize: "cover",
              backgroundPosition: "center top",
              backgroundAttachment: "fixed",
            }
      }
    >
      {!isAdult && <div aria-hidden className="awa-bg-scrim pointer-events-none fixed inset-0" />}

      <div className="relative z-10 flex min-h-screen flex-col">
        <SiteHeader mode={isAdult ? "adulto" : "infantil"} />

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-28 pt-4 sm:px-6">
          <PageHeader
            breadcrumbs={[
              { label: "Início", href: isAdult ? "/adulto" : "/infantil" },
              { label: "Aprender Números" },
            ]}
            title={pageConfig?.title || t("numbers.title") || "Números em Patxôhã"}
            description={
              pageConfig?.subtitle ||
              t("numbers.subtitle") ||
              "Aprenda os números de 1 a 10 ouvindo, vendo a escrita e repetindo a pronúncia."
            }
            badge={`${learnedNumbers.size} de ${displayNumeros.length} aprendidos`}
            primaryAction={
              learnedNumbers.size > 0
                ? {
                    label: "Reiniciar Progresso",
                    onClick: handleReset,
                  }
                : undefined
            }
          />

          {/* Progress bar */}
          <div className="mt-6 awa-card-3 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:max-w-md">
              <ProgressBar
                current={learnedNumbers.size}
                total={displayNumeros.length}
                showPercent
              />
            </div>
            <div className="text-xs text-[#d4a373] font-bold">
              {allCompleted ? "🎉 Todos os números aprendidos!" : "Toque em cada número para abrir e aprender"}
            </div>
          </div>

          {/* Completion Celebration Card */}
          {allCompleted && (
            <div className="mt-6 awa-card-1 rounded-2xl p-6 text-center shadow-2xl border border-[#ffd166]">
              <div className="grid h-16 w-16 mx-auto place-items-center rounded-2xl bg-[#ffd166]/20 border border-[#ffd166] text-[#ffd166] mb-3">
                <Trophy className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-black text-[#ffd166]">
                Parabéns, Pequeno Aprendiz!
              </h2>
              <p className="mt-1 text-sm text-[#fefae0]/90 max-w-md mx-auto">
                Você conheceu e praticou os números de 1 a 10 em Patxôhã.
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#251408] border border-[#633916] px-5 py-2.5 text-xs font-bold text-[#ffd166] hover:border-[#ffd166] transition"
                >
                  <RotateCw className="h-4 w-4" />
                  <span>Revisar Novamente</span>
                </button>
                <button
                  onClick={() => navigate({ to: "/trilhas-infantil" })}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#ffd166] to-[#f59e0b] px-6 py-2.5 text-xs font-black text-[#1a0e04] shadow hover:brightness-110 transition"
                >
                  <span>Próxima Atividade: Trilhas</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Educational Number Cards Grid */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {displayNumeros.map((num, i) => {
              const numberVal = i + 1;
              const isOpened = openedCards.has(i);
              const isLearned = learnedNumbers.has(i);

              if (!isOpened) {
                return (
                  <div
                    key={i}
                    onClick={() => handleOpenCard(i, num.audio, num.pat)}
                    className="awa-card-3 group flex min-h-[170px] flex-col items-center justify-center gap-2 rounded-2xl p-4 text-center cursor-pointer transition hover:-translate-y-1 hover:border-[#ffd166]/60 shadow-md"
                  >
                    <span className="font-display text-4xl sm:text-5xl font-black text-[#ffd166] group-hover:scale-105 transition">
                      {numberVal}
                    </span>
                    <span className="text-xs font-bold text-[#d4a373] group-hover:text-[#ffd166]">
                      Toque para aprender
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={i}
                  className={`awa-card-2 flex min-h-[185px] flex-col justify-between rounded-2xl p-4 transition shadow-md border ${
                    isLearned
                      ? "border-[#2a9d8f] bg-gradient-to-b from-[#1b382b] to-[#12241c]"
                      : "border-[#633916] hover:border-[#ffd166]/50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="font-display text-3xl font-black text-[#ffd166]">
                      {numberVal}
                    </span>
                    <button
                      onClick={() => playAudio(num.audio, num.pat)}
                      className="grid h-8 w-8 place-items-center rounded-lg bg-[#251408] border border-[#633916] text-[#ffd166] hover:border-[#ffd166] transition shadow"
                      title="Ouvir pronúncia"
                    >
                      <Volume2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="my-2">
                    <div className="font-display text-base font-black text-[#fefae0] truncate">
                      {num.pat}
                    </div>
                    <div className="text-xs text-[#d4a373] font-semibold mt-0.5 truncate">
                      {num.pt}
                    </div>
                  </div>

                  <button
                    onClick={() => toggleLearned(i)}
                    className={`flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition shadow ${
                      isLearned
                        ? "bg-[#2a9d8f] text-white"
                        : "bg-[#251408] border border-[#633916] text-[#ffd166] hover:border-[#ffd166]"
                    }`}
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>{isLearned ? "✓ Aprendido" : "Marcar aprendido"}</span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Sequential Lesson Navigation at bottom */}
          <div className="mt-10">
            <LessonNavigation
              previousLabel="Aldeia Infantil"
              onPrevious={() => navigate({ to: "/infantil" })}
              nextLabel="Trilhas de Aprendizado"
              onNext={() => navigate({ to: "/trilhas-infantil" })}
              stickyOnMobile
            />
          </div>
        </main>

        <SiteFooter mode={isAdult ? "adulto" : "infantil"} />
      </div>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SiteHeader } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { setLastArea } from "@/lib/last-area";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getNumbersConfig } from "@/lib/numbers.functions";
import { getSiteConfig } from "@/lib/admin-layout.functions";
import { useAutoTranslate } from "@/hooks/use-auto-translate";
import { speak } from "@/lib/speak";

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
  useEffect(() => setLastArea("/aprender-numeros"), []);
  const getFn = useServerFn(getNumbersConfig);

  const { data: config } = useQuery({
    queryKey: ["site_config", "aprender_numeros"], // Match the key used in admin
    queryFn: () => getFn(),
    staleTime: 0,
    gcTime: 0, // Don't keep old data in cache
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

  const rawPtValues = useMemo(() => NUMEROS.map(n => n.pt), [NUMEROS]);
  const translatedPt = useAutoTranslate(rawPtValues);

  const currentLang = (i18n.language || "pt").slice(0, 2).toLowerCase();

  const displayNumeros = useMemo(() => {
    return NUMEROS.map((n, i) => ({
      ...n,
      pt: currentLang === "pt" || currentLang === "pat" ? n.pt : translatedPt[i]
    }));
  }, [NUMEROS, translatedPt, currentLang]);

  const [revealedCards, setRevealedCards] = useState<Set<number>>(new Set());

  const playAudio = (url: string, ptText: string) => {
    if (!url) {
      speak(ptText, "pt-BR");
      return;
    }
    const audio = new Audio(url);
    audio.play().catch((e) => {
      console.warn("Audio play failed, falling back to TTS:", e);
      speak(ptText, "pt-BR");
    });
  };

  const handleCardClick = (index: number, url: string, ptText: string) => {
    setRevealedCards((prev) => {
      if (prev.has(index)) return prev;
      const next = new Set(prev);
      next.add(index);
      return next;
    });
    playAudio(url, ptText);
  };

  const backButtonClass = isAdult
    ? "flex items-center gap-2 rounded-full border border-gold/40 bg-card/60 px-5 py-2 text-sm font-medium text-gold transition hover:bg-gold/10"
    : "flex items-center gap-2 rounded-full border-4 border-amber-300 bg-emerald-800 px-6 py-2 font-display text-lg font-black text-white shadow-xl transition hover:scale-105 active:scale-95";

  const cardClass = isAdult
    ? "group flex min-h-[170px] flex-col items-center justify-center gap-3 rounded-2xl border border-gold/25 bg-card/70 p-6 shadow-[0_10px_30px_-20px_rgba(0,0,0,0.6)] transition hover:-translate-y-1 hover:border-gold/60"
    : "group flex min-h-[190px] flex-col items-center justify-center gap-3 rounded-3xl border-4 border-amber-300 bg-white/95 p-6 shadow-2xl transition hover:-translate-y-2 hover:bg-white";

  const numberClass = isAdult
    ? "font-display text-5xl font-bold text-cream"
    : "font-display text-5xl font-black text-emerald-900";
  const patClass = isAdult
    ? "font-display text-lg font-semibold uppercase tracking-wide text-gold"
    : "font-display text-lg font-black uppercase text-emerald-700";
  const ptClass = isAdult
    ? "text-sm font-medium text-foreground/60"
    : "text-sm font-bold text-emerald-900/60";
  const audioChipClass = isAdult
    ? "mt-2 rounded-full border border-gold/30 bg-gold/10 p-2 text-gold transition group-hover:bg-gold/20"
    : "mt-2 rounded-full bg-emerald-100 p-2 text-emerald-700 group-hover:bg-emerald-200";
  const hiddenNumberClass = isAdult
    ? "font-display text-5xl font-light text-gold/70 transition group-hover:scale-110"
    : "font-display text-6xl font-black text-amber-500 transition group-hover:scale-110";
  const hintClass = isAdult
    ? "text-xs font-medium text-foreground/50"
    : "text-sm font-bold text-emerald-900/60";

  return (
    <div className={isAdult ? "min-h-screen bg-background text-foreground" : "kids-theme min-h-screen bg-[#0b3d2e] text-cream"}>
      <SiteHeader mode={isAdult ? "adulto" : "infantil"} />

      <main className="mx-auto max-w-4xl px-4 py-12 text-center">
        <div className="mb-8 flex justify-between items-center">
          <button onClick={() => window.history.back()} className={backButtonClass}>
            <ArrowLeft className={isAdult ? "h-4 w-4" : "h-5 w-5 stroke-[3]"} />
            <span>{t("common.voltar")}</span>
          </button>
        </div>

        <h1 className={isAdult
          ? "mb-4 font-display text-3xl font-bold text-cream md:text-4xl"
          : "mb-4 font-display text-4xl font-black text-amber-300 md:text-5xl"}>
          {pageConfig?.title || t("numbers.title") || "Números em Patxôhã"}
        </h1>
        <p className={isAdult ? "mb-12 text-base text-foreground/70" : "mb-12 text-lg text-cream/80"}>
          {pageConfig?.subtitle || t("numbers.subtitle") || "Aprenda a contar na língua do povo Pataxó"}
        </p>

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-5">
          {displayNumeros.map((num, i) => {
            const revealed = revealedCards.has(i);
            return (
              <button
                key={i}
                onClick={() => handleCardClick(i, num.audio, num.pt)}
                className={cardClass}
              >
                {revealed ? (
                  <>
                    <span className={numberClass}>{i + 1}</span>
                    <div className="flex flex-col">
                      <span className={patClass}>{num.pat}</span>
                      <span className={ptClass}>{num.pt}</span>
                    </div>
                    <div className={audioChipClass}>
                      <span className="text-xl">🔊</span>
                    </div>
                  </>
                ) : (
                  <>
                    <span className={hiddenNumberClass}>?</span>
                    <span className={hintClass}>
                      {t("numbers.tapToReveal") || "Toque para ver e ouvir"}
                    </span>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

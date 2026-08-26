import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SiteHeader } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { setLastArea } from "@/lib/last-area";
import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getNumbersConfig } from "@/lib/numbers.functions";
import { getSiteConfig } from "@/lib/admin-layout.functions";
import { useAutoTranslate } from "@/hooks/use-auto-translate";
import { speak } from "@/lib/speak";

export const Route = createFileRoute("/aprender-numeros")({
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

  return (
    <div className="kids-theme min-h-screen bg-[#0b3d2e] text-cream">
      <SiteHeader mode="infantil" />

      <main className="w-full px-2 py-6 text-center sm:px-3 md:px-4 md:py-10">
        <div className="mb-8 flex justify-start items-center px-1">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 rounded-full border-4 border-amber-300 bg-emerald-800 px-7 py-4 font-display text-2xl font-black text-white shadow-xl transition hover:scale-105 active:scale-95 sm:px-10 sm:py-5 sm:text-3xl"
          >
            <ArrowLeft className="h-8 w-8 stroke-[3] sm:h-10 sm:w-10" />
            <span>{t("common.voltar")}</span>
          </button>
        </div>

        <h1 className="mb-3 font-display text-6xl font-black leading-tight text-amber-300 sm:text-7xl md:text-8xl lg:text-9xl">
          {pageConfig?.title || t("numbers.title") || "Números em Patxôhã"}
        </h1>
        <p className="mb-12 px-2 text-2xl text-cream/80 sm:text-3xl md:text-4xl">
          {pageConfig?.subtitle || t("numbers.subtitle") || "Aprenda a contar na língua do povo Pataxó"}
        </p>

        <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-5 md:gap-5 lg:gap-6">
          {displayNumeros.map((num, i) => (
            <button
              key={i}
              onClick={() => playAudio(num.audio, num.pt)}
              className="group flex w-full flex-col items-center gap-4 rounded-3xl border-4 border-amber-300 bg-white/95 p-6 shadow-2xl transition hover:-translate-y-2 hover:bg-white sm:p-8 md:p-10"
            >
              <span className="font-display text-7xl font-black leading-none text-emerald-900 sm:text-8xl md:text-9xl lg:text-[10rem]">
                {i + 1}
              </span>
              <div className="flex flex-col">
                <span className="font-display text-2xl font-black uppercase text-emerald-700 sm:text-3xl md:text-4xl">
                  {num.pat}
                </span>
                <span className="text-xl font-bold text-emerald-900/60 sm:text-2xl md:text-3xl">
                  {num.pt}
                </span>
              </div>
              <div className="mt-1 rounded-full bg-emerald-100 p-4 text-emerald-700 group-hover:bg-emerald-200 sm:p-5">
                <span className="text-3xl sm:text-4xl md:text-5xl">🔊</span>
              </div>
            </button>
          ))}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

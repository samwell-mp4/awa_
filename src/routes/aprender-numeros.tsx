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
import { useAutoTranslate } from "@/hooks/use-auto-translate";

export const Route = createFileRoute("/aprender-numeros")({
  component: AprenderNumeros,
});

const DEFAULT_NUMEROS = [
  { pt: "Um", pat: "Kutkuxú", audio: "/__l5e/assets-v1/0a50107c-35c2-459b-9fc1-399a0d2aa745/numero-01.mp3" },
  { pt: "Dois", pat: "Mokoi", audio: "/__l5e/assets-v1/bb18fb52-b9a0-43ea-94c5-92fb76ae4062/numero-02.mp3" },
  { pt: "Três", pat: "Kaikui", audio: "/__l5e/assets-v1/4945f279-0e97-441a-87ed-dd4cab73ac5f/numero-03.mp3" },
  { pt: "Quatro", pat: "Bap", audio: "/__l5e/assets-v1/791b663e-0798-467d-80d5-6ee8c5a8d6cb/numero-04.mp3" },
  { pt: "Cinco", pat: "Mankoi", audio: "/__l5e/assets-v1/ad724985-187f-430e-a325-4f2f8f1f38ce/numero-05.mp3" },
  { pt: "Seis", pat: "Kutkuxú hãpõhã", audio: "/__l5e/assets-v1/972dcad9-9c23-4362-a12d-4ac55bbc2374/numero-06.mp3" },
  { pt: "Sete", pat: "Mokoi hãpõhã", audio: "/__l5e/assets-v1/670234f5-0285-450b-93ab-6626f2ce3cd9/numero-07.mp3" },
  { pt: "Oito", pat: "Kaikui hãpõhã", audio: "/__l5e/assets-v1/98aec23b-5271-4e94-9e2b-85e9ebd0db77/numero-08.mp3" },
  { pt: "Nove", pat: "Bap hãpõhã", audio: "/__l5e/assets-v1/b8705bf6-a6e4-4b13-b82a-3f61933b5e50/numero-09.mp3" },
  { pt: "Dez", pat: "Mankoi hãpõhã", audio: "/__l5e/assets-v1/c0bea070-f28f-4014-a5b7-0ca815f4f09f/numero-10.mp3" },
];

function AprenderNumeros() {
  const { t } = useTranslation();
  useEffect(() => setLastArea("/aprender-numeros"), []);
  const getFn = useServerFn(getNumbersConfig);

  const { data: config } = useQuery({
    queryKey: ["aprender_numeros_content"],
    queryFn: () => getFn(),
  });

  const NUMEROS = useMemo(() => {
    let base = DEFAULT_NUMEROS;
    if (config && Array.isArray(config) && config.length > 0) {
      base = config;
    }
    return base;
  }, [config]);

  const rawPtValues = useMemo(() => NUMEROS.map(n => n.pt), [NUMEROS]);
  const translatedPt = useAutoTranslate(rawPtValues);

  const displayNumeros = useMemo(() => {
    return NUMEROS.map((n, i) => ({
      ...n,
      pt: translatedPt[i]
    }));
  }, [NUMEROS, translatedPt]);

  const playAudio = (url: string) => {
    if (!url) return;
    const audio = new Audio(url);
    audio.play().catch(console.error);
  };

  return (
    <div className="kids-theme min-h-screen bg-[#0b3d2e] text-cream">
      <SiteHeader mode="infantil" />
      
      <main className="mx-auto max-w-4xl px-4 py-12 text-center">
        <button
          onClick={() => window.history.back()}
          className="mb-8 flex items-center gap-2 rounded-full border-4 border-amber-300 bg-emerald-800 px-6 py-2 font-display text-lg font-black text-white shadow-xl transition hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="h-5 w-5 stroke-[3]" />
          <span>{t("common.back") || "Voltar"}</span>
        </button>

        <h1 className="mb-4 font-display text-4xl font-black text-amber-300 md:text-5xl">
          Números em Patxôhã
        </h1>
        <p className="mb-12 text-lg text-cream/80">
          Aprenda a contar na língua do povo Pataxó
        </p>

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-5">
          {displayNumeros.map((num, i) => (
            <button
              key={i}
              onClick={() => playAudio(num.audio)}
              className="group flex flex-col items-center gap-3 rounded-3xl border-4 border-amber-300 bg-white/95 p-6 shadow-2xl transition hover:-translate-y-2 hover:bg-white"
            >
              <span className="font-display text-5xl font-black text-emerald-900">
                {i + 1}
              </span>
              <div className="flex flex-col">
                <span className="font-display text-lg font-black uppercase text-emerald-700">
                  {num.pat}
                </span>
                <span className="text-sm font-bold text-emerald-900/60">
                  {num.pt}
                </span>
              </div>
              <div className="mt-2 rounded-full bg-emerald-100 p-2 text-emerald-700 group-hover:bg-emerald-200">
                <span className="text-xl">🔊</span>
              </div>
            </button>
          ))}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

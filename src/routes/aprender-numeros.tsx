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

export const Route = createFileRoute("/aprender-numeros")({
  component: AprenderNumeros,
});

const DEFAULT_NUMEROS = [
  { pt: "Um", pat: "Kutkuxú", audio: "/audios/numero-01.wav" },
  { pt: "Dois", pat: "Mokoi", audio: "/audios/numero-02.wav" },
  { pt: "Três", pat: "Kaikui", audio: "/audios/numero-03.wav" },
  { pt: "Quatro", pat: "Bap", audio: "/audios/numero-04.wav" },
  { pt: "Cinco", pat: "Mankoi", audio: "/audios/numero-05.wav" },
  { pt: "Seis", pat: "Kutkuxú hãpõhã", audio: "/audios/numero-06.wav" },
  { pt: "Sete", pat: "Mokoi hãpõhã", audio: "/audios/numero-07.wav" },
  { pt: "Oito", pat: "Kaikui hãpõhã", audio: "/audios/numero-08.wav" },
  { pt: "Nove", pat: "Bap hãpõhã", audio: "/audios/numero-09.wav" },
  { pt: "Dez", pat: "Mankoi hãpõhã", audio: "/audios/numero-10.wav" },
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
    if (config && Array.isArray(config) && config.length > 0) return config;
    return DEFAULT_NUMEROS;
  }, [config]);

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
          Painel admin . Colocar adita numero
        </h1>
        <p className="mb-12 text-lg text-cream/80">
          Aprenda a contar na língua do povo Pataxó
        </p>

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-5">
          {NUMEROS.map((num, i) => (
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

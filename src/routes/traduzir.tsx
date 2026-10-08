import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getPaddleEnvironment } from "@/lib/paddle";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeftRight, Loader2, Languages, Home, Volume2, VolumeX } from "lucide-react";
import { translateText } from "@/lib/translate.functions";
import { useLastArea } from "@/lib/last-area";
import { PremiumGate } from "@/components/PremiumGate";
import { speak } from "@/lib/speak";
import { TTSSubtitles } from "@/components/TTSSubtitles";
import { SiteHeader } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { CaptionPlayer } from "@/components/CaptionPlayer";


export const Route = createFileRoute("/traduzir")({
  head: () => ({
    meta: [
      { title: "Tradutor Patxôhã ⇄ Português — AWÃ TECH" },
      { name: "description", content: "Tradutor Português ⇄ Patxôhã gratuito." },
      { property: "og:title", content: "Tradutor Patxôhã ⇄ Português — AWÃ TECH" },
    ],
  }),
  component: TraduzirPage,
});

function TraduzirPage() {
  const { t } = useTranslation();
  const backTo = useLastArea();
  const [direction, setDirection] = useState<"pt-pat" | "pat-pt">("pt-pat");
  const [text, setText] = useState("");
  const [activeCharIndex, setActiveCharIndex] = useState(-1);
  const translate = useServerFn(translateText);



  const m = useMutation({
    mutationFn: async (vars: { text: string; direction: "pt-pat" | "pat-pt" }) =>
      translate({ data: { ...vars, environment: getPaddleEnvironment() } }),
  });

  useEffect(() => {
    if (m.data?.traducao && direction === "pt-pat") {
      // Quando traduz para Patxôhã, fala o resultado automaticamente
      speak(m.data.traducao, "pt-BR", 0.9, () => setActiveCharIndex(0), () => setActiveCharIndex(-1), (idx) => setActiveCharIndex(idx));
    }
  }, [m.data, direction]);


  const swap = () => {
    setDirection((d) => (d === "pt-pat" ? "pat-pt" : "pt-pat"));
    if (m.data?.traducao) setText(m.data.traducao);
    m.reset();
  };

  const fromLabel = direction === "pt-pat" ? t("translator.portugues") : t("translator.patxoha");
  const toLabel = direction === "pt-pat" ? t("translator.patxoha") : t("translator.portugues");

  return (
    <PremiumGate title={t("translator.premiumTitle")} description={t("translator.premiumDescription")}>
    <div className="min-h-screen pb-16 bg-[#f7f6f2] text-[#1f2937]">
      <SiteHeader mode="adulto" />

      <main className="mx-auto max-w-3xl px-4 pt-6 md:pt-10">
        <Link
          to={backTo as "/"}
          className="mb-4 inline-flex items-center gap-2 text-xs font-bold text-[#1b4332] hover:text-[#2d6a4f]"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
        <h1 className="font-display text-3xl md:text-4xl font-black text-[#11231b] mb-2 tracking-tight">
          {t("translator.title")}
        </h1>
        <p className="text-[#4b5563] text-sm md:text-base mb-6">{t("translator.subtitle")}</p>

        <div className="flex items-center justify-center gap-3 mb-6">
          <span className="px-4 py-2 rounded-xl bg-white border border-[#e8e4dc] text-xs font-bold text-[#11231b] shadow-xs">
            {fromLabel}
          </span>
          <button
            onClick={swap}
            aria-label={t("translator.swap")}
            className="p-2.5 rounded-xl bg-[#1b4332] text-white hover:bg-[#2d6a4f] shadow-xs transition-transform active:scale-95"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </button>
          <span className="px-4 py-2 rounded-xl bg-white border border-[#e8e4dc] text-xs font-bold text-[#11231b] shadow-xs">
            {toLabel}
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-white border border-[#e8e4dc] p-5 shadow-xs">
            <label className="text-xs uppercase tracking-wide font-bold text-[#2d6a4f]">{fromLabel}</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={8}
              placeholder={
                direction === "pt-pat"
                  ? t("translator.placeholderPt")
                  : t("translator.placeholderPat")
              }
              className="w-full bg-transparent resize-none outline-none text-[#11231b] placeholder:text-[#9ca3af] mt-2 text-sm leading-relaxed"
            />
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-[#e8e4dc]">
              <span className="text-xs text-[#6b7280]">
                {t("translator.chars", { count: text.length })}
              </span>
              <button
                onClick={() => m.mutate({ text, direction })}
                disabled={!text.trim() || m.isPending}
                id="btn-translate"
                className="px-5 py-2.5 rounded-xl bg-[#1b4332] text-white font-bold text-xs shadow-xs hover:bg-[#2d6a4f] disabled:opacity-50 flex items-center gap-2 transition"
              >
                {m.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("translator.translate")}
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-[#e8e4dc] p-5 shadow-xs min-h-[14rem]">
            <label className="text-xs uppercase tracking-wide font-bold text-[#b47e28]">{toLabel}</label>
            {m.isPending && (
              <div className="flex items-center gap-2 text-[#6b7280] mt-4 text-xs font-medium">
                <Loader2 className="h-4 w-4 animate-spin text-[#1b4332]" /> {t("translator.translating")}
              </div>
            )}
            {m.isError && (
              <p className="text-rose-600 mt-2 text-sm">
                {t("translator.error")}: {(m.error as Error).message}
              </p>
            )}
            {m.data && (
              <div className="mt-2 space-y-3">
                <div className="flex justify-between items-start gap-4">
                  <button
                    onClick={() => {
                      speak(m.data?.traducao || "", "pt-BR", 0.9, () => setActiveCharIndex(0), () => setActiveCharIndex(-1), (idx) => setActiveCharIndex(idx));
                    }}
                    className="group flex flex-1 items-start gap-3 text-left transition hover:opacity-80"
                    title={t("common.speak")}
                  >
                    <div className="flex-1 space-y-2">
                      <p className="text-lg font-bold text-[#11231b] whitespace-pre-wrap group-hover:text-[#1b4332] transition-colors cursor-pointer">
                        {m.data.traducao}
                      </p>
                      <TTSSubtitles text={m.data.traducao} charIndex={activeCharIndex} />
                    </div>
                    <div className="p-2 rounded-xl bg-[#1b4332]/10 text-[#1b4332] group-hover:bg-[#1b4332]/20 transition-colors">
                      {activeCharIndex >= 0 ? <VolumeX className="h-5 w-5 animate-pulse" /> : <Volume2 className="h-5 w-5" />}
                    </div>
                  </button>
                </div>

                {m.data.literal && (
                  <div className="text-xs text-[#2d6a4f] border-t border-[#e8e4dc] pt-2">
                    <span className="font-semibold">{t("translator.wordByWord")}</span> {m.data.literal}
                  </div>
                )}
                {m.data.nota && (
                  <div className="text-xs text-[#6b7280] italic">📜 {m.data.nota}</div>
                )}
              </div>
            )}
            {!m.data && !m.isPending && !m.isError && (
              <p className="text-[#9ca3af] mt-4 text-xs">{t("translator.empty")}</p>
            )}
          </div>
        </div>

        <p className="text-xs text-[#6b7280] mt-6 text-center">
          {t("translator.disclaimer")}
        </p>
      </main>

      <SiteFooter mode="adulto" />
    </div>
    </PremiumGate>
  );
}

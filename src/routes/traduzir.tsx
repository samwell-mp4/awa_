import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { getPaddleEnvironment } from "@/lib/paddle";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeftRight, Loader2, Languages, Home, Mail } from "lucide-react";
import { SiteHeader } from "@/components/home/site-header";
import { translateText } from "@/lib/translate.functions";
import { useLastArea } from "@/lib/last-area";
import { PremiumGate } from "@/components/PremiumGate";

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
  const translate = useServerFn(translateText);

  const m = useMutation({
    mutationFn: async (vars: { text: string; direction: "pt-pat" | "pat-pt" }) =>
      translate({ data: { ...vars, environment: getPaddleEnvironment() } }),
  });


  const swap = () => {
    setDirection((d) => (d === "pt-pat" ? "pat-pt" : "pt-pat"));
    if (m.data?.traducao) setText(m.data.traducao);
    m.reset();
  };

  const fromLabel = direction === "pt-pat" ? t("translator.portugues") : t("translator.patxoha");
  const toLabel = direction === "pt-pat" ? t("translator.patxoha") : t("translator.portugues");

  return (
    <PremiumGate title={t("translator.premiumTitle")} description={t("translator.premiumDescription")}>
    <div className="min-h-screen pb-16 text-foreground">
        <SiteHeader showBackButton title={t("translator.title")} />

      <main className="mx-auto max-w-3xl px-4 pt-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gold mb-2">
          {t("translator.title")}
        </h1>
        <p className="text-foreground/70 mb-8">{t("translator.subtitle")}</p>

        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="px-4 py-2 rounded-full bg-forest-deep/60 border border-gold/30 text-sm font-semibold">
            {fromLabel}
          </span>
          <button
            onClick={swap}
            aria-label={t("translator.swap")}
            className="p-2 rounded-full bg-gold text-forest-deep hover:scale-110 transition-transform"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </button>
          <span className="px-4 py-2 rounded-full bg-forest-deep/60 border border-gold/30 text-sm font-semibold">
            {toLabel}
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-forest-deep/40 border border-gold/20 p-4">
            <label className="text-xs uppercase tracking-wide text-leaf">{fromLabel}</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={8}
              placeholder={
                direction === "pt-pat"
                  ? t("translator.placeholderPt")
                  : t("translator.placeholderPat")
              }
              className="w-full bg-transparent resize-none outline-none text-foreground placeholder:text-foreground/40 mt-2"
            />
            <div className="flex justify-between items-center mt-3">
              <span className="text-xs text-foreground/50">
                {t("translator.chars", { count: text.length })}
              </span>
              <button
                onClick={() => m.mutate({ text, direction })}
                disabled={!text.trim() || m.isPending}
                className="px-4 py-2 rounded-full bg-gold text-forest-deep font-bold disabled:opacity-50 flex items-center gap-2"
              >
                {m.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("translator.translate")}
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-forest-deep/60 border border-gold/30 p-4 min-h-[14rem]">
            <label className="text-xs uppercase tracking-wide text-gold">{toLabel}</label>
            {m.isPending && (
              <div className="flex items-center gap-2 text-foreground/60 mt-4">
                <Loader2 className="h-4 w-4 animate-spin" /> {t("translator.translating")}
              </div>
            )}
            {m.isError && (
              <p className="text-red-300 mt-2 text-sm">
                {t("translator.error")}: {(m.error as Error).message}
              </p>
            )}
            {m.data && (
              <div className="mt-2 space-y-3">
                <p className="text-lg text-foreground whitespace-pre-wrap">
                  {m.data.traducao}
                </p>

                {m.data.literal && (
                  <div className="text-xs text-leaf border-t border-gold/10 pt-2">
                    <span className="font-semibold">{t("translator.wordByWord")}</span> {m.data.literal}
                  </div>
                )}
                {m.data.nota && (
                  <div className="text-xs text-foreground/60 italic">📜 {m.data.nota}</div>
                )}
              </div>
            )}
            {!m.data && !m.isPending && !m.isError && (
              <p className="text-foreground/40 mt-4 text-sm">{t("translator.empty")}</p>
            )}
          </div>
        </div>

        <p className="text-xs text-foreground/50 mt-6 text-center">
          {t("translator.disclaimer")}
        </p>

        <div className="mt-8 flex justify-center">
          <a
            href={t("translator.contact.link")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-forest-deep/60 px-5 py-2.5 text-sm font-semibold text-gold transition hover:bg-gold/10 hover:border-gold/50"
          >
            <Mail className="h-4 w-4" />
            {t("translator.contact.google")}
          </a>
        </div>
      </main>
    </div>
    </PremiumGate>
  );
}

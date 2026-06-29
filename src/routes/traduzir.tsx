import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeftRight, Loader2, Languages, Home, Volume2, Square } from "lucide-react";
import { translateText } from "@/lib/translate.functions";
import { speakText } from "@/lib/tts.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/traduzir")({
  head: () => ({
    meta: [
      { title: "Tradutor Patxôhã ⇄ Português — AWÃ TECH" },
      {
        name: "description",
        content:
          "Tradutor bidirecional entre Português e Patxôhã (Pataxó), usando o dicionário completo da plataforma AWÃ TECH.",
      },
      { property: "og:title", content: "Tradutor Patxôhã ⇄ Português — AWÃ TECH" },
    ],
  }),
  component: TraduzirPage,
});

function TraduzirPage() {
  const [direction, setDirection] = useState<"pt-pat" | "pat-pt">("pt-pat");
  const [text, setText] = useState("");
  const translate = useServerFn(translateText);

  const m = useMutation({
    mutationFn: async (vars: { text: string; direction: "pt-pat" | "pat-pt" }) =>
      translate({ data: vars }),
  });

  const swap = () => {
    setDirection((d) => (d === "pt-pat" ? "pat-pt" : "pt-pat"));
    if (m.data?.traducao) setText(m.data.traducao);
    m.reset();
  };

  const fromLabel = direction === "pt-pat" ? "Português" : "Patxôhã";
  const toLabel = direction === "pt-pat" ? "Patxôhã" : "Português";

  return (
    <div className="min-h-screen pb-16 text-foreground">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[oklch(0.18_0.04_145/0.7)] border-b border-gold/20">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 text-gold font-bold">
            <Home className="h-4 w-4" /> AWÃ TECH
          </Link>
          <div className="flex items-center gap-2 text-leaf">
            <Languages className="h-5 w-5" />
            <span className="text-sm font-medium">Tradutor</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pt-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gold mb-2">
          Tradutor Patxôhã ⇄ Português
        </h1>
        <p className="text-foreground/70 mb-8">
          Tradução assistida por IA usando o dicionário oficial da plataforma.
        </p>

        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="px-4 py-2 rounded-full bg-forest-deep/60 border border-gold/30 text-sm font-semibold">
            {fromLabel}
          </span>
          <button
            onClick={swap}
            aria-label="Inverter direção"
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
                  ? "Digite uma palavra ou frase em português..."
                  : "Digite uma palavra ou frase em Patxôhã..."
              }
              className="w-full bg-transparent resize-none outline-none text-foreground placeholder:text-foreground/40 mt-2"
            />
            <div className="flex justify-between items-center mt-3">
              <span className="text-xs text-foreground/50">{text.length} caracteres</span>
              <button
                onClick={() => m.mutate({ text, direction })}
                disabled={!text.trim() || m.isPending}
                className="px-4 py-2 rounded-full bg-gold text-forest-deep font-bold disabled:opacity-50 flex items-center gap-2"
              >
                {m.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Traduzir
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-forest-deep/60 border border-gold/30 p-4 min-h-[14rem]">
            <label className="text-xs uppercase tracking-wide text-gold">{toLabel}</label>
            {m.isPending && (
              <div className="flex items-center gap-2 text-foreground/60 mt-4">
                <Loader2 className="h-4 w-4 animate-spin" /> Traduzindo...
              </div>
            )}
            {m.isError && (
              <p className="text-red-300 mt-2 text-sm">
                Erro: {(m.error as Error).message}
              </p>
            )}
            {m.data && (
              <div className="mt-2 space-y-3">
                <p className="text-lg text-foreground whitespace-pre-wrap">
                  {m.data.traducao}
                </p>
                {m.data.literal && (
                  <div className="text-xs text-leaf border-t border-gold/10 pt-2">
                    <span className="font-semibold">Palavra por palavra:</span> {m.data.literal}
                  </div>
                )}
                {m.data.nota && (
                  <div className="text-xs text-foreground/60 italic">📜 {m.data.nota}</div>
                )}
              </div>
            )}
            {!m.data && !m.isPending && !m.isError && (
              <p className="text-foreground/40 mt-4 text-sm">
                A tradução aparecerá aqui.
              </p>
            )}
          </div>
        </div>

        <p className="text-xs text-foreground/50 mt-6 text-center">
          ⚠️ Tradução assistida por IA — palavras ausentes do dicionário são marcadas com [?].
        </p>
      </main>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { askAkua } from "@/lib/akua-chat.functions";
import { ArrowLeft, Send, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/professor")({
  head: () => ({
    meta: [
      { title: "Professor Akuã — AWÃ TECH" },
      {
        name: "description",
        content:
          "Converse com o Professor Akuã, mestre virtual de línguas indígenas brasileiras. Traduções e ensino baseados no dicionário Patxôhã.",
      },
    ],
  }),
  component: ProfessorPage,
});

type Msg = { role: "user" | "assistant"; content: string };

const SUGESTOES = [
  "Como se diz 'bom dia' em Patxôhã?",
  "Me ensine uma saudação tradicional",
  "Traduza: 'A floresta é nossa casa'",
  "Quais palavras você conhece para 'água'?",
];

function ProfessorPage() {
  const ask = useServerFn(askAkua);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "🌿 Awere! Eu sou o Professor Akuã. Tenho o dicionário Patxôhã inteiro na ponta da língua. Pergunte traduções, peça frases ou explore palavras da nossa cultura.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const { reply } = await ask({ data: { messages: next } });
      setMessages([...next, { role: "assistant", content: reply }]);
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao falar com Akuã");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 border-b border-gold/20 bg-[oklch(0.18_0.04_145/0.75)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3 md:px-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-gold hover:underline">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
          <div className="flex items-center gap-2 text-cream font-display font-black">
            <Sparkles className="h-5 w-5 text-leaf" /> Professor Akuã
          </div>
          <span className="w-14" />
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-3xl px-4 md:px-8 pb-40 pt-6">
        <div className="space-y-4">
          {messages.map((m, i) => (
            <Bubble key={i} role={m.role} content={m.content} />
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-sm text-foreground/60">
              <Loader2 className="h-4 w-4 animate-spin" /> Akuã está pensando...
            </div>
          )}
          <div ref={endRef} />
        </div>

        {messages.length <= 1 && (
          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            {SUGESTOES.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="text-left rounded-xl border border-gold/20 bg-card/40 px-3 py-2 text-sm text-foreground/80 hover:border-gold/50 hover:text-cream"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </main>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="fixed inset-x-0 bottom-0 z-30 border-t border-gold/20 bg-[oklch(0.18_0.04_145/0.85)] backdrop-blur-xl"
      >
        <div className="mx-auto flex max-w-3xl items-end gap-2 px-4 py-3 md:px-8">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder="Pergunte ao Professor Akuã..."
            rows={1}
            className="flex-1 resize-none rounded-2xl border border-gold/25 bg-card/60 px-4 py-3 text-sm text-cream placeholder:text-foreground/40 focus:outline-none focus:border-gold/60 max-h-32"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gold text-bark disabled:opacity-40"
            aria-label="Enviar"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </button>
        </div>
      </form>
    </div>
  );
}

function Bubble({ role, content }: Msg) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-gold/20 text-cream border border-gold/30"
            : "bg-card/60 text-foreground/90 border border-leaf/20"
        }`}
      >
        {content}
      </div>
    </div>
  );
}

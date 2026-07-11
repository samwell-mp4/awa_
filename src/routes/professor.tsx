import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { getPaddleEnvironment } from "@/lib/paddle";
import { useEffect, useRef, useState } from "react";
import { askAkua } from "@/lib/akua-chat.functions";
import { speakText } from "@/lib/tts.functions";
import { ArrowLeft, Send, Sparkles, Loader2, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { PremiumGate } from "@/components/PremiumGate";

export const Route = createFileRoute("/professor")({
  head: () => ({
    meta: [
      { title: "Professor Akuã — AWÃ TECH" },
      { name: "description", content: "Professor Akuã — chat com IA em Patxôhã (Premium)." },
    ],
  }),
  component: () => (
    <PremiumGate title="Professor Akuã (Premium)" description="Converse com o mestre virtual de Patxôhã sem limites. Recurso exclusivo para assinantes.">
      <ProfessorPage />
    </PremiumGate>
  ),
});

type Msg = { role: "user" | "assistant"; content: string };

const SUGESTOES = [
  "Como se diz 'bom dia' em Patxôhã?",
  "Como pronunciar as palavras nasais (ã, õ)?",
  "Me ensine as saudações do dia (manhã, tarde, noite)",
  "Posso usar Patxôhã fora da aldeia?",
];

function ProfessorPage() {
  const ask = useServerFn(askAkua);
  const speak = useServerFn(speakText);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "🌿 Olá! Eu sou o **Professor Akuã**. Venho da terra, da floresta e da memória dos antepassados.\n\nEstou aqui para ensinar, responder dúvidas e acompanhar você em cada passo para conhecer e falar a língua **Patxôhã**.\n\nAqui não é só palavra: é respeito, é origem, é manter viva a nossa voz! 🪶✨",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function autoSpeak(audio: HTMLAudioElement, text: string) {
    try {
      const clean = text.replace(/\[\/?ex\]/g, "").replace(/\|\|/g, ", ");
      const r = await speak({ data: { text: clean, environment: getPaddleEnvironment() } });
      if (r.error || !r.audio_base64) return;
      audioRef.current?.pause();
      audio.src = base64ToBlobUrl(r.audio_base64, r.mime);
      audioRef.current = audio;
      await audio.play().catch(() => {});
    } catch {
      /* silencioso: se falhar, mantém apenas o texto */
    }
  }

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;
    // Cria o Audio dentro do gesto do usuário para liberar autoplay
    const audio = new Audio();
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const { reply } = await ask({ data: { messages: next, environment: getPaddleEnvironment() } });
      setMessages([...next, { role: "assistant", content: reply }]);
      void autoSpeak(audio, reply);
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
  const speak = useServerFn(speakText);
  const [busy, setBusy] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  async function playText(text: string) {
    if (busy) return;
    try {
      setBusy(true);
      const r = await speak({ data: { text, environment: getPaddleEnvironment() } });
      if (r.error || !r.audio_base64) {
        throw new Error(r.message ?? "Não foi possível gerar áudio");
      }
      const audio = new Audio(`data:${r.mime};base64,${r.audio_base64}`);
      audioRef.current?.pause();
      audioRef.current = audio;
      await audio.play();
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao gerar áudio");
    } finally {
      setBusy(false);
    }
  }

  // Parse [ex]indígena || português[/ex] into inline example cards.
  const parts: Array<{ type: "text"; value: string } | { type: "ex"; pt: string; pat: string }> = [];
  const re = /\[ex\]([\s\S]*?)\|\|([\s\S]*?)\[\/ex\]/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    if (m.index > last) parts.push({ type: "text", value: content.slice(last, m.index) });
    parts.push({ type: "ex", pat: m[1].trim(), pt: m[2].trim() });
    last = m.index + m[0].length;
  }
  if (last < content.length) parts.push({ type: "text", value: content.slice(last) });

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-gold/20 text-cream border border-gold/30"
            : "bg-card/60 text-foreground/90 border border-leaf/20"
        }`}
      >
        <div className="space-y-2">
          {parts.map((p, i) =>
            p.type === "text" ? (
              <span key={i} className="whitespace-pre-wrap">{p.value}</span>
            ) : (
              <div
                key={i}
                className="my-1 rounded-xl border border-gold/30 bg-forest-deep/40 px-3 py-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-display text-base text-gold">{p.pat}</div>
                  <button
                    onClick={() => playText(p.pat)}
                    disabled={busy}
                    className="shrink-0 grid h-7 w-7 place-items-center rounded-full bg-leaf/20 text-leaf hover:bg-leaf/30 disabled:opacity-50"
                    aria-label={`Ouvir ${p.pat}`}
                    title="Ouvir pronúncia"
                  >
                    {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Volume2 className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <div className="text-xs text-foreground/70 mt-0.5">{p.pt}</div>
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
}

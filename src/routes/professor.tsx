import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { getPaddleEnvironment } from "@/lib/paddle";
import { useEffect, useMemo, useRef, useState } from "react";
import { askAkua } from "@/lib/akua-chat.functions";
import { speakText } from "@/lib/tts.functions";
import { base64ToBlobUrl } from "@/lib/audio-play";
import {
  ArrowLeft,
  Send,
  Loader2,
  Volume2,
  Copy,
  Check,
  RefreshCcw,
  BookOpen,
  Sunrise,
  Users,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import { PremiumGate } from "@/components/PremiumGate";
import { useLastArea } from "@/lib/last-area";
import { useLang, type Lang } from "@/lib/pick-lang";
import logoSrc from "@/assets/awa-tech-logo.png";

export const Route = createFileRoute("/professor")({
  head: () => ({
    meta: [
      { title: "Professor Akuã — AWÃ TECH" },
      { name: "description", content: "Converse com o mestre virtual de Patxôhã. Aprenda pronúncia, vocabulário e cultura com o Professor Akuã." },
      { property: "og:title", content: "Professor Akuã — Mestre de Patxôhã" },
      { property: "og:description", content: "Aprenda Patxôhã com um mestre virtual, com áudio, exemplos e cultura indígena." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <PremiumGate
      title="Professor Akuã (Premium)"
      description="Converse com o mestre virtual de Patxôhã sem limites. Recurso exclusivo para assinantes."
    >
      <ProfessorPage />
    </PremiumGate>
  ),
});

type Msg = { role: "user" | "assistant"; content: string; at?: number };

type L10n = {
  welcome: string;
  subtitle: string;
  newChat: string;
  suggestionsTitle: string;
  placeholder: string;
  hint: string;
  copy: string;
  copied: string;
  listen: string;
  send: string;
  suggestions: { label: string; prompt: string }[];
  errorSpeak: string;
  errorAudio: string;
  copyFail: string;
  localeTime: string;
};

const L10N: Record<Lang, L10n> = {
  pt: {
    welcome:
      "Kanhgág! Sou o **Professor Akuã**, mestre virtual da língua **Patxôhã**.\n\nEstou aqui para ensinar palavras, expressões, pronúncia e a cultura do povo Pataxó. Pergunte à vontade — quando eu ensinar uma palavra, você pode ouvir a pronúncia clicando no ícone de áudio.",
    subtitle: "Mestre de Patxôhã · Online",
    newChat: "Nova conversa",
    suggestionsTitle: "Sugestões para começar",
    placeholder: "Pergunte ao Professor Akuã…",
    hint: "Enter para enviar · Shift + Enter para nova linha",
    copy: "Copiar",
    copied: "Copiado",
    listen: "Ouvir",
    send: "Enviar",
    suggestions: [
      { label: "Saudações do dia", prompt: "Me ensine as saudações usadas de manhã, à tarde e à noite em Patxôhã." },
      { label: "Vocabulário", prompt: "Ensine 5 palavras essenciais para quem está começando a aprender Patxôhã." },
      { label: "Família", prompt: "Como se dizem os nomes dos membros da família (pai, mãe, filho, irmão) em Patxôhã?" },
      { label: "Cultura Pataxó", prompt: "Fale sobre a história e a importância do povo Pataxó para o Brasil." },
    ],
    errorSpeak: "Não foi possível falar com Akuã agora.",
    errorAudio: "Erro ao gerar áudio",
    copyFail: "Não foi possível copiar.",
    localeTime: "pt-BR",
  },
  en: {
    welcome:
      "Kanhgág! I am **Professor Akuã**, the virtual master of the **Patxôhã** language.\n\nI am here to teach you words, expressions, pronunciation and the culture of the Pataxó people. Ask freely — when I teach a word, you can hear it by clicking the audio icon.",
    subtitle: "Patxôhã Master · Online",
    newChat: "New chat",
    suggestionsTitle: "Suggestions to get started",
    placeholder: "Ask Professor Akuã…",
    hint: "Enter to send · Shift + Enter for a new line",
    copy: "Copy",
    copied: "Copied",
    listen: "Listen",
    send: "Send",
    suggestions: [
      { label: "Daily greetings", prompt: "Teach me the greetings used in the morning, afternoon and evening in Patxôhã." },
      { label: "Vocabulary", prompt: "Teach me 5 essential words for someone starting to learn Patxôhã." },
      { label: "Family", prompt: "How do you say the family members (father, mother, son, brother) in Patxôhã?" },
      { label: "Pataxó Culture", prompt: "Tell me about the history and importance of the Pataxó people for Brazil." },
    ],
    errorSpeak: "Could not reach Akuã right now.",
    errorAudio: "Error generating audio",
    copyFail: "Could not copy.",
    localeTime: "en-US",
  },
  es: {
    welcome:
      "¡Kanhgág! Soy el **Profesor Akuã**, maestro virtual de la lengua **Patxôhã**.\n\nEstoy aquí para enseñarte palabras, expresiones, pronunciación y la cultura del pueblo Pataxó. Pregunta con confianza — cuando enseñe una palabra, podrás escucharla haciendo clic en el ícono de audio.",
    subtitle: "Maestro de Patxôhã · En línea",
    newChat: "Nueva conversación",
    suggestionsTitle: "Sugerencias para empezar",
    placeholder: "Pregunta al Profesor Akuã…",
    hint: "Enter para enviar · Shift + Enter para nueva línea",
    copy: "Copiar",
    copied: "Copiado",
    listen: "Escuchar",
    send: "Enviar",
    suggestions: [
      { label: "Saludos del día", prompt: "Enséñame los saludos usados por la mañana, la tarde y la noche en Patxôhã." },
      { label: "Vocabulario", prompt: "Enséñame 5 palabras esenciales para quien empieza a aprender Patxôhã." },
      { label: "Familia", prompt: "¿Cómo se dicen los miembros de la familia (padre, madre, hijo, hermano) en Patxôhã?" },
      { label: "Cultura Pataxó", prompt: "Cuéntame sobre la historia y la importancia del pueblo Pataxó para Brasil." },
    ],
    errorSpeak: "No fue posible hablar con Akuã ahora.",
    errorAudio: "Error al generar audio",
    copyFail: "No fue posible copiar.",
    localeTime: "es-ES",
  },
  pat: {
    welcome:
      "Kanhgág! Arnã **Professor Akuã**, mestre virtual da língua **Patxôhã**.\n\nEstou aqui para ensinar o Patxôhã, parente. Awere doy!",
    subtitle: "Patxôhã · Online",
    newChat: "Txuhap!",
    suggestionsTitle: "Sugestões",
    placeholder: "Pergunte ao Professor Akuã…",
    hint: "Enter · Shift + Enter",
    copy: "Copiar",
    copied: "Copiado",
    listen: "Ouvir",
    send: "Enviar",
    suggestions: [
      { label: "Saudações", prompt: "Me ensine as saudações do dia em Patxôhã." },
      { label: "Palavras", prompt: "Ensine 5 palavras essenciais em Patxôhã." },
      { label: "Família", prompt: "Como se diz família em Patxôhã?" },
      { label: "Cultura Pataxó", prompt: "Fale sobre o povo Pataxó." },
    ],
    errorSpeak: "Ãhô — não foi possível falar com Akuã agora.",
    errorAudio: "Erro ao gerar áudio",
    copyFail: "Não foi possível copiar.",
    localeTime: "pt-BR",
  },
};

const SUGGESTION_ICONS = [Sunrise, BookOpen, Users, Globe];

function ProfessorPage() {
  const backTo = useLastArea();
  const ask = useServerFn(askAkua);
  const speak = useServerFn(speakText);
  const lang = useLang();
  const t = L10N[lang];

  const makeWelcome = (): Msg => ({ role: "assistant", content: t.welcome, at: Date.now() });

  const [messages, setMessages] = useState<Msg[]>(() => [makeWelcome()]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // When the UI language changes and no user message was sent, refresh the welcome.
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length <= 1) return [{ role: "assistant", content: t.welcome, at: Date.now() }];
      return prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [input]);

  async function autoSpeak(audio: HTMLAudioElement, text: string) {
    try {
      const clean = text.replace(/\[\/?ex\]/g, "").replace(/\|\|/g, ", ").replace(/\*\*/g, "");
      const r = await speak({ data: { text: clean, environment: getPaddleEnvironment() } });
      if (r.error || !r.audio_base64) return;
      audioRef.current?.pause();
      audio.src = base64ToBlobUrl(r.audio_base64, r.mime);
      audioRef.current = audio;
      await audio.play().catch(() => {});
    } catch {
      /* silencioso: mantém apenas o texto */
    }
  }

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;
    const audio = new Audio();
    const next = [...messages, { role: "user" as const, content, at: Date.now() }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const { reply } = await ask({ data: { messages: next, environment: getPaddleEnvironment(), lang } });
      setMessages([...next, { role: "assistant", content: reply, at: Date.now() }]);
      void autoSpeak(audio, reply);
    } catch (e: any) {
      toast.error(e.message ?? t.errorSpeak);
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  }

  function resetConversation() {
    audioRef.current?.pause();
    setMessages([makeWelcome()]);
    setInput("");
    textareaRef.current?.focus();
  }

  const isEmpty = messages.length <= 1;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--gradient-forest)]">
      <header className="sticky top-0 z-40 border-b border-gold/20 bg-[oklch(0.16_0.04_145/0.9)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3 md:px-8">
          <Link
            to={backTo as "/"}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold/90 hover:text-gold transition"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>

          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={logoSrc}
                alt=""
                className="h-9 w-9 rounded-full border border-gold/40 object-cover shadow-md"
              />
              <span
                aria-hidden
                className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[oklch(0.16_0.04_145)]"
              />
            </div>
            <div className="leading-tight">
              <div className="font-display text-sm font-black text-cream md:text-base">
                Professor Akuã
              </div>
              <div className="text-[10.5px] font-semibold uppercase tracking-wider text-emerald-300/80">
                {t.subtitle}
              </div>
            </div>
          </div>

          <button
            onClick={resetConversation}
            disabled={isEmpty && !loading}
            className="inline-flex items-center gap-1.5 rounded-full border border-gold/25 bg-card/50 px-3 py-1.5 text-[11px] font-bold text-foreground/80 transition hover:border-gold/50 hover:text-cream disabled:opacity-40"
            title={t.newChat}
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t.newChat}</span>
          </button>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-3xl px-4 md:px-8 pb-44 pt-6">
        <div className="space-y-5">
          {messages.map((m, i) => (
            <Bubble key={i} msg={m} isLast={i === messages.length - 1} />
          ))}
          {loading && <TypingIndicator />}
          <div ref={endRef} />
        </div>

        {isEmpty && !loading && (
          <section className="mt-8">
            <div className="mb-3 text-xs font-bold uppercase tracking-wider text-foreground/50">
              {t.suggestionsTitle}
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {t.suggestions.map((s, idx) => {
                const Icon = SUGGESTION_ICONS[idx] ?? BookOpen;
                return (
                  <button
                    key={s.label}
                    onClick={() => send(s.prompt)}
                    className="group flex items-start gap-3 rounded-2xl border border-gold/20 bg-card/40 p-3.5 text-left transition hover:border-gold/50 hover:bg-card/60"
                  >
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-leaf/15 text-leaf transition group-hover:bg-leaf/25">
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-cream">{s.label}</div>
                      <div className="mt-0.5 line-clamp-2 text-xs text-foreground/65">{s.prompt}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </main>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="fixed inset-x-0 bottom-0 z-30 border-t border-gold/20 bg-[oklch(0.16_0.04_145/0.92)] backdrop-blur-xl"
      >
        <div className="mx-auto flex max-w-3xl items-end gap-2 px-4 py-3 md:px-8">
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder={t.placeholder}
              rows={1}
              maxLength={1000}
              className="w-full resize-none rounded-2xl border border-gold/25 bg-card/70 px-4 py-3 pr-14 text-sm text-cream placeholder:text-foreground/40 focus:outline-none focus:border-gold/60 focus:ring-2 focus:ring-gold/20 transition"
            />
            {input.length > 800 && (
              <div className="absolute right-3 bottom-1.5 text-[10px] font-semibold text-foreground/50">
                {input.length}/1000
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gold text-forest-deep shadow-lg shadow-gold/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
            aria-label={t.send}
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </button>
        </div>
        <div className="pb-2 text-center text-[10px] text-foreground/40">
          {t.hint}
        </div>
      </form>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-2 rounded-2xl border border-leaf/20 bg-card/50 px-4 py-3">
        <span className="h-2 w-2 animate-bounce rounded-full bg-leaf [animation-delay:-0.3s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-leaf [animation-delay:-0.15s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-leaf" />
      </div>
    </div>
  );
}

// --- Message rendering ------------------------------------------------------

type InlineToken =
  | { type: "text"; value: string }
  | { type: "bold"; value: string }
  | { type: "italic"; value: string }
  | { type: "code"; value: string };

function tokenizeInline(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  const re = /(\*\*([^*\n]+)\*\*|`([^`\n]+)`|\*([^*\n]+)\*)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) tokens.push({ type: "text", value: text.slice(last, m.index) });
    if (m[2]) tokens.push({ type: "bold", value: m[2] });
    else if (m[3]) tokens.push({ type: "code", value: m[3] });
    else if (m[4]) tokens.push({ type: "italic", value: m[4] });
    last = m.index + m[0].length;
  }
  if (last < text.length) tokens.push({ type: "text", value: text.slice(last) });
  return tokens;
}

function renderInline(text: string, keyPrefix: string) {
  return tokenizeInline(text).map((tok, i) => {
    const k = `${keyPrefix}-${i}`;
    if (tok.type === "bold") return <strong key={k} className="font-bold text-cream">{tok.value}</strong>;
    if (tok.type === "italic") return <em key={k} className="italic text-cream/90">{tok.value}</em>;
    if (tok.type === "code")
      return (
        <code key={k} className="rounded bg-forest-deep/60 px-1.5 py-0.5 font-mono text-[0.85em] text-gold">
          {tok.value}
        </code>
      );
    return <span key={k}>{tok.value}</span>;
  });
}

type Block =
  | { type: "paragraph"; text: string }
  | { type: "bullets"; items: string[] }
  | { type: "example"; pat: string; pt: string };

function parseBlocks(content: string): Block[] {
  // Extract [ex]…||…[/ex] as example blocks; split the rest into paragraphs / bullet groups.
  const blocks: Block[] = [];
  const re = /\[ex\]([\s\S]*?)\|\|([\s\S]*?)\[\/ex\]/g;
  let last = 0;
  let m: RegExpExecArray | null;
  const pushText = (raw: string) => {
    const chunks = raw.split(/\n{2,}/);
    for (const chunk of chunks) {
      const trimmed = chunk.trim();
      if (!trimmed) continue;
      const lines = trimmed.split("\n").map((l) => l.trim());
      const isList = lines.every((l) => /^([-*•]\s+|\d+[.)]\s+)/.test(l));
      if (isList && lines.length > 1) {
        blocks.push({
          type: "bullets",
          items: lines.map((l) => l.replace(/^([-*•]\s+|\d+[.)]\s+)/, "")),
        });
      } else {
        blocks.push({ type: "paragraph", text: trimmed });
      }
    }
  };
  while ((m = re.exec(content)) !== null) {
    if (m.index > last) pushText(content.slice(last, m.index));
    blocks.push({ type: "example", pat: m[1].trim(), pt: m[2].trim() });
    last = m.index + m[0].length;
  }
  if (last < content.length) pushText(content.slice(last));
  return blocks;
}

function Bubble({ msg, isLast }: { msg: Msg; isLast: boolean }) {
  const lang = useLang();
  const t = L10N[lang];
  const isUser = msg.role === "user";
  const speak = useServerFn(speakText);
  const [audioBusy, setAudioBusy] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blocks = useMemo(() => parseBlocks(msg.content), [msg.content]);

  async function playText(text: string, key: string) {
    if (audioBusy) return;
    try {
      setAudioBusy(key);
      const r = await speak({ data: { text, environment: getPaddleEnvironment() } });
      if (r.error || !r.audio_base64) throw new Error(r.message ?? t.errorAudio);
      const audio = new Audio(base64ToBlobUrl(r.audio_base64, r.mime));
      audio.preload = "auto";
      audioRef.current?.pause();
      audioRef.current = audio;
      await audio.play();
    } catch (e: any) {
      toast.error(e.message ?? t.errorAudio);
    } finally {
      setAudioBusy(null);
    }
  }

  async function copyMessage() {
    try {
      const plain = msg.content.replace(/\[ex\]([^|]+)\|\|([^\]]+)\[\/ex\]/g, "$1 ($2)").replace(/\*\*/g, "");
      await navigator.clipboard.writeText(plain);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error(t.copyFail);
    }
  }

  const time = msg.at ? new Date(msg.at).toLocaleTimeString(t.localeTime, { hour: "2-digit", minute: "2-digit" }) : "";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex max-w-[88%] flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
            isUser
              ? "border border-gold/40 bg-gold/15 text-cream"
              : "border border-leaf/25 bg-card/70 text-foreground/90"
          }`}
        >
          <div className="space-y-2.5">
            {blocks.map((b, i) => {
              if (b.type === "paragraph") {
                return (
                  <p key={i} className="whitespace-pre-wrap">
                    {renderInline(b.text, `p${i}`)}
                  </p>
                );
              }
              if (b.type === "bullets") {
                return (
                  <ul key={i} className="ml-1 space-y-1">
                    {b.items.map((item, j) => (
                      <li key={j} className="flex gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold/80" />
                        <span>{renderInline(item, `b${i}-${j}`)}</span>
                      </li>
                    ))}
                  </ul>
                );
              }
              // example
              const key = `ex-${i}`;
              return (
                <div key={i} className="my-1 rounded-xl border border-gold/30 bg-forest-deep/50 px-3 py-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-display text-base font-black text-gold">{b.pat}</div>
                    <button
                      onClick={() => playText(b.pat, key)}
                      disabled={audioBusy === key}
                      className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-leaf/20 text-leaf transition hover:bg-leaf/30 disabled:opacity-50"
                      aria-label={`Ouvir ${b.pat}`}
                      title="Ouvir pronúncia"
                    >
                      {audioBusy === key ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Volume2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                  <div className="mt-0.5 text-xs text-foreground/70">{b.pt}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div
          className={`flex items-center gap-2 px-1 text-[10px] text-foreground/40 ${
            isUser ? "flex-row-reverse" : ""
          }`}
        >
          {time && <span>{time}</span>}
          {!isUser && (
            <>
              <span aria-hidden>·</span>
              <button
                onClick={copyMessage}
                className="inline-flex items-center gap-1 rounded px-1 py-0.5 hover:bg-card/60 hover:text-foreground/70 transition"
                aria-label={t.copy}
                title={t.copy}
              >
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                {copied ? t.copied : t.copy}
              </button>
              {isLast && (
                <>
                  <span aria-hidden>·</span>
                  <button
                    onClick={() => playText(msg.content.replace(/\[\/?ex\]/g, "").replace(/\|\|/g, ", ").replace(/\*\*/g, ""), "full")}
                    disabled={audioBusy === "full"}
                    className="inline-flex items-center gap-1 rounded px-1 py-0.5 hover:bg-card/60 hover:text-foreground/70 transition disabled:opacity-50"
                    aria-label="Ouvir resposta"
                    title="Ouvir resposta"
                  >
                    {audioBusy === "full" ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Volume2 className="h-3 w-3" />
                    )}
                    Ouvir
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

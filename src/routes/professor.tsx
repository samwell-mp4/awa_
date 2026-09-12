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
  VolumeX,
  Copy,
  Check,
  RefreshCcw,
  Sparkles,
  Mic,
  Square,
  Pause,
  Play,
} from "lucide-react";
import { toast } from "sonner";
import { PremiumGate } from "@/components/PremiumGate";
import { useLastArea } from "@/lib/last-area";
import { useLang, type Lang } from "@/lib/pick-lang";
import logoSrc from "@/assets/awa-tech-logo.png";
import { CaptionPlayer } from "@/components/CaptionPlayer";
import { transcribeAudio } from "@/lib/transcribe.functions";
import { useVoiceRecorder, isRecordingSupported } from "@/lib/voice-recorder";


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
  back: string;
  heroBadge: string;
  heroChips: string[];
  suggestions: { label: string; prompt: string }[];
  errorSpeak: string;
  errorAudio: string;
  copyFail: string;
  localeTime: string;
};

const L10N: Record<Lang, L10n> = {
  pt: {
    welcome:
      "Kanhgág! Sou o **Professor Akuã**, mestre virtual da língua **Patxôhã**.\n\nEstou aqui para ensinar palavras, expressões, pronúncia e a cultura do povo Pataxó. Pergunte à vontade — ao clicar ou fazer perguntas produzir áudio automaticamente. Ao final da resposta, você terá a opção de ouvir novamente ou fazer outra pergunta.",
    subtitle: "Mestre de Patxôhã · Online",
    newChat: "Nova conversa",
    suggestionsTitle: "Sugestões para começar",
    placeholder: "Pergunte ao Professor Akuã…",
    hint: "Enter para enviar · Shift + Enter para nova linha",
    copy: "Copiar",
    copied: "Copiado",
    listen: "Ouvir",
    send: "Enviar",
    back: "Voltar",
    heroBadge: "Professor Akuã",
    heroChips: ["Pronúncia", "Vocabulário", "Cultura Pataxó"],
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
      "Kanhgág! I am **Professor Akuã**, the virtual master of the **Patxôhã** language.\n\nI am here to teach you words, expressions, pronunciation and the culture of the Pataxó people. Ask freely — by clicking or asking questions, audio will be produced automatically. At the end of the answer, you will have the option to listen again or ask another question.",
    subtitle: "Patxôhã Master · Online",
    newChat: "New chat",
    suggestionsTitle: "Suggestions to get started",
    placeholder: "Ask Professor Akuã…",
    hint: "Enter to send · Shift + Enter for a new line",
    copy: "Copy",
    copied: "Copied",
    listen: "Listen",
    send: "Send",
    back: "Back",
    heroBadge: "Professor Akuã",
    heroChips: ["Pronunciation", "Vocabulary", "Pataxó Culture"],
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
      "¡Kanhgág! Soy el **Profesor Akuã**, maestro virtual de la lengua **Patxôhã**.\n\nEstoy aquí para enseñarte palabras, expresiones, pronunciación y la cultura del pueblo Pataxó. Pregunta con confianza — al hacer clic o hacer preguntas, el audio se producirá automáticamente. Al final de la respuesta, tendrás la opción de escuchar de nuevo o hacer otra pregunta.",
    subtitle: "Maestro de Patxôhã · En línea",
    newChat: "Nueva conversación",
    suggestionsTitle: "Sugerencias para empezar",
    placeholder: "Pregunta al Profesor Akuã…",
    hint: "Enter para enviar · Shift + Enter para nueva línea",
    copy: "Copiar",
    copied: "Copiado",
    listen: "Escuchar",
    send: "Enviar",
    back: "Volver",
    heroBadge: "Profesor Akuã",
    heroChips: ["Pronunciación", "Vocabulario", "Cultura Pataxó"],
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
    back: "Iawê",
    heroBadge: "Professor Akuã",
    heroChips: ["Pronúncia", "Palavras", "Cultura"],
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

type VoiceL10n = {
  invite: string;
  talk: string;
  stopRec: string;
  listening: string;
  thinking: string;
  speaking: string;
  pause: string;
  resume: string;
  stopVoice: string;
  denied: string;
  unsupported: string;
  tooShort: string;
  sttFail: string;
};

const VOICE_L10N: Record<Lang, VoiceL10n> = {
  pt: {
    invite: "Toque para falar com o Professor Akuã",
    talk: "Falar",
    stopRec: "Parar e enviar",
    listening: "Ouvindo você…",
    thinking: "Pensando…",
    speaking: "Falando…",
    pause: "Pausar",
    resume: "Continuar",
    stopVoice: "Encerrar voz",
    denied: "Precisamos da sua permissão do microfone para ouvir você.",
    unsupported: "Este navegador não permite gravar voz. Você pode digitar sua pergunta.",
    tooShort: "Não consegui ouvir. Fale um pouquinho mais perto do microfone.",
    sttFail: "Não consegui entender o áudio. Tente de novo ou digite.",
  },
  en: {
    invite: "Tap to speak with Professor Akuã",
    talk: "Speak",
    stopRec: "Stop and send",
    listening: "Listening to you…",
    thinking: "Thinking…",
    speaking: "Speaking…",
    pause: "Pause",
    resume: "Resume",
    stopVoice: "Stop voice",
    denied: "We need your microphone permission to hear you.",
    unsupported: "This browser cannot record voice. You can type your question.",
    tooShort: "I couldn't hear you. Please speak closer to the microphone.",
    sttFail: "I couldn't understand the audio. Try again or type instead.",
  },
  es: {
    invite: "Toca para hablar con el Profesor Akuã",
    talk: "Hablar",
    stopRec: "Parar y enviar",
    listening: "Escuchándote…",
    thinking: "Pensando…",
    speaking: "Hablando…",
    pause: "Pausar",
    resume: "Continuar",
    stopVoice: "Terminar voz",
    denied: "Necesitamos tu permiso del micrófono para escucharte.",
    unsupported: "Este navegador no permite grabar voz. Puedes escribir tu pregunta.",
    tooShort: "No pude escucharte. Habla un poco más cerca del micrófono.",
    sttFail: "No pude entender el audio. Inténtalo de nuevo o escribe.",
  },
  pat: {
    invite: "Toque para falar com o Professor Akuã",
    talk: "Falar",
    stopRec: "Parar e enviar",
    listening: "Ouvindo você…",
    thinking: "Pensando…",
    speaking: "Falando…",
    pause: "Pausar",
    resume: "Continuar",
    stopVoice: "Encerrar voz",
    denied: "Precisamos da sua permissão do microfone para ouvir você.",
    unsupported: "Este navegador não permite gravar voz. Você pode digitar sua pergunta.",
    tooShort: "Não consegui ouvir. Fale mais perto do microfone.",
    sttFail: "Não consegui entender o áudio. Tente de novo ou digite.",
  },
};

function ProfessorPage() {
  const backTo = useLastArea();
  const ask = useServerFn(askAkua);
  const speak = useServerFn(speakText);
  const transcribe = useServerFn(transcribeAudio);
  const lang = useLang();
  const t = L10N[lang];
  const v = VOICE_L10N[lang];

  const makeWelcome = (): Msg => ({ role: "assistant", content: t.welcome, at: Date.now() });

  const [messages, setMessages] = useState<Msg[]>(() => [makeWelcome()]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeAssistantAudio, setActiveAssistantAudio] = useState<HTMLAudioElement | null>(null);
  const [audioBusyKey, setAudioBusyKey] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // --- Modo voz -------------------------------------------------------------
  const recorder = useVoiceRecorder();
  const [voiceState, setVoiceState] = useState<"idle" | "listening" | "thinking" | "speaking">("idle");
  const [voicePaused, setVoicePaused] = useState(false);
  const [micReady, setMicReady] = useState(false);
  useEffect(() => setMicReady(isRecordingSupported()), []);

  function pauseVoice() {
    currentAudioRef.current?.pause();
    setVoicePaused(true);
  }

  function resumeVoice() {
    void currentAudioRef.current?.play().catch(() => {});
    setVoicePaused(false);
  }

  function stopVoice() {
    currentAudioRef.current?.pause();
    setVoicePaused(false);
    setActiveAssistantAudio(null);
    setVoiceState("idle");
  }

  async function handleMic() {
    if (!micReady) {
      toast.error(v.unsupported);
      return;
    }
    if (recorder.isRecording) {
      const file = await recorder.stop();
      if (!file) {
        setVoiceState("idle");
        toast.error(v.tooShort);
        return;
      }
      setVoiceState("thinking");
      try {
        const fd = new FormData();
        fd.append("file", file, file.name);
        fd.append("language", lang === "pat" ? "pt" : lang);
        fd.append("environment", getPaddleEnvironment());
        const r = await transcribe({ data: fd });
        const text = (r?.text ?? "").trim();
        if (r?.error || !text) {
          setVoiceState("idle");
          toast.error(r?.message ?? v.sttFail);
          return;
        }
        await send(text, true);
      } catch {
        setVoiceState("idle");
        toast.error(v.sttFail);
      }
      return;
    }
    currentAudioRef.current?.pause();
    setVoicePaused(false);
    const ok = await recorder.start();
    if (!ok) {
      setVoiceState("idle");
      toast.error(recorder.error === "unsupported" ? v.unsupported : v.denied);
      return;
    }
    setVoiceState("listening");
  }





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

  async function toggleAudio(text: string, key: string) {
    if (audioBusyKey === key) {
      currentAudioRef.current?.pause();
      setActiveAssistantAudio(null);
      setAudioBusyKey(null);
      return;
    }
    
    try {
      setAudioBusyKey(key);
      const clean = text.replace(/\[\/?ex\]/g, "").replace(/\|\|/g, ", ").replace(/\*\*/g, "");
      const r = await speak({ data: { text: clean, environment: getPaddleEnvironment(), lang, area: "adulto" } });
      if (r.error || !r.audio_base64) {
        setAudioBusyKey(null);
        return;
      }
      
      const url = base64ToBlobUrl(r.audio_base64, r.mime);
      currentAudioRef.current?.pause();
      const audio = new Audio(url);
      currentAudioRef.current = audio;
      setActiveAssistantAudio(audio);

      await audio.play().catch(() => {});
      
      audio.onended = () => {
        if (audioBusyKey === key) {
          setAudioBusyKey(null);
          setActiveAssistantAudio(null);
        }
      };

      const stopHandler = () => {
        audio.pause();
        window.removeEventListener("pointerdown", stopHandler);
      };
      window.addEventListener("pointerdown", stopHandler, { once: true });
    } catch {
      setAudioBusyKey(null);
    }
  }

  async function autoSpeak(audio: HTMLAudioElement, text: string, voiceMode = false) {
    try {
      const clean = text.replace(/\[\/?ex\]/g, "").replace(/\|\|/g, ", ").replace(/\*\*/g, "");
      const r = await speak({ data: { text: clean, environment: getPaddleEnvironment(), lang, area: "adulto" } });
      if (r.error || !r.audio_base64) {
        if (voiceMode) setVoiceState("idle");
        return;
      }

      const url = base64ToBlobUrl(r.audio_base64, r.mime);
      currentAudioRef.current?.pause();
      audio.src = url;
      currentAudioRef.current = audio;
      setActiveAssistantAudio(audio);

      if (voiceMode) {
        setVoicePaused(false);
        setVoiceState("speaking");
        audio.onended = () => setVoiceState("idle");
      }

      // Sincronização de legendas (opcional para o professor, mas garantindo que o áudio toque)
      await audio.play().catch(() => {});

      // Em modo voz o usuário controla com pausar/continuar, sem parar ao tocar na tela.
      if (voiceMode) return;
      const stopHandler = () => {
        audio.pause();
        window.removeEventListener("pointerdown", stopHandler);
      };
      window.addEventListener("pointerdown", stopHandler, { once: true });
    } catch {
      if (voiceMode) setVoiceState("idle");
    }
  }

  async function send(text: string, voiceMode = false) {
    const content = text.trim();
    if (!content || loading) return;
    const audio = new Audio();
    const next = [...messages, { role: "user" as const, content, at: Date.now() }];
    setMessages(next);
    setInput("");
    setLoading(true);
    if (voiceMode) setVoiceState("thinking");
    try {
      const { reply } = await ask({ data: { messages: next, environment: getPaddleEnvironment(), lang } });
      setMessages([...next, { role: "assistant", content: reply, at: Date.now() }]);
      void autoSpeak(audio, reply, voiceMode);
    } catch (e: any) {
      if (voiceMode) setVoiceState("idle");
      toast.error(e.message ?? t.errorSpeak);
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  }

  function resetConversation() {
    recorder.cancel();
    currentAudioRef.current?.pause();
    setActiveAssistantAudio(null);
    setVoicePaused(false);
    setVoiceState("idle");
    setMessages([makeWelcome()]);
    setInput("");
    textareaRef.current?.focus();
  }

  const isEmpty = messages.length <= 1;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--gradient-forest)]">
      <header className="sticky top-0 z-40 border-b border-gold/20 bg-[oklch(0.16_0.04_145/0.92)] backdrop-blur-xl shadow-[0_8px_30px_-12px_rgba(0,0,0,0.6)]">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3 md:px-8">
          <Link
            to={backTo as "/"}
            className="inline-flex items-center gap-1.5 rounded-full border border-transparent px-2.5 py-1.5 -ml-2.5 text-sm font-semibold text-gold/90 transition hover:border-gold/25 hover:bg-card/40 hover:text-gold"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">{L10N[lang].back}</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="rounded-full bg-gradient-to-br from-gold/60 via-gold/20 to-transparent p-[2px]">
                <img
                  loading="lazy"
                  decoding="async"
                  src={logoSrc}
                  alt=""
                  className="h-10 w-10 rounded-full border border-forest-deep object-cover shadow-md"
                />
              </div>
              <span
                aria-hidden
                className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-[oklch(0.16_0.04_145)]"
              />
            </div>
            <div className="leading-tight">
              <div className="font-display text-sm font-black text-cream md:text-base">
                Professor Akuã
              </div>
              <div className="flex items-center gap-1 text-[10.5px] font-semibold uppercase tracking-wider text-emerald-300/80">
                <Sparkles className="h-3 w-3" />
                {t.subtitle}
              </div>
            </div>
          </div>

          <button
            onClick={resetConversation}
            disabled={isEmpty && !loading}
            className="inline-flex items-center gap-1.5 rounded-full border border-gold/25 bg-card/50 px-3 py-1.5 text-[11px] font-bold text-foreground/80 transition hover:border-gold/60 hover:bg-card/70 hover:text-cream disabled:opacity-40"
            title={t.newChat}
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t.newChat}</span>
          </button>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-3xl px-4 pb-72 pt-6 md:px-8">
        <div className="space-y-5">
          {messages.map((m, i) => (
            <Bubble
              key={i}
              msg={m}
              isLast={i === messages.length - 1}
              activeAudio={i === messages.length - 1 && m.role === "assistant" ? activeAssistantAudio : null}
              onToggleAudio={toggleAudio}
            />
          ))}
          {loading && <TypingIndicator />}
          <div ref={endRef} />
        </div>

      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gold/20 bg-[oklch(0.16_0.04_145/0.96)] px-4 pb-4 pt-3 shadow-[0_-12px_40px_-16px_rgba(0,0,0,0.7)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-3">
          <p className="text-center text-xs font-bold uppercase text-gold/80" aria-live="polite">
            {voiceState === "listening"
              ? v.listening
              : voiceState === "thinking"
                ? v.thinking
                : voiceState === "speaking"
                  ? v.speaking
                  : v.invite}
          </p>

          <button
            type="button"
            onClick={handleMic}
            disabled={loading || voiceState === "thinking"}
            className={`flex w-full max-w-sm items-center justify-center gap-3 rounded-2xl border px-6 py-4 text-base font-black uppercase transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 ${
              recorder.isRecording
                ? "border-rose-400/60 bg-rose-500/25 text-rose-100 shadow-lg shadow-rose-500/20 animate-pulse"
                : "border-gold/50 bg-gold text-forest-deep shadow-lg shadow-gold/20 hover:brightness-110"
            }`}
            aria-label={recorder.isRecording ? v.stopRec : v.talk}
            title={recorder.isRecording ? v.stopRec : v.talk}
          >
            {recorder.isRecording ? <Square className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            {recorder.isRecording ? v.stopRec : v.talk}
          </button>

          {voiceState === "speaking" && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={voicePaused ? resumeVoice : pauseVoice}
                className="inline-flex items-center gap-1.5 rounded-xl border border-gold/30 bg-card/70 px-4 py-2 text-xs font-bold text-foreground/85"
              >
                {voicePaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                {voicePaused ? v.resume : v.pause}
              </button>
              <button
                type="button"
                onClick={stopVoice}
                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-400/40 bg-rose-500/15 px-4 py-2 text-xs font-bold text-rose-200"
              >
                <Square className="h-4 w-4" /> {v.stopVoice}
              </button>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
            className="flex w-full items-end gap-2.5"
          >
            <div className="relative flex-1">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send(input);
                  }
                }}
                placeholder={t.placeholder}
                rows={1}
                maxLength={1000}
                className="w-full resize-none rounded-2xl border border-gold/30 bg-card/80 px-4 py-3.5 text-sm text-cream shadow-inner placeholder:text-foreground/40 focus:border-gold/70 focus:outline-none focus:ring-2 focus:ring-gold/25"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gold text-forest-deep shadow-lg shadow-gold/20 transition active:scale-95 disabled:opacity-40"
              aria-label={t.send}
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </button>
          </form>
        </div>
      </div>
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

function Bubble({ 
  msg, 
  isLast, 
  activeAudio, 
  onToggleAudio 
}: { 
  msg: Msg; 
  isLast: boolean; 
  activeAudio?: HTMLAudioElement | null;
  onToggleAudio?: (text: string, key: string) => void;
}) {
  const lang = useLang();
  const t = L10N[lang];
  const isUser = msg.role === "user";
  const speak = useServerFn(speakText);
  const [audioBusy, setAudioBusy] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blocks = useMemo(() => parseBlocks(msg.content), [msg.content]);

  async function playText(text: string, key: string) {
    if (onToggleAudio) {
      onToggleAudio(text, key);
      return;
    }
    // Fallback for single bubble usage if ever needed
    if (audioBusy === key) {
      audioRef.current?.pause();
      setAudioBusy(null);
      return;
    }
    if (audioBusy) return;
    try {
      setAudioBusy(key);
      const r = await speak({ data: { text, environment: getPaddleEnvironment(), lang, area: "adulto" } });
      if (r.error || !r.audio_base64) throw new Error(r.message ?? t.errorAudio);
      const audio = new Audio(base64ToBlobUrl(r.audio_base64, r.mime));
      audio.preload = "auto";
      audioRef.current?.pause();
      audioRef.current = audio;
      await audio.play();


      // Permite parar o áudio ao clicar na tela
      const stopHandler = () => {
        audio.pause();
        window.removeEventListener("pointerdown", stopHandler);
      };
      window.addEventListener("pointerdown", stopHandler, { once: true });
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
            {isLast && !isUser && (
              <CaptionPlayer 
                text={msg.content.replace(/\[\/?ex\]/g, "").replace(/\|\|/g, ", ").replace(/\*\*/g, "")} 
                audio={activeAudio || null}
                className="mb-2"
              />
            )}

            {blocks.map((b, i) => {
              if (b.type === "paragraph") {
                return (
                  <p 
                    key={i} 
                    className="whitespace-pre-wrap cursor-pointer hover:text-gold transition-colors"
                    onClick={() => playText(b.text.replace(/\*\*/g, ""), `p${i}`)}
                  >
                    {renderInline(b.text, `p${i}`)}
                  </p>
                );
              }
              if (b.type === "bullets") {
                return (
                  <ul key={i} className="ml-1 space-y-1">
                    {b.items.map((item: string, j: number) => (
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
                    <button
                      onClick={() => playText(b.pat, key)}
                      disabled={audioBusy === key && !onToggleAudio}
                      className="group flex flex-1 items-center gap-3 text-left transition hover:opacity-80 disabled:opacity-50"
                      aria-label={`Ouvir ${b.pat}`}
                    >
                      <div className="font-display text-base font-black text-gold group-hover:underline decoration-gold/30 underline-offset-4">
                        {b.pat}
                      </div>
                      <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-leaf/20 text-leaf transition group-hover:bg-leaf/30">
                        {audioBusy === key ? (
                          <VolumeX className="h-3.5 w-3.5 animate-pulse" />
                        ) : (
                          <Volume2 className="h-3.5 w-3.5" />
                        )}

                      </div>
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
                    disabled={audioBusy === "full" && !onToggleAudio}
                    className="inline-flex items-center gap-1 rounded px-1 py-0.5 hover:bg-card/60 hover:text-foreground/70 transition disabled:opacity-50"
                    aria-label={t.listen}
                    title={t.listen}
                  >
                    {audioBusy === "full" ? (
                      <VolumeX className="h-3 w-3 animate-pulse" />
                    ) : (
                      <Volume2 className="h-3 w-3" />
                    )}

                    {t.listen}
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

import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Mic, Pause, Play, Send, Square, Volume2, Sparkles, RefreshCcw, ArrowLeft, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { askAkua } from "@/lib/akua-chat.functions";
import { speakText } from "@/lib/tts.functions";
import { transcribeAudio } from "@/lib/transcribe.functions";
import { base64ToBlobUrl } from "@/lib/audio-play";
import { getTrilhaAudioUrl } from "@/lib/trilhas-audio-catalog";
import { getPaddleEnvironment } from "@/lib/paddle";
import { PremiumGate } from "@/components/PremiumGate";
import { useVoiceRecorder, isRecordingSupported } from "@/lib/voice-recorder";
import { useBrowserSpeech, isBrowserSpeechSupported } from "@/lib/web-speech";
import kidsCharacter from "@/assets/kids-menu-character.png";
import { GptVoiceOrb } from "@/components/chat/GptVoiceOrb";

export const Route = createFileRoute("/professor-infantil")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Professor Awã — Tutor de Patxôhã Infantil" },
      {
        name: "description",
        content:
          "Converse com o Professor Awã: tutor interativo para crianças aprenderem Patxôhã falando e ouvindo.",
      },
    ],
  }),
  component: () => (
    <PremiumGate
      area="infantil"
      title="Professor Awã Infantil"
      description="Assine o plano Infantil para conversar com o Professor Awã Infantil."
    >
      <ProfessorInfantilPage />
    </PremiumGate>
  ),
});

type Msg = { role: "user" | "assistant"; content: string };

const WELCOME =
  "Akxãy, pequeno parente! 🌿 Eu sou o Professor Awã, seu tutor de Patxôhã. O que você gostaria de aprender hoje?";

const SUGGESTIONS = [
  "Como dizer olá em Patxôhã?",
  "Ensine os números de 1 a 5",
  "Como se diz família?",
  "Conte uma história rápida da aldeia",
];

function clean(text: string) {
  return text
    .replace(/\[ex\]/g, "")
    .replace(/\[\/ex\]/g, "")
    .replace(/\|\|/g, " — ")
    .replace(/\*\*/g, "")
    .replace(/#+\s?/g, "");
}

type VoiceState = "idle" | "listening" | "thinking" | "speaking";

function ProfessorInfantilPage() {
  const ask = useServerFn(askAkua);
  const speak = useServerFn(speakText);
  const transcribe = useServerFn(transcribeAudio);
  const browserSpeech = useBrowserSpeech("pt-BR");
  const recorder = useVoiceRecorder();

  const [messages, setMessages] = useState<Msg[]>([{ role: "assistant", content: WELCOME }]);
  const [input, setInput] = useState("");
  const [state, setState] = useState<VoiceState>("idle");
  const [paused, setPaused] = useState(false);
  const [micReady, setMicReady] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const latestAssistantMessage = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "assistant") return messages[i];
    }
    return undefined;
  }, [messages]);

  function resetConversation() {
    stopVoice();
    browserSpeech.cancel();
    recorder.cancel();
    setMessages([{ role: "assistant", content: WELCOME }]);
    setInput("");
    setShowHistory(false);
  }

  useEffect(() => {
    setMicReady(isBrowserSpeechSupported() || isRecordingSupported());
  }, []);

  useEffect(() => {
    if (!browserSpeech.isListening && !recorder.isRecording && state === "listening") {
      setState("idle");
    }
  }, [browserSpeech.isListening, recorder.isRecording, state]);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, state]);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  function stopVoice() {
    const a = audioRef.current;
    if (a) {
      a.onended = null;
      a.pause();
    }
    setPaused(false);
    setState("idle");
  }

  async function playReply(text: string) {
    try {
      setState("speaking");
      const cleaned = clean(text).slice(0, 600);

      // Prioridade: áudio oficial baixado da trilha (zero tokens)
      const localAudioUrl = getTrilhaAudioUrl(cleaned);
      let audioUrl = localAudioUrl;

      if (!audioUrl) {
        const r = await speak({
          data: {
            text: cleaned,
            environment: getPaddleEnvironment(),
            lang: "pt",
            area: "infantil",
          },
        });
        if (r.error || !r.audio_base64) {
          setState("idle");
          return;
        }
        audioUrl = base64ToBlobUrl(r.audio_base64, r.mime);
      }

      const audio = audioRef.current ?? new Audio();
      audioRef.current = audio;
      audio.src = audioUrl;

      const onDone = () => {
        setPaused(false);
        setState("idle");
      };

      audio.onended = onDone;
      audio.onerror = onDone;
      setPaused(false);
      await audio.play().catch(() => {
        onDone();
      });
    } catch {
      setState("idle");
    }
  }

  async function send(text: string, withVoice: boolean) {
    if (browserSpeech.isListening) browserSpeech.stop();
    if (recorder.isRecording) recorder.cancel();
    const content = text.trim();
    if (!content || state === "thinking") return;
    const next: Msg[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setState("thinking");
    try {
      const { reply } = await ask({
        data: {
          messages: next,
          environment: getPaddleEnvironment(),
          lang: "pt",
          area: "infantil",
        },
      });
      setMessages([...next, { role: "assistant", content: reply }]);
      if (withVoice) await playReply(reply);
      else setState("idle");
    } catch {
      setState("idle");
      toast.error("Ops! O professor não conseguiu responder agora. Tente de novo. 🌿");
    }
  }

  async function handleMic() {
    if (!micReady) {
      toast.error("Este aparelho não deixa gravar a voz. Você pode escrever sua pergunta! ✏️");
      return;
    }

    // 1. Se estiver ouvindo no navegador via Web Speech API (zero tokens de IA):
    if (browserSpeech.isListening) {
      const finalRecorded = browserSpeech.stop();
      const textToKeep = (finalRecorded || input).trim();
      setState("idle");
      if (textToKeep) {
        setInput(textToKeep);
      }
      return;
    }

    // 2. Se estiver no fallback de gravação por servidor (MediaRecorder):
    if (recorder.isRecording) {
      const file = await recorder.stop();
      if (!file) {
        setState("idle");
        toast.error("Não consegui ouvir. Fale um pouquinho mais perto! 🎤");
        return;
      }
      setState("thinking");
      try {
        const fd = new FormData();
        fd.append("file", file, file.name);
        fd.append("language", "pt");
        fd.append("area", "infantil");
        fd.append("environment", getPaddleEnvironment());
        const r = await transcribe({ data: fd });
        const text = (r?.text ?? "").trim();
        setState("idle");
        if (text) {
          setInput(text);
        } else if (r?.error) {
          toast.error("Não entendi direitinho. Vamos tentar de novo? 🌿");
        }
      } catch {
        setState("idle");
        toast.error("Não entendi direitinho. Vamos tentar de novo? 🌿");
      }
      return;
    }

    stopVoice();

    // 3. Iniciar escuta nativa no navegador (sem custos de API, preenche a caixa de texto ao vivo)
    if (browserSpeech.isSupported) {
      const ok = await browserSpeech.start({
        lang: "pt-BR",
        initialText: input,
        onLiveText: (liveText) => {
          setInput(liveText);
        },
      });
      if (!ok) {
        setState("idle");
        toast.error("Preciso da sua permissão do microfone para te ouvir. 🎤");
        return;
      }
      setState("listening");
      return;
    }

    // Fallback para navegadores sem Web Speech API
    const ok = await recorder.start();
    if (!ok) {
      setState("idle");
      toast.error("Preciso da sua permissão do microfone para te ouvir. 🎤");
      return;
    }
    setState("listening");
  }

  return (
    <div className="kids-theme relative min-h-screen bg-[#fbf9f4] text-slate-800 font-sans flex flex-col justify-between overflow-x-clip selection:bg-amber-300 selection:text-amber-950">
      {/* Soft warm ambient lighting */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(254,243,199,0.5),rgba(255,255,255,0))]"
      />

      {/* Floating Animated Background Icons */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden select-none z-0 opacity-40"
      >
        <span
          className="absolute left-[6%] top-[140px] text-3xl"
          style={{ animation: "music-float 6s ease-in-out infinite" }}
        >
          🦜
        </span>
        <span
          className="absolute right-[8%] top-[190px] text-4xl"
          style={{ animation: "music-float 7s ease-in-out infinite 1.5s" }}
        >
          🌿
        </span>
        <span
          className="absolute left-[12%] top-[450px] text-3xl"
          style={{ animation: "music-float 8s ease-in-out infinite 0.7s" }}
        >
          ✨
        </span>
        <span
          className="absolute right-[14%] top-[520px] text-3xl"
          style={{ animation: "music-float 5.5s ease-in-out infinite 2s" }}
        >
          ⭐
        </span>
        <span
          className="absolute left-[4%] top-[780px] text-3xl"
          style={{ animation: "music-float 9s ease-in-out infinite 1s" }}
        >
          📚
        </span>
        <span
          className="absolute right-[6%] top-[860px] text-3xl"
          style={{ animation: "music-float 6.5s ease-in-out infinite 2.5s" }}
        >
          🌞
        </span>
      </div>

      <div className="relative z-10 flex flex-col flex-1">
        {/* Kids Header */}
        <header className="sticky top-0 z-40 border-b-2 border-amber-300 bg-white/95 backdrop-blur-md px-4 py-3 shadow-sm">
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
            <Link
              to="/infantil"
              className="inline-flex items-center gap-1.5 rounded-full border-2 border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-black text-amber-950 transition hover:bg-amber-100 active:scale-95"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar</span>
            </Link>

            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-2xl border-2 border-amber-300 bg-white shadow-sm">
                <img
                  src={kidsCharacter}
                  alt="Professor Awã"
                  className="h-full w-full object-cover object-top"
                />
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[10px]">
                  🦜
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="font-display text-sm sm:text-base font-black text-[#064e3b]">
                    Professor Awã
                  </h1>
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <p className="text-[10px] sm:text-xs font-bold text-amber-900/80">
                  Tutor de Patxôhã Infantil · Online
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {messages.length > 1 && (
                <button
                  onClick={resetConversation}
                  className="inline-flex items-center gap-1.5 rounded-full border-2 border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-black text-amber-950 transition hover:bg-amber-100 active:scale-95 cursor-pointer shadow-sm"
                  title="Nova conversa"
                >
                  <RefreshCcw className="h-3.5 w-3.5" />
                  <span>Recomeçar</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="mx-auto w-full max-w-4xl flex-1 px-3 sm:px-6 pb-36 pt-4 flex flex-col justify-between">
          {messages.length > 1 ? (
            /* Full Chat History Bubble View */
            <div className="flex flex-col gap-4 animate-in fade-in duration-300 w-full flex-1">
              <div className="flex items-center justify-between pb-2 border-b-2 border-amber-200">
                <span className="text-xs font-black text-amber-950 uppercase flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Conversa com Professor Awã ({messages.length})
                </span>
                <button
                  type="button"
                  onClick={resetConversation}
                  className="text-xs font-black text-amber-900 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCcw className="h-3 w-3" />
                  <span>Nova conversa</span>
                </button>
              </div>

              {messages.map((m, i) => (
                <div
                  key={i}
                  className={m.role === "user" ? "flex justify-end" : "flex items-start gap-3"}
                >
                  {m.role === "assistant" && (
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border-2 border-amber-300 bg-amber-100 text-xl shadow-sm">
                      🦜
                    </div>
                  )}
                  <div
                    className={
                      m.role === "user"
                        ? "max-w-[85%] rounded-3xl rounded-br-sm bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-4 font-semibold shadow-md text-sm sm:text-base leading-relaxed"
                        : "max-w-[85%] rounded-3xl rounded-bl-sm bg-white border-2 border-amber-200/90 text-slate-800 p-4 font-medium shadow-md text-sm sm:text-base leading-relaxed"
                    }
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{clean(m.content)}</p>
                    {m.role === "assistant" && (
                      <button
                        type="button"
                        onClick={() => playReply(m.content)}
                        className="mt-3 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-3.5 py-1 text-xs font-black text-amber-950 shadow-[0_2px_0_#b45309] hover:brightness-105 active:translate-y-0.5 active:shadow-none transition cursor-pointer"
                      >
                        {state === "speaking" ? (
                          <>
                            <GptVoiceOrb size="xs" state="speaking" theme="kids-magic" showRipple={false} />
                            <span>Falando...</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="h-3.5 w-3.5" />
                            <span>Ouvir com voz</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {state === "thinking" && (
                <div className="flex items-center gap-2.5 rounded-2xl bg-amber-100/80 border border-amber-300 px-4 py-2.5 text-xs font-black text-amber-950 w-fit">
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-700" />
                  <span>O Professor Awã está pensando na sua resposta...</span>
                </div>
              )}
              <div ref={endRef} />
            </div>
          ) : (
            /* Direct Voice Orb & Suggestions View (Welcome Screen) */
            <div className="flex-1 flex flex-col items-center justify-center my-auto py-2 sm:py-6">
              {/* Central Fluid Rotating Orb */}
              <div className="relative my-2 sm:my-4">
                <GptVoiceOrb
                  size="lg"
                  state={state}
                  theme="kids-magic"
                  onClick={handleMic}
                  showRipple={true}
                />
              </div>

              {/* Status Indicator Pill */}
              <div
                className={`mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black transition-all ${
                  state === "listening"
                    ? "bg-rose-100 text-rose-700 border-2 border-rose-400 animate-pulse"
                    : state === "thinking"
                    ? "bg-amber-100 text-amber-900 border-2 border-amber-400"
                    : state === "speaking"
                    ? "bg-emerald-100 text-emerald-950 border-2 border-emerald-400"
                    : "bg-white text-slate-800 border-2 border-amber-300 shadow-sm"
                }`}
              >
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    state === "listening"
                      ? "bg-rose-500 animate-ping"
                      : state === "thinking"
                      ? "bg-amber-500 animate-spin"
                      : state === "speaking"
                      ? "bg-emerald-500 animate-pulse"
                      : "bg-emerald-400"
                  }`}
                />
                <span>
                  {state === "listening"
                    ? (browserSpeech.interimTranscript ? `“${browserSpeech.interimTranscript}”` : "🎙️ Ouvindo você falar...")
                    : state === "thinking"
                    ? "🧠 Pensando na resposta..."
                    : state === "speaking"
                    ? "🗣️ Professor Awã falando..."
                    : "Toque no microfone para falar"}
                </span>
              </div>

              {/* Welcome Card and Suggestions */}
              <div className="mt-5 w-full max-w-xl rounded-3xl border-3 border-amber-300 bg-gradient-to-r from-[#fffef5] to-[#fef7e6] p-5 shadow-lg text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-3xl">🦜</span>
                  <h2 className="font-display text-base sm:text-lg font-black text-[#064e3b]">
                    "Awê, pequeno parente!"
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 font-semibold max-w-md mx-auto mb-4">
                  Eu sou o Professor Awã. Toque no microfone para falar comigo ou escolha uma das perguntas:
                </p>

                <div className="flex flex-wrap justify-center gap-2">
                  {SUGGESTIONS.map((sug) => (
                    <button
                      key={sug}
                      onClick={() => send(sug, false)}
                      disabled={state === "thinking"}
                      className="rounded-2xl border-2 border-amber-300 bg-white hover:bg-amber-100 px-3.5 py-2 text-xs font-black text-amber-950 transition shadow-sm active:translate-y-0.5 disabled:opacity-50 cursor-pointer"
                    >
                      ✨ {sug}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Fixed Bottom Dock (Matching Screenshot: Input pill + Big Mic) */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t-4 border-amber-300 bg-white/95 px-4 pb-4 pt-3 shadow-2xl backdrop-blur-md pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto max-w-lg flex items-center justify-between gap-3">
          {/* Question text input bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send(input, false);
            }}
            className="flex-1 flex items-center gap-2 min-w-0"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                browserSpeech.isListening || recorder.isRecording
                  ? "Fale agora... Seu texto aparecerá aqui! 🎤"
                  : "Pergunte algo ao Professor Awã..."
              }
              disabled={state === "thinking"}
              className="w-full rounded-full border-2 border-amber-300 bg-amber-50/70 focus:bg-white px-4 py-3.5 text-[16px] sm:text-base font-bold text-slate-800 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 transition"
            />
            {input.trim() && (
              <button
                type="submit"
                disabled={state === "thinking"}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md font-bold transition hover:brightness-110 active:scale-95 cursor-pointer"
                aria-label="Enviar mensagem"
              >
                <Send className="h-4 w-4" />
              </button>
            )}
          </form>

          {/* Pause / Play button when speaking */}
          {state === "speaking" && (
            <button
              type="button"
              onClick={() => {
                if (paused) {
                  void audioRef.current?.play();
                  setPaused(false);
                } else {
                  audioRef.current?.pause();
                  setPaused(true);
                }
              }}
              className="grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-full border-2 border-amber-300 bg-amber-100 text-amber-950 font-black hover:bg-amber-200 transition active:scale-95 cursor-pointer"
              title={paused ? "Continuar" : "Pausar"}
            >
              {paused ? <Play className="h-5 w-5 fill-current" /> : <Pause className="h-5 w-5 fill-current" />}
            </button>
          )}

          {/* Big Circular Microphone Button */}
          <button
            type="button"
            onClick={handleMic}
            disabled={state === "thinking"}
            className={`grid h-12 w-12 sm:h-14 sm:w-14 shrink-0 place-items-center rounded-full shadow-2xl transition-all active:scale-95 cursor-pointer disabled:opacity-50 ${
              browserSpeech.isListening || recorder.isRecording
                ? "bg-rose-500 text-white shadow-[0_0_30px_rgba(244,63,94,0.6)] animate-pulse"
                : "bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 shadow-[0_4px_0_#b45309]"
            }`}
            title={browserSpeech.isListening || recorder.isRecording ? "Pausar fala (manter texto para editar)" : "Falar no microfone"}
            aria-label={browserSpeech.isListening || recorder.isRecording ? "Pausar fala (manter texto para editar)" : "Falar no microfone"}
          >
            {browserSpeech.isListening || recorder.isRecording ? (
              <Pause className="h-5 w-5 fill-current" />
            ) : (
              <Mic className="h-5 w-5 sm:h-6 sm:w-6" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

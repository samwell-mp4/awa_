import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Mic, Pause, Play, Send, Square, Volume2, Sparkles, MessageCircle, Heart } from "lucide-react";
import { toast } from "sonner";
import { askAkua } from "@/lib/akua-chat.functions";
import { speakText } from "@/lib/tts.functions";
import { transcribeAudio } from "@/lib/transcribe.functions";
import { base64ToBlobUrl } from "@/lib/audio-play";
import { getPaddleEnvironment } from "@/lib/paddle";
import { PremiumGate } from "@/components/PremiumGate";
import { useVoiceRecorder, isRecordingSupported } from "@/lib/voice-recorder";
import { SiteHeader } from "@/components/home/site-header";
import kidsCharacter from "@/assets/kids-menu-character.png";
import { GptVoiceOrb } from "@/components/chat/GptVoiceOrb";
import { GptVoiceModal } from "@/components/chat/GptVoiceModal";

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
  const recorder = useVoiceRecorder();

  const [messages, setMessages] = useState<Msg[]>([{ role: "assistant", content: WELCOME }]);
  const [input, setInput] = useState("");
  const [state, setState] = useState<VoiceState>("idle");
  const [paused, setPaused] = useState(false);
  const [micReady, setMicReady] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const lastUserMessage = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "user") return messages[i].content;
    }
    return undefined;
  }, [messages]);

  const lastAssistantMessage = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "assistant") return messages[i].content;
    }
    return undefined;
  }, [messages]);

  useEffect(() => setMicReady(isRecordingSupported()), []);
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
      const r = await speak({
        data: {
          text: clean(text).slice(0, 600),
          environment: getPaddleEnvironment(),
          lang: "pt",
          area: "infantil",
        },
      });
      if (r.error || !r.audio_base64) {
        setState("idle");
        return;
      }
      const audio = audioRef.current ?? new Audio();
      audioRef.current = audio;
      audio.src = base64ToBlobUrl(r.audio_base64, r.mime);
      audio.onended = () => {
        setPaused(false);
        setState("idle");
      };
      setPaused(false);
      await audio.play().catch(() => {});
    } catch {
      setState("idle");
    }
  }

  async function send(text: string, withVoice: boolean) {
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
        if (r?.error || !text) {
          setState("idle");
          toast.error("Não entendi direitinho. Vamos tentar de novo? 🌿");
          return;
        }
        await send(text, true);
      } catch {
        setState("idle");
        toast.error("Não entendi direitinho. Vamos tentar de novo? 🌿");
      }
      return;
    }
    stopVoice();
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
        <SiteHeader mode="infantil" />

        <main className="mx-auto w-full max-w-4xl flex-1 px-3 sm:px-6 pb-48 pt-4">
          {/* ========================================================= */}
          {/* 1. HERO PARCHMENT BANNER                                  */}
          {/* ========================================================= */}
          <section className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-5 rounded-[2.5rem] border-4 border-amber-300 bg-gradient-to-r from-[#fffef5] via-[#fef7e6] to-[#f5edd2] p-5 sm:p-7 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2 border-amber-300 bg-white shadow-md">
                <img
                  src={kidsCharacter}
                  alt="Professor Awã"
                  className="h-full w-full object-cover object-top transform hover:scale-105 transition"
                  style={{ animation: "music-float 4s ease-in-out infinite" }}
                />
                <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-xs text-amber-950 font-black shadow-md border-2 border-white">
                  🦜
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1
                    className="font-display text-xl sm:text-2xl md:text-3xl font-black tracking-tight"
                    style={{ color: "#064e3b" }}
                  >
                    Professor Awã
                  </h1>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 font-semibold mt-0.5">
                  Seu tutor de Patxôhã e cultura indígena. Fale no microfone ou digite suas perguntas!
                </p>
              </div>
            </div>

            {/* Status Pill Badge & ChatGPT Voice Mode Button */}
            <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
              <button
                type="button"
                onClick={() => {
                  setIsVoiceModalOpen(true);
                  if (!recorder.isRecording && state === "idle") {
                    void handleMic();
                  }
                }}
                className="flex items-center gap-2 rounded-2xl border-2 border-sky-400 bg-sky-100 hover:bg-sky-200 px-3.5 py-2 shadow-sm text-xs font-black text-sky-950 transition active:translate-y-0.5 cursor-pointer"
                title="Abrir Modo Voz Mágico (Estilo ChatGPT)"
              >
                <GptVoiceOrb size="xs" state={state} theme="kids-magic" showRipple={false} />
                <span>Modo Voz Mágico</span>
              </button>

              <div className="flex items-center gap-2 rounded-2xl border-2 border-emerald-400/80 bg-emerald-100/90 px-3.5 py-2 shadow-sm">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-black text-emerald-950">
                  Tutor Online
                </span>
              </div>
            </div>
          </section>

          {/* ========================================================= */}
          {/* 2. WELCOME & QUESTION SUGGESTIONS CARD                    */}
          {/* ========================================================= */}
          <section className="mb-6 rounded-3xl border-2 border-amber-200/90 bg-white p-5 shadow-md">
            <div className="flex items-center gap-3.5">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber-100 border-2 border-amber-300 text-2xl shadow-inner">
                🦜
              </div>
              <div>
                <h2
                  className="font-display text-base font-black tracking-tight"
                  style={{ color: "#064e3b" }}
                >
                  "Awê! O que vamos aprender hoje?"
                </h2>
                <p className="text-xs text-slate-600 font-semibold mt-0.5">
                  Toque em uma das perguntas abaixo ou converse por voz como no ChatGPT:
                </p>
              </div>
            </div>

            {/* ChatGPT Voice Banner Card */}
            <div className="mt-4 flex items-center justify-between gap-3 bg-gradient-to-r from-sky-50 via-sky-100/80 to-blue-50 border-2 border-sky-300 rounded-2xl p-3 shadow-inner">
              <div className="flex items-center gap-3">
                <GptVoiceOrb
                  size="xs"
                  state={state === "speaking" ? "speaking" : "idle"}
                  theme="kids-magic"
                  showRipple={false}
                />
                <div>
                  <div className="text-xs font-black text-sky-950">Conversa por Voz (Estilo ChatGPT)</div>
                  <div className="text-[11px] text-sky-800 font-medium">Fale no microfone e o professor responde em áudio!</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsVoiceModalOpen(true);
                  if (!recorder.isRecording && state === "idle") {
                    void handleMic();
                  }
                }}
                className="rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-black text-xs px-3.5 py-1.5 shadow-sm active:scale-95 transition cursor-pointer"
              >
                Abrir Voz
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {SUGGESTIONS.map((sug) => (
                <button
                  key={sug}
                  onClick={() => send(sug, true)}
                  disabled={state === "thinking"}
                  className="rounded-2xl border-2 border-amber-300 bg-amber-50 hover:bg-amber-100 px-3.5 py-2 text-xs font-black text-amber-950 transition shadow-sm active:translate-y-0.5 disabled:opacity-50 cursor-pointer"
                >
                  ✨ {sug}
                </button>
              ))}
            </div>
          </section>

          {/* ========================================================= */}
          {/* 3. CHAT MESSAGES LIST                                      */}
          {/* ========================================================= */}
          <div className="flex flex-col gap-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={m.role === "user" ? "flex justify-end" : "flex items-start gap-3"}
              >
                {m.role === "assistant" && (
                  <div
                    className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl border-2 border-amber-300 bg-amber-100 text-2xl shadow-sm ${
                      state === "speaking" ? "ring-2 ring-emerald-400 animate-pulse" : ""
                    }`}
                  >
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
                  {m.role === "assistant" && i > 0 && (
                    <button
                      type="button"
                      onClick={() => playReply(m.content)}
                      className={`mt-3 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-black transition cursor-pointer active:translate-y-0.5 shadow-sm ${
                        state === "speaking"
                          ? "bg-sky-500 text-white shadow-sky-400/40 animate-pulse"
                          : "bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 hover:brightness-105 shadow-[0_2px_0_#b45309]"
                      }`}
                    >
                      {state === "speaking" ? (
                        <>
                          <GptVoiceOrb size="xs" state="speaking" theme="kids-magic" showRipple={false} />
                          <span>Ouvindo o professor...</span>
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
        </main>
      </div>

      {/* ========================================================= */}
      {/* 4. FIXED BOTTOM DOCK (Clean, High-Contrast Children's Dock)*/}
      {/* ========================================================= */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t-4 border-amber-300 bg-white/95 px-4 pb-5 pt-3 shadow-2xl backdrop-blur-md pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-between gap-2 mb-2 px-1">
            <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
              {state === "listening" ? (
                <span className="text-rose-600 flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                  🎙️ Ouvindo você falar...
                </span>
              ) : state === "thinking" ? (
                <span className="text-amber-800">🧠 Pensando na resposta...</span>
              ) : state === "speaking" ? (
                <span className="text-emerald-700">🗣️ Professor Awã falando...</span>
              ) : (
                <span>Fale pelo microfone ou digite abaixo:</span>
              )}
            </span>

            {state === "speaking" && (
              <div className="flex items-center gap-2">
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
                  className="text-xs font-black text-amber-900 hover:underline cursor-pointer"
                >
                  {paused ? "Continuar" : "Pausar"}
                </button>
                <button
                  type="button"
                  onClick={stopVoice}
                  className="text-xs font-black text-rose-600 hover:underline cursor-pointer"
                >
                  Parar
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {/* Quick ChatGPT Voice Mode Orb launcher */}
            <button
              type="button"
              onClick={() => {
                setIsVoiceModalOpen(true);
                if (!recorder.isRecording && state === "idle") {
                  void handleMic();
                }
              }}
              className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border-2 border-sky-300 bg-sky-100 hover:bg-sky-200 transition shadow-sm active:translate-y-0.5 cursor-pointer"
              title="Abrir Modo Voz Mágico (Estilo ChatGPT)"
              aria-label="Modo Voz Mágico"
            >
              <GptVoiceOrb size="xs" state={state} theme="kids-magic" showRipple={false} />
            </button>

            {/* Big Mic Action Button with 3D press effect */}
            <button
              type="button"
              onClick={handleMic}
              disabled={state === "thinking"}
              className={`flex h-12 shrink-0 items-center justify-center gap-2 rounded-2xl px-4 text-xs font-black uppercase shadow transition active:translate-y-1 active:shadow-none disabled:opacity-50 cursor-pointer ${
                recorder.isRecording
                  ? "bg-rose-500 text-white shadow-[0_4px_0_#9f1239] animate-pulse"
                  : "bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 shadow-[0_4px_0_#b45309]"
              }`}
              title="Falar no microfone"
            >
              {recorder.isRecording ? (
                <>
                  <Square className="h-4 w-4 fill-current" />
                  <span>Pronto</span>
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4" />
                  <span>Falar</span>
                </>
              )}
            </button>

            {/* Text Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void send(input, false);
              }}
              className="flex flex-1 items-center gap-2 min-w-0"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Pergunte algo ao professor..."
                className="w-full rounded-2xl border-2 border-amber-300 bg-amber-50/50 focus:bg-white px-4 py-3 text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 transition"
              />
              <button
                type="submit"
                disabled={!input.trim() || state === "thinking"}
                className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-[0_3px_0_#064e3b] active:translate-y-0.5 active:shadow-none transition disabled:opacity-40 cursor-pointer"
                aria-label="Enviar mensagem"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Fullscreen ChatGPT Voice Mode Modal for Kids */}
      <GptVoiceModal
        isOpen={isVoiceModalOpen}
        onClose={() => {
          setIsVoiceModalOpen(false);
          if (recorder.isRecording) recorder.cancel();
        }}
        title="Professor Awã"
        subtitle="Tutor Infantil de Patxôhã"
        avatarIcon="🦜"
        theme="infantil"
        voiceState={state}
        voicePaused={paused}
        isRecording={recorder.isRecording}
        onToggleMic={handleMic}
        onPauseVoice={() => {
          audioRef.current?.pause();
          setPaused(true);
        }}
        onResumeVoice={() => {
          void audioRef.current?.play().catch(() => {});
          setPaused(false);
        }}
        onStopVoice={stopVoice}
        onSendMessage={(txt) => void send(txt, true)}
        lastUserText={lastUserMessage}
        lastAssistantText={lastAssistantMessage}
        suggestions={SUGGESTIONS.map((s) => ({ label: s, prompt: s }))}
      />
    </div>
  );
}

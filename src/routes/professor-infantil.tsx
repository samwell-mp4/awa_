import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { Loader2, Mic, Pause, Play, Send, Square, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { askAkua } from "@/lib/akua-chat.functions";
import { speakText } from "@/lib/tts.functions";
import { transcribeAudio } from "@/lib/transcribe.functions";
import { base64ToBlobUrl } from "@/lib/audio-play";
import { getPaddleEnvironment } from "@/lib/paddle";
import { PremiumGate } from "@/components/PremiumGate";
import { useVoiceRecorder, isRecordingSupported } from "@/lib/voice-recorder";
import { SiteHeader } from "@/components/home/site-header";
import { PageHeader } from "@/components/education/page-header";
import kidsBg from "@/assets/kids-menu-bg.jpg";

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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

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
    <div
      className="relative min-h-screen text-[#fefae0] font-sans flex flex-col justify-between"
      style={{
        backgroundImage: `url(${kidsBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundAttachment: "fixed",
      }}
    >
      <div aria-hidden className="awa-bg-scrim pointer-events-none fixed inset-0" />

      <div className="relative z-10 flex flex-col flex-1">
        <SiteHeader mode="infantil" />

        <main className="mx-auto w-full max-w-4xl flex-1 px-4 pb-48 pt-4 sm:px-6">
          <PageHeader
            breadcrumbs={[
              { label: "Início", href: "/infantil" },
              { label: "Professor Awã" },
            ]}
            title="Professor Awã"
            description="Seu tutor de Patxôhã e cultura indígena. Fale no microfone ou digite suas perguntas."
          />

          {/* Tutor Welcome & Question Suggestions */}
          <div className="mt-5 awa-card-1 rounded-2xl p-5 shadow-xl border border-[#633916]">
            <div className="flex items-center gap-3.5">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#251408] border border-[#ffd166] text-2xl shadow-md">
                🦜
              </div>
              <div>
                <h2 className="text-base font-black text-[#ffd166]">
                  "Awê! O que vamos aprender hoje?"
                </h2>
                <p className="text-xs text-[#fefae0]/80">
                  Toque em uma das sugestões abaixo ou faça sua própria pergunta:
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {SUGGESTIONS.map((sug) => (
                <button
                  key={sug}
                  onClick={() => send(sug, true)}
                  disabled={state === "thinking"}
                  className="rounded-xl border border-[#633916] bg-[#251408] px-3.5 py-1.5 text-xs font-semibold text-[#ffd166] hover:border-[#ffd166] hover:bg-[#331c0e] transition shadow active:scale-95 disabled:opacity-50"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Messages List */}
          <div className="mt-6 flex flex-col gap-3.5">
            {messages.map((m, i) => (
              <div
                key={i}
                className={m.role === "user" ? "flex justify-end" : "flex items-start gap-3"}
              >
                {m.role === "assistant" && (
                  <div
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[#633916] bg-[#251408] text-xl shadow ${
                      state === "speaking" ? "border-[#ffd166] animate-pulse" : ""
                    }`}
                  >
                    🦜
                  </div>
                )}
                <div
                  className={
                    m.role === "user"
                      ? "max-w-[85%] rounded-2xl rounded-br-sm border border-[#2a9d8f] bg-gradient-to-b from-[#1b382b] to-[#12241c] p-3.5 text-sm font-medium text-[#fefae0] shadow"
                      : "awa-card-2 max-w-[85%] rounded-2xl rounded-bl-sm p-4 text-sm font-medium text-[#fefae0] shadow border border-[#633916]"
                  }
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{clean(m.content)}</p>
                  {m.role === "assistant" && i > 0 && (
                    <button
                      type="button"
                      onClick={() => playReply(m.content)}
                      className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg border border-[#633916] bg-[#251408] px-2.5 py-1 text-xs font-bold text-[#ffd166] hover:border-[#ffd166] transition"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                      <span>Ouvir</span>
                    </button>
                  )}
                </div>
              </div>
            ))}

            {state === "thinking" && (
              <div className="flex items-center gap-2 text-sm font-bold text-[#ffd166]">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>O Professor Awã está pensando...</span>
              </div>
            )}
            <div ref={endRef} />
          </div>
        </main>
      </div>

      {/* Fixed Bottom Dock with Safe Area Support */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#633916]/80 bg-[#180e07]/95 px-4 pb-5 pt-3 shadow-2xl backdrop-blur-md pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-between gap-2 mb-2 px-1">
            <span className="text-xs font-bold text-[#d4a373]">
              {state === "listening"
                ? "🎙️ Ouvindo você falar..."
                : state === "thinking"
                ? "🧠 Pensando na resposta..."
                : state === "speaking"
                ? "🗣️ Professor Awã falando..."
                : "Fale pelo microfone ou digite abaixo:"}
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
                  className="text-xs font-bold text-[#ffd166] hover:underline"
                >
                  {paused ? "Continuar" : "Pausar"}
                </button>
                <button
                  type="button"
                  onClick={stopVoice}
                  className="text-xs font-bold text-red-400 hover:underline"
                >
                  Parar
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Big Mic Action Button */}
            <button
              type="button"
              onClick={handleMic}
              disabled={state === "thinking"}
              className={`flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl px-4 text-xs font-black uppercase text-white shadow transition active:scale-95 disabled:opacity-50 ${
                recorder.isRecording
                  ? "bg-red-600 animate-pulse"
                  : "bg-gradient-to-r from-[#ffd166] to-[#f59e0b] text-[#1a0e04]"
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
                placeholder="Digite ou pergunte algo ao professor..."
                className="w-full rounded-xl border border-[#633916] bg-[#251408] px-4 py-2.5 text-sm text-[#fefae0] placeholder:text-[#d4a373]/50 focus:border-[#ffd166] focus:outline-none"
              />
              <button
                type="submit"
                disabled={!input.trim() || state === "thinking"}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#331c0e] border border-[#633916] text-[#ffd166] hover:border-[#ffd166] transition disabled:opacity-40"
                aria-label="Enviar mensagem"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Loader2, Mic, Pause, Play, Send, Square, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { askAkua } from "@/lib/akua-chat.functions";
import { speakText } from "@/lib/tts.functions";
import { transcribeAudio } from "@/lib/transcribe.functions";
import { base64ToBlobUrl } from "@/lib/audio-play";
import { getPaddleEnvironment } from "@/lib/paddle";
import { PremiumGate } from "@/components/PremiumGate";
import { useVoiceRecorder, isRecordingSupported } from "@/lib/voice-recorder";

export const Route = createFileRoute("/professor-infantil")({
  head: () => ({
    meta: [
      { title: "Professor Awã Infantil — AWÃ TECH" },
      {
        name: "description",
        content:
          "Converse com o Professor Awã Infantil: fale, ouça e aprenda palavras em Patxôhã de forma simples e divertida.",
      },
      { property: "og:title", content: "Professor Awã Infantil" },
      {
        property: "og:description",
        content: "Um professor amigo para crianças aprenderem Patxôhã falando e ouvindo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
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
  "Akxãy, parente pequeno! 🌿 Eu sou o Professor Awã. Toque no botão grande e fale comigo — eu te ensino palavrinhas em Patxôhã! 🦜";

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

  const statusText =
    state === "listening"
      ? "Ouvindo você… 👂"
      : state === "thinking"
        ? "Pensando… 🤔"
        : state === "speaking"
          ? "Falando… 🗣️"
          : "Toque para falar comigo!";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fffdf3] via-[#fef3c7] to-[#dcfce7] font-['Fredoka','Baloo_2',sans-serif]">
      <header className="sticky top-0 z-30 border-b-4 border-white/70 bg-gradient-to-r from-[#ffd166] via-[#ef476f] to-[#06d6a0] px-3 py-3">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <Link
            to="/infantil"
            className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border-4 border-white bg-white text-[#ef476f] shadow-[0_6px_0_rgba(0,0,0,0.15)] active:translate-y-0.5 active:shadow-none"
            aria-label="Voltar"
          >
            <ArrowLeft className="h-7 w-7" strokeWidth={3} />
          </Link>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-black uppercase text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.2)]">
              Professor Awã
            </h1>
            <p className="text-xs font-bold text-white/90">Seu amigo do Patxôhã 🌿</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-64 pt-5">
        <div className="flex flex-col gap-3">
          {messages.map((m, i) => (
            <div
              key={i}
              className={m.role === "user" ? "flex justify-end" : "flex items-start gap-2"}
            >
              {m.role === "assistant" && (
                <div
                  className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border-4 border-white bg-[#06d6a0] text-2xl shadow-[0_4px_0_rgba(0,0,0,0.12)] ${
                    state === "speaking" ? "animate-bounce" : ""
                  }`}
                  aria-hidden
                >
                  🦜
                </div>
              )}
              <div
                className={
                  m.role === "user"
                    ? "max-w-[80%] rounded-3xl rounded-br-md border-4 border-white bg-[#118ab2] px-4 py-3 text-base font-bold text-white shadow-[0_5px_0_rgba(0,0,0,0.12)]"
                    : "max-w-[85%] rounded-3xl rounded-bl-md border-4 border-white bg-white px-4 py-3 text-base font-semibold text-[#3a2412] shadow-[0_5px_0_rgba(0,0,0,0.1)]"
                }
              >
                <p className="whitespace-pre-wrap leading-relaxed">{clean(m.content)}</p>
                {m.role === "assistant" && i > 0 && (
                  <button
                    type="button"
                    onClick={() => playReply(m.content)}
                    className="mt-2 inline-flex items-center gap-1 rounded-xl bg-[#ffd166] px-3 py-1.5 text-sm font-black text-[#3a2412] shadow-[0_3px_0_rgba(0,0,0,0.12)] active:translate-y-0.5 active:shadow-none"
                  >
                    <Volume2 className="h-4 w-4" strokeWidth={3} /> Ouvir
                  </button>
                )}
              </div>
            </div>
          ))}
          {state === "thinking" && (
            <div className="flex items-center gap-2 text-base font-black text-[#ef476f]">
              <Loader2 className="h-5 w-5 animate-spin" /> Pensando… 🤔
            </div>
          )}
          <div ref={endRef} />
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t-4 border-white bg-[#fffdf3]/95 px-4 pb-5 pt-3 backdrop-blur">
        <div className="mx-auto max-w-3xl">
          <p
            aria-live="polite"
            className="mb-2 text-center text-sm font-black uppercase tracking-wide text-[#118ab2]"
          >
            {statusText}
          </p>

          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={handleMic}
              disabled={state === "thinking"}
              className={`flex w-full max-w-sm items-center justify-center gap-3 rounded-3xl border-4 border-white px-6 py-5 text-xl font-black uppercase text-white shadow-[0_8px_0_rgba(0,0,0,0.18)] transition-transform active:translate-y-1 active:shadow-none disabled:opacity-60 ${
                recorder.isRecording ? "animate-pulse bg-[#ef476f]" : "bg-[#06d6a0]"
              }`}
            >
              {recorder.isRecording ? (
                <>
                  <Square className="h-7 w-7" strokeWidth={3} /> Pronto!
                </>
              ) : (
                <>
                  <Mic className="h-7 w-7" strokeWidth={3} /> Falar
                </>
              )}
            </button>

            {state === "speaking" && (
              <div className="flex items-center gap-2">
                {paused ? (
                  <button
                    type="button"
                    onClick={() => {
                      void audioRef.current?.play().catch(() => {});
                      setPaused(false);
                    }}
                    className="inline-flex items-center gap-1 rounded-2xl border-4 border-white bg-[#ffd166] px-4 py-2 text-sm font-black uppercase text-[#3a2412] shadow-[0_4px_0_rgba(0,0,0,0.12)] active:translate-y-0.5 active:shadow-none"
                  >
                    <Play className="h-5 w-5" strokeWidth={3} /> Continuar
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      audioRef.current?.pause();
                      setPaused(true);
                    }}
                    className="inline-flex items-center gap-1 rounded-2xl border-4 border-white bg-[#ffd166] px-4 py-2 text-sm font-black uppercase text-[#3a2412] shadow-[0_4px_0_rgba(0,0,0,0.12)] active:translate-y-0.5 active:shadow-none"
                  >
                    <Pause className="h-5 w-5" strokeWidth={3} /> Pausar
                  </button>
                )}
                <button
                  type="button"
                  onClick={stopVoice}
                  className="inline-flex items-center gap-1 rounded-2xl border-4 border-white bg-[#ef476f] px-4 py-2 text-sm font-black uppercase text-white shadow-[0_4px_0_rgba(0,0,0,0.12)] active:translate-y-0.5 active:shadow-none"
                >
                  <Square className="h-5 w-5" strokeWidth={3} /> Parar
                </button>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void send(input, false);
              }}
              className="flex w-full items-center gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ou escreva aqui…"
                className="min-w-0 flex-1 rounded-2xl border-4 border-white bg-white px-4 py-3 text-base font-semibold text-[#3a2412] shadow-[0_4px_0_rgba(0,0,0,0.08)] outline-none placeholder:text-[#3a2412]/40"
              />
              <button
                type="submit"
                disabled={!input.trim() || state === "thinking"}
                className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border-4 border-white bg-[#118ab2] text-white shadow-[0_5px_0_rgba(0,0,0,0.15)] active:translate-y-0.5 active:shadow-none disabled:opacity-50"
                aria-label="Enviar"
              >
                <Send className="h-6 w-6" strokeWidth={3} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

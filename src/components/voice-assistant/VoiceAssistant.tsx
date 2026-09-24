import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Mic, MicOff, Pause, Play, RotateCcw, Square, X, Loader2, AudioLines } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { askVoiceAssistant } from "@/lib/voice-assistant.functions";
import { transcribeAudio } from "@/lib/transcribe.functions";

export type AssistantConfig = { enabled: boolean; name: string; icon_url: string };
export const DEFAULT_ASSISTANT_CONFIG: AssistantConfig = { enabled: true, name: "Akuã", icon_url: "" };

type Phase = "idle" | "listening" | "processing" | "speaking";
type Msg = { role: "user" | "assistant"; content: string };
type Direction = "auto" | "pt-pat" | "pat-pt";
const DIR_LABEL: Record<Direction, string> = { auto: "Automático", "pt-pat": "PT → Patxôhã", "pat-pt": "Patxôhã → PT" };

const PHASE_LABEL: Record<Phase, string> = {
  idle: "Aguardando",
  listening: "Ouvindo…",
  processing: "Pensando…",
  speaking: "Falando…",
};

const SPEECH_TH = 0.035; // nível de voz
const SILENCE_MS = 1300; // silêncio para encerrar a fala
const BARGE_MS = 350; // fala contínua para interromper a IA

export function useAssistantConfig() {
  return useQuery({
    queryKey: ["site_config", "voice_assistant"],
    queryFn: async () => {
      const { data } = await supabase.from("site_config").select("value").eq("key", "voice_assistant").maybeSingle();
      return { ...DEFAULT_ASSISTANT_CONFIG, ...((data?.value as Partial<AssistantConfig>) ?? {}) };
    },
    staleTime: 60_000,
  });
}

function pickMime() {
  for (const c of ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"]) {
    try {
      if (MediaRecorder.isTypeSupported(c)) return c;
    } catch {
      /* ignore */
    }
  }
  return undefined;
}

export function VoiceAssistant() {
  const { session } = useAuth();
  const { data: cfg } = useAssistantConfig();
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [micOn, setMicOn] = useState(true);
  const [paused, setPaused] = useState(false);
  const [heard, setHeard] = useState("");
  const [reply, setReply] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [level, setLevel] = useState(0);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [live, setLive] = useState("");
  const [direction, setDirection] = useState<Direction>("auto");
  const dirRef = useRef<Direction>("auto");
  const srRef = useRef<{ stop: () => void; abort: () => void } | null>(null);

  const stopLive = useCallback(() => {
    try { srRef.current?.abort(); } catch { /* ignore */ }
    srRef.current = null;
    setLive("");
  }, []);

  const startLive = useCallback(() => {
    stopLive();
    const W = window as unknown as Record<string, unknown>;
    const SR = (W.SpeechRecognition || W.webkitSpeechRecognition) as
      | (new () => {
          lang: string; continuous: boolean; interimResults: boolean;
          onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
          onerror: () => void; start: () => void; stop: () => void; abort: () => void;
        })
      | undefined;
    if (!SR) return;
    try {
      const r = new SR();
      r.lang = "pt-BR";
      r.continuous = true;
      r.interimResults = true;
      r.onresult = (e) => {
        let t = "";
        for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript;
        setLive(t);
      };
      r.onerror = () => {};
      r.start();
      srRef.current = r;
    } catch { /* ignore */ }
  }, [stopLive]);

  const history = useRef<Msg[]>([]);
  const phaseRef = useRef<Phase>("idle");
  const micOnRef = useRef(true);
  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const loopRef = useRef<number | null>(null);
  const vad = useRef({ spoke: false, lastVoice: 0, startedAt: 0, loudSince: 0 });
  const lastAudioUrl = useRef<string | null>(null);

  const setP = (p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  };

  const stopAudio = useCallback(() => {
    const a = audioRef.current;
    if (a) {
      a.onended = null;
      a.pause();
    }
    setPaused(false);
  }, []);

  const startListening = useCallback(() => {
    const stream = streamRef.current;
    if (!stream || !micOnRef.current) {
      setP("idle");
      return;
    }
    stopAudio();
    chunks.current = [];
    const mime = pickMime();
    const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
    rec.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
    rec.start(250);
    recRef.current = rec;
    vad.current = { spoke: false, lastVoice: 0, startedAt: performance.now(), loudSince: 0 };
    setP("listening");
    startLive();
  }, [stopAudio, startLive]);

  const playReply = useCallback(
    async (text: string, reuse = false) => {
      setP("speaking");
      try {
        let url = reuse ? lastAudioUrl.current : null;
        if (!url) {
          const { getNarrationUrl } = await import("@/lib/narration-cache");
          url = await getNarrationUrl({ text, lang: "pt", mode: "story", voice: "onyx" });
          lastAudioUrl.current = url;
        }
        if (phaseRef.current !== "speaking") return;
        if (!url) throw new Error("sem áudio");
        const a = audioRef.current ?? new Audio();
        audioRef.current = a;
        a.src = url;
        a.onended = () => {
          if (phaseRef.current === "speaking") startListening();
        };
        await a.play();
      } catch {
        // Fallback: voz do navegador
        try {
          const u = new SpeechSynthesisUtterance(text);
          u.lang = "pt-BR";
          u.onend = () => phaseRef.current === "speaking" && startListening();
          speechSynthesis.cancel();
          speechSynthesis.speak(u);
        } catch {
          startListening();
        }
      }
    },
    [startListening],
  );

  const processSpeech = useCallback(async () => {
    const rec = recRef.current;
    if (!rec) return;
    setP("processing");
    stopLive();
    await new Promise<void>((res) => {
      rec.onstop = () => res();
      try {
        rec.stop();
      } catch {
        res();
      }
    });
    recRef.current = null;
    const blob = new Blob(chunks.current, { type: rec.mimeType || "audio/webm" });
    if (blob.size < 2000) return startListening();
    try {
      setError(null);
      const fd = new FormData();
      const ext = (rec.mimeType || "").includes("mp4") ? "m4a" : "webm";
      fd.append("file", new File([blob], `fala.${ext}`, { type: blob.type }));
      fd.append("language", "pt");
      const stt = await transcribeAudio({ data: fd });
      const text = (stt.text || "").trim();
      if (!text) {
        if (stt.message) setError(stt.message);
        return startListening();
      }
      setHeard(text);
      history.current.push({ role: "user", content: text });
      setMsgs([...history.current]);
      const out = await askVoiceAssistant({
        data: { messages: history.current, name: cfg?.name, direction: dirRef.current },
      });
      if (phaseRef.current !== "processing") return;
      history.current.push({ role: "assistant", content: out.reply });
      setReply(out.reply);
      setMsgs([...history.current]);
      lastAudioUrl.current = null;
      await playReply(out.reply);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não consegui entender agora.");
      startListening();
    }
  }, [cfg?.name, playReply, startListening, stopLive]);

  // Laço de detecção de voz (silêncio + interrupção natural)
  const tick = useCallback(() => {
    const an = analyserRef.current;
    if (an) {
      const buf = new Float32Array(an.fftSize);
      an.getFloatTimeDomainData(buf);
      let sum = 0;
      for (const v of buf) sum += v * v;
      const rms = Math.sqrt(sum / buf.length);
      setLevel(Math.min(1, rms * 12));
      const now = performance.now();
      const p = phaseRef.current;
      const v = vad.current;
      if (p === "listening") {
        if (rms > SPEECH_TH) {
          v.spoke = true;
          v.lastVoice = now;
        }
        if (v.spoke && now - v.lastVoice > SILENCE_MS) void processSpeech();
        else if (!v.spoke && now - v.startedAt > 15000) startListening(); // reinicia para não acumular silêncio
      } else if (p === "speaking" && micOnRef.current) {
        if (rms > SPEECH_TH * 2.2) {
          if (!v.loudSince) v.loudSince = now;
          if (now - v.loudSince > BARGE_MS) {
            try {
              speechSynthesis.cancel();
            } catch {
              /* ignore */
            }
            startListening();
          }
        } else v.loudSince = 0;
      }
    }
    loopRef.current = window.setTimeout(tick, 80);
  }, [processSpeech, startListening]);

  const endConversation = useCallback(() => {
    if (loopRef.current) window.clearTimeout(loopRef.current);
    loopRef.current = null;
    try {
      recRef.current?.stop();
    } catch {
      /* ignore */
    }
    recRef.current = null;
    stopAudio();
    stopLive();
    try {
      speechSynthesis.cancel();
    } catch {
      /* ignore */
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    void ctxRef.current?.close().catch(() => {});
    ctxRef.current = null;
    analyserRef.current = null;
    history.current = [];
    setMsgs([]);
    setHeard("");
    setReply("");
    setError(null);
    setP("idle");
    setOpen(false);
  }, [stopAudio, stopLive]);

  const openConversation = useCallback(async () => {
    setOpen(true);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      streamRef.current = stream;
      const ctx = new AudioContext();
      const src = ctx.createMediaStreamSource(stream);
      const an = ctx.createAnalyser();
      an.fftSize = 1024;
      src.connect(an);
      ctxRef.current = ctx;
      analyserRef.current = an;
      micOnRef.current = true;
      setMicOn(true);
      startListening();
      tick();
    } catch {
      setError("Permita o uso do microfone para conversar por voz.");
      setP("idle");
    }
  }, [startListening, tick]);

  useEffect(() => () => endConversation(), [endConversation]);

  const toggleMic = () => {
    const next = !micOn;
    micOnRef.current = next;
    setMicOn(next);
    streamRef.current?.getAudioTracks().forEach((t) => (t.enabled = next));
    if (!next && phaseRef.current === "listening") {
      try {
        recRef.current?.stop();
      } catch {
        /* ignore */
      }
      recRef.current = null;
      stopLive();
      setP("idle");
    } else if (next && phaseRef.current === "idle") startListening();
  };

  const togglePause = () => {
    const a = audioRef.current;
    if (!a || phaseRef.current !== "speaking") return;
    if (a.paused) {
      void a.play();
      setPaused(false);
    } else {
      a.pause();
      setPaused(true);
    }
  };

  const repeat = () => {
    if (!reply) return;
    try {
      recRef.current?.stop();
    } catch {
      /* ignore */
    }
    recRef.current = null;
    void playReply(reply, true);
  };

  const stopTalking = () => {
    try {
      speechSynthesis.cancel();
    } catch {
      /* ignore */
    }
    startListening();
  };

  if (!session || !cfg?.enabled) return null;

  const name = cfg.name || "Akuã";
  const ring =
    phase === "listening"
      ? "ring-leaf"
      : phase === "processing"
        ? "ring-gold animate-pulse"
        : phase === "speaking"
          ? "ring-primary"
          : "ring-gold/50";

  const Avatar = ({ size }: { size: string }) =>
    cfg.icon_url ? (
      <img src={cfg.icon_url} alt={name} className={`${size} rounded-full object-cover`} />
    ) : (
      <span className={`${size} grid place-items-center rounded-full bg-[var(--gradient-leaf)] text-cream`}>
        <AudioLines className="h-1/2 w-1/2" />
      </span>
    );

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={openConversation}
          aria-label={`Conversar por voz com ${name}`}
          className="fixed bottom-24 right-4 z-[70] rounded-full p-1 shadow-[var(--shadow-glow)] ring-2 ring-gold/60 transition hover:scale-105 sm:bottom-6 sm:right-6"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <Avatar size="h-14 w-14" />
        </button>
      )}

      {open && (
        <div
          className="fixed inset-x-3 bottom-3 z-[80] mx-auto max-w-md rounded-3xl border border-gold/30 bg-card/95 p-5 text-cream shadow-2xl backdrop-blur sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-96"
          role="dialog"
          aria-label={`Conversa por voz com ${name}`}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span
                className={`relative rounded-full ring-4 transition ${ring}`}
                style={{ transform: phase === "listening" ? `scale(${1 + level * 0.25})` : undefined }}
              >
                <Avatar size="h-12 w-12" />
              </span>
              <div>
                <div className="font-display text-lg font-black">{name}</div>
                <div className="flex items-center gap-1 text-xs text-foreground/70" aria-live="polite">
                  {phase === "processing" && <Loader2 className="h-3 w-3 animate-spin" />}
                  {!micOn && phase === "idle" ? "Desligado" : PHASE_LABEL[phase]}
                </div>
              </div>
            </div>
            <button onClick={endConversation} aria-label="Encerrar conversa" className="rounded-full p-2 hover:bg-foreground/10">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-1" role="radiogroup" aria-label="Direção da tradução">
            {(Object.keys(DIR_LABEL) as Direction[]).map((d) => (
              <button
                key={d}
                role="radio"
                aria-checked={direction === d}
                onClick={() => {
                  dirRef.current = d;
                  setDirection(d);
                }}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${direction === d ? "bg-gold text-background" : "bg-foreground/10"}`}
              >
                {DIR_LABEL[d]}
              </button>
            ))}
          </div>

          <div className="mt-4 max-h-56 space-y-3 overflow-y-auto text-sm">
            {!msgs.length && !live && (
              <p className="text-foreground/70">Pode falar. Ex.: “Como fala água em Patxôhã?”</p>
            )}
            {msgs.map((m, i) =>
              m.role === "user" ? (
                <div key={i} className="ml-auto w-fit max-w-[85%] rounded-2xl bg-foreground/10 px-3 py-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">Você</div>
                  {m.content}
                </div>
              ) : (
                <div key={i} className="w-fit max-w-[90%] rounded-2xl bg-gold/15 px-3 py-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gold/80">Awã Tech</div>
                  {m.content}
                </div>
              ),
            )}
            {live && phase === "listening" && (
              <div className="ml-auto w-fit max-w-[85%] rounded-2xl border border-dashed border-foreground/30 px-3 py-2 italic text-foreground/80">
                <div className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">Você</div>
                {live}
              </div>
            )}
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          <div className="mt-5 flex items-center justify-center gap-3">
            <button onClick={togglePause} disabled={phase !== "speaking"} aria-label={paused ? "Continuar" : "Pausar"} className="rounded-full bg-foreground/10 p-3 disabled:opacity-40">
              {paused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
            </button>
            <button onClick={repeat} disabled={!reply || phase === "processing"} aria-label="Repetir resposta" className="rounded-full bg-foreground/10 p-3 disabled:opacity-40">
              <RotateCcw className="h-5 w-5" />
            </button>
            <button
              onClick={toggleMic}
              aria-label={micOn ? "Desligar microfone" : "Ligar microfone"}
              className={`rounded-full p-4 ${micOn ? "bg-primary text-primary-foreground" : "bg-foreground/15"}`}
            >
              {micOn ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
            </button>
            <button onClick={stopTalking} disabled={phase !== "speaking"} aria-label="Parar a fala" className="rounded-full bg-foreground/10 p-3 disabled:opacity-40">
              <Square className="h-5 w-5" />
            </button>
            <button onClick={endConversation} aria-label="Encerrar" className="rounded-full bg-destructive/80 p-3 text-destructive-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

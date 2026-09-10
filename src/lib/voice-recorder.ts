import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Gravador de voz simples e resiliente (MediaRecorder).
 * Não lança erros para fora: devolve mensagens amigáveis via `error`.
 */
export type RecorderState = "idle" | "requesting" | "recording";

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];
  for (const c of candidates) {
    try {
      if (MediaRecorder.isTypeSupported(c)) return c;
    } catch {
      /* ignora */
    }
  }
  return undefined;
}

export function isRecordingSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof MediaRecorder !== "undefined" &&
    !!navigator?.mediaDevices?.getUserMedia
  );
}

export function useVoiceRecorder() {
  const [state, setState] = useState<RecorderState>("idle");
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const cleanup = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    recorderRef.current = null;
    chunksRef.current = [];
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const start = useCallback(async (): Promise<boolean> => {
    if (state !== "idle") return false;
    setError(null);
    if (!isRecordingSupported()) {
      setError("unsupported");
      return false;
    }
    try {
      setState("requesting");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = pickMimeType();
      const rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorderRef.current = rec;
      rec.start(250);
      setState("recording");
      return true;
    } catch {
      cleanup();
      setState("idle");
      setError("permission");
      return false;
    }
  }, [cleanup, state]);

  /** Finaliza a gravação e devolve o arquivo (ou null se nada foi capturado). */
  const stop = useCallback(async (): Promise<File | null> => {
    const rec = recorderRef.current;
    if (!rec) {
      cleanup();
      setState("idle");
      return null;
    }
    const blob = await new Promise<Blob | null>((resolve) => {
      const finish = () => {
        const type = rec.mimeType || "audio/webm";
        resolve(chunksRef.current.length ? new Blob(chunksRef.current, { type }) : null);
      };
      rec.onstop = finish;
      try {
        if (rec.state !== "inactive") rec.stop();
        else finish();
      } catch {
        finish();
      }
    });
    cleanup();
    setState("idle");
    if (!blob || blob.size < 1200) return null;
    const ext = blob.type.includes("mp4") ? "mp4" : blob.type.includes("ogg") ? "ogg" : "webm";
    return new File([blob], `fala.${ext}`, { type: blob.type });
  }, [cleanup]);

  const cancel = useCallback(() => {
    try {
      if (recorderRef.current && recorderRef.current.state !== "inactive") {
        recorderRef.current.onstop = null;
        recorderRef.current.stop();
      }
    } catch {
      /* ignora */
    }
    cleanup();
    setState("idle");
  }, [cleanup]);

  return { state, error, start, stop, cancel, isRecording: state === "recording" };
}

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Web Speech API Helper & Hook para Speech-to-Text nativo no navegador (sem gastar tokens de IA).
 * Suportado nativamente em Chrome, Edge, Safari, iOS WebViews e Android.
 */

export interface BrowserSpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string; message?: string }) => void) | null;
  onresult: ((event: {
    resultIndex: number;
    results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal?: boolean }>;
  }) => void) | null;
}

export type BrowserSpeechConstructor = new () => BrowserSpeechRecognitionInstance;

/** Detecta se o navegador suporta Web Speech API nativa */
export function getBrowserSpeechRecognition(): BrowserSpeechConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: BrowserSpeechConstructor;
    webkitSpeechRecognition?: BrowserSpeechConstructor;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function isBrowserSpeechSupported(): boolean {
  return !!getBrowserSpeechRecognition();
}

export interface StartSpeechOptions {
  lang?: string;
  initialText?: string;
  onLiveText?: (text: string) => void;
  onFinalText?: (text: string) => void;
}

export function useBrowserSpeech(defaultLang = "pt-BR") {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<BrowserSpeechRecognitionInstance | null>(null);
  const prefixRef = useRef("");
  const latestTextRef = useRef("");
  const onLiveTextRef = useRef<((text: string) => void) | null>(null);
  const onFinalTextRef = useRef<((text: string) => void) | null>(null);
  const isManuallyStoppedRef = useRef(false);

  useEffect(() => {
    setIsSupported(isBrowserSpeechSupported());
  }, []);

  const cleanup = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        /* ignora */
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  useEffect(() => cleanup, [cleanup]);

  /** Inicia a escuta de fala nativa */
  const start = useCallback(
    async (options?: StartSpeechOptions): Promise<boolean> => {
      setError(null);
      const SpeechConstructor = getBrowserSpeechRecognition();
      if (!SpeechConstructor) {
        setError("unsupported");
        return false;
      }

      // Se já estiver ouvindo, finaliza primeiro
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          /* ignora */
        }
      }

      prefixRef.current = (options?.initialText ?? "").trim();
      latestTextRef.current = prefixRef.current;
      onLiveTextRef.current = options?.onLiveText || null;
      onFinalTextRef.current = options?.onFinalText || null;
      isManuallyStoppedRef.current = false;
      setTranscript(prefixRef.current);
      setInterimTranscript("");

      try {
        const rec = new SpeechConstructor();
        rec.lang = options?.lang || defaultLang;
        rec.continuous = true;
        rec.interimResults = true;
        rec.maxAlternatives = 1;

        rec.onstart = () => {
          setIsListening(true);
        };

        rec.onresult = (event) => {
          let fullFinal = "";
          let fullInterim = "";

          for (let i = 0; i < event.results.length; i++) {
            const item = event.results[i];
            const text = item[0]?.transcript || "";
            if (item.isFinal) {
              fullFinal += text;
            } else {
              fullInterim += text;
            }
          }

          const cleanFinal = fullFinal.trim();
          const cleanInterim = fullInterim.trim();

          const base = prefixRef.current;
          const mergedFinal = base
            ? `${base}${cleanFinal ? ` ${cleanFinal}` : ""}`.trim()
            : cleanFinal;

          const totalLive = cleanInterim
            ? `${mergedFinal ? `${mergedFinal} ` : ""}${cleanInterim}`.trim()
            : mergedFinal;

          setTranscript(mergedFinal);
          setInterimTranscript(cleanInterim);
          latestTextRef.current = totalLive;

          if (onLiveTextRef.current) {
            onLiveTextRef.current(totalLive);
          }
        };

        rec.onerror = (e) => {
          if (e.error === "no-speech") {
            // Silêncio temporário, não é erro crítico
            return;
          }
          if (e.error === "not-allowed" || e.error === "service-not-allowed") {
            setError("permission");
          } else {
            setError(e.error || "error");
          }
        };

        rec.onend = () => {
          setIsListening(false);
          recognitionRef.current = null;
          const finalText = latestTextRef.current.trim();
          if (onFinalTextRef.current && finalText && !isManuallyStoppedRef.current) {
            onFinalTextRef.current(finalText);
          }
        };

        recognitionRef.current = rec;
        rec.start();
        setIsListening(true);
        return true;
      } catch (err: unknown) {
        cleanup();
        setError("start_failed");
        return false;
      }
    },
    [cleanup, defaultLang]
  );

  /** Finaliza e devolve o texto acumulado */
  const stop = useCallback((): string => {
    isManuallyStoppedRef.current = true;
    const finalResult = latestTextRef.current.trim();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        /* ignora */
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimTranscript("");
    return finalResult;
  }, []);

  /** Cancela sem salvar */
  const cancel = useCallback(() => {
    isManuallyStoppedRef.current = true;
    cleanup();
    setTranscript("");
    setInterimTranscript("");
    latestTextRef.current = "";
  }, [cleanup]);

  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    error,
    start,
    stop,
    cancel,
  };
}

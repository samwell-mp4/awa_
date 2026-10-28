// Fast, reliable free browser TTS via SpeechSynthesis.
// - Pre-loads voices (async in Chrome) and caches the best match per lang.
// - Warms up the engine on the first user gesture (fixes first-click delay).
// - Cancels + tiny delay before speak() to avoid the Chrome "silent" bug.
// - Silent no-op on unsupported browsers / SSR.

type VoiceMap = Record<string, SpeechSynthesisVoice | undefined>;
const voiceCache: VoiceMap = {};
let voicesReady = false;
let warmed = false;

function synth(): SpeechSynthesis | null {
  if (typeof window === "undefined") return null;
  return window.speechSynthesis ?? null;
}

function pickVoice(lang: string): SpeechSynthesisVoice | undefined {
  const key = lang.toLowerCase();
  if (voiceCache[key]) return voiceCache[key];
  const s = synth();
  if (!s) return undefined;
  const list = s.getVoices();
  if (!list.length) return undefined;
  const lower = key;
  const short = lower.slice(0, 2);
  const found =
    list.find((v) => v.lang?.toLowerCase() === lower && v.localService) ||
    list.find((v) => v.lang?.toLowerCase() === lower) ||
    list.find((v) => v.lang?.toLowerCase().startsWith(short) && v.localService) ||
    list.find((v) => v.lang?.toLowerCase().startsWith(short));
  voiceCache[key] = found;
  return found;
}

function ensureVoicesLoaded() {
  const s = synth();
  if (!s || voicesReady) return;
  const load = () => {
    if (s.getVoices().length) {
      voicesReady = true;
      // pre-warm common langs
      pickVoice("pt-BR");
      pickVoice("en-US");
    }
  };
  load();
  if (!voicesReady && "onvoiceschanged" in s) {
    s.addEventListener("voiceschanged", load, { once: true });
  }
}

function warmUp() {
  if (warmed) return;
  const s = synth();
  if (!s) return;
  warmed = true;
  try {
    // Silent utterance primes the engine so the first real speak is instant.
    const u = new SpeechSynthesisUtterance(" ");
    u.volume = 0;
    u.rate = 1;
    s.speak(u);
    s.cancel();
  } catch {
    /* ignore */
  }
}

if (typeof window !== "undefined") {
  ensureVoicesLoaded();
  const onFirst = () => {
    warmUp();
    window.removeEventListener("pointerdown", onFirst);
    window.removeEventListener("keydown", onFirst);
  };
  window.addEventListener("pointerdown", onFirst, { once: true });
  window.addEventListener("keydown", onFirst, { once: true });
}

import { cleanTextForSpeech } from "@/lib/clean-speech-text";
import { getTrilhaAudioUrl } from "@/lib/trilhas-audio-catalog";

// Voz padrão do site: narração natural (IA) com a mesma voz em todas as telas.
// "alloy" é a voz oficial equilibrada e mais clara em alto-falantes de celular e desktop.
const SITE_VOICE = "alloy";
let playToken = 0;
let activeUtterance: SpeechSynthesisUtterance | null = null;

/**
 * Fala um texto com áudio oficial das trilhas prioritariamente (0 tokens de IA).
 * Se não houver áudio pré-gravado, utiliza síntese offline ou narração de histórias.
 */
export function speak(
  rawText: string,
  lang: string = "pt-BR",
  rate: number = 1,
  onStart?: () => void,
  onEnd?: () => void,
  onBoundary?: (charIndex: number) => void
) {
  if (!rawText) return;
  const text = cleanTextForSpeech(rawText);
  if (!text) return;

  // 1. Áudio Oficial das Trilhas (Pataxó nativo): prioridade total e 0 tokens de IA
  const localUrl = getTrilhaAudioUrl(text);
  if (localUrl && typeof window !== "undefined") {
    stopSpeak();
    const token = ++playToken;
    void import("@/lib/audio-play").then(async ({ playFast, attachEndHandler }) => {
      if (token !== playToken) return;
      attachEndHandler(() => {
        if (token === playToken) onEnd?.();
      });
      onStart?.();
      try {
        await playFast(localUrl);
      } catch (err) {
        console.warn("Falha ao tocar áudio local da trilha:", err);
        if (token === playToken) speakWithBrowser(text, lang, rate, onStart, onEnd, onBoundary);
      }
    });
    registerStopOnPointerDown();
    return;
  }

  // 2. Para palavras individuais fora do catálogo, usa a voz do navegador sem gastar tokens de IA
  const isShortWord = text.trim().split(/\s+/).length <= 3;
  if (isShortWord) {
    speakWithBrowser(text, lang, rate, onStart, onEnd, onBoundary);
    return;
  }

  if (!onBoundary && typeof window !== "undefined") {
    stopSpeak();
    const token = ++playToken;

    // Rápido fallback: se a narração demorar mais de 3.5s ou falhar, usa voz do navegador
    const timeoutPromise = new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), 3500)
    );

    const mode = "story";

    const narrationPromise = import("@/lib/narration-cache")
      .then(({ getNarrationUrl }) =>
        getNarrationUrl({ text, lang, mode, voice: SITE_VOICE })
      )
      .catch(() => null);

    Promise.race([narrationPromise, timeoutPromise])
      .then(async (url) => {
        if (token !== playToken) return;
        if (!url) {
          speakWithBrowser(text, lang, rate, onStart, onEnd);
          return;
        }
        const { playFast, attachEndHandler } = await import("@/lib/audio-play");
        if (token !== playToken) return;
        attachEndHandler(() => {
          if (token === playToken) onEnd?.();
        });
        onStart?.();
        await playFast(url).catch(() => {
          if (token === playToken) speakWithBrowser(text, lang, rate, onStart, onEnd);
        });
      })
      .catch(() => {
        if (token === playToken) speakWithBrowser(text, lang, rate, onStart, onEnd);
      });

    registerStopOnPointerDown();
    return;
  }

  speakWithBrowser(text, lang, rate, onStart, onEnd, onBoundary);
}

function registerStopOnPointerDown() {
  if (typeof window === "undefined") return;
  const startTime = Date.now();
  const stopHandler = (e: Event) => {
    // Não cancela se o toque foi imediato (mesmo clique do botão) ou se clicou em controle de áudio
    if (Date.now() - startTime < 350) return;
    const target = e.target as HTMLElement | null;
    if (target?.closest("button") || target?.closest("[data-speech-control]")) return;
    stopSpeak();
    window.removeEventListener("pointerdown", stopHandler);
  };
  window.addEventListener("pointerdown", stopHandler, { once: true });
}

function speakWithBrowser(
  rawText: string,
  lang: string = "pt-BR",
  rate: number = 1,
  onStart?: () => void,
  onEnd?: () => void,
  onBoundary?: (charIndex: number) => void
) {
  const text = cleanTextForSpeech(rawText);
  const s = synth();
  if (!s || !text) {
    onEnd?.();
    return;
  }
  try {
    ensureVoicesLoaded();

    // Cancela qualquer fala em andamento e acorda motor Chrome
    s.cancel();
    if ("resume" in s) {
      s.resume();
    }

    const start = () => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang;
      u.rate = rate;
      u.pitch = 1.05;
      u.volume = 1;
      const v = pickVoice(lang);
      if (v) u.voice = v;

      activeUtterance = u;
      (window as any).__awa_active_utterance = u;

      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        activeUtterance = null;
        onEnd?.();
      };

      u.onstart = () => {
        onStart?.();
      };
      u.onend = finish;
      u.onerror = finish;

      // Trava de segurança para evitar estado congelado se o sintetizador do SO pendurar
      const maxMs = Math.max(3500, Math.min(15000, text.length * 150));
      setTimeout(finish, maxMs);

      if (onBoundary) {
        u.onboundary = (event) => {
          if (event.name === "word") {
            onBoundary(event.charIndex);
          }
        };
      }
      s.speak(u);
    };

    // Pequeno delay para contornar bug do Chromium com s.cancel() síncrono
    setTimeout(start, 20);
  } catch {
    onEnd?.();
  }
}

export function stopSpeak() {
  playToken++;
  activeUtterance = null;
  if (typeof window !== "undefined") {
    (window as any).__awa_active_utterance = null;
    void import("@/lib/audio-play").then(({ stopFast }) => stopFast());
  }
  const s = synth();
  if (!s) return;
  try {
    s.cancel();
  } catch {
    /* ignore */
  }
}

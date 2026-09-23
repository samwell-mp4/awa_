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

// Voz padrão do site: narração natural (IA) com a mesma voz em todas as telas.
const SITE_VOICE = "onyx";
let playToken = 0;

/**
 * Fala um texto com a voz oficial do site.
 * Usa a narração natural (mais real e profissional) e, se ela falhar,
 * cai para a voz do navegador. Quando `onBoundary` é pedido (legendas
 * palavra por palavra), usa direto a voz do navegador.
 */
export function speak(text: string, lang: string = "pt-BR", rate: number = 1, onStart?: () => void, onEnd?: () => void, onBoundary?: (charIndex: number) => void) {
  if (!text) return;

  if (!onBoundary && typeof window !== "undefined") {
    const token = ++playToken;
    stopSpeak();
    void import("@/lib/narration-cache")
      .then(({ getNarrationUrl }) =>
        getNarrationUrl({ text, lang, mode: "story", voice: SITE_VOICE }),
      )
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
  const stopHandler = () => {
    stopSpeak();
    window.removeEventListener("pointerdown", stopHandler);
  };
  window.addEventListener("pointerdown", stopHandler, { once: true });
}

function speakWithBrowser(text: string, lang: string = "pt-BR", rate: number = 1, onStart?: () => void, onEnd?: () => void, onBoundary?: (charIndex: number) => void) {
  const s = synth();
  if (!s || !text) return;
  try {
    ensureVoicesLoaded();
    
    
    // Cancela qualquer áudio em execução antes de iniciar o novo
    s.cancel();

    const start = () => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang;
      u.rate = rate;
      u.pitch = 1.05;
      u.volume = 1;
      const v = pickVoice(lang);
      if (v) u.voice = v;
      if (onStart) u.onstart = onStart;
      if (onEnd) u.onend = onEnd;
      if (onBoundary) {
        u.onboundary = (event) => {
          if (event.name === "word") {
            onBoundary(event.charIndex);
          }
        };
      }
      s.speak(u);
    };
    start();

    // Adiciona listener global para parar o áudio ao clicar em qualquer lugar da tela
    const stopHandler = () => {
      stopSpeak();
      window.removeEventListener("pointerdown", stopHandler);
    };
    window.addEventListener("pointerdown", stopHandler, { once: true });
  } catch {
    /* ignore */
  }
}

export function stopSpeak() {
  const s = synth();
  if (!s) return;
  try {
    s.cancel();
  } catch {
    /* ignore */
  }
}

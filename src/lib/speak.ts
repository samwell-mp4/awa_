// Fast, reliable free browser TTS via SpeechSynthesis.
// - Pre-loads voices (async in Chrome) and caches the best match per lang.
// - Warms up the engine on the first user gesture (fixes first-click delay).
// - Cancels + tiny delay before speak() to avoid the Chrome "silent" bug.
// - Silent no-op on unsupported browsers / SSR.

type VoiceMap = Record<string, SpeechSynthesisVoice | undefined>;
const voiceCache: VoiceMap = {};
let voicesReady = false;
let warmed = false;
let activeUtterance: SpeechSynthesisUtterance | null = null;


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
    u.rate = 0.85;
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

export function speak(text: string, lang: string = "pt-BR", rate: number = 0.85, pitch: number = 1.05) {
  const s = synth();
  if (!s || !text) return;
  try {
    ensureVoicesLoaded();
    // If something is speaking, cancel first. A microtask delay avoids
    // Chrome dropping the next utterance right after a cancel().
    if (s.speaking || s.pending) s.cancel();
    const start = () => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang;
      u.rate = rate;
      u.pitch = pitch;
      u.volume = 1;
      const v = pickVoice(lang);
      if (v) u.voice = v;
      
      activeUtterance = u;
      u.onend = () => {
        if (activeUtterance === u) activeUtterance = null;
      };
      u.onerror = () => {
        if (activeUtterance === u) activeUtterance = null;
      };
      
      s.speak(u);
    };

    // 30ms is enough for Chrome/Safari to release the previous utterance.
    setTimeout(start, 30);
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

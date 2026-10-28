// Fast audio playback helpers.
// Converting base64 → Blob URL is significantly faster than data: URIs for
// large mp3 payloads (browsers must decode the entire data URI on every load).
// A Blob URL is a lightweight reference and can be reused instantly on replay.

export function base64ToBlobUrl(base64: string, mime = "audio/mpeg"): string {
  const bin = atob(base64);
  const len = bin.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i);
  return URL.createObjectURL(new Blob([bytes], { type: mime }));
}

// Shared, reusable audio element — avoids the ~50-200ms cost of allocating
// a fresh HTMLAudioElement per playback on mobile.
let sharedAudio: HTMLAudioElement | null = null;
let unlocked = false;
let isSwitchingTrack = false;
let activeEndCallback: (() => void) | null = null;

function notifyActiveEnded() {
  if (activeEndCallback) {
    const cb = activeEndCallback;
    activeEndCallback = null;
    try {
      cb();
    } catch (e) {
      console.warn("[audio-play] Error in end callback:", e);
    }
  }
}

function getSharedAudio(): HTMLAudioElement {
  if (!sharedAudio) {
    sharedAudio = new Audio();
    sharedAudio.preload = "auto";

    const handleEnd = () => {
      if (isSwitchingTrack) return;
      notifyActiveEnded();
    };

    sharedAudio.addEventListener("ended", handleEnd);
    sharedAudio.addEventListener("pause", handleEnd);
    sharedAudio.addEventListener("error", handleEnd);
  }
  return sharedAudio;
}

/** Desbloqueia o pipeline de áudio no clique do usuário (necessário para iOS/Safari/Chrome mobile) */
export function primeAudio() {
  if (typeof window === "undefined") return;
  const a = getSharedAudio();
  if (!unlocked) {
    try {
      a.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
      a.play().then(() => {
        unlocked = true;
      }).catch(() => {});
    } catch {}
  }
}

/** Registra um callback para quando o áudio compartilhado terminar, pausar ou falhar. */
export function attachEndHandler(fn: () => void) {
  notifyActiveEnded();
  activeEndCallback = fn;
  getSharedAudio();
}

export async function playFast(url: string, onEnd?: () => void): Promise<void> {
  const a = getSharedAudio();

  if (onEnd) {
    notifyActiveEnded();
    activeEndCallback = onEnd;
  }

  isSwitchingTrack = true;
  try {
    a.pause();
  } catch {}

  a.src = url;
  try {
    a.currentTime = 0;
  } catch {}

  isSwitchingTrack = false;

  try {
    await a.play();
  } catch (err) {
    notifyActiveEnded();
    throw err;
  }
}

export function stopFast() {
  if (sharedAudio) {
    try {
      sharedAudio.pause();
      sharedAudio.currentTime = 0;
    } catch {}
  }
  notifyActiveEnded();
}

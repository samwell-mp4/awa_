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

/** Desbloqueia o pipeline de áudio no clique do usuário (necessário para iOS/Safari/Chrome mobile) */
export function primeAudio() {
  if (typeof window === "undefined") return;
  if (!sharedAudio) {
    sharedAudio = new Audio();
    sharedAudio.preload = "auto";
  }
  if (!unlocked) {
    try {
      sharedAudio.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
      sharedAudio.play().then(() => {
        unlocked = true;
      }).catch(() => {});
    } catch {}
  }
}

let endHandler: (() => void) | null = null;

function clearSharedListeners(a: HTMLAudioElement) {
  if (endHandler) {
    a.removeEventListener("ended", endHandler);
    a.removeEventListener("pause", endHandler);
    a.removeEventListener("error", endHandler);
    endHandler = null;
  }
}

export function playFast(url: string): Promise<void> {
  if (!sharedAudio) {
    sharedAudio = new Audio();
    sharedAudio.preload = "auto";
  }
  const a = sharedAudio;
  clearSharedListeners(a);
  try {
    a.pause();
  } catch {}
  a.src = url;
  a.currentTime = 0;
  return a.play();
}

/** Registra um callback para quando o áudio compartilhado terminar, pausar ou falhar. */
export function attachEndHandler(fn: () => void) {
  if (!sharedAudio) {
    sharedAudio = new Audio();
    sharedAudio.preload = "auto";
  }
  const a = sharedAudio;
  clearSharedListeners(a);

  let done = false;
  const onDone = () => {
    if (done) return;
    done = true;
    clearSharedListeners(a);
    fn();
  };

  endHandler = onDone;
  a.addEventListener("ended", onDone, { once: true });
  a.addEventListener("pause", onDone, { once: true });
  a.addEventListener("error", onDone, { once: true });
}

export function stopFast() {
  if (sharedAudio) {
    try {
      sharedAudio.pause();
      sharedAudio.currentTime = 0;
    } catch {}
  }
}

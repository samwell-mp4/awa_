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

export function playFast(url: string): Promise<void> {
  if (!sharedAudio) {
    sharedAudio = new Audio();
    sharedAudio.preload = "auto";
  }
  const a = sharedAudio;
  try {
    a.pause();
  } catch {}
  if (a.src !== url) a.src = url;
  a.currentTime = 0;
  return a.play();
}

let endHandler: (() => void) | null = null;

/** Registra um callback para quando o áudio compartilhado terminar. */
export function attachEndHandler(fn: () => void) {
  if (!sharedAudio) {
    sharedAudio = new Audio();
    sharedAudio.preload = "auto";
  }
  const a = sharedAudio;
  if (endHandler) a.removeEventListener("ended", endHandler);
  endHandler = fn;
  a.addEventListener("ended", fn, { once: true });
}

export function stopFast() {
  if (sharedAudio) {
    try {
      sharedAudio.pause();
    } catch {}
  }
}

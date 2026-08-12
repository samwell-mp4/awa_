// Shared client-side narration cache.
// - Survives component unmounts and route changes (module scope).
// - De-duplicates concurrent requests for the same text/lang/voice.
// - Stores ready-to-play Blob URLs so replays are instant (no base64 decode).

import { narratePublic } from "@/lib/narrate-public.functions";
import { speakText } from "@/lib/tts.functions";
import { base64ToBlobUrl } from "@/lib/audio-play";

type Mode = "story" | "word";

const urls = new Map<string, string>();
const inflight = new Map<string, Promise<string | null>>();
const MAX = 60;

function remember(key: string, url: string) {
  if (urls.size >= MAX) {
    const first = urls.keys().next().value;
    if (first) {
      const old = urls.get(first);
      if (old) URL.revokeObjectURL(old);
      urls.delete(first);
    }
  }
  urls.set(key, url);
}

/** Cached public narration (no auth). Returns a Blob URL or null on failure. */
export function getNarrationUrl(opts: {
  text: string;
  lang?: string;
  mode?: Mode;
  voice?: string;
}): Promise<string | null> {
  const text = (opts.text ?? "").trim();
  if (!text) return Promise.resolve(null);
  const lang = (opts.lang ?? "pt").slice(0, 2).toLowerCase();
  const mode = opts.mode ?? "story";
  const voice = opts.voice ?? "nova";
  const key = `${lang}::${mode}::${voice}::${text}`;

  const hit = urls.get(key);
  if (hit) return Promise.resolve(hit);

  const running = inflight.get(key);
  if (running) return running;

  async function fetchWithRetry(retries = 2, timeoutMs = 8000): Promise<string | null> {
    for (let i = 0; i <= retries; i++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), timeoutMs);
        
        const res = await narratePublic({ data: { text, lang, mode, voice } });
        clearTimeout(timeout);

        if (res.error || !res.audio_base64) {
          if (res.fallback && i < retries) continue;
          return null;
        }
        
        const url = base64ToBlobUrl(res.audio_base64, res.mime || "audio/mpeg");
        remember(key, url);
        return url;
      } catch (err) {
        if (i === retries) return null;
        // Wait 500ms before retrying
        await new Promise(r => setTimeout(r, 500));
      }
    }
    return null;
  }

  const p = fetchWithRetry().finally(() => inflight.delete(key));

  inflight.set(key, p);
  return p;
}


/** Cached premium narration (authenticated TTS). */
export function getPremiumNarrationUrl(
  speak: any,
  opts: { text: string; voice?: string; environment?: "sandbox" | "live" },
): Promise<string | null> {
  const text = (opts.text ?? "").trim();
  if (!text) return Promise.resolve(null);
  const voice = opts.voice ?? "nova";
  const key = `premium::${voice}::${text}`;

  const hit = urls.get(key);
  if (hit) return Promise.resolve(hit);
  const running = inflight.get(key);
  if (running) return running;

  async function fetchWithRetry(retries = 2, timeoutMs = 8000): Promise<string | null> {
    for (let i = 0; i <= retries; i++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), timeoutMs);

        const r = await speak({ data: { text, voice, environment: opts.environment } });
        clearTimeout(timeout);

        if (r?.error || !r?.audio_base64) {
          if (r?.fallback && i < retries) continue;
          return null;
        }
        
        const url = base64ToBlobUrl(r.audio_base64, r.mime || "audio/mpeg");
        remember(key, url);
        return url;
      } catch (err) {
        if (i === retries) return null;
        await new Promise(r => setTimeout(r, 500));
      }
    }
    return null;
  }

  const p = fetchWithRetry().finally(() => inflight.delete(key));


  inflight.set(key, p);
  return p;
}

/** Warm the cache in the background (e.g. on hover) so playback is instant. */
export function prewarmNarration(opts: {
  text: string;
  lang?: string;
  mode?: Mode;
  voice?: string;
}) {
  void getNarrationUrl(opts);
}

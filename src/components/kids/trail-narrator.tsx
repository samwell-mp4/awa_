import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { narratePublic } from "@/lib/narrate-public.functions";
import { base64ToBlobUrl } from "@/lib/audio-play";

type Props = {
  title: string;
  description: string;
  color: string;
  emoji: string;
};

// Single shared audio element so only one trail narrates at a time.
let currentAudio: HTMLAudioElement | null = null;
let currentSetter: ((s: "idle") => void) | null = null;

export function TrailNarrator({ title, description, color, emoji }: Props) {
  const { t, i18n } = useTranslation();
  const [state, setState] = useState<"idle" | "loading" | "playing">("idle");
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);

  const lang = i18n.language.slice(0, 2).toLowerCase();

  // Re-fetch narration when the UI language changes.
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    setState("idle");
    setProgress(0);
  }, [lang]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
        urlRef.current = null;
      }
    };
  }, []);

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setState("idle");
    setProgress(0);
  };

  const play = async () => {
    if (state === "playing") {
      stop();
      return;
    }
    // Stop any other narrator that's playing.
    if (currentAudio && currentAudio !== audioRef.current) {
      try { currentAudio.pause(); } catch {}
      currentSetter?.("idle");
    }

    setState("loading");
    try {
      let url = urlRef.current;
      if (!url) {
        const lang = i18n.language.slice(0, 2).toLowerCase();
        const text = `${title}. ${description}`;
        const res = await narratePublic({
          data: { text, lang, mode: "story", voice: "onyx" },
        });
        if (res.error || !res.audio_base64) {
          setState("idle");
          return;
        }
        url = base64ToBlobUrl(res.audio_base64, res.mime || "audio/mpeg");
        urlRef.current = url;
      }
      const a = audioRef.current ?? new Audio();
      audioRef.current = a;
      a.src = url;
      a.currentTime = 0;
      a.ontimeupdate = () => {
        if (a.duration > 0) setProgress(a.currentTime / a.duration);
      };
      a.onended = () => {
        setState("idle");
        setProgress(0);
      };
      currentAudio = a;
      currentSetter = setState;
      await a.play();
      setState("playing");
    } catch {
      setState("idle");
    }
  };

  const label =
    state === "loading"
      ? t("common.kidsLoading")
      : state === "playing"
        ? t("common.kidsStop")
        : t("common.kidsListen");

  return (
    <article
      className="relative overflow-hidden rounded-3xl border-4 border-white/70 bg-white/85 p-4 shadow-lg backdrop-blur-sm"
      style={{ boxShadow: `0 8px 0 -2px ${color}55, 0 12px 24px -8px ${color}66` }}
    >
      <div className="flex items-start gap-3">
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl"
          style={{ background: color, boxShadow: `0 4px 0 -1px ${color}88` }}
          aria-hidden
        >
          {emoji}
        </span>
        <div className="min-w-0 flex-1">
          <h3
            className="truncate text-lg text-[#118ab2]"
            style={{ fontFamily: "'Archivo Black', sans-serif" }}
          >
            {title}
          </h3>
          <p className="mt-1 text-sm leading-snug text-slate-700">{description}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={play}
          disabled={state === "loading"}
          aria-label={label}
          className="flex items-center gap-2 rounded-full border-b-4 border-black/15 px-4 py-2 text-sm font-black uppercase tracking-wide text-white shadow-md transition-all active:translate-y-0.5 active:border-b-0 disabled:opacity-70"
          style={{ background: color, fontFamily: "'Archivo Black', sans-serif" }}
        >
          <span aria-hidden className="text-base">
            {state === "playing" ? "⏸" : state === "loading" ? "⏳" : "🔊"}
          </span>
          {label}
        </button>

        <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-black/10">
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-150"
            style={{
              width: `${Math.round(progress * 100)}%`,
              background: `linear-gradient(90deg, ${color}, #ffd166)`,
            }}
          />
        </div>
        <span
          className="w-9 text-right text-xs font-bold text-slate-500 tabular-nums"
          aria-live="polite"
        >
          {Math.round(progress * 100)}%
        </span>
      </div>
    </article>
  );
}

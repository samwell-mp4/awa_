import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { getNarrationUrl, prewarmNarration } from "@/lib/narration-cache";

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

  // Drop the local reference when the UI language changes (cache keeps the audio).
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    urlRef.current = null;
    setState("idle");
    setProgress(0);
  }, [lang]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      urlRef.current = null;
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
        url = await getNarrationUrl({ text, lang, mode: "story", voice: "onyx" });
        if (!url) {
          setState("idle");
          return;
        }
        urlRef.current = url;
      }
      const a = audioRef.current ?? new Audio();
      audioRef.current = a;
      if (a.src !== url) a.src = url;

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
      className="relative overflow-hidden rounded-2xl border-2 border-[#8d5b2d] bg-gradient-to-b from-[#331c0c] to-[#1e0f06] p-4 text-[#fefae0] shadow-lg backdrop-blur-sm"
      style={{ boxShadow: `0 8px 20px -6px rgba(0,0,0,0.6), 0 0 12px ${color}22` }}
    >
      <div className="flex items-start gap-3">
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl shadow-md border border-white/20"
          style={{ background: color }}
          aria-hidden
        >
          {emoji}
        </span>
        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={play}
            className="group/text block w-full text-left transition-opacity hover:opacity-90 active:opacity-75"
          >
            <h3
              className="truncate text-lg font-black text-[#ffd166] group-hover/text:underline"
              style={{ fontFamily: "'Fraunces', 'Fredoka', serif" }}
            >
              {title}
            </h3>
            <p className="mt-1 text-xs sm:text-sm leading-snug text-[#fefae0]/80 font-medium">{description}</p>
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={play}
          onPointerEnter={() =>
            prewarmNarration({
              text: `${title}. ${description}`,
              lang,
              mode: "story",
              voice: "onyx",
            })
          }
          disabled={state === "loading"}
          aria-label={label}
          className="flex items-center gap-2 rounded-xl border border-white/20 px-3.5 py-1.5 text-xs font-black uppercase tracking-wide text-white shadow-md transition-all hover:scale-105 active:scale-95 disabled:opacity-70"
          style={{ background: color }}
        >
          <span aria-hidden className="text-base">
            {state === "playing" ? "⏸" : state === "loading" ? "⏳" : "🔊"}
          </span>
          {label}
        </button>

        <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-black/50 border border-black/40">
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-150"
            style={{
              width: `${Math.round(progress * 100)}%`,
              background: `linear-gradient(90deg, ${color}, #ffd166)`,
            }}
          />
        </div>
        <span
          className="w-9 text-right text-xs font-black text-[#4ade80] tabular-nums"
          aria-live="polite"
        >
          {Math.round(progress * 100)}%
        </span>
      </div>
    </article>
  );
}

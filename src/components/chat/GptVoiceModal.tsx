import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeft,
  Mic,
  Square,
  Play,
  Pause,
  X,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  Plus,
} from "lucide-react";
import { GptVoiceOrb, type GptOrbState } from "./GptVoiceOrb";

export interface GptVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  avatarIcon?: string | React.ReactNode;
  voiceState: GptOrbState;
  voicePaused: boolean;
  isRecording: boolean;
  onToggleMic: () => void;
  onPauseVoice: () => void;
  onResumeVoice: () => void;
  onStopVoice: () => void;
  onSendMessage: (text: string) => void;
  lastUserText?: string;
  lastAssistantText?: string;
  theme?: "adulto" | "infantil";
  suggestions?: { label: string; prompt: string }[];
}

export function GptVoiceModal({
  isOpen,
  onClose,
  title,
  subtitle,
  avatarIcon,
  voiceState,
  voicePaused,
  isRecording,
  onToggleMic,
  onPauseVoice,
  onResumeVoice,
  onStopVoice,
  onSendMessage,
  lastUserText,
  lastAssistantText,
  theme = "adulto",
  suggestions = [],
}: GptVoiceModalProps) {
  const [mounted, setMounted] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent background body scroll while voice modal is active
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (showTextInput) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [showTextInput]);

  if (!mounted || !isOpen || typeof document === "undefined") return null;

  const handleSendText = (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = textInput.trim();
    if (!q) return;
    onSendMessage(q);
    setTextInput("");
    setShowTextInput(false);
  };

  const orbTheme = theme === "infantil" ? "kids-magic" : "gpt-blue";

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex flex-col justify-between bg-[#0b0f14] text-white overflow-hidden select-none animate-in fade-in duration-300">
      {/* Background Soft Atmospheric Radiance */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[400px] h-[300px] rounded-full bg-sky-500/5 blur-[100px]" />
      </div>

      {/* ========================================================================= */}
      {/* 1. TOP BAR                                                                */}
      {/* ========================================================================= */}
      <header className="relative z-20 flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        {/* Back / Minimize button */}
        <button
          onClick={onClose}
          className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-white/80 hover:bg-white/15 hover:text-white transition"
          title="Voltar para a conversa"
          aria-label="Fechar modo voz"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        {/* Center Title & Live Mode Pill */}
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-1.5">
            <span className="font-display text-sm sm:text-base font-black text-white">
              {title}
            </span>
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <span className="text-[10px] font-bold tracking-wider text-sky-400/90 uppercase">
            {voiceState === "listening"
              ? "Ouvindo você..."
              : voiceState === "thinking"
              ? "Pensando..."
              : voiceState === "speaking"
              ? "Falando em áudio"
              : "Modo Voz ao Vivo"}
          </span>
        </div>

        {/* Right audio status or avatar badge */}
        <div className="flex items-center gap-2">
          {avatarIcon ? (
            <div className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-xl shadow-inner">
              {avatarIcon}
            </div>
          ) : (
            <button
              onClick={onClose}
              className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-white/70 hover:bg-white/15 hover:text-white transition"
              title="Sair do modo voz"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. CENTER STAGE: THE CHATGPT ANIMATED ORB ("Bolinha girando do GPT")     */}
      {/* ========================================================================= */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-2 sm:py-6 overflow-hidden">
        {/* The Animated Sphere */}
        <div className="my-auto flex flex-col items-center">
          <GptVoiceOrb
            state={voiceState}
            size="lg"
            theme={orbTheme}
            onClick={onToggleMic}
            showRipple={true}
          />

          {/* Status Label below Orb */}
          <div className="mt-8 flex flex-col items-center text-center max-w-sm sm:max-w-md">
            <div
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                voiceState === "listening"
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse"
                  : voiceState === "thinking"
                  ? "bg-sky-500/20 text-sky-300 border border-sky-400/30"
                  : voiceState === "speaking"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                  : "bg-white/10 text-white/80 border border-white/15"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  voiceState === "listening"
                    ? "bg-rose-400 animate-ping"
                    : voiceState === "thinking"
                    ? "bg-sky-400 animate-spin"
                    : voiceState === "speaking"
                    ? "bg-emerald-400 animate-pulse"
                    : "bg-sky-400"
                }`}
              />
              <span>
                {voiceState === "listening"
                  ? "Ouvindo você falar..."
                  : voiceState === "thinking"
                  ? "Pensando na resposta..."
                  : voiceState === "speaking"
                  ? "Professor falando..."
                  : "Toque no microfone para falar"}
              </span>
            </div>

            {/* Live Subtitle Transcript Banner (Displays spoken content) */}
            {voiceState === "speaking" && lastAssistantText && (
              <div className="mt-4 max-h-24 sm:max-h-32 overflow-y-auto px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-xs sm:text-sm text-sky-100 font-medium leading-relaxed italic text-center animate-in fade-in">
                "{lastAssistantText.slice(0, 240)}..."
              </div>
            )}

            {voiceState === "thinking" && lastUserText && (
              <div className="mt-4 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs text-white/70 italic text-center animate-in fade-in">
                "{lastUserText}"
              </div>
            )}

            {/* Suggestions Chips when idle */}
            {voiceState === "idle" && suggestions.length > 0 && !showTextInput && (
              <div className="mt-5 flex flex-wrap justify-center gap-1.5 max-w-sm">
                {suggestions.slice(0, 3).map((s, i) => (
                  <button
                    key={i}
                    onClick={() => onSendMessage(s.prompt)}
                    className="px-3 py-1 rounded-full text-[11px] font-bold bg-white/5 hover:bg-white/15 text-white/80 border border-white/10 hover:border-sky-400/50 transition active:scale-95"
                  >
                    ✨ {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 3. BOTTOM CONTROLS (Identical to ChatGPT Mobile Voice Interface)          */}
      {/* ========================================================================= */}
      <footer className="relative z-20 px-4 py-4 sm:px-8 sm:py-5 pb-[max(env(safe-area-inset-bottom),1.25rem)]">
        <div className="mx-auto max-w-lg flex flex-col gap-3">
          {/* Inline Text Input Form (When toggled) */}
          {showTextInput ? (
            <form onSubmit={handleSendText} className="flex items-center gap-2 animate-in slide-in-from-bottom duration-200">
              <input
                ref={inputRef}
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Digite sua pergunta..."
                className="flex-1 rounded-full border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder-white/50 focus:border-sky-400 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!textInput.trim()}
                className="grid h-11 w-11 place-items-center rounded-full bg-sky-500 text-white font-bold hover:bg-sky-400 disabled:opacity-40 transition"
              >
                <Send className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setShowTextInput(false)}
                className="grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-white/10 text-white/70 hover:bg-white/20 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </form>
          ) : (
            /* Bottom Action Bar (Input Pill + Mic + Close) */
            <div className="flex items-center justify-between gap-3">
              {/* Text Question Pill Button ("+ Perguntar ao Professor...") */}
              <button
                onClick={() => setShowTextInput(true)}
                className="flex-1 flex items-center gap-2 px-4 py-3.5 rounded-full border border-white/15 bg-white/10 hover:bg-white/15 text-white/70 hover:text-white transition text-xs sm:text-sm font-medium"
              >
                <Plus className="h-4 w-4 text-sky-400" />
                <span className="truncate">Perguntar ao {title}...</span>
              </button>

              {/* Pause / Resume button if speaking */}
              {voiceState === "speaking" && (
                <button
                  onClick={voicePaused ? onResumeVoice : onPauseVoice}
                  className="grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-full border border-white/20 bg-white/15 text-white hover:bg-white/25 transition active:scale-95 shadow-md"
                  title={voicePaused ? "Continuar" : "Pausar"}
                >
                  {voicePaused ? <Play className="h-5 w-5 fill-current" /> : <Pause className="h-5 w-5 fill-current" />}
                </button>
              )}

              {/* Big Circular Microphone Button */}
              <button
                onClick={onToggleMic}
                disabled={voiceState === "thinking"}
                className={`grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-full shadow-2xl transition-all active:scale-95 cursor-pointer disabled:opacity-50 ${
                  isRecording || voiceState === "listening"
                    ? "bg-rose-500 text-white shadow-[0_0_30px_rgba(244,63,94,0.6)] animate-pulse"
                    : "bg-white text-slate-950 hover:bg-sky-50 shadow-[0_0_25px_rgba(255,255,255,0.4)]"
                }`}
                title={isRecording ? "Parar e enviar" : "Falar no microfone"}
                aria-label={isRecording ? "Parar e enviar" : "Falar no microfone"}
              >
                {isRecording || voiceState === "listening" ? (
                  <Square className="h-5 w-5 fill-current" />
                ) : (
                  <Mic className="h-5 w-5 sm:h-6 sm:w-6" />
                )}
              </button>

              {/* Circular Close (X) button */}
              <button
                onClick={onClose}
                className="grid h-11 w-11 sm:h-12 sm:w-12 place-items-center rounded-full border border-white/20 bg-white/10 hover:bg-white/20 text-white transition active:scale-95"
                title="Sair do modo voz"
                aria-label="Sair do modo voz"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </footer>
    </div>,
    document.body
  );
}

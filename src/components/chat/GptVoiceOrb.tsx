import React from "react";

export type GptOrbState = "idle" | "listening" | "thinking" | "speaking";

export interface GptVoiceOrbProps {
  state?: GptOrbState;
  size?: "xs" | "mini" | "sm" | "md" | "lg" | "xl";
  className?: string;
  theme?: "gpt-blue" | "forest-emerald" | "kids-magic";
  onClick?: () => void;
  showRipple?: boolean;
}

export function GptVoiceOrb({
  state = "idle",
  size = "lg",
  theme = "gpt-blue",
  onClick,
  showRipple = true,
  className = "",
}: GptVoiceOrbProps) {
  // Dimension classes based on size
  const sizeMap = {
    xs: "w-5 h-5",
    mini: "w-8 h-8",
    sm: "w-28 h-28",
    md: "w-44 h-44",
    lg: "w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72",
    xl: "w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96",
  };

  const isMini = size === "xs" || size === "mini";
  const dimClass = sizeMap[size];

  // Conic gradient colors based on theme
  const conicColors =
    theme === "forest-emerald"
      ? "conic-gradient(from 0deg at 50% 50%, #34d399 0deg, #6ee7b7 60deg, #ffffff 120deg, #059669 180deg, #38bdf8 240deg, #a7f3d0 300deg, #34d399 360deg)"
      : theme === "kids-magic"
      ? "conic-gradient(from 0deg at 50% 50%, #38bdf8 0deg, #fcd34d 60deg, #ffffff 120deg, #34d399 180deg, #60a5fa 240deg, #fed7aa 300deg, #38bdf8 360deg)"
      : "conic-gradient(from 0deg at 50% 50%, #38bdf8 0deg, #93c5fd 60deg, #ffffff 120deg, #2563eb 180deg, #60a5fa 240deg, #bae6fd 300deg, #38bdf8 360deg)";

  // Scale and animation styling based on active voice state
  const stateScale =
    state === "thinking"
      ? "scale-[1.03]"
      : state === "speaking"
      ? "scale-[1.06] animate-[pulse_1.4s_ease-in-out_infinite]"
      : state === "listening"
      ? "scale-[1.08]"
      : "scale-100 hover:scale-[1.02]";

  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={`Orbe de voz - Estado: ${state}`}
      className={`relative flex items-center justify-center select-none ${dimClass} ${stateScale} transition-transform duration-500 ${className} ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      {/* 1. Outermost Ambient Glow Halo */}
      <div
        className={`absolute inset-0 rounded-full ${isMini ? "blur-sm" : "blur-3xl"} pointer-events-none transition-all duration-700 ${
          state === "thinking"
            ? "opacity-90 scale-125 bg-gradient-to-tr from-sky-400 via-blue-500 to-indigo-600"
            : state === "speaking"
            ? "opacity-85 scale-120 bg-gradient-to-tr from-blue-400 via-sky-300 to-cyan-500 animate-pulse"
            : state === "listening"
            ? "opacity-95 scale-130 bg-gradient-to-tr from-cyan-400 via-sky-400 to-blue-600"
            : "opacity-45 scale-105 bg-gradient-to-tr from-blue-500 via-sky-400 to-blue-700"
        }`}
      />

      {/* 2. Expanding Concentric Sound Rings (When listening or speaking) */}
      {showRipple && !isMini && (state === "listening" || state === "speaking") && (
        <>
          <span className="absolute -inset-3 sm:-inset-5 rounded-full border-2 border-sky-400/40 animate-ping opacity-30 pointer-events-none" />
          <span className="absolute -inset-7 sm:-inset-10 rounded-full border border-sky-300/25 animate-pulse opacity-40 pointer-events-none" />
          <span className="absolute -inset-11 sm:-inset-16 rounded-full border border-blue-400/15 animate-[pulse_2s_ease-in-out_infinite] opacity-30 pointer-events-none" />
        </>
      )}

      {/* 3. Core Spherical Orb Body */}
      <div className={`relative w-full h-full rounded-full overflow-hidden ${isMini ? "shadow-md border border-sky-300/40" : "shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-sky-300/20"}`}>
        {/* Base Gradient Layer */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#2563eb] via-[#1d4ed8] to-[#0f172a]" />

        {/* Fluid Conic Swirling Cloud Mesh (Rotates at different speeds) */}
        <div
          className={`absolute -inset-[40%] rounded-full blur-2xl opacity-90 transition-opacity duration-500 ${
            state === "thinking"
              ? "animate-[spin_2s_linear_infinite]"
              : state === "speaking"
              ? "animate-[spin_4.5s_linear_infinite]"
              : state === "listening"
              ? "animate-[spin_6s_linear_infinite]"
              : "animate-[spin_12s_linear_infinite]"
          }`}
          style={{ background: conicColors }}
        />

        {/* Counter-rotating Cloudy Highlight Wave */}
        <div
          className={`absolute -inset-[25%] rounded-full blur-xl opacity-70 mix-blend-overlay ${
            state === "thinking"
              ? "animate-[spin_2.5s_linear_infinite_reverse]"
              : state === "speaking"
              ? "animate-[spin_5s_linear_infinite_reverse]"
              : "animate-[spin_10s_linear_infinite_reverse]"
          }`}
          style={{
            background:
              "radial-gradient(ellipse at 35% 35%, #ffffff 0%, rgba(186, 230, 253, 0.8) 45%, transparent 75%)",
          }}
        />

        {/* Center Pulsing Energy Core */}
        <div
          className={`absolute inset-4 rounded-full blur-md opacity-60 mix-blend-screen transition-transform duration-300 ${
            state === "speaking"
              ? "scale-110 bg-radial from-white via-sky-300 to-transparent animate-pulse"
              : state === "listening"
              ? "scale-105 bg-radial from-cyan-100 via-sky-400 to-transparent"
              : state === "thinking"
              ? "scale-95 bg-radial from-white via-blue-400 to-transparent"
              : "scale-90 bg-radial from-white/70 via-sky-300/50 to-transparent"
          }`}
        />

        {/* 3D Glass Depth, Specular Sheen & Inner Shadows */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            boxShadow:
              "inset 0 -25px 45px rgba(10, 25, 47, 0.75), inset 0 16px 28px rgba(255, 255, 255, 0.5), inset 0 0 15px rgba(255, 255, 255, 0.3)",
          }}
        />

        {/* Top-Left Specular Curved Light Reflection */}
        <div className="absolute top-2 left-4 w-[45%] h-[25%] rounded-[100%] bg-gradient-to-b from-white/40 to-transparent blur-[1px] transform -rotate-25 pointer-events-none" />
      </div>
    </div>
  );
}

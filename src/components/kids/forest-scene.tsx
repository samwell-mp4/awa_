/**
 * KidsForestScene — decorative 3D indigenous forest layer for Awã Tech Infantil.
 * Fixed-position, pointer-events-none SVG overlays: floating leaves, macaw,
 * butterflies, turtle, sun rays, and Pataxó grafismo bands. Purely presentational.
 */
export function KidsForestScene() {
  return (
    <>
      <style>{`
        @keyframes ktf-float-y { 0%,100%{ transform: translateY(0) rotate(var(--r,0deg)); } 50%{ transform: translateY(-18px) rotate(calc(var(--r,0deg) + 4deg)); } }
        @keyframes ktf-drift-x { 0%{ transform: translateX(-8vw) translateY(0); } 50%{ transform: translateX(8vw) translateY(-12px); } 100%{ transform: translateX(-8vw) translateY(0); } }
        @keyframes ktf-sway { 0%,100%{ transform: rotate(-3deg); } 50%{ transform: rotate(3deg); } }
        @keyframes ktf-spin-slow { to { transform: rotate(360deg); } }
        @keyframes ktf-flap { 0%,100%{ transform: scaleX(1); } 50%{ transform: scaleX(0.75); } }
        @keyframes ktf-fall { 0%{ transform: translateY(-10vh) rotate(0deg); opacity:0; } 10%{ opacity:.9;} 100%{ transform: translateY(110vh) rotate(540deg); opacity: 0.15; } }
        @keyframes ktf-pulse { 0%,100%{ opacity:.55; transform: scale(1);} 50%{ opacity:.9; transform: scale(1.08);} }
        .ktf-layer{ position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
        .ktf-item{ position:absolute; will-change: transform; }
        .ktf-sun{ animation: ktf-spin-slow 60s linear infinite; }
        .ktf-sway{ animation: ktf-sway 6s ease-in-out infinite; transform-origin: 50% 100%; }
        .ktf-floaty{ animation: ktf-float-y 6s ease-in-out infinite; }
        .ktf-drift{ animation: ktf-drift-x 22s ease-in-out infinite; }
        .ktf-leaf-fall{ animation: ktf-fall linear infinite; }
        .ktf-flap{ animation: ktf-flap .5s ease-in-out infinite; transform-origin: center; }
        .ktf-glow{ animation: ktf-pulse 5s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce){
          .ktf-sun,.ktf-sway,.ktf-floaty,.ktf-drift,.ktf-leaf-fall,.ktf-flap,.ktf-glow{ animation: none !important; }
        }
      `}</style>

      <div aria-hidden className="ktf-layer">
        {/* Sun with rays (top-right) */}
        <div className="ktf-item ktf-sun" style={{ top: "4%", right: "4%", width: 120, height: 120, opacity: 0.85 }}>
          <svg viewBox="0 0 120 120" width="120" height="120">
            <defs>
              <radialGradient id="ktf-sunG" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fff2b0" />
                <stop offset="60%" stopColor="#ffd76a" />
                <stop offset="100%" stopColor="#ff9f4a" />
              </radialGradient>
            </defs>
            {Array.from({ length: 12 }).map((_, i) => (
              <rect key={i} x="58" y="4" width="4" height="18" rx="2" fill="#ffb84a" transform={`rotate(${i * 30} 60 60)`} />
            ))}
            <circle cx="60" cy="60" r="28" fill="url(#ktf-sunG)" />
          </svg>
        </div>

        {/* Sun glow */}
        <div className="ktf-item ktf-glow" style={{ top: "2%", right: "2%", width: 220, height: 220, background: "radial-gradient(circle, rgba(255,215,106,0.55), transparent 65%)", borderRadius: "50%" }} />

        {/* Big palm tree — left */}
        <div className="ktf-item ktf-sway" style={{ bottom: "-10px", left: "-30px", width: 220, height: 320, opacity: 0.85 }}>
          <svg viewBox="0 0 220 320" width="220" height="320">
            {/* trunk */}
            <path d="M100 320 C 108 240, 96 180, 118 90" stroke="#7a4a2b" strokeWidth="14" fill="none" strokeLinecap="round" />
            <path d="M100 320 C 108 240, 96 180, 118 90" stroke="#5b3a24" strokeWidth="4" fill="none" strokeLinecap="round" opacity=".55" />
            {/* fronds */}
            {[-70, -35, 0, 35, 70, 110].map((rot, i) => (
              <g key={i} transform={`translate(118 90) rotate(${rot})`}>
                <path d="M0 0 Q 40 -14 100 -6 Q 60 6 0 4 Z" fill={i % 2 ? "#5cbf6d" : "#7cd88a"} />
                <path d="M0 0 Q 40 -14 100 -6" stroke="#2f6d3a" strokeWidth="1.5" fill="none" opacity=".5" />
              </g>
            ))}
            {/* coconuts */}
            <circle cx="112" cy="94" r="7" fill="#5b3a24" />
            <circle cx="124" cy="92" r="6" fill="#7a4a2b" />
          </svg>
        </div>

        {/* Fern — right bottom */}
        <div className="ktf-item ktf-sway" style={{ bottom: "-6px", right: "-20px", width: 200, height: 200, opacity: 0.8, animationDuration: "7s" }}>
          <svg viewBox="0 0 200 200" width="200" height="200">
            {[0, 25, -25, 50, -50, 75, -75].map((rot, i) => (
              <g key={i} transform={`translate(120 200) rotate(${rot})`}>
                <path d="M0 0 Q -10 -80 4 -160" stroke="#2f6d3a" strokeWidth="4" fill="none" strokeLinecap="round" />
                {Array.from({ length: 10 }).map((_, k) => (
                  <ellipse key={k} cx={k % 2 ? 10 : -10} cy={-15 - k * 15} rx="12" ry="5" fill={k % 2 ? "#7cd88a" : "#5cbf6d"} transform={`rotate(${k % 2 ? 35 : -35} 0 ${-15 - k * 15})`} />
                ))}
              </g>
            ))}
          </svg>
        </div>

        {/* Macaw flying — drifts across */}
        <div className="ktf-item ktf-drift" style={{ top: "12%", left: "20%", width: 90, height: 60, animationDuration: "28s" }}>
          <svg viewBox="0 0 90 60" width="90" height="60">
            {/* body */}
            <ellipse cx="48" cy="34" rx="18" ry="10" fill="#ef476f" />
            {/* head */}
            <circle cx="66" cy="30" r="9" fill="#ef476f" />
            <circle cx="69" cy="28" r="1.5" fill="#1a1a1a" />
            {/* beak */}
            <path d="M74 30 q6 2 8 6 q-6 2 -10 -2 z" fill="#f4a261" />
            {/* tail */}
            <path d="M32 34 q -20 2 -28 -6 q 20 -2 28 2 z" fill="#ffd166" />
            <path d="M32 36 q -18 4 -26 -2 q 18 -4 26 -2 z" fill="#118ab2" opacity=".9" />
            {/* wing (flap) */}
            <g className="ktf-flap">
              <path d="M40 30 q 8 -18 22 -14 q -4 14 -18 18 z" fill="#118ab2" />
              <path d="M42 32 q 8 -12 18 -10 q -4 10 -14 12 z" fill="#06d6a0" />
            </g>
          </svg>
        </div>

        {/* Toucan perched on right */}
        <div className="ktf-item ktf-floaty" style={{ top: "38%", right: "3%", width: 80, height: 80, animationDuration: "5s", ["--r" as any]: "-4deg" }}>
          <svg viewBox="0 0 80 80" width="80" height="80">
            <ellipse cx="38" cy="46" rx="20" ry="16" fill="#1a1a1a" />
            <ellipse cx="38" cy="42" rx="12" ry="8" fill="#fffaf0" />
            <circle cx="52" cy="34" r="10" fill="#1a1a1a" />
            <circle cx="55" cy="32" r="1.6" fill="#fffaf0" />
            <path d="M62 34 q 20 -4 22 8 q -18 6 -24 0 z" fill="#f4a261" />
            <path d="M62 34 q 20 -4 22 8" stroke="#c4632a" strokeWidth="1.2" fill="none" />
            <path d="M22 60 l 6 8 M32 62 l 4 8" stroke="#f4a261" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>

        {/* Butterflies */}
        {[
          { top: "26%", left: "6%", dur: "5s", hue: "#c77dff", size: 34 },
          { top: "60%", left: "12%", dur: "6.5s", hue: "#ff89b5", size: 30 },
          { top: "70%", right: "16%", dur: "5.5s", hue: "#ffd76a", size: 32 },
        ].map((b, i) => (
          <div key={i} className="ktf-item ktf-floaty" style={{ top: b.top, left: (b as any).left, right: (b as any).right, animationDuration: b.dur, width: b.size, height: b.size }}>
            <svg viewBox="0 0 40 40" width={b.size} height={b.size}>
              <g className="ktf-flap">
                <ellipse cx="12" cy="16" rx="10" ry="8" fill={b.hue} />
                <ellipse cx="28" cy="16" rx="10" ry="8" fill={b.hue} />
                <ellipse cx="13" cy="26" rx="7" ry="6" fill={b.hue} opacity=".85" />
                <ellipse cx="27" cy="26" rx="7" ry="6" fill={b.hue} opacity=".85" />
              </g>
              <ellipse cx="20" cy="20" rx="2" ry="9" fill="#5b3a24" />
              <path d="M20 12 q -2 -6 -5 -6 M20 12 q 2 -6 5 -6" stroke="#5b3a24" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            </svg>
          </div>
        ))}

        {/* Turtle bottom-center */}
        <div className="ktf-item ktf-floaty" style={{ bottom: "8%", left: "42%", width: 70, height: 50, animationDuration: "7s" }}>
          <svg viewBox="0 0 70 50" width="70" height="50">
            <ellipse cx="35" cy="30" rx="24" ry="14" fill="#2f6d3a" />
            <ellipse cx="35" cy="28" rx="20" ry="10" fill="#5cbf6d" />
            {[[25, 26], [35, 24], [45, 26], [30, 32], [40, 32]].map(([x, y], i) => (
              <path key={i} d={`M${x} ${y} l4 0 l-2 4 z`} fill="#2f6d3a" />
            ))}
            <circle cx="58" cy="28" r="6" fill="#5cbf6d" />
            <circle cx="60" cy="26" r="1" fill="#1a1a1a" />
            <rect x="12" y="34" width="6" height="6" rx="2" fill="#5cbf6d" />
            <rect x="52" y="34" width="6" height="6" rx="2" fill="#5cbf6d" />
          </svg>
        </div>

        {/* Falling leaves */}
        {[
          { left: "10%", dur: "14s", delay: "0s", color: "#7cd88a" },
          { left: "28%", dur: "18s", delay: "3s", color: "#5cbf6d" },
          { left: "48%", dur: "16s", delay: "6s", color: "#ffb84a" },
          { left: "68%", dur: "20s", delay: "2s", color: "#7cd88a" },
          { left: "86%", dur: "17s", delay: "5s", color: "#c4632a" },
        ].map((l, i) => (
          <div key={i} className="ktf-item ktf-leaf-fall" style={{ top: 0, left: l.left, width: 22, height: 22, animationDuration: l.dur, animationDelay: l.delay }}>
            <svg viewBox="0 0 22 22" width="22" height="22">
              <path d="M11 1 Q 21 11 11 21 Q 1 11 11 1 Z" fill={l.color} />
              <path d="M11 3 L11 20" stroke="#2f6d3a" strokeWidth="1" opacity=".7" />
            </svg>
          </div>
        ))}

        {/* Pataxó grafismo diamond band — mid vertical accents */}
        <div className="ktf-item" style={{ top: 0, bottom: 0, left: 0, width: 14, opacity: 0.35, backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='40' viewBox='0 0 14 40'><path d='M7 2 L12 20 L7 38 L2 20 Z' fill='%23c4632a'/><path d='M7 10 L10 20 L7 30 L4 20 Z' fill='%23f4d9a8'/></svg>\")", backgroundRepeat: "repeat-y", backgroundSize: "14px 40px" }} />
        <div className="ktf-item" style={{ top: 0, bottom: 0, right: 0, width: 14, opacity: 0.35, backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='40' viewBox='0 0 14 40'><path d='M7 2 L12 20 L7 38 L2 20 Z' fill='%232f6d3a'/><path d='M7 10 L10 20 L7 30 L4 20 Z' fill='%23f4d9a8'/></svg>\")", backgroundRepeat: "repeat-y", backgroundSize: "14px 40px" }} />
      </div>
    </>
  );
}

export default KidsForestScene;

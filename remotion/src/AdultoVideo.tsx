import React from "react";
import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { TransitionSeries, springTiming, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { loadFont as loadDisplay } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadBody } from "@remotion/google-fonts/Inter";

const display = loadDisplay("normal", { weights: ["700", "900"], subsets: ["latin"] }).fontFamily;
const body = loadBody("normal", { weights: ["400", "600", "700"], subsets: ["latin"] }).fontFamily;

const GOLD = "#D7B15A";
const CREAM = "#F4E9D4";
const DEEP = "#07160F";

const Grain: React.FC = () => (
  <AbsoluteFill
    style={{
      background:
        "radial-gradient(120% 80% at 50% 0%, rgba(215,177,90,0.16) 0%, rgba(7,22,15,0) 55%), linear-gradient(180deg, rgba(7,22,15,0.15) 0%, rgba(7,22,15,0.85) 100%)",
    }}
  />
);

const KenBurns: React.FC<{ src: string; from?: number; to?: number; x?: number }> = ({
  src,
  from = 1.08,
  to = 1.22,
  x = 0,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const scale = interpolate(frame, [0, durationInFrames], [from, to]);
  const tx = interpolate(frame, [0, durationInFrames], [0, x]);
  return (
    <AbsoluteFill>
      <Img
        src={staticFile(`images/${src}`)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale}) translateX(${tx}px)`,
        }}
      />
    </AbsoluteFill>
  );
};

const Reveal: React.FC<{ delay?: number; children: React.ReactNode; y?: number }> = ({
  delay = 0,
  children,
  y = 42,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 200 } });
  return (
    <div
      style={{
        opacity: s,
        transform: `translateY(${interpolate(s, [0, 1], [y, 0])}px)`,
        filter: `blur(${interpolate(s, [0, 1], [10, 0])}px)`,
      }}
    >
      {children}
    </div>
  );
};

const Rule: React.FC<{ delay: number; width: number }> = ({ delay, width }) => {
  const frame = useCurrentFrame();
  const w = interpolate(frame - delay, [0, 28], [0, width], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return <div style={{ height: 3, width: w, background: GOLD, borderRadius: 2 }} />;
};

/* ---------------- Scene 1 — Abertura ---------------- */
const Opening: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logo = spring({ frame: frame - 6, fps, config: { damping: 18, stiffness: 90, mass: 1.4 } });
  return (
    <AbsoluteFill style={{ backgroundColor: DEEP }}>
      <KenBurns src="pataxo-monte-pascoal.jpg" from={1.15} to={1.3} />
      <Grain />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            width: 380,
            height: 380,
            borderRadius: "50%",
            overflow: "hidden",
            border: `4px solid ${GOLD}`,
            boxShadow: "0 40px 90px rgba(0,0,0,0.55)",
            transform: `scale(${interpolate(logo, [0, 1], [0.6, 1])}) rotate(${interpolate(logo, [0, 1], [-8, 0])}deg)`,
            opacity: logo,
          }}
        >
          <Img
            src={staticFile("images/adulto-logo.png")}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
        <Sequence from={30}>
          <div style={{ textAlign: "center", marginTop: 44 }}>
            <Reveal>
              <div
                style={{
                  fontFamily: display,
                  fontWeight: 900,
                  fontSize: 108,
                  color: CREAM,
                  letterSpacing: -2,
                  lineHeight: 1,
                }}
              >
                AWÃ TECH
              </div>
            </Reveal>
            <Reveal delay={12}>
              <div
                style={{
                  fontFamily: body,
                  fontWeight: 700,
                  fontSize: 30,
                  letterSpacing: 14,
                  color: GOLD,
                  marginTop: 18,
                }}
              >
                A D U L T O
              </div>
            </Reveal>
          </div>
        </Sequence>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------------- Scene 2 — Proposta ---------------- */
const Statement: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: DEEP }}>
    <KenBurns src="pataxo-anciao.jpg" from={1.1} to={1.24} x={-60} />
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(100deg, rgba(7,22,15,0.94) 0%, rgba(7,22,15,0.78) 45%, rgba(7,22,15,0.15) 100%)",
      }}
    />
    <AbsoluteFill style={{ justifyContent: "center", padding: "0 130px" }}>
      <Reveal>
        <Rule delay={4} width={140} />
      </Reveal>
      <div style={{ height: 34 }} />
      <Reveal delay={8}>
        <div
          style={{
            fontFamily: display,
            fontWeight: 900,
            fontSize: 92,
            color: CREAM,
            lineHeight: 1.06,
            maxWidth: 1050,
          }}
        >
          Línguas indígenas,
          <br />
          <span style={{ color: GOLD }}>culturas vivas.</span>
        </div>
      </Reveal>
      <Reveal delay={26}>
        <div
          style={{
            fontFamily: body,
            fontSize: 32,
            color: "rgba(244,233,212,0.82)",
            marginTop: 34,
            maxWidth: 860,
            lineHeight: 1.45,
          }}
        >
          Aprenda Patxôhã com curadoria de anciãos e educadores da aldeia.
        </div>
      </Reveal>
    </AbsoluteFill>
  </AbsoluteFill>
);

/* ---------------- Scene 3 — Recursos ---------------- */
const FEATURES = [
  { img: "trail-saudacoes.jpg", t: "Trilhas guiadas", d: "Do primeiro Awê à conversa" },
  { img: "trail-natureza.jpg", t: "Dicionário Patxôhã", d: "Milhares de palavras com áudio" },
  { img: "pataxo-danca.jpg", t: "Tradutor cultural", d: "Traduza e ouça na hora" },
  { img: "pataxo-aldeia.jpg", t: "Espaço do Professor", d: "Materiais para a sala de aula" },
];

const Features: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: DEEP }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(90% 70% at 15% 0%, rgba(215,177,90,0.14) 0%, rgba(7,22,15,0) 60%), #07160F",
        }}
      />
      <AbsoluteFill style={{ padding: "90px 120px" }}>
        <Reveal>
          <div
            style={{
              fontFamily: body,
              fontSize: 24,
              letterSpacing: 10,
              color: GOLD,
              fontWeight: 700,
            }}
          >
            O QUE VOCÊ ENCONTRA
          </div>
        </Reveal>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 34,
            marginTop: 54,
          }}
        >
          {FEATURES.map((f, i) => {
            const s = spring({
              frame: frame - 14 - i * 11,
              fps,
              config: { damping: 22, stiffness: 140 },
            });
            return (
              <div
                key={f.t}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 28,
                  padding: 22,
                  borderRadius: 26,
                  border: "1px solid rgba(215,177,90,0.28)",
                  background: "rgba(255,255,255,0.035)",
                  opacity: s,
                  transform: `translateX(${interpolate(s, [0, 1], [i % 2 ? 70 : -70, 0])}px)`,
                }}
              >
                <div
                  style={{
                    width: 132,
                    height: 132,
                    borderRadius: 20,
                    overflow: "hidden",
                    flexShrink: 0,
                    border: `2px solid ${GOLD}`,
                  }}
                >
                  <Img
                    src={staticFile(`images/${f.img}`)}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: display,
                      fontWeight: 700,
                      fontSize: 44,
                      color: CREAM,
                      lineHeight: 1.1,
                    }}
                  >
                    {f.t}
                  </div>
                  <div
                    style={{
                      fontFamily: body,
                      fontSize: 25,
                      color: "rgba(244,233,212,0.7)",
                      marginTop: 8,
                    }}
                  >
                    {f.d}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------------- Scene 4 — Idiomas ---------------- */
const Languages: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const langs = ["Português", "English", "Español", "Patxôhã"];
  return (
    <AbsoluteFill style={{ backgroundColor: DEEP }}>
      <KenBurns src="landing-bg.jpg" from={1.2} to={1.05} />
      <AbsoluteFill style={{ background: "rgba(7,22,15,0.78)" }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <Reveal>
          <div
            style={{
              fontFamily: display,
              fontWeight: 900,
              fontSize: 76,
              color: CREAM,
              textAlign: "center",
            }}
          >
            Quatro idiomas, <span style={{ color: GOLD }}>uma raiz.</span>
          </div>
        </Reveal>
        <div style={{ display: "flex", gap: 22, marginTop: 52 }}>
          {langs.map((l, i) => {
            const s = spring({
              frame: frame - 20 - i * 8,
              fps,
              config: { damping: 12, stiffness: 160 },
            });
            return (
              <div
                key={l}
                style={{
                  fontFamily: body,
                  fontWeight: 700,
                  fontSize: 30,
                  color: DEEP,
                  background: GOLD,
                  padding: "16px 34px",
                  borderRadius: 999,
                  opacity: s,
                  transform: `scale(${interpolate(s, [0, 1], [0.5, 1])})`,
                }}
              >
                {l}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------------- Scene 5 — Fecho ---------------- */
const Closing: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 200 } });
  const glow = 0.5 + 0.5 * Math.sin(frame / 14);
  return (
    <AbsoluteFill style={{ backgroundColor: DEEP }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(70% 60% at 50% 45%, rgba(215,177,90,0.22) 0%, rgba(7,22,15,0) 70%), #07160F",
        }}
      />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            width: 240,
            height: 240,
            borderRadius: "50%",
            overflow: "hidden",
            border: `3px solid ${GOLD}`,
            boxShadow: `0 0 ${40 + glow * 50}px rgba(215,177,90,${0.25 + glow * 0.25})`,
            transform: `scale(${interpolate(s, [0, 1], [0.8, 1])})`,
            opacity: s,
          }}
        >
          <Img
            src={staticFile("images/adulto-logo.png")}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
        <Sequence from={16}>
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <Reveal>
              <div
                style={{
                  fontFamily: display,
                  fontWeight: 900,
                  fontSize: 66,
                  color: CREAM,
                }}
              >
                Comece sua trilha hoje
              </div>
            </Reveal>
            <Reveal delay={12}>
              <div
                style={{
                  fontFamily: body,
                  fontWeight: 700,
                  fontSize: 34,
                  letterSpacing: 6,
                  color: GOLD,
                  marginTop: 22,
                }}
              >
                awa-tech.store
              </div>
            </Reveal>
          </div>
        </Sequence>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const AdultoVideo: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: DEEP }}>
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={120}>
        <Opening />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: 22 })}
      />
      <TransitionSeries.Sequence durationInFrames={120}>
        <Statement />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={slide({ direction: "from-right" })}
        timing={springTiming({ config: { damping: 200 }, durationInFrames: 26 })}
      />
      <TransitionSeries.Sequence durationInFrames={150}>
        <Features />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: 20 })}
      />
      <TransitionSeries.Sequence durationInFrames={100}>
        <Languages />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={slide({ direction: "from-bottom" })}
        timing={springTiming({ config: { damping: 200 }, durationInFrames: 24 })}
      />
      <TransitionSeries.Sequence durationInFrames={120}>
        <Closing />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  </AbsoluteFill>
);

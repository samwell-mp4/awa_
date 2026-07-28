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
import { clockWipe } from "@remotion/transitions/clock-wipe";
import { loadFont as loadDisplay } from "@remotion/google-fonts/Fredoka";
import { loadFont as loadBody } from "@remotion/google-fonts/Baloo2";

const display = loadDisplay("normal", { weights: ["600", "700"], subsets: ["latin"] }).fontFamily;
const body = loadBody("normal", { weights: ["500", "700"], subsets: ["latin"] }).fontFamily;

const SUN = "#FFC63B";
const CLAY = "#E8582C";
const LEAF = "#1E9E63";
const SKY = "#FFF6E2";
const NIGHT = "#123B2C";

/** faixa zig-zag pataxó */
const ZigZag: React.FC<{ top?: number; bottom?: number; color?: string }> = ({
  top,
  bottom,
  color = CLAY,
}) => {
  const frame = useCurrentFrame();
  const shift = (frame * 2) % 80;
  return (
    <div
      style={{
        position: "absolute",
        left: -100,
        right: -100,
        top,
        bottom,
        height: 34,
        backgroundImage: `linear-gradient(135deg, ${color} 25%, transparent 25%), linear-gradient(225deg, ${color} 25%, transparent 25%)`,
        backgroundSize: "40px 40px",
        backgroundPosition: `${shift}px 0`,
        opacity: 0.9,
      }}
    />
  );
};

const Pop: React.FC<{ delay?: number; children: React.ReactNode; damping?: number }> = ({
  delay = 0,
  children,
  damping = 9,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping, stiffness: 170 } });
  return (
    <div style={{ opacity: Math.min(1, s * 1.6), transform: `scale(${interpolate(s, [0, 1], [0.3, 1])})` }}>
      {children}
    </div>
  );
};

const Float: React.FC<{ amp?: number; speed?: number; children: React.ReactNode; phase?: number }> = ({
  amp = 14,
  speed = 20,
  phase = 0,
  children,
}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ transform: `translateY(${Math.sin(frame / speed + phase) * amp}px)` }}>{children}</div>
  );
};

const Confetti: React.FC<{ count?: number }> = ({ count = 26 }) => {
  const frame = useCurrentFrame();
  const colors = [SUN, CLAY, LEAF, "#4EA8E8", "#F0F0F0"];
  return (
    <AbsoluteFill>
      {new Array(count).fill(0).map((_, i) => {
        const x = ((i * 137) % 100) + Math.sin(frame / 30 + i) * 2;
        const y = (((frame * (1.6 + (i % 5) * 0.5) + i * 90) % 1300) - 150) / 10.8;
        const size = 10 + (i % 4) * 6;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: size,
              height: size,
              background: colors[i % colors.length],
              borderRadius: i % 3 === 0 ? "50%" : 4,
              transform: `rotate(${frame * 3 + i * 40}deg)`,
              opacity: 0.85,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/* ---------------- 1 — Abertura ---------------- */
const KidOpening: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logo = spring({ frame: frame - 4, fps, config: { damping: 8, stiffness: 130 } });
  return (
    <AbsoluteFill style={{ background: `radial-gradient(80% 70% at 50% 30%, #2FBF7C 0%, ${NIGHT} 100%)` }}>
      <Img
        src={staticFile("images/infantil-categorias-bg.jpg")}
        style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.5 }}
      />
      <Confetti />
      <ZigZag top={0} />
      <ZigZag bottom={0} color={SUN} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <Float amp={12}>
          <div
            style={{
              width: 420,
              height: 420,
              borderRadius: 60,
              overflow: "hidden",
              border: `10px solid ${SUN}`,
              boxShadow: "0 30px 60px rgba(0,0,0,0.35)",
              transform: `scale(${interpolate(logo, [0, 1], [0.2, 1])}) rotate(${interpolate(logo, [0, 1], [-14, 0])}deg)`,
            }}
          >
            <Img
              src={staticFile("images/infantil-logo-new.jpg")}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        </Float>
        <Sequence from={26} layout="none">
          <div style={{ textAlign: "center", marginTop: 36 }}>
            <Pop>
              <div
                style={{
                  fontFamily: display,
                  fontWeight: 700,
                  fontSize: 110,
                  color: SKY,
                  textShadow: `0 8px 0 ${CLAY}`,
                  lineHeight: 1,
                }}
              >
                AWÃ TECH
              </div>
            </Pop>
            <Pop delay={12}>
              <div
                style={{
                  fontFamily: body,
                  fontWeight: 700,
                  fontSize: 56,
                  color: SUN,
                  marginTop: 10,
                }}
              >
                Infantil
              </div>
            </Pop>
          </div>
        </Sequence>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------------- 2 — Convite ---------------- */
const KidStatement: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: SKY }}>
      <Img
        src={staticFile("images/jogos-infantil-bg.jpg")}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${1.1 + frame / 2400})`,
        }}
      />
      <AbsoluteFill style={{ background: "rgba(18,59,44,0.55)" }} />
      <ZigZag bottom={0} color={SUN} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: 90 }}>
        <Pop>
          <div
            style={{
              fontFamily: display,
              fontWeight: 700,
              fontSize: 96,
              color: SKY,
              textAlign: "center",
              lineHeight: 1.1,
              textShadow: `0 8px 0 rgba(0,0,0,0.25)`,
            }}
          >
            Aprender Patxôhã
            <br />
            <span style={{ color: SUN }}>brincando!</span>
          </div>
        </Pop>
        <Pop delay={20}>
          <div
            style={{
              fontFamily: body,
              fontWeight: 500,
              fontSize: 40,
              color: "rgba(255,246,226,0.92)",
              marginTop: 26,
              textAlign: "center",
            }}
          >
            Jogos, cantigas e histórias da aldeia para as crianças
          </div>
        </Pop>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------------- 3 — Menu de brincadeiras ---------------- */
const CARDS = [
  { img: "jogos-infantil-bg.jpg", t: "Jogos", c: CLAY, e: "🎮" },
  { img: "musicas-infantil-bg.jpg", t: "Cantigas", c: LEAF, e: "🎵" },
  { img: "trail-animais.jpg", t: "Histórias", c: "#4EA8E8", e: "📖" },
  { img: "trail-familia.jpg", t: "Trilhas", c: SUN, e: "🌿" },
];

const KidMenu: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, #FFF6E2 0%, #FFE6B8 100%)` }}>
      <Confetti count={16} />
      <ZigZag top={0} color={LEAF} />
      <AbsoluteFill style={{ padding: "110px 90px 80px", alignItems: "center" }}>
        <Pop>
          <div
            style={{
              fontFamily: display,
              fontWeight: 700,
              fontSize: 68,
              color: NIGHT,
            }}
          >
            Escolha e divirta-se
          </div>
        </Pop>
        <div style={{ display: "flex", gap: 34, marginTop: 60 }}>
          {CARDS.map((c, i) => {
            const s = spring({
              frame: frame - 16 - i * 10,
              fps,
              config: { damping: 9, stiffness: 150 },
            });
            return (
              <div
                key={c.t}
                style={{
                  width: 340,
                  borderRadius: 40,
                  overflow: "hidden",
                  background: "#fff",
                  border: `8px solid ${c.c}`,
                  boxShadow: "0 24px 40px rgba(18,59,44,0.22)",
                  transform: `scale(${interpolate(s, [0, 1], [0.4, 1])}) translateY(${Math.sin(frame / 18 + i) * 8}px) rotate(${interpolate(s, [0, 1], [i % 2 ? 8 : -8, 0])}deg)`,
                  opacity: Math.min(1, s * 1.5),
                }}
              >
                <div style={{ height: 250, overflow: "hidden" }}>
                  <Img
                    src={staticFile(`images/${c.img}`)}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
                <div
                  style={{
                    background: c.c,
                    color: "#fff",
                    fontFamily: display,
                    fontWeight: 700,
                    fontSize: 44,
                    textAlign: "center",
                    padding: "14px 0 18px",
                  }}
                >
                  {c.t}
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------------- 4 — Palavras ---------------- */
const WORDS = [
  { pt: "Sol", px: "Txãí" },
  { pt: "Água", px: "Nixí" },
  { pt: "Olá!", px: "Awê!" },
];

const KidWords: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: NIGHT }}>
      <Img
        src={staticFile("images/infantil-categorias-bg.jpg")}
        style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.35 }}
      />
      <ZigZag top={0} color={SUN} />
      <ZigZag bottom={0} color={CLAY} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <Pop>
          <div style={{ fontFamily: display, fontWeight: 700, fontSize: 60, color: SUN }}>
            Suas primeiras palavras
          </div>
        </Pop>
        <div style={{ display: "flex", gap: 40, marginTop: 60 }}>
          {WORDS.map((w, i) => {
            const s = spring({ frame: frame - 22 - i * 14, fps, config: { damping: 8 } });
            return (
              <div
                key={w.pt}
                style={{
                  background: "rgba(255,246,226,0.96)",
                  borderRadius: 34,
                  padding: "34px 52px",
                  textAlign: "center",
                  opacity: Math.min(1, s * 1.6),
                  transform: `translateY(${interpolate(s, [0, 1], [90, 0])}px)`,
                  border: `6px solid ${LEAF}`,
                }}
              >
                <div style={{ fontFamily: body, fontSize: 34, color: "#3C6152" }}>{w.pt}</div>
                <div style={{ fontFamily: display, fontWeight: 700, fontSize: 72, color: CLAY }}>
                  {w.px}
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------------- 5 — Fecho ---------------- */
const KidClosing: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 9 } });
  return (
    <AbsoluteFill style={{ background: `radial-gradient(70% 70% at 50% 40%, #2FBF7C 0%, ${NIGHT} 100%)` }}>
      <Confetti count={30} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <Float amp={10}>
          <div
            style={{
              width: 260,
              height: 260,
              borderRadius: 48,
              overflow: "hidden",
              border: `8px solid ${SUN}`,
              transform: `scale(${interpolate(s, [0, 1], [0.4, 1])})`,
            }}
          >
            <Img
              src={staticFile("images/infantil-logo-new.jpg")}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        </Float>
        <Sequence from={14} layout="none">
          <div style={{ textAlign: "center", marginTop: 38 }}>
            <Pop>
              <div
                style={{
                  fontFamily: display,
                  fontWeight: 700,
                  fontSize: 84,
                  color: SKY,
                  textShadow: `0 7px 0 ${CLAY}`,
                }}
              >
                Awê! Vamos brincar?
              </div>
            </Pop>
            <Pop delay={14}>
              <div
                style={{
                  fontFamily: body,
                  fontWeight: 700,
                  fontSize: 40,
                  color: SUN,
                  marginTop: 18,
                }}
              >
                awa-tech.store
              </div>
            </Pop>
          </div>
        </Sequence>
      </AbsoluteFill>
      <ZigZag bottom={0} color={SUN} />
    </AbsoluteFill>
  );
};

export const InfantilVideo: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: NIGHT }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={110}>
          <KidOpening />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={clockWipe({ width, height })}
          timing={linearTiming({ durationInFrames: 24 })}
        />
        <TransitionSeries.Sequence durationInFrames={110}>
          <KidStatement />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 24 })}
        />
        <TransitionSeries.Sequence durationInFrames={140}>
          <KidMenu />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 20 })}
        />
        <TransitionSeries.Sequence durationInFrames={110}>
          <KidWords />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-bottom" })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 22 })}
        />
        <TransitionSeries.Sequence durationInFrames={110}>
          <KidClosing />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};

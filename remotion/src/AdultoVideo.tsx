import React from "react";
import {
  AbsoluteFill,
  Audio,
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

/** Narração da cena (inicia logo após a entrada visual). */
const Narration: React.FC<{ id: string; from?: number }> = ({ id, from = 8 }) => (
  <Sequence from={from} layout="none">
    <Audio src={staticFile(`audio/${id}.mp3`)} volume={1} />
  </Sequence>
);

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
      <Narration id="a1" from={14} />
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
        <Sequence from={30} layout="none">
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
    <Narration id="a2" />
    <KenBurns src="pataxo-aldeia.jpg" from={1.1} to={1.24} x={-60} />
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

/* ---------------- Cenas 3-6 — Recursos em destaque ---------------- */
type FeatureProps = {
  audio: string;
  index: string;
  image: string;
  eyebrow: string;
  title: string;
  desc: string;
  bullets: string[];
  side?: "left" | "right";
};

const FeatureScene: React.FC<FeatureProps> = ({
  audio,
  index,
  image,
  eyebrow,
  title,
  desc,
  bullets,
  side = "left",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const isLeft = side === "left";
  return (
    <AbsoluteFill style={{ backgroundColor: DEEP }}>
      <Narration id={audio} />
      <KenBurns src={image} from={1.06} to={1.2} x={isLeft ? -40 : 40} />
      <AbsoluteFill
        style={{
          background: isLeft
            ? "linear-gradient(90deg, rgba(7,22,15,0.96) 0%, rgba(7,22,15,0.86) 42%, rgba(7,22,15,0.1) 100%)"
            : "linear-gradient(270deg, rgba(7,22,15,0.96) 0%, rgba(7,22,15,0.86) 42%, rgba(7,22,15,0.1) 100%)",
        }}
      />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          padding: "0 120px",
          alignItems: isLeft ? "flex-start" : "flex-end",
        }}
      >
        <div style={{ maxWidth: 900, textAlign: isLeft ? "left" : "right" }}>
          <Reveal>
            <div
              style={{
                fontFamily: body,
                fontWeight: 700,
                fontSize: 22,
                letterSpacing: 9,
                color: GOLD,
              }}
            >
              {index} · {eyebrow}
            </div>
          </Reveal>
          <Reveal delay={8}>
            <div
              style={{
                fontFamily: display,
                fontWeight: 900,
                fontSize: 86,
                color: CREAM,
                lineHeight: 1.05,
                marginTop: 20,
              }}
            >
              {title}
            </div>
          </Reveal>
          <Reveal delay={20}>
            <div
              style={{
                fontFamily: body,
                fontSize: 32,
                color: "rgba(244,233,212,0.8)",
                marginTop: 24,
                lineHeight: 1.4,
              }}
            >
              {desc}
            </div>
          </Reveal>
          <div
            style={{
              display: "flex",
              gap: 16,
              marginTop: 40,
              flexWrap: "wrap",
              justifyContent: isLeft ? "flex-start" : "flex-end",
            }}
          >
            {bullets.map((b, i) => {
              const s = spring({
                frame: frame - 34 - i * 10,
                fps,
                config: { damping: 20, stiffness: 150 },
              });
              return (
                <div
                  key={b}
                  style={{
                    fontFamily: body,
                    fontWeight: 600,
                    fontSize: 26,
                    color: CREAM,
                    padding: "14px 28px",
                    borderRadius: 999,
                    border: "1px solid rgba(215,177,90,0.5)",
                    background: "rgba(215,177,90,0.08)",
                    opacity: s,
                    transform: `translateY(${interpolate(s, [0, 1], [26, 0])}px)`,
                  }}
                >
                  {b}
                </div>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------------- Scene 7 — Idiomas ---------------- */
const Languages: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const langs = ["Português", "English", "Español", "Patxôhã"];
  return (
    <AbsoluteFill style={{ backgroundColor: DEEP }}>
      <Narration id="a7" />
      <KenBurns src="pataxo-danca.jpg" from={1.2} to={1.05} />
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
              frame: frame - 30 - i * 16,
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

/* ---------------- Scene 8 — Memória viva ---------------- */
const Quote: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: DEEP }}>
      <Narration id="a8" />
      <KenBurns src="pataxo-anciao.jpg" from={1.05} to={1.18} x={30} />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(270deg, rgba(7,22,15,0.95) 0%, rgba(7,22,15,0.8) 45%, rgba(7,22,15,0.2) 100%)",
        }}
      />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "flex-end", padding: "0 120px" }}>
        <div style={{ maxWidth: 880, textAlign: "right" }}>
          <Reveal>
            <div style={{ fontFamily: display, fontSize: 140, color: GOLD, lineHeight: 0.6 }}>”</div>
          </Reveal>
          <Reveal delay={10}>
            <div
              style={{
                fontFamily: display,
                fontWeight: 700,
                fontSize: 68,
                color: CREAM,
                lineHeight: 1.2,
                marginTop: 30,
              }}
            >
              Cada palavra aprendida é uma{" "}
              <span style={{ color: GOLD }}>memória que continua viva.</span>
            </div>
          </Reveal>
          <Reveal delay={30}>
            <div
              style={{
                fontFamily: body,
                fontSize: 26,
                letterSpacing: 6,
                color: "rgba(244,233,212,0.65)",
                marginTop: 34,
              }}
            >
              ANCIÃOS PATAXÓ · ALDEIA
            </div>
          </Reveal>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 26 }}>
            <div
              style={{
                height: 3,
                width: interpolate(frame - 34, [0, 30], [0, 220], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
                background: GOLD,
              }}
            />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------------- Scene 9 — Fecho ---------------- */
const Closing: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 200 } });
  const glow = 0.5 + 0.5 * Math.sin(frame / 14);
  return (
    <AbsoluteFill style={{ backgroundColor: DEEP }}>
      <Narration id="a9" />
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
        <Sequence from={16} layout="none">
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

const T_FADE = (
  <TransitionSeries.Transition
    presentation={fade()}
    timing={linearTiming({ durationInFrames: 20 })}
  />
);

export const AdultoVideo: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: DEEP }}>
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={150}>
        <Opening />
      </TransitionSeries.Sequence>
      {T_FADE}
      <TransitionSeries.Sequence durationInFrames={220}>
        <Statement />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={slide({ direction: "from-right" })}
        timing={springTiming({ config: { damping: 200 }, durationInFrames: 20 })}
      />
      <TransitionSeries.Sequence durationInFrames={200}>
        <FeatureScene
          audio="a3"
          index="01"
          image="trail-saudacoes.jpg"
          eyebrow="TRILHAS GUIADAS"
          title="Do primeiro Awê à conversa"
          desc="Lições curtas e progressivas, com áudio nativo e prática diária."
          bullets={["Saudações", "Família", "Natureza", "Animais"]}
          side="left"
        />
      </TransitionSeries.Sequence>
      {T_FADE}
      <TransitionSeries.Sequence durationInFrames={180}>
        <FeatureScene
          audio="a4"
          index="02"
          image="trail-natureza.jpg"
          eyebrow="DICIONÁRIO PATXÔHÃ"
          title="Milhares de palavras com áudio"
          desc="Busque, ouça a pronúncia original e salve suas palavras favoritas."
          bullets={["Busca instantânea", "Pronúncia real", "Favoritos"]}
          side="right"
        />
      </TransitionSeries.Sequence>
      {T_FADE}
      <TransitionSeries.Sequence durationInFrames={150}>
        <FeatureScene
          audio="a5"
          index="03"
          image="pataxo-danca.jpg"
          eyebrow="TRADUTOR CULTURAL"
          title="Traduza e ouça na hora"
          desc="Frases do dia a dia traduzidas com o contexto cultural da aldeia."
          bullets={["Texto e voz", "Contexto cultural"]}
          side="left"
        />
      </TransitionSeries.Sequence>
      {T_FADE}
      <TransitionSeries.Sequence durationInFrames={180}>
        <FeatureScene
          audio="a6"
          index="04"
          image="pataxo-aldeia.jpg"
          eyebrow="ESPAÇO DO PROFESSOR"
          title="Materiais para a sala de aula"
          desc="Planos de aula, atividades e recursos prontos para educadores."
          bullets={["Planos de aula", "Atividades", "Turmas"]}
          side="right"
        />
      </TransitionSeries.Sequence>
      {T_FADE}
      <TransitionSeries.Sequence durationInFrames={235}>
        <Languages />
      </TransitionSeries.Sequence>
      {T_FADE}
      <TransitionSeries.Sequence durationInFrames={170}>
        <Quote />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={slide({ direction: "from-bottom" })}
        timing={springTiming({ config: { damping: 200 }, durationInFrames: 20 })}
      />
      <TransitionSeries.Sequence durationInFrames={170}>
        <Closing />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  </AbsoluteFill>
);

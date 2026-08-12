import { createFileRoute, Link } from "@tanstack/react-router";
import { requireArea } from "@/lib/area-guard";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { SiteHeader } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { getNarrationUrl } from "@/lib/narration-cache";
import { setLastArea } from "@/lib/last-area";

import josaImg from "@/assets/kids-stories/josa.jpg.asset.json";
import joaoImg from "@/assets/kids-stories/joao.jpg.asset.json";
import monteImg from "@/assets/kids-stories/monte.jpg.asset.json";
import linguaImg from "@/assets/kids-stories/lingua.jpg.asset.json";
import aldeiaAsset from "@/assets/kids-stories/aldeia.jpg.asset.json";
import aweImg from "@/assets/kids-stories/awe.jpg.asset.json";
import arteImg from "@/assets/kids-stories/arte.jpg.asset.json";


const monte = monteImg.url;
const ancianoImg = linguaImg.url;
const aldeiaImg = aldeiaAsset.url;
const dancaImg = aweImg.url;
const artesanatoImg = arteImg.url;
const albumJosaClean = josaImg.url;
const albumAnciao = { url: joaoImg.url };

export const Route = createFileRoute("/historias-infantil")({
  ssr: false,
  beforeLoad: () => requireArea("infantil"),
  head: () => ({
    meta: [
      { title: "Histórias e Narrativas — Awã Tech Infantil" },
      {
        name: "description",
        content:
          "Histórias e narrativas do povo Pataxó contadas para crianças: anciãos, aldeia, língua Patxôhã, floresta e cultura viva.",
      },
      { property: "og:title", content: "Histórias Pataxó — Awã Tech Infantil" },
      {
        property: "og:description",
        content:
          "Um livro mágico e infantil com as histórias do povo Pataxó — para ouvir, ver e sonhar.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HistoriasInfantilPage,
});

type Story = {
  id: string;
  chip: string;
  chipEmoji: string;
  title: string;
  highlight: string;
  image: string;
  paragraphs: string[];
  quote?: string;
  color: string;
  accent: string;
};

const STORIES: Story[] = [
  {
    id: "josa",
    chip: "Guardião da memória",
    chipEmoji: "🪶",
    title: "Ancião Josa",
    highlight: "quem nunca desistiu da aldeia",
    image: albumJosaClean,
    paragraphs: [
      "Desde menino, Josa aprendeu que a terra é a mãe que alimenta, que guarda os antigos e ensina os novos.",
      "Ele lutou pela floresta, pelos rios e pela língua Patxôhã, para que nada do povo Pataxó se perdesse com o tempo.",
      "Hoje ele reúne as crianças em volta do fogo e conta as histórias da aldeia — para que a memória continue viva.",
    ],
    quote:
      "Nossa tradição não é coisa do passado. É o que mantém viva a nossa identidade.",
    color: "#f4a261",
    accent: "#2f6d3a",
  },
  {
    id: "joao",
    chip: "In memoriam",
    chipEmoji: "🕯️",
    title: "Ancião João",
    highlight: "cantou até o último Awê",
    image: albumAnciao.url,
    paragraphs: [
      "Seu João viu a aldeia crescer, enfrentou muitas lutas e nunca baixou a cabeça — sempre com maracá na mão e sorriso no rosto.",
      "Ele dizia que ser ancião é mais que ter cabelos brancos: é guardar as histórias e plantar hoje para que a aldeia floresça amanhã.",
      "Seu maracá silenciou, mas seu canto segue vivo em cada roda de Awê e em cada criança que aprende Patxôhã.",
    ],
    quote:
      "Enquanto houver respeito e união, nosso povo seguirá forte.",
    color: "#ef476f",
    accent: "#118ab2",
  },
  {
    id: "origem",
    chip: "Origem e território",
    chipEmoji: "🗺️",
    title: "A casa Pataxó",
    highlight: "é a Mata Atlântica",
    image: monte,
    paragraphs: [
      "Os Pataxó vivem no sul da Bahia há muitos e muitos luares, guardando as praias, as matas e o sagrado Monte Pascoal.",
      "São quase 50 aldeias espalhadas pela Bahia e Minas Gerais — cada uma com sua história, seu cacique e seu jeito de cuidar da terra.",
    ],
    color: "#06d6a0",
    accent: "#264653",
  },
  {
    id: "lingua",
    chip: "Língua Patxôhã",
    chipEmoji: "🗣️",
    title: "A língua do guerreiro",
    highlight: "está voltando a falar",
    image: ancianoImg,
    paragraphs: [
      "O Patxôhã quase foi silenciado pelo tempo, mas os anciãos e os professores estão trazendo cada palavra de volta.",
      "Cada nova palavra aprendida é um ancestral que volta a falar — e é assim que a língua fica viva no coração das crianças.",
    ],
    color: "#ffd166",
    accent: "#8b5a2b",
  },
  {
    id: "aldeia",
    chip: "Vida na aldeia",
    chipEmoji: "🏡",
    title: "Nossa casa de palha",
    highlight: "vive em roda",
    image: aldeiaImg,
    paragraphs: [
      "Na aldeia, todo mundo se cuida: os mais velhos ensinam, as crianças brincam e a comida vem da terra, do rio e do mar.",
      "No pátio central acontecem os conselhos, as danças e as festas — porque tudo o que é bonito, a gente vive junto.",
    ],
    color: "#8ecae6",
    accent: "#023047",
  },
  {
    id: "ritual",
    chip: "Espiritualidade e dança",
    chipEmoji: "🔥",
    title: "O Awê é o canto",
    highlight: "que abraça a floresta",
    image: dancaImg,
    paragraphs: [
      "No Awê, os corpos pintados de urucum e jenipapo dançam em roda, ao som do maracá, unindo o povo aos encantados da mata.",
      "É um agradecimento cantado: à floresta, aos animais e a cada estrela que vela a aldeia à noite.",
    ],
    color: "#e76f51",
    accent: "#2a9d8f",
  },
  {
    id: "arte",
    chip: "Arte e artesanato",
    chipEmoji: "🎨",
    title: "Mãos que contam",
    highlight: "a história do povo",
    image: artesanatoImg,
    paragraphs: [
      "Sementes, penas, fibras e barro viram colares, cocares e cestos nas mãos dos artesãos Pataxó.",
      "Cada risquinho, cada grafismo é uma palavra antiga — arte que também é escrita ancestral.",
    ],
    color: "#c77dff",
    accent: "#5a189a",
  },
];

// ---------- Narrator (click-to-play on the photo) ----------
let currentAudio: HTMLAudioElement | null = null;
let currentSetter: ((s: "idle") => void) | null = null;

function useKidsNarrator(text: string) {
  const { i18n } = useTranslation();
  const [state, setState] = useState<"idle" | "loading" | "playing">("idle");
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);

  const lang = (i18n.language || "pt").slice(0, 2).toLowerCase();

  // Reset cached audio when the UI language changes so narration re-fetches
  // in the newly-selected language instead of replaying the old blob.
  useEffect(() => {
    stop();
    audioRef.current = null;
    urlRef.current = null;
    prefetch();
  }, [lang]);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
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

  const prefetch = async () => {
    if (urlRef.current) return;
    try {
      const url = await getNarrationUrl({ text, lang, mode: "story", voice: "onyx" });
      if (url) urlRef.current = url;
    } catch {}
  };

  useEffect(() => {
    prefetch();
  }, []);

  const play = async () => {
    if (state === "playing") return stop();
    if (currentAudio && currentAudio !== audioRef.current) {
      try {
        currentAudio.pause();
      } catch {}
      currentSetter?.("idle");
    }
    setState("loading");
    try {
      let url = urlRef.current;
      if (!url) {
        url = await getNarrationUrl({ text, lang, mode: "story", voice: "onyx" });
        if (!url) {
          setState("idle");
          return;
        }
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

  return { state, progress, play, prefetch };
}

function KidsNarratorBar({
  state,
  progress,
  onClick,
  color,
}: {
  state: "idle" | "loading" | "playing";
  progress: number;
  onClick: () => void;
  color: string;
}) {
  const { t } = useTranslation();
  const label =
    state === "loading"
      ? t("common.kidsLoading")
      : state === "playing"
        ? t("common.kidsStop")
        : t("common.kidsListen");
  return (
    <div className="mt-4 flex items-center gap-3">
      <button
        type="button"
        onClick={onClick}
        disabled={state === "loading"}
        className="flex items-center gap-2 rounded-full border-b-4 border-black/15 px-4 py-2 text-sm text-white shadow-md transition-all active:translate-y-0.5 active:border-b-0 disabled:opacity-70"
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
    </div>
  );
}

function StoryCard({ s, idx }: { s: Story; idx: number }) {
  const narrationText = `${s.title}. ${s.highlight}. ${s.paragraphs.join(" ")} ${s.quote ?? ""}`;
  const { state, progress, play, prefetch } = useKidsNarrator(narrationText);
  return (
    <article
      className="story-card relative overflow-hidden rounded-[1.75rem] border-4 border-white/70 bg-[#fffdf3] shadow-[0_14px_30px_-14px_rgba(0,0,0,0.25)]"
      style={{ animationDelay: `${idx * 80}ms` }}
    >
      <div className="flex items-center justify-center px-4 pt-4">
        <span
          className="inline-flex items-center gap-2 rounded-full px-4 py-1 text-[11px] uppercase tracking-widest text-white shadow"
          style={{ background: s.accent }}
        >
          <span aria-hidden>{s.chipEmoji}</span> {s.chip}
        </span>
      </div>

      <header className="px-5 pt-3 text-center">
        <h2
          className="text-2xl leading-tight text-[#3a2412] md:text-3xl"
          style={{ fontFamily: "'Archivo Black', 'Archivo', sans-serif" }}
        >
          {s.title} <span style={{ color: s.color }}>— {s.highlight}</span>
        </h2>
      </header>

      <button
        type="button"
        onClick={play}
        onPointerEnter={prefetch}
        onTouchStart={prefetch}
        onFocus={prefetch}
        aria-label={s.title}
        className="relative mx-4 mt-4 block w-[calc(100%-2rem)] overflow-hidden rounded-2xl border-4 border-white shadow-inner transition-transform active:scale-[0.99]"
      >
        <img
          src={s.image}
          alt={s.title}
          loading="lazy"
          className="h-56 w-full object-cover md:h-72"
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 bg-black/20">
           <div className="rounded-full bg-white/20 p-4 backdrop-blur-md">
             <span className="text-4xl text-white">🔊</span>
           </div>
        </div>
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-3 right-3 flex h-12 w-12 items-center justify-center rounded-full text-2xl text-white shadow-lg"
          style={{ background: s.color }}
        >
          {state === "playing" ? "⏸" : state === "loading" ? "⏳" : "🔊"}
        </span>
      </button>

      <div className="p-5">
        <div
          className={`rounded-2xl p-4 text-sm leading-relaxed text-slate-800 md:text-base transition-all duration-500 ${state === 'playing' ? 'bg-white shadow-md ring-2' : ''}`}
          style={{ 
            backgroundColor: state === 'playing' ? '#ffffff' : `${s.color}22`,
            borderColor: s.color
          }}
        >
          {s.paragraphs.map((p, i) => (
            <p key={i} className={i > 0 ? "mt-2" : ""}>
              {p}
            </p>
          ))}
          {s.quote && (
            <blockquote
              className="mt-3 rounded-xl border-l-4 bg-white/70 p-3 italic text-slate-700"
              style={{ borderColor: s.accent }}
            >
              “{s.quote}”
            </blockquote>
          )}
        </div>

        <KidsNarratorBar state={state} progress={progress} onClick={play} color={s.color} />
      </div>
    </article>
  );
}

// ---------- Decorative jungle border ----------
function JungleBorder() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0"
      style={{
        background:
          "radial-gradient(120% 40% at 50% 0%, rgba(46,125,50,0.18), transparent 60%), radial-gradient(120% 40% at 50% 100%, rgba(46,125,50,0.18), transparent 60%)",
      }}
    >
      <div className="absolute -left-4 top-6 text-5xl select-none" style={{ animation: "leaf-sway 6s ease-in-out infinite" }}>🌿</div>
      <div className="absolute -right-3 top-16 text-4xl select-none" style={{ animation: "leaf-sway 7s ease-in-out infinite reverse" }}>🍃</div>
      <div className="absolute -left-3 bottom-24 text-4xl select-none" style={{ animation: "leaf-sway 8s ease-in-out infinite" }}>🌱</div>
      <div className="absolute -right-4 bottom-10 text-5xl select-none" style={{ animation: "leaf-sway 9s ease-in-out infinite reverse" }}>🌿</div>
      <div className="absolute left-8 top-2 text-2xl">✨</div>
      <div className="absolute right-10 bottom-6 text-2xl">🦋</div>
    </div>
  );
}

function HistoriasInfantilPage() {
  const { t, i18n } = useTranslation();
  useEffect(() => setLastArea("/infantil"), []);

  return (
    <div key={i18n.language} className="kids-theme min-h-screen text-foreground">
      <style>{`
        @keyframes leaf-sway { 0%,100%{transform:rotate(-6deg) translateY(0)} 50%{transform:rotate(6deg) translateY(-4px)} }
        @keyframes card-pop { from{opacity:0; transform:translateY(12px) scale(.98)} to{opacity:1; transform:none} }
        .story-card { animation: card-pop .5s ease-out both; }
      `}</style>

      <SiteHeader mode="infantil" showBackButton />

      <main className="mx-auto max-w-md px-4 pb-16 pt-4 font-['Hind',sans-serif] md:max-w-2xl">
        {/* HERO panel — matches the reference book style */}
        <section className="relative overflow-hidden rounded-[2rem] border-4 border-white/70 bg-[#fdfcf0] p-5 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.25)] md:p-8">
          <JungleBorder />

          <div className="relative z-10">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p className="mb-2 inline-flex items-center gap-1 rounded-full bg-[#2f6d3a] px-3 py-1 text-[10px] uppercase tracking-widest text-white">
                  🪶 {t("common.kidsStoriesChip") ?? "Histórias do Povo"}
                </p>
                <h1
                  className="text-3xl leading-[1.05] tracking-tight text-[#4b2e1f] md:text-5xl"
                  style={{ fontFamily: "'Archivo Black', 'Archivo', sans-serif" }}
                >
                  Pataxó{" "}
                  <span className="text-[#e08e2b]">guardiões</span>
                  <br />
                  <span className="text-[#2f6d3a]">da Mata Atlântica</span>
                </h1>
                <p className="mt-3 rounded-2xl bg-white/70 p-3 text-sm leading-snug text-slate-700 shadow-inner md:text-base">
                  {t("common.kidsStoriesIntro") ??
                    "Origem, território, língua, espiritualidade e arte de um povo que faz da cultura sua arma mais bonita."}
                </p>
              </div>
              <div className="shrink-0 text-6xl md:text-7xl" aria-hidden>
                🧒🏽
              </div>
            </div>
          </div>
        </section>

        {/* STORY CARDS */}
        <section className="mt-6 space-y-6" aria-label="Histórias infantis Pataxó">
          {STORIES.map((s, idx) => (
            <StoryCard key={s.id} s={s} idx={idx} />
          ))}
        </section>

        {/* Closing CTA */}
        <section className="mt-8 rounded-[1.75rem] border-4 border-white/70 bg-[#fdfcf0] p-6 text-center shadow-[0_14px_30px_-14px_rgba(0,0,0,0.25)]">
          <p
            className="text-2xl text-[#2f6d3a]"
            style={{ fontFamily: "'Archivo Black', sans-serif" }}
          >
            Ahuanã! 🌿
          </p>
          <p className="mt-2 text-sm text-slate-700">
            Que estas histórias caminhem com você, curumim!
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Link
              to="/musicas-infantil"
              className="rounded-full border-b-4 border-black/15 bg-[#ef476f] px-4 py-2 text-sm text-white shadow-md transition-all active:translate-y-0.5 active:border-b-0"
              style={{ fontFamily: "'Archivo Black', sans-serif" }}
            >
              🎶 Cantigas
            </Link>
            <Link
              to="/trilhas-infantil"
              className="rounded-full border-b-4 border-black/15 bg-[#06d6a0] px-4 py-2 text-sm text-white shadow-md transition-all active:translate-y-0.5 active:border-b-0"
              style={{ fontFamily: "'Archivo Black', sans-serif" }}
            >
              🗺️ Trilhas
            </Link>
            <Link
              to="/infantil"
              className="rounded-full border-b-4 border-black/15 bg-[#118ab2] px-4 py-2 text-sm text-white shadow-md transition-all active:translate-y-0.5 active:border-b-0"
              style={{ fontFamily: "'Archivo Black', sans-serif" }}
            >
              🏠 Menu
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

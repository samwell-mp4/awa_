import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { BookOpen, Volume2, Heart, Palette, Eraser, Download } from "lucide-react";

import { SiteFooter } from "@/components/home/site-footer";
import { SiteHeader } from "@/components/home/site-header";

export const Route = createFileRoute("/conhecimento")({
  head: () => ({
    meta: [
      { title: "Conhecimento — Awã Tech Infantil" },
      {
        name: "description",
        content:
          "Espaço de conhecimento infantil: aprender palavras, ouvir letras do alfabeto, valores de respeito e jogos de desenhar.",
      },
      { property: "og:title", content: "Conhecimento — Awã Tech Infantil" },
      {
        property: "og:description",
        content: "Aprender, ouvir letras, respeito e jogos de desenhar em um só lugar.",
      },
    ],
  }),
  component: ConhecimentoPage,
});

type TabId = "aprender" | "letras" | "respeito" | "desenhar";

const TABS: { id: TabId; label: string; emoji: string; icon: React.ReactNode; bg: string }[] = [
  { id: "aprender", label: "Aprender", emoji: "📚", icon: <BookOpen className="h-5 w-5" />, bg: "from-amber-300 to-orange-500" },
  { id: "letras", label: "Ouvir Letras", emoji: "🔊", icon: <Volume2 className="h-5 w-5" />, bg: "from-sky-400 to-cyan-500" },
  { id: "respeito", label: "Respeito", emoji: "💚", icon: <Heart className="h-5 w-5" />, bg: "from-emerald-400 to-green-600" },
  { id: "desenhar", label: "Jogos de Desenhar", emoji: "🎨", icon: <Palette className="h-5 w-5" />, bg: "from-fuchsia-400 to-pink-500" },
];

function ConhecimentoPage() {
  const [tab, setTab] = useState<TabId>("aprender");

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-200 via-emerald-100 to-amber-100 text-foreground">
      <SiteHeader mode="infantil" />

      <main className="mx-auto max-w-5xl px-4 pb-16 md:px-8">
        <header className="mt-6 rounded-[2rem] border-4 border-amber-300 bg-white/70 p-5 text-center shadow-lg">
          <div className="text-4xl">🌿</div>
          <h1 className="mt-2 font-display text-3xl font-black uppercase tracking-wide text-emerald-900 md:text-4xl">
            Conhecimento
          </h1>
          <p className="mt-1 text-sm font-semibold text-emerald-800 md:text-base">
            Aprender · Ouvir letras · Respeito · Desenhar — tudo em um só lugar!
          </p>
        </header>

        {/* Tabs */}
        <nav className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-br ${t.bg} px-3 py-3 text-white shadow-md ring-4 transition-transform active:scale-95 ${
                  active ? "ring-white/90 -translate-y-1" : "ring-white/40 opacity-90 hover:-translate-y-0.5"
                }`}
              >
                <span aria-hidden className="text-xl">{t.emoji}</span>
                {t.icon}
                <span className="font-display text-sm font-black uppercase tracking-wide">{t.label}</span>
              </button>
            );
          })}
        </nav>

        <section className="mt-6 rounded-[1.75rem] border-4 border-white/70 bg-white/80 p-5 shadow-xl md:p-8">
          {tab === "aprender" && <AprenderSection />}
          {tab === "letras" && <LetrasSection />}
          {tab === "respeito" && <RespeitoSection />}
          {tab === "desenhar" && <DesenharSection />}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

/* ---------------- Aprender ---------------- */

const APRENDER_WORDS = [
  { pt: "Olá", pat: "Aria", emoji: "👋" },
  { pt: "Água", pat: "Kamãy", emoji: "💧" },
  { pt: "Sol", pat: "Ãpê", emoji: "☀️" },
  { pt: "Lua", pat: "Djahá", emoji: "🌙" },
  { pt: "Fogo", pat: "Toá", emoji: "🔥" },
  { pt: "Floresta", pat: "Mãtxi", emoji: "🌳" },
  { pt: "Pai", pat: "Kotxá", emoji: "👨" },
  { pt: "Mãe", pat: "Mãy", emoji: "👩" },
];

function speak(text: string, lang = "pt-BR") {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = 0.85;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

function AprenderSection() {
  return (
    <div>
      <h2 className="font-display text-2xl font-black uppercase text-emerald-900">Aprender Palavras</h2>
      <p className="mt-1 text-sm text-emerald-800">Toque em uma palavra para ouvir.</p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        {APRENDER_WORDS.map((w) => (
          <li key={w.pat}>
            <button
              onClick={() => speak(w.pat)}
              className="group flex w-full items-center gap-3 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-200 p-4 text-left ring-2 ring-amber-300 transition-transform hover:-translate-y-0.5 active:scale-95"
            >
              <span className="grid h-14 w-14 place-items-center rounded-full bg-white text-3xl shadow-inner">
                {w.emoji}
              </span>
              <span className="flex-1">
                <span className="block font-display text-lg font-black uppercase text-emerald-900">{w.pat}</span>
                <span className="block text-sm text-emerald-800">{w.pt}</span>
              </span>
              <Volume2 className="h-5 w-5 text-emerald-700 transition group-hover:scale-110" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------- Ouvir Letras ---------------- */

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function LetrasSection() {
  return (
    <div>
      <h2 className="font-display text-2xl font-black uppercase text-sky-900">Ouvir as Letras</h2>
      <p className="mt-1 text-sm text-sky-800">Toque em uma letra para ouvir o som.</p>
      <div className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-7 md:grid-cols-9">
        {ALPHABET.map((letter) => (
          <button
            key={letter}
            onClick={() => speak(letter, "pt-BR")}
            className="aspect-square rounded-2xl bg-gradient-to-br from-sky-300 to-cyan-500 font-display text-2xl font-black text-white shadow-md ring-2 ring-white/60 transition-transform hover:-translate-y-0.5 active:scale-90"
          >
            {letter}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Respeito ---------------- */

const VALORES = [
  { emoji: "🌱", title: "Cuidar da Natureza", desc: "A floresta é nossa casa. Cuidamos das árvores, dos rios e dos animais." },
  { emoji: "🧓", title: "Ouvir os Anciãos", desc: "Os mais velhos ensinam com sabedoria. Ouvir é aprender." },
  { emoji: "🤝", title: "Ajudar o Próximo", desc: "Na aldeia todos se ajudam. Juntos somos mais fortes." },
  { emoji: "🕊️", title: "Falar com Carinho", desc: "Palavras boas alegram o coração de quem escuta." },
  { emoji: "🎨", title: "Respeitar a Cultura", desc: "Cada povo tem sua língua, sua pintura e sua história." },
  { emoji: "🙏", title: "Agradecer Sempre", desc: "Agradecer pelo alimento, pelo sol e pelos amigos." },
];

function RespeitoSection() {
  return (
    <div>
      <h2 className="font-display text-2xl font-black uppercase text-emerald-900">Valores de Respeito</h2>
      <p className="mt-1 text-sm text-emerald-800">Aprenda os valores do povo Pataxó.</p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {VALORES.map((v) => (
          <li
            key={v.title}
            className="rounded-2xl bg-gradient-to-br from-emerald-100 to-green-200 p-4 ring-2 ring-emerald-300"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-2xl shadow-inner">
                {v.emoji}
              </span>
              <h3 className="font-display text-lg font-black uppercase text-emerald-900">{v.title}</h3>
            </div>
            <p className="mt-2 text-sm text-emerald-900/90">{v.desc}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------- Jogos de Desenhar ---------------- */

const COLORS = ["#000000", "#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899", "#ffffff"];
const PROMPTS = ["🦜 Desenhe uma arara", "🐢 Desenhe uma tartaruga", "🌳 Desenhe uma árvore", "🏹 Desenhe um arco e flecha", "🔥 Desenhe uma fogueira", "🌙 Desenhe a lua"];

function DesenharSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [color, setColor] = useState("#10b981");
  const [size, setSize] = useState(6);
  const [prompt, setPrompt] = useState(PROMPTS[0]);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, c.width, c.height);
  }, []);

  function pos(e: React.PointerEvent<HTMLCanvasElement>) {
    const c = canvasRef.current!;
    const r = c.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * c.width,
      y: ((e.clientY - r.top) / r.height) * c.height,
    };
  }

  function start(e: React.PointerEvent<HTMLCanvasElement>) {
    drawing.current = true;
    const ctx = canvasRef.current!.getContext("2d")!;
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
  }
  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const ctx = canvasRef.current!.getContext("2d")!;
    const p = pos(e);
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }
  function end() {
    drawing.current = false;
  }
  function clear() {
    const c = canvasRef.current!;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, c.width, c.height);
  }
  function download() {
    const c = canvasRef.current!;
    const url = c.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "meu-desenho.png";
    a.click();
  }
  function newPrompt() {
    const next = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
    setPrompt(next);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-2xl font-black uppercase text-pink-900">Jogos de Desenhar</h2>
        <button
          onClick={newPrompt}
          className="rounded-full bg-pink-500 px-4 py-1.5 text-sm font-bold text-white shadow ring-2 ring-white/60 active:scale-95"
        >
          Nova ideia 🎲
        </button>
      </div>
      <p className="mt-1 rounded-xl bg-pink-100 px-3 py-2 text-sm font-semibold text-pink-900 ring-2 ring-pink-300">
        {prompt}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <div className="flex gap-1.5">
          {COLORS.map((c) => (
            <button
              key={c}
              aria-label={`Cor ${c}`}
              onClick={() => setColor(c)}
              className={`h-8 w-8 rounded-full ring-2 transition ${
                color === c ? "ring-black scale-110" : "ring-white/70"
              }`}
              style={{ background: c }}
            />
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold text-pink-900">
          Traço
          <input
            type="range"
            min={2}
            max={30}
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
          />
        </label>
        <div className="ml-auto flex gap-2">
          <button
            onClick={clear}
            className="flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-sm font-bold text-pink-900 ring-2 ring-pink-300 active:scale-95"
          >
            <Eraser className="h-4 w-4" /> Limpar
          </button>
          <button
            onClick={download}
            className="flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1.5 text-sm font-bold text-white ring-2 ring-white/60 active:scale-95"
          >
            <Download className="h-4 w-4" /> Salvar
          </button>
        </div>
      </div>

      <div className="mt-3 overflow-hidden rounded-2xl ring-4 ring-pink-300">
        <canvas
          ref={canvasRef}
          width={900}
          height={560}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
          className="block w-full touch-none bg-white"
          style={{ aspectRatio: "900 / 560" }}
        />
      </div>
    </div>
  );
}

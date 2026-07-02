import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Loader2, Play, Volume2 } from "lucide-react";
import { speakText } from "@/lib/tts.functions";

import v1 from "@/assets/videos/VID-20260630-WA0052.mp4.asset.json";
import v2 from "@/assets/videos/VID-20260630-WA0054.mp4.asset.json";
import v3 from "@/assets/videos/VID-20260630-WA0058.mp4.asset.json";
import v4 from "@/assets/videos/VID-20260630-WA0061.mp4.asset.json";
import v5 from "@/assets/videos/VID-20260630-WA0063.mp4.asset.json";
import v6 from "@/assets/videos/VID-20260630-WA0069.mp4.asset.json";
import v7 from "@/assets/videos/VID-20260630-WA0070.mp4.asset.json";
import v8 from "@/assets/videos/VID-20260701-WA0089.mp4.asset.json";
import v9 from "@/assets/videos/VID-20260701-WA0090.mp4.asset.json";
import v10 from "@/assets/videos/VID-20260701-WA0092.mp4.asset.json";

export const Route = createFileRoute("/videos")({
  head: () => ({
    meta: [
      { title: "Vídeos Pataxó — AWÃ TECH" },
      { name: "description", content: "Vídeos do povo Pataxó com histórias narradas por IA em português." },
    ],
  }),
  component: VideosPage,
});

type VideoStory = {
  url: string;
  title: string;
  short: string;
  story: string;
};

const videos: VideoStory[] = [
  {
    url: v1.url,
    title: "Momentos da aldeia I",
    short: "Cenas do cotidiano Pataxó.",
    story:
      "Este é um registro do cotidiano do povo Pataxó — momentos simples que carregam séculos de história. Cada gesto, cada olhar, cada movimento na aldeia é a continuidade viva de uma cultura que resiste e se reinventa há mais de 500 anos no sul da Bahia.",
  },
  {
    url: v2.url,
    title: "Momentos da aldeia II",
    short: "A vida que segue no território.",
    story:
      "Mais um flagrante da vida Pataxó. A aldeia é escola, casa, templo e praça ao mesmo tempo. Aqui os saberes passam de boca em boca, de mão em mão, e cada dia é uma oportunidade de fortalecer a identidade do povo.",
  },
  {
    url: v3.url,
    title: "Momentos da aldeia III",
    short: "O povo em seu território.",
    story:
      "Cada cena da aldeia é uma afirmação de existência. O povo Pataxó habita o sul da Bahia desde tempos imemoriais e segue mantendo viva sua língua, o Patxôhã, suas festas, seus cantos e sua relação sagrada com a mata.",
  },
  {
    url: v4.url,
    title: "Momentos da aldeia IV",
    short: "Tradição em movimento.",
    story:
      "A tradição Pataxó não é algo parado no tempo — ela pulsa, se transforma e caminha com o povo. Neste vídeo vemos um pedaço desse movimento vivo, que junta ancestralidade e presente numa mesma respiração.",
  },
  {
    url: v5.url,
    title: "Momentos da aldeia V",
    short: "O território que é casa.",
    story:
      "A terra Pataxó não é propriedade — é parente. Ela ensina, alimenta e guarda os ossos dos antepassados. Cada rio, cada mata e cada trilha carrega nomes na língua Patxôhã. Defender o território é defender a possibilidade de continuar sendo Pataxó.",
  },
  {
    url: v6.url,
    title: "Momentos da aldeia VI",
    short: "Encontros e celebrações.",
    story:
      "Quando o povo se reúne, é sempre um ato de força. Encontros, celebrações e trocas são o combustível da vida coletiva Pataxó. Cada roda formada é uma resposta viva a séculos de tentativa de silenciamento.",
  },
  {
    url: v7.url,
    title: "Momentos da aldeia VII",
    short: "Beleza e resistência.",
    story:
      "Beleza e resistência caminham juntas na cultura Pataxó. O que se vê aqui não é apenas estética — é uma forma de dizer ao mundo: 'estamos aqui, seguimos existindo, seguimos Pataxó'.",
  },
  {
    url: v8.url,
    title: "Momentos da aldeia VIII",
    short: "Vozes que sustentam a memória.",
    story:
      "Cada voz que se ergue na aldeia sustenta a memória do povo. São essas vozes que ensinam as crianças as primeiras palavras em Patxôhã e que guardam as histórias antigas para as próximas gerações.",
  },
  {
    url: v9.url,
    title: "Momentos da aldeia IX",
    short: "Cultura que se compartilha.",
    story:
      "A cultura Pataxó se compartilha — na feira, no artesanato, nos encontros, nos cantos. Cada peça, cada palavra, cada gesto trocado é um pedaço de história que segue caminho, contando ao visitante quem são os donos ancestrais dessa terra.",
  },
  {
    url: v10.url,
    title: "Momentos da aldeia X",
    short: "O povo Pataxó, forte e presente.",
    story:
      "Este último registro reafirma a mensagem central: o povo Pataxó está aqui, forte, presente e cheio de futuro. Cada vídeo desta galeria é um convite a escutar, respeitar e aprender com quem nunca deixou de habitar essa terra.",
  },
];


function VideosPage() {
  const speak = useServerFn(speakText);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [loadingIdx, setLoadingIdx] = useState<number | null>(null);
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);

  async function playStory(idx: number, story: string) {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (playingIdx === idx) {
        setPlayingIdx(null);
        return;
      }
      setLoadingIdx(idx);
      const res = await speak({ data: { text: story, voice: "alloy" } });
      const audio = new Audio(`data:${res.mime};base64,${res.audio_base64}`);
      audioRef.current = audio;
      audio.onended = () => setPlayingIdx(null);
      await audio.play();
      setPlayingIdx(idx);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingIdx(null);
    }
  }

  return (
    <div className="min-h-screen text-foreground">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[oklch(0.18_0.04_145/0.7)] border-b border-gold/20">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 md:px-8">
          <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-gold/30 px-3 py-1.5 text-sm text-cream hover:bg-gold/10">
            <ArrowLeft className="h-4 w-4" /> Início
          </Link>
          <h1 className="font-display text-lg font-black text-cream">Vídeos Pataxó</h1>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 md:px-8">
        <p className="mb-6 max-w-2xl text-sm text-foreground/70">
          Clique em qualquer vídeo para assistir. A IA narrará automaticamente a história cultural por trás da cena, em português.
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((v, i) => {
            const isLoading = loadingIdx === i;
            const isPlaying = playingIdx === i;
            return (
              <article key={i} className="group overflow-hidden rounded-2xl border border-gold/25 bg-card/50 backdrop-blur transition hover:border-gold/50">
                <div className="relative aspect-video bg-black">
                  <video
                    src={v.url}
                    controls
                    playsInline
                    preload="metadata"
                    className="h-full w-full object-cover"
                    onPlay={() => {
                      if (!isPlaying && !isLoading) playStory(i, v.story);
                    }}
                  />
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <h2 className="font-display text-base font-black text-cream">{v.title}</h2>
                    <p className="text-xs text-gold/90 italic">{v.short}</p>
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed line-clamp-4">{v.story}</p>
                  <button
                    onClick={() => playStory(i, v.story)}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 rounded-full bg-[var(--gradient-leaf)] px-4 py-2 text-xs font-bold text-cream shadow-[var(--shadow-glow)] disabled:opacity-60"
                  >
                    {isLoading ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Gerando áudio...</>
                    ) : isPlaying ? (
                      <><Volume2 className="h-4 w-4" /> Parar narração</>
                    ) : (
                      <><Play className="h-4 w-4" /> Ouvir história</>
                    )}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
}

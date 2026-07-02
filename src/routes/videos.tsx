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
    title: "Awê na aldeia",
    short: "O canto que abre o chão sagrado.",
    story:
      "Neste vídeo, o povo Pataxó se reúne em roda para o Awê, o ritual de canto e dança que celebra a vida. Cada passo firma o pé na terra dos ancestrais, cada voz chama a força da mata. Awê é oração cantada — é o momento em que a aldeia inteira vira um só corpo, batendo o chão para acordar a memória do território.",
  },
  {
    url: v2.url,
    title: "Pintura de jenipapo",
    short: "A pele que veste a floresta.",
    story:
      "O jenipapo tinge a pele de preto azulado e desenha nos corpos os grafismos Pataxó. Cada traço tem nome, tem história — fala de peixe, de cobra, de caminho, de família. Pintar-se é vestir a floresta, é dizer ao mundo quem se é e a que povo se pertence.",
  },
  {
    url: v3.url,
    title: "Meninos guerreiros",
    short: "A infância que já sabe seu lugar.",
    story:
      "As crianças Pataxó crescem escutando os mais velhos e imitando os passos do Awê. Nos gestos pequenos já existe a semente do guerreiro e da guerreira que defenderão o território. Aqui, brincar também é aprender a resistir.",
  },
  {
    url: v4.url,
    title: "Roda de Tohé",
    short: "O canto que cura e reúne.",
    story:
      "O Tohé é um dos cantos mais sagrados dos povos originários do Nordeste. Reúne pajés, lideranças e comunidade em volta do fogo. Cantar Tohé é chamar os encantados, é pedir cura, é agradecer a chuva e a colheita. Cada palavra pronunciada guarda séculos de espiritualidade Pataxó.",
  },
  {
    url: v5.url,
    title: "Território vivo",
    short: "A terra que é mãe e é escola.",
    story:
      "A terra Pataxó não é propriedade — é parente. Ela ensina, alimenta e guarda os ossos dos antepassados. Cada rio, cada mata e cada trilha carrega nomes na língua Patxôhã. Defender o território é defender a possibilidade de continuar sendo Pataxó.",
  },
  {
    url: v6.url,
    title: "Festa da colheita",
    short: "Gratidão em forma de dança.",
    story:
      "Quando a mandioca e o milho chegam maduros, a aldeia celebra. É tempo de dividir a farinha nova, de cantar para a terra que deu fruto e de reunir os parentes de aldeias vizinhas. A festa é o jeito Pataxó de dizer 'obrigado' à floresta.",
  },
  {
    url: v7.url,
    title: "Cocar de gavião",
    short: "As penas que carregam o céu.",
    story:
      "O cocar Pataxó é feito com penas escolhidas com respeito. Cada pena representa uma qualidade — coragem, sabedoria, visão de longe. Usar o cocar é vestir a força dos pássaros e dos antepassados que voam sobre a aldeia.",
  },
  {
    url: v8.url,
    title: "Mulheres do canto",
    short: "As vozes que sustentam a memória.",
    story:
      "São as mulheres Pataxó que puxam muitos dos cantos, que ensinam as crianças as primeiras palavras em Patxôhã e que guardam as receitas, os remédios do mato e as histórias antigas. Quando cantam juntas, a aldeia lembra quem é.",
  },
  {
    url: v9.url,
    title: "Feira de artesanato",
    short: "Economia que é resistência.",
    story:
      "Colares de miçangas, arcos, maracás e bijus de mandioca — o artesanato Pataxó sustenta famílias e mantém viva a tradição. Cada peça vendida na feira é um pedaço de cultura que segue caminho, contando ao visitante quem são os donos ancestrais dessa terra.",
  },
  {
    url: v10.url,
    title: "Aldeia em festa",
    short: "O povo reunido, forte e alegre.",
    story:
      "Quando o povo Pataxó se junta em festa, é a resposta viva a séculos de tentativa de silenciamento. Cantar, dançar e rir na aldeia é um ato político e espiritual. É afirmar: 'estamos aqui, seguimos existindo, seguimos Pataxó'.",
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

import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Volume2, VolumeX, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAutoTranslate } from "@/hooks/use-auto-translate";


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
import { PremiumGate } from "@/components/PremiumGate";

export const Route = createFileRoute("/videos")({
  head: () => ({
    meta: [
      { title: "Vídeos Pataxó — AWÃ TECH" },
      { name: "description", content: "Vídeos do povo Pataxó (Premium)." },
    ],
  }),
  component: () => (
    <PremiumGate title="Vídeos da aldeia (Premium)" description="Assine para assistir a todos os vídeos com trilha indígena e histórias completas.">
      <VideosPage />
    </PremiumGate>
  ),
});

type VideoStory = { url: string; title: string; short: string; story: string; aldeia: string };

const ALDEIAS = ["Todas", "Aldeia Velha", "Barra Velha", "Coroa Vermelha", "Jaqueira", "Boca da Mata"] as const;

const videos: VideoStory[] = [
  { url: v1.url, title: "Momentos da aldeia I", short: "Cenas do cotidiano Pataxó.", story: "Este é um registro do cotidiano do povo Pataxó — momentos simples que carregam séculos de história. Cada gesto, cada olhar, cada movimento na aldeia é a continuidade viva de uma cultura que resiste e se reinventa há mais de 500 anos no sul da Bahia.", aldeia: "Aldeia Velha" },
  { url: v2.url, title: "Momentos da aldeia II", short: "A vida que segue no território.", story: "Mais um flagrante da vida Pataxó. A aldeia é escola, casa, templo e praça ao mesmo tempo. Aqui os saberes passam de boca em boca, de mão em mão, e cada dia é uma oportunidade de fortalecer a identidade do povo.", aldeia: "Barra Velha" },
  { url: v3.url, title: "Momentos da aldeia III", short: "O povo em seu território.", story: "Cada cena da aldeia é uma afirmação de existência. O povo Pataxó habita o sul da Bahia desde tempos imemoriais e segue mantendo viva sua língua, o Patxôhã, suas festas, seus cantos e sua relação sagrada com a mata.", aldeia: "Coroa Vermelha" },
  { url: v4.url, title: "Momentos da aldeia IV", short: "Tradição em movimento.", story: "A tradição Pataxó não é algo parado no tempo — ela pulsa, se transforma e caminha com o povo. Neste vídeo vemos um pedaço desse movimento vivo, que junta ancestralidade e presente numa mesma respiração.", aldeia: "Jaqueira" },
  { url: v5.url, title: "Momentos da aldeia V", short: "O território que é casa.", story: "A terra Pataxó não é propriedade — é parente. Ela ensina, alimenta e guarda os ossos dos antepassados. Cada rio, cada mata e cada trilha carrega nomes na língua Patxôhã. Defender o território é defender a possibilidade de continuar sendo Pataxó.", aldeia: "Boca da Mata" },
  { url: v6.url, title: "Momentos da aldeia VI", short: "Encontros e celebrações.", story: "Quando o povo se reúne, é sempre um ato de força. Encontros, celebrações e trocas são o combustível da vida coletiva Pataxó. Cada roda formada é uma resposta viva a séculos de tentativa de silenciamento.", aldeia: "Aldeia Velha" },
  { url: v7.url, title: "Momentos da aldeia VII", short: "Beleza e resistência.", story: "Beleza e resistência caminham juntas na cultura Pataxó. O que se vê aqui não é apenas estética — é uma forma de dizer ao mundo: 'estamos aqui, seguimos existindo, seguimos Pataxó'.", aldeia: "Barra Velha" },
  { url: v8.url, title: "Momentos da aldeia VIII", short: "Vozes que sustentam a memória.", story: "Cada voz que se ergue na aldeia sustenta a memória do povo. São essas vozes que ensinam as crianças as primeiras palavras em Patxôhã e que guardam as histórias antigas para as próximas gerações.", aldeia: "Coroa Vermelha" },
  { url: v9.url, title: "Momentos da aldeia IX", short: "Cultura que se compartilha.", story: "A cultura Pataxó se compartilha — na feira, no artesanato, nos encontros, nos cantos. Cada peça, cada palavra, cada gesto trocado é um pedaço de história que segue caminho, contando ao visitante quem são os donos ancestrais dessa terra.", aldeia: "Jaqueira" },
  { url: v10.url, title: "Momentos da aldeia X", short: "O povo Pataxó, forte e presente.", story: "Este último registro reafirma a mensagem central: o povo Pataxó está aqui, forte, presente e cheio de futuro. Cada vídeo desta galeria é um convite a escutar, respeitar e aprender com quem nunca deixou de habitar essa terra.", aldeia: "Boca da Mata" },
];


function VideosPage() {
  const { t } = useTranslation();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(false);

  const { data: bgUrl } = useQuery({
    queryKey: ["bg-song"],
    queryFn: async () => {
      const { data } = await supabase
        .from("songs")
        .select("audio_url")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data?.audio_url ?? null;
    },
    staleTime: 60 * 60 * 1000,
  });

  useEffect(() => {
    if (!bgUrl) return;
    const a = new Audio(bgUrl);
    a.loop = true;
    a.volume = 0.35;
    audioRef.current = a;
    const start = () => {
      a.play().catch(() => {});
      window.removeEventListener("pointerdown", start);
    };
    a.play().catch(() => window.addEventListener("pointerdown", start, { once: true }));
    return () => {
      a.pause();
      audioRef.current = null;
      window.removeEventListener("pointerdown", start);
    };
  }, [bgUrl]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muted;
  }, [muted]);

  // Collect all localizable strings (page chrome + video captions) and translate in one batch
  const staticStrings = useMemo(
    () => [
      "Vídeos Pataxó",
      "Início",
      "Ativar música de fundo",
      "Silenciar música de fundo",
      "Música off",
      "Música on",
      "Assista aos vídeos com música indígena tocando ao fundo. Cada cena vem acompanhada da sua história escrita.",
    ],
    [],
  );
  const videoStrings = useMemo(
    () => videos.flatMap((v) => [v.title, v.short, v.story]),
    [],
  );
  const [
    tTitle,
    tHome,
    tMuteOn,
    tMuteOff,
    tMusicOff,
    tMusicOn,
    tIntro,
  ] = useAutoTranslate(staticStrings);
  const tVideos = useAutoTranslate(videoStrings);

  // Silence "unused t" while keeping i18n subscription (re-renders on lang change)
  void t;

  return (
    <div className="min-h-screen text-foreground">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[oklch(0.18_0.04_145/0.7)] border-b border-gold/20">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 md:px-8">
          <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-gold/30 px-3 py-1.5 text-sm text-cream hover:bg-gold/10">
            <ArrowLeft className="h-4 w-4" /> {tHome}
          </Link>
          <h1 className="font-display text-lg font-black text-cream flex-1">{tTitle}</h1>
          <button
            onClick={() => setMuted((m) => !m)}
            className="inline-flex items-center gap-2 rounded-full border border-gold/30 px-3 py-1.5 text-xs text-cream hover:bg-gold/10"
            aria-label={muted ? tMuteOn : tMuteOff}
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            {muted ? tMusicOff : tMusicOn}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 md:px-8">
        <p className="mb-6 max-w-2xl text-sm text-foreground/70">{tIntro}</p>

        <section className="mb-8 overflow-hidden rounded-2xl border border-gold/25 bg-card/50 backdrop-blur">
          <div className="relative aspect-[9/16] max-h-[720px] w-full bg-black sm:aspect-video">
            <iframe
              src="https://www.instagram.com/reel/DZa2jUGOYDi/embed"
              title="Reel Instagram"
              className="h-full w-full"
              allow="autoplay; encrypted-media; picture-in-picture; web-share"
              allowFullScreen
              scrolling="no"
            />
          </div>
          <div className="p-4">
            <h2 className="font-display text-base font-black text-cream">Destaque do Instagram</h2>
            <a
              href="https://www.instagram.com/reel/DZa2jUGOYDi/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gold hover:underline"
            >
              Abrir no Instagram ↗
            </a>
          </div>
        </section>



        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((v, i) => (
            <article key={i} className="group overflow-hidden rounded-2xl border border-gold/25 bg-card/50 backdrop-blur transition hover:border-gold/50">
              <div className="relative aspect-video bg-black">
                <video
                  src={v.url}
                  controls
                  muted
                  playsInline
                  preload="metadata"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <h2 className="font-display text-base font-black text-cream">{tVideos[i * 3] ?? v.title}</h2>
                  <p className="text-xs text-gold/90 italic">{tVideos[i * 3 + 1] ?? v.short}</p>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">{tVideos[i * 3 + 2] ?? v.story}</p>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}


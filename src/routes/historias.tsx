import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Leaf, Sparkles, Users, Palette, Volume2, Square } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { narratePublic } from "@/lib/narrate-public.functions";
import { useAutoTranslate } from "@/hooks/use-auto-translate";
import { T } from "@/components/T";


import danca from "@/assets/pataxo-danca.jpg";
import aldeia from "@/assets/pataxo-aldeia.jpg";
import artesanato from "@/assets/pataxo-artesanato.jpg";
import monte from "@/assets/pataxo-monte-pascoal.jpg";
import anciao from "@/assets/pataxo-anciao.jpg";

import albumPaje from "@/assets/album/paje.jpg.asset.json";
import albumGuerreiraFestival from "@/assets/album/guerreira-festival.jpg.asset.json";
import albumGuerreiraCocar from "@/assets/album/guerreira-cocar.jpg.asset.json";
import albumGuerreiros from "@/assets/album/guerreiros-pintura.jpg.asset.json";
import albumCriancaCocar from "@/assets/album/crianca-cocar.jpg.asset.json";
import albumCriancaJogos from "@/assets/album/crianca-jogos.jpg.asset.json";
import albumPintura from "@/assets/album/pintura-corporal.jpg.asset.json";
import albumAnciao from "@/assets/album/anciao-pataxo.png.asset.json";
import albumJosa from "@/assets/album/anciao-josa.png.asset.json";
import videoJosa from "@/assets/videos/anciao-josa.mp4.asset.json";
import videoJoao from "@/assets/videos/anciao-joao-2.mp4.asset.json";

const album = [
  {
    src: albumPaje.url,
    title: "O Pajé — guardião do sagrado",
    text: "O pajé carrega no cocar de penas e nos colares de sementes a força espiritual do povo. É ele quem conduz as rezas, cura com plantas da mata e mantém a ponte entre a aldeia e os encantados da floresta.",
  },
  {
    src: albumGuerreiraFestival.url,
    title: "Mulher Pataxó em festival",
    text: "As pinturas de urucum no rosto marcam identidade, proteção e pertencimento. Cada traço conta de onde ela vem, de qual aldeia, de qual linhagem — a pele vira território de memória.",
  },
  {
    src: albumGuerreiraCocar.url,
    title: "Cocar de plumas e flor",
    text: "Os grafismos finos em preto no rosto representam os caminhos da mata e a coragem. O cocar com penas verdes, amarelas e a flor vermelha celebra a beleza da floresta viva que vestimos.",
  },
  {
    src: albumGuerreiros.url,
    title: "Jovens guerreiros pintados de onça",
    text: "A pintura de jenipapo em pintas de onça convoca a força do maior predador da mata. Antes de rituais e jogos, os jovens vestem o corpo do animal-espírito para dançar, correr e resistir.",
  },
  {
    src: albumCriancaCocar.url,
    title: "Menino com cocar ancestral",
    text: "Desde cedo as crianças aprendem que o cocar não é adorno: é responsabilidade. Usar as penas dos pais é aceitar o compromisso de cuidar da língua, da terra e das histórias do povo.",
  },
  {
    src: albumCriancaJogos.url,
    title: "Nova geração nos Jogos Indígenas",
    text: "Os Jogos Indígenas Pataxó reúnem aldeias inteiras em corridas, arco e flecha, cabo de guerra e canoagem. Para as crianças, é festa; para os mais velhos, é a certeza de que a cultura segue viva.",
  },
  {
    src: albumPintura.url,
    title: "A pintura corporal como escrita",
    text: "Cada linha aplicada com pincel de fibra e tinta de jenipapo é uma palavra antiga. Os traços nos ombros, no rosto e no peito narram alianças, dons de caça, passagens de vida — é a escrita viva do povo.",
  },
];



export const Route = createFileRoute("/historias")({
  head: () => ({
    meta: [
      { title: "Histórias Pataxó — AWÃ TECH" },
      {
        name: "description",
        content:
          "Histórias do povo Pataxó: origem, território, língua Patxôhã, espiritualidade, arte, alimentação e resistência. Guardiões da Mata Atlântica.",
      },
      { property: "og:title", content: "Histórias Pataxó — AWÃ TECH" },
      {
        property: "og:description",
        content:
          "Conheça a história, cultura e resistência do povo Pataxó, guardiões do sul da Bahia e do Monte Pascoal.",
      },
      { property: "og:image", content: danca },
      { name: "twitter:image", content: danca },
    ],
  }),
  component: HistoriasPage,
});

type Section = {
  id: string;
  title: string;
  icon: typeof Leaf;
  image: string;
  body: string[];
};

const sections: Section[] = [
  {
    id: "origem",
    title: "Origem e Território",
    icon: MapPin,
    image: monte,
    body: [
      "Os Pataxó habitam o sul da Bahia há milênios — guardiões da Mata Atlântica, do litoral e do sagrado Monte Pascoal, no Parque Nacional que leva o mesmo nome.",
      "Pertencem ao tronco linguístico Macro-Jê e hoje vivem em cerca de 50 aldeias espalhadas pela Bahia e Minas Gerais, em cidades como Porto Seguro, Santa Cruz Cabrália e Carmésia.",
      "Antes da chegada dos europeus em 1500, o território Pataxó era um vasto corredor de florestas e praias onde caça, pesca e roça se entrelaçavam com a vida espiritual.",
    ],
  },
  {
    id: "lingua",
    title: "A Língua Patxôhã",
    icon: Sparkles,
    image: anciao,
    body: [
      "O Patxôhã — “língua de guerreiro” — é o idioma materno do povo Pataxó. Quase silenciado pela colonização, vem sendo retomado desde os anos 1990 por mestres, anciãos e jovens pesquisadores.",
      "A retomada linguística é um ato político e espiritual: cada palavra reaprendida é um ancestral que volta a falar. Hoje, escolas indígenas bilíngues ensinam Patxôhã às novas gerações.",
      "No AWÃ TECH você pode estudar o dicionário Patxôhã e conversar com o Professor Akuã para aprender saudações, formar frases e mergulhar na cosmovisão Pataxó.",
    ],
  },
  {
    id: "aldeia",
    title: "Vida na Aldeia",
    icon: Users,
    image: aldeia,
    body: [
      "Nas aldeias Pataxó, as casas de palha e madeira se abrem para um pátio central onde acontecem os encontros, danças e conselhos.",
      "A vida coletiva é regida pelo respeito aos mais velhos, pelo cuidado com as crianças e pela partilha do que vem da terra, do rio e do mar.",
      "Cada aldeia tem seu cacique, seu pajé e seus grupos de cultura, que mantêm vivos os cantos, as pinturas corporais e os rituais herdados dos antepassados.",
    ],
  },
  {
    id: "ritual",
    title: "Espiritualidade e Dança",
    icon: Leaf,
    image: danca,
    body: [
      "O Awê é a dança-ritual mais sagrada do povo Pataxó: em roda, ao som de maracás e cantos, os corpos pintados com urucum e jenipapo celebram a união com a floresta e os encantados.",
      "Pajés conduzem rezas e curas com plantas medicinais, mantendo a ponte entre o mundo visível e o mundo dos espíritos da mata.",
      "Festas como a Semana do Índio em Coroa Vermelha e os Jogos Indígenas reúnem aldeias inteiras em torno da memória ancestral.",
    ],
  },
  {
    id: "arte",
    title: "Arte e Artesanato",
    icon: Palette,
    image: artesanato,
    body: [
      "Sementes da mata, penas, fibras de piaçava, madeira e barro viram colares, cocares, cestos, arcos e cerâmica nas mãos dos artesãos Pataxó.",
      "Cada peça carrega grafismos que contam histórias do povo, dos bichos e da floresta — é arte e é escrita ancestral.",
      "O artesanato sustenta muitas famílias e é também forma de resistência: vender uma peça é compartilhar um pedaço vivo da cultura.",
    ],
  },
];

// Module-level browser cache: same text reused across components/re-renders
const narrationUrlCache = new Map<string, string>();
const narrationPromiseCache = new Map<string, Promise<string>>();

function useNarration(originalText: string) {
  const { i18n } = useTranslation();
  const lang = (i18n.language || "pt").slice(0, 2).toLowerCase();
  const [translatedText] = useAutoTranslate([originalText]);
  const text = translatedText || originalText;
  const [speaking, setSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const narrate = useServerFn(narratePublic);

  const cacheKey = `${lang}::${text}`;

  const fetchUrl = (): Promise<string> => {
    const hit = narrationUrlCache.get(cacheKey);
    if (hit) return Promise.resolve(hit);
    const inflight = narrationPromiseCache.get(cacheKey);
    if (inflight) return inflight;
    const p = narrate({ data: { text, voice: "onyx", lang } })
      .then((res) => {
        const bin = atob(res.audio_base64);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        const url = URL.createObjectURL(new Blob([bytes], { type: res.mime }));
        narrationUrlCache.set(cacheKey, url);
        narrationPromiseCache.delete(cacheKey);
        return url;
      })
      .catch((err) => {
        narrationPromiseCache.delete(cacheKey);
        throw err;
      });
    narrationPromiseCache.set(cacheKey, p);
    return p;
  };

  // Prefetch narration on mount (idle) so first click is instant
  useEffect(() => {
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
    const schedule = w.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1500));
    const id = schedule(() => {
      fetchUrl().catch(() => {});
    });
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
      if (typeof id === "number") clearTimeout(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey]);

  const toggle = async () => {
    if (speaking) {
      audioRef.current?.pause();
      audioRef.current = null;
      setSpeaking(false);
      return;
    }
    try {
      const cached = narrationUrlCache.get(text);
      if (!cached) setLoading(true);
      const url = await fetchUrl();
      const audio = new Audio(url);
      audio.preload = "auto";
      audioRef.current = audio;
      audio.onended = () => setSpeaking(false);
      audio.onerror = () => setSpeaking(false);
      await audio.play();
      setSpeaking(true);
    } catch (err) {
      console.error("Narração falhou:", err);
    } finally {
      setLoading(false);
    }
  };

  return { supported: true, speaking, loading, toggle };
}


function NarratablePhoto({
  src,
  alt,
  text,
}: {
  src: string;
  alt: string;
  text: string;
}) {
  const { speaking, loading, toggle } = useNarration(text);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-gold/30 shadow-2xl shadow-black/50">
      <button
        type="button"
        onClick={toggle}
        disabled={loading}
        className="group relative block w-full cursor-pointer text-left focus:outline-none focus-visible:ring-4 focus-visible:ring-gold/60"
        aria-label={speaking ? "Parar narração" : "Tocar história em áudio"}
      >
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/10 text-white backdrop-blur-sm transition-all ${
              speaking ? "scale-110 animate-pulse bg-white/20" : "opacity-80 group-hover:scale-105 group-hover:opacity-100"
            }`}
          >
            {loading ? (
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : speaking ? (
              <Square className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </div>
        </div>
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-2 text-[10px] tracking-wide text-amber-100/80">
          <span>{loading ? "Preparando voz…" : speaking ? "Ouvindo…" : "Toque para ouvir"}</span>
        </div>

      </button>
    </div>
  );
}
function NarratableVideo({
  src,
  poster,
  alt,
  text,
}: {
  src: string;
  poster: string;
  alt: string;
  text: string;
}) {
  const { speaking, loading, toggle } = useNarration(text);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    if (videoFailed) return;
    const video = videoRef.current;
    if (!video) return;

    if (video.error) {
      setVideoFailed(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.3 }
    );

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onError = () => setVideoFailed(true);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("error", onError);
    observer.observe(video);

    return () => {
      observer.disconnect();
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("error", onError);
    };
  }, [videoFailed]);

  const handleClick = () => {
    toggle();
  };

  if (videoFailed) {
    return <NarratablePhoto src={poster} alt={alt} text={text} />;
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-gold/30 shadow-2xl shadow-black/50">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        muted
        playsInline
        loop
        preload="metadata"
        className="h-full w-full object-cover"
        aria-label={alt}
        onError={() => setVideoFailed(true)}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="group absolute inset-0 flex items-center justify-center focus:outline-none focus-visible:ring-4 focus-visible:ring-gold/60"
        aria-label={speaking ? "Parar narração" : "Tocar história em áudio"}
      >
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/10 text-white backdrop-blur-sm transition-all ${
            speaking ? "scale-110 animate-pulse bg-white/20" : "opacity-80 group-hover:scale-105 group-hover:opacity-100"
          }`}
        >
          {loading ? (
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          ) : speaking ? (
            <Square className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </div>
      </button>
      <div className="pointer-events-none absolute bottom-2 left-2 right-2 flex items-center justify-between gap-2 text-[10px] tracking-wide text-amber-100/80">
        <span>{loading ? "Preparando voz…" : speaking ? "Ouvindo…" : isPlaying ? "Toque para ouvir" : "Toque para ouvir"}</span>
      </div>

    </div>
  );
}




function HistoriasPage() {
  // Batch-translate structured content (sections + album)
  const sectionStrings = useMemo(
    () => sections.flatMap((s) => [s.title, ...s.body]),
    [],
  );
  const tSections = useAutoTranslate(sectionStrings);
  const translatedSections = useMemo(() => {
    let i = 0;
    return sections.map((s) => {
      const title = tSections[i++] ?? s.title;
      const body = s.body.map(() => tSections[i++] ?? "");
      return { ...s, title, body: body.length ? body : s.body };
    });
  }, [tSections]);

  const albumStrings = useMemo(() => album.flatMap((a) => [a.title, a.text]), []);
  const tAlbum = useAutoTranslate(albumStrings);
  const translatedAlbum = useMemo(
    () =>
      album.map((a, idx) => ({
        ...a,
        title: tAlbum[idx * 2] ?? a.title,
        text: tAlbum[idx * 2 + 1] ?? a.text,
      })),
    [tAlbum],
  );

  return (
    <div className="min-h-screen bg-[oklch(0.16_0.04_145)] text-amber-50">
      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={danca}
            alt="Dança ritual Pataxó na floresta"
            width={1920}
            height={1080}
            className="h-full w-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.16_0.04_145/0.5)] via-[oklch(0.16_0.04_145/0.75)] to-[oklch(0.16_0.04_145)]" />
        </div>

        <div className="relative mx-auto max-w-5xl px-5 pt-8 pb-20 md:pt-12 md:pb-28">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-black/30 px-3 py-1.5 text-sm text-amber-100 backdrop-blur hover:bg-black/50"
          >
            <ArrowLeft className="h-4 w-4" /> <T>Voltar</T>
          </Link>

          <p className="mt-8 text-sm uppercase tracking-[0.3em] text-gold">
            🪶 <T>Histórias do Povo</T>
          </p>
          <h1 className="mt-3 font-serif text-4xl leading-tight md:text-6xl">
            <T>Pataxó</T> —{" "}
            <span className="text-gold"><T>guardiões da Mata Atlântica</T></span>
          </h1>
          <p className="mt-5 max-w-2xl text-base text-amber-100/85 md:text-lg">
            <T>Origem, território, língua, espiritualidade, arte e resistência de um povo que faz da cultura sua arma mais bonita.</T>
          </p>

        </div>
      </header>

      {/* Sections */}
      <main className="mx-auto max-w-5xl px-5 pb-32">
        {/* Ancião Josa — destaque no topo */}
        <section className="mb-16 md:mb-24">
          <div className="mb-8 text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-gold">🪶 <T>Guardião da Memória</T></p>
            <h2 className="mt-2 font-serif text-3xl text-amber-50 md:text-5xl">
              <T>Ancião</T> <span className="text-gold">Josa</span> — <T>a história de quem nunca desistiu de sua aldeia</T>
            </h2>
          </div>

          <div className="grid items-center gap-8 md:grid-cols-2">
            <NarratableVideo
              src={videoJosa.url}
              poster={albumJosa.url}
              alt="Vídeo do Ancião Josa Pataxó segurando maracá tradicional em frente à oca da aldeia"
              text={`Ancião Josa, a história de quem nunca desistiu de sua aldeia. Desde jovem, ele aprendeu com os antepassados que a terra não é apenas chão onde se pisa: é a mãe que alimenta, que guarda os mortos e que ensina os vivos. Por toda a sua vida, esteve na linha de frente da luta: defendeu o território contra invasões, denunciou danos às matas e aos rios, e lutou para que a língua Patxôhã, as pinturas, as cantigas e os saberes não desaparecessem com o tempo. Muitas vezes enfrentou dificuldades, mas nunca recuou, pois sabia que lutava não só por si, mas por todos os que vieram antes e por todos os que viriam depois. Hoje, como guardião da memória, ele é a referência da comunidade. Reúne os jovens para contar as histórias da origem do povo, ensina os costumes que vieram das gerações passadas, e reforça sempre: nossa tradição não é coisa do passado. É o que mantém viva a nossa identidade, a nossa ligação com a natureza e o nosso direito de estar aqui, na terra que é nossa. Tradição: os costumes, cantos, pinturas e a língua Patxôhã são tesouros que passam de geração em geração. Luta: defender o território, a floresta e os rios é defender a vida e o futuro do nosso povo. Sabedoria: os mais velhos são os livros vivos que guardam as histórias e os ensinamentos. Resistência: enquanto houver quem guarde e lute por esses saberes, nossa aldeia continuará existindo, forte e viva. Aldeia Velha, Povo Pataxó, nossa terra, nossa vida.`}
            />

            <div className="space-y-4 text-amber-100/90 leading-relaxed">
              <p><T>Desde jovem, Josa aprendeu com os antepassados que a terra não é apenas chão onde se pisa: é a mãe que alimenta, que guarda os mortos e que ensina os vivos.</T></p>
              <p><T>Por toda a sua vida, esteve na linha de frente da luta — defendeu o território contra invasões, denunciou danos às matas e aos rios, e lutou para que a língua Patxôhã, as pinturas, as cantigas e os saberes não desaparecessem com o tempo.</T></p>
              <p><T>Muitas vezes enfrentou dificuldades, mas nunca recuou. Sabia que lutava não só por si, mas por todos os que vieram antes e por todos os que viriam depois.</T></p>
              <blockquote className="rounded-2xl border-l-4 border-gold bg-black/30 p-5 font-serif text-lg italic text-amber-50">
                <T>“Nossa tradição não é coisa do passado. É o que mantém viva a nossa identidade, a nossa ligação com a natureza e o nosso direito de estar aqui, na terra que é nossa.”</T>
              </blockquote>

              <div className="grid grid-cols-2 gap-3 pt-2 text-sm">
                {[
                  { t: "Tradição", d: "Costumes, cantos e língua que passam de geração em geração." },
                  { t: "Luta", d: "Defender a floresta e os rios é defender a vida." },
                  { t: "Sabedoria", d: "Os mais velhos são livros vivos do povo." },
                  { t: "Resistência", d: "Enquanto houver quem guarde, a aldeia segue viva." },
                ].map((b) => (
                  <div key={b.t} className="rounded-2xl border border-gold/25 bg-black/30 p-3">
                    <p className="font-serif text-gold"><T>{b.t}</T></p>
                    <p className="mt-1 text-amber-100/80"><T>{b.d}</T></p>
                  </div>
                ))}
              </div>

              <p className="pt-2 text-center font-serif text-sm uppercase tracking-[0.3em] text-gold">
                <T>Aldeia Velha · Povo Pataxó · Nossa terra, nossa vida</T>
              </p>
            </div>
          </div>
        </section>


        {/* In memoriam — ancião João */}
        <section className="mb-16 md:mb-24">
          <div className="mb-8 text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-gold">🕯️ <T>In memoriam</T></p>
            <h2 className="mt-2 font-serif text-3xl text-amber-50 md:text-4xl">
              <T>A história de quem</T> <span className="text-gold"><T>nunca desistiu</T></span> <T>de sua aldeia</T>
            </h2>
          </div>


          <div className="grid items-center gap-8 md:grid-cols-2">
            <NarratableVideo
              src={videoJoao.url}
              poster={albumAnciao.url}
              alt="Vídeo do Ancião Pataxó sorrindo com maracá e pintura corporal ancestral"
              text={`Sou ancião João. A história de quem nunca desistiu de sua aldeia. Sou ancião do povo Pataxó. Vi minha aldeia mudar, enfrentei muitas lutas, mas nunca baixei a cabeça. Lutei por nossa terra, nossa língua, nossa cultura e por cada criança que sonha com um futuro melhor. Tradição, resistência e sabedoria. Ser ancião é mais que ter cabelos brancos: é guardar as histórias, é ensinar com o exemplo, é plantar hoje para que nossa aldeia floresça amanhã. Lutar pela aldeia é lutar pela vida. Não é fácil. Enfrentamos a invasão, o preconceito, o esquecimento. Mas seguimos firmes, porque nossa força vem de nossos antepassados e do amor que temos por nossa gente. Enquanto houver respeito e união, nosso povo seguirá forte. Essa é a nossa cultura, essa é a nossa vida. Ele foi ancião do povo Pataxó. Viu a aldeia mudar, enfrentou muitas lutas, mas nunca baixou a cabeça. Lutou pela terra, pela língua, pela cultura, e por cada criança que sonha com um futuro melhor. Ser ancião, dizia ele, é mais que ter cabelos brancos: é guardar as histórias, ensinar com o exemplo, e plantar hoje para que a aldeia floresça amanhã. Seu maracá silenciou, mas seu canto segue vivo em cada roda de Awê.`}
            />

            <div className="space-y-4 text-amber-100/90 leading-relaxed">
              <blockquote className="rounded-2xl border-l-4 border-gold bg-black/30 p-5 font-serif text-lg italic text-amber-50">
                <T>“Enquanto houver respeito e união, nosso povo seguirá forte. Essa é a nossa cultura, essa é a nossa vida.”</T>
              </blockquote>
              <p><T>Ele foi ancião do povo Pataxó. Viu a aldeia mudar, enfrentou muitas lutas, mas nunca baixou a cabeça. Lutou pela terra, pela língua, pela cultura — e por cada criança que sonha com um futuro melhor.</T></p>
              <p><T>Ser ancião, dizia ele, é mais que ter cabelos brancos: é guardar as histórias, ensinar com o exemplo, e plantar hoje para que a aldeia floresça amanhã. Seu maracá silenciou, mas seu canto segue vivo em cada roda de Awê.</T></p>
              <p className="font-serif text-gold">
                <T>Somos povo Pataxó · Somos natureza · Somos memória · Somos futuro.</T>
              </p>
            </div>

          </div>
        </section>


        <div className="space-y-16 md:space-y-24">
          {translatedSections.map((s, i) => {
            const Icon = s.icon;
            const reverse = i % 2 === 1;
            return (
              <section
                key={s.id}
                id={s.id}
                className={`grid items-center gap-8 md:grid-cols-2 ${
                  reverse ? "md:[&>*:first-child]:order-2" : ""
                }`}
              >
                <div className="relative">
                  <NarratablePhoto
                    src={s.image}
                    alt={s.title}
                    text={`${s.title}. ${s.body.join(" ")}`}
                  />
                  <div className="pointer-events-none absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-black/50 px-3 py-1 text-xs text-amber-100 backdrop-blur">
                    <Icon className="h-3.5 w-3.5 text-gold" />
                    {s.title}
                  </div>
                </div>

                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs uppercase tracking-widest text-gold">
                    <Icon className="h-3.5 w-3.5" /> <T>Capítulo</T> {i + 1}
                  </div>
                  <h2 className="mt-3 font-serif text-3xl text-amber-50 md:text-4xl">
                    {s.title}
                  </h2>
                  <div className="mt-4 space-y-3 text-amber-100/85 leading-relaxed">
                    {s.body.map((p, idx) => (
                      <p key={idx}>{p}</p>
                    ))}
                  </div>
                </div>
              </section>
            );
          })}
        </div>

        {/* Álbum cultural */}
        <section className="mt-20">
          <div className="mb-8 text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-gold">📸 <T>Álbum do Povo</T></p>
            <h2 className="mt-2 font-serif text-3xl text-amber-50 md:text-4xl">
              <T>Rostos, pinturas e rituais Pataxó</T>
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-amber-100/80">
              <T>Cada foto é um pedaço vivo da cultura — pinturas, cocares e gerações que caminham juntas.</T>
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {translatedAlbum.map((item) => (
              <figure
                key={item.title}
                className="group overflow-hidden rounded-3xl border border-gold/25 bg-black/30 shadow-xl shadow-black/40 backdrop-blur"
              >
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    src={item.src}
                    alt={item.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <figcaption className="p-5">
                  <h3 className="font-serif text-lg text-gold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-amber-100/85">
                    {item.text}
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* Closing */}
        <div className="mt-20 rounded-3xl border border-gold/25 bg-gradient-to-br from-black/40 to-emerald-950/40 p-8 text-center backdrop-blur">
          <p className="font-serif text-2xl text-gold">Ahuanã!</p>
          <p className="mt-2 text-amber-100/85">
            <T>Que estas histórias caminhem com você. Aprenda a língua, ouça os cantos e ajude a manter viva a memória Pataxó.</T>
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link
              to="/professor"
              className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-emerald-950 hover:brightness-110"
            >
              <T>Conversar com Professor Akuã</T>
            </Link>
            <Link
              to="/musicas"
              className="rounded-full border border-gold/40 px-5 py-2 text-sm text-amber-100 hover:bg-white/5"
            >
              <T>Ouvir cantos Pataxó</T>
            </Link>
          </div>
        </div>

      </main>
    </div>
  );
}

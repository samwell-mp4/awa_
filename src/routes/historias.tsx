import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Leaf, Sparkles, Users, Palette, Volume2, Square } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { narratePublic } from "@/lib/narrate-public.functions";
import { useAutoTranslate } from "@/hooks/use-auto-translate";
import { useTranslation } from "react-i18next";
import { SiteHeader } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { T } from "@/components/T";
import { toast } from "sonner";


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
import albumJosaClean from "@/assets/album/anciao-josa-clean.jpg";
const albumJosa = { url: albumJosaClean };
import videoJosa from "@/assets/videos/anciao-josa.mp4.asset.json";
import videoJoao from "@/assets/videos/anciao-joao-2.mp4.asset.json";
import { useLastArea } from "@/lib/last-area";

const ALDEIAS = ["Todas", "Aldeia Velha", "Barra Velha", "Coroa Vermelha", "Jaqueira", "Boca da Mata"] as const;
type Aldeia = (typeof ALDEIAS)[number];

const album: { src: string; title: string; text: string; aldeia: Exclude<Aldeia, "Todas"> }[] = [
  {
    src: albumPaje.url,
    title: "O Pajé — guardião do sagrado",
    text: "O pajé carrega no cocar de penas e nos colares de sementes a força espiritual do povo. É ele quem conduz as rezas, cura com plantas da mata e mantém a ponte entre a aldeia e os encantados da floresta.",
    aldeia: "Barra Velha",
  },
  {
    src: albumGuerreiraFestival.url,
    title: "Mulher Pataxó em festival",
    text: "As pinturas de urucum no rosto marcam identidade, proteção e pertencimento. Cada traço conta de onde ela vem, de qual aldeia, de qual linhagem — a pele vira território de memória.",
    aldeia: "Coroa Vermelha",
  },
  {
    src: albumGuerreiraCocar.url,
    title: "Cocar de plumas e flor",
    text: "Os grafismos finos em preto no rosto representam os caminhos da mata e a coragem. O cocar com penas verdes, amarelas e a flor vermelha celebra a beleza da floresta viva que vestimos.",
    aldeia: "Jaqueira",
  },
  {
    src: albumGuerreiros.url,
    title: "Jovens guerreiros pintados de onça",
    text: "A pintura de jenipapo em pintas de onça convoca a força do maior predador da mata. Antes de rituais e jogos, os jovens vestem o corpo do animal-espírito para dançar, correr e resistir.",
    aldeia: "Barra Velha",
  },
  {
    src: albumCriancaCocar.url,
    title: "Menino com cocar ancestral",
    text: "Desde cedo as crianças aprendem que o cocar não é adorno: é responsabilidade. Usar as penas dos pais é aceitar o compromisso de cuidar da língua, da terra e das histórias do povo.",
    aldeia: "Aldeia Velha",
  },
  {
    src: albumCriancaJogos.url,
    title: "Nova geração nos Jogos Indígenas",
    text: "Os Jogos Indígenas Pataxó reúnem aldeias inteiras em corridas, arco e flecha, cabo de guerra e canoagem. Para as crianças, é festa; para os mais velhos, é a certeza de que a cultura segue viva.",
    aldeia: "Boca da Mata",
  },
  {
    src: albumPintura.url,
    title: "A pintura corporal como escrita",
    text: "Cada linha aplicada com pincel de fibra e tinta de jenipapo é uma palavra antiga. Os traços nos ombros, no rosto e no peito narram alianças, dons de caça, passagens de vida — é a escrita viva do povo.",
    aldeia: "Jaqueira",
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

// Histórias e Narrativas — Comunidade Indígena Pataxó Aldeia Velha (C.I.P.A.V.)
// Texto original do relatório da comunidade. Junho de 2026.
type StoryBlock = { author?: string; text: string; quote?: boolean };
type RelatorioStory = { id: string; title: string; blocks: StoryBlock[] };

const relatorioStories: RelatorioStory[] = [
  {
    id: "sempre-estivemos",
    title: "Sempre estivemos aqui",
    blocks: [
      { text: "A presença nossa é ancestral, nossos direitos são originários que antecedem qualquer legislação construída pelos colonizadores. O uso da tese do marco temporal é inconstitucional e desumana. Os direitos a moradia, a saúde, educação e cultura são direitos fundamentais — isto se dá em nosso território, sem o território não podemos dar continuidade à reprodução física, material e imaterial." },
      { text: "Sempre estivemos presente neste território, mas ao longo das décadas sempre fomos vítimas de opressão, sendo expulsos por pessoas que se apropriaram de forma indevida destas terras, principalmente com o uso de leis criadas pelos colonizadores. Primeiro foi a Capitanias Hereditárias — doaram nossas terras a pessoas que estavam em Portugal — estes por sua vez subdividiam os imensos lotes em sesmarias menores para repassar aos colonos." },
      { text: "Nos foi imposta a língua colonizadora, fomos negados o direito de usarmos nossa língua materna, mas resistimos. Essa resistência se deu com inúmeras estratégias de nossos anciãos para dar continuidade às nossas crenças, costumes e tradições. A memória de luta foi passada através da oralidade, a produção do conhecimento, os saberes e fazeres sempre foram repassados geração a geração. Foi assim que os Pataxó da Terra Indígena Aldeia Velha resistiram." },
    ],
  },
  {
    id: "voz-dos-anciaos",
    title: "A voz de nossos anciãos",
    blocks: [
      { author: "Seu Boaventura Antônio de Souza", quote: true, text: "Declaro que Maria Ângela da Conceição, minha mãe, foi nascida nesta Aldeia em 1901, saiu dessa Aldeia em 1914, período em que foram expulsos pelos poderosos fazendeiros. Os meus parentes eram daqui por parte de mãe, mas eu não fui nascido aqui. Porque na época que nasci, os fazendeiros já tinham expulsado minha mãe da Aldeia. Na época, ela estava com 13 anos de idade." },
      { author: "Antônio Monteiro, posseiro da década de 1940", text: "Ele declarou que naquela época não tinha conhecimento da antiga farinheira. Falava para seus funcionários que aqui era uma área indígena — só sabia porque já havia percorrido a área e encontrado lugares onde foram moradas dos índios, alguns fornos, além de sambaquis — montões de conchas, ostras e esqueletos acumulados por tribos que aqui moravam no litoral." },
      { author: "Seu Josivaldo Alves do Bonfim (Seu Josa)", quote: true, text: "Quantos anos tem a Aldeia Velha? Porque o meu avô veio com 18 anos solteiro para Aldeia Velha, foi para Caraíva, casou, teve cinco filhos. O meu pai cresceu, casou, teve quatro filhos — eu vim para aqui em 1960, com oito anos de idade. Quantos anos tem isso?" },
      { text: "Seus ancestrais estiveram neste território no mínimo desde a década de 1930. Partiu em 16/05/2026, mas sua luta continua em nossa memória." },
    ],
  },
  {
    id: "a-expulsao",
    title: "A expulsão",
    blocks: [
      { author: "Luzia, filha de Seu Josa", quote: true, text: "Saíram daqui corrida. O fazendeiro meteu a máquina na casa de Tuquinho, passou por cima da casa. Derrubaram também a casa de seu tio e as demais casas — saiu derrubando tudo com o trator. Tacou logo o gado aqui dentro e aí tiveram que sair." },
      { author: "Dona Maria Rosa dos Santos (Dona Nair)", quote: true, text: "Mataram os animais de minha família — mataram o jegue, porcos, galinha, matou tudo. Cercou tudo, não tinha como passar nada. O menino estava agachado, bateu a mão dentro do fogo e queimou. Quando foram sair, o carro atolou numa lagoa, dormiram lá atolado, igual a mendigos — sem comer, sem beber, sem coberta, sem nada. Dormiu todo mundo no chão, desmaiados de cansaço e fome. No outro dia levaram até Porto Seguro e deixaram por lá. Para que não voltassem." },
      { author: "Dona Nair", quote: true, text: "Eles têm raiva da gente porque a gente voltou. Tiraram a gente porque viram que estávamos trabalhando — lucraram o dobro com nossas coisas. Pensaram: tiro o que eles têm, daí não conseguem sobreviver." },
    ],
  },
  {
    id: "a-retomada",
    title: "A Retomada — 1992 e 1998",
    blocks: [
      { text: "Em 1992, famílias pataxó dispersas se reuniram e voltaram ao território ancestral. Mas foram expulsos: chegaram cinquenta e cinco policiais por dentro da mata, com motosserra e gasolina, tocaram fogo em tudo e colocaram todos para fora. Tem um indígena que subiu e ficou pendurado no pé de Juerana, dormiu por lá de tanto medo." },
      { text: "Em 1998, voltamos de vez. Dependemos desta terra, ela é sagrada e nunca vamos arredar o pé daqui — porque ela é dos indígenas. Nos juntamos a outras famílias Pataxó desterritorializadas que sempre transitaram por este território — nas romarias, nos festejos, nas caçadas, nas roças, nas coletas de sementes e ervas medicinais." },
      { author: "Seu Áureo Cancela", quote: true, text: "Aqui não tinha ninguém, agora tem tanta criança, pai de família, mãe de família — para onde vão? O governo tem que defender a gente, peço compaixão. Somos seres humanos, não somos bicho. O branco não pode ser melhor que nós indígenas. Nós temos o direito de viver — o que Deus deixou foi para todos." },
      { text: "82 anos, 9 filhos, 52 netos — e ainda luta." },
      { author: "Maria das Neves Cancela", quote: true, text: "Como vamos ficar sem moradia? Como vamos viver? Viver na rua? Não podemos ficar calados, temos que falar." },
      { author: "Dona Marinalva Cancela", quote: true, text: "Nós já estamos idosos, penso nas crianças, nos netos… se saírem daqui, para onde que vão pelo amor de Deus?" },
    ],
  },
  {
    id: "o-que-construimos",
    title: "O que construímos",
    blocks: [
      { text: "Hoje somos mais de 2.350 pessoas, 470 famílias. Temos a Escola Indígena Pataxó Aldeia Velha, com 12 salas, onde se ensina a língua materna Patxôhã, co-oficializada em Porto Seguro em 2023. Temos pajés, parteiras e benzedeiras que cuidam da saúde com ervas medicinais, conhecimento passado de boca em boca. Temos o Grupo de Cultura que leva nosso canto e dança por todo o Brasil. Preservamos 7 quilômetros de manguezal, a mata atlântica, o rio Buranhém — porque cuidar da terra é cuidar de nós mesmos." },
      { text: "Construímos nossas casas, abrimos trilhas com as próprias mãos, fazemos arte, plantamos, pescamos. Lutamos por saúde, por água, por direitos — mas acima de tudo lutamos para continuar sendo nós mesmos." },
    ],
  },
  {
    id: "a-luta-continua",
    title: "A luta continua",
    blocks: [
      { text: "A Terra Indígena Pataxó Aldeia Velha foi homologada pelo Decreto Nº 12.000 em 18 de abril de 2024, registrada em 09 de julho de 2025. E mesmo assim, querem nos tirar daqui. Mandam intimações, ordens de saída. Dizem que a terra não é nossa." },
      { text: "Mas como não é nossa, se aqui estão os ossos dos nossos avós? Se aqui nasceram nossos filhos, nossos netos, nossos bisnetos? Se aqui está a nossa vida inteira?" },
      { quote: true, text: "Não vamos sair. Esta terra é nossa. É sagrada. É ancestral. E aqui ficaremos." },
    ],
  },
];


// Module-level browser cache: same text reused across components/re-renders
const narrationUrlCache = new Map<string, string>();
const narrationPromiseCache = new Map<string, Promise<string>>();

// Only one narration at a time: starting a new one stops the previous.
let activeStop: (() => void) | null = null;
function setActiveNarration(stop: () => void) {
  if (activeStop && activeStop !== stop) {
    try { activeStop(); } catch {}
  }
  activeStop = stop;
}
function clearActiveNarration(stop: () => void) {
  if (activeStop === stop) activeStop = null;
}

function useNarration(originalText: string) {
  const { i18n } = useTranslation();
  const lang = (i18n.language || "pt").slice(0, 2).toLowerCase();
  const [translatedText] = useAutoTranslate([originalText]);
  const text = translatedText || originalText;
  const [speaking, setSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const progressTimerRef = useRef<number | null>(null);
  const narrate = useServerFn(narratePublic);

  const cacheKey = `${lang}::${text}`;

  useEffect(() => {
    prefetch();
  }, [cacheKey]);

  const speechLang = lang === "en" ? "en-US" : lang === "es" ? "es-ES" : "pt-BR";

  const clearProgressTimer = () => {
    if (progressTimerRef.current != null) {
      window.clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  };

  const stopCurrent = () => {
    audioRef.current?.pause();
    audioRef.current = null;
    if (utteranceRef.current && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      utteranceRef.current = null;
    }
    clearProgressTimer();
    setSpeaking(false);
    setProgress(0);
    clearActiveNarration(stopCurrent);
    window.removeEventListener("pointerdown", stopCurrent);
  };

  // Permite parar a narração ao clicar em qualquer lugar da tela
  useEffect(() => {
    if (speaking) {
      window.addEventListener("pointerdown", stopCurrent, { once: true });
    } else {
      window.removeEventListener("pointerdown", stopCurrent);
    }
    return () => window.removeEventListener("pointerdown", stopCurrent);
  }, [speaking]);

  const speakImmediately = () => {
    if (
      typeof window === "undefined" ||
      !("speechSynthesis" in window) ||
      !("SpeechSynthesisUtterance" in window)
    ) {
      return false;
    }

    // Native speech starts immediately on the tap/click, without waiting for network TTS.
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = speechLang;
    utterance.rate = 0.95;
    utterance.pitch = 0.85;
    utterance.onend = () => {
      if (utteranceRef.current === utterance) {
        utteranceRef.current = null;
        clearProgressTimer();
        setSpeaking(false);
        setProgress(0);
      }
    };
    utterance.onerror = () => {
      if (utteranceRef.current === utterance) {
        utteranceRef.current = null;
        clearProgressTimer();
        setSpeaking(false);
        setProgress(0);
      }
    };

    window.speechSynthesis.cancel();
    utteranceRef.current = utterance;
    setSpeaking(true);
    setProgress(0);
    // Estimate duration from text length (~12 chars/sec at rate 0.95)
    const estMs = Math.max(4000, (text.length / 12) * 1000);
    const startedAt = performance.now();
    clearProgressTimer();
    progressTimerRef.current = window.setInterval(() => {
      const p = Math.min(1, (performance.now() - startedAt) / estMs);
      setProgress(p);
      if (p >= 1) clearProgressTimer();
    }, 120);
    window.speechSynthesis.speak(utterance);
    return true;
  };

  const fetchUrl = (): Promise<string> => {
    const hit = narrationUrlCache.get(cacheKey);
    if (hit) return Promise.resolve(hit);
    const inflight = narrationPromiseCache.get(cacheKey);
    if (inflight) return inflight;
    const p = narrate({ data: { text, voice: "onyx", lang } })
      .then((res) => {
        if (res.error || !res.audio_base64) {
          throw new Error(res.message ?? "Não foi possível gerar a narração.");
        }
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

  useEffect(() => {
    return () => {
      stopCurrent();
    };
  }, [cacheKey]);

  const toggle = () => {
    if (speaking) {
      stopCurrent();
      return;
    }
    // Stop any other narration currently playing on the page.
    setActiveNarration(stopCurrent);
    // Create Audio synchronously inside the user gesture — required for mobile autoplay.
    const audio = audioRef.current ?? new Audio();
    audio.preload = "auto";
    audioRef.current = audio;
    audio.currentTime = 0; // Immediate reset to start
    setProgress(0);
    audio.ontimeupdate = () => {
      if (audioRef.current !== audio) return;
      const d = audio.duration;
      if (Number.isFinite(d) && d > 0) {
        setProgress(Math.min(1, audio.currentTime / d));
      }
    };
    audio.onended = () => {
      setSpeaking(false);
      setProgress(0);
    };
    audio.onerror = () => {
      setSpeaking(false);
      setProgress(0);
    };

    const cached = narrationUrlCache.get(cacheKey);
    if (cached) {
      audio.src = cached;
      audio.currentTime = 0;
      audio.play().then(() => setSpeaking(true)).catch(() => setSpeaking(false));
      return;
    }

    if (speakImmediately()) {
      // Warm the higher-quality audio silently for a later tap, but never block this tap.
      fetchUrl().catch(() => {});
      return;
    }

    setLoading(true);
    fetchUrl()
      .then((url) => {
        if (audioRef.current !== audio) return;
        audio.src = url;
        return audio.play().then(() => setSpeaking(true));
      })
      .catch((err) => {
        console.error("Narração falhou:", err);
        toast.error(err instanceof Error ? err.message : "Não foi possível gerar a narração.");
      })
      .finally(() => setLoading(false));
  };

  const prefetch = () => {
    if (narrationUrlCache.has(cacheKey) || narrationPromiseCache.has(cacheKey)) return;
    fetchUrl().catch(() => {});
  };

  return { supported: true, speaking, loading, progress, toggle, prefetch };
}

function RelatorioStoryCard({ story, index }: { story: RelatorioStory; index: number }) {
  const fullText = `${story.title}. ${story.blocks.map((b) => (b.author ? `${b.author} disse: ${b.text}` : b.text)).join(" ")}`;
  const { speaking, loading, progress, toggle, prefetch } = useNarration(fullText);

  return (
    <article
      id={story.id}
      className="rounded-3xl border border-gold/25 bg-black/30 p-6 shadow-xl shadow-black/40 backdrop-blur md:p-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs uppercase tracking-widest text-gold">
          <Volume2 className="h-3.5 w-3.5" /> <T>Narrativa</T> {index + 1}
        </div>
        <button
          type="button"
          onClick={toggle}
          onPointerEnter={prefetch}
          onTouchStart={prefetch}
          onFocus={prefetch}
          disabled={loading}
          className={`relative inline-flex items-center gap-2 overflow-hidden rounded-full px-4 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-gold/60 ${
            speaking
              ? "bg-amber-100 text-emerald-950"
              : "bg-gold text-emerald-950 hover:brightness-110"
          }`}
          aria-label={speaking ? "Parar narração" : `Ouvir: ${story.title}`}
        >
          {speaking && (
            <span
              className="absolute inset-y-0 left-0 bg-emerald-900/20"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          )}
          <span className="relative flex items-center gap-2">
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-900/40 border-t-emerald-950" />
            ) : speaking ? (
              <Square className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
            {speaking ? <T>Ouvindo… toque para parar</T> : loading ? <T>Preparando…</T> : <T>Clique para ouvir</T>}
          </span>
        </button>
      </div>

      <h3 className="mt-4 font-serif text-2xl text-amber-50 md:text-3xl">
        {index + 1}. <T>{story.title}</T>
      </h3>

      <div className="mt-4 space-y-4 leading-relaxed text-amber-100/90">
        {story.blocks.map((b, i) =>
          b.quote ? (
            <blockquote
              key={i}
              className="rounded-2xl border-l-4 border-gold bg-black/30 p-5 font-serif italic text-amber-50"
            >
              {b.author && (
                <p className="mb-2 not-italic font-sans text-sm font-semibold text-gold">
                  <T>{b.author}</T>
                </p>
              )}
              <T>“{b.text}”</T>
            </blockquote>
          ) : (
            <div key={i}>
              {b.author && (
                <p className="mb-1 text-sm font-semibold text-gold"><T>{b.author}:</T></p>
              )}
              <p><T>{b.text}</T></p>
            </div>
          ),
        )}
      </div>
    </article>
  );
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
  const { speaking, loading, toggle, prefetch } = useNarration(text);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-gold/30 shadow-2xl shadow-black/50">
      <button
        type="button"
        onClick={toggle}
        onPointerEnter={prefetch}
        onTouchStart={prefetch}
        onFocus={prefetch}
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
        {speaking && (
          <div className="pointer-events-none absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm">
            <Square className="h-3.5 w-3.5" />
          </div>
        )}
        {loading && (
          <div className="pointer-events-none absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm">
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          </div>
        )}

      </button>
    </div>
  );
}
function NarratableVideo({
  src,
  poster,
  alt,
  text,
  captionBelow,
}: {
  src: string;
  poster: string;
  alt: string;
  text: string;
  captionBelow?: boolean;
}) {
  const { speaking, loading, toggle, prefetch } = useNarration(text);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [videoReady, setVideoReady] = useState(false);


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
    const onReady = () => setVideoReady(true);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("error", onError);
    video.addEventListener("loadeddata", onReady);
    video.addEventListener("canplay", onReady);
    observer.observe(video);

    return () => {
      observer.disconnect();
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("error", onError);
      video.removeEventListener("loadeddata", onReady);
      video.removeEventListener("canplay", onReady);
    };
  }, [videoFailed]);

  const handleClick = () => {
    toggle();
  };

  if (videoFailed) {
    return <NarratablePhoto src={poster} alt={alt} text={text} />;
  }

  const mediaStack = (
    <div
      className="relative aspect-[4/3] w-full overflow-hidden rounded-none border-y border-gold/30 bg-cover bg-center shadow-2xl shadow-black/50 sm:aspect-video sm:rounded-3xl sm:border"
      style={{ backgroundImage: `url(${poster})`, backgroundColor: "#1a0f0a" }}
    >
      <img
        src={poster}
        alt={alt}
        loading="lazy"
        aria-hidden
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${videoReady ? "opacity-0" : "opacity-100"}`}
      />
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        muted
        playsInline
        loop
        preload="metadata"
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${videoReady ? "opacity-100" : "opacity-0"}`}
        aria-label={alt}
        onError={() => setVideoFailed(true)}
      />
      {(speaking || loading) && (
        <div className="pointer-events-none absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm">
          {loading ? (
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          ) : (
            <Square className="h-3.5 w-3.5" />
          )}
        </div>
      )}
    </div>
  );

  if (captionBelow) {
    return (
      <div className="-mx-5 flex flex-col gap-3 sm:mx-0 lg:mx-[calc(50%-45vw)] lg:w-[90vw] xl:mx-[calc(50%-44vw)] xl:w-[88vw]">
        <button
          type="button"
          onClick={handleClick}
          onPointerEnter={prefetch}
          onTouchStart={prefetch}
          onFocus={prefetch}
          disabled={loading}
          aria-label={speaking ? "Parar narração" : "Tocar história em áudio"}
          className="block w-full rounded-none focus:outline-none focus-visible:ring-4 focus-visible:ring-gold/60 sm:rounded-3xl"
        >
          {mediaStack}
        </button>
      </div>
    );
  }


  return (
    <div className="relative">
      {mediaStack}
      <button
        type="button"
        onClick={handleClick}
        onPointerEnter={prefetch}
        onTouchStart={prefetch}
        onFocus={prefetch}
        disabled={loading}
        className="absolute inset-0 rounded-3xl focus:outline-none focus-visible:ring-4 focus-visible:ring-gold/60"
        aria-label={speaking ? "Parar narração" : "Tocar história em áudio"}
      />
    </div>
  );
}




function HistoriasPage() {
  const backTo = useLastArea();
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
      <header className="relative overflow-visible">
        <div className="absolute inset-0">
          <img
            loading="lazy"
            decoding="async"
            src={danca}
            alt="Dança ritual Pataxó na floresta"
            width={1920}
            height={1080}
            className="h-full w-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.16_0.04_145/0.5)] via-[oklch(0.16_0.04_145/0.75)] to-[oklch(0.16_0.04_145)]" />
        </div>

        <SiteHeader showBackButton />
        <div className="relative mx-auto max-w-5xl px-5 pt-8 pb-20 md:pt-12 md:pb-28">
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

          <div className="flex flex-col gap-8">
            <NarratableVideo
              src={videoJosa.url}
              poster={albumJosa.url}
              alt="Vídeo do Ancião Josa Pataxó segurando maracá tradicional em frente à oca da aldeia"
              text={`Ancião Josa, a história de quem nunca desistiu de sua aldeia. Desde jovem, ele aprendeu com os antepassados que a terra não é apenas chão onde se pisa: é a mãe que alimenta, que guarda os mortos e que ensina os vivos. Por toda a sua vida, esteve na linha de frente da luta: defendeu o território contra invasões, denunciou danos às matas e aos rios, e lutou para que a língua Patxôhã, as pinturas, as cantigas e os saberes não desaparecessem com o tempo. Muitas vezes enfrentou dificuldades, mas nunca recuou, pois sabia que lutava não só por si, mas por todos os que vieram antes e por todos os que viriam depois. Hoje, como guardião da memória, ele é a referência da comunidade. Reúne os jovens para contar as histórias da origem do povo, ensina os costumes que vieram das gerações passadas, e reforça sempre: nossa tradição não é coisa do passado. É o que mantém viva a nossa identidade, a nossa ligação com a natureza e o nosso direito de estar aqui, na terra que é nossa. Tradição: os costumes, cantos, pinturas e a língua Patxôhã são tesouros que passam de geração em geração. Luta: defender o território, a floresta e os rios é defender a vida e o futuro do nosso povo. Sabedoria: os mais velhos são os livros vivos que guardam as histórias e os ensinamentos. Resistência: enquanto houver quem guarde e lute por esses saberes, nossa aldeia continuará existindo, forte e viva. Aldeia Velha, Povo Pataxó, nossa terra, nossa vida.`}
              captionBelow
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


          <div className="flex flex-col gap-8">
            <NarratableVideo
              src={videoJoao.url}
              poster={albumAnciao.url}
              alt="Vídeo do Ancião Pataxó sorrindo com maracá e pintura corporal ancestral"
              text={`Sou ancião João. A história de quem nunca desistiu de sua aldeia. Sou ancião do povo Pataxó. Vi minha aldeia mudar, enfrentei muitas lutas, mas nunca baixei a cabeça. Lutei por nossa terra, nossa língua, nossa cultura e por cada criança que sonha com um futuro melhor. Tradição, resistência e sabedoria. Ser ancião é mais que ter cabelos brancos: é guardar as histórias, é ensinar com o exemplo, é plantar hoje para que nossa aldeia floresça amanhã. Lutar pela aldeia é lutar pela vida. Não é fácil. Enfrentamos a invasão, o preconceito, o esquecimento. Mas seguimos firmes, porque nossa força vem de nossos antepassados e do amor que temos por nossa gente. Enquanto houver respeito e união, nosso povo seguirá forte. Essa é a nossa cultura, essa é a nossa vida. Ele foi ancião do povo Pataxó. Viu a aldeia mudar, enfrentou muitas lutas, mas nunca baixou a cabeça. Lutou pela terra, pela língua, pela cultura, e por cada criança que sonha com um futuro melhor. Ser ancião, dizia ele, é mais que ter cabelos brancos: é guardar as histórias, ensinar com o exemplo, e plantar hoje para que a aldeia floresça amanhã. Seu maracá silenciou, mas seu canto segue vivo em cada roda de Awê.`}
              captionBelow
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

          <AldeiaFilterAndAlbum items={translatedAlbum} />

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

function AldeiaFilterAndAlbum({ items }: { items: typeof album }) {
  const [aldeia, setAldeia] = useState<Aldeia>("Todas");
  const filtered = aldeia === "Todas" ? items : items.filter((i) => i.aldeia === aldeia);
  return (
    <>
      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {ALDEIAS.map((a) => (
          <button
            key={a}
            onClick={() => setAldeia(a)}
            className={`rounded-full border px-3 py-1.5 text-xs transition ${
              aldeia === a
                ? "border-gold bg-gold text-emerald-950"
                : "border-gold/30 text-amber-100 hover:bg-white/5"
            }`}
          >
            <MapPin className="mr-1 inline h-3 w-3" /> <T>{a}</T>
          </button>
        ))}
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => (
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
              <div className="mb-1 inline-flex items-center gap-1 text-xs text-gold/80">
                <MapPin className="h-3 w-3" /> {item.aldeia}
              </div>
              <h3 className="font-serif text-lg text-gold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-100/85">{item.text}</p>
            </figcaption>
          </figure>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full text-center text-sm text-amber-100/70">
            <T>Nenhuma foto desta aldeia ainda.</T>
          </p>
        )}
      </div>
    </>
  );
}


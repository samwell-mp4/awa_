import { narratePublic } from "@/lib/narrate-public.functions";
import { base64ToBlobUrl } from "@/lib/audio-play";

/**
 * Registro central dos pontos de áudio interativos.
 *
 * A narração lê o TEXTO COMPLETO da seção exibida na tela (extraído do DOM
 * no momento do clique), garantindo que nenhuma palavra fique de fora.
 * O `text` abaixo serve apenas como reserva caso a seção não seja encontrada.
 */
export type HotspotId =
  | "memoria"
  | "relatos"
  | "retomada"
  | "territorio"
  | "educacao"
  | "patxoha"
  | "cultura"
  | "saude"
  | "projetos"
  | "galeria"
  | "documentarios"
  | "referencias";

type Hotspot = { label: string; text: string; url?: string };

export const AUDIO_HOTSPOTS: Record<HotspotId, Hotspot> = {
  memoria: {
    label: "Ouvir sobre a memória ancestral",
    text: "A nossa presença aqui é ancestral. Muito antes de qualquer papel, qualquer documento, o povo Pataxó já vivia neste solo sagrado. Este relatório nasceu de uma intimação para nos tirar da nossa própria comunidade. Então a gente reuniu tudo: o relatório de identificação da terra indígena, as pesquisas dos nossos moradores e, acima de tudo, a vivência dos parentes neste território.",
  },
  relatos: {
    label: "Ouvir os relatos dos anciãos",
    text: "Escute a voz dos nossos anciãos e anciãs. Foram eles que nasceram aqui, foram expulsos daqui, e voltaram. Cada relato é uma memória de luta, guardada na oralidade e passada de geração em geração. É assim que a nossa história continua viva.",
  },
  retomada: {
    label: "Ouvir sobre a retomada",
    text: "A retomada não aconteceu de um dia para o outro. Foram muitos anos: as famílias fugidas do massacre de Barra Velha, as expulsões, as primeiras investidas, até a retomada definitiva em mil novecentos e noventa e oito. Depois vieram os marcos, um por um, até a demarcação da nossa terra indígena.",
  },
  territorio: {
    label: "Ouvir sobre o território",
    text: "O nosso território fica em Arraial d'Ajuda, em Porto Seguro, na Bahia. Aqui é Mata Atlântica, tem sítios arqueológicos, tem o sambaqui, tem o manguezal do rio Buranhém. É onde estão as nossas moradias, a nossa água, a nossa vida comunitária. Cuidar deste lugar é cuidar de quem a gente é.",
  },
  educacao: {
    label: "Ouvir sobre a educação",
    text: "A nossa escola começou debaixo de uma cabana, o kigeme, em mil novecentos e noventa e oito. Hoje é a Escola Indígena Pataxó Aldeia Velha, com doze salas e mais de duzentos estudantes. Aqui a criança aprende a ler e escrever, e aprende também quem ela é: a língua, o canto, o respeito com os mais velhos.",
  },
  patxoha: {
    label: "Ouvir sobre a língua Patxôhã",
    text: "O Patxôhã é a nossa língua materna, é a nossa identidade. Ensinar Patxôhã não é só ensinar gramática, é ensinar um jeito de ver o mundo. Em dois mil e vinte e três, a nossa língua foi cooficializada em Porto Seguro. Foi uma vitória de todo o povo.",
  },
  cultura: {
    label: "Ouvir sobre o Grupo de Cultura",
    text: "O Grupo de Cultura da Aldeia nasceu ali, no começo da retomada, com os anciãos, as anciãs e as crianças juntos. O canto, a dança, o etnoturismo na reserva, os intercâmbios com os parentes de Barra Velha e da Jaqueira. Como diz o Romã: uma aldeia sem cultura, sem um grupo que mantenha a tradição viva, acaba virando só um bairro.",
  },
  saude: {
    label: "Ouvir sobre saberes e saúde",
    text: "Aqui duas medicinas caminham juntas. Tem a nossa Pajé Jaçanã, com os benzimentos, as ervas do quintal, as garrafadas, mais de mil partos feitos com as próprias mãos. E tem o serviço da unidade de saúde indígena, com pré-natal, vacinação e acompanhamento das famílias. Uma não substitui a outra, as duas se respeitam.",
  },
  projetos: {
    label: "Ouvir sobre os projetos sociais",
    text: "Ao longo dos anos a comunidade se organizou em associações para buscar projetos que ajudassem a aldeia. Projetos sociais, culturais e ambientais. Cada conquista aqui veio de muita reunião, muita insistência e muito trabalho coletivo.",
  },
  galeria: {
    label: "Ouvir sobre a galeria",
    text: "Estas fotos foram registradas pela própria comunidade. Elas fazem parte do relatório Somos Todos Aldeia Velha. Olhe com calma: em cada imagem tem gente, tem festa, tem luta, tem memória.",
  },
  documentarios: {
    label: "Ouvir sobre os documentários",
    text: "Nestes vídeos você escuta os moradores e os parceiros contando, com as próprias palavras, a luta pelo nosso território tradicional. Vale sentar e assistir com atenção.",
  },
  referencias: {
    label: "Ouvir sobre as fontes",
    text: "Tudo o que está aqui tem fonte. São referências bibliográficas, documentos, pesquisas dos nossos próprios moradores e os relatos sistematizados da comunidade.",
  },
};

export function hotspotAudio(id: HotspotId) {
  return AUDIO_HOTSPOTS[id];
}

/* ------------------------- Player único (um por vez) ------------------------- */

type Listener = () => void;
type State = { id: string | null; loading: boolean };

let audioEl: HTMLAudioElement | null = null;
let state: State = { id: null, loading: false };
const listeners = new Set<Listener>();
const generated = new Map<string, string>();
let playToken = 0;

function emit() {
  listeners.forEach((l) => l());
}

function setState(next: State) {
  state = next;
  emit();
}

export function subscribeHotspotAudio(l: Listener) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function getHotspotState(): State {
  return state;
}

export function stopHotspotAudio() {
  playToken += 1; // invalida qualquer sequência de geração em curso
  if (audioEl) {
    try {
      audioEl.pause();
    } catch {
      /* ignore */
    }
  }
  if (state.id !== null || state.loading) setState({ id: null, loading: false });
}

function ensureAudio() {
  if (!audioEl) {
    audioEl = new Audio();
    audioEl.preload = "auto";
  }
  return audioEl;
}

/* --------------------- Texto completo da seção (DOM) --------------------- */

/**
 * Lê todo o texto visível da seção correspondente ao ponto de áudio,
 * removendo os rótulos dos próprios botões de áudio ("Ouvir", "Tocando"...)
 * para que a narração não leia a interface.
 */
function fullSectionText(id: HotspotId): string {
  if (typeof document === "undefined") return AUDIO_HOTSPOTS[id].text;
  const section = document.getElementById(id);
  if (!section) return AUDIO_HOTSPOTS[id].text;
  const clone = section.cloneNode(true) as HTMLElement;
  clone.querySelectorAll("button, nav, iframe, script, style").forEach((el) => el.remove());
  const text = (clone.textContent ?? "").replace(/\s+/g, " ").trim();
  return text.length > 40 ? text : AUDIO_HOTSPOTS[id].text;
}

/** Divide o texto em pedaços pequenos (limite seguro do serviço de voz),
 *  preferindo cortar no fim das frases. */
function chunkText(text: string, max = 1200): string[] {
  const sentences = text.match(/[^.!?…]+[.!?…]*\s*/g) ?? [text];
  const chunks: string[] = [];
  let current = "";
  const flush = () => {
    if (current.trim()) chunks.push(current.trim());
    current = "";
  };
  for (const s of sentences) {
    if (s.length > max) {
      flush();
      for (let i = 0; i < s.length; i += max) chunks.push(s.slice(i, i + max).trim());
      continue;
    }
    if (current && current.length + s.length > max) flush();
    current += s;
  }
  flush();
  return chunks.filter(Boolean);
}

/* --------------------------- Geração com cache --------------------------- */

async function narrateChunk(text: string, lang: string): Promise<string | null> {
  const key = `${lang}::${text}`;
  const cached = generated.get(key);
  if (cached) return cached;
  try {
    const res = await narratePublic({
      data: { text, lang, voice: "onyx", mode: "story" },
    });
    if (!res?.audio_base64) return null;
    const url = base64ToBlobUrl(res.audio_base64, res.mime || "audio/mpeg");
    generated.set(key, url);
    return url;
  } catch {
    return null;
  }
}

/**
 * Toca (ou pausa) a narração COMPLETA do ponto. O áudio começa assim que o
 * primeiro trecho é gerado e os demais trechos entram em sequência, sem
 * perder nenhuma palavra do texto exibido. Só um áudio toca por vez.
 */
export async function toggleHotspotAudio(id: HotspotId, lang = "pt") {
  if (typeof window === "undefined") return;
  if (state.id === id) {
    stopHotspotAudio();
    return;
  }
  stopHotspotAudio();
  const token = playToken;
  const el = ensureAudio();
  setState({ id, loading: true });

  const entry = AUDIO_HOTSPOTS[id];
  if (entry.url) {
    el.src = entry.url;
    el.currentTime = 0;
    setState({ id, loading: false });
    try {
      await el.play();
    } catch {
      stopHotspotAudio();
    }
    return;
  }

  const chunks = chunkText(fullSectionText(id));
  if (!chunks.length) {
    stopHotspotAudio();
    return;
  }

  for (let i = 0; i < chunks.length; i++) {
    const url = await narrateChunk(chunks[i], lang);
    if (token !== playToken) return; // usuário trocou de ponto ou parou
    if (!url) continue; // trecho falhou: segue para o próximo sem perder o resto
    if (i === 0) setState({ id, loading: false });
    // Espera o trecho anterior terminar antes de tocar este.
    await new Promise<void>((resolve) => {
      const onEnded = () => {
        cleanup();
        resolve();
      };
      const onError = () => {
        cleanup();
        resolve();
      };
      const cleanup = () => {
        el.removeEventListener("ended", onEnded);
        el.removeEventListener("error", onError);
      };
      el.addEventListener("ended", onEnded);
      el.addEventListener("error", onError);
      el.src = url;
      el.currentTime = 0;
      el.play().catch(() => {
        cleanup();
        resolve();
      });
      // Se outro ponto assumir durante este trecho, encerra a espera.
      const guard = setInterval(() => {
        if (token !== playToken) {
          clearInterval(guard);
          cleanup();
          resolve();
        }
      }, 200);
      const origResolve = resolve;
      void origResolve;
      el.addEventListener(
        "ended",
        () => clearInterval(guard),
        { once: true },
      );
    });
    if (token !== playToken) return;
  }

  if (token === playToken && state.id === id) stopHotspotAudio();
}

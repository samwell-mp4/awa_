/**
 * Registro central dos pontos de áudio interativos.
 *
 * Para adicionar um áudio, basta preencher a URL do ponto correspondente
 * (arquivo em src/assets via lovable-assets, /public ou URL externa).
 * Pontos sem URL ficam ocultos automaticamente,
 * então a interface nunca mostra um ponto que não toca nada.
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

export const AUDIO_HOTSPOTS: Record<HotspotId, { label: string; url?: string }> = {
  memoria: { label: "Ouvir sobre a memória ancestral" },
  relatos: { label: "Ouvir os relatos dos anciãos" },
  retomada: { label: "Ouvir sobre a retomada" },
  territorio: { label: "Ouvir sobre o território" },
  educacao: { label: "Ouvir sobre a educação" },
  patxoha: { label: "Ouvir sobre a língua Patxôhã" },
  cultura: { label: "Ouvir sobre o Grupo de Cultura" },
  saude: { label: "Ouvir sobre saberes e saúde" },
  projetos: { label: "Ouvir sobre os projetos sociais" },
  galeria: { label: "Ouvir sobre a galeria" },
  documentarios: { label: "Ouvir sobre os documentários" },
  referencias: { label: "Ouvir sobre as fontes" },
};

export function hotspotAudio(id: HotspotId) {
  return AUDIO_HOTSPOTS[id];
}

/* ------------------------- Player único (um por vez) ------------------------- */

type Listener = () => void;

let audioEl: HTMLAudioElement | null = null;
let activeId: string | null = null;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((l) => l());
}

export function subscribeHotspotAudio(l: Listener) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function getPlayingHotspot() {
  return activeId;
}

export function stopHotspotAudio() {
  if (audioEl) {
    try {
      audioEl.pause();
    } catch {
      /* ignore */
    }
  }
  if (activeId !== null) {
    activeId = null;
    emit();
  }
}

/** Toca o áudio do ponto; se outro estiver tocando, ele é interrompido. */
export async function toggleHotspotAudio(id: string, url: string) {
  if (typeof window === "undefined") return;
  if (activeId === id) {
    stopHotspotAudio();
    return;
  }
  if (!audioEl) {
    audioEl = new Audio();
    audioEl.preload = "none";
    audioEl.addEventListener("ended", stopHotspotAudio);
    audioEl.addEventListener("error", stopHotspotAudio);
  }
  try {
    audioEl.pause();
  } catch {
    /* ignore */
  }
  if (audioEl.src !== url) audioEl.src = url;
  audioEl.currentTime = 0;
  activeId = id;
  emit();
  try {
    await audioEl.play();
  } catch {
    stopHotspotAudio();
  }
}

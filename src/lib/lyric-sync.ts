/**
 * Sincronização de legendas do player infantil.
 * Lógica pura para garantir alinhamento entre áudio e texto em diferentes formatos.
 */

import { SONGS_TIMELINE_DATA } from "@/data/songs-timeline-data";

/** Quebra a letra em versos, ignorando linhas vazias. */
export function splitLyrics(value: string | null | undefined): string[] {
  return (value ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

/**
 * Tempo final (em segundos) de cada verso, proporcional ao tamanho do verso.
 * Versos longos duram mais que versos curtos.
 */
export function computeLyricBounds(
  indLines: string[],
  ptLines: string[],
  duration: number,
  offsets?: number[] // Offsets manuais para ajuste fino (em segundos)
): number[] {
  if ((!indLines.length && !ptLines.length) || !Number.isFinite(duration) || duration <= 0) return [];
  
  const maxLines = Math.max(indLines.length, ptLines.length);
  const out: number[] = [];
  
  // Calcula pesos baseados no comprimento do texto
  const weights: number[] = [];
  for (let i = 0; i < maxLines; i++) {
    const indLen = (indLines[i] ?? "").length;
    const ptLen = (ptLines[i] ?? "").length;
    weights.push(Math.max(8, indLen, ptLen));
  }
  
  const total = weights.reduce((a, b) => a + b, 0);
  let acc = 0;
  for (let i = 0; i < weights.length; i++) {
    acc += weights[i];
    let time = (acc / total) * duration;
    
    // Aplica offset manual se existir
    if (offsets && offsets[i] !== undefined) {
      time += offsets[i];
    }
    
    out.push(time);
  }
  return out;
}

/** Antecipação para a legenda chegar junto com a voz. */
export const LYRIC_LEAD = 0.25;

/** Índice do verso que deve estar destacado no instante `time`. */
export function activeLineIndex(
  bounds: number[],
  time: number,
  lead = LYRIC_LEAD,
): number {
  if (!bounds.length) return -1;
  const t = time + lead;
  for (let i = 0; i < bounds.length; i++) if (t < bounds[i]) return i;
  return bounds.length - 1;
}

/**
 * Duração usada para sincronizar: prefere a duração real do áudio e cai para a
 * duração cadastrada da música, para as legendas já começarem sincronizadas
 * antes de o metadata do áudio carregar.
 */
export function resolveDuration(
  audioDuration: number | null | undefined,
  fallbackSeconds: number | null | undefined,
): number {
  if (audioDuration && Number.isFinite(audioDuration) && audioDuration > 0) {
    return audioDuration;
  }
  if (fallbackSeconds && fallbackSeconds > 0) return fallbackSeconds;
  return 0;
}

/**
 * Converte tempos de início marcados manualmente (em segundos) nos limites de
 * fim de cada verso. Lacunas são preenchidas por interpolação entre os tempos
 * conhecidos, então marcar apenas alguns versos já melhora a sincronia.
 */
export function boundsFromTimes(
  times: (number | string | null | undefined)[],
  lineCount: number,
  duration: number,
): number[] {
  if (lineCount <= 0) return [];
  const starts: number[] = new Array(lineCount).fill(NaN);
  for (let i = 0; i < lineCount; i++) {
    const raw = times[i];
    const v = typeof raw === "string" ? parseFloat(raw) : raw;
    if (typeof v === "number" && Number.isFinite(v) && v >= 0) starts[i] = v;
  }

  if (!starts.some((v) => Number.isFinite(v))) return [];

  // Primeiro verso sempre começa com um tempo conhecido.
  if (!Number.isFinite(starts[0])) starts[0] = 0;

  // Interpola lacunas internas e extrapola o final.
  let i = 0;
  while (i < lineCount) {
    if (Number.isFinite(starts[i])) {
      i++;
      continue;
    }
    let j = i;
    while (j < lineCount && !Number.isFinite(starts[j])) j++;
    const prev = starts[i - 1];
    if (j < lineCount) {
      const step = (starts[j] - prev) / (j - i + 1);
      for (let k = i; k < j; k++) starts[k] = prev + step * (k - i + 1);
    } else {
      const end = duration > prev ? duration : prev + (j - i + 1) * 3;
      const step = (end - prev) / (j - i + 1);
      for (let k = i; k < j; k++) starts[k] = prev + step * (k - i + 1);
    }
    i = j;
  }

  // Garante ordem crescente e transforma em limites de fim.
  for (let k = 1; k < lineCount; k++) {
    if (starts[k] <= starts[k - 1]) starts[k] = starts[k - 1] + 0.1;
  }
  const bounds: number[] = [];
  for (let k = 0; k < lineCount; k++) {
    const next = k + 1 < lineCount ? starts[k + 1] : Math.max(duration, starts[k] + 2);
    bounds.push(next);
  }
  return bounds;
}

/**
 * Limites de verso para um conteúdo: usa os tempos marcados no painel quando
 * existirem e, na falta deles, estima pelo tamanho dos versos.
 */
export function resolveLyricBounds({
  indLines,
  ptLines = [],
  duration,
  times,
  offsets,
}: {
  indLines: string[];
  ptLines?: string[];
  duration: number;
  times?: (number | string | null | undefined)[] | null;
  offsets?: number[] | null;
}): number[] {
  const lineCount = Math.max(indLines.length, ptLines.length);
  if (times && times.length) {
    const manual = boundsFromTimes(times, lineCount, duration);
    if (manual.length) return manual;
  }
  return computeLyricBounds(indLines, ptLines, duration, offsets ?? []);
}

/**
 * Intervalo de exibição de um verso na linha do tempo (Início e Fim em segundos).
 * Ex: { start: 2.0, end: 5.0, text: "Unir unir" }
 */
export interface LyricSyncRange {
  start: number; // Início em segundos
  end: number;   // Fim em segundos
  text?: string;
  translation?: string;
}

/**
 * Retorna o índice do verso ativo com base nos intervalos [start, end].
 * Retorna -1 se estiver na introdução antes do início do primeiro verso.
 */
export function activeLineFromRanges(
  ranges: LyricSyncRange[] | null | undefined,
  time: number,
  lead = LYRIC_LEAD,
): number {
  if (!ranges || !ranges.length) return -1;
  const t = time + lead;

  // Antes do primeiro verso começar (introdução do áudio)
  if (t < ranges[0].start) {
    return -1;
  }

  // Verifica se o tempo está exatamente dentro de algum intervalo
  for (let i = 0; i < ranges.length; i++) {
    const r = ranges[i];
    if (t >= r.start && t < r.end) {
      return i;
    }
  }

  // Se estiver em uma pausa entre versos:
  for (let i = 0; i < ranges.length - 1; i++) {
    if (t >= ranges[i].end && t < ranges[i + 1].start) {
      // Se a pausa for curta (<= 1.5s), mantém o verso recém-terminado
      if (ranges[i + 1].start - ranges[i].end <= 1.5) {
        return i;
      }
      return -1;
    }
  }

  // Se já passou do último verso, mantém ativo por até 1s a mais
  const last = ranges[ranges.length - 1];
  if (t >= last.start && t <= last.end + 1.0) {
    return ranges.length - 1;
  }

  return -1;
}

/**
 * Recupera ou gera os ranges completos [start, end] de uma música.
 * Prioridades:
 * 1. LocalStorage (edições recentes do navegador)
 * 2. styleRanges (salvos no banco de dados na coluna style.sync_ranges)
 * 3. syncTimes (array de segundos de início salvo na coluna sync_times)
 * 4. Cálculo estimado proporcional por caracteres
 */
export function resolveLyricRanges({
  songId,
  songTitle,
  indLines = [],
  ptLines = [],
  duration,
  styleRanges,
  syncTimes,
  offsets,
}: {
  songId?: string;
  songTitle?: string;
  indLines?: string[];
  ptLines?: string[];
  duration: number;
  styleRanges?: LyricSyncRange[] | null;
  syncTimes?: (number | string | null | undefined)[] | null;
  offsets?: number[] | null;
}): LyricSyncRange[] {
  const lineCount = Math.max(indLines.length, ptLines.length);

  // Normalizador seguro para ranges salvos
  const normalizeRanges = (list: any[]): LyricSyncRange[] => {
    return list.map((r: any, i: number) => ({
      start: Number(Number(r.start ?? 0).toFixed(2)),
      end: Number(Number(r.end ?? (r.start ?? 0) + 3).toFixed(2)),
      text: r.text !== undefined && r.text !== null ? String(r.text) : (indLines[i] || ""),
      translation: r.translation !== undefined && r.translation !== null ? String(r.translation) : (ptLines[i] || ""),
    }));
  };

  // 1. LocalStorage (ajustes ao vivo feitos pelo usuário neste navegador)
  if (typeof window !== "undefined" && songId) {
    try {
      const stored = localStorage.getItem(`awa_song_sync_ranges_${songId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return normalizeRanges(parsed);
        }
      }
    } catch {}
  }

  // 2. Ranges salvos diretamente no código do projeto (src/data/songs-timeline-data.ts)
  const normalizedTitle = songTitle
    ? "title_" +
      songTitle
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "")
    : null;

  const codeEntry =
    (songId ? SONGS_TIMELINE_DATA[songId] : undefined) ||
    (normalizedTitle ? SONGS_TIMELINE_DATA[normalizedTitle] : undefined);

  if (codeEntry?.ranges && Array.isArray(codeEntry.ranges) && codeEntry.ranges.length > 0) {
    return normalizeRanges(codeEntry.ranges);
  }

  // 3. Ranges salvos no banco de dados (coluna style.sync_ranges)
  if (styleRanges && Array.isArray(styleRanges) && styleRanges.length > 0) {
    return normalizeRanges(styleRanges);
  }

  if (lineCount <= 0) return [];

  // 3. sync_times (marcas de início)
  if (syncTimes && syncTimes.length > 0) {
    const starts: number[] = [];
    for (let i = 0; i < lineCount; i++) {
      const raw = syncTimes[i];
      const v = typeof raw === "string" ? parseFloat(raw) : raw;
      starts.push(typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : -1);
    }

    if (starts.some((v) => v >= 0)) {
      if (starts[0] < 0) starts[0] = 0;
      for (let i = 0; i < lineCount; i++) {
        if (starts[i] < 0) {
          let nextValid = i + 1;
          while (nextValid < lineCount && starts[nextValid] < 0) nextValid++;
          const prev = starts[i - 1];
          const next = nextValid < lineCount ? starts[nextValid] : Math.max(duration, prev + 3 * (lineCount - i));
          const step = (next - prev) / (nextValid - i + 1);
          starts[i] = Number((prev + step).toFixed(2));
        }
      }

      const ranges: LyricSyncRange[] = [];
      for (let i = 0; i < lineCount; i++) {
        const start = Number(starts[i].toFixed(2));
        const nextStart = i + 1 < lineCount ? starts[i + 1] : Math.max(duration, start + 3);
        const end = Number((nextStart > start + 0.2 ? nextStart - 0.1 : nextStart).toFixed(2));
        ranges.push({
          start,
          end: Math.max(start + 0.5, end),
          text: indLines[i] || "",
          translation: ptLines[i] || "",
        });
      }
      return ranges;
    }
  }

  // 4. Fallback: computação proporcional por peso de caracteres
  const dur = duration > 0 ? duration : 60;
  const bounds = computeLyricBounds(indLines, ptLines, dur, offsets ?? []);
  const ranges: LyricSyncRange[] = [];
  let prevStart = 0;
  for (let i = 0; i < lineCount; i++) {
    const rawEnd = bounds[i] !== undefined ? bounds[i] : (dur / lineCount) * (i + 1);
    const end = Number(rawEnd.toFixed(2));
    const start = Number(prevStart.toFixed(2));
    ranges.push({
      start,
      end: Math.max(start + 0.5, end),
      text: indLines[i] || "",
      translation: ptLines[i] || "",
    });
    prevStart = end;
  }
  return ranges;
}

/**
 * Salva ranges no localStorage e notifica todos os players ativos.
 */
export function saveSongRangesLocally(songId: string, ranges: LyricSyncRange[]) {
  if (typeof window === "undefined" || !songId) return;
  try {
    localStorage.setItem(`awa_song_sync_ranges_${songId}`, JSON.stringify(ranges));
    window.dispatchEvent(
      new CustomEvent("awa:song-sync-updated", {
        detail: { songId, ranges },
      }),
    );
  } catch {}
}

/**
 * Limpa ranges do localStorage.
 */
export function clearSongRangesLocally(songId: string) {
  if (typeof window === "undefined" || !songId) return;
  try {
    localStorage.removeItem(`awa_song_sync_ranges_${songId}`);
    window.dispatchEvent(
      new CustomEvent("awa:song-sync-updated", {
        detail: { songId },
      }),
    );
  } catch {}
}

/**
 * Desloca todos os intervalos em `delta` segundos (ex: +0.5s ou -0.5s).
 */
export function shiftAllRanges(ranges: LyricSyncRange[], delta: number, maxDuration?: number): LyricSyncRange[] {
  return ranges.map((r) => {
    const newStart = Math.max(0, Number((r.start + delta).toFixed(2)));
    const duration = r.end - r.start;
    let newEnd = Number((newStart + duration).toFixed(2));
    if (maxDuration && newEnd > maxDuration) newEnd = maxDuration;
    return {
      ...r,
      start: newStart,
      end: Math.max(newStart + 0.2, newEnd),
    };
  });
}

/**
 * Auto-alinha os versos em cascata para não haver buracos involuntários:
 * O verso seguinte inicia exatamente onde o verso anterior termina.
 */
export function cascadeRanges(ranges: LyricSyncRange[], initialStart?: number): LyricSyncRange[] {
  if (!ranges.length) return [];
  const result: LyricSyncRange[] = [];
  let currentStart = initialStart !== undefined ? initialStart : ranges[0].start;

  for (let i = 0; i < ranges.length; i++) {
    const originalDur = Math.max(1, ranges[i].end - ranges[i].start);
    const end = Number((currentStart + originalDur).toFixed(2));
    result.push({
      ...ranges[i],
      start: Number(currentStart.toFixed(2)),
      end,
    });
    currentStart = end;
  }
  return result;
}

/**
 * Duplica todos os versos existentes em sequência para músicas que repetem a letra.
 * Os novos versos iniciam logo após o término do último verso atual.
 */
export function duplicateAllRanges(
  ranges: LyricSyncRange[],
  gapSeconds: number = 0.5,
  maxDuration?: number,
): LyricSyncRange[] {
  if (!ranges || ranges.length === 0) return [];
  const lastEnd = Math.max(0, ranges[ranges.length - 1].end);
  const firstStart = ranges[0].start;
  const offset = Number((lastEnd + gapSeconds - firstStart).toFixed(2));

  const duplicated: LyricSyncRange[] = ranges.map((r) => {
    const s = Number((r.start + offset).toFixed(2));
    const e = Number((r.end + offset).toFixed(2));
    return {
      start: s,
      end: maxDuration && e > maxDuration ? maxDuration : e,
      text: r.text,
      translation: r.translation,
    };
  });

  return [...ranges, ...duplicated];
}

/**
 * Duplica um verso específico no índice dado, inserindo-o logo após o verso original.
 */
export function duplicateSingleRange(
  ranges: LyricSyncRange[],
  index: number,
  maxDuration?: number,
): LyricSyncRange[] {
  if (!ranges || index < 0 || index >= ranges.length) return ranges;
  const target = ranges[index];
  const dur = Math.max(1.5, Number((target.end - target.start).toFixed(2)));
  const newStart = Number(target.end.toFixed(2));
  const newEnd = Number((newStart + dur).toFixed(2));

  const clone: LyricSyncRange = {
    start: newStart,
    end: maxDuration && newEnd > maxDuration ? maxDuration : newEnd,
    text: target.text,
    translation: target.translation,
  };

  const next = [...ranges];
  next.splice(index + 1, 0, clone);
  return next;
}




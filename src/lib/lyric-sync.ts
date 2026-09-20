/**
 * Sincronização de legendas do player infantil.
 * Lógica pura para garantir alinhamento entre áudio e texto em diferentes formatos.
 */

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


/**
 * Sincronização de legendas do player infantil.
 * Lógica pura (sem React) para poder ser verificada por testes automáticos —
 * garante que áudio e legendas nunca voltem a ficar dessincronizados.
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
): number[] {
  if ((!indLines.length && !ptLines.length) || !Number.isFinite(duration) || duration <= 0) return [];
  
  // Use a maior contagem de linhas para garantir que todas apareçam
  const maxLines = Math.max(indLines.length, ptLines.length);
  const out: number[] = [];
  
  // Calcula pesos baseados no comprimento do texto (preferindo a linha mais longa entre as duas)
  const weights: number[] = [];
  for (let i = 0; i < maxLines; i++) {
    const indLen = (indLines[i] ?? "").length;
    const ptLen = (ptLines[i] ?? "").length;
    weights.push(Math.max(8, indLen, ptLen));
  }
  
  const total = weights.reduce((a, b) => a + b, 0);
  let acc = 0;
  for (const w of weights) {
    acc += w;
    out.push((acc / total) * duration);
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

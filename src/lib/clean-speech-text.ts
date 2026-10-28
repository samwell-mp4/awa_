/**
 * Normaliza e sanitiza textos indígenas para síntese de voz (TTS e Web Speech API).
 * Remove anotações de dicionário como 'resp. - ' e corrige caracteres gregos/especiais.
 */
export function cleanTextForSpeech(raw: string): string {
  if (!raw || !raw.trim()) return "";
  let text = raw.trim();

  // 1. Remove abreviações de dicionário no início: "resp. - ", "res/p - ", "resp: ", "res/p. - "
  text = text.replace(/^(?:res\/?p\.?\s*[-:]?\s*)/i, "");

  // 2. Corrige iota grego com perispômeno (ῖ -> ĩ) que quebra alguns sintetizadores
  text = text.replace(/\u1fd6/g, "ĩ").replace(/\u1fd7/g, "Ĩ");

  // 3. Normaliza aspas e apóstrofos curvos para apóstrofo reto
  text = text.replace(/[‘’´`]/g, "'");

  // 4. Trata variantes entre parênteses como "ehä(ehé)" -> "ehä ou ehé"
  text = text.replace(/\s*\(([^)]+)\)/g, " ou $1");

  // 5. Trata barras de variantes como "tsägô/txägô" ou "p’ap’ai/ pâpây" -> "tsägô ou txägô"
  text = text.replace(/\s*\/\s*/g, " ou ");

  // 6. Normaliza espaços múltiplos
  text = text.replace(/\s+/g, " ").trim();

  return text;
}

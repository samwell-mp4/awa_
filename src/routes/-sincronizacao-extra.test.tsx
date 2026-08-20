import { describe, it, expect, vi } from "vitest";
import { 
  computeLyricBounds, 
  activeLineIndex 
} from "@/lib/lyric-sync";

describe("Verificação Extra de Sincronização (Multi-formato)", () => {
  it("mantém alinhamento proporcional mesmo com durações extremas", () => {
    const lines = ["Linha 1", "Linha 2", "Linha 3"];
    
    // Vídeo curto (10s)
    const boundsShort = computeLyricBounds(lines, [], 10);
    expect(boundsShort[boundsShort.length - 1]).toBeCloseTo(10, 5);
    
    // Vídeo longo (600s)
    const boundsLong = computeLyricBounds(lines, [], 600);
    expect(boundsLong[boundsLong.length - 1]).toBeCloseTo(600, 5);
  });

  it("garante que o índice ativo nunca é inválido durante a reprodução", () => {
    const lines = ["A", "B", "C"];
    const duration = 30;
    const bounds = computeLyricBounds(lines, [], duration);

    // Início
    expect(activeLineIndex(bounds, 0)).toBe(0);
    // Meio
    expect(activeLineIndex(bounds, 15)).toBeGreaterThanOrEqual(0);
    expect(activeLineIndex(bounds, 15)).toBeLessThan(3);
    // Fim exato
    expect(activeLineIndex(bounds, 30)).toBe(2);
    // Pós-fim (loop ou buffer)
    expect(activeLineIndex(bounds, 35)).toBe(2);
  });

  it("lida com letras vazias ou nulas sem quebrar a lógica de tempo", () => {
    const bounds = computeLyricBounds([], [], 100);
    expect(bounds).toEqual([]);
    expect(activeLineIndex(bounds, 50)).toBe(-1);
  });

  it("verifica se a antecipação (LYRIC_LEAD) não causa índice negativo no início", () => {
    const lines = ["Primeira"];
    const bounds = computeLyricBounds(lines, [], 10);
    // Mesmo com lead de 0.25s, no tempo 0 deve mostrar o primeiro verso
    expect(activeLineIndex(bounds, 0)).toBe(0);
  });
});

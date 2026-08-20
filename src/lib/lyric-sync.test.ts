import { describe, it, expect } from "vitest";
import {
  splitLyrics,
  computeLyricBounds,
  activeLineIndex,
  resolveDuration,
} from "./lyric-sync";

describe("lyric-sync (Sincronização de Legendas)", () => {
  describe("splitLyrics", () => {
    it("deve quebrar letras em versos e remover linhas vazias", () => {
      const input = "Linha 1\n  \nLinha 2\n\nLinha 3  ";
      expect(splitLyrics(input)).toEqual(["Linha 1", "Linha 2", "Linha 3"]);
    });

    it("deve lidar com valores nulos ou indefinidos", () => {
      expect(splitLyrics(null)).toEqual([]);
      expect(splitLyrics(undefined)).toEqual([]);
    });
  });

  describe("computeLyricBounds", () => {
    it("deve calcular limites de tempo proporcionais ao tamanho do verso", () => {
      const lines = ["Curta", "Esta linha é bem mais longa"];
      const duration = 10;
      const bounds = computeLyricBounds(lines, [], duration);

      expect(bounds.length).toBe(2);
      expect(bounds[1]).toBe(10); // O último limite deve ser a duração total
      expect(bounds[0]).toBeLessThan(5); // A primeira linha é muito menor, deve durar menos da metade
    });

    it("deve retornar vazio para duração inválida ou zero", () => {
      expect(computeLyricBounds(["A"], [], 0)).toEqual([]);
      expect(computeLyricBounds(["A"], [], -1)).toEqual([]);
    });
  });

  describe("activeLineIndex", () => {
    it("deve retornar o índice correto com base no tempo atual", () => {
      const bounds = [2, 5, 10]; // Linha 0: 0-2s, Linha 1: 2-5s, Linha 2: 5-10s
      
      // Com lead de 0.25 (padrão):
      // Aos 1.5s + 0.25 = 1.75s (Ainda Linha 0)
      expect(activeLineIndex(bounds, 1.5)).toBe(0);
      
      // Aos 1.8s + 0.25 = 2.05s (Passou para Linha 1)
      expect(activeLineIndex(bounds, 1.8)).toBe(1);
      
      // Aos 4.8s + 0.25 = 5.05s (Passou para Linha 2)
      expect(activeLineIndex(bounds, 4.8)).toBe(2);
      
      // Aos 9.9s (Última linha)
      expect(activeLineIndex(bounds, 9.9)).toBe(2);
    });

    it("deve retornar -1 se não houver limites", () => {
      expect(activeLineIndex([], 5)).toBe(-1);
    });
  });

  describe("resolveDuration", () => {
    it("deve preferir a duração real do áudio", () => {
      expect(resolveDuration(120, 100)).toBe(120);
    });

    it("deve usar o fallback se a duração real não estiver disponível", () => {
      expect(resolveDuration(0, 100)).toBe(100);
      expect(resolveDuration(null, 100)).toBe(100);
    });
  });
});

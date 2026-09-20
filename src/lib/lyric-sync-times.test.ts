import { describe, expect, it } from "vitest";
import { boundsFromTimes, resolveLyricBounds, activeLineIndex } from "./lyric-sync";

describe("boundsFromTimes", () => {
  it("usa os tempos marcados como troca de verso", () => {
    const bounds = boundsFromTimes([0, 5, 10], 3, 15);
    expect(bounds).toEqual([5, 10, 15]);
  });

  it("interpola versos sem marcação", () => {
    const bounds = boundsFromTimes([0, undefined, 10], 3, 15);
    expect(bounds[0]).toBeCloseTo(5, 5);
    expect(bounds[1]).toBeCloseTo(10, 5);
  });

  it("mantém ordem crescente mesmo com marcas invertidas", () => {
    const bounds = boundsFromTimes([5, 2, 9], 3, 12);
    expect(bounds[0]).toBeGreaterThan(0);
    expect(bounds[1]).toBeGreaterThan(bounds[0]);
  });

  it("sem marcação retorna vazio", () => {
    expect(boundsFromTimes([], 3, 10)).toEqual([]);
  });
});

describe("resolveLyricBounds", () => {
  const indLines = ["um", "dois", "tres"];

  it("prefere tempos marcados ao cálculo automático", () => {
    const bounds = resolveLyricBounds({ indLines, duration: 30, times: [0, 3, 20] });
    expect(bounds).toEqual([3, 20, 30]);
    expect(activeLineIndex(bounds, 10)).toBe(1);
  });

  it("cai para o cálculo automático sem tempos", () => {
    const bounds = resolveLyricBounds({ indLines, duration: 30 });
    expect(bounds.length).toBe(3);
    expect(bounds[2]).toBeCloseTo(30, 5);
  });
});

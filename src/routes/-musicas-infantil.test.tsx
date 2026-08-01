import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import {
  activeLineIndex,
  computeLyricBounds,
  resolveDuration,
  splitLyrics,
  LYRIC_LEAD,
} from "@/lib/lyric-sync";

// Router / assets / dados mockados para renderizar o player isolado
vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (opts: any) => opts,
  Link: ({ to, children, ...rest }: any) =>
    React.createElement("a", { href: to, ...rest }, children),
}));
vi.mock("@/lib/area-guard", () => ({ requireArea: vi.fn() }));
vi.mock("@/assets/musicas-infantil-bg.jpg.asset.json", () => ({
  default: { src: "/bg.jpg" },
}));
vi.mock("@/integrations/supabase/client", () => ({ supabase: {} }));
vi.mock("@tanstack/react-query", () => ({ useQuery: () => ({ data: [], isLoading: false }) }));
vi.mock("@/components/home/site-header", () => ({
  SiteHeader: ({ mode }: any) => React.createElement("header", { "data-mode": mode }),
}));
vi.mock("@/lib/pick-lang", () => ({
  useLang: () => "pt",
  pickLang: (row: any, field: string) => row[field],
}));

import { MiniPlayer } from "./musicas-infantil";

const song = {
  id: "s1",
  title: "Cantiga da Aldeia",
  artist: "Pataxó",
  audio_url: "https://cdn.test/cantiga.mp3",
  cover_url: null,
  language: "Patxôhã",
  lyrics_indigenous: "Awê txopai\nHãhãhãe kohã\nPataxó nixi",
  lyrics_pt: "Bom dia sol\nCanta comigo\nPovo Pataxó",
  lyrics_pt_en: null,
  lyrics_pt_es: null,
  duration_seconds: 30,
} as any;

describe("sincronização de legendas (lyric-sync)", () => {
  it("divide a letra ignorando linhas vazias", () => {
    expect(splitLyrics("a\n\n  b  \n")).toEqual(["a", "b"]);
    expect(splitLyrics(null)).toEqual([]);
  });

  it("gera um limite de tempo por verso, crescente e terminando na duração", () => {
    const bounds = computeLyricBounds(["curto", "um verso bem mais longo", "meio"], 30);
    expect(bounds).toHaveLength(3);
    expect(bounds[0]).toBeLessThan(bounds[1]);
    expect(bounds[1]).toBeLessThan(bounds[2]);
    expect(bounds[2]).toBeCloseTo(30, 5);
  });

  it("dá mais tempo para versos longos que para versos curtos", () => {
    const [b0, b1] = computeLyricBounds(["oi", "verso muito muito mais comprido"], 60);
    expect(b0).toBeLessThan(b1 - b0);
  });

  it("avança o verso ativo junto com o tempo do áudio (sem atraso)", () => {
    const bounds = computeLyricBounds(["aaa", "aaa", "aaa"], 30); // 10s por verso
    expect(activeLineIndex(bounds, 0)).toBe(0);
    expect(activeLineIndex(bounds, 9)).toBe(0);
    expect(activeLineIndex(bounds, 11)).toBe(1);
    expect(activeLineIndex(bounds, 25)).toBe(2);
    // nunca ultrapassa o último verso
    expect(activeLineIndex(bounds, 999)).toBe(bounds.length - 1);
  });

  it("antecipa a legenda em relação à voz (lead > 0)", () => {
    expect(LYRIC_LEAD).toBeGreaterThan(0);
    const bounds = computeLyricBounds(["aaa", "aaa"], 20); // troca em 10s
    expect(activeLineIndex(bounds, 10 - LYRIC_LEAD / 2)).toBe(1);
  });

  it("sem duração conhecida não destaca verso errado", () => {
    expect(computeLyricBounds(["a", "b"], 0)).toEqual([]);
    expect(activeLineIndex([], 5)).toBe(-1);
  });

  it("usa a duração cadastrada enquanto o áudio não carrega o metadata", () => {
    expect(resolveDuration(0, 30)).toBe(30);
    expect(resolveDuration(NaN, 30)).toBe(30);
    expect(resolveDuration(42, 30)).toBe(42);
    expect(resolveDuration(0, null)).toBe(0);
  });
});

describe("<MiniPlayer /> infantil — áudio + legendas sempre carregados", () => {
  it("carrega o áudio da música com controles e preload", () => {
    render(<MiniPlayer song={song} onClose={() => {}} />);
    const audio = document.querySelector<HTMLAudioElement>('[data-testid="kids-audio"]')!;
    expect(audio).toBeTruthy();
    expect(audio.getAttribute("src")).toBe(song.audio_url);
    expect(audio.hasAttribute("controls")).toBe(true);
    expect(audio.getAttribute("preload")).toBe("auto");
  });

  it("mostra as legendas em Patxôhã e na tradução, verso por verso", () => {
    render(<MiniPlayer song={song} onClose={() => {}} />);
    for (const line of splitLyrics(song.lyrics_indigenous)) {
      expect(screen.getByText(line)).toBeTruthy();
    }
    for (const line of splitLyrics(song.lyrics_pt)) {
      expect(screen.getByText(line)).toBeTruthy();
    }
  });

  it("mantém o layout infantil (não volta ao layout adulto)", () => {
    const src = require("node:fs").readFileSync("src/routes/musicas-infantil.tsx", "utf8");
    // menu infantil e tema infantil
    expect(src).toMatch(/SiteHeader\s+mode="infantil"/);
    expect(src).toMatch(/kids-theme/);
    // relógio por frame (e não só onTimeUpdate) para legendas sincronizadas
    expect(src).toContain("requestAnimationFrame");
    // usa os utilitários verificados de sincronização
    expect(src).toContain("computeLyricBounds");
    expect(src).toContain("activeLineIndex");
    // rola apenas o painel de legendas
    expect(src).toContain("box.scrollTo");
    expect(src).not.toContain("scrollIntoView");
  });
});

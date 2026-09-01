import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Regressão: toda página da área infantil precisa do cabeçalho/tema infantil,
 * seja direto (`SiteHeader mode="infantil"` + `kids-theme`) ou via a casca
 * compartilhada `KidsPage` (que aplica os dois).
 */
const KIDS_ROUTES = [
  "trilhas-infantil.tsx",
  "musicas-infantil.tsx",
  "historias-infantil.tsx",
  "jogos-infantil.tsx",
  "amizade.tsx",
];


const dir = join(process.cwd(), "src/routes");
const shell = readFileSync(
  join(process.cwd(), "src/components/kids/kids-page.tsx"),
  "utf8",
);

describe("menu infantil", () => {
  it("a casca KidsPage aplica cabeçalho e tema infantil", () => {
    expect(shell).toMatch(/<SiteHeader\s+mode="infantil"/);
    expect(shell).toContain("kids-theme");
  });

  it.each(KIDS_ROUTES)("%s usa o cabeçalho infantil", (file) => {
    const src = readFileSync(join(dir, file), "utf8");
    const direct = /<SiteHeader\s+mode="infantil"/.test(src);
    const viaShell = /KidsPage/.test(src);
    expect(direct || viaShell).toBe(true);
  });

  it("trilhas.$slug.tsx mostra o menu infantil quando vem da área infantil", () => {
    const src = readFileSync(join(dir, "trilhas.$slug.tsx"), "utf8");
    expect(src).toMatch(/isKids\s*\?\s*<SiteHeader\s+mode="infantil"/);
  });

  it("todas as páginas infantis usam o tema kids", () => {
    for (const file of KIDS_ROUTES) {
      const src = readFileSync(join(dir, file), "utf8");
      expect(src.includes("kids-theme") || src.includes("KidsPage"), file).toBe(true);
    }
  });
});

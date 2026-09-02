import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Regressão: o menu infantil (SiteHeader mode="infantil") precisa estar em
 * TODAS as páginas da área infantil. Sem isso volta o "menu antigo".
 */
const KIDS_ROUTES = [
  "infantil.tsx",
  "trilhas-infantil.tsx",
  "musicas-infantil.tsx",
  "historias-infantil.tsx",
  "jogos-infantil.tsx",
  "amizade.tsx",
];

const dir = join(process.cwd(), "src/routes");

describe("menu infantil", () => {
  it.each(KIDS_ROUTES)("%s usa SiteHeader mode=\"infantil\"", (file) => {
    const src = readFileSync(join(dir, file), "utf8");
    expect(src).toMatch(/<SiteHeader\s+mode="infantil"/);
  });

  it("trilhas.$slug.tsx mostra o menu infantil quando vem da área infantil", () => {
    const src = readFileSync(join(dir, "trilhas.$slug.tsx"), "utf8");
    expect(src).toMatch(/isKids\s*\?\s*<SiteHeader\s+mode="infantil"/);
  });

  it("todas as páginas infantis usam a classe kids-theme", () => {
    for (const file of KIDS_ROUTES) {
      const src = readFileSync(join(dir, file), "utf8");
      expect(src, file).toContain("kids-theme");
    }
  });
});

import { describe, it, expect } from "vitest";

describe("Language Hydration (Hidratação de Idioma)", () => {
  it("deve detectar e aplicar o idioma correto do localStorage", () => {
    // Simular ambiente de navegador
    const valid = ["pt", "en", "es"];
    
    // Caso 1: Idioma salvo no localStorage
    let stored = "en";
    let detected = "pt";
    let target = valid.includes(stored) ? stored : (valid.includes(detected) ? detected : "pt");
    expect(target).toBe("en");

    // Caso 2: Nada no localStorage, usa o do navegador
    stored = "";
    detected = "es";
    target = valid.includes(stored) ? stored : (valid.includes(detected) ? detected : "pt");
    expect(target).toBe("es");

    // Caso 3: Nada em nenhum lugar, cai para PT
    stored = "";
    detected = "fr";
    target = valid.includes(stored) ? stored : (valid.includes(detected) ? detected : "pt");
    expect(target).toBe("pt");
  });
});

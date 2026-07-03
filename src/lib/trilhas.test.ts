import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  TRAILS,
  FRASES_SABEDORIA,
  fraseDoDia,
  getLearned,
  setLearned,
  markCertificate,
  hasCertificate,
} from "./trilhas";

describe("TRAILS catalog", () => {
  it("expõe exatamente as 4 trilhas esperadas", () => {
    expect(Object.keys(TRAILS).sort()).toEqual(
      ["animais", "familia", "natureza", "saudacoes"].sort(),
    );
  });

  it("cada trilha tem campos obrigatórios preenchidos", () => {
    for (const t of Object.values(TRAILS)) {
      expect(t.slug).toBeTruthy();
      expect(t.name).toBeTruthy();
      expect(t.emoji).toBeTruthy();
      expect(t.intro.length).toBeGreaterThan(10);
      expect(t.categories.length).toBeGreaterThan(0);
      expect(t.certificate.title).toBeTruthy();
      expect(t.certificate.message).toContain("Professor Akuã");
    }
  });
});

describe("fraseDoDia", () => {
  afterEach(() => vi.useRealTimers());

  it("retorna uma frase da lista", () => {
    expect(FRASES_SABEDORIA).toContain(fraseDoDia());
  });

  it("é determinística para a mesma data", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-03T10:00:00Z"));
    const a = fraseDoDia();
    const b = fraseDoDia();
    expect(a).toBe(b);
  });

  it("muda entre dias diferentes (na maioria dos casos)", () => {
    vi.useFakeTimers();
    const seen = new Set<string>();
    for (let d = 1; d <= 20; d++) {
      vi.setSystemTime(new Date(2026, 5, d));
      seen.add(fraseDoDia());
    }
    expect(seen.size).toBeGreaterThan(1);
  });
});

describe("progresso aprendido (getLearned/setLearned)", () => {
  it("estado vazio retorna Set vazio", () => {
    expect(getLearned("saudacoes").size).toBe(0);
  });

  it("persiste e lê IDs aprendidos", () => {
    setLearned("saudacoes", new Set(["a", "b", "c"]));
    const learned = getLearned("saudacoes");
    expect(learned.size).toBe(3);
    expect(learned.has("a")).toBe(true);
    expect(learned.has("c")).toBe(true);
  });

  it("isola progresso por trilha", () => {
    setLearned("saudacoes", new Set(["x"]));
    setLearned("familia", new Set(["y", "z"]));
    expect(getLearned("saudacoes").size).toBe(1);
    expect(getLearned("familia").size).toBe(2);
    expect(getLearned("natureza").size).toBe(0);
  });

  it("recupera graciosamente de JSON corrompido no localStorage", () => {
    localStorage.setItem("awa_trilha_progress_saudacoes", "{not json");
    expect(getLearned("saudacoes").size).toBe(0);
  });

  it("sobrescreve o conjunto anterior", () => {
    setLearned("animais", new Set(["a", "b"]));
    setLearned("animais", new Set(["c"]));
    const l = getLearned("animais");
    expect(l.size).toBe(1);
    expect(l.has("c")).toBe(true);
    expect(l.has("a")).toBe(false);
  });
});

describe("certificados", () => {
  it("hasCertificate=false por padrão", () => {
    expect(hasCertificate("familia")).toBe(false);
  });

  it("marca e reconhece certificado", () => {
    markCertificate("familia");
    expect(hasCertificate("familia")).toBe(true);
  });

  it("certificado é por trilha", () => {
    markCertificate("natureza");
    expect(hasCertificate("natureza")).toBe(true);
    expect(hasCertificate("animais")).toBe(false);
  });
});

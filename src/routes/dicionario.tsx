import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";

import { useTranslation } from "react-i18next";
import {
  Search,
  ArrowLeft,
  BookOpen,
  ArrowDownAZ,
  ArrowUpAZ,
  ArrowLeftRight,
  Crown,
  Lock,
  Volume2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { PremiumGate } from "@/components/PremiumGate";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useSubscription } from "@/hooks/use-subscription";

import { playFast } from "@/lib/audio-play";
import { useLastArea } from "@/lib/last-area";

import ptPatData from "@/data/dic-pt-pat.json";
import patPtData from "@/data/dic-pat-pt.json";
import palavrasNumerosData from "@/data/dic-palavras-numeros.json";
import gramaticaData from "@/data/dic-gramatica.json";
import {
  ILUSTRADO_CATEGORIAS,
  categoriasDoVerbete,
  emojiDoVerbete,
} from "@/lib/dic-ilustrado";

export const Route = createFileRoute("/dicionario")({
  head: () => ({
    meta: [
      { title: "Dicionário Patxôhã 2015 — AWÃ TECH" },
      {
        name: "description",
        content:
          "Dicionário Patxôhã 2015 completo: Português → Patxôhã, Patxôhã → Português, palavras e números e gramática.",
      },
      { property: "og:title", content: "Dicionário Patxôhã 2015 — AWÃ TECH" },
      {
        property: "og:description",
        content:
          "Os dois dicionários da fonte Patxôhã 2015, com busca, filtro alfabético, palavras e números e regras gramaticais.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DictionaryRoute,
});

function DictionaryRoute() {
  const { t } = useTranslation();
  return (
    <PremiumGate title={t("dictionary.premiumTitle")} description={t("dictionary.premiumDescription")}>
      <ErrorBoundary area="dicionario" message="Não foi possível carregar o dicionário. Tente novamente.">
        <DictionaryPage />
      </ErrorBoundary>
    </PremiumGate>
  );
}

const FREE_LIMIT = 50;
const SOURCE_LABEL = "Fonte: Patxôhã 2015";

// -----------------------------------------------------------------------------
// TIPOS DA FONTE (PDF PATXÔHÃ 2015)
// -----------------------------------------------------------------------------
type PtPatRecord = {
  id: string;
  portugues: string;
  patxoha: string;
  pagina: number;
  fonte: string;
  raw?: string;
  categoria?: string;
};

type PatPtRecord = {
  id: string;
  patxoha: string;
  portugues: string;
  pagina: number;
  fonte: string;
  raw?: string;
  categoria?: string;
};

type PalavraNumero = {
  id: string;
  kind: "grupo" | "verbete";
  titulo?: string;
  patxoha?: string;
  portugues?: string;
  grupo?: string;
  pagina: number;
  fonte: string;
  categoria?: string;
};

type GramaticaLinha = {
  id: string;
  texto: string;
  pagina: number;
  fonte: string;
  idioma?: "regra" | "portugues" | "patxoha";
};

/** Verbete normalizado para exibição, sem alterar a grafia da fonte. */
type Verbete = {
  id: string;
  /** Palavra-guia (idioma de consulta). */
  head: string;
  /** Tradução/significado conforme a fonte. */
  gloss: string;
  /** Palavra em Patxôhã (usada para o áudio). */
  patxoha: string;
  pagina: number;
  raw?: string;
  _letter: string;
  _headNorm: string;
  _glossNorm: string;
  categoria: string;
};

type Section = "ilustrado" | "pt-pat" | "pat-pt" | "numeros" | "gramatica";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function stripAccents(s: string): string {
  return (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function normalize(s: string): string {
  return stripAccents(s).toLowerCase().trim();
}

function firstLetter(s: string): string {
  const c = stripAccents((s || "").trim().charAt(0)).toUpperCase();
  return /[A-Z]/.test(c) ? c : "#";
}

function toVerbete(
  id: string,
  head: string,
  gloss: string,
  patxoha: string,
  pagina: number,
  categoria: string,
  raw?: string,
): Verbete {
  return {
    id,
    head,
    gloss,
    patxoha,
    pagina,
    raw,
    _letter: firstLetter(head),
    _headNorm: normalize(head),
    _glossNorm: normalize(gloss),
    categoria,
  };
}

// Pré-computação estática: roda uma vez no carregamento do módulo.
/** Lista segura: nunca lança, mesmo com JSON inesperado ou registro incompleto. */
function safeList<T>(data: unknown): T[] {
  return Array.isArray(data) ? (data.filter(Boolean) as T[]) : [];
}

/** Texto seguro preservando exatamente a grafia da fonte (acentos, apóstrofos). */
function safeText(v: unknown): string {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}

function safePage(v: unknown): number {
  return typeof v === "number" && Number.isFinite(v) ? v : 0;
}

const PT_PAT: Verbete[] = safeList<PtPatRecord>(ptPatData)
  .map((r, i) =>
    toVerbete(
      safeText(r.id) || `pt-pat-${i}`,
      safeText(r.portugues),
      safeText(r.patxoha),
      safeText(r.patxoha),
      safePage(r.pagina),
      safeText(r.categoria) || "Geral",
      r.raw ? safeText(r.raw) : undefined,
    ),
  )
  .filter((e) => e.head !== "" || e.gloss !== "");

const PAT_PT: Verbete[] = safeList<PatPtRecord>(patPtData)
  .map((r, i) =>
    toVerbete(
      safeText(r.id) || `pat-pt-${i}`,
      safeText(r.patxoha),
      safeText(r.portugues),
      safeText(r.patxoha),
      safePage(r.pagina),
      safeText(r.categoria) || "Geral",
      r.raw ? safeText(r.raw) : undefined,
    ),
  )
  .filter((e) => e.head !== "" || e.gloss !== "");

const PALAVRAS_NUMEROS = safeList<PalavraNumero>(palavrasNumerosData);

// Palavras e números também entram nas duas direções de consulta (PT→PAT e PAT→PT),
// para que números (cardinais/ordinais) apareçam na busca dos dois dicionários.
const NUMEROS_VERBETES = PALAVRAS_NUMEROS.filter(
  (r) => r.kind !== "grupo" && safeText(r.patxoha).trim() !== "" && safeText(r.portugues).trim() !== "",
);

function pushUnique(list: Verbete[], extra: Verbete[]) {
  const seen = new Set(list.map((e) => `${e._headNorm}|${e._glossNorm}`));
  for (const e of extra) {
    const key = `${e._headNorm}|${e._glossNorm}`;
    if (seen.has(key)) continue;
    seen.add(key);
    list.push(e);
  }
}

pushUnique(
  PT_PAT,
  NUMEROS_VERBETES.map((r, i) =>
    toVerbete(
      `num-pt-${r.id || i}`,
      safeText(r.portugues),
      safeText(r.patxoha),
      safeText(r.patxoha),
      safePage(r.pagina),
      safeText(r.categoria) || "Números",
    ),
  ),
);

pushUnique(
  PAT_PT,
  NUMEROS_VERBETES.map((r, i) =>
    toVerbete(
      `num-pat-${r.id || i}`,
      safeText(r.patxoha),
      safeText(r.portugues),
      safeText(r.patxoha),
      safePage(r.pagina),
      safeText(r.categoria) || "Números",
    ),
  ),
);
const GRAMATICA = safeList<GramaticaLinha>(gramaticaData).filter((l) => safeText(l.texto).trim() !== "");

function letterCounts(list: Verbete[]): ReadonlyMap<string, number> {
  const m = new Map<string, number>();
  for (const e of list) m.set(e._letter, (m.get(e._letter) ?? 0) + 1);
  return m;
}

const PT_PAT_LETTERS = letterCounts(PT_PAT);
const PAT_PT_LETTERS = letterCounts(PAT_PT);

const CATEGORIES = ["Todas", "Família", "Alimentos", "Animais", "Natureza", "Corpo humano", "Verbos", "Números", "Geral"] as const;

// -----------------------------------------------------------------------------
// DICIONÁRIO ILUSTRADO: verbetes com ilustração e categorias clicáveis
// -----------------------------------------------------------------------------
type VerbeteIlustrado = Verbete & { catKeys: string[]; emoji: string };

const ILUSTRADO: VerbeteIlustrado[] = PT_PAT.map((e) => {
  const catKeys = categoriasDoVerbete(e.head, e.categoria);
  return { ...e, catKeys, emoji: emojiDoVerbete(e.head, catKeys) };
});

const ILUSTRADO_COUNTS = new Map<string, number>();
for (const e of ILUSTRADO) {
  for (const k of e.catKeys) ILUSTRADO_COUNTS.set(k, (ILUSTRADO_COUNTS.get(k) ?? 0) + 1);
}

const SECTIONS: { key: Section; label: string; hint: string }[] = [
  { key: "ilustrado", label: "🖼️ Dicionário Ilustrado", hint: "por categorias" },
  { key: "pt-pat", label: "🇧🇷 Português → Patxôhã", hint: `${PT_PAT.length} verbetes` },
  { key: "pat-pt", label: "🌿 Patxôhã → Português", hint: `${PAT_PT.length} verbetes` },
  { key: "numeros", label: "🔢 Palavras e Números", hint: "seção da fonte" },
  { key: "gramatica", label: "📚 Gramática Patxôhã", hint: "regras da língua" },
];

function DictionaryPage() {
  const backTo = useLastArea();
  const { t } = useTranslation();
  const { isPremium } = useSubscription();

  const [section, setSection] = useState<Section>("ilustrado");
  const [ilCat, setIlCat] = useState<string>("numeros");
  const [ilVisible, setIlVisible] = useState(60);
  const [query, setQuery] = useState("");
  const [letter, setLetter] = useState<string>("Todas");
  const [sort, setSort] = useState<"az" | "za">("az");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("Todas");
  const [visibleCount, setVisibleCount] = useState(120);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedQuery(query.trim()), 200);
    return () => window.clearTimeout(id);
  }, [query]);

  const isWordList = section === "pt-pat" || section === "pat-pt";
  const source = section === "pt-pat" ? PT_PAT : PAT_PT;
  const letters = section === "pt-pat" ? PT_PAT_LETTERS : PAT_PT_LETTERS;

  useEffect(() => {
    setLetter("Todas");
    setVisibleCount(120);
    setQuery("");
    setCategory("Todas");
  }, [section]);

  useEffect(() => {
    setVisibleCount(120);
  }, [debouncedQuery, letter, sort]);

  // Busca: prioriza o campo do idioma de consulta, sem misturar dicionários.
  const filtered = useMemo<Verbete[]>(() => {
    if (!isWordList) return [];
    const q = normalize(debouncedQuery);
    const list = source.filter((e) => {
      const matchQ = !q || e._headNorm.includes(q) || e._glossNorm.includes(q);
      const matchL = letter === "Todas" || e._letter === letter;
      const matchCategory = category === "Todas" || e.categoria === category;
      return matchQ && matchL && matchCategory;
    });
    list.sort((a, b) => {
      if (q) {
        const aExact = a._headNorm === q ? 0 : a._headNorm.startsWith(q) ? 1 : 2;
        const bExact = b._headNorm === q ? 0 : b._headNorm.startsWith(q) ? 1 : 2;
        if (aExact !== bExact) return aExact - bExact;
      }
      const cmp = a.head.localeCompare(b.head, "pt", { sensitivity: "base" });
      return sort === "az" ? cmp : -cmp;
    });
    return list;
  }, [isWordList, source, debouncedQuery, letter, sort, category]);

  function invertDirection() {
    setSection((current) => (current === "pt-pat" ? "pat-pt" : "pt-pat"));
  }

  const cap = isPremium ? visibleCount : Math.min(FREE_LIMIT, visibleCount);
  const visibleFiltered = useMemo(() => filtered.slice(0, cap), [filtered, cap]);
  const hasMore = isPremium ? filtered.length > visibleCount : filtered.length > FREE_LIMIT;
  const lockedByFree = !isPremium && filtered.length > FREE_LIMIT;

  const grouped = useMemo(() => {
    const map = new Map<string, Verbete[]>();
    for (const e of visibleFiltered) {
      const arr = map.get(e._letter);
      if (arr) arr.push(e);
      else map.set(e._letter, [e]);
    }
    return Array.from(map.entries()).sort(([a], [b]) =>
      sort === "az" ? a.localeCompare(b) : b.localeCompare(a),
    );
  }, [visibleFiltered, sort]);

  // Palavras e números: pesquisa dentro da própria seção, agrupada por tema (números primeiro).
  const numerosGroups = useMemo(() => {
    const q = normalize(debouncedQuery);
    const base: { titulo: string; pagina: number; items: PalavraNumero[] }[] = [];
    let current: { titulo: string; pagina: number; items: PalavraNumero[] } | null = null;
    for (const item of PALAVRAS_NUMEROS) {
      if (item.kind === "grupo") {
        current = { titulo: item.titulo ?? "", pagina: item.pagina, items: [] };
        base.push(current);
        continue;
      }
      const match =
        !q ||
        normalize(item.patxoha ?? "").includes(q) ||
        normalize(item.portugues ?? "").includes(q);
      if (!match) continue;
      if (!current) {
        current = { titulo: "Palavras e Números", pagina: item.pagina, items: [] };
        base.push(current);
      }
      current.items.push(item);
    }

    // Quebra grupos muito grandes em subgrupos temáticos para facilitar a navegação.
    const expanded: { titulo: string; pagina: number; items: PalavraNumero[] }[] = [];
    for (const g of base) {
      if (g.items.length === 0) continue;
      if (g.items.length <= 40) {
        expanded.push(g);
        continue;
      }
      const byCat = new Map<string, PalavraNumero[]>();
      for (const it of g.items) {
        const cat = it.categoria || "Geral";
        const arr = byCat.get(cat);
        if (arr) arr.push(it);
        else byCat.set(cat, [it]);
      }
      for (const [cat, items] of byCat) {
        expanded.push({ titulo: `${g.titulo} · ${cat}`, pagina: items[0]?.pagina ?? g.pagina, items });
      }
    }

    const rank = (titulo: string) => {
      const n = normalize(titulo);
      if (n.includes("ordinais")) return 0;
      if (n.includes("cardinais")) return 1;
      if (n.includes("numero")) return 2;
      return 3;
    };
    return expanded.sort((a, b) => rank(a.titulo) - rank(b.titulo));
  }, [debouncedQuery]);


  const gramaticaLines = useMemo(() => {
    const q = normalize(debouncedQuery);
    if (!q) return GRAMATICA;
    return GRAMATICA.filter((l) => normalize(l.texto).includes(q));
  }, [debouncedQuery]);

  // Dicionário Ilustrado: cards da categoria escolhida, com busca combinada.
  const ilustradoItems = useMemo(() => {
    const q = normalize(debouncedQuery);
    const list = ILUSTRADO.filter((e) => {
      const matchCat = ilCat === "todas" || e.catKeys.includes(ilCat);
      const matchQ = !q || e._headNorm.includes(q) || e._glossNorm.includes(q);
      return matchCat && matchQ;
    });
    list.sort((a, b) => a.head.localeCompare(b.head, "pt", { sensitivity: "base" }));
    return list;
  }, [ilCat, debouncedQuery]);

  useEffect(() => {
    setIlVisible(60);
  }, [ilCat, debouncedQuery]);

  const ilCap = isPremium ? ilVisible : Math.min(FREE_LIMIT, ilVisible);
  const ilVisibleItems = useMemo(() => ilustradoItems.slice(0, ilCap), [ilustradoItems, ilCap]);
  const ilLockedByFree = !isPremium && ilustradoItems.length > FREE_LIMIT;
  const ilHasMore = isPremium
    ? ilustradoItems.length > ilVisible
    : ilustradoItems.length > FREE_LIMIT;

  return (
    <div className="min-h-screen pb-24 md:pb-12">
      <header className="sticky top-0 z-40 border-b border-gold/20 bg-[oklch(0.18_0.04_145/0.85)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 md:px-8">
          <Link
            to={backTo as "/"}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gold hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> {t("common.voltar")}
          </Link>
          <div className="flex items-center gap-2 text-cream font-display font-black">
            <BookOpen className="h-5 w-5 text-leaf" /> Dicionário Patxôhã 2015
          </div>
          <span className="w-14" />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 md:px-8">
        <section className="mt-6 card-elev rounded-2xl p-4 space-y-3">
          <div className="grid grid-cols-2 gap-2 rounded-2xl border border-gold/20 bg-card/40 p-1 lg:grid-cols-4">
            {SECTIONS.map((opt) => {
              const active = section === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setSection(opt.key)}
                  aria-pressed={active}
                  className={`rounded-xl px-3 py-2 text-[11px] font-black leading-tight transition sm:text-xs ${
                    active
                      ? "bg-leaf text-forest-deep shadow-lg shadow-leaf/30"
                      : "text-foreground/70 hover:text-cream"
                  }`}
                >
                  <span className="block">{opt.label}</span>
                  <span className={`mt-0.5 block text-[9px] font-semibold ${active ? "opacity-70" : "opacity-50"}`}>
                    {opt.hint}
                  </span>
                </button>
              );
            })}
          </div>

          {isWordList && (
            <button
              type="button"
              onClick={invertDirection}
              className="mx-auto flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-xs font-black text-gold transition hover:bg-gold/20"
              aria-label="Inverter direção do dicionário"
            >
              <ArrowLeftRight className="h-4 w-4" />
              PT ⇄ PATXÔHÃ
            </button>
          )}

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/50" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                section === "ilustrado"
                  ? "Buscar palavra ilustrada..."
                  : section === "pt-pat"
                  ? "Buscar em português..."
                  : section === "pat-pt"
                    ? "Buscar em Patxôhã..."
                    : section === "numeros"
                      ? "Buscar em palavras e números..."
                      : "Buscar na gramática..."
              }
              className="w-full rounded-xl border border-gold/25 bg-card/60 pl-10 pr-3 py-3 text-sm text-cream placeholder:text-foreground/40 focus:outline-none focus:border-gold/60"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="text-xs font-semibold text-foreground/70">
              {isWordList
                ? `${visibleFiltered.length}${hasMore ? "+" : ""} ${
                    visibleFiltered.length === 1 ? "verbete" : "verbetes"
                  }`
                : section === "ilustrado"
                  ? `${ilustradoItems.length} palavras nesta categoria`
                  : section === "numeros"
                  ? `${numerosGroups.reduce((n, g) => n + g.items.length, 0)} palavras`
                  : `${gramaticaLines.length} linhas`}
              <span className="ml-2 opacity-60">· {SOURCE_LABEL}</span>
            </div>
            {isWordList && (
              <div className="flex gap-1">
                <button
                  onClick={() => setSort("az")}
                  className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-bold ${
                    sort === "az"
                      ? "border-gold/60 bg-gold/20 text-gold"
                      : "border-gold/15 bg-card/40 text-foreground/60"
                  }`}
                >
                  <ArrowDownAZ className="h-3 w-3" /> A-Z
                </button>
                <button
                  onClick={() => setSort("za")}
                  className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-bold ${
                    sort === "za"
                      ? "border-gold/60 bg-gold/20 text-gold"
                      : "border-gold/15 bg-card/40 text-foreground/60"
                  }`}
                >
                  <ArrowUpAZ className="h-3 w-3" /> Z-A
                </button>
              </div>
            )}
          </div>
        </section>

        {isWordList && (
          <section className="mt-4 card-elev rounded-2xl p-3 space-y-3">
            <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {CATEGORIES.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  aria-pressed={category === item}
                  className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-bold transition ${
                    category === item
                      ? "border-leaf bg-leaf text-forest-deep"
                      : "border-gold/20 bg-card/50 text-foreground/70 hover:text-cream"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setLetter("Todas")}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-black transition ${
                  letter === "Todas"
                    ? "bg-gold text-forest-deep"
                    : "bg-card/60 text-foreground/70 hover:text-cream border border-gold/15"
                }`}
              >
                {t("dictionary.allLetters")}
              </button>
              {ALPHABET.map((l) => {
                const count = letters.get(l) ?? 0;
                const active = letter === l;
                return (
                  <button
                    key={l}
                    onClick={() => setLetter(l)}
                    title={`${count} ${count === 1 ? "verbete" : "verbetes"}`}
                    className={`h-8 w-8 rounded-lg text-xs font-black transition ${
                      active
                        ? "bg-leaf text-forest-deep shadow-lg shadow-leaf/30"
                        : "bg-card/60 text-cream border border-gold/20 hover:border-gold/50"
                    }`}
                  >
                    {l}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {section === "ilustrado" && (
          <section className="mt-5">
            <div className="flex flex-wrap gap-3">
              {ILUSTRADO_CATEGORIAS.map((c, i) => {
                const active = ilCat === c.key;
                const count = ILUSTRADO_COUNTS.get(c.key) ?? 0;
                return (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setIlCat(c.key)}
                    aria-pressed={active}
                    title={`${count} palavras`}
                    className={`rounded-[22px] px-5 py-4 text-left font-display text-base font-black transition ${
                      active
                        ? "bg-[oklch(0.80_0.16_135)] text-forest-deep shadow-lg"
                        : CHIP_TONES[i % CHIP_TONES.length]
                    }`}
                  >
                    <span aria-hidden className="mr-2">{c.emoji}</span>
                    {c.label}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setIlCat("todas")}
                aria-pressed={ilCat === "todas"}
                className={`rounded-[22px] px-5 py-4 text-left font-display text-base font-black leading-tight transition ${
                  ilCat === "todas"
                    ? "bg-[oklch(0.80_0.16_135)] text-forest-deep shadow-lg"
                    : "bg-[oklch(0.88_0.12_135)] text-forest-deep hover:brightness-105"
                }`}
              >
                <span aria-hidden className="mr-2">📖</span>
                Todas
                <br />
                as Palavras
              </button>
              <button
                type="button"
                onClick={() => setSection("gramatica")}
                className="rounded-[22px] bg-[oklch(0.82_0.07_60)] px-5 py-4 text-left font-display text-base font-black text-forest-deep transition hover:brightness-105"
              >
                <span aria-hidden className="mr-2">📚</span>
                Gramática
              </button>
            </div>
          </section>
        )}


        <section className="mt-5">
          {section === "ilustrado" ? (
            ilustradoItems.length === 0 ? (
              <div className="text-center text-foreground/60 py-12">{t("dictionary.empty")}</div>
            ) : (
              <div className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {ilVisibleItems.map((e) => (
                    <PlayableCard key={`il-${e.id}`} text={e.patxoha} audioUrl={null}>
                      <div className="grid h-32 place-items-center rounded-[22px] bg-[oklch(0.90_0.09_140)] text-6xl">
                        <span aria-hidden>{e.emoji}</span>
                      </div>
                      <h3 className="mt-4 font-display text-2xl font-black leading-tight text-forest-deep break-words">
                        {e.head}
                      </h3>
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <p className="min-w-0 text-lg font-bold text-[oklch(0.38_0.10_140)] break-words">
                          {e.patxoha}
                        </p>
                        <PlayIndicator />
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-forest-deep/55">
                          Ouvir pronúncia
                        </span>
                        <span className="rounded-full bg-forest-deep/10 px-2 py-0.5 text-[10px] font-bold text-forest-deep/70">
                          p. {e.pagina}
                        </span>
                      </div>
                    </PlayableCard>
                  ))}
                </div>

                {ilLockedByFree ? (
                  <div className="card-elev rounded-3xl border border-gold/30 p-6 text-center">
                    <h3 className="font-display text-xl font-black text-cream">
                      {t("dictionary.freeLimitTitle", { count: FREE_LIMIT })}
                    </h3>
                    <p className="mx-auto mt-1 max-w-md text-sm text-foreground/70">
                      {t("dictionary.freeLimitDescription")}
                    </p>
                    <Link
                      to="/planos"
                      className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-gold px-6 py-3 font-display text-sm font-black text-forest-deep shadow-lg transition hover:brightness-110"
                    >
                      <Crown className="h-4 w-4" /> {t("premium.verPlanos")}
                    </Link>
                  </div>
                ) : ilHasMore ? (
                  <div className="text-center">
                    <button
                      onClick={() => setIlVisible((n) => n + 60)}
                      className="rounded-full border border-gold/30 bg-gold/10 px-5 py-2 text-sm font-black text-gold transition hover:bg-gold/20"
                    >
                      {t("dictionary.showMore")}
                    </button>
                  </div>
                ) : null}
              </div>
            )
          ) : isWordList ? (
            filtered.length === 0 ? (
              <div className="text-center text-foreground/60 py-12">{t("dictionary.empty")}</div>
            ) : (
              <div className="space-y-6">
                {grouped.map(([ltr, items]) => (
                  <div key={ltr}>
                    <div className="sticky top-[60px] z-10 mb-2 flex items-center gap-3 bg-[oklch(0.18_0.04_145/0.85)] backdrop-blur-xl py-2">
                      <div className="grid h-9 w-9 place-items-center rounded-lg bg-gold text-forest-deep font-display text-lg font-black">
                        {ltr}
                      </div>
                      <div className="h-px flex-1 bg-gold/20" />
                      <div className="text-[11px] font-bold text-foreground/60">{items.length}</div>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      {items.map((e) => (
                        <PlayableCard key={e.id} text={e.patxoha} audioUrl={null}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="font-display text-xl font-black text-cream group-hover:text-gold transition-colors break-words">
                                  {e.head}
                                </h3>
                                <PlayIndicator />
                              </div>
                              <div className="mt-1 text-sm text-foreground/80 break-words">
                                <span className="text-gold">→</span> {e.gloss}
                              </div>
                              {e.categoria !== "Geral" && (
                                <span className="mt-2 inline-flex rounded-full border border-leaf/25 bg-leaf/10 px-2 py-0.5 text-[10px] font-bold text-leaf">
                                  {e.categoria}
                                </span>
                              )}
                            </div>
                            <span className="shrink-0 chip-gold rounded-full px-2 py-0.5 text-[10px] font-bold">
                              p. {e.pagina}
                            </span>
                          </div>
                          {e.raw && (
                            <div className="mt-2 rounded-lg border border-gold/15 bg-card/40 px-3 py-2 text-[11px] italic text-foreground/70 break-words">
                              {e.raw}
                            </div>
                          )}
                        </PlayableCard>
                      ))}
                    </div>
                  </div>
                ))}
                {lockedByFree ? (
                  <div className="mt-4 card-elev rounded-3xl border border-gold/30 p-6 text-center">
                    <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[var(--gradient-leaf)] shadow-[var(--shadow-glow)]">
                      <Lock className="h-6 w-6 text-cream" />
                    </div>
                    <h3 className="mt-4 font-display text-xl font-black text-cream">
                      {t("dictionary.freeLimitTitle", { count: FREE_LIMIT })}
                    </h3>
                    <p className="mx-auto mt-1 max-w-md text-sm text-foreground/70">
                      {t("dictionary.freeLimitDescription")}
                    </p>
                    <Link
                      to="/planos"
                      className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-gold px-6 py-3 font-display text-sm font-black text-forest-deep shadow-lg transition hover:brightness-110"
                    >
                      <Crown className="h-4 w-4" /> {t("premium.verPlanos")}
                    </Link>
                  </div>
                ) : hasMore ? (
                  <div className="pt-2 text-center">
                    <button
                      onClick={() => setVisibleCount((n) => n + 120)}
                      className="rounded-full border border-gold/30 bg-gold/10 px-5 py-2 text-sm font-black text-gold transition hover:bg-gold/20"
                    >
                      {t("dictionary.showMore")}
                    </button>
                  </div>
                ) : null}
              </div>
            )
          ) : section === "numeros" ? (
            numerosGroups.length === 0 ? (
              <div className="text-center text-foreground/60 py-12">{t("dictionary.empty")}</div>
            ) : (
              <div className="space-y-6">
                {numerosGroups.map((g) => (
                  <div key={`${g.titulo}-${g.pagina}`}>
                    <div className="mb-2 flex items-center gap-3">
                      <h2 className="font-display text-base font-black text-gold break-words">{g.titulo}</h2>
                      <div className="h-px flex-1 bg-gold/20" />
                      <span className="text-[11px] font-bold text-foreground/60">p. {g.pagina}</span>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      {g.items.map((item) => (
                        <PlayableCard key={item.id} text={item.patxoha ?? ""} audioUrl={null}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="font-display text-lg font-black text-cream break-words">
                                  {item.patxoha}
                                </h3>
                                <PlayIndicator />
                              </div>
                              <div className="mt-1 text-sm text-foreground/80 break-words">
                                <span className="text-gold">→</span> {item.portugues}
                              </div>
                            </div>
                            <span className="shrink-0 chip-gold rounded-full px-2 py-0.5 text-[10px] font-bold">
                              p. {item.pagina}
                            </span>
                          </div>
                        </PlayableCard>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : gramaticaLines.length === 0 ? (
            <div className="text-center text-foreground/60 py-12">{t("dictionary.empty")}</div>
          ) : (
            <div className="rounded-[28px] bg-cream p-5 md:p-8 shadow-xl">
              <h2 className="font-display text-2xl font-black text-forest-deep md:text-3xl">
                <span className="text-[oklch(0.42_0.09_45)]">Gramática</span> PATXÔHÃ
              </h2>
              <p className="mt-1 text-[11px] font-semibold text-forest-deep/60">{SOURCE_LABEL}</p>
              <div className="mt-5 space-y-2 md:columns-2 md:gap-8 [&>p]:break-inside-avoid">
                {gramaticaLines.map((l) => (
                  <p
                    key={l.id}
                    className={`rounded-lg px-3 py-2 text-sm leading-relaxed break-words ${
                      l.idioma === "patxoha"
                        ? "border-l-4 border-[oklch(0.55_0.13_140)] bg-[oklch(0.55_0.13_140/0.12)] font-bold text-[oklch(0.35_0.10_140)]"
                        : l.idioma === "portugues"
                          ? "border-l-4 border-[oklch(0.62_0.11_60)] bg-[oklch(0.62_0.11_60/0.14)] text-[oklch(0.40_0.09_50)]"
                          : "text-forest-deep/80"
                    }`}
                  >
                    {l.texto}
                  </p>
                ))}
              </div>
            </div>

          )}
        </section>

        <p className="mt-8 text-center text-[11px] font-semibold text-foreground/50">{SOURCE_LABEL}</p>
      </main>
    </div>
  );
}

function PlayIndicator() {
  return (
    <span
      aria-hidden
      className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-leaf/20 text-leaf group-hover:bg-leaf/40 group-hover:scale-110 transition"
    >
      <Volume2 className="h-3.5 w-3.5" />
    </span>
  );
}

function PlayableCard({
  text,
  audioUrl,
  children,
}: {
  text: string;
  audioUrl: string | null;
  children: React.ReactNode;
}) {
  const [busy, setBusy] = useState(false);
  const cacheRef = useRef<string | null>(null);

  async function play() {
    if (busy || !text) return;
    try {
      setBusy(true);
      if (audioUrl) {
        await playFast(audioUrl);
        return;
      }
      if (cacheRef.current) {
        await playFast(cacheRef.current);
        return;
      }
      // Uses browser's built-in speech synthesis — no credits required.
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        toast.error("Seu navegador não suporta síntese de voz.");
        return;
      }
      const synth = window.speechSynthesis;
      synth.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "pt-BR";
      utter.rate = 0.85;
      utter.pitch = 1;
      const voices = synth.getVoices();
      const preferred =
        voices.find((v) => /pt[-_]BR/i.test(v.lang) && /male|masc|ricardo|daniel|luciano/i.test(v.name)) ||
        voices.find((v) => /pt[-_]BR/i.test(v.lang)) ||
        voices.find((v) => /^pt/i.test(v.lang));
      if (preferred) utter.voice = preferred;
      await new Promise<void>((resolve) => {
        utter.onend = () => resolve();
        utter.onerror = () => resolve();
        synth.speak(utter);
      });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erro ao tocar áudio");
    } finally {
      setBusy(false);
    }
  }

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={play}
      onKeyDown={(ev) => {
        if (ev.key === "Enter" || ev.key === " ") {
          ev.preventDefault();
          play();
        }
      }}
      aria-label={`Ouvir ${text}`}
      aria-busy={busy}
      className={`group card-elev rounded-2xl p-4 cursor-pointer select-none transition hover:border-leaf/40 hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-leaf ${busy ? "opacity-70" : ""}`}
    >
      {busy && (
        <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-leaf">
          <Loader2 className="h-3 w-3 animate-spin" /> Tocando…
        </div>
      )}
      {children}
    </article>
  );
}

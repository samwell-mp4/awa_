import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";

import { useTranslation } from "react-i18next";
import {
  Search,
  ArrowLeft,
  
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
import { SiteHeader } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";

import ptPatData from "@/data/dic-pt-pat.json";
import patPtData from "@/data/dic-pat-pt.json";
import palavrasNumerosData from "@/data/dic-palavras-numeros.json";
import gramaticaData from "@/data/dic-gramatica.json";
import { ILUSTRADO_CATEGORIAS, categoriasDoVerbete, emojiDoVerbete } from "@/lib/dic-ilustrado";
import { Pagination } from "@/components/education/pagination";

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

/** Tons limpos e profissionais das categorias no tema adulto. */
const CHIP_TONES = [
  "border-[#e8e4dc] bg-white text-[#374151] hover:border-[#1b4332]/40 hover:bg-[#fbfaf7]",
  "border-[#e8e4dc] bg-white text-[#374151] hover:border-[#1b4332]/40 hover:bg-[#fbfaf7]",
  "border-[#e8e4dc] bg-white text-[#374151] hover:border-[#1b4332]/40 hover:bg-[#fbfaf7]",
  "border-[#e8e4dc] bg-white text-[#374151] hover:border-[#1b4332]/40 hover:bg-[#fbfaf7]",
];

const PAGE_SIZE = 30;
const IL_PAGE_SIZE = 24;

function DictionaryPage() {
  const backTo = useLastArea();
  const { t } = useTranslation();
  const { isPremium } = useSubscription();

  const [section, setSection] = useState<Section>("ilustrado");
  const [ilCat, setIlCat] = useState<string>("numeros");
  const [ilPage, setIlPage] = useState(1);
  const [query, setQuery] = useState("");
  const [letter, setLetter] = useState<string>("Todas");
  const [sort, setSort] = useState<"az" | "za">("az");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("Todas");
  const [page, setPage] = useState(1);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const searchRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedQuery(query.trim()), 200);
    return () => window.clearTimeout(id);
  }, [query]);

  const isWordList = section === "pt-pat" || section === "pat-pt";
  const source = section === "pt-pat" ? PT_PAT : PAT_PT;
  const letters = section === "pt-pat" ? PT_PAT_LETTERS : PAT_PT_LETTERS;

  useEffect(() => {
    setLetter("Todas");
    setPage(1);
    setIlPage(1);
    setQuery("");
    setCategory("Todas");
  }, [section]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, letter, sort, category]);

  useEffect(() => {
    setIlPage(1);
  }, [ilCat, debouncedQuery]);

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

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pagedItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const lockedByFree = !isPremium && page > 2;

  const grouped = useMemo(() => {
    const map = new Map<string, Verbete[]>();
    for (const e of pagedItems) {
      const arr = map.get(e._letter);
      if (arr) arr.push(e);
      else map.set(e._letter, [e]);
    }
    return Array.from(map.entries()).sort(([a], [b]) =>
      sort === "az" ? a.localeCompare(b) : b.localeCompare(a),
    );
  }, [pagedItems, sort]);

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

  const ilTotalPages = Math.max(1, Math.ceil(ilustradoItems.length / IL_PAGE_SIZE));
  const pagedIlustrado = useMemo(() => {
    const start = (ilPage - 1) * IL_PAGE_SIZE;
    return ilustradoItems.slice(start, start + IL_PAGE_SIZE);
  }, [ilustradoItems, ilPage]);

  const ilLockedByFree = !isPremium && ilPage > 2;

  return (
    <div className="min-h-screen pb-24 md:pb-12 bg-[#f7f6f2] text-[#1f2937]">
      <SiteHeader mode="adulto" />
      <header className="sticky top-0 z-30 border-b border-[#e8e4dc] bg-white/95 backdrop-blur-xl shadow-xs">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3.5 md:px-8">
          <Link
            to={backTo as "/"}
            aria-label={t("common.voltar")}
            className="grid h-10 w-10 place-items-center rounded-xl border border-[#e8e4dc] bg-white text-[#11231b] shadow-xs transition hover:border-[#1b4332] hover:bg-[#f4f2ec]"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="text-center">
            <div className="font-display text-2xl font-black tracking-tight text-[#11231b] md:text-3xl">
              PATXÔHÃ
            </div>
            <div className="text-[11px] font-semibold text-[#6b7280]">Dicionário Digital 2015</div>
          </div>
          <button
            type="button"
            onClick={() => searchRef.current?.focus()}
            aria-label="Buscar"
            className="grid h-10 w-10 place-items-center rounded-xl border border-[#e8e4dc] bg-white text-[#11231b] shadow-xs transition hover:border-[#1b4332] hover:bg-[#f4f2ec]"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 md:px-8">
        <section className="mt-5 space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setSection("pt-pat")}
              aria-pressed={section === "pt-pat"}
              className={`flex-1 min-w-[140px] rounded-xl px-4 py-3 text-center font-display text-xs md:text-sm font-black transition shadow-xs ${
                section === "pt-pat"
                  ? "bg-[#1b4332] text-white shadow-sm"
                  : "border border-[#e8e4dc] bg-white text-[#1f2937] hover:border-[#1b4332]/50 hover:bg-[#f4f2ec]"
              }`}
            >
              Português <span className="mx-1 opacity-60">→</span> PATXÔHÃ
            </button>
            <button
              type="button"
              onClick={() => setSection("pat-pt")}
              aria-pressed={section === "pat-pt"}
              className={`flex-1 min-w-[140px] rounded-xl px-4 py-3 text-center font-display text-xs md:text-sm font-black transition shadow-xs ${
                section === "pat-pt"
                  ? "bg-[#1b4332] text-white shadow-sm"
                  : "border border-[#e8e4dc] bg-white text-[#1f2937] hover:border-[#1b4332]/50 hover:bg-[#f4f2ec]"
              }`}
            >
              PATXÔHÃ <span className="mx-1 opacity-60">→</span> Português
            </button>
            <button
              type="button"
              onClick={invertDirection}
              aria-label="Inverter direção do dicionário"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[#e8e4dc] bg-white text-[#1b4332] shadow-xs transition hover:bg-[#1b4332] hover:text-white active:scale-95"
            >
              <ArrowLeftRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setSection("ilustrado")}
              aria-pressed={section === "ilustrado"}
              className={`rounded-xl px-4 py-3 font-display text-xs md:text-sm font-black transition shadow-xs ${
                section === "ilustrado"
                  ? "bg-[#1b4332] text-white shadow-sm"
                  : "border border-[#e8e4dc] bg-white text-[#1f2937] hover:border-[#1b4332]/50 hover:bg-[#f4f2ec]"
              }`}
            >
              🖼️ Ilustrado
            </button>
            <button
              type="button"
              onClick={() => setSection("numeros")}
              aria-pressed={section === "numeros"}
              className={`rounded-xl px-4 py-3 font-display text-xs md:text-sm font-black transition shadow-xs ${
                section === "numeros"
                  ? "bg-[#1b4332] text-white shadow-sm"
                  : "border border-[#e8e4dc] bg-white text-[#1f2937] hover:border-[#1b4332]/50 hover:bg-[#f4f2ec]"
              }`}
            >
              🔢 Palavras e Números
            </button>
            <button
              type="button"
              onClick={() => setSection("gramatica")}
              aria-pressed={section === "gramatica"}
              className={`rounded-xl px-4 py-3 font-display text-xs md:text-sm font-black transition shadow-xs ${
                section === "gramatica"
                  ? "bg-[#1b4332] text-white shadow-sm"
                  : "border border-[#e8e4dc] bg-white text-[#1f2937] hover:border-[#1b4332]/50 hover:bg-[#f4f2ec]"
              }`}
            >
              📚 Gramática
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7280]" />
            <input
              ref={searchRef}
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
              className="w-full rounded-2xl border border-[#e8e4dc] bg-white pl-11 pr-4 py-3.5 text-sm font-medium text-[#11231b] placeholder:text-[#9ca3af] shadow-xs focus:border-[#1b4332] focus:outline-none focus:ring-1 focus:ring-[#1b4332]"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs font-semibold text-[#4b5563]">
              {isWordList
                ? `${filtered.length} ${filtered.length === 1 ? "verbete" : "verbetes"} (página ${page} de ${totalPages})`
                : section === "ilustrado"
                  ? `${ilustradoItems.length} palavras (página ${ilPage} de ${ilTotalPages})`
                  : section === "numeros"
                  ? `${numerosGroups.reduce((n, g) => n + g.items.length, 0)} palavras`
                  : `${gramaticaLines.length} linhas`}
              <span className="ml-2 text-[#6b7280]">· {SOURCE_LABEL}</span>
            </div>
            {isWordList && (
              <div className="flex gap-1.5">
                <button
                  onClick={() => setSort("az")}
                  className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold transition shadow-xs ${
                    sort === "az"
                      ? "bg-[#1b4332] text-white"
                      : "border border-[#e8e4dc] bg-white text-[#4b5563] hover:bg-[#f4f2ec]"
                  }`}
                >
                  <ArrowDownAZ className="h-3 w-3" /> A-Z
                </button>
                <button
                  onClick={() => setSort("za")}
                  className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold transition shadow-xs ${
                    sort === "za"
                      ? "bg-[#1b4332] text-white"
                      : "border border-[#e8e4dc] bg-white text-[#4b5563] hover:bg-[#f4f2ec]"
                  }`}
                >
                  <ArrowUpAZ className="h-3 w-3" /> Z-A
                </button>
              </div>
            )}
          </div>
        </section>

        {isWordList && (
          <section className="mt-4 rounded-2xl border border-[#e8e4dc] bg-white p-4 shadow-xs space-y-3">
            <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {CATEGORIES.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  aria-pressed={category === item}
                  className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                    category === item
                      ? "border-[#1b4332] bg-[#1b4332] text-white"
                      : "border-[#e8e4dc] bg-[#f7f6f2] text-[#4b5563] hover:text-[#11231b] hover:bg-white"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setLetter("Todas")}
                className={`rounded-lg px-2.5 py-1 text-xs font-black transition ${
                  letter === "Todas"
                    ? "bg-[#1b4332] text-white shadow-xs"
                    : "bg-[#f7f6f2] text-[#4b5563] hover:text-[#11231b] border border-[#e8e4dc]"
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
                        ? "bg-[#1b4332] text-white shadow-xs"
                        : "bg-[#f7f6f2] text-[#11231b] border border-[#e8e4dc] hover:border-[#1b4332]"
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
            <div className="flex flex-wrap gap-2.5">
              {ILUSTRADO_CATEGORIAS.map((c) => {
                const active = ilCat === c.key;
                const count = ILUSTRADO_COUNTS.get(c.key) ?? 0;
                return (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setIlCat(c.key)}
                    aria-pressed={active}
                    title={`${count} palavras`}
                    className={`rounded-2xl border px-4 py-3 text-left font-display text-sm font-bold transition shadow-xs ${
                      active
                        ? "border-[#1b4332] bg-[#1b4332] text-white shadow-sm"
                        : "border-[#e8e4dc] bg-white text-[#374151] hover:border-[#1b4332]/50 hover:bg-[#fcfbf9]"
                    }`}
                  >
                    <span aria-hidden className="mr-2">{c.emoji}</span>
                    {c.label}
                    <span className={`ml-2 text-xs font-semibold ${active ? "text-white/80" : "text-[#6b7280]"}`}>
                      ({count})
                    </span>
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setIlCat("todas")}
                aria-pressed={ilCat === "todas"}
                className={`rounded-2xl border px-4 py-3 text-left font-display text-sm font-bold transition shadow-xs ${
                  ilCat === "todas"
                    ? "border-[#1b4332] bg-[#1b4332] text-white shadow-sm"
                    : "border-[#e8e4dc] bg-white text-[#374151] hover:border-[#1b4332]/50 hover:bg-[#fcfbf9]"
                }`}
              >
                <span aria-hidden className="mr-2">📖</span>
                Todas as Palavras
              </button>
              <button
                type="button"
                onClick={() => setSection("gramatica")}
                className="rounded-2xl border border-[#e8e4dc] bg-white px-4 py-3 text-left font-display text-sm font-bold text-[#374151] transition hover:border-[#1b4332]/50 hover:bg-[#fcfbf9] shadow-xs"
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
              <div className="text-center text-[#6b7280] py-12">{t("dictionary.empty")}</div>
            ) : (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {pagedIlustrado.map((e) => (
                    <PlayableCard key={`il-${e.id}`} text={e.patxoha} audioUrl={null} variant="light">
                      <div className="grid h-32 place-items-center rounded-2xl bg-[#f4f2ec] text-5xl">
                        <span aria-hidden>{e.emoji}</span>
                      </div>
                      <h3 className="mt-3.5 font-display text-xl font-black leading-tight text-[#11231b] break-words">
                        {e.head}
                      </h3>
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <p className="min-w-0 text-base font-bold text-[#1b4332] break-words">
                          {e.patxoha}
                        </p>
                        <PlayIndicator variant="light" />
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#f0eee6] pt-2.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#6b7280]">
                          Ouvir pronúncia
                        </span>
                        <span className="rounded-full bg-[#1b4332]/10 px-2 py-0.5 text-[10px] font-bold text-[#1b4332]">
                          p. {e.pagina}
                        </span>
                      </div>
                    </PlayableCard>
                  ))}
                </div>

                {ilLockedByFree ? (
                  <div className="rounded-3xl border border-[#b47e28]/30 bg-white p-6 text-center shadow-xs">
                    <h3 className="font-display text-xl font-black text-[#11231b]">
                      {t("dictionary.freeLimitTitle", { count: FREE_LIMIT })}
                    </h3>
                    <p className="mx-auto mt-1 max-w-md text-sm text-[#4b5563]">
                      {t("dictionary.freeLimitDescription")}
                    </p>
                    <Link
                      to="/planos"
                      className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-[#1b4332] px-6 py-3 font-display text-sm font-black text-white shadow-sm transition hover:bg-[#2d6a4f]"
                    >
                      <Crown className="h-4 w-4" /> {t("premium.verPlanos")}
                    </Link>
                  </div>
                ) : ilTotalPages > 1 ? (
                  <div className="pt-2">
                    <Pagination
                      currentPage={ilPage}
                      totalPages={ilTotalPages}
                      onPageChange={(p) => {
                        setIlPage(p);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      mode="adulto"
                    />
                  </div>
                ) : null}
              </div>
            )
          ) : isWordList ? (
            filtered.length === 0 ? (
              <div className="text-center text-[#6b7280] py-12">{t("dictionary.empty")}</div>
            ) : (
              <div className="space-y-6">
                {grouped.map(([ltr, items]) => (
                  <div key={ltr}>
                    <div className="sticky top-[60px] z-10 mb-2 flex items-center gap-3 bg-[#f7f6f2]/95 backdrop-blur-xl py-2">
                      <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#1b4332] text-white font-display text-sm font-black shadow-xs">
                        {ltr}
                      </div>
                      <div className="h-px flex-1 bg-[#e8e4dc]" />
                      <div className="text-[11px] font-bold text-[#6b7280]">{items.length}</div>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      {items.map((e) => (
                        <PlayableCard key={e.id} text={e.patxoha} audioUrl={null}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="font-display text-lg font-black text-[#11231b] group-hover:text-[#1b4332] transition-colors break-words">
                                  {e.head}
                                </h3>
                                <PlayIndicator />
                              </div>
                              <div className="mt-1 text-sm font-medium text-[#4b5563] break-words">
                                <span className="text-[#b47e28]">→</span> {e.gloss}
                              </div>
                              {e.categoria !== "Geral" && (
                                <span className="mt-2 inline-flex rounded-md border border-[#2d6a4f]/25 bg-[#2d6a4f]/10 px-2 py-0.5 text-[10px] font-bold text-[#2d6a4f]">
                                  {e.categoria}
                                </span>
                              )}
                            </div>
                            <span className="shrink-0 rounded-full border border-[#b47e28]/30 bg-[#b47e28]/10 px-2 py-0.5 text-[10px] font-bold text-[#b47e28]">
                              p. {e.pagina}
                            </span>
                          </div>
                          {e.raw && (
                            <div className="mt-2 rounded-xl border border-[#e8e4dc] bg-[#fbfaf7] px-3 py-2 text-xs italic text-[#6b7280] break-words">
                              {e.raw}
                            </div>
                          )}
                        </PlayableCard>
                      ))}
                    </div>
                  </div>
                ))}
                {lockedByFree ? (
                  <div className="mt-4 rounded-3xl border border-[#b47e28]/30 bg-white p-6 text-center shadow-xs">
                    <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#1b4332] text-white shadow-xs">
                      <Lock className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 font-display text-xl font-black text-[#11231b]">
                      {t("dictionary.freeLimitTitle", { count: FREE_LIMIT })}
                    </h3>
                    <p className="mx-auto mt-1 max-w-md text-sm text-[#4b5563]">
                      {t("dictionary.freeLimitDescription")}
                    </p>
                    <Link
                      to="/planos"
                      className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-[#1b4332] px-6 py-3 font-display text-sm font-black text-white shadow-sm transition hover:bg-[#2d6a4f]"
                    >
                      <Crown className="h-4 w-4" /> {t("premium.verPlanos")}
                    </Link>
                  </div>
                ) : totalPages > 1 ? (
                  <div className="pt-2">
                    <Pagination
                      currentPage={page}
                      totalPages={totalPages}
                      onPageChange={(p) => {
                        setPage(p);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      mode="adulto"
                    />
                  </div>
                ) : null}
              </div>
            )
          ) : section === "numeros" ? (
            numerosGroups.length === 0 ? (
              <div className="text-center text-[#6b7280] py-12">{t("dictionary.empty")}</div>
            ) : (
              <div className="space-y-6">
                {numerosGroups.map((g) => (
                  <div key={`${g.titulo}-${g.pagina}`}>
                    <div className="mb-2 flex items-center gap-3">
                      <h2 className="font-display text-base font-black text-[#1b4332] break-words">{g.titulo}</h2>
                      <div className="h-px flex-1 bg-[#e8e4dc]" />
                      <span className="text-[11px] font-bold text-[#6b7280]">p. {g.pagina}</span>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      {g.items.map((item) => (
                        <PlayableCard key={item.id} text={item.patxoha ?? ""} audioUrl={null}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="font-display text-lg font-black text-[#11231b] break-words">
                                  {item.patxoha}
                                </h3>
                                <PlayIndicator />
                              </div>
                              <div className="mt-1 text-sm text-[#4b5563] break-words">
                                <span className="text-[#b47e28]">→</span> {item.portugues}
                              </div>
                            </div>
                            <span className="shrink-0 rounded-full border border-[#b47e28]/30 bg-[#b47e28]/10 px-2 py-0.5 text-[10px] font-bold text-[#b47e28]">
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
            <div className="text-center text-[#6b7280] py-12">{t("dictionary.empty")}</div>
          ) : (
            <div className="rounded-3xl border border-[#e8e4dc] bg-white p-6 md:p-8 shadow-xs">
              <h2 className="font-display text-2xl font-black text-[#11231b] md:text-3xl">
                <span className="text-[#1b4332]">Gramática</span> PATXÔHÃ
              </h2>
              <p className="mt-1 text-[11px] font-semibold text-[#6b7280]">{SOURCE_LABEL}</p>
              <div className="mt-5 space-y-2 md:columns-2 md:gap-8 [&>p]:break-inside-avoid">
                {gramaticaLines.map((l) => (
                  <p
                    key={l.id}
                    className={`rounded-xl px-3 py-2 text-sm leading-relaxed break-words ${
                      l.idioma === "patxoha"
                        ? "border-l-4 border-[#1b4332] bg-[#1b4332]/5 font-bold text-[#11231b]"
                        : l.idioma === "portugues"
                          ? "border-l-4 border-[#b47e28] bg-[#b47e28]/5 text-[#374151]"
                          : "text-[#4b5563]"
                    }`}
                  >
                    {l.texto}
                  </p>
                ))}
              </div>
            </div>
          )}
        </section>

        <p className="mt-8 text-center text-[11px] font-semibold text-[#6b7280]">{SOURCE_LABEL}</p>
      </main>
      <SiteFooter mode="adulto" />
    </div>
  );
}

function PlayIndicator({ variant = "dark" }: { variant?: "dark" | "light" }) {
  return (
    <span
      aria-hidden
      className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#1b4332]/10 text-[#1b4332] transition group-hover:scale-110 group-hover:bg-[#1b4332]/20"
    >
      <Volume2 className="h-4 w-4" />
    </span>
  );
}

function PlayableCard({
  text,
  audioUrl,
  variant = "dark",
  children,
}: {
  text: string;
  audioUrl: string | null;
  variant?: "dark" | "light";
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
      className={`group cursor-pointer select-none transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none rounded-2xl border border-[#e8e4dc] bg-white p-4 hover:border-[#1b4332]/50 ${busy ? "opacity-70" : ""}`}
    >
      {busy && (
        <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#1b4332]">
          <Loader2 className="h-3 w-3 animate-spin" /> Tocando…
        </div>
      )}
      {children}
    </article>
  );
}

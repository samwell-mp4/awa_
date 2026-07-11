import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, ArrowLeft, BookOpen, ArrowDownAZ, ArrowUpAZ, Crown, Lock, Volume2, Loader2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { PremiumGate } from "@/components/PremiumGate";
import { useSubscription } from "@/hooks/use-subscription";
import { pickLang, useLang } from "@/lib/pick-lang";
import { narratePublic } from "@/lib/narrate-public.functions";
import { base64ToBlobUrl, playFast } from "@/lib/audio-play";
import { useAutoTranslate } from "@/hooks/use-auto-translate";
import patxohaDict from "@/data/patxoha-dictionary.json";



export const Route = createFileRoute("/dicionario")({
  head: () => ({
    meta: [
      { title: "Dicionário Patxôhã — AWÃ TECH" },
      { name: "description", content: "Dicionário Patxôhã completo — recurso Premium." },
    ],
  }),
  component: DictionaryRoute,
});

function DictionaryRoute() {
  const { t } = useTranslation();
  return (
    <PremiumGate title={t("dictionary.premiumTitle")} description={t("dictionary.premiumDescription")}>
      <DictionaryPage />
    </PremiumGate>
  );
}

const FREE_LIMIT = 50;



type Entry = {
  id: string;
  term_indigenous: string;
  term_pt: string;
  language: string;
  category: string;
  pronunciation: string | null;
  example: string | null;
  audio_url: string | null;
  term_pt_en?: string | null;
  term_pt_es?: string | null;
  example_en?: string | null;
  example_es?: string | null;
};


const PDF_DICTIONARY_ENTRIES = (patxohaDict as Array<Omit<Entry, "id">>).map((entry, index) => ({
  id: `pdf-${index}-${entry.term_indigenous}-${entry.term_pt}`,
  ...entry,
  pronunciation: entry.pronunciation ?? null,
  example: entry.example ?? null,
  audio_url: entry.audio_url ?? null,
})) satisfies Entry[];

// Auto-categorização baseada em palavras-chave na tradução PT.
const CATEGORY_RULES: { name: string; keywords: RegExp }[] = [
  { name: "Saudações", keywords: /\b(ol[áa]|bom dia|boa tarde|boa noite|tchau|adeus|obrigad[oa]|sauda|bem-vind|paz|sim|n[ãa]o|por favor|com licen[çc]a|desculp)\b/i },
  { name: "Família", keywords: /\b(pai|m[ãa]e|filh[oa]|irm[ãa]o|irm[ãa]|av[óo]|av[ôo]|tio|tia|primo|prima|esposo|esposa|marido|mulher|fam[íi]lia|crian[çc]a|beb[êe]|menin[oa]|sobrinh|cunhad|sogr|netos?|net[oa])\b/i },
  { name: "Natureza", keywords: /\b(sol|lua|estrela|c[ée]u|chuva|vento|terra|rio|mar|[áa]gua|fogo|pedra|[áa]rvore|folha|flor|mato|floresta|montanha|nuvem|trov[ãa]o|rel[âa]mpago|areia|p[ôo]r do sol|amanhecer|noite|dia|tempo)\b/i },
  { name: "Animais", keywords: /\b(cachorro|gato|p[áa]ssaro|peixe|cobra|on[çc]a|macaco|tatu|cavalo|boi|vaca|porco|galinha|galo|tartaruga|jacar[ée]|formiga|abelha|borboleta|aranha|p[áa]ssaro|coruja|[áa]guia|gavi[ãa]o|sapo|r[ãa]|veado|capivara|anta|tamandu[áa]|preguic|rato|morcego|coelho|jabuti|arara|tucano|papagaio|periquito|peixe|ave|inseto|animal|bicho)\b/i },
  { name: "Corpo", keywords: /\b(cabe[çc]a|olho|orelha|nariz|boca|dente|l[íi]ngua|m[ãa]o|p[ée]|bra[çc]o|perna|cora[çc]ão|barriga|costas|cabelo|dedo|joelho|cotovelo|ombro|peito|pesco[çc]o|rosto|cara|unha|pele|osso|sangue|corpo)\b/i },
  { name: "Alimentos", keywords: /\b(comida|comer|beber|[áa]gua|farinha|mandioca|milho|feij[ãa]o|arroz|carne|peixe|fruta|banana|caju|coco|leite|mel|sal|a[çc][úu]car|caf[ée]|p[ãa]o|caium|sopa|bebida|alimento|fruto|ra[íi]z)\b/i },
  { name: "Verbos", keywords: /^(comer|beber|ir|vir|andar|correr|dormir|acordar|falar|cantar|dan[çc]ar|ver|ouvir|olhar|escutar|fazer|dar|pegar|jogar|trazer|levar|trabalhar|brincar|pescar|ca[çc]ar|plantar|colher|escrever|ler|estudar|aprender|ensinar|amar|gostar|querer|poder|saber|ter|estar|ser|viver|morrer|nascer|sentar|levantar|deitar|subir|descer|entrar|sair|chegar|chamar|matar|cortar|abrir|fechar|lavar|cozinhar)$/i },
  { name: "Números", keywords: /^(um|uma|dois|duas|tr[êe]s|quatro|cinco|seis|sete|oito|nove|dez|onze|doze|treze|catorze|quatorze|quinze|dezesseis|dezessete|dezoito|dezenove|vinte|trinta|quarenta|cinquenta|cem|mil|primeiro|segundo|terceiro|n[úu]mero)$/i },
];

const FIXED_CATEGORIES = ["Todas", "Saudações", "Família", "Natureza", "Animais", "Corpo", "Alimentos", "Verbos", "Números", "Outros"];

function categorize(entry: Entry): string {
  if (entry.category && entry.category !== "Geral") return entry.category;
  const pt = entry.term_pt || "";
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.test(pt)) return rule.name;
  }
  return "Outros";
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function firstLetter(s: string): string {
  const c = (s || "").trim().charAt(0).toUpperCase();
  // normaliza acentos
  const norm = c.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return /[A-Z]/.test(norm) ? norm : "#";
}

function DictionaryPage() {
  const { t } = useTranslation();
  const { isPremium } = useSubscription();
  const lang = useLang();

  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string>("Todas");
  const [letter, setLetter] = useState<string>("Todas");
  const [sort, setSort] = useState<"az" | "za">("az");

  const [visibleCount, setVisibleCount] = useState(120);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQuery(query.trim()), 250);
    return () => window.clearTimeout(t);
  }, [query]);

  const entries = PDF_DICTIONARY_ENTRIES;

  const enriched = useMemo(
    () => entries.map((e) => ({ ...e, _cat: categorize(e), _letter: firstLetter(e.term_indigenous) })),
    [entries],
  );

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of enriched) m.set(e._cat, (m.get(e._cat) ?? 0) + 1);
    return m;
  }, [enriched]);

  const letterCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of enriched) m.set(e._letter, (m.get(e._letter) ?? 0) + 1);
    return m;
  }, [enriched]);

  const filtered = useMemo(() => {
    const q = debouncedQuery.toLowerCase().trim();
    const list = enriched.filter((e) => {
      const matchQ = !q || e.term_indigenous.toLowerCase().includes(q) || e.term_pt.toLowerCase().includes(q);
      const matchC = cat === "Todas" || e._cat === cat;
      const matchL = letter === "Todas" || e._letter === letter;
      return matchQ && matchC && matchL;
    });
    list.sort((a, b) => {
      const cmp = a.term_indigenous.localeCompare(b.term_indigenous, "pt", { sensitivity: "base" });
      return sort === "az" ? cmp : -cmp;
    });
    return list;
  }, [enriched, debouncedQuery, cat, letter, sort]);

  useEffect(() => {
    setVisibleCount(120);
  }, [query, cat, letter, sort]);

  const cap = isPremium ? visibleCount : Math.min(FREE_LIMIT, visibleCount);
  const visibleFiltered = useMemo(() => filtered.slice(0, cap), [filtered, cap]);

  const hasMore = isPremium ? filtered.length > visibleCount : filtered.length > FREE_LIMIT;
  const lockedByFree = !isPremium && filtered.length > FREE_LIMIT;

  // Auto-translate visible PT texts (term_pt + example) when UI is EN/ES.
  const ptTexts = useMemo(() => {
    const set = new Set<string>();
    for (const e of visibleFiltered) {
      if (e.term_pt) set.add(e.term_pt);
      if (e.example) set.add(e.example);
    }
    return Array.from(set);
  }, [visibleFiltered]);
  const translated = useAutoTranslate(ptTexts);
  const trMap = useMemo(() => {
    const m = new Map<string, string>();
    ptTexts.forEach((s, i) => m.set(s, translated[i] ?? s));
    return m;
  }, [ptTexts, translated]);
  const localize = (e: Entry, field: "term_pt" | "example"): string => {
    const original = (e[field] as string | null) ?? "";
    if (!original) return "";
    if (lang === "pt" || lang === "pat") return original;
    const dbVal = pickLang(e, field, lang);
    if (dbVal && dbVal !== original) return dbVal;
    return trMap.get(original) ?? original;
  };



  const grouped = useMemo(() => {
    const map = new Map<string, typeof visibleFiltered>();
    for (const e of visibleFiltered) {
      const k = (e as any)._letter as string;
      if (!map.has(k)) map.set(k, [] as any);
      (map.get(k) as any).push(e);
    }
    return Array.from(map.entries()).sort(([a], [b]) =>
      sort === "az" ? a.localeCompare(b) : b.localeCompare(a),
    );
  }, [visibleFiltered, sort]);

  return (
    <div className="min-h-screen pb-24 md:pb-12">
      <header className="sticky top-0 z-40 border-b border-gold/20 bg-[oklch(0.18_0.04_145/0.85)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 md:px-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-gold hover:underline">
            <ArrowLeft className="h-4 w-4" /> {t("common.voltar")}
          </Link>
          <div className="flex items-center gap-2 text-cream font-display font-black">
            <BookOpen className="h-5 w-5 text-leaf" /> {t("dictionary.title")}
          </div>
          <span className="w-14" />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 md:px-8">
        <section className="mt-6 card-elev rounded-2xl p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/50" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("dictionary.searchPlaceholder")}
              className="w-full rounded-xl border border-gold/25 bg-card/60 pl-10 pr-3 py-3 text-sm text-cream placeholder:text-foreground/40 focus:outline-none focus:border-gold/60"
            />
          </div>

          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {FIXED_CATEGORIES.map((c) => {
              const count = c === "Todas" ? enriched.length : counts.get(c) ?? 0;
              const active = cat === c;
              return (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold transition ${
                    active
                      ? "border-leaf bg-leaf text-forest-deep shadow-lg shadow-leaf/30"
                      : "border-gold/20 bg-card/60 text-foreground/75 hover:border-gold/40 hover:text-cream"
                  }`}
                >
                  {t(`dictionary.categories.${c}`)}
                  <span className={`ml-1.5 text-[10px] font-semibold ${active ? "opacity-70" : "opacity-50"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="text-xs font-semibold text-foreground/70">
              {t("dictionary.showing", {
                count: visibleFiltered.length,
                plus: hasMore ? "+" : "",
                words: t(visibleFiltered.length === 1 ? "dictionary.wordSingular" : "dictionary.wordPlural"),
              })}
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setSort("az")}
                className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-bold ${
                  sort === "az" ? "border-gold/60 bg-gold/20 text-gold" : "border-gold/15 bg-card/40 text-foreground/60"
                }`}
              >
                <ArrowDownAZ className="h-3 w-3" /> A-Z
              </button>
              <button
                onClick={() => setSort("za")}
                className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-bold ${
                  sort === "za" ? "border-gold/60 bg-gold/20 text-gold" : "border-gold/15 bg-card/40 text-foreground/60"
                }`}
              >
                <ArrowUpAZ className="h-3 w-3" /> Z-A
              </button>
            </div>
          </div>
        </section>

        <section className="mt-4 card-elev rounded-2xl p-3">
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
              const count = letterCounts.get(l) ?? 0;
              const active = letter === l;
              return (
                <button
                  key={l}
                  onClick={() => setLetter(l)}
                  className={`h-8 w-8 rounded-lg text-xs font-black transition ${
                    active
                      ? "bg-leaf text-forest-deep shadow-lg shadow-leaf/30"
                      : "bg-card/60 text-cream border border-gold/20 hover:border-gold/50"
                  }`}
                  title={t("dictionary.wordCount", {
                    count,
                    words: t(count === 1 ? "dictionary.wordSingular" : "dictionary.wordPlural"),
                  })}
                >
                  {l}
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-5">
          {filtered.length === 0 ? (
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
                      <article key={e.id} className="card-elev rounded-2xl p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-display text-xl font-black text-cream">{e.term_indigenous}</h3>
                              <PlayBtn text={e.term_indigenous} audioUrl={e.audio_url} />
                            </div>
                            <div className="mt-1 text-sm text-foreground/80">
                              <span className="text-gold">→</span> {pickLang(e, "term_pt", lang)}
                            </div>

                          </div>
                          <span className="shrink-0 chip-gold rounded-full px-2 py-0.5 text-[10px] font-bold">
                            {(e as any)._cat}
                          </span>
                        </div>

                        {e.pronunciation && (
                          <div className="mt-2 text-xs text-foreground/60">
                            {t("dictionary.pronunciation")}: <span className="text-cream">[{e.pronunciation}]</span>
                          </div>
                        )}
                        {e.example && (
                          <div className="mt-2 rounded-lg border border-gold/15 bg-card/40 px-3 py-2 text-xs italic text-foreground/80">
                            "{pickLang(e, "example", lang)}"
                          </div>
                        )}

                      </article>
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
          )}
        </section>
      </main>
    </div>
  );
}

function PlayBtn({ text, audioUrl }: { text: string; audioUrl: string | null }) {
  const speak = useServerFn(narratePublic);
  const [busy, setBusy] = useState(false);
  const cacheRef = useRef<string | null>(null);

  async function play() {
    if (busy) return;
    try {
      setBusy(true);
      if (audioUrl) {
        await playFast(audioUrl);
        return;
      }
      if (!cacheRef.current) {
        const r = await speak({ data: { text, voice: "onyx" } });
        if (r.error || !r.audio_base64) {
          throw new Error(r.message ?? "Não foi possível gerar o áudio");
        }
        cacheRef.current = base64ToBlobUrl(r.audio_base64, r.mime);
      }
      await playFast(cacheRef.current);
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao tocar áudio");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={play}
      disabled={busy}
      aria-label={`Ouvir ${text}`}
      className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-leaf/20 text-leaf hover:bg-leaf/30 disabled:opacity-50"
    >
      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Volume2 className="h-3.5 w-3.5" />}
    </button>
  );
}



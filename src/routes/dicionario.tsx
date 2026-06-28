import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Search, Volume2, ArrowLeft, BookOpen, ArrowDownAZ, ArrowUpAZ } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dicionario")({
  head: () => ({
    meta: [
      { title: "Dicionário Patxôhã — AWÃ TECH" },
      { name: "description", content: "Dicionário Patxôhã organizado por categorias: saudações, família, natureza, animais, corpo, alimentos, verbos e números." },
    ],
  }),
  component: DictionaryPage,
});

type Entry = {
  id: string;
  term_indigenous: string;
  term_pt: string;
  language: string;
  category: string;
  pronunciation: string | null;
  example: string | null;
  audio_url: string | null;
};

const ENABLED_LANGUAGES = ["Patxôhã"] as const;

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
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string>("Todas");
  const [letter, setLetter] = useState<string>("Todas");
  const [sort, setSort] = useState<"az" | "za">("az");

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["dictionary", ENABLED_LANGUAGES.join(",")],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dictionary")
        .select("*")
        .in("language", ENABLED_LANGUAGES as unknown as string[])
        .order("term_indigenous");
      if (error) throw error;
      return data as Entry[];
    },
  });

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
    const q = query.toLowerCase().trim();
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
  }, [enriched, query, cat, letter, sort]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const e of filtered) {
      const k = (e as any)._letter as string;
      if (!map.has(k)) map.set(k, [] as any);
      (map.get(k) as any).push(e);
    }
    return Array.from(map.entries()).sort(([a], [b]) =>
      sort === "az" ? a.localeCompare(b) : b.localeCompare(a),
    );
  }, [filtered, sort]);


  function playAudio(entry: Entry) {
    if (entry.audio_url) {
      new Audio(entry.audio_url).play().catch(() => toast.error("Áudio indisponível"));
      return;
    }
    if ("speechSynthesis" in window) {
      const u = new SpeechSynthesisUtterance(entry.term_indigenous);
      u.lang = "pt-BR";
      u.rate = 0.85;
      window.speechSynthesis.speak(u);
    } else {
      toast.info("Sem áudio cadastrado");
    }
  }

  return (
    <div className="min-h-screen pb-24 md:pb-12">
      <header className="sticky top-0 z-40 border-b border-gold/20 bg-[oklch(0.18_0.04_145/0.85)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 md:px-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-gold hover:underline">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
          <div className="flex items-center gap-2 text-cream font-display font-black">
            <BookOpen className="h-5 w-5 text-leaf" /> Dicionário Patxôhã
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
              placeholder="Buscar em português ou patxôhã..."
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
                  {c}
                  <span className={`ml-1.5 text-[10px] font-semibold ${active ? "opacity-70" : "opacity-50"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="text-xs font-semibold text-foreground/70">
              {filtered.length} palavra{filtered.length === 1 ? "" : "s"} encontrada{filtered.length === 1 ? "" : "s"}
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
              TODAS
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
                  title={`${count} palavra(s)`}
                >
                  {l}
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-5">
          {isLoading ? (
            <div className="text-center text-foreground/60 py-12">Carregando dicionário...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-foreground/60 py-12">Nenhuma palavra encontrada.</div>
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
                              <button
                                onClick={() => playAudio(e)}
                                className="grid h-8 w-8 place-items-center rounded-full bg-leaf/20 text-leaf hover:bg-leaf/30"
                                aria-label="Ouvir pronúncia"
                              >
                                <Volume2 className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="mt-1 text-sm text-foreground/80">
                              <span className="text-gold">→</span> {e.term_pt}
                            </div>
                          </div>
                          <span className="shrink-0 chip-gold rounded-full px-2 py-0.5 text-[10px] font-bold">
                            {(e as any)._cat}
                          </span>
                        </div>
                        {e.pronunciation && (
                          <div className="mt-2 text-xs text-foreground/60">
                            Pronúncia: <span className="text-cream">[{e.pronunciation}]</span>
                          </div>
                        )}
                        {e.example && (
                          <div className="mt-2 rounded-lg border border-gold/15 bg-card/40 px-3 py-2 text-xs italic text-foreground/80">
                            "{e.example}"
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}


import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Search, Volume2, ArrowLeft, BookOpen } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dicionario")({
  head: () => ({
    meta: [
      { title: "Dicionário — AWÃ TECH" },
      {
        name: "description",
        content:
          "Dicionário de palavras indígenas brasileiras com tradução, pronúncia, áudio e exemplos.",
      },
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

// Línguas habilitadas no momento. Para liberar outras línguas no futuro,
// basta adicionar aqui (ex.: "Tupi-Guarani", "Yanomami").
const ENABLED_LANGUAGES = ["Patxôhã"] as const;
const SINGLE_LANGUAGE = ENABLED_LANGUAGES.length === 1;

function DictionaryPage() {
  const [query, setQuery] = useState("");
  const [lang, setLang] = useState<string>(
    SINGLE_LANGUAGE ? ENABLED_LANGUAGES[0] : "Todas",
  );
  const [cat, setCat] = useState<string>("Todas");

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

  const languages = useMemo(
    () => (SINGLE_LANGUAGE ? [...ENABLED_LANGUAGES] : ["Todas", ...ENABLED_LANGUAGES]),
    [],
  );
  const categories = useMemo(
    () => ["Todas", ...Array.from(new Set(entries.map((e) => e.category))).sort()],
    [entries],
  );

  const filtered = entries.filter((e) => {
    const q = query.toLowerCase().trim();
    const matchQ =
      !q ||
      e.term_indigenous.toLowerCase().includes(q) ||
      e.term_pt.toLowerCase().includes(q);
    const matchL = lang === "Todas" || e.language === lang;
    const matchC = cat === "Todas" || e.category === cat;
    return matchQ && matchL && matchC;
  });

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
      <header className="sticky top-0 z-40 border-b border-gold/20 bg-[oklch(0.18_0.04_145/0.75)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 md:px-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-gold hover:underline">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
          <div className="flex items-center gap-2 text-cream font-display font-black">
            <BookOpen className="h-5 w-5 text-leaf" /> Dicionário AWÃ
          </div>
          <span className="w-14" />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 md:px-8">
        <section className="mt-8 text-center">
          <div className="tribal-border mx-auto w-20" />
          <h1 className="mt-3 font-display text-3xl font-black text-cream md:text-5xl">
            Palavras vivas
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-foreground/70">
            Explore termos de línguas indígenas brasileiras, com pronúncia, exemplos e áudio.
          </p>
        </section>

        <section className="mt-6 card-elev rounded-2xl p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/50" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar palavra (em português ou indígena)..."
              className="w-full rounded-xl border border-gold/25 bg-card/60 pl-10 pr-3 py-3 text-sm text-cream placeholder:text-foreground/40 focus:outline-none focus:border-gold/60"
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {!SINGLE_LANGUAGE && (
              <FilterGroup label="Língua" options={languages} value={lang} onChange={setLang} />
            )}
            <FilterGroup label="Categoria" options={categories} value={cat} onChange={setCat} />
          </div>
        </section>

        <section className="mt-6">
          {isLoading ? (
            <div className="text-center text-foreground/60 py-12">Carregando dicionário...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-foreground/60 py-12">
              Nenhuma palavra encontrada.
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {filtered.map((e) => (
                <article key={e.id} className="card-elev rounded-2xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-xl font-black text-cream">
                          {e.term_indigenous}
                        </h3>
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
                      {e.language}
                    </span>
                  </div>
                  {e.pronunciation && (
                    <div className="mt-2 text-xs text-foreground/60">
                      Pronúncia: <span className="text-cream">[{e.pronunciation}]</span>
                    </div>
                  )}
                  {e.example && (
                    <div className="mt-2 rounded-lg border border-gold/15 bg-card/40 px-3 py-2 text-xs italic text-foreground/80">
                      “{e.example}”
                    </div>
                  )}
                  <div className="mt-2 text-[10px] uppercase tracking-wider text-foreground/50">
                    {e.category}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function FilterGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto">
      <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/50 mr-1">
        {label}:
      </span>
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold transition ${
            value === o
              ? "border-gold/60 bg-gold/20 text-gold"
              : "border-gold/15 bg-card/40 text-foreground/70 hover:border-gold/30"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

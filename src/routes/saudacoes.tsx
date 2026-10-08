import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useRef, useEffect, useMemo } from "react";
import {
  ArrowLeft,
  Volume2,
  Loader2,
  Sparkles,
  Play,
  Pause,
  SkipForward,
  Radio,
  Search,
  Clock,
  BookOpen,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { narratePublic } from "@/lib/narrate-public.functions";
import { base64ToBlobUrl, playFast } from "@/lib/audio-play";
import { toast } from "sonner";
import { useLastArea } from "@/lib/last-area";
import { Pagination } from "@/components/education/pagination";
import { SiteHeader } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";

export const Route = createFileRoute("/saudacoes")({
  head: () => ({
    meta: [
      { title: "Saudações Patxôhã — AWÃ TECH" },
      {
        name: "description",
        content:
          "Aprenda todas as saudações em Patxôhã: bom dia, boa tarde, boa noite, agradecimentos e despedidas, com pronúncia e áudio.",
      },
    ],
  }),
  component: SaudacoesPage,
});

export type Saudacao = {
  id: string;
  term_pt: string;
  term_indigenous: string;
  pronunciation: string | null;
  example: string | null;
  audio_url: string | null;
};

export async function fetchSaudacoes(): Promise<Saudacao[]> {
  const { data, error } = await supabase
    .from("dictionary")
    .select("id,term_pt,term_indigenous,pronunciation,example,audio_url")
    .eq("category", "Saudações")
    .order("term_pt");
  if (error) throw error;

  data?.slice(0, 5).forEach((s) => {
    if (s.audio_url) {
      const a = new Audio();
      a.preload = "auto";
      a.src = s.audio_url;
    }
  });

  return (data ?? []) as Saudacao[];
}

export function pickByHour(list: Saudacao[]): Saudacao | null {
  if (!list.length) return null;
  const h = new Date().getHours();
  const match = (kw: string) =>
    list.find((s) => s.term_pt.toLowerCase().includes(kw.toLowerCase()));
  if (h >= 5 && h <= 11) return match("bom dia") ?? list[0];
  if (h >= 12 && h <= 17) return match("boa tarde") ?? list[0];
  return match("boa noite") ?? list[0];
}

export function parseExample(ex: string | null) {
  if (!ex) return { significado: "", uso: "", variantes: "" };
  const sig = ex.match(/Significado:\s*([^•]+)/i)?.[1]?.trim() ?? "";
  const uso = ex.match(/Uso:\s*([^•]+)/i)?.[1]?.trim() ?? "";
  const var_ = ex.match(/Variantes?\/?Formas?:\s*([^•]+)/i)?.[1]?.trim() ?? "";
  return { significado: sig, uso, variantes: var_ };
}

const CATEGORIES = ["Todas", "Cumprimentos", "Despedidas", "Agradecimentos"] as const;
type CategoryFilter = (typeof CATEGORIES)[number];

const PAGE_SIZE = 10;

function SaudacoesPage() {
  const backTo = useLastArea();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("Todas");
  const [page, setPage] = useState(1);

  const { data: list = [], isLoading } = useQuery({
    queryKey: ["saudacoes"],
    queryFn: fetchSaudacoes,
  });

  const hourPick = useMemo(() => pickByHour(list), [list]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return list.filter((s) => {
      const matchQ =
        !q ||
        s.term_indigenous.toLowerCase().includes(q) ||
        s.term_pt.toLowerCase().includes(q) ||
        (s.pronunciation && s.pronunciation.toLowerCase().includes(q));

      if (!matchQ) return false;

      if (category === "Todas") return true;
      const pt = s.term_pt.toLowerCase();
      if (category === "Cumprimentos") {
        return (
          pt.includes("bom dia") ||
          pt.includes("boa tarde") ||
          pt.includes("boa noite") ||
          pt.includes("olá") ||
          pt.includes("bem-vindo") ||
          pt.includes("tudo bem")
        );
      }
      if (category === "Despedidas") {
        return (
          pt.includes("adeus") ||
          pt.includes("tchau") ||
          pt.includes("até") ||
          pt.includes("logo") ||
          pt.includes("partir")
        );
      }
      if (category === "Agradecimentos") {
        return pt.includes("obrigad") || pt.includes("gratid") || pt.includes("agradec");
      }
      return true;
    });
  }, [list, query, category]);

  useEffect(() => {
    setPage(1);
  }, [query, category]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pagedList = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  return (
    <div className="min-h-screen bg-[#f7f6f2] text-[#1f2937]">
      <SiteHeader mode="adulto" />
      <header className="sticky top-0 z-30 border-b border-[#e8e4dc] bg-white/95 backdrop-blur-xl shadow-xs">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3.5 md:px-8">
          <Link
            to={backTo as "/"}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1b4332] hover:text-[#2d6a4f]"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
          <div className="flex items-center gap-2 font-display font-black text-sm md:text-base text-[#11231b]">
            <Sparkles className="h-4 w-4 text-[#1b4332]" /> Saudações em Patxôhã
          </div>
          <span className="w-14" />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-10">
        {/* Hero Section */}
        <section className="rounded-3xl border border-[#e8e4dc] bg-white p-6 md:p-10 shadow-xs">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e8e4dc] bg-[#fbfaf7] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#1b4332]">
                <Sparkles className="h-3 w-3 text-[#b47e28]" /> Vocabulário Ancestral
              </span>
              <h1 className="mt-3 font-display text-3xl md:text-4xl font-black text-[#11231b] tracking-tight">
                Saudações e Cumprimentos
              </h1>
              <p className="mt-2 text-sm md:text-base text-[#4b5563] leading-relaxed">
                Aprenda a cumprimentar, desejar bons momentos e agradecer no Patxôhã tradicional.
                Toque nos cards para ouvir a pronúncia de cada palavra.
              </p>
            </div>

            {hourPick && (
              <div className="rounded-2xl border border-[#1b4332]/20 bg-[#1b4332]/5 p-5 md:max-w-xs shrink-0">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#1b4332]">
                  <Clock className="h-3.5 w-3.5" /> Saudação para agora
                </div>
                <div className="mt-2 font-display text-xl font-black text-[#11231b]">
                  {hourPick.term_indigenous}
                </div>
                <div className="text-sm font-medium text-[#4b5563]">{hourPick.term_pt}</div>
                <div className="mt-3 flex items-center justify-between">
                  {hourPick.pronunciation && (
                    <span className="text-xs text-[#b47e28] font-semibold">🗣️ {hourPick.pronunciation}</span>
                  )}
                  <PlayBtn text={hourPick.term_indigenous} audioUrl={hourPick.audio_url} />
                </div>
              </div>
            )}
          </div>

          {/* Busca e filtros */}
          <div className="mt-8 space-y-3 pt-6 border-t border-[#f0eee6]">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar saudação por português ou Patxôhã..."
                className="w-full rounded-2xl border border-[#e8e4dc] bg-[#fbfaf7] pl-11 pr-4 py-3 text-sm font-medium text-[#11231b] placeholder:text-[#9ca3af] focus:border-[#1b4332] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1b4332] shadow-xs"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`rounded-full border px-3.5 py-1.5 text-xs font-bold transition shadow-xs ${
                      category === c
                        ? "border-[#1b4332] bg-[#1b4332] text-white"
                        : "border-[#e8e4dc] bg-white text-[#4b5563] hover:border-[#1b4332]/50 hover:text-[#11231b]"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <div className="text-xs font-medium text-[#6b7280]">
                {filtered.length} {filtered.length === 1 ? "resultado" : "resultados"}
              </div>
            </div>
          </div>
        </section>

        {/* Lista completa paginada */}
        <section className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl md:text-2xl font-black text-[#11231b] tracking-tight">
              Lista de saudações
            </h2>
            {totalPages > 1 && (
              <span className="text-xs font-medium text-[#6b7280]">
                Página {page} de {totalPages}
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-[#6b7280]">
              <Loader2 className="h-5 w-5 animate-spin text-[#1b4332]" /> Carregando saudações...
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-[#e8e4dc] bg-white p-12 text-center text-[#6b7280]">
              Nenhuma saudação encontrada com o termo "{query}".
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-3.5 sm:grid-cols-2">
                {pagedList.map((s) => (
                  <SaudacaoCard key={s.id} s={s} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="pt-4">
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
              )}
            </div>
          )}
        </section>
      </main>
      <SiteFooter mode="adulto" />
    </div>
  );
}

function SaudacaoCard({ s }: { s: Saudacao }) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-[#e8e4dc] bg-white p-5 shadow-xs transition hover:border-[#1b4332]/50 hover:shadow-sm">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="font-display text-xl font-black text-[#1b4332] break-words">
              {s.term_indigenous}
            </div>
            <div className="text-sm font-semibold text-[#11231b] break-words mt-0.5">
              {s.term_pt}
            </div>
            {s.pronunciation && (
              <div className="text-xs text-[#6b7280] mt-1.5 inline-flex items-center gap-1 font-medium">
                <span>🗣️</span>
                <span className="text-[#b47e28]">{s.pronunciation}</span>
              </div>
            )}
          </div>
          <PlayBtn text={s.term_indigenous} audioUrl={s.audio_url} />
        </div>
        <AkuaCard s={s} />
      </div>
    </div>
  );
}

function AkuaCard({ s, big = false }: { s: Saudacao; big?: boolean }) {
  const { significado, uso, variantes } = parseExample(s.example);
  if (!significado && !uso && !variantes) return null;
  return (
    <div className={`mt-3.5 rounded-xl border border-[#e8e4dc] bg-[#fbfaf7] p-3.5 space-y-1.5 ${big ? "text-sm" : "text-xs"}`}>
      {significado && (
        <p className="text-[#374151] leading-relaxed">
          <span className="text-[#1b4332] font-bold">💡 Significado: </span>
          {significado}
        </p>
      )}
      {uso && (
        <p className="text-[#4b5563] leading-relaxed">
          <span className="text-[#b47e28] font-bold">📍 Quando usar: </span>
          {uso}
        </p>
      )}
      {variantes && (
        <p className="text-[#4b5563] leading-relaxed">
          <span className="text-[#11231b] font-bold">🔄 Resposta/Variante: </span>
          {variantes}
        </p>
      )}
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

  async function prefetch() {
    if (audioUrl || cacheRef.current || busy) return;
    try {
      const r = await speak({ data: { text, voice: "onyx" } });
      if (r.audio_base64) {
        cacheRef.current = base64ToBlobUrl(r.audio_base64, r.mime);
      }
    } catch {}
  }

  return (
    <button
      onClick={play}
      onPointerEnter={prefetch}
      onFocus={prefetch}
      disabled={busy}
      aria-label={`Ouvir ${text}`}
      className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#1b4332]/10 text-[#1b4332] transition hover:bg-[#1b4332] hover:text-white disabled:opacity-50 shadow-xs"
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
    </button>
  );
}

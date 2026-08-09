import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useRef, useEffect, useMemo } from "react";
import { ArrowLeft, Volume2, Loader2, Sparkles, Play, Pause, SkipForward, Radio } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { narratePublic } from "@/lib/narrate-public.functions";
import { base64ToBlobUrl, playFast } from "@/lib/audio-play";
import { toast } from "sonner";
import { useLastArea } from "@/lib/last-area";
import { useTranslation } from "react-i18next";
import { speak } from "@/lib/speak";

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

function SaudacoesPage() {
  const backTo = useLastArea();
  const { i18n } = useTranslation();
  const { data: list = [], isLoading } = useQuery({
    queryKey: ["saudacoes"],
    queryFn: fetchSaudacoes,
  });

  useEffect(() => {
    const isKids = typeof backTo === "string" && backTo.includes("infantil");
    
    const timer = setTimeout(() => {
      const welcomeText = i18n.language === "en"
        ? "Hello! Let's learn our village greetings? How we say good morning, good afternoon and much more in Patxôhã!"
        : i18n.language === "es"
        ? "¡Hola! ¿Vamos a aprender los saludos de nuestra aldea? ¡Cómo decimos buenos días, buenas tardes e muito más en Patxôhã!"
        : "Olá! Vamos aprender as saudações da nossa aldeia? Como dizemos bom dia, boa tarde e muito mais em Patxôhã!";
      
      speak(welcomeText, i18n.language === "en" ? "en-US" : i18n.language === "es" ? "es-ES" : "pt-BR", 0.85, isKids ? 1.5 : 1.0);
    }, 1000);


    return () => clearTimeout(timer);
  }, [i18n.language, backTo]);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-gold/20 bg-[oklch(0.18_0.04_145/0.75)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3 md:px-8">
          <Link to={backTo as "/"} className="inline-flex items-center gap-2 text-sm font-semibold text-gold hover:underline">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
          <div className="flex items-center gap-2 font-display font-black text-cream">
            <Sparkles className="h-5 w-5 text-leaf" /> Saudações
          </div>
          <span className="w-14" />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 md:px-8 md:py-10">

        {/* Lista completa */}
        <section className="mt-8">
          <h2 className="font-display text-xl md:text-2xl font-black text-cream mb-4">
            Todas as saudações
          </h2>
          {isLoading ? (
            <div className="flex items-center gap-2 text-foreground/60">
              <Loader2 className="h-4 w-4 animate-spin" /> Carregando...
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {list.map((s) => (
                <SaudacaoCard key={s.id} s={s} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function LiveVideo({ list, loading }: { list: Saudacao[]; loading: boolean }) {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [source, setSource] = useState<"saudacoes" | "dicionario">("saudacoes");

  const { data: full = [] } = useQuery({
    queryKey: ["dict-patxoha-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dictionary")
        .select("id,term_pt,term_indigenous,pronunciation,example,audio_url")
        .limit(2000);
      if (error) throw error;
      return (data ?? []) as Saudacao[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const pool = useMemo(() => {
    const base = source === "saudacoes" ? list : full;
    return base.filter((w) => w.term_indigenous && w.term_pt);
  }, [source, list, full]);

  useEffect(() => {
    setIdx(0);
  }, [source, pool.length]);

  useEffect(() => {
    if (!playing || pool.length === 0) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % pool.length), 3500);
    return () => clearInterval(t);
  }, [playing, pool.length]);

  const current = pool[idx];

  return (
    <section className="relative overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-br from-forest-deep via-bark/60 to-forest-deep shadow-2xl">
      {/* Animated backdrop */}
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-leaf/30 blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-gold/20 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <div className="relative p-6 md:p-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-red-500/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-red-300">
            <Radio className="h-3.5 w-3.5 animate-pulse" /> Ao vivo — Patxôhã
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSource(source === "saudacoes" ? "dicionario" : "saudacoes")}
              className="rounded-full border border-gold/30 bg-forest-deep/40 px-3 py-1 text-xs font-semibold text-cream hover:bg-forest-deep/70"
            >
              {source === "saudacoes" ? "Só saudações" : "Dicionário completo"}
            </button>
          </div>
        </div>

        {loading || !current ? (
          <div className="flex h-56 items-center justify-center text-foreground/60">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div key={current.id} className="mt-6 min-h-[220px] animate-in fade-in zoom-in-95 duration-700">
            <p className="text-xs uppercase tracking-widest text-leaf/80 mb-2">Palavra {idx + 1} de {pool.length}</p>
            <h2 className="font-display text-5xl md:text-7xl font-black text-gold break-words leading-tight drop-shadow-lg">
              {current.term_indigenous}
            </h2>
            <p className="mt-3 text-xl md:text-2xl text-cream/95 break-words">{current.term_pt}</p>
            {current.pronunciation && (
              <p className="mt-2 text-sm md:text-base text-foreground/70">🗣️ {current.pronunciation}</p>
            )}
          </div>
        )}

        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={() => setPlaying((p) => !p)}
            className="grid h-12 w-12 place-items-center rounded-full bg-gold text-forest-deep shadow-lg hover:scale-105 transition"
            aria-label={playing ? "Pausar" : "Reproduzir"}
          >
            {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </button>
          <button
            onClick={() => setIdx((i) => (pool.length ? (i + 1) % pool.length : 0))}
            className="grid h-12 w-12 place-items-center rounded-full bg-leaf/30 text-cream hover:bg-leaf/50 transition"
            aria-label="Próxima"
          >
            <SkipForward className="h-5 w-5" />
          </button>
          {current && <PlayBtn text={current.term_indigenous} audioUrl={current.audio_url} />}
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-forest-deep/60">
          <div
            key={`${current?.id}-${playing}`}
            className="h-full bg-gradient-to-r from-leaf to-gold"
            style={{
              width: "100%",
              animation: playing ? "shrink 3.5s linear" : "none",
            }}
          />
        </div>
        <style>{`@keyframes shrink { from { width: 0% } to { width: 100% } }`}</style>
      </div>
    </section>
  );
}

function SaudacaoCard({ s }: { s: Saudacao }) {
  return (
    <div className="card-elev rounded-2xl p-4 border border-gold/15 min-w-0">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="font-display text-lg font-bold text-gold break-words">
            {s.term_indigenous}
          </div>
          <div className="text-sm text-cream/90 break-words">{s.term_pt}</div>
          {s.pronunciation && (
            <div className="text-xs text-foreground/60 mt-0.5 break-words">🗣️ {s.pronunciation}</div>
          )}
        </div>
        <PlayBtn text={s.term_indigenous} audioUrl={s.audio_url} />
      </div>
      <AkuaCard s={s} />
    </div>
  );
}

function AkuaCard({ s, big = false }: { s: Saudacao; big?: boolean }) {
  const { significado, uso, variantes } = parseExample(s.example);
  if (!significado && !uso && !variantes) return null;
  return (
    <div className={`mt-3 rounded-xl border border-leaf/20 bg-forest-deep/30 p-3 ${big ? "text-sm" : "text-xs"}`}>
      {significado && (
        <p className="text-foreground/85"><span className="text-leaf font-bold">💡 Significado: </span>{significado}</p>
      )}
      {uso && (
        <p className="text-foreground/75 mt-1"><span className="text-gold font-bold">📍 Quando usar: </span>{uso}</p>
      )}
      {variantes && (
        <p className="text-foreground/75 mt-1"><span className="text-cream font-bold">🔄 Resposta/Variante: </span>{variantes}</p>
      )}
    </div>
  );
}

function PlayBtn({ text, audioUrl }: { text: string; audioUrl: string | null }) {
  const speakFn = useServerFn(narratePublic);
  const backTo = useLastArea();
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
        const isKids = typeof backTo === "string" && backTo.includes("infantil");
        const r = await speakFn({ data: { text, voice: isKids ? "nova" : "onyx" } });
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
      className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-leaf/20 text-leaf hover:bg-leaf/30 disabled:opacity-50"
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
    </button>
  );
}

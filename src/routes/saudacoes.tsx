import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useRef } from "react";
import { ArrowLeft, Volume2, Loader2, Sun, Sunset, Moon, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { speakText } from "@/lib/tts.functions";
import { toast } from "sonner";

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
  const { data: list = [], isLoading } = useQuery({
    queryKey: ["saudacoes"],
    queryFn: fetchSaudacoes,
  });

  const atual = pickByHour(list);
  const h = new Date().getHours();
  const periodo =
    h >= 5 && h <= 11
      ? { label: "Bom dia", Icon: Sun }
      : h >= 12 && h <= 17
        ? { label: "Boa tarde", Icon: Sunset }
        : { label: "Boa noite", Icon: Moon };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-gold/20 bg-[oklch(0.18_0.04_145/0.75)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3 md:px-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-gold hover:underline">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
          <div className="flex items-center gap-2 font-display font-black text-cream">
            <Sparkles className="h-5 w-5 text-leaf" /> Saudações
          </div>
          <span className="w-14" />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 md:px-8 md:py-10">
        {/* Saudação do momento */}
        {atual && (
          <section className="card-elev rounded-3xl p-6 md:p-8 bg-gradient-to-br from-forest-deep/60 to-bark/40 border border-gold/30">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-leaf">
              <periodo.Icon className="h-4 w-4" /> Saudação do momento — {periodo.label}
            </div>
            <h1 className="mt-3 font-display text-4xl md:text-5xl font-black text-gold">
              {atual.term_indigenous}
            </h1>
            <p className="mt-1 text-cream/90 text-lg">{atual.term_pt}</p>
            {atual.pronunciation && (
              <p className="mt-1 text-sm text-foreground/70">🗣️ {atual.pronunciation}</p>
            )}
            <AkuaCard s={atual} big />
          </section>
        )}

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
  const speak = useServerFn(speakText);
  const [busy, setBusy] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cacheRef = useRef<string | null>(null);

  async function play() {
    if (busy) return;
    try {
      setBusy(true);
      if (audioUrl) {
        const a = new Audio(audioUrl);
        audioRef.current?.pause();
        audioRef.current = a;
        await a.play();
        return;
      }
      if (!cacheRef.current) {
        const r = await speak({ data: { text, voice: "nova" } });
        cacheRef.current = `data:${r.mime};base64,${r.audio_base64}`;
      }
      const a = new Audio(cacheRef.current);
      audioRef.current?.pause();
      audioRef.current = a;
      await a.play();
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

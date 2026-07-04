import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getPaddleEnvironment } from "@/lib/paddle";
import { translateText } from "@/lib/translate.functions";
import { speakText } from "@/lib/tts.functions";
import { transcribeAudio } from "@/lib/transcribe.functions";
import { translateAllContent } from "@/lib/translate-content.functions";
import { Languages, Volume2, Mic, Loader2, Globe } from "lucide-react";
import { toast } from "sonner";

export function ToolsAdmin() {
  const translate = useServerFn(translateText);
  const speak = useServerFn(speakText);
  const transcribe = useServerFn(transcribeAudio);
  const translateAll = useServerFn(translateAllContent);


  // Translate
  const [txt, setTxt] = useState("");
  const [dir, setDir] = useState<"pt-pat" | "pat-pt">("pt-pat");
  const [trOut, setTrOut] = useState<{ traducao: string; literal?: string; nota?: string } | null>(null);
  const [trBusy, setTrBusy] = useState(false);

  // TTS
  const [ttsTxt, setTtsTxt] = useState("");
  const [ttsUrl, setTtsUrl] = useState<string | null>(null);
  const [ttsBusy, setTtsBusy] = useState(false);

  // STT
  const [sttBusy, setSttBusy] = useState(false);
  const [sttText, setSttText] = useState("");

  // Bulk translate content
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkResult, setBulkResult] = useState<Record<string, { updated: number; skipped: number }> | null>(null);
  const [bulkForce, setBulkForce] = useState(false);

  async function onTranslateAll() {
    setBulkBusy(true);
    setBulkResult(null);
    try {
      const r = await translateAll({ data: { force: bulkForce } });
      setBulkResult(r.summary);
      toast.success("Conteúdo traduzido e salvo no banco.");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBulkBusy(false);
    }
  }


  async function onTranslate() {
    setTrBusy(true);
    setTrOut(null);
    try {
      const r = await translate({ data: { text: txt, direction: dir, environment: getPaddleEnvironment() } });
      setTrOut(r);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setTrBusy(false);
    }
  }

  async function onSpeak() {
    setTtsBusy(true);
    try {
      const r = await speak({ data: { text: ttsTxt, environment: getPaddleEnvironment() } });
      setTtsUrl(`data:${r.mime};base64,${r.audio_base64}`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setTtsBusy(false);
    }
  }

  async function onTranscribe(file: File) {
    setSttBusy(true);
    setSttText("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("environment", getPaddleEnvironment());
      const r = await transcribe({ data: fd });
      setSttText(r.text);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSttBusy(false);
    }
  }

  const card = "card-elev rounded-2xl p-5 space-y-3";
  const input =
    "w-full rounded-xl border border-gold/25 bg-card/60 px-3 py-2 text-sm text-cream outline-none focus:border-gold/60";
  const btn =
    "inline-flex items-center gap-2 rounded-xl bg-[var(--gradient-leaf)] px-4 py-2 text-sm font-semibold text-cream disabled:opacity-50";

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Translate */}
      <section className={card}>
        <h2 className="flex items-center gap-2 font-display text-lg font-black text-cream">
          <Languages className="h-5 w-5 text-gold" /> Tradução PT ↔ Patxôhã
        </h2>
        <div className="flex gap-2 text-xs">
          <button
            onClick={() => setDir("pt-pat")}
            className={`rounded-full px-3 py-1 ${dir === "pt-pat" ? "bg-gold/20 text-gold" : "text-foreground/60"}`}
          >
            PT → Patxôhã
          </button>
          <button
            onClick={() => setDir("pat-pt")}
            className={`rounded-full px-3 py-1 ${dir === "pat-pt" ? "bg-gold/20 text-gold" : "text-foreground/60"}`}
          >
            Patxôhã → PT
          </button>
        </div>
        <textarea
          value={txt}
          onChange={(e) => setTxt(e.target.value)}
          rows={3}
          className={input}
          placeholder="Digite o texto..."
        />
        <button onClick={onTranslate} disabled={trBusy || !txt.trim()} className={btn}>
          {trBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Languages className="h-4 w-4" />} Traduzir
        </button>
        {trOut && (
          <div className="space-y-2 rounded-xl border border-gold/20 bg-bg/40 p-3 text-sm">
            <p className="font-semibold text-cream">{trOut.traducao}</p>
            {trOut.literal && <p className="text-xs text-foreground/70">Literal: {trOut.literal}</p>}
            {trOut.nota && <p className="text-xs italic text-gold/80">{trOut.nota}</p>}
          </div>
        )}
      </section>

      {/* TTS */}
      <section className={card}>
        <h2 className="flex items-center gap-2 font-display text-lg font-black text-cream">
          <Volume2 className="h-5 w-5 text-gold" /> Pronúncia (TTS)
        </h2>
        <textarea
          value={ttsTxt}
          onChange={(e) => setTtsTxt(e.target.value)}
          rows={3}
          className={input}
          placeholder="Texto para gerar áudio..."
        />
        <button onClick={onSpeak} disabled={ttsBusy || !ttsTxt.trim()} className={btn}>
          {ttsBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />} Gerar áudio
        </button>
        {ttsUrl && <audio controls src={ttsUrl} className="w-full" />}
      </section>

      {/* STT */}
      <section className={`${card} md:col-span-2`}>
        <h2 className="flex items-center gap-2 font-display text-lg font-black text-cream">
          <Mic className="h-5 w-5 text-gold" /> Transcrição de áudio (Whisper)
        </h2>
        <p className="text-xs text-foreground/60">
          Envie um MP3/WAV/WEBM (até 24MB) para gerar a letra automaticamente.
        </p>
        <input
          type="file"
          accept="audio/*"
          disabled={sttBusy}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onTranscribe(f);
          }}
          className="text-sm text-foreground/80 file:mr-3 file:rounded-lg file:border-0 file:bg-gold/20 file:px-3 file:py-2 file:text-gold"
        />
        {sttBusy && (
          <p className="flex items-center gap-2 text-sm text-gold">
            <Loader2 className="h-4 w-4 animate-spin" /> Transcrevendo...
          </p>
        )}
        {sttText && (
          <textarea
            readOnly
            rows={6}
            value={sttText}
            className={input}
          />
        )}
      </section>
    </div>
  );
}

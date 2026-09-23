import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, FolderOpen, Play, Quote, Square, Volume2, ZoomIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { speak, stopSpeak } from "@/lib/speak";
import {
  INTERCAMBIO_CHAPTERS,
  INTERCAMBIO_GALLERY,
  INTERCAMBIO_GALLERY_NOTES,
  INTERCAMBIO_OPENING,
  PHOTOS,
  type Photo,
} from "@/lib/aldeia-velha-content";

export function IntercambioStory({ onZoom }: { onZoom: (p: Photo) => void }) {
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [auto, setAuto] = useState(true);
  const [folderOpen, setFolderOpen] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const total = INTERCAMBIO_CHAPTERS.length;
  const chapter = INTERCAMBIO_CHAPTERS[step];

  useEffect(() => stopSpeak, []);

  function listen(id: string, text: string) {
    stopSpeak();
    if (speakingId === id) {
      setSpeakingId(null);
      return;
    }
    setSpeakingId(id);
    speak(text, "pt-BR", 0.95, undefined, () => setSpeakingId(null));
  }


  useEffect(() => {
    if (!started || !auto) return;
    const id = window.setTimeout(() => {
      setStep((s) => (s + 1 < total ? s + 1 : s));
    }, 11000);
    return () => window.clearTimeout(id);
  }, [started, auto, step, total]);

  if (!started) {
    return (
      <div className="card-elev overflow-hidden rounded-3xl">
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          <img
            src={PHOTOS.jogosInfanto.src}
            alt={PHOTOS.jogosInfanto.alt}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.14_0.04_145/0.95)] via-[oklch(0.14_0.04_145/0.5)] to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5 md:p-8">
            <p className="flex max-w-2xl items-start gap-2 font-display text-lg font-bold leading-snug text-cream md:text-2xl">
              <Quote className="mt-1 h-5 w-5 shrink-0 text-gold" />
              {INTERCAMBIO_OPENING}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between md:p-6">
          <p className="max-w-xl text-[14px] leading-relaxed text-foreground/75">
            Uma experiência guiada em {total} momentos: as fotos avançam junto com a narrativa do
            intercâmbio.
          </p>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button
              onClick={() => {
                setStep(0);
                setStarted(true);
              }}
              className="rounded-full bg-gold px-6 py-5 text-sm font-bold uppercase tracking-[0.14em] text-forest-deep hover:brightness-110"
            >
              <Play className="mr-2 h-4 w-4" /> Começar a história
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setStarted(true);
                setFolderOpen(true);
              }}
              className="rounded-full border border-gold/35 px-5 py-5 text-sm font-bold uppercase tracking-[0.14em] text-gold"
            >
              <FolderOpen className="mr-2 h-4 w-4" /> Pasta de fotos
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="card-elev overflow-hidden rounded-3xl">
        <div className="grid gap-0 md:grid-cols-2">
          <button
            type="button"
            onClick={() => onZoom(chapter.photo)}
            aria-label={`Ampliar foto: ${chapter.photo.caption}`}
            className="relative aspect-[4/3] w-full overflow-hidden md:aspect-auto md:h-full"
          >
            <img
              key={chapter.photo.src}
              src={chapter.photo.src}
              alt={chapter.photo.alt}
              loading="lazy"
              decoding="async"
              className="h-full w-full animate-in fade-in duration-700 object-cover"
            />
            <span className="absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full border border-gold/40 bg-[oklch(0.14_0.04_145/0.75)] text-gold backdrop-blur-sm">
              <ZoomIn className="h-4 w-4" />
            </span>
          </button>

          <div className="flex flex-col justify-center gap-3 p-5 md:p-8">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold/85">
              Momento {step + 1} de {total}
            </span>
            <h3 className="font-display text-xl font-black leading-tight text-cream md:text-3xl">
              <span className="mr-2">{chapter.emoji}</span>
              {chapter.title}
            </h3>
            <div className="space-y-3">
              {chapter.paragraphs.map((p) => (
                <p key={p} className="text-[14.5px] leading-relaxed text-foreground/82">
                  {p}
                </p>
              ))}
            </div>
            <p className="text-[12.5px] italic text-foreground/60">{chapter.photo.caption}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-gold/15 px-4 py-3 md:px-6">
          <Button
            variant="ghost"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="rounded-full text-foreground/80"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Anterior
          </Button>
          <Button
            variant="ghost"
            onClick={() => setAuto((a) => !a)}
            className="rounded-full text-foreground/80"
          >
            {auto ? "Pausar sequência" : "Retomar sequência"}
          </Button>
          <Button
            variant="ghost"
            onClick={() => setFolderOpen((v) => !v)}
            aria-expanded={folderOpen}
            className="rounded-full border border-gold/30 text-gold"
          >
            <FolderOpen className="mr-1.5 h-4 w-4" />
            {folderOpen ? "Fechar pasta" : `Pasta de fotos (${INTERCAMBIO_GALLERY.length})`}
          </Button>
          {step + 1 < total ? (
            <Button
              onClick={() => setStep((s) => Math.min(total - 1, s + 1))}
              className="ml-auto rounded-full bg-gold text-forest-deep hover:brightness-110"
            >
              Próximo <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={() => {
                setStep(0);
                setStarted(false);
              }}
              className="ml-auto rounded-full bg-gold text-forest-deep hover:brightness-110"
            >
              <Play className="mr-1.5 h-4 w-4" /> Ver de novo
            </Button>
          )}
        </div>

        <div className="flex gap-1.5 px-4 pb-4 md:px-6">
          {INTERCAMBIO_CHAPTERS.map((c, i) => (
            <button
              key={c.id}
              type="button"
              aria-label={`Ir para: ${c.title}`}
              onClick={() => setStep(i)}
              className={`h-1.5 flex-1 rounded-full transition ${
                i <= step ? "bg-gold" : "bg-gold/20"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="card-elev overflow-hidden rounded-2xl">
        <button
          type="button"
          onClick={() => setFolderOpen((v) => !v)}
          aria-expanded={folderOpen}
          className="flex w-full items-center gap-3 px-5 py-4 text-left"
        >
          <FolderOpen className="h-5 w-5 shrink-0 text-gold" />
          <span className="min-w-0 flex-1">
            <span className="block truncate font-display text-lg font-black text-cream">
              Pasta de fotos — Intercâmbio
            </span>
            <span className="block text-[12.5px] text-foreground/65">
              {INTERCAMBIO_GALLERY.length} fotos e {INTERCAMBIO_GALLERY_NOTES.length} momentos
            </span>
          </span>
          <ArrowRight
            className={`h-4 w-4 shrink-0 text-gold transition-transform ${folderOpen ? "rotate-90" : ""}`}
          />
        </button>

        {folderOpen && (
          <div className="border-t border-gold/15 p-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {INTERCAMBIO_GALLERY.map((ph) => (
                <figure key={ph.src} className="overflow-hidden rounded-xl border border-gold/15">
                  <button
                    type="button"
                    onClick={() => onZoom(ph)}
                    aria-label={`Ampliar foto: ${ph.caption}`}
                    className="relative block w-full"
                  >
                    <img
                      src={ph.src}
                      alt={ph.alt}
                      loading="lazy"
                      decoding="async"
                      className="aspect-[4/3] w-full object-cover"
                    />
                    <span className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full border border-gold/40 bg-[oklch(0.14_0.04_145/0.75)] text-gold backdrop-blur-sm">
                      <ZoomIn className="h-3.5 w-3.5" />
                    </span>
                  </button>
                  <figcaption className="px-3 py-2 text-[12.5px] leading-snug text-foreground/70">
                    {ph.caption}
                  </figcaption>
                </figure>
              ))}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {INTERCAMBIO_GALLERY_NOTES.map((n, i) => (
                <div key={n.title} className="rounded-xl border border-gold/15 p-3">
                  <p className="text-[13px] font-bold text-gold/90">
                    {i + 1}. {n.title}
                  </p>
                  <p className="mt-1 text-[13px] leading-relaxed text-foreground/75">{n.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

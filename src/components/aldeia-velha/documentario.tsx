import { useRef, useState } from "react";
import { Film, Play, Maximize2 } from "lucide-react";

import { INTERCAMBIO_DOCUMENTARIO } from "@/lib/aldeia-velha-content";

export function IntercambioDocumentario() {
  const [playing, setPlaying] = useState(false);
  const frameWrapRef = useRef<HTMLDivElement>(null);
  const doc = INTERCAMBIO_DOCUMENTARIO;

  // Autoplay assim que o usuário toca no vídeo
  const autoplaySrc = doc.embedUrl.includes("?")
    ? `${doc.embedUrl}&autoplay=1`
    : `${doc.embedUrl}?autoplay=1`;

  function goFullscreen() {
    const el = frameWrapRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen?.();
      return;
    }
    void el.requestFullscreen?.();
  }

  return (
    <section aria-labelledby="documentario-intercambio" className="card-elev overflow-hidden rounded-2xl">
      <header className="flex items-start gap-3 px-5 pt-5">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gold/35 text-gold">
          <Film className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h2
            id="documentario-intercambio"
            className="font-display text-xl font-black leading-tight text-cream md:text-2xl"
          >
            {doc.title}
          </h2>
          <p className="mt-1 text-[13.5px] leading-relaxed text-foreground/75">{doc.description}</p>
        </div>
      </header>

      <div className="p-5">
        <div
          ref={frameWrapRef}
          className="relative aspect-video w-full overflow-hidden rounded-xl border border-gold/20 bg-black"
        >
          {playing ? (
            <>
              <iframe
                src={autoplaySrc}
                title={doc.title}
                allow="autoplay; fullscreen"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
              <button
                type="button"
                onClick={goFullscreen}
                aria-label="Aumentar a tela"
                className="absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full border border-gold/45 bg-[oklch(0.14_0.04_145/0.8)] px-3 py-1.5 text-[12px] font-bold uppercase tracking-[0.12em] text-gold backdrop-blur-sm hover:brightness-110"
              >
                <Maximize2 className="h-3.5 w-3.5" /> Aumentar tela
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              aria-label={`Assistir: ${doc.title}`}
              className="group absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_center,oklch(0.24_0.06_150/0.85),oklch(0.10_0.03_150/0.95))]"
            >
              <span className="grid h-16 w-16 place-items-center rounded-full border border-gold/50 bg-black/40 text-gold transition-transform group-hover:scale-110 md:h-20 md:w-20">
                <Play className="h-7 w-7 md:h-8 md:w-8" />
              </span>
              <span className="absolute bottom-4 left-0 right-0 px-4 text-center text-[12.5px] font-semibold uppercase tracking-[0.18em] text-gold/85">
                Toque para assistir
              </span>
            </button>
          )}
        </div>

        <p className="mt-3 flex items-center justify-center gap-2 text-center text-[12px] text-foreground/60">
          <Maximize2 className="h-3.5 w-3.5 text-gold/80" />
          Toque no vídeo para começar e use “Aumentar tela” para assistir em tela inteira.
        </p>
      </div>
    </section>
  );
}

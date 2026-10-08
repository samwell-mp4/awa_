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
    <section aria-labelledby="documentario-intercambio" className="rounded-3xl border border-[#e8e4dc] bg-white shadow-xs overflow-hidden">
      <header className="flex items-start gap-3.5 px-6 pt-6">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#e8e4dc] bg-[#fbfaf7] text-[#1b4332] shadow-xs">
          <Film className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h2
            id="documentario-intercambio"
            className="font-display text-xl md:text-2xl font-black leading-tight text-[#11231b]"
          >
            {doc.title}
          </h2>
          <p className="mt-1 text-sm text-[#4b5563] leading-relaxed">{doc.description}</p>
        </div>
      </header>

      <div className="p-6">
        <div
          ref={frameWrapRef}
          className="relative aspect-video w-full overflow-hidden rounded-2xl border border-[#e8e4dc] bg-black shadow-sm"
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
                className="absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-black/60 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-sm hover:bg-black/80"
              >
                <Maximize2 className="h-3.5 w-3.5" /> Aumentar tela
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              aria-label={`Assistir: ${doc.title}`}
              className="group absolute inset-0 grid place-items-center bg-gradient-to-t from-black/80 via-black/40 to-transparent"
            >
              <span className="grid h-16 w-16 place-items-center rounded-full bg-[#1b4332] text-white shadow-lg transition-transform group-hover:scale-110 md:h-20 md:w-20">
                <Play className="h-7 w-7 ml-1 fill-current md:h-8 md:w-8" />
              </span>
              <span className="absolute bottom-5 left-0 right-0 px-4 text-center text-xs font-bold uppercase tracking-wider text-white">
                Toque para assistir o documentário
              </span>
            </button>
          )}
        </div>

        <p className="mt-3 flex items-center justify-center gap-2 text-center text-xs text-[#6b7280]">
          <Maximize2 className="h-3.5 w-3.5 text-[#1b4332]" />
          Toque no vídeo para começar e use “Aumentar tela” para assistir em tela cheia.
        </p>
      </div>
    </section>
  );
}

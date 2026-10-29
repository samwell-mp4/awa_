import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Volume2, VolumeX, Maximize2, Sparkles, ChevronRight, Play, Film, X } from "lucide-react";
import { useDailyVideo } from "@/hooks/use-home-data";
import menuVideo from "@/assets/infantil-menu-video.mp4.asset.json";

export function BilingualVideoCard() {
  const { data: dailyVideo } = useDailyVideo();
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const videoCardRef = useRef<HTMLVideoElement>(null);

  const videoUrl = dailyVideo?.video_url || menuVideo.url;
  const title = dailyVideo?.title || "Saudações em Pataxó com Professor Awuá";
  const description =
    dailyVideo?.description ||
    "Aprenda as primeiras palavras de cumprimento da floresta de forma interativa.";

  useEffect(() => {
    if (videoCardRef.current) {
      videoCardRef.current.muted = isVideoMuted;
    }
  }, [isVideoMuted]);

  return (
    <section className="mt-6">
      <div className="card-elev rounded-3xl border border-gold/25 bg-gradient-to-br from-forest-deep/80 via-card/90 to-forest/30 p-5 md:p-6 shadow-xl relative overflow-hidden backdrop-blur-md">
        {/* Ambient Top Glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-gold/10 blur-3xl"
        />

        <div className="relative z-10 flex flex-col justify-between">
          <div>
            {/* Header badges */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="rounded-full bg-emerald-500/15 border border-emerald-500/40 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-300 shadow-sm flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-emerald-400" />
                Atividade Recomendada
              </span>
              <span className="text-xs font-bold text-gold flex items-center gap-1">
                <Film className="h-3.5 w-3.5" />
                Vídeo Bilíngue
              </span>
            </div>

            {/* Title & Description */}
            <h3 className="font-display text-xl sm:text-2xl font-black text-cream tracking-tight">
              {title}
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-foreground/75 font-medium leading-relaxed">
              {description}
            </p>

            {/* Video Player Card */}
            <div className="relative mt-4 aspect-video w-full overflow-hidden rounded-2xl border border-gold/30 bg-black shadow-lg group">
              <video
                ref={videoCardRef}
                src={videoUrl}
                autoPlay
                loop
                muted={isVideoMuted}
                playsInline
                className="h-full w-full object-cover"
              />

              {/* Top-Left Live Badge */}
              <div className="pointer-events-none absolute top-3 left-3 flex items-center gap-2 rounded-full bg-black/75 backdrop-blur-md px-3 py-1 text-[11px] font-black uppercase tracking-wider text-emerald-300 border border-emerald-500/40 shadow">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Em Loop • Professor Awuá</span>
              </div>

              {/* Bottom-Right Overlay Controls */}
              <div className="absolute bottom-3 right-3 flex items-center gap-2 z-10">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsVideoMuted((prev) => !prev);
                  }}
                  className="flex items-center gap-1.5 rounded-full bg-black/80 hover:bg-black backdrop-blur-md px-3.5 py-1.5 text-xs font-black text-gold border border-gold/40 shadow-lg transition active:scale-95 cursor-pointer"
                  title={isVideoMuted ? "Ativar som do vídeo" : "Silenciar vídeo"}
                >
                  {isVideoMuted ? (
                    <>
                      <VolumeX className="h-4 w-4 text-amber-300" />
                      <span>Ativar Som</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-4 w-4 text-emerald-400" />
                      <span className="text-emerald-300">Com Som</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShowVideoModal(true)}
                  className="grid h-8 w-8 place-items-center rounded-full bg-black/80 hover:bg-black backdrop-blur-md text-gold border border-gold/40 shadow-lg transition active:scale-95 cursor-pointer"
                  title="Abrir em tela cheia"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Cultural Snippet */}
          <div className="mt-4 flex items-center justify-between pt-3 border-t border-gold/15 flex-wrap gap-2">
            <div className="text-xs text-gold font-bold flex items-center gap-1.5">
              <span>🗣️</span>
              <span>Awê! = Olá! Seja bem-vindo à nossa língua.</span>
            </div>

            <Link
              to="/saudacoes"
              className="inline-flex items-center gap-1 text-xs font-bold text-cream/90 hover:text-gold transition"
            >
              <span>Praticar Saudações</span>
              <ChevronRight className="h-4 w-4 text-gold" />
            </Link>
          </div>
        </div>
      </div>

      {/* Modal Tela Cheia */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            onClick={() => setShowVideoModal(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-3xl overflow-hidden rounded-3xl border border-gold/40 bg-[oklch(0.14_0.04_145)] shadow-2xl">
            <div className="flex items-center justify-between border-b border-gold/20 px-5 py-3.5 bg-black/40">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-display font-black text-cream text-base sm:text-lg">
                  {title}
                </span>
              </div>
              <button
                onClick={() => setShowVideoModal(false)}
                className="grid h-8 w-8 place-items-center rounded-full border border-gold/30 bg-card/60 text-cream hover:bg-gold/20 transition"
                aria-label="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="aspect-video w-full bg-black">
              <video
                src={videoUrl}
                controls
                autoPlay
                playsInline
                className="h-full w-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

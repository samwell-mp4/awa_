import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft,
  Music,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  X,
  MapPin,
} from "lucide-react";
import { PremiumGate } from "@/components/PremiumGate";
import { pickLang, useLang } from "@/lib/pick-lang";
import { useLastArea } from "@/lib/last-area";
import { computeLyricBounds, activeLineIndex, resolveDuration } from "@/lib/lyric-sync";

export const Route = createFileRoute("/musicas")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Cânticos Sagrados — AWÃ TECH" },
      { name: "description", content: "Cânticos em Patxôhã com legendas bilíngues (Premium)." },
    ],
  }),
  component: () => (
    <PremiumGate title="Cânticos completos (Premium)" description="Assine para ouvir todos os cânticos com legendas bilíngues e vídeos imersivos.">
      <MusicasPage />
    </PremiumGate>
  ),
});

type Song = {
  id: string;
  title: string;
  artist: string | null;
  language: string;
  audio_url: string;
  cover_url: string | null;
  video_url: string | null;
  ambient_video_id: string | null;
  lyrics_indigenous: string;
  lyrics_pt: string;
  description: string | null;
  aldeia: string | null;
  title_en?: string | null;
  title_es?: string | null;
  artist_en?: string | null;
  artist_es?: string | null;
  description_en?: string | null;
  description_es?: string | null;
  lyrics_pt_en?: string | null;
  lyrics_pt_es?: string | null;
  duration_seconds?: number | null;
  sync_offsets?: number[] | null;
};


type Ambient = { id: string; name: string; video_url: string };

const ALDEIAS = ["Todas", "Aldeia Velha", "Barra Velha", "Coroa Vermelha", "Jaqueira", "Boca da Mata"] as const;

function MusicasPage() {
  const backTo = useLastArea();
  const { data: songs = [] } = useQuery({
    queryKey: ["songs_public"],
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60 * 6,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("songs")
        .select("id,title,artist,language,audio_url,cover_url,video_url,ambient_video_id,lyrics_indigenous,lyrics_pt,description,aldeia,title_en,title_es,artist_en,artist_es,description_en,description_es,lyrics_pt_en,lyrics_pt_es,duration_seconds,sync_offsets")
        .eq("is_active", true)
        .order("order_index")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Song[];
    },
  });
  const { data: ambients = [] } = useQuery({
    queryKey: ["ambient_videos"],
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 6,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ambient_videos")
        .select("id,name,video_url");
      if (error) throw error;
      return data as Ambient[];
    },
  });

  const ambientMap = useMemo(() => Object.fromEntries(ambients.map((a) => [a.id, a])), [ambients]);
  const [playing, setPlaying] = useState<Song | null>(null);
  const [aldeia, setAldeia] = useState<(typeof ALDEIAS)[number]>("Todas");
  const filteredSongs = useMemo(
    () => (aldeia === "Todas" ? songs : songs.filter((s) => s.aldeia === aldeia)),
    [songs, aldeia],
  );
  const soundCloudWidgetsRef = useRef<Record<string, any>>({});

  useEffect(() => {
    const hasSoundCloud = songs.some((song) => scEmbed(song.audio_url));
    if (!hasSoundCloud || (window as any).SC?.Widget) return;
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://w.soundcloud.com/player/api.js"]',
    );
    if (existing) return;
    const script = document.createElement("script");
    script.src = "https://w.soundcloud.com/player/api.js";
    script.async = true;
    document.body.appendChild(script);
  }, [songs]);

  const pauseSoundCloudWidgets = () => {
    Object.values(soundCloudWidgetsRef.current).forEach((widget) => {
      try {
        widget?.pause?.();
      } catch {}
    });
  };

  const openSong = (song: Song) => {
    const widget = scEmbed(song.audio_url) ? soundCloudWidgetsRef.current[song.id] : null;
    if (widget) {
      pauseSoundCloudWidgets();
      try {
        widget.seekTo?.(0);
        widget.play?.();
      } catch {}
    }
    setPlaying(song);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(76,175,80,0.18),transparent_34%),linear-gradient(180deg,oklch(0.18_0.04_145),oklch(0.10_0.03_145))]">
        <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.18_0.04_145/0.9)] via-[oklch(0.15_0.04_145/0.7)] to-[oklch(0.10_0.03_145/0.95)]" />
      </div>

      <header className="sticky top-0 z-40 border-b border-gold/20 bg-[oklch(0.15_0.04_145/0.6)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 md:px-8">
          <Link
            to={backTo as "/"}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gold hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
          <div className="flex items-center gap-2 text-cream font-display font-black">
            <Music className="h-5 w-5 text-leaf" /> Cânticos
          </div>
          <span className="w-14" />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 md:px-8 py-10 md:py-16">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between border-b border-gold/20 pb-6 mb-10">
          <div>
            <span className="text-[10px] md:text-xs font-bold tracking-[0.35em] uppercase text-gold">
              AWÃ TECH · Cantos Originários
            </span>
            <h1 className="mt-2 font-display text-3xl md:text-5xl font-black text-cream leading-tight">
              Cânticos <span className="italic text-gold">Sagrados</span>
            </h1>
            <p className="mt-3 max-w-xl text-sm md:text-base text-foreground/70">
              A floresta canta. Ouça em língua originária com tradução em português —
              cada verso se acende quando chega a sua vez.
            </p>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {ALDEIAS.map((a) => (
            <button
              key={a}
              onClick={() => setAldeia(a)}
              className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs transition ${
                aldeia === a
                  ? "border-gold bg-gold text-emerald-950"
                  : "border-gold/30 text-cream hover:bg-gold/10"
              }`}
            >
              <MapPin className="h-3 w-3" /> {a}
            </button>
          ))}
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {filteredSongs.map((s) => (
            <SongCard
              key={s.id}
              song={s}
              onClick={() => openSong(s)}
            />
          ))}
          {filteredSongs.length === 0 && (
            <div className="col-span-full text-center text-foreground/60 py-12">
              Nenhum cântico desta aldeia ainda.
            </div>
          )}
        </div>
      </main>

      <SoundCloudPreloads songs={songs} widgetsRef={soundCloudWidgetsRef} />

      {playing && (
        <Player
          song={playing}
          ambient={playing.ambient_video_id ? ambientMap[playing.ambient_video_id] : undefined}
          songs={songs}
          onClose={() => setPlaying(null)}
          onChange={setPlaying}
          soundCloudWidget={scEmbed(playing.audio_url) ? soundCloudWidgetsRef.current[playing.id] : undefined}
        />
      )}
    </div>
  );
}

function SoundCloudPreloads({
  songs,
  widgetsRef,
}: {
  songs: Song[];
  widgetsRef: { current: Record<string, any> };
}) {
  const iframeRefs = useRef<Record<string, HTMLIFrameElement | null>>({});
  const soundCloudSongs = useMemo(
    () => songs.filter((song) => scEmbed(song.audio_url)),
    [songs],
  );

  useEffect(() => {
    if (soundCloudSongs.length === 0) return;
    let cancelled = false;
    const ensureScript = () =>
      new Promise<void>((resolve) => {
        if ((window as any).SC?.Widget) return resolve();
        const existing = document.querySelector<HTMLScriptElement>(
          'script[src="https://w.soundcloud.com/player/api.js"]',
        );
        if (existing) {
          existing.addEventListener("load", () => resolve(), { once: true });
          return;
        }
        const script = document.createElement("script");
        script.src = "https://w.soundcloud.com/player/api.js";
        script.async = true;
        script.onload = () => resolve();
        document.body.appendChild(script);
      });

    ensureScript().then(() => {
      if (cancelled) return;
      const SC = (window as any).SC;
      if (!SC?.Widget) return;
      soundCloudSongs.forEach((song) => {
        if (widgetsRef.current[song.id]) return;
        const iframe = iframeRefs.current[song.id];
        if (!iframe) return;
        const widget = SC.Widget(iframe);
        widgetsRef.current[song.id] = widget;
        widget.bind(SC.Widget.Events.READY, () => {
          widgetsRef.current[song.id] = widget;
          widget.getDuration(() => {});
        });
      });
    });

    return () => {
      cancelled = true;
    };
  }, [soundCloudSongs, widgetsRef]);

  if (soundCloudSongs.length === 0) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none absolute bottom-0 left-0 h-px w-px overflow-hidden opacity-0">
      {soundCloudSongs.map((song) => (
        <iframe
          key={song.id}
          ref={(el) => {
            iframeRefs.current[song.id] = el;
          }}
          src={`${scEmbed(song.audio_url)!}&auto_play=false&show_artwork=false&show_teaser=false&buying=false&sharing=false&download=false`}
          allow="autoplay; encrypted-media"
          title={`Pré-carregamento ${song.title}`}
          tabIndex={-1}
          className="h-px w-px border-0"
        />
      ))}
    </div>
  );
}

function SongCard({
  song,
  onClick,
}: {
  song: Song;
  onClick: () => void;
}) {
  const lang = useLang();
  const tTitle = pickLang(song, "title", lang);
  const tArtist = pickLang(song, "artist", lang);

  return (
    <button
      onClick={onClick}
      className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-gold/15 bg-card/30 text-left transition-all duration-500 hover:-translate-y-1 hover:border-gold/50 hover:shadow-[0_20px_60px_-20px_rgba(249,168,37,0.35)]"
    >
      {/* media */}
      <div className="absolute inset-0">
        {song.cover_url ? (
          <img
            src={song.cover_url}
            alt={tTitle || song.title}
            loading="lazy"
            decoding="async"
            width={400}
            height={500}
            className="h-full w-full object-cover opacity-75 grayscale-[35%] transition-all duration-700 group-hover:scale-110 group-hover:grayscale-0 group-hover:opacity-100"
          />

        ) : (
          <div className="h-full w-full bg-gradient-to-br from-forest-deep via-bark to-leaf/40" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />
      </div>

      {/* tribal corner ornament */}
      <div className="absolute top-3 right-3 flex gap-1">
        <span className="block h-1.5 w-1.5 rounded-full bg-gold/60" />
        <span className="block h-1.5 w-1.5 rounded-full bg-gold/30" />
        <span className="block h-1.5 w-1.5 rounded-full bg-gold/15" />
      </div>

      {/* play overlay */}
      <div className="absolute inset-0 grid place-items-center opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-gold text-bark shadow-[0_0_40px_rgba(249,168,37,0.6)]">
          <Play className="h-7 w-7 ml-1 fill-current" />
        </div>
      </div>

      {/* info */}
      <div className="absolute inset-x-0 bottom-0 p-5">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-gold">
            {song.language}
          </span>
          {song.aldeia && (
            <span className="inline-flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 text-[10px] uppercase tracking-wider text-gold/90">
              <MapPin className="h-3 w-3" /> {song.aldeia}
            </span>
          )}
        </div>
        <h3 className="font-display text-xl font-black text-cream leading-tight">
          {tTitle || song.title}
        </h3>
        {song.artist && (
          <p className="mt-1 text-xs text-foreground/70 truncate">{tArtist || song.artist}</p>
        )}
      </div>
    </button>
  );
}

function Player({
  song,
  ambient,
  songs,
  onClose,
  onChange,
  soundCloudWidget,
}: {
  song: Song;
  ambient?: Ambient;
  songs: Song[];
  onClose: () => void;
  onChange: (s: Song) => void;
  soundCloudWidget?: any;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const scIframeRef = useRef<HTMLIFrameElement>(null);
  const scWidgetRef = useRef<any>(null);
  const [playing, setPlaying] = useState(true);
  const [loadingAudio, setLoadingAudio] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const idx = songs.findIndex((s) => s.id === song.id);
  const prev = songs[idx - 1];
  const next = songs[idx + 1];
  const lang = useLang();
  const tTitle = pickLang(song, "title", lang);
  const tArtist = pickLang(song, "artist", lang);
  const isSC = !!scEmbed(song.audio_url);

  const indLines = useMemo(
    () =>
      song.lyrics_indigenous
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean),
    [song.lyrics_indigenous],
  );
  const lyricsTranslated = pickLang(song, "lyrics_pt", lang);
  const ptLines = useMemo(
    () =>
      lyricsTranslated
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean),
    [lyricsTranslated],
  );

  const maxLen = Math.max(indLines.length, ptLines.length);
  // Sincronização automática: a duração é distribuída proporcionalmente ao
  // tamanho de cada verso (versos longos duram mais), com antecipação leve.
  const syncDuration = resolveDuration(duration, song.duration_seconds ?? null);
  const bounds = useMemo(
    () => computeLyricBounds(indLines, ptLines, syncDuration, song.sync_offsets || []),
    [indLines, ptLines, syncDuration, song.sync_offsets],
  );
  const activeIdx = useMemo(() => {
    if (maxLen <= 0) return -1;
    if (!bounds.length) return 0;
    return activeLineIndex(bounds, progress, 0.6);
  }, [bounds, progress, maxLen]);

  const lineRefs = useRef<Array<HTMLDivElement | null>>([]);
  useEffect(() => {
    if (activeIdx < 0) return;
    const el = lineRefs.current[activeIdx];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeIdx]);

  useEffect(() => {
    setProgress(0);
    setDuration(0);
    setLoadingAudio(true);
    setPlaying(true);
  }, [song.id]);

  useEffect(() => {
    if (isSC) return;
    const a = audioRef.current;
    if (!a) return;
    a.play()
      .then(() => {
        setLoadingAudio(false);
        setPlaying(true);
      })
      .catch(() => {
        setLoadingAudio(false);
        setPlaying(false);
      });
  }, [song.id, isSC]);

  // SoundCloud Widget API — track progress + play/pause
  useEffect(() => {
    if (!isSC) return;
    let cancelled = false;
    let readyTimer: number | undefined;
    const bindWidget = (widget: any) => {
      if (cancelled || !widget) return;
      const SC = (window as any).SC;
      scWidgetRef.current = widget;
      widget.bind(SC.Widget.Events.READY, () => {
        if (cancelled) return;
        widget.getDuration((d: number) => setDuration(d / 1000));
        setLoadingAudio(false);
        setPlaying(true);
        readyTimer = window.setTimeout(() => {
          widget.play();
        }, 0);
      });
      widget.bind(SC.Widget.Events.PLAY_PROGRESS, (e: any) => {
        setLoadingAudio(false);
        setProgress(e.currentPosition / 1000);
      });
      widget.bind(SC.Widget.Events.PLAY, () => {
        setLoadingAudio(false);
        setPlaying(true);
      });
      widget.bind(SC.Widget.Events.PAUSE, () => {
        setLoadingAudio(false);
        setPlaying(false);
      });
      widget.bind(SC.Widget.Events.FINISH, () => {
        if (next) onChange(next);
        else setPlaying(false);
      });
      widget.getDuration((d: number) => {
        if (cancelled) return;
        if (d > 0) {
          setDuration(d / 1000);
          setLoadingAudio(false);
        }
      });
      readyTimer = window.setTimeout(() => {
        if (!cancelled) widget.play();
      }, 0);
    };

    const ensureScript = () =>
      new Promise<void>((resolve) => {
        if ((window as any).SC?.Widget) return resolve();
        const existing = document.querySelector<HTMLScriptElement>(
          'script[src="https://w.soundcloud.com/player/api.js"]',
        );
        if (existing) {
          existing.addEventListener("load", () => resolve());
          return;
        }
        const s = document.createElement("script");
        s.src = "https://w.soundcloud.com/player/api.js";
        s.async = true;
        s.onload = () => resolve();
        document.body.appendChild(s);
      });

    ensureScript().then(() => {
      if (cancelled) return;
      const SC = (window as any).SC;
      if (soundCloudWidget) {
        bindWidget(soundCloudWidget);
        return;
      }
      if (!scIframeRef.current) return;
      bindWidget(SC.Widget(scIframeRef.current));
    });

    return () => {
      cancelled = true;
      if (readyTimer) window.clearTimeout(readyTimer);
      try {
        scWidgetRef.current?.pause?.();
      } catch {}
      scWidgetRef.current = null;
    };
  }, [song.id, isSC, next, onChange, soundCloudWidget]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.code === "Space") {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose]);

  function toggle() {
    if (isSC) {
      const w = scWidgetRef.current || soundCloudWidget;
      if (!w) {
        setPlaying(true);
        setLoadingAudio(true);
        return;
      }
      w.toggle();
      return;
    }
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      a.play();
      setPlaying(true);
    } else {
      a.pause();
      setPlaying(false);
    }
  }


  return (
    <div className="fixed inset-0 z-50">
      {/* cinematic background */}
      <div className="absolute inset-0 overflow-hidden">
        {song.video_url ? (
          ytEmbed(song.video_url) ? (
            <iframe
              src={ytEmbed(song.video_url)!}
              allow="autoplay; encrypted-media"
              className="absolute left-1/2 top-1/2 h-[120vh] w-[220vw] -translate-x-1/2 -translate-y-1/2 md:w-[160vw] pointer-events-none border-0"
            />
          ) : (
            <video
              src={song.video_url}
              autoPlay
              muted
              loop
              playsInline
              className="h-full w-full object-cover scale-110"
            />
          )
        ) : ambient ? (
          <video
            src={ambient.video_url}
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover scale-110"
          />
        ) : song.cover_url ? (
          <img
            src={song.cover_url}
            alt=""
            className="h-full w-full object-cover scale-110 blur-xl"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-forest-deep via-bark to-leaf/40" />
        )}
        {/* vignette + grain */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.85)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/95" />
      </div>

      {/* header */}
      <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between p-5 md:p-8">
        <div className="space-y-1">
          <div className="text-[10px] md:text-xs font-bold tracking-[0.35em] uppercase text-gold">
            Ouvindo agora · {song.language}
          </div>
          <h2 className="font-display text-2xl md:text-4xl font-black text-cream drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
            {tTitle || song.title}
          </h2>
          {song.artist && (
            <div className="text-sm text-foreground/80 italic">{tArtist || song.artist}</div>
          )}
        </div>
        <button
          onClick={onClose}
          className="grid h-11 w-11 place-items-center rounded-full border border-gold/40 bg-black/50 text-gold backdrop-blur-md hover:bg-gold/10"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* lyrics theater - static bilingual text */}
      <div className="absolute inset-0 z-[5] overflow-y-auto px-4 md:px-8 pt-32 md:pt-40 pb-44 scroll-smooth">
        <div className="mx-auto max-w-5xl space-y-12 md:space-y-16">
          {Array.from({ length: maxLen }).map((_, i) => {
            const active = i === activeIdx;
            return (
              <div
                key={i}
                ref={(el) => {
                  lineRefs.current[i] = el;
                }}
                className={`text-center transition-all duration-500 ${
                  active ? "scale-110" : "opacity-40"
                }`}
              >
                <p
                  className={`font-display text-3xl md:text-6xl lg:text-7xl font-black leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.75)] ${
                    active ? "text-gold" : "text-cream"
                  }`}
                >
                  {indLines[i] || "\u00A0"}
                </p>
                {ptLines[i] && (
                  <p className="mt-3 md:mt-5 text-lg md:text-2xl lg:text-3xl italic text-foreground/80">
                    {ptLines[i]}
                  </p>
                )}
              </div>
            );
          })}
          {maxLen === 0 && (
            <p className="text-center text-foreground/60">Esta música ainda não tem letra cadastrada.</p>
          )}
        </div>
      </div>

      {/* controls */}
      <div className="absolute inset-x-0 bottom-0 z-10 border-t border-gold/15 bg-gradient-to-t from-black/95 via-black/80 to-black/40 backdrop-blur-xl">
        <div className="mx-auto max-w-3xl px-4 md:px-8 py-4 md:py-6">
          {/* progress */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold tracking-widest text-foreground/60 tabular-nums">
              {fmt(progress)}
            </span>
            <div
              className="group relative flex-1 h-1.5 cursor-pointer rounded-full bg-gold/15"
              onClick={(e) => {
                if (!duration) return;
                const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                const t = ((e.clientX - rect.left) / rect.width) * duration;
                if (isSC) {
                  scWidgetRef.current?.seekTo?.(t * 1000);
                } else if (audioRef.current) {
                  audioRef.current.currentTime = t;
                }
              }}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-gold to-[oklch(0.78_0.16_70)] shadow-[0_0_12px_rgba(249,168,37,0.6)]"
                style={{ width: `${duration ? (progress / duration) * 100 : 0}%` }}
              />
              <div
                className="absolute top-1/2 h-3 w-3 -translate-y-1/2 -translate-x-1/2 rounded-full bg-cream opacity-0 transition-opacity group-hover:opacity-100"
                style={{ left: `${duration ? (progress / duration) * 100 : 0}%` }}
              />
            </div>
            <span className="text-[10px] font-bold tracking-widest text-foreground/60 tabular-nums">
              {fmt(duration)}
            </span>
          </div>

          {/* buttons */}
          <div className="mt-4 flex items-center justify-center gap-6 md:gap-10">
            <button
              disabled={!prev}
              onClick={() => prev && onChange(prev)}
              className="text-cream/70 transition-colors hover:text-gold disabled:opacity-25"
              aria-label="Anterior"
            >
              <ChevronLeft className="h-7 w-7" />
            </button>
            <button
              onClick={toggle}
              className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-gold to-[oklch(0.62_0.16_55)] text-bark shadow-[0_10px_40px_-5px_rgba(249,168,37,0.6)] transition-transform hover:scale-105"
              aria-label={loadingAudio ? "Carregando" : playing ? "Pausar" : "Tocar"}
            >
              {loadingAudio ? (
                <span className="h-7 w-7 animate-spin rounded-full border-2 border-bark/30 border-t-bark" />
              ) : playing ? (
                <Pause className="h-7 w-7 fill-current" />
              ) : (
                <Play className="h-7 w-7 ml-1 fill-current" />
              )}
            </button>
            <button
              disabled={!next}
              onClick={() => next && onChange(next)}
              className="text-cream/70 transition-colors hover:text-gold disabled:opacity-25"
              aria-label="Próxima"
            >
              <ChevronRight className="h-7 w-7" />
            </button>
          </div>
        </div>
      </div>

      {isSC && !soundCloudWidget && (
        <iframe
          ref={scIframeRef}
          src={`${scEmbed(song.audio_url)!}&auto_play=true&show_artwork=false&show_teaser=false&buying=false&sharing=false&download=false`}
          allow="autoplay; encrypted-media"
          title={song.title}
          aria-hidden="true"
          tabIndex={-1}
          className="pointer-events-none absolute bottom-0 left-0 h-px w-px opacity-0 border-0"
        />
      )}
      {!isSC && (
        <audio
          ref={audioRef}
          src={song.audio_url}
          onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => {
            setDuration(e.currentTarget.duration);
            setLoadingAudio(false);
          }}
          onCanPlay={() => setLoadingAudio(false)}
          onEnded={() => (next ? onChange(next) : setPlaying(false))}
          onPlay={() => {
            setLoadingAudio(false);
            setPlaying(true);
          }}
          onPause={() => {
            setLoadingAudio(false);
            setPlaying(false);
          }}
        />
      )}

    </div>
  );
}

function fmt(s: number) {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function ytEmbed(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  if (!m) return null;
  const id = m[1];
  return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&controls=0&playlist=${id}&playsinline=1&modestbranding=1&rel=0`;
}

function scEmbed(url: string): string | null {
  if (!/soundcloud\.com/.test(url)) return null;
  return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&hide_related=true&show_comments=false&show_user=false&show_reposts=false&visual=false&color=%23f9a825`;
}



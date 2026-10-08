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
  Sparkles,
  Volume2,
} from "lucide-react";
import { PremiumGate } from "@/components/PremiumGate";
import { pickLang, useLang } from "@/lib/pick-lang";
import { useLastArea } from "@/lib/last-area";
import { activeLineIndex, resolveDuration, resolveLyricBounds } from "@/lib/lyric-sync";
import { SiteHeader } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";

import danca from "@/assets/pataxo-danca.jpg";
import aldeiaImg from "@/assets/pataxo-aldeia.jpg";
import anciaoImg from "@/assets/pataxo-anciao.jpg";
import artesanatoImg from "@/assets/pataxo-artesanato.jpg";
import pascoalImg from "@/assets/pataxo-monte-pascoal.jpg";
import heroWoman from "@/assets/hero-woman.jpg";

export const Route = createFileRoute("/musicas")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Cânticos Sagrados — AWÃ TECH" },
      { name: "description", content: "Cânticos em Patxôhã com legendas bilíngues (Premium)." },
    ],
  }),
  component: () => (
    <PremiumGate
      title="Cânticos completos (Premium)"
      description="Assine para ouvir todos os cânticos com legendas bilíngues e vídeos imersivos."
    >
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
  sync_times?: number[] | null;
};

type Ambient = { id: string; name: string; video_url: string };

const ALDEIAS = ["Todas", "Aldeia Velha", "Barra Velha", "Coroa Vermelha", "Jaqueira", "Boca da Mata"] as const;

const FALLBACK_COVERS = [danca, aldeiaImg, pascoalImg, anciaoImg, artesanatoImg, heroWoman];

function getFallbackCover(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return FALLBACK_COVERS[Math.abs(hash) % FALLBACK_COVERS.length];
}

function MusicasPage() {
  const backTo = useLastArea();
  const { data: songs = [] } = useQuery({
    queryKey: ["songs_public"],
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60 * 6,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("songs")
        .select(
          "id,title,artist,language,audio_url,cover_url,video_url,ambient_video_id,lyrics_indigenous,lyrics_pt,description,aldeia,title_en,title_es,artist_en,artist_es,description_en,description_es,lyrics_pt_en,lyrics_pt_es,duration_seconds,sync_offsets,sync_times",
        )
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
      const { data, error } = await supabase.from("ambient_videos").select("id,name,video_url");
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
    <div className="min-h-screen bg-[#f7f6f2] text-[#1f2937]">
      <SiteHeader mode="adulto" />
      <header className="sticky top-0 z-30 border-b border-[#e8e4dc] bg-white/95 backdrop-blur-xl shadow-xs">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3.5 md:px-8">
          <Link
            to={backTo as "/"}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1b4332] hover:text-[#2d6a4f]"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
          <div className="flex items-center gap-2 font-display font-black text-sm md:text-base text-[#11231b]">
            <Music className="h-4 w-4 text-[#1b4332]" /> Cânticos Sagrados
          </div>
          <span className="w-14" />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-12">
        {/* Banner */}
        <section className="rounded-3xl border border-[#e8e4dc] bg-white p-6 md:p-10 shadow-xs mb-8">
          <div className="flex flex-col gap-4">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[#e8e4dc] bg-[#fbfaf7] px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#1b4332]">
              <Sparkles className="h-3 w-3 text-[#b47e28]" /> Cantos Originários Pataxó
            </span>
            <h1 className="font-display text-3xl md:text-5xl font-black text-[#11231b] tracking-tight leading-tight">
              Cânticos <span className="text-[#1b4332]">Sagrados</span>
            </h1>
            <p className="max-w-2xl text-sm md:text-base text-[#4b5563] leading-relaxed">
              A floresta canta. Ouça em língua originária com tradução sincronizada em português —
              cada verso se acende com a voz dos guerreiros e anciãos.
            </p>

            {/* Aldeia Filter Pills */}
            <div className="mt-4 flex flex-wrap gap-2 pt-4 border-t border-[#f0eee6]">
              {ALDEIAS.map((a) => (
                <button
                  key={a}
                  onClick={() => setAldeia(a)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-bold transition shadow-xs ${
                    aldeia === a
                      ? "border-[#1b4332] bg-[#1b4332] text-white"
                      : "border-[#e8e4dc] bg-white text-[#4b5563] hover:border-[#1b4332]/50 hover:text-[#11231b]"
                  }`}
                >
                  <MapPin className="h-3 w-3" /> {a}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Grid de Músicas */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredSongs.map((s) => (
            <SongCard key={s.id} song={s} onClick={() => openSong(s)} />
          ))}
          {filteredSongs.length === 0 && (
            <div className="col-span-full rounded-2xl border border-[#e8e4dc] bg-white py-16 text-center text-[#6b7280]">
              Nenhum cântico desta aldeia disponível ainda.
            </div>
          )}
        </div>
      </main>

      <SiteFooter mode="adulto" />

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
  const soundCloudSongs = useMemo(() => songs.filter((song) => scEmbed(song.audio_url)), [songs]);

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
    <div
      aria-hidden="true"
      className="pointer-events-none absolute bottom-0 left-0 h-px w-px overflow-hidden opacity-0"
    >
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

function SongCard({ song, onClick }: { song: Song; onClick: () => void }) {
  const lang = useLang();
  const tTitle = pickLang(song, "title", lang);
  const tArtist = pickLang(song, "artist", lang);
  const [imgError, setImgError] = useState(false);

  const fallback = useMemo(() => getFallbackCover(song.id || song.title), [song.id, song.title]);
  const coverSrc = (!imgError && song.cover_url) ? song.cover_url : fallback;

  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#e8e4dc] bg-white text-left shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-[#1b4332]/50 hover:shadow-md"
    >
      {/* Capa */}
      <div className="relative aspect-[16/11] w-full overflow-hidden bg-[#f4f2ec]">
        <img
          src={coverSrc}
          alt={tTitle || song.title}
          loading="lazy"
          decoding="async"
          onError={() => setImgError(true)}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />

        {/* Play Icon Badge */}
        <div className="absolute inset-0 grid place-items-center opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100 bg-black/25">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-[#1b4332] text-white shadow-lg transition-transform group-hover:scale-110">
            <Play className="h-5 w-5 ml-0.5 fill-current" />
          </div>
        </div>
      </div>

      {/* Detalhes */}
      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <span className="rounded-md border border-[#1b4332]/20 bg-[#1b4332]/5 px-2 py-0.5 text-[10px] font-bold text-[#1b4332] uppercase tracking-wider">
              {song.language}
            </span>
            {song.aldeia && (
              <span className="inline-flex items-center gap-1 rounded-md border border-[#e8e4dc] bg-[#fbfaf7] px-2 py-0.5 text-[10px] font-semibold text-[#6b7280]">
                <MapPin className="h-2.5 w-2.5" /> {song.aldeia}
              </span>
            )}
          </div>
          <h3 className="font-display text-base font-black text-[#11231b] group-hover:text-[#1b4332] transition-colors line-clamp-1">
            {tTitle || song.title}
          </h3>
          {song.artist && (
            <p className="mt-1 text-xs text-[#6b7280] truncate">{tArtist || song.artist}</p>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-[#f0eee6] pt-2 text-[11px] font-bold text-[#1b4332]">
          <span>Ouvir cântico</span>
          <Play className="h-3 w-3 fill-current" />
        </div>
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

  const fallback = useMemo(() => getFallbackCover(song.id || song.title), [song.id, song.title]);
  const coverSrc = song.cover_url || fallback;

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
  const syncDuration = resolveDuration(duration, song.duration_seconds ?? null);
  const bounds = useMemo(
    () =>
      resolveLyricBounds({
        indLines,
        ptLines,
        duration: syncDuration,
        times: song.sync_times ?? null,
        offsets: song.sync_offsets ?? null,
      }),
    [indLines, ptLines, syncDuration, song.sync_offsets, song.sync_times],
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

  useEffect(() => {
    if (isSC) return;
    let raf = 0;
    const tick = () => {
      const a = audioRef.current;
      if (a) {
        setProgress(a.currentTime);
        if (a.duration && Number.isFinite(a.duration)) setDuration(a.duration);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [song.id, isSC]);

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
          existing.addEventListener("load", () => resolve(), { once: true });
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
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-black/95 text-white backdrop-blur-2xl">
      {/* Background cinematic media */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {song.video_url ? (
          ytEmbed(song.video_url) ? (
            <iframe
              src={ytEmbed(song.video_url)!}
              allow="autoplay; encrypted-media"
              className="absolute left-1/2 top-1/2 h-[120vh] w-[220vw] -translate-x-1/2 -translate-y-1/2 md:w-[160vw] pointer-events-none border-0 opacity-40"
            />
          ) : (
            <video
              src={song.video_url}
              autoPlay
              muted
              loop
              playsInline
              className="h-full w-full object-cover scale-105 opacity-35"
            />
          )
        ) : ambient ? (
          <video
            src={ambient.video_url}
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover scale-105 opacity-35"
          />
        ) : (
          <img src={coverSrc} alt="" className="h-full w-full object-cover scale-110 blur-2xl opacity-30" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/60" />
      </div>

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between border-b border-white/10 p-4 md:p-6 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-white/20">
            <img src={coverSrc} alt="" className="h-full w-full object-cover" />
          </div>
          <div>
            <div className="text-[10px] md:text-xs font-bold tracking-widest uppercase text-emerald-400">
              Ouvindo agora · {song.language}
            </div>
            <h2 className="font-display text-lg md:text-xl font-black text-white leading-tight">
              {tTitle || song.title}
            </h2>
            {song.artist && <div className="text-xs text-white/70">{tArtist || song.artist}</div>}
          </div>
        </div>

        <button
          onClick={onClose}
          className="grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Center Lyrics Theater */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 md:px-8 py-10 scroll-smooth">
        <div className="mx-auto max-w-4xl space-y-10 md:space-y-14">
          {Array.from({ length: maxLen }).map((_, i) => {
            const active = i === activeIdx;
            return (
              <div
                key={i}
                ref={(el) => {
                  lineRefs.current[i] = el;
                }}
                className={`text-center transition-all duration-300 ${
                  active ? "scale-105 opacity-100" : "opacity-35 hover:opacity-70"
                }`}
              >
                <p
                  className={`font-display text-2xl md:text-4xl lg:text-5xl font-black leading-tight drop-shadow-md ${
                    active ? "text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.4)]" : "text-white"
                  }`}
                >
                  {indLines[i] || "\u00A0"}
                </p>
                {ptLines[i] && (
                  <p
                    className={`mt-2 md:mt-3 text-base md:text-xl italic ${
                      active ? "text-white font-medium" : "text-white/70"
                    }`}
                  >
                    {ptLines[i]}
                  </p>
                )}
              </div>
            );
          })}
          {maxLen === 0 && (
            <p className="text-center text-white/60 py-20">Esta música não tem letra sincronizada.</p>
          )}
        </div>
      </div>

      {/* Bottom Floating Control Bar */}
      <div className="relative z-10 border-t border-white/10 bg-black/90 p-4 md:p-6 backdrop-blur-2xl">
        <div className="mx-auto max-w-3xl">
          {/* Barra de Progresso */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-semibold text-white/60 tabular-nums">
              {fmt(progress)}
            </span>
            <div
              className="group relative flex-1 h-2 cursor-pointer rounded-full bg-white/15"
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
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-300 shadow-[0_0_12px_rgba(52,211,153,0.5)]"
                style={{ width: `${duration ? (progress / duration) * 100 : 0}%` }}
              />
              <div
                className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 -translate-x-1/2 rounded-full bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ left: `${duration ? (progress / duration) * 100 : 0}%` }}
              />
            </div>
            <span className="text-[11px] font-semibold text-white/60 tabular-nums">
              {fmt(duration)}
            </span>
          </div>

          {/* Botões de Ação */}
          <div className="mt-4 flex items-center justify-center gap-6 md:gap-10">
            <button
              disabled={!prev}
              onClick={() => prev && onChange(prev)}
              className="text-white/70 transition hover:text-white disabled:opacity-20"
              aria-label="Anterior"
            >
              <ChevronLeft className="h-7 w-7" />
            </button>
            <button
              onClick={toggle}
              className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-tr from-[#1b4332] to-[#2d6a4f] text-white shadow-[0_0_30px_rgba(45,106,79,0.5)] transition hover:scale-105 active:scale-95"
              aria-label={loadingAudio ? "Carregando" : playing ? "Pausar" : "Tocar"}
            >
              {loadingAudio ? (
                <span className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : playing ? (
                <Pause className="h-7 w-7 fill-current" />
              ) : (
                <Play className="h-7 w-7 ml-1 fill-current" />
              )}
            </button>
            <button
              disabled={!next}
              onClick={() => next && onChange(next)}
              className="text-white/70 transition hover:text-white disabled:opacity-20"
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
  return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&hide_related=true&show_comments=false&show_user=false&show_reposts=false&visual=false&color=%231b4332`;
}

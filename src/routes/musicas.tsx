import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft,
  Music,
  Play,
  MapPin,
} from "lucide-react";
import { PremiumGate } from "@/components/PremiumGate";
import { pickLang, useLang } from "@/lib/pick-lang";
import { useLastArea, setLastArea } from "@/lib/last-area";
import {
  AdultPlayer,
  getSongCover,
  FALLBACK_COVERS,
  type Song,
} from "@/components/music/AdultPlayer";

export { getSongCover, FALLBACK_COVERS, type Song };

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

type Ambient = { id: string; name: string; video_url: string };

const ALDEIAS = ["Todas", "Aldeia Velha", "Barra Velha", "Coroa Vermelha", "Jaqueira", "Boca da Mata"] as const;

function MusicasPage() {
  const backTo = useLastArea();
  useEffect(() => setLastArea("/adulto"), []);
  const { data: songs = [] } = useQuery({
    queryKey: ["songs_public"],
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60 * 6,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("songs")
        .select("id,title,artist,language,audio_url,cover_url,video_url,ambient_video_id,lyrics_indigenous,lyrics_pt,description,aldeia,title_en,title_es,artist_en,artist_es,description_en,description_es,lyrics_pt_en,lyrics_pt_es,duration_seconds,sync_offsets,sync_times,style")
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

      <header className="sticky top-0 z-40 border-b border-gold/20 bg-[oklch(0.15_0.04_145/0.7)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 md:px-8">
          <Link
            to={backTo as "/"}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gold hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
          <div className="flex items-center gap-2 text-cream font-display font-black text-lg">
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
              Cânticos <span className="italic text-gradient-gold">Sagrados</span>
            </h1>
            <p className="mt-3 max-w-xl text-sm md:text-base text-foreground/75 leading-relaxed">
              A floresta canta. Ouça em língua originária Patxôhã com capas e traduções bilíngues sincronizadas verso a verso em tempo real.
            </p>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {ALDEIAS.map((a) => (
            <button
              key={a}
              onClick={() => setAldeia(a)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold transition shadow-xs ${
                aldeia === a
                  ? "border-gold bg-gradient-to-r from-gold to-[#f59e0b] text-emerald-950 shadow-[0_2px_10px_rgba(249,168,37,0.4)]"
                  : "border-gold/30 text-cream hover:bg-gold/10"
              }`}
            >
              <MapPin className="h-3.5 w-3.5" /> {a}
            </button>
          ))}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredSongs.map((s) => (
            <SongCard
              key={s.id}
              song={s}
              onClick={() => openSong(s)}
            />
          ))}
          {filteredSongs.length === 0 && (
            <div className="col-span-full text-center text-foreground/60 py-16">
              Nenhum cântico desta aldeia encontrado no momento.
            </div>
          )}
        </div>
      </main>

      <SoundCloudPreloads songs={songs} widgetsRef={soundCloudWidgetsRef} />

      {playing && (
        <AdultPlayer
          song={playing}
          ambient={playing.ambient_video_id ? ambientMap[playing.ambient_video_id] : undefined}
          songs={filteredSongs.length > 0 ? filteredSongs : songs}
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
        const s = document.createElement("script");
        s.src = "https://w.soundcloud.com/player/api.js";
        s.async = true;
        s.onload = () => resolve();
        document.body.appendChild(s);
      });

    ensureScript().then(() => {
      if (cancelled) return;
      const SC = (window as any).SC;
      soundCloudSongs.forEach((song) => {
        const iframe = iframeRefs.current[song.id];
        if (iframe && !widgetsRef.current[song.id]) {
          try {
            widgetsRef.current[song.id] = SC.Widget(iframe);
          } catch {}
        }
      });
    });

    return () => {
      cancelled = true;
    };
  }, [soundCloudSongs, widgetsRef]);

  return (
    <div className="pointer-events-none absolute bottom-0 left-0 h-px w-px opacity-0">
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
  const [imgError, setImgError] = useState(false);
  const fallbackCover = useMemo(() => getSongCover(song), [song]);
  const coverSrc = (!imgError && song.cover_url) ? song.cover_url : fallbackCover;

  return (
    <button
      onClick={onClick}
      className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-gold/25 bg-[oklch(0.14_0.04_145/0.8)] text-left transition-all duration-500 hover:-translate-y-1.5 hover:border-gold hover:shadow-[0_20px_50px_-15px_rgba(249,168,37,0.4)] cursor-pointer"
    >
      {/* Media Image */}
      <div className="absolute inset-0">
        <img
          src={coverSrc}
          alt={tTitle || song.title}
          loading="lazy"
          decoding="async"
          onError={() => setImgError(true)}
          className="h-full w-full object-cover transition-all duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
      </div>

      {/* Tribal corner indicator */}
      <div className="absolute top-3 right-3 flex gap-1 z-10">
        <span className="block h-2 w-2 rounded-full bg-gold shadow-[0_0_8px_rgba(249,168,37,0.8)]" />
        <span className="block h-2 w-2 rounded-full bg-gold/50" />
      </div>

      {/* Play Overlay Glow */}
      <div className="absolute inset-0 grid place-items-center opacity-0 transition-all duration-300 group-hover:opacity-100 backdrop-blur-[2px] bg-black/20">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-[#ffd166] via-[#f59e0b] to-[#d97706] text-bark shadow-[0_0_35px_rgba(249,168,37,0.7)] transition-transform duration-300 group-hover:scale-110">
          <Play className="h-7 w-7 ml-1 fill-current" />
        </div>
      </div>

      {/* Info Card Content */}
      <div className="absolute inset-x-0 bottom-0 p-5 z-10">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="text-[10px] font-black tracking-[0.2em] uppercase text-gold bg-black/60 px-2.5 py-0.5 rounded-full border border-gold/30">
            {song.language || "Patxôhã"}
          </span>
          {song.aldeia && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 text-[10px] uppercase tracking-wider text-emerald-200">
              <MapPin className="h-2.5 w-2.5 text-emerald-400" /> {song.aldeia}
            </span>
          )}
        </div>
        <h3 className="font-display text-xl font-black text-cream leading-tight drop-shadow-md group-hover:text-gold transition-colors">
          {tTitle || song.title}
        </h3>
        {song.artist && (
          <p className="mt-1 text-xs text-foreground/80 truncate italic">{tArtist || song.artist}</p>
        )}
      </div>
    </button>
  );
}

function scEmbed(url: string): string | null {
  if (!/soundcloud\.com/.test(url)) return null;
  return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&hide_related=true&show_comments=false&show_user=false&show_reposts=false&visual=false&color=%23f9a825`;
}

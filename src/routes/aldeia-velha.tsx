import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Droplets,
  ExternalLink,
  Flame,
  GraduationCap,
  Heart,
  Home,
  Landmark,
  Languages,
  Leaf,
  Music,
  Play,
  Quote,
  Sparkles,
  Stethoscope,
  X,
  ZoomIn,
} from "lucide-react";

import { AudioHotspot } from "@/components/AudioHotspot";
import { stopHotspotAudio, type HotspotId } from "@/lib/audio-hotspots";
import { PublicFooter } from "@/components/PublicFooter";
import { Button } from "@/components/ui/button";
import { useLastArea } from "@/lib/last-area";
import logoSrc from "@/assets/awa-tech-logo.png";
import {
  AUTHOR_NOTE,
  DOC_LINKS,
  ELDERS,
  GALLERY,
  HEALTH_DEMOGRAPHICS,
  PHOTOS,
  POPULATION,
  PROJECTS,
  REFERENCES,
  THEMES,
  isTheme,
  TERRITORY_FACTS,
  TIMELINE,
  type Photo,
} from "@/lib/aldeia-velha-content";

export const Route = createFileRoute("/aldeia-velha")({
  validateSearch: (search: Record<string, unknown>): { tema?: string } => {
    const raw = typeof search.tema === "string" ? search.tema : undefined;
    return isTheme(raw) ? { tema: raw } : {};
  },
  head: () => ({
    meta: [
      { title: "Aldeia Velha — Território Ancestral Pataxó" },
      {
        name: "description",
        content:
          "A história digital da Comunidade Indígena Pataxó Aldeia Velha: memória ancestral, relatos dos anciãos, a retomada, o território, a escola, o Patxôhã, a cultura e os saberes tradicionais.",
      },
      { property: "og:type", content: "article" },
      { property: "og:title", content: "Aldeia Velha — Território Ancestral Pataxó" },
      {
        property: "og:description",
        content:
          "Memória, resistência e vida do povo Pataxó de Aldeia Velha, em Porto Seguro (BA), contada com os relatos e as fotos da própria comunidade.",
      },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AldeiaVelhaPage,
});

/* ---------------------------------- UI ---------------------------------- */

function SectionTitle({
  icon,
  eyebrow,
  title,
  desc,
  audioId,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  desc?: string;
  audioId?: HotspotId;
}) {
  return (
    <header className="mb-7">
      <div className="flex flex-wrap items-center gap-2">
        <span className="chip-gold inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]">
          {icon} {eyebrow}
        </span>
        {audioId && <AudioHotspot id={audioId} />}
      </div>
      <h2 className="mt-4 font-display text-2xl font-black leading-tight text-cream md:text-4xl">
        {title}
      </h2>
      <div className="divider-gold my-4 w-24" />
      {desc && <p className="max-w-3xl text-[15px] leading-relaxed text-foreground/80">{desc}</p>}
    </header>
  );
}

function Figure({
  photo,
  onZoom,
  className = "",
  ratio = "aspect-[16/10]",
}: {
  photo: Photo;
  onZoom: (p: Photo) => void;
  className?: string;
  ratio?: string;
}) {
  return (
    <figure className={`group overflow-hidden rounded-2xl card-elev ${className}`}>
      <button
        type="button"
        onClick={() => onZoom(photo)}
        aria-label={`Ampliar foto: ${photo.caption}`}
        className={`relative block w-full ${ratio} overflow-hidden`}
      >
        <img
          src={photo.src}
          alt={photo.alt}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <span className="absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full border border-gold/40 bg-[oklch(0.14_0.04_145/0.75)] text-gold opacity-0 backdrop-blur-sm transition group-hover:opacity-100">
          <ZoomIn className="h-4 w-4" />
        </span>
      </button>
      <figcaption className="px-3 py-2.5 text-[12.5px] leading-snug text-foreground/70">
        {photo.caption}
      </figcaption>
    </figure>
  );
}

function Lightbox({ photo, onClose }: { photo: Photo; onClose: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={photo.caption}
      onClick={onClose}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-3 bg-[oklch(0.1_0.03_145/0.94)] p-4 backdrop-blur-md"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Fechar"
        className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-gold/40 bg-forest-deep/70 text-gold transition hover:bg-forest-deep"
      >
        <X className="h-5 w-5" />
      </button>
      <img
        src={photo.src}
        alt={photo.alt}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[78vh] max-w-full rounded-xl object-contain shadow-[var(--shadow-card)]"
      />
      <p className="max-w-2xl text-center text-sm text-cream/85">{photo.caption}</p>
    </div>
  );
}

/**
 * Altura aproximada do cabeçalho do embed do Instagram (avatar + usuário +
 * botão "Ver perfil"), usada para deslocar o iframe e esconder somente o header.
 */
const IG_HEADER_PX = 45;

/**
 * Altura aproximada do rodapé do embed ("Ver mais no Instagram", ícones, curtidas
 * e campo de comentário). Usada para cortar o rodapé e mostrar só a mídia.
 * Mesmo com ?hidecaption=true o Instagram mantém essa barra de ações.
 */
const IG_FOOTER_PX = 150;

/** Proporção reservada enquanto a altura real da mídia ainda não foi medida. */
const IG_PLACEHOLDER_RATIO = "100 / 104";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Instgrm = { Embeds?: { process: () => void } };
function processEmbeds() {
  try {
    (window as unknown as { instgrm?: Instgrm }).instgrm?.Embeds?.process();
  } catch {
    /* noop */
  }
}

/** Carrega o script oficial do Instagram uma única vez e processa os blockquotes. */
function ensureEmbedScript() {
  if (typeof document === "undefined") return;
  if (document.getElementById("ig-embeds-js")) {
    processEmbeds();
    return;
  }
  const s = document.createElement("script");
  s.id = "ig-embeds-js";
  s.src = "https://www.instagram.com/embed.js";
  s.async = true;
  s.onload = processEmbeds;
  document.body.appendChild(s);
}

/**
 * Embed do Instagram recortado via SDK oficial: o script dimensiona o iframe
 * automaticamente para o conteúdo (cabeçalho + mídia + rodapé), medimos essa
 * altura e cortamos o cabeçalho (topo) e o rodapé ("Ver mais no Instagram",
 * curtidas, comentários), exibindo somente a área do vídeo — seja ele vertical
 * (reel) ou horizontal. Assim nenhum elemento do Instagram vaza, independente
 * da proporção da publicação.
 */
function CleanEmbed({
  url,
  title,
  onActivated,
}: {
  url: string;
  title: string;
  onActivated?: () => void;
}) {
  const cropRef = useRef<HTMLDivElement | null>(null);
  const [mediaH, setMediaH] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const onActivatedRef = useRef(onActivated);
  onActivatedRef.current = onActivated;

  /**
   * Alterna tela cheia no card do vídeo. Ao entrar, tenta virar a tela do
   * aparelho conforme a orientação do vídeo (reel vertical → retrato, filme
   * horizontal → paisagem), mantendo o recorte sincronizado com a mídia.
   * Ao sair, devolve a orientação ao normal.
   */
  const toggleFullscreen = async () => {
    const stage = stageRef.current;
    const crop = cropRef.current;
    if (!stage || !crop) return;
    try {
      if (document.fullscreenElement === stage) {
        await document.exitFullscreen();
        return;
      }
      await stage.requestFullscreen();
      const w = crop.clientWidth || 1;
      const h = mediaH ?? (crop.clientHeight || 1);
      const orientation: OrientationLockType = h > w ? "portrait" : "landscape";
      await screen.orientation.lock(orientation).catch(() => undefined);
    } catch {
      /* aparelhos que não suportam fullscreen/orientation: segue sem travar */
    }
  };

  // Sincroniza o estado (e a rotação da tela) com o ciclo de fullscreen,
  // incluindo saída pelo gesto/botão nativo do aparelho.
  useEffect(() => {
    const onFsChange = () => {
      const active = document.fullscreenElement === cropRef.current;
      setIsFullscreen(active);
      if (!active) {
        try {
          screen.orientation.unlock();
        } catch {
          /* noop */
        }
      }
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  // Carrega o script e reprocessa periodicamente (o blockquote pode aparecer
  // depois do script já ter rodado, então chamamos process() algumas vezes).
  useEffect(() => {
    ensureEmbedScript();
    const t = window.setInterval(processEmbeds, 600);
    return () => window.clearInterval(t);
  }, []);

  // Mede a altura real do iframe gerado pelo SDK e posiciona tudo.
  useEffect(() => {
    const crop = cropRef.current;
    if (!crop) return;

    const apply = () => {
      const ifr = crop.querySelector<HTMLIFrameElement>("iframe");
      if (!ifr) return;
      const H = ifr.clientHeight || Number(ifr.getAttribute("height")) || 0;
      if (H <= 0) return;

      const media = Math.max(H - IG_HEADER_PX - IG_FOOTER_PX, 90);
      ifr.style.position = "absolute";
      ifr.style.left = "0";
      ifr.style.top = `${-IG_HEADER_PX}px`;
      ifr.style.width = "100%";
      ifr.style.height = `${H}px`;
      ifr.style.border = "0";
      ifr.style.background = "#000";
      ifr.setAttribute("title", title);
      ifr.setAttribute("allow", "autoplay; encrypted-media; picture-in-picture; fullscreen");
      ifr.setAttribute("loading", "lazy");

      setMediaH((prev) => (prev != null && Math.abs(prev - media) <= 1 ? prev : media));
    };

    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(crop);
    const mo = new MutationObserver(apply);
    mo.observe(crop, { childList: true, subtree: true });
    const t = window.setInterval(apply, 400);
    return () => {
      ro.disconnect();
      mo.disconnect();
      window.clearInterval(t);
    };
  }, [title]);

  // Detecta quando a pessoa toca em "play" dentro do embed do Instagram: o clique
  // dentro do iframe tira o foco da janela (window blur) e o activeElement vira
  // o iframe deste card. Usamos isso para garantir que só um documentário toque
  // por vez — ao ativar um, o anterior é remontado (e portanto parado).
  useEffect(() => {
    const onWinBlur = () => {
      const crop = cropRef.current;
      if (!crop) return;
      const a = document.activeElement;
      if (a && a.tagName === "IFRAME" && crop.contains(a)) {
        onActivatedRef.current?.();
      }
    };
    window.addEventListener("blur", onWinBlur);
    return () => window.removeEventListener("blur", onWinBlur);
  }, []);

  return (
    <div
      ref={cropRef}
      className="relative w-full overflow-hidden bg-black"
      // Mantém a altura medida da mídia também em tela cheia: o recorte do
      // cabeçalho/rodapé continua exato e o restante da tela fica com o fundo
      // preto nativo do modo fullscreen (efeito "letterbox" do cinema).
      style={
        mediaH != null
          ? { height: `${mediaH}px` }
          : { aspectRatio: IG_PLACEHOLDER_RATIO }
      }
    >
      <blockquote
        className="instagram-media"
        data-instgrm-permalink={`${url.replace(/\/+$/, "")}/?hidecaption=true`}
        data-instgrm-version="14"
        style={{
          background: "#FFF",
          border: "0",
          margin: "0",
          maxWidth: "100%",
          minWidth: "0",
          padding: "0",
          width: "100%",
        }}
        aria-label={title}
      />
      {/* Tarjas pretas garantindo que nenhum resquício de cabeçalho/rodapé
          apareça caso o embed renderize com alturas um pouco diferentes. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-black" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-black" />
      {/* Botão de tela cheia: expande o vídeo e vira a tela do aparelho
          conforme a orientação do vídeo (vertical → retrato, horizontal →
          paisagem). Some enquanto já está em tela cheia — nesse caso a saída
          é pelo gesto/botão nativo do aparelho. */}
      {!isFullscreen && (
        <button
          type="button"
          onClick={toggleFullscreen}
          aria-label={`Assistir ${title} em tela cheia`}
          className="absolute bottom-3 right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/70 text-white shadow-lg backdrop-blur-sm transition hover:bg-black/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path d="M8 3H5a2 2 0 0 0-2 2v3" />
            <path d="M16 3h3a2 2 0 0 1 2 2v3" />
            <path d="M8 21H5a2 2 0 0 1-2-2v-3" />
            <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
          </svg>
        </button>
      )}
    </div>
  );
}

/**
 * Card com o vídeo já embutido: o player é montado quando o card aparece na tela.
 * Para garantir que só um documentário toque por vez, cada card avisa quando seu
 * embed recebe o foco (onActivate) e, quando deixa de ser o ativo, é remontado
 * via `token` — isso remove e recria o iframe do Instagram, parando o vídeo que
 * estava rodando.
 */
function DocumentaryCard({
  url,
  index,
  active,
  onActivate,
}: {
  url: string;
  index: number;
  active: boolean;
  onActivate: () => void;
}) {
  const label = `Documentário ${index + 1}`;
  const ref = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);
  // Contador que força o remount do CleanEmbed quando este card perde o "ativo":
  // ao trocar de vídeo, o anterior é desmontado (parando a reprodução) e
  // remontado em estado pausado (pronto para tocar de novo).
  const [token, setToken] = useState(0);
  const prevActive = useRef(active);

  useEffect(() => {
    if (prevActive.current && !active) {
      setToken((t) => t + 1);
    }
    prevActive.current = active;
  }, [active]);

  useEffect(() => {
    const el = ref.current;
    if (!el || ready) return;
    if (typeof IntersectionObserver === "undefined") {
      setReady(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setReady(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ready]);

  return (
    <article className="overflow-hidden rounded-2xl border border-gold/25 bg-[oklch(0.14_0.04_145/0.7)] transition hover:border-gold/50">
      <div ref={ref} className="relative w-full bg-black">
        {ready ? (
          <CleanEmbed
            key={token}
            url={url}
            title={`${label} — Aldeia Velha`}
            onActivated={onActivate}
          />
        ) : (
          <div className="grid w-full place-items-center bg-black" style={{ aspectRatio: "100 / 104" }}>
            <Play className="h-8 w-8 fill-current text-gold/60" />
          </div>
        )}
      </div>
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--gradient-gold)] text-[11px] font-black text-forest-deep">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="truncate text-[13.5px] font-bold text-cream">{label}</span>
      </div>
    </article>
  );
}

/* -------------------------------- Página -------------------------------- */

function AldeiaVelhaPage() {
  const backTo = useLastArea();
  const [zoom, setZoom] = useState<Photo | null>(null);
  // Índice do documentário em reprodução. Só um toca por vez: ao tocar em outro,
  // o ativo anterior é remontado (e portanto parado).
  const [activeDoc, setActiveDoc] = useState<number | null>(null);
  const activateDoc = useCallback(
    (i: number) => setActiveDoc((cur) => (cur === i ? cur : i)),
    [],
  );
  const { tema } = Route.useSearch();
  const active = tema;
  const show = (id: string) => tema === id;
  const current = THEMES.find((t) => t.id === tema);
  const index = current ? THEMES.indexOf(current) : -1;
  const prev = index > 0 ? THEMES[index - 1] : undefined;
  const next = index >= 0 && index < THEMES.length - 1 ? THEMES[index + 1] : undefined;

  useEffect(() => {
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  }, [tema]);

  // Ao trocar de tema ou sair da página, interrompe qualquer áudio em curso.
  useEffect(() => {
    return () => stopHotspotAudio();
  }, [tema]);



  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Menu fixo */}
      <header className="sticky top-0 z-40 border-b border-gold/20 bg-[oklch(0.14_0.03_145/0.88)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5 md:px-8">
          <Link to={backTo as "/"} className="flex shrink-0 items-center gap-2.5">
            <img
              src={logoSrc}
              alt="AWÃ TECH"
              loading="lazy"
              decoding="async"
              className="h-9 w-9 shrink-0 rounded-full bg-cream/95 p-0.5 object-contain"
            />
            <span className="font-display text-base font-black tracking-tight text-cream">
              AWÃ <span className="text-leaf">TECH</span>
            </span>
          </Link>
          <Link
            to={backTo as "/"}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-foreground/80 transition hover:bg-leaf/15 hover:text-cream"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </div>
        <nav
          aria-label="Temas da história"
          className="border-t border-gold/15 bg-[oklch(0.12_0.03_145/0.6)]"
        >
          <div className="mx-auto flex max-w-6xl gap-1.5 overflow-x-auto px-3 py-2 md:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <Link
              to="/aldeia-velha"
              search={{}}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-[12px] font-bold uppercase tracking-wider transition ${
                !active
                  ? "border-gold/50 bg-gold/15 text-gold"
                  : "border-transparent text-foreground/65 hover:border-gold/25 hover:bg-gold/8 hover:text-cream"
              }`}
            >
              Todos os temas
            </Link>
            {THEMES.map((s) => (
              <Link
                key={s.id}
                to="/aldeia-velha"
                search={{ tema: s.id }}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-[12px] font-bold uppercase tracking-wider transition ${
                  active === s.id
                    ? "border-gold/50 bg-gold/15 text-gold"
                    : "border-transparent text-foreground/65 hover:border-gold/25 hover:bg-gold/8 hover:text-cream"
                }`}
              >
                {s.label}
              </Link>
            ))}
          </div>
        </nav>

      </header>

      {/* Capa (apenas na tela de temas) */}
      {!current && (
      <section className="relative isolate overflow-hidden">
        <img
          src={PHOTOS.capa.src}
          alt={PHOTOS.capa.alt}
          width={1280}
          height={720}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-[oklch(0.12_0.03_145)] via-[oklch(0.12_0.03_145/0.72)] to-[oklch(0.12_0.03_145/0.45)]"
        />
        <div className="relative mx-auto flex min-h-[68vh] max-w-6xl flex-col justify-end px-4 py-12 md:min-h-[80vh] md:px-8 md:py-16">
          <span className="chip-gold inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]">
            <Sparkles className="h-3.5 w-3.5" /> Somos Todos Aldeia Velha
          </span>
          <h1 className="mt-5 max-w-4xl font-display text-[2.1rem] font-black leading-[1.03] text-cream sm:text-5xl md:text-6xl">
            Aldeia Velha — <span className="text-gradient-gold">Território Ancestral</span> Pataxó
          </h1>
          <div className="divider-gold my-5 w-28" />
          <p className="max-w-2xl text-[15px] leading-relaxed text-cream/85 md:text-lg">
            Comunidade Indígena Pataxó Aldeia Velha (C.I.P.A.V.) — Arraial d'Ajuda, Porto Seguro,
            Bahia. Uma história de memória, resistência e luta contada pelos próprios moradores.
          </p>
          <div className="mt-7 flex flex-wrap gap-2">
            <Link
              to="/aldeia-velha"
              search={{ tema: "relatos" }}
              className="inline-flex items-center gap-2 rounded-xl border border-gold/40 bg-gold/12 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-gold backdrop-blur-sm transition hover:bg-gold/22"
            >
              <Quote className="h-4 w-4" /> Ouvir os anciãos
            </Link>
            <Link
              to="/aldeia-velha"
              search={{ tema: "retomada" }}
              className="inline-flex items-center gap-2 rounded-xl border border-cream/25 bg-cream/10 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-cream backdrop-blur-sm transition hover:bg-cream/18"
            >
              <Flame className="h-4 w-4" /> A retomada
            </Link>
          </div>
        </div>
        <div className="tribal-border absolute bottom-0 left-0 right-0" />
      </section>
      )}

      <main className="mx-auto max-w-6xl px-4 md:px-8">
        {/* Índice de temas (pastas) */}
        {!current && (
          <section className="pt-12 md:pt-16">
            <SectionTitle
              icon={<Sparkles className="h-3.5 w-3.5" />}
              eyebrow="Conteúdos organizados"
              title="Escolha um tema"
              desc="Cada tema reúne somente os conteúdos do seu assunto: relatos, território, escola, língua, cultura, saúde, projetos, fotos e vídeos."
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {THEMES.map((t) => (
                <Link
                  key={t.id}
                  to="/aldeia-velha"
                  search={{ tema: t.id }}
                  className="card-elev group flex flex-col overflow-hidden rounded-2xl transition hover:-translate-y-1 hover:shadow-[var(--shadow-glow)]"
                >
                  {t.photo && (
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <img
                        src={t.photo.src}
                        alt={t.photo.alt}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                      <div
                        aria-hidden
                        className="absolute inset-0 bg-gradient-to-t from-[oklch(0.12_0.03_145/0.85)] to-transparent"
                      />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-gold/85">
                      {t.eyebrow}
                    </span>
                    <h3 className="mt-2 font-display text-xl font-black text-cream">{t.label}</h3>
                    <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-foreground/75">
                      {t.summary}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-gold">
                      Abrir tema <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
            <p className="mt-8 pb-16 text-[13px] text-foreground/60">
              Fonte: relatório “Somos Todos Aldeia Velha” — Comunidade Indígena Pataxó Aldeia Velha
              (C.I.P.A.V.), Porto Seguro.
            </p>
          </section>
        )}

        {current && (
          <div className="pt-8">
            <Link
              to="/aldeia-velha"
              search={{}}
              className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1.5 text-[12px] font-bold uppercase tracking-wider text-gold transition hover:bg-gold/20"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Todos os temas
            </Link>
          </div>
        )}

        {/* Memória ancestral */}
        {show("memoria") && (
        <section id="memoria" className="scroll-mt-32 pt-14 md:pt-20">
          <SectionTitle
            audioId="memoria"
            icon={<Leaf className="h-3.5 w-3.5" />}
            eyebrow="Memória ancestral"
            title="Nossa presença é ancestral"
            desc="Este relatório foi produzido a partir da intimação para retirar nosso povo de nossa comunidade, deste solo sagrado. Reúne o relatório circunstancial de identificação e delimitação da TI Aldeia Velha, pesquisas de monografia, TCC e mestrados de indígenas moradores, entrevistas com moradores e, sobretudo, a vivência dos parentes neste território."
          />
          <div className="grid gap-5 md:grid-cols-3">
            <div className="card-elev rounded-2xl p-5 md:col-span-2">
              <p className="text-[15px] leading-relaxed text-foreground/85">
                Nossos direitos são originários e antecedem qualquer legislação construída pelos
                colonizadores. Os direitos à moradia, à saúde, à educação e à cultura são direitos
                fundamentais e se realizam em nosso território: sem o território não podemos dar
                continuidade à reprodução física, material e imaterial.
              </p>
              <p className="mt-4 text-[15px] leading-relaxed text-foreground/85">
                Sempre estivemos presentes neste território, mas ao longo das décadas fomos vítimas
                de opressão, expulsos por pessoas que se apropriaram de forma indevida destas
                terras. Foi-nos imposta a língua colonizadora e negado o direito de usar nossa
                língua materna, mas resistimos. A memória de luta foi passada pela oralidade — os
                saberes e fazeres sempre foram repassados de geração a geração. Foi assim que os
                Pataxó da Terra Indígena Aldeia Velha resistiram.
              </p>
              <blockquote className="mt-5 rounded-xl border-l-2 border-gold/60 bg-gold/5 p-4 text-[14px] italic leading-relaxed text-cream/85">
                “Os pataxós dominavam toda a faixa do extremo sul baiano... entre as quais a Aldeia
                de Santo Amaro (atual Aldeia Velha).”
                <footer className="mt-2 not-italic text-[12.5px] text-foreground/60">
                  Relatório das terras de Aldeia Velha, antropóloga Leila Silvia Burger
                  Sotto-Maior, Diário Oficial da União, 17/06/2008.
                </footer>
              </blockquote>
            </div>
            <div className="grid gap-4">
              <Figure photo={PHOTOS.sambaqui} onZoom={setZoom} ratio="aspect-[4/3]" />
              <Figure photo={PHOTOS.fornosAdobe} onZoom={setZoom} ratio="aspect-[4/3]" />
            </div>
          </div>
        </section>
        )}

        {/* Relatos dos anciãos */}
        {show("relatos") && (
        <section id="relatos" className="scroll-mt-32 pt-16 md:pt-24">
          <SectionTitle
            audioId="relatos"
            icon={<Quote className="h-3.5 w-3.5" />}
            eyebrow="Oralidade, resistência e luta"
            title="A palavra dos anciãos e anciãs"
            desc="A memória de Aldeia Velha vive na voz de quem nasceu, foi expulso e voltou para este território."
          />
          <div className="grid gap-5 sm:grid-cols-2">
            {ELDERS.map((e) => (
              <article key={e.name} className="card-elev flex flex-col overflow-hidden rounded-2xl">
                {e.photo && (
                  <button
                    type="button"
                    onClick={() => setZoom(e.photo!)}
                    aria-label={`Ampliar foto: ${e.photo.caption}`}
                    className="group relative aspect-[16/9] w-full overflow-hidden"
                  >
                    <img
                      src={e.photo.src}
                      alt={e.photo.alt}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <span className="absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full border border-gold/40 bg-[oklch(0.14_0.04_145/0.75)] text-gold opacity-0 backdrop-blur-sm transition group-hover:opacity-100">
                      <ZoomIn className="h-4 w-4" />
                    </span>
                  </button>
                )}
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-display text-lg font-black leading-tight text-cream">
                    {e.name}
                  </h3>
                  <p className="mt-1 text-[12.5px] uppercase tracking-wider text-gold/85">
                    {e.role}
                  </p>
                  <blockquote className="mt-4 border-l-2 border-gold/50 pl-3 text-[14.5px] italic leading-relaxed text-cream/85">
                    “{e.quote}”
                  </blockquote>
                  <p className="mt-4 text-[13.5px] leading-relaxed text-foreground/75">
                    {e.detail}
                  </p>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Figure photo={PHOTOS.caciqueIpe} onZoom={setZoom} ratio="aspect-[4/3]" />
            <Figure photo={PHOTOS.antonioNobre} onZoom={setZoom} ratio="aspect-[4/3]" />
            <Figure photo={PHOTOS.residencias} onZoom={setZoom} ratio="aspect-[4/3]" />
          </div>
        </section>
        )}

        {/* Linha do tempo */}
        {show("retomada") && (
        <section id="retomada" className="scroll-mt-32 pt-16 md:pt-24">
          <SectionTitle
            audioId="retomada"
            icon={<Flame className="h-3.5 w-3.5" />}
            eyebrow="Linha do tempo"
            title="A retomada do território"
            desc="Da presença ancestral às expulsões, das primeiras investidas à retomada definitiva de 1998 e à homologação da Terra Indígena."
          />
          <Figure
            photo={PHOTOS.retomada1998}
            onZoom={setZoom}
            ratio="aspect-[16/9]"
            className="mb-8"
          />
          <ol className="relative ml-3 border-l border-gold/25 pl-6 md:ml-6 md:pl-9">
            {TIMELINE.map((item) => (
              <li key={item.year} className="relative pb-8 last:pb-0">
                <span
                  aria-hidden
                  className={`absolute -left-[31px] top-1.5 grid place-items-center rounded-full md:-left-[43px] ${
                    item.highlight
                      ? "h-5 w-5 bg-[var(--gradient-gold)] shadow-[var(--shadow-gold)]"
                      : "h-3 w-3 bg-leaf"
                  }`}
                />
                <div
                  className={`rounded-2xl p-4 md:p-5 ${
                    item.highlight
                      ? "card-elev border border-gold/45 bg-gold/8"
                      : "border border-gold/12 bg-[oklch(0.14_0.04_145/0.55)]"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[12px] font-black tracking-wider ${
                        item.highlight
                          ? "bg-[var(--gradient-gold)] text-forest-deep"
                          : "chip-gold"
                      }`}
                    >
                      {item.year}
                    </span>
                    {item.highlight && (
                      <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-gold">
                        Marco da comunidade
                      </span>
                    )}
                  </div>
                  <h3 className="mt-2.5 font-display text-lg font-black text-cream md:text-xl">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-foreground/80">
                    {item.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>
        )}

        {/* Território */}
        {show("territorio") && (
        <section id="territorio" className="scroll-mt-32 pt-16 md:pt-24">
          <SectionTitle
            audioId="territorio"
            icon={<Landmark className="h-3.5 w-3.5" />}
            eyebrow="Localização e caracterização"
            title="O território e seus dados"
            desc="A Terra Indígena Pataxó Aldeia Velha fica no extremo sul da Bahia, região de Mata Atlântica, no distrito de Arraial d'Ajuda, município de Porto Seguro."
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {TERRITORY_FACTS.map((f) => (
              <div
                key={f.label}
                className="rounded-2xl border border-gold/20 bg-[oklch(0.14_0.04_145/0.7)] p-4"
              >
                <div className="font-display text-xl font-black text-gradient-gold">{f.value}</div>
                <div className="mt-1 text-[13px] font-bold text-cream">{f.label}</div>
                <div className="mt-0.5 text-[12.5px] text-foreground/65">{f.sub}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Figure photo={PHOTOS.reservaPlaca} onZoom={setZoom} ratio="aspect-[4/3]" />
            <Figure photo={PHOTOS.entradaTI} onZoom={setZoom} ratio="aspect-[4/3]" />
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div className="card-elev rounded-2xl p-5">
              <h3 className="flex items-center gap-2 font-display text-lg font-black text-cream">
                <Home className="h-4 w-4 text-gold" /> A vida na aldeia
              </h3>
              <p className="mt-3 text-[14.5px] leading-relaxed text-foreground/80">
                O território possui área de preservação ambiental, com três sítios arqueológicos, um
                sambaqui e uma área de manguezal banhada pelo rio Buranhém. Há espaços de vegetação
                rasteira e frutífera onde se distribuem as principais moradias, a escola, o posto de
                saúde e pequenos comércios. As construções são de blocos e lajotas com telha de
                cerâmica, a maioria vinda do projeto de moradias sociais, e ainda existem
                construções de taipa. As residências têm energia elétrica fornecida pela COELBA.
              </p>
            </div>
            <div className="card-elev rounded-2xl p-5">
              <h3 className="flex items-center gap-2 font-display text-lg font-black text-cream">
                <Droplets className="h-4 w-4 text-gold" /> Água e infraestrutura
              </h3>
              <p className="mt-3 text-[14.5px] leading-relaxed text-foreground/80">
                O abastecimento principal vem de encanações ligadas a um poço mantido pela SESAI, e
                outros poços ajudam na distribuição — ainda precária. Há um poço cavado da CERB e um
                projeto aprovado para ampliar a rede na comunidade. Em 2002 foi conquistado o
                primeiro poço artesiano, com caixa de 10.000 litros; em 2008 foi instalada uma nova
                caixa de 30.000 litros.
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Figure photo={PHOTOS.reservatorio} onZoom={setZoom} ratio="aspect-[16/10]" />
            <Figure photo={PHOTOS.casasHabitacional} onZoom={setZoom} ratio="aspect-[16/10]" />
          </div>

          <div className="mt-6 card-elev rounded-2xl p-5">
            <h3 className="font-display text-lg font-black text-cream">População</h3>
            <p className="mt-2 text-[13.5px] leading-relaxed text-foreground/70">
              Os dados divergem entre as instituições: nenhuma delas tem um sistema com dados
              atualizados diante do fluxo de pessoas.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {POPULATION.map((pop) => (
                <div
                  key={pop.source}
                  className="rounded-xl border border-gold/20 bg-[oklch(0.14_0.04_145/0.6)] p-4"
                >
                  <div className="text-[12px] uppercase tracking-wider text-gold/85">
                    {pop.source}
                  </div>
                  <div className="mt-2 font-display text-lg font-black text-cream">
                    {pop.families}
                  </div>
                  <div className="text-[14px] text-foreground/75">{pop.people}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
        )}

        {/* Educação */}
        {show("educacao") && (
        <section id="educacao" className="scroll-mt-32 pt-16 md:pt-24">
          <SectionTitle
            audioId="educacao"
            icon={<GraduationCap className="h-3.5 w-3.5" />}
            eyebrow="Educação escolar indígena"
            title="A escola é o coração da comunidade"
            desc="É através dela que todos os processos da comunidade são discutidos: as reuniões comunitárias, os projetos societários e o fortalecimento do ensino com a valorização dos conhecimentos tradicionais."
          />
          <div className="grid gap-5 md:grid-cols-2">
            <div className="card-elev overflow-hidden rounded-2xl">
              <div className="border-b border-gold/20 bg-gold/8 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-gold">
                Antes · 1998–2000
              </div>
              <Figure
                photo={PHOTOS.escolaAntiga}
                onZoom={setZoom}
                ratio="aspect-[16/9]"
                className="!rounded-none !border-0 !shadow-none"
              />
              <p className="px-5 pb-5 text-[14.5px] leading-relaxed text-foreground/80">
                Após a retomada de 1998, os indígenas abriram à mão uma trilha de cerca de mil
                metros, com vários contornos para não afetar a mata. Construíram dois kigemes
                (cabanas): em uma delas começaram as aulas, em abril de 1998, em turma
                multisseriada, com 20 alunos. Depois, a farinheira foi compartilhada como sala de
                aula por cerca de três anos.
              </p>
            </div>
            <div className="card-elev overflow-hidden rounded-2xl">
              <div className="border-b border-leaf/30 bg-leaf/10 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-leaf">
                Hoje · Escola Indígena Pataxó Aldeia Velha
              </div>
              <Figure
                photo={PHOTOS.escolaAtual}
                onZoom={setZoom}
                ratio="aspect-[16/9]"
                className="!rounded-none !border-0 !shadow-none"
              />
              <p className="px-5 pb-5 text-[14.5px] leading-relaxed text-foreground/80">
                Uma educação intercultural específica e diferenciada, no centro das moradias. São 12
                salas climatizadas — sala de vídeo, biblioteca, atendimento educacional
                especializado e salas de oficinas —, além de secretaria, cozinha com refeitório,
                atendendo 235 estudantes da educação infantil aos anos finais. A área externa é
                murada, com quadra poliesportiva e espaço para as modalidades esportivas indígenas
                tradicionais.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <Figure photo={PHOTOS.jogosInfanto} onZoom={setZoom} ratio="aspect-[16/10]" />
            <div className="card-elev rounded-2xl p-5">
              <h3 className="font-display text-lg font-black text-cream">
                Dois eixos de uma pedagogia indígena
              </h3>
              <div className="mt-4 space-y-4">
                <div>
                  <div className="text-[12px] uppercase tracking-wider text-gold/85">
                    Jogos Infanto-Juvenis
                  </div>
                  <p className="mt-1 text-[14px] leading-relaxed text-foreground/80">
                    Segundo o professor Txaywã, incentivam as crianças desde cedo às práticas
                    esportivas culturais, com modalidades, brincadeiras e instrumentos do cotidiano
                    da comunidade — fundamentais para o fortalecimento e a afirmação da identidade
                    cultural Pataxó (LIRA, 2018).
                  </p>
                </div>
                <div>
                  <div className="text-[12px] uppercase tracking-wider text-gold/85">
                    Intercâmbio Cultural e Intercultural
                  </div>
                  <p className="mt-1 text-[14px] leading-relaxed text-foreground/80">
                    De acordo com a professora Ahnã, é desenvolvido pela vivência de alunos,
                    professores, lideranças e integrantes do Grupo de Cultura nas comunidades Pataxó
                    de Porto Seguro, pesquisando aspectos físicos, culturais e econômicos
                    (GUEDES, 2023).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        )}

        {/* Patxôhã */}
        {show("patxoha") && (
        <section id="patxoha" className="scroll-mt-32 pt-16 md:pt-24">
          <SectionTitle
            audioId="patxoha"
            icon={<Languages className="h-3.5 w-3.5" />}
            eyebrow="Língua materna"
            title="Patxôhã, identidade própria"
            desc="A disciplina de língua materna vai além da escrita, da gramática e da oralidade: trabalha as histórias, a cosmologia e a valorização da cultura tradicional Pataxó."
          />
          <div className="grid gap-5 md:grid-cols-5">
            <Figure
              photo={PHOTOS.cooficializacao}
              onZoom={setZoom}
              ratio="aspect-[16/9]"
              className="md:col-span-3"
            />
            <div className="card-elev rounded-2xl p-5 md:col-span-2">
              <div className="font-display text-3xl font-black text-gradient-gold">2023</div>
              <h3 className="mt-1 font-display text-lg font-black text-cream">
                Cooficialização no município
              </h3>
              <p className="mt-3 text-[14.5px] leading-relaxed text-foreground/80">
                No ano de 2023 a língua materna Patxôhã foi cooficializada em Porto Seguro. Foi-nos
                imposta a língua colonizadora e negado o direito de usar nossa língua materna — mas
                resistimos, com inúmeras estratégias de nossos anciãos para dar continuidade às
                nossas crenças, costumes e tradições.
              </p>
              <Link
                to="/dicionario"
                className="mt-5 inline-flex items-center gap-2 rounded-xl border border-gold/35 bg-gold/12 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-gold transition hover:bg-gold/22"
              >
                <BookOpen className="h-4 w-4" /> Dicionário Patxôhã
              </Link>
            </div>
          </div>
        </section>
        )}

        {/* Cultura */}
        {show("cultura") && (
        <section id="cultura" className="scroll-mt-32 pt-16 md:pt-24">
          <SectionTitle
            audioId="cultura"
            icon={<Music className="h-3.5 w-3.5" />}
            eyebrow="Preservação ambiental e cultural"
            title="A cultura que sustenta a aldeia"
            desc="Ahnã Pataxó afirma que este é um território sagrado: desde o início da retomada o grupo trabalhou o fortalecimento da cultura e a preservação ambiental."
          />
          <div className="grid gap-4 md:grid-cols-3">
            <Figure
              photo={PHOTOS.grupoCultura2}
              onZoom={setZoom}
              ratio="aspect-[16/9]"
              className="md:col-span-2"
            />
            <Figure photo={PHOTOS.cantoDanca} onZoom={setZoom} ratio="aspect-[16/9]" />
          </div>
          <div className="mt-5 grid gap-5 md:grid-cols-3">
            <div className="card-elev rounded-2xl p-5 md:col-span-2">
              <p className="text-[15px] leading-relaxed text-foreground/85">
                Em 2004, Ahnã juntou-se ao grupo com Patxia, Paty, Tapurumã, anciãos, anciãs e
                crianças, e foram para a reserva fortalecer as atividades de etnoturismo. “Aquela
                reserva foi uma universidade”: formou pessoas de dentro e de fora do território.
                Assim nasceu o Grupo de Cultura da Aldeia, que continua ativo preservando e
                divulgando a cultura Pataxó através do canto e da dança.
              </p>
              <p className="mt-4 text-[15px] leading-relaxed text-foreground/85">
                Eyhnã tinha uns 15 anos quando iniciou os trabalhos na reserva e conta que aprendeu
                a trabalhar com a natureza olhando os mais velhos na proteção daquele solo sagrado.
                Tapurumã relata que o trabalho levou a cultura e o nome da comunidade a vários
                lugares, como o Salão Nacional de Turismo em São Paulo, Ilha de Comandatuba e
                Salvador. Patxia lembra a constituição da Associação de Ecoturismo e os intercâmbios
                com os parentes de Barra Velha e da Reserva da Jaqueira. Mangaga conta que tudo
                começou em 2000, com um grupo pequeno.
              </p>
              <blockquote className="mt-5 rounded-xl border-l-2 border-gold/60 bg-gold/5 p-4 text-[14px] italic leading-relaxed text-cream/85">
                “Uma aldeia sem cultura, sem um grupo que mantenha viva a tradição, os cantos e as
                rezas, acaba não sendo uma aldeia, tornando-se apenas um ‘bairro’ não indígena.”
                <footer className="mt-2 not-italic text-[12.5px] text-foreground/60">
                  Romã, membro do Grupo de Cultura da Aldeia Velha
                </footer>
              </blockquote>
            </div>
            <div className="grid gap-4">
              <Figure photo={PHOTOS.grupoCultura1} onZoom={setZoom} ratio="aspect-[4/3]" />
              <Figure photo={PHOTOS.museuCeuAberto} onZoom={setZoom} ratio="aspect-[4/3]" />
            </div>
          </div>
        </section>
        )}

        {/* Saúde */}
        {show("saude") && (
        <section id="saude" className="scroll-mt-32 pt-16 md:pt-24">
          <SectionTitle
            audioId="saude"
            icon={<Heart className="h-3.5 w-3.5" />}
            eyebrow="Saberes tradicionais e saúde"
            title="Duas medicinas que caminham juntas"
            desc="A resistência Pataxó preservou um rico sistema de medicina tradicional que coexiste com os serviços institucionais do SasiSUS e deve ser valorizado como parte da atenção à saúde indígena."
          />
          <div className="grid gap-5 lg:grid-cols-2">
            {/* Tradicional */}
            <div className="card-elev overflow-hidden rounded-2xl">
              <div className="flex items-center gap-2 border-b border-leaf/30 bg-leaf/10 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-leaf">
                <Leaf className="h-3.5 w-3.5" /> Saúde indígena tradicional
              </div>
              <div className="p-5">
                <p className="text-[14.5px] leading-relaxed text-foreground/85">
                  Vários anciãos e anciãs cuidam da saúde dos moradores com o conhecimento das ervas
                  medicinais retiradas da fauna e dos quintais produtivos, com benzimentos, rezas e
                  cantos. Nossa Pajé Jaçanã (Maria d'Ajuda Alves da Conceição) — parteira,
                  benzedeira e remedeira — cultiva as ervas em seu quintal e relata ter realizado
                  mais de mil partos sem nenhum óbito.
                </p>
                <p className="mt-4 text-[14.5px] leading-relaxed text-foreground/85">
                  Dona Esmeralda é outra referência comunitária: aprendeu com sua mãe e faz a
                  “garrafada”, remédio de várias ervas medicinais, e xaropes para doenças crônicas e
                  respiratórias (ANDRADE, 2016). Dona Coruja Pataxó, da Aldeia Pará (Barra Velha),
                  compartilha receituários com cardo santo, nega mina, melão de São Caetano e
                  gerbão. Potira Beatriz aprendeu com seu pai, rezador e pajé, e transmite esse
                  conhecimento também em um canal na rede social.
                </p>
                <p className="mt-4 text-[14.5px] leading-relaxed text-foreground/85">
                  A transmissão desses saberes é oral e gestual, no âmbito familiar e comunitário. A
                  escola integra esses conhecimentos ao currículo com projetos como o “Quintal
                  Pedagógico” (2010–2013), realizado no quintal da Pajé Jaçanã, e o “Encontro
                  Saberes e Fazeres de Mestres Indígenas”, com representantes de 13 aldeias.
                </p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <Figure photo={PHOTOS.esmeraldaJacana} onZoom={setZoom} ratio="aspect-[4/3]" />
                  <Figure photo={PHOTOS.encontroPajes} onZoom={setZoom} ratio="aspect-[4/3]" />
                </div>
              </div>
            </div>

            {/* Institucional */}
            <div className="card-elev overflow-hidden rounded-2xl">
              <div className="flex items-center gap-2 border-b border-gold/25 bg-gold/8 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-gold">
                <Stethoscope className="h-3.5 w-3.5" /> Serviço de saúde institucional
              </div>
              <div className="p-5">
                <p className="text-[14.5px] leading-relaxed text-foreground/85">
                  A comunidade é atendida pelo PSF gerido pelo Polo Base de Porto Seguro/SESAI. A
                  estrutura foi ampliada com apoio da secretaria municipal e as salas foram
                  climatizadas com apoio do Grupo de Cultura e parcerias. Hoje há recepção,
                  consultório odontológico, enfermaria, clínico geral, farmácia e alojamento para os
                  motoristas da equipe.
                </p>
                <p className="mt-4 text-[14.5px] leading-relaxed text-foreground/85">
                  A Unidade Básica de Saúde Indígena (UBSI) oferta serviços de baixa complexidade
                  pela Equipe Multidisciplinar de Saúde Indígena (EMSI) itinerante: pré-natal,
                  vacinação, acompanhamento de hipertensão e diabetes e do crescimento e
                  desenvolvimento de crianças, entre outros.
                </p>
                <p className="mt-4 text-[14.5px] leading-relaxed text-foreground/85">
                  Lindibergue, filho de D. Nair e Gilbergue, foi o primeiro agente de saúde
                  indígena, cuidando dos parentes sem transporte e sem água encanada. Buriti, o
                  primeiro secretário do conselho de saúde, relata a conquista do saneamento dos
                  primeiros banheiros, dos primeiros atendimentos médicos em uma cabana, dos
                  primeiros carros e da construção do primeiro PSF.
                </p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <Figure photo={PHOTOS.postoSaude} onZoom={setZoom} ratio="aspect-[4/3]" />
                  <Figure photo={PHOTOS.potiraBuriti} onZoom={setZoom} ratio="aspect-[4/3]" />
                </div>
                <div className="mt-5 rounded-xl border border-gold/20 bg-[oklch(0.14_0.04_145/0.6)] p-4">
                  <div className="text-[12px] uppercase tracking-wider text-gold/85">
                    Perfil demográfico da saúde
                  </div>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {HEALTH_DEMOGRAPHICS.map((h) => (
                      <li key={h.label} className="flex items-baseline gap-2">
                        <span className="font-display text-lg font-black text-gradient-gold">
                          {h.value}
                        </span>
                        <span className="text-[13px] text-foreground/75">{h.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
        )}

        {/* Projetos */}
        {show("projetos") && (
        <section id="projetos" className="scroll-mt-32 pt-16 md:pt-24">
          <SectionTitle
            audioId="projetos"
            icon={<Sparkles className="h-3.5 w-3.5" />}
            eyebrow="Projetos sociais e culturais"
            title="Associações, parcerias e conquistas"
            desc="Ao longo dos anos a comunidade constituiu associações comunitárias para buscar projetos que ajudassem a aldeia em todos os aspectos."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PROJECTS.map((pr) => (
              <article
                key={pr.name}
                className="card-elev flex flex-col rounded-2xl p-5 transition hover:-translate-y-1 hover:shadow-[var(--shadow-glow)]"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="chip-gold rounded-full px-2.5 py-0.5 text-[12px] font-black">
                    {pr.year}
                  </span>
                  <span className="text-[11px] uppercase tracking-wider text-foreground/55">
                    {pr.org}
                  </span>
                </div>
                <h3 className="mt-3 font-display text-[17px] font-black leading-snug text-cream">
                  {pr.name}
                </h3>
                <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-foreground/75">
                  {pr.audience}
                </p>
                {pr.support !== "—" && (
                  <p className="mt-3 border-t border-gold/15 pt-3 text-[12.5px] text-gold/80">
                    {pr.support}
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>
        )}

        {/* Galeria */}
        {show("galeria") && (
        <section id="galeria" className="scroll-mt-32 pt-16 md:pt-24">
          <SectionTitle
            audioId="galeria"
            icon={<ZoomIn className="h-3.5 w-3.5" />}
            eyebrow="Galeria"
            title="As fotos da comunidade"
            desc="Toque em qualquer foto para ampliar. Todas as imagens são registros da própria comunidade, reunidos no relatório Somos Todos Aldeia Velha."
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {GALLERY.map((g) => (
              <Figure key={g.src} photo={g} onZoom={setZoom} ratio="aspect-square" />
            ))}
          </div>
        </section>
        )}

        {/* Documentários */}
        {show("documentarios") && (
        <section id="documentarios" className="scroll-mt-32 pt-16 md:pt-24">
          <SectionTitle
            audioId="documentarios"
            icon={<ExternalLink className="h-3.5 w-3.5" />}
            eyebrow="Documentários e entrevistas"
            title="Vozes em vídeo"
            desc="Documentários e entrevistas realizadas com os moradores da Aldeia Velha e com parceiros que lutam pelo direito de estarmos em nosso território tradicional."
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {DOC_LINKS.map((url, i) => (
              <DocumentaryCard
                key={url}
                url={url}
                index={i}
                active={activeDoc === i}
                onActivate={() => activateDoc(i)}
              />
            ))}
          </div>
        </section>
        )}

        {/* Referências */}
        {show("referencias") && (
        <section id="referencias" className="scroll-mt-32 pb-20 pt-16 md:pt-24">
          <SectionTitle
            audioId="referencias"
            icon={<BookOpen className="h-3.5 w-3.5" />}
            eyebrow="Fontes"
            title="Referências"
          />
          <ol className="card-elev space-y-3 rounded-2xl p-5">
            {REFERENCES.map((r) => (
              <li
                key={r}
                className="border-b border-gold/10 pb-3 text-[13.5px] leading-relaxed text-foreground/78 last:border-0 last:pb-0"
              >
                {r}
              </li>
            ))}
          </ol>
          <div className="mt-5 rounded-2xl border border-gold/20 bg-[oklch(0.14_0.04_145/0.6)] p-5">
            <div className="text-[12px] uppercase tracking-wider text-gold/85">
              Sistematização dos relatos
            </div>
            <p className="mt-2 text-[14px] leading-relaxed text-foreground/80">{AUTHOR_NOTE}</p>
            <p className="mt-4 text-[13px] text-foreground/60">
              Fonte: relatório “Somos Todos Aldeia Velha” — Comunidade Indígena Pataxó Aldeia Velha
              (C.I.P.A.V.), Porto Seguro, junho de 2026.
            </p>
          </div>
        </section>
        )}

        {current && (
          <nav
            aria-label="Navegar entre temas"
            className="flex flex-wrap items-center justify-between gap-3 border-t border-gold/15 py-8 md:py-10"
          >
            {prev ? (
              <Link
                to="/aldeia-velha"
                search={{ tema: prev.id }}
                className="inline-flex items-center gap-2 rounded-xl border border-gold/25 bg-[oklch(0.14_0.04_145/0.7)] px-4 py-2.5 text-[12px] font-bold uppercase tracking-wider text-cream transition hover:border-gold/50 hover:bg-gold/10"
              >
                <ArrowLeft className="h-4 w-4 text-gold" /> {prev.label}
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link
                to="/aldeia-velha"
                search={{ tema: next.id }}
                className="inline-flex items-center gap-2 rounded-xl border border-gold/25 bg-[oklch(0.14_0.04_145/0.7)] px-4 py-2.5 text-[12px] font-bold uppercase tracking-wider text-cream transition hover:border-gold/50 hover:bg-gold/10"
              >
                {next.label} <ArrowRight className="h-4 w-4 text-gold" />
              </Link>
            )}
          </nav>
        )}
      </main>


      <PublicFooter />

      {zoom && <Lightbox photo={zoom} onClose={() => setZoom(null)} />}
    </div>
  );
}

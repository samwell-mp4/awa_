import { Award, Flame, Sparkles, Star, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useTranslation } from "react-i18next";
import heroAsset from "@/assets/awa-hero.jpg.asset.json";
import { Stat } from "./stat";
import { useUserStats } from "@/hooks/use-user-stats";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const heroWoman = heroAsset.url;

export function HeroSection() {
  const { t } = useTranslation();
  const { points, level, streak } = useUserStats();
  const { user } = useAuth();
  const [liveName, setLiveName] = useState<string | null>(null);
  const { data: profile } = useQuery({
    queryKey: ["profile-name", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("name").eq("id", user!.id).maybeSingle();
      return data;
    },
  });
  useEffect(() => {
    if (!user?.id) return;
    const ch = supabase
      .channel(`profile-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles", filter: `id=eq.${user.id}` },
        (payload) => {
          const next = (payload.new as { name?: string } | null)?.name;
          if (next) setLiveName(next);
        },
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user?.id]);
  const displayName =
    liveName ||
    profile?.name ||
    (user?.user_metadata as { name?: string } | undefined)?.name ||
    (user?.email ? user.email.split("@")[0] : null) ||
    "Akuá!";
  const [hidden, setHidden] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const draggingRef = useRef<{ dx: number; dy: number; moved: boolean } | null>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onMove(e: PointerEvent) {
      const d = draggingRef.current;
      if (!d) return;
      d.moved = true;
      const parent = badgeRef.current?.parentElement?.getBoundingClientRect();
      if (!parent) return;
      setPos({ x: e.clientX - parent.left - d.dx, y: e.clientY - parent.top - d.dy });
    }
    function onUp() {
      draggingRef.current = null;
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);
  return (
    <section id="início" className="relative mt-6 overflow-hidden rounded-[2rem] card-elev">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "var(--gradient-hero-glow)" }}
      />
      <div className="relative grid md:grid-cols-2">
        <div className="relative order-2 md:order-1 p-6 md:p-12">
          <span className="chip-gold inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]">
            <Sparkles className="h-3.5 w-3.5" /> {t("hero.badge")}
          </span>
          <h1 className="mt-5 font-display text-[2rem] font-black leading-[1.05] text-cream sm:text-4xl md:text-4xl lg:text-6xl">
            {t("hero.title1")} <span className="text-leaf">{t("hero.title2")}</span>
            {t("hero.title3")}{" "}
            <span className="text-gradient-gold">{t("hero.title4")}</span>.
          </h1>
          <div className="divider-gold my-5 w-24" />
          <p className="max-w-md text-[15px] leading-relaxed text-foreground/80">
            {t("hero.subtitle")}
          </p>


          <div className="mt-6 grid grid-cols-3 gap-2 rounded-2xl border border-gold/25 bg-[oklch(0.14_0.04_145/0.7)] p-3 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <Stat icon={<Flame className="h-4 w-4 text-gold" />} label={t("hero.sequencia")} value={String(streak)} sub={t("hero.dias")} />
            <Stat icon={<Star className="h-4 w-4 text-gold" />} label={t("hero.pontos")} value={String(points)} sub={t("hero.pontosSub")} />
            <Stat icon={<Award className="h-4 w-4 text-gold" />} label={t("hero.nivel")} value={String(level)} sub={t("hero.nivelSub")} />
          </div>
        </div>

        <div className="relative order-1 md:order-2 min-h-[300px] md:min-h-[560px]">
          <img
            src={heroWoman}
            alt="Mulher indígena brasileira com cocar tradicional na floresta amazônica"
            width={1024}
            height={1536}
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent md:bg-gradient-to-r md:from-card md:via-card/10 md:to-transparent" />
          {!hidden && (
            <div
              ref={badgeRef}
              onPointerDown={(e) => {
                const rect = badgeRef.current!.getBoundingClientRect();
                const parent = badgeRef.current!.parentElement!.getBoundingClientRect();
                if (!pos) setPos({ x: rect.left - parent.left, y: rect.top - parent.top });
                draggingRef.current = { dx: e.clientX - rect.left, dy: e.clientY - rect.top, moved: false };
                (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
              }}
              style={pos ? { left: pos.x, top: pos.y, right: "auto" } : undefined}
              className="absolute right-4 top-4 flex items-center gap-2 rounded-full border border-gold/40 bg-card/85 px-3 py-1.5 backdrop-blur-md shadow-[var(--shadow-gold)] cursor-grab active:cursor-grabbing touch-none select-none"
            >
              <div className="grid h-7 w-7 place-items-center rounded-full bg-[var(--gradient-gold)] text-[10px] font-black text-forest-deep">
                {displayName.trim().slice(0, 2).toUpperCase()}
              </div>
              <div className="text-xs leading-tight">
                <div className="text-foreground/70">{t("hero.ola")}</div>
                <div className="font-bold text-gold truncate max-w-[140px]">{displayName}</div>
              </div>
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => setHidden(true)}
                aria-label="Fechar"
                className="ml-1 grid h-5 w-5 place-items-center rounded-full bg-forest-deep/60 text-gold hover:bg-forest-deep"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="tribal-border absolute bottom-0 left-0 right-0" />
    </section>
  );
}

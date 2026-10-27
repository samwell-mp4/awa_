import { useTranslation } from "react-i18next";
import logoSrc from "@/assets/awa-tech-logo.png";
import kidsLogoRef from "@/assets/infantil-logo-ref.png";
import infantilLogoJson from "@/assets/infantil-logo-new.jpg.asset.json";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getSiteConfig } from "@/lib/admin-layout.functions";

export type LogoMode = "adulto" | "infantil";
export type LogoVariant = "light" | "dark";

export interface LogoProps {
  mode?: LogoMode;
  variant?: LogoVariant;
  className?: string;
}

export function Logo({ mode = "adulto", variant, className = "" }: LogoProps) {
  const { t, i18n } = useTranslation();
  const getFn = useServerFn(getSiteConfig);

  const { data: branding } = useQuery({
    queryKey: ["site_config", "branding"],
    queryFn: () => getFn({ data: "branding" }),
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const infantilFallback = kidsLogoRef || (infantilLogoJson as any)?.url || logoSrc;

  const currentLogo = mode === "infantil" 
    ? (branding?.infantil_logo_url || infantilFallback)
    : (branding?.adulto_logo_url || logoSrc);

  // Default variant: Adult pages are dark by default (matching official site in Image 1); kids pages are light by default
  const effectiveVariant: LogoVariant = variant || (mode === "adulto" ? "dark" : "light");

  // Use i18n.isInitialized to ensure we don't render empty text during hydration
  const tagline = i18n.isInitialized ? t("common.tagline") : "";

  // Badge styling depending on mode & variant
  let badgeRing = "ring-2 ring-gold/60 bg-cream/95 shadow-[var(--shadow-gold)]";
  let glowStyle = "bg-[var(--gradient-gold)] opacity-35 blur-md";

  if (mode === "infantil") {
    if (effectiveVariant === "dark") {
      badgeRing = "ring-2 ring-[#ffd166]/80 bg-[#2a160a] shadow-[0_0_12px_rgba(255,209,102,0.3)]";
      glowStyle = "bg-[#ffd166] opacity-30 blur-md";
    } else {
      badgeRing = "ring-2 ring-amber-400 bg-white shadow-sm";
      glowStyle = "bg-amber-400 opacity-25 blur-sm";
    }
  } else if (effectiveVariant === "light") {
    badgeRing = "ring-2 ring-emerald-900/20 bg-white shadow-xs";
    glowStyle = "bg-emerald-900/10 opacity-20 blur-sm";
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative shrink-0 w-12 h-12">
        <div className={`absolute -inset-1 rounded-full ${glowStyle}`} />
        <img
          src={currentLogo}
          alt="AWÃ TECH"
          width={48}
          height={48}
          onError={(e) => {
            e.currentTarget.src = logoSrc;
          }}
          className={`relative h-12 w-12 rounded-full p-0.5 object-contain transition-transform duration-200 group-hover:scale-105 ${badgeRing}`}
          fetchPriority="high"
          loading="eager"
        />
      </div>

      <div className="leading-none select-none">
        {mode === "adulto" && effectiveVariant === "dark" && (
          // Official Adult Dark Header/Footer (Exact match to Image 1)
          <>
            <div className="font-display text-lg sm:text-xl font-black tracking-tight text-cream">
              <span style={{ color: "#fefae0" }}>AWÃ</span>{" "}
              <span
                className="text-gradient-gold font-black"
                style={{
                  background: "linear-gradient(135deg, #ffd166 0%, #f59e0b 55%, #d97706 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                TECH
              </span>
            </div>
            <div
              className="mt-0.5 text-[9px] sm:text-[10px] font-bold tracking-[0.22em] uppercase min-h-[1.2em] text-gold/90"
              style={{ color: "#d4a373" }}
              suppressHydrationWarning
            >
              {tagline}
            </div>
          </>
        )}

        {mode === "adulto" && effectiveVariant === "light" && (
          // Adult Light Surface (e.g. Landing Page header)
          <>
            <div className="font-display text-lg sm:text-xl font-black tracking-tight text-[#11231b]">
              <span>AWÃ</span>{" "}
              <span className="text-[#2d6a4f]" style={{ color: "#2d6a4f" }}>TECH</span>
            </div>
            <div
              className="mt-0.5 text-[9px] sm:text-[10px] font-bold tracking-[0.2em] uppercase min-h-[1.2em] text-[#b47e28]"
              style={{ color: "#b47e28" }}
              suppressHydrationWarning
            >
              {tagline}
            </div>
          </>
        )}

        {mode === "infantil" && effectiveVariant === "light" && (
          // Infantil Light Header (Harmonic, playful emerald & amber)
          <>
            <div className="font-display text-lg sm:text-xl font-black tracking-tight text-emerald-950">
              <span style={{ color: "#064e3b" }}>AWÃ</span>{" "}
              <span className="text-emerald-600" style={{ color: "#059669" }}>TECH</span>
            </div>
            <div
              className="mt-0.5 text-[9px] sm:text-[10px] font-black tracking-[0.2em] uppercase min-h-[1.2em] text-amber-800"
              style={{ color: "#92400e" }}
              suppressHydrationWarning
            >
              {tagline}
            </div>
          </>
        )}

        {mode === "infantil" && effectiveVariant === "dark" && (
          // Infantil Dark Surface (Kids Footer & Dark Kids Sidebar)
          // Uses bright warm cream and sunny gold so it never blends into dark brown!
          <>
            <div className="font-display text-lg sm:text-xl font-black tracking-tight text-[#fefae0]">
              <span style={{ color: "#fefae0" }}>AWÃ</span>{" "}
              <span
                className="font-black"
                style={{
                  color: "#ffd166",
                  textShadow: "0 1px 3px rgba(0,0,0,0.6)",
                }}
              >
                TECH
              </span>
            </div>
            <div
              className="mt-0.5 text-[9px] sm:text-[10px] font-bold tracking-[0.2em] uppercase min-h-[1.2em]"
              style={{ color: "#d4a373" }}
              suppressHydrationWarning
            >
              {tagline}
            </div>
          </>
        )}
      </div>
    </div>
  );
}


import { useTranslation } from "react-i18next";
import logoSrc from "@/assets/awa-tech-logo.webp";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getSiteConfig } from "@/lib/admin-layout.functions";

export function Logo({ mode = "adulto" }: { mode?: "adulto" | "infantil" }) {
  const { t, i18n } = useTranslation();
  const getFn = useServerFn(getSiteConfig);

  const { data: branding } = useQuery({
    queryKey: ["site_config", "branding"],
    queryFn: () => getFn({ data: "branding" }),
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const currentLogo = mode === "infantil" 
    ? (branding?.infantil_logo_url || logoSrc)
    : (branding?.adulto_logo_url || logoSrc);

  // Use i18n.isInitialized to ensure we don't render empty text during hydration
  const tagline = i18n.isInitialized ? t("common.tagline") : "";

  return (
    <div className="flex items-center gap-3">
      <div className="relative shrink-0 w-12 h-12">
        <div className="absolute -inset-1 rounded-full bg-[var(--gradient-gold)] opacity-30 blur-md" />
        <img
          src={currentLogo}
          alt="AWÃ TECH"
          width={48}
          height={48}
          className="relative h-12 w-12 rounded-full bg-cream/95 p-0.5 ring-2 ring-gold/50 object-contain shadow-[var(--shadow-gold)]"
          fetchPriority="high"
          loading="eager"
        />
      </div>

      <div className="leading-none">
        <div className="font-display text-xl font-black tracking-tight text-cream">
          AWÃ <span className="text-gradient-gold">TECH</span>
        </div>
        <div
          className="mt-1 text-[10px] font-semibold tracking-[0.22em] text-gold/80 min-h-[1.2em]"
          suppressHydrationWarning
        >
          {tagline}
        </div>

      </div>
    </div>
  );
}

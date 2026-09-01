import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/home/site-header";
import { SiteFooter } from "@/components/home/site-footer";

/**
 * Casca visual da nova área infantil ("Aldeia Viva"):
 * floresta em degradê profundo + cartões cor de areia com borda grossa.
 */
export function KidsPage({
  title,
  subtitle,
  emoji,
  back = "/infantil",
  children,
}: {
  title: string;
  subtitle?: string;
  emoji?: string;
  back?: string | null;
  children: ReactNode;
}) {
  return (
    <div className="kids-theme min-h-screen bg-[#0d2b21] text-[#fdfcf0]">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(120% 70% at 50% 0%, #1f6b4f 0%, #14503c 45%, #0d2b21 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 bottom-0 -z-10 h-40 opacity-40"
        style={{
          background:
            "repeating-linear-gradient(90deg, transparent 0 18px, rgba(233,196,106,.18) 18px 20px)",
        }}
      />

      <SiteHeader mode="infantil" />

      <main className="mx-auto w-full max-w-md px-4 pb-24 pt-3 md:max-w-3xl">
        <header className="mb-5">
          {back && (
            <Link
              to={back}
              className="mb-3 inline-flex items-center gap-1.5 rounded-full border-2 border-[#e9c46a] bg-[#14503c] px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-[#ffe9b8]"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Aldeia
            </Link>
          )}
          <h1 className="font-display text-3xl leading-tight text-[#ffe9b8] drop-shadow-[0_3px_0_rgba(0,0,0,.35)] md:text-4xl">
            {emoji && <span className="mr-2">{emoji}</span>}
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm font-bold text-[#c9e7d6]">{subtitle}</p>
          )}
        </header>

        {children}
      </main>

      <SiteFooter />
    </div>
  );
}

/** Cartão cor de areia usado em todas as telas infantis novas. */
export function KidsCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[1.75rem] border-[5px] border-[#e9c46a] bg-[#fdfcf0] text-[#123a2b] shadow-[0_12px_0_-4px_rgba(0,0,0,.35),0_22px_40px_-24px_rgba(0,0,0,.7)] ${className}`}
    >
      {children}
    </div>
  );
}

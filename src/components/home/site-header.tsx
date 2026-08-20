import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ArrowLeft, LogIn, LogOut, Settings, UserCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useNavContent, type NavMode } from "@/lib/home-content";
import { useSubscription } from "@/hooks/use-subscription";
import { Logo } from "./logo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export function SiteHeader({ mode = "all", showBackButton = false }: { mode?: NavMode; showBackButton?: boolean } = {}) {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
   const qc = useQueryClient();
  const { t } = useTranslation();
  const { isPremium } = useSubscription();
  const { top: topNavLinks } = useNavContent(mode);


  async function signOut() {
    await supabase.auth.signOut();
    qc.clear();
    navigate({ to: "/" });
  }

  const isKids = mode === "infantil";

  return (
    <header
      className={
        isKids
          ? "sticky top-0 z-40 backdrop-blur-xl bg-gradient-to-r from-[#ffd166] via-[#ef476f] to-[#06d6a0] border-b-4 border-white/70 shadow-[0_10px_30px_-14px_rgba(0,0,0,0.35)]"
          : "sticky top-0 z-40 backdrop-blur-xl bg-[oklch(0.14_0.04_145/0.75)] border-b border-gold/25 shadow-[0_10px_30px_-20px_rgba(0,0,0,0.6)]"
      }
    >
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-3 py-3 sm:px-4 md:px-8">
        {showBackButton ? (
          <button
            onClick={() => window.history.back()}
            className={
              isKids
                ? "grid h-12 w-12 shrink-0 place-items-center rounded-2xl border-4 border-white bg-white text-[#ef476f] shadow-[0_6px_0_rgba(0,0,0,0.15)] transition-transform active:translate-y-0.5 active:shadow-none"
                : "grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gold/40 bg-card/60 text-gold"
            }
            aria-label={t("common.voltar")}
          >
            <ArrowLeft className={isKids ? "h-7 w-7" : "h-5 w-5"} strokeWidth={isKids ? 3 : 2} />
          </button>
        ) : (
          <div className="h-10 w-10 shrink-0" aria-hidden />
        )}
        <div className="min-w-0 flex-1 flex justify-center xl:flex-none xl:justify-start">
          <Logo mode={isKids ? "infantil" : "adulto"} />
        </div>
        {!isKids && (
          <nav className="hidden xl:flex items-center gap-1">
            {topNavLinks.map((n) => (
              <Link
                key={n.href}
                to={n.href}
                className="whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium text-foreground/80 transition hover:bg-leaf/15 hover:text-cream"
              >
                {n.label}
              </Link>
            ))}
            {(isAdmin || (typeof window !== "undefined" && localStorage.getItem("adminLogado") === "sim")) && (
              <Link
                to="/admin"
                className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gold/20 px-3 py-2 text-sm font-semibold text-gold hover:bg-gold/30"
              >
                <Settings className="h-4 w-4" /> {t("nav.painel")}
              </Link>
            )}
            {user ? (
              <>
                <Link
                  to="/minha-conta"
                  className="inline-flex shrink-0 items-center gap-1 rounded-full border border-gold/30 px-3 py-2 text-sm font-medium text-foreground/85 hover:bg-gold/10"
                >
                  <UserCircle2 className="h-4 w-4" /> {t("nav.minhaConta")}
                </Link>
                <button
                  onClick={signOut}
                  className="inline-flex shrink-0 items-center gap-1 rounded-full border border-gold/30 px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-gold/10"
                >
                  <LogOut className="h-4 w-4" /> {t("nav.sair")}
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[var(--gradient-leaf)] px-4 py-2 text-sm font-bold text-cream shadow-[var(--shadow-glow)]"
              >
                <LogIn className="h-4 w-4" /> {t("nav.entrar")}
              </Link>
            )}
            <LanguageSwitcher />
          </nav>
        )}
        <div className={isKids ? "" : "xl:hidden"}>
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}


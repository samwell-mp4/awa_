import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ChevronRight, LogIn, LogOut, Menu, Settings, Star, UserCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useNavContent, type NavGroup } from "@/lib/home-content";
import { Logo } from "./logo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { t } = useTranslation();
  const { top: topNavLinks } = useNavContent();

  async function signOut() {
    await supabase.auth.signOut();
    qc.clear();
    navigate({ to: "/" });
  }

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-[oklch(0.14_0.04_145/0.75)] border-b border-gold/25 shadow-[0_10px_30px_-20px_rgba(0,0,0,0.6)]">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-3 py-3 sm:px-4 md:px-8">
        <button
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gold/40 bg-card/60 text-gold xl:hidden"
          aria-label={t("nav.menu")}
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1 flex justify-center xl:flex-none xl:justify-start">
          <Logo />
        </div>
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
          <Link
            to="/planos"
            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gold/20 px-3 py-2 text-sm font-bold text-gold hover:bg-gold/30"
          >
            <Star className="h-4 w-4" /> {t("nav.premium")}
          </Link>
          {isAdmin && (
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
        <div className="xl:hidden">
          <LanguageSwitcher />
        </div>
      </div>

      {open && (
        <MobileDrawer onClose={() => setOpen(false)} onSignOut={signOut} user={user} isAdmin={isAdmin} />
      )}
    </header>
  );
}

function MobileDrawer({
  onClose,
  onSignOut,
  user,
  isAdmin,
}: {
  onClose: () => void;
  onSignOut: () => void;
  user: ReturnType<typeof useAuth>["user"];
  isAdmin: boolean;
}) {
  const { t } = useTranslation();
  const { groups } = useNavContent();
  const [openGroup, setOpenGroup] = useState<string | null>(groups[0]?.title ?? null);
  return (
    <div className="xl:hidden border-t border-gold/20 bg-card/95 px-4 py-4 max-h-[80vh] overflow-y-auto">
      <div className="text-center pb-3 mb-3 border-b border-gold/15">
        <div className="font-display text-sm font-black text-cream">AWÃ TECH</div>
        <div className="text-[10px] font-semibold tracking-[0.18em] text-gold/80">
          {t("common.tagline")}
        </div>
      </div>
      <div className="mb-3 flex items-center justify-between rounded-xl border border-gold/20 bg-forest-deep/30 px-3 py-2">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-gold/80">
          {t("common.idioma")}
        </span>
        <LanguageSwitcher compact />
      </div>
      <div className="flex flex-col gap-2">
        {groups.map((group: NavGroup) => {
          const isOpen = openGroup === group.title;
          return (
            <div key={group.title} className="rounded-xl border border-gold/15 bg-forest-deep/20 overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenGroup(isOpen ? null : group.title)}
                aria-expanded={isOpen}
                className="flex w-full items-center gap-2 px-3 py-3 text-left font-display text-sm font-bold uppercase tracking-[0.12em] text-gold hover:bg-gold/10"
              >
                <span className="flex-1">{group.title}</span>
                <ChevronRight
                  className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
                />
              </button>
              <div
                className={`grid transition-all duration-300 ease-out ${
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="flex flex-col gap-1 px-2 pb-2 pt-1">
                    {group.items.map((n) => (
                      <Link
                        key={n.href}
                        to={n.href}
                        onClick={onClose}
                        className="flex items-center gap-3 rounded-lg pl-6 pr-3 py-2 text-sm font-medium text-foreground/85 hover:bg-leaf/20"
                      >
                        <n.icon className="h-4 w-4 text-gold/90" />
                        <span className="flex-1">{n.label}</span>
                        {n.premium && (
                          <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[9px] font-bold text-gold">
                            PREMIUM
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        <div className="border-t border-gold/15 pt-3 flex flex-col gap-1">
          {isAdmin && (
            <Link
              to="/admin"
              onClick={onClose}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gold hover:bg-gold/15"
            >
              <Settings className="h-4 w-4" /> {t("nav.painel")}
            </Link>
          )}
          {user && (
            <button
              onClick={() => {
                onClose();
                onSignOut();
              }}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/85 hover:bg-leaf/15"
            >
              <LogOut className="h-4 w-4 text-gold" /> {t("nav.sair")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

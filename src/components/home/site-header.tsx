import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogIn, LogOut, Menu, Settings, Star, UserCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { navGroups, topNavLinks } from "@/lib/home-content";
import { Logo } from "./logo";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

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
          aria-label="Menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1 xl:flex-none">
          <Logo />
        </div>
        <nav className="hidden xl:flex items-center gap-1">
          {topNavLinks.map((n) => (
            <Link
              key={n.label}
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
            <Star className="h-4 w-4" /> Premium
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gold/20 px-3 py-2 text-sm font-semibold text-gold hover:bg-gold/30"
            >
              <Settings className="h-4 w-4" /> Painel
            </Link>
          )}
          {user ? (
            <button
              onClick={signOut}
              className="inline-flex shrink-0 items-center gap-1 rounded-full border border-gold/30 px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-gold/10"
            >
              <LogOut className="h-4 w-4" /> Sair
            </button>
          ) : (
            <Link
              to="/auth"
              className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[var(--gradient-leaf)] px-4 py-2 text-sm font-bold text-cream shadow-[var(--shadow-glow)]"
            >
              <LogIn className="h-4 w-4" /> Entrar
            </Link>
          )}
        </nav>
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
  return (
    <div className="xl:hidden border-t border-gold/20 bg-card/95 px-4 py-4 max-h-[80vh] overflow-y-auto">
      <div className="text-center pb-3 mb-3 border-b border-gold/15">
        <div className="font-display text-sm font-black text-cream">AWÃ TECH</div>
        <div className="text-[10px] font-semibold tracking-[0.18em] text-gold/80">
          CAMINHO DA SABEDORIA
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {navGroups.map((group) => (
          <div key={group.title}>
            <div className="mb-1.5 px-1 text-[10px] font-bold uppercase tracking-[0.15em] text-gold/70">
              {group.title}
            </div>
            <div className="flex flex-col gap-1">
              {group.items.map((n) => (
                <Link
                  key={n.label}
                  to={n.href}
                  onClick={onClose}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/85 hover:bg-leaf/15"
                >
                  <n.icon className="h-4 w-4 text-gold" />
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
        ))}
        <div className="border-t border-gold/15 pt-3 flex flex-col gap-1">
          {isAdmin && (
            <Link
              to="/admin"
              onClick={onClose}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gold hover:bg-gold/15"
            >
              <Settings className="h-4 w-4" /> Painel Admin
            </Link>
          )}
          {user ? (
            <button
              onClick={() => {
                onClose();
                onSignOut();
              }}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/85 hover:bg-leaf/15"
            >
              <LogOut className="h-4 w-4 text-gold" /> Sair
            </button>
          ) : (
            <Link
              to="/auth"
              onClick={onClose}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-cream bg-[var(--gradient-leaf)]"
            >
              <LogIn className="h-4 w-4" /> Entrar / Criar conta
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

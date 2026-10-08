import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ChevronRight, LogIn, LogOut, Menu, Settings, UserCircle2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useNavContent, type NavGroup, type NavMode } from "@/lib/home-content";
import { Logo } from "./logo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import kidsCharacter from "@/assets/kids-menu-character.png";
import { useSidebar } from "@/components/navigation/site-sidebar";

export function SiteHeader({ mode = "all", showBackButton = false }: { mode?: NavMode; showBackButton?: boolean } = {}) {
  const { setIsMobileOpen } = useSidebar();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { t } = useTranslation();


  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  const isKids = mode === "infantil";

  return (
    <header
      className={
        isKids
          ? "lg:hidden sticky top-0 z-40 backdrop-blur-md bg-[#221206]/85 border-b border-[#8d5b2d]/60 shadow-[0_6px_25px_rgba(0,0,0,0.5)] transition-all"
          : "lg:hidden sticky top-0 z-40 backdrop-blur-xl bg-white/95 border-b border-[#e8e4dc] shadow-[0_2px_12px_rgba(0,0,0,0.04)] text-[#1f2937]"
      }
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-3 py-2.5 sm:px-4 md:px-8">
        {showBackButton ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.history.back()}
              className={
                isKids
                  ? "relative group grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-[#d4a373] bg-gradient-to-b from-[#4a2e18] to-[#251408] text-[#fefae0] shadow-[0_4px_12px_rgba(0,0,0,0.5)] transition-transform hover:scale-105 active:scale-95"
                  : "grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#e2ded5] bg-white text-[#1b4332] shadow-xs hover:border-[#1b4332]"
              }
              aria-label={t("common.voltar")}
            >
              <ArrowLeft className={isKids ? "h-6 w-6 text-[#fefae0]" : "h-5 w-5 text-[#1b4332]"} strokeWidth={isKids ? 2.5 : 2} />
            </button>
            <span
              className={
                isKids
                  ? "font-display text-sm font-black uppercase tracking-wider text-[#fefae0] drop-shadow"
                  : "font-display text-sm font-bold uppercase tracking-widest text-[#1b4332]"
              }
            >
              {t("common.voltar")}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileOpen(true)}
              className={
                isKids
                  ? "relative group grid h-12 w-12 shrink-0 place-items-center rounded-full border-2 border-[#d4a373] bg-gradient-to-b from-[#4a2e18] to-[#251408] text-[#fefae0] shadow-[0_4px_14px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.2)] transition-all hover:scale-105 hover:border-[#ffd166] active:scale-95"
                  : "grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[#e2ded5] bg-white text-[#1f2937] shadow-xs hover:border-[#1b4332]"
              }
              aria-label={t("nav.menu")}
            >
              {isKids ? (
                <div className="flex flex-col items-center justify-center gap-1.5 w-5">
                  <span className="block h-0.5 w-5 rounded-full bg-[#fefae0] transition-all group-hover:bg-[#ffd166]" />
                  <span className="block h-0.5 w-5 rounded-full bg-[#fefae0] transition-all group-hover:bg-[#ffd166]" />
                  <span className="block h-0.5 w-5 rounded-full bg-[#fefae0] transition-all group-hover:bg-[#ffd166]" />
                </div>
              ) : (
                <Menu className="h-5 w-5" strokeWidth={2} />
              )}
            </button>
            {!isKids && (
              <span className="font-display text-sm font-bold uppercase tracking-widest text-[#1b4332]">
                {t("nav.menu")}
              </span>
            )}
          </div>
        )}

        <div className="min-w-0 flex items-center justify-center">
          <Logo mode={isKids ? "infantil" : "adulto"} />
        </div>

        <div className="flex items-center gap-2">
          {isKids && (
            <Link
              to="/adulto"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-[#8d5b2d] bg-[#3a2212]/80 px-3 py-1.5 text-xs font-bold text-[#fefae0] shadow transition hover:border-[#ffd166] hover:bg-[#4a2e18]"
            >
              <span>Área Adulto</span>
              <ChevronRight className="h-3.5 w-3.5 text-[#d4a373]" />
            </Link>
          )}
          <LanguageSwitcher compact={isKids} />
        </div>
      </div>

      {mounted && open && createPortal(
        <MobileDrawer onClose={() => setOpen(false)} onSignOut={signOut} user={user} isAdmin={isAdmin} mode={mode} />,
        document.body
      )}
    </header>
  );
}

function MobileDrawer({
  onClose,
  onSignOut,
  user,
  isAdmin,
  mode = "all",
}: {
  onClose: () => void;
  onSignOut: () => void;
  user: ReturnType<typeof useAuth>["user"];
  isAdmin: boolean;
  mode?: NavMode;
}) {
  const { t } = useTranslation();
  const { groups } = useNavContent(mode);
  const [openGroup, setOpenGroup] = useState<string | null>(groups[0]?.title ?? null);
  const isKids = mode === "infantil";

  useEffect(() => {
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = orig;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  if (isKids) {
    return (
      <div className="fixed inset-0 z-[99999] flex text-[#fefae0]">
        {/* Backdrop blur */}
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
          aria-hidden="true"
        />

        {/* Drawer slide-over */}
        <div className="relative z-50 flex h-full w-full max-w-[340px] sm:max-w-sm flex-col border-r-2 border-[#8d5b2d] bg-gradient-to-b from-[#251206] via-[#1b2b1d] to-[#101c13] p-5 shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-y-auto animate-in slide-in-from-left duration-300">
          {/* Header with Akuá Character and Close button */}
          <div className="flex items-center justify-between border-b border-[#8d5b2d]/50 pb-4">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-[#ffd166] bg-[#1b4332] shadow-md">
                <img
                  src={kidsCharacter}
                  alt="Akuá"
                  className="h-full w-full object-cover object-top"
                />
              </div>
              <div>
                <div className="font-display text-lg font-black text-[#ffd166]">Akuá!</div>
                <div className="text-[11px] font-bold text-[#d4a373] uppercase tracking-wider">Awã Tech Criança</div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="grid h-10 w-10 place-items-center rounded-full border-2 border-[#8d5b2d] bg-[#3a2212] text-[#fefae0] shadow hover:border-[#ffd166] hover:rotate-90 transition-all duration-200"
              aria-label="Fechar Menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Quick status pill */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="kids-badge-green rounded-xl px-3 py-2 text-center text-white">
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">🔥 Sequência</div>
              <div className="font-display text-xl font-black">7 dias</div>
            </div>
            <div className="kids-badge-gold rounded-xl px-3 py-2 text-center text-[#451a03]">
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-900">⭐ Pontos</div>
              <div className="font-display text-xl font-black">250 pts</div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="mt-5 flex-1 space-y-2">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#d4a373]">Navegação da Aldeia</div>
            
            <nav className="flex flex-col gap-1.5">
              <Link
                to="/infantil"
                onClick={onClose}
                className="flex items-center gap-3 rounded-xl border border-[#8d5b2d]/40 bg-[#351d0d]/80 px-3.5 py-2.5 text-sm font-bold text-[#fefae0] shadow transition hover:border-[#ffd166] hover:bg-[#432512]"
              >
                <span className="text-xl">🏠</span>
                <span className="flex-1">Início da Aldeia</span>
              </Link>

              <Link
                to="/trilhas-infantil"
                onClick={onClose}
                className="flex items-center gap-3 rounded-xl border border-[#8d5b2d]/40 bg-[#351d0d]/80 px-3.5 py-2.5 text-sm font-bold text-[#fefae0] shadow transition hover:border-[#ffd166] hover:bg-[#432512]"
              >
                <span className="text-xl">🗺️</span>
                <span className="flex-1">Trilhas de Aprendizado</span>
                <span className="rounded-full bg-emerald-600/80 px-2 py-0.5 text-[10px] font-bold text-white">5 Trilhas</span>
              </Link>

              <Link
                to="/musicas-infantil"
                onClick={onClose}
                className="flex items-center gap-3 rounded-xl border border-[#8d5b2d]/40 bg-[#351d0d]/80 px-3.5 py-2.5 text-sm font-bold text-[#fefae0] shadow transition hover:border-[#ffd166] hover:bg-[#432512]"
              >
                <span className="text-xl">🎵</span>
                <span className="flex-1">Músicas e Cânticos</span>
              </Link>

              <Link
                to="/jogos-infantil"
                onClick={onClose}
                className="flex items-center gap-3 rounded-xl border border-[#8d5b2d]/40 bg-[#351d0d]/80 px-3.5 py-2.5 text-sm font-bold text-[#fefae0] shadow transition hover:border-[#ffd166] hover:bg-[#432512]"
              >
                <span className="text-xl">🎮</span>
                <span className="flex-1">Jogos Educativos</span>
              </Link>

              <Link
                to="/historias-infantil"
                onClick={onClose}
                className="flex items-center gap-3 rounded-xl border border-[#8d5b2d]/40 bg-[#351d0d]/80 px-3.5 py-2.5 text-sm font-bold text-[#fefae0] shadow transition hover:border-[#ffd166] hover:bg-[#432512]"
              >
                <span className="text-xl">📖</span>
                <span className="flex-1">Histórias da Aldeia</span>
              </Link>

              <Link
                to="/aprender-numeros"
                search={{ area: "infantil" }}
                onClick={onClose}
                className="flex items-center gap-3 rounded-xl border border-[#8d5b2d]/40 bg-[#351d0d]/80 px-3.5 py-2.5 text-sm font-bold text-[#fefae0] shadow transition hover:border-[#ffd166] hover:bg-[#432512]"
              >
                <span className="text-xl">🔢</span>
                <span className="flex-1">Aprender Números</span>
              </Link>

              <Link
                to="/videos"
                onClick={onClose}
                className="flex items-center gap-3 rounded-xl border border-[#8d5b2d]/40 bg-[#351d0d]/80 px-3.5 py-2.5 text-sm font-bold text-[#fefae0] shadow transition hover:border-[#ffd166] hover:bg-[#432512]"
              >
                <span className="text-xl">🎬</span>
                <span className="flex-1">Vídeos & Aulas</span>
              </Link>

              <Link
                to="/aldeia-velha"
                onClick={onClose}
                className="flex items-center gap-3 rounded-xl border border-[#8d5b2d]/40 bg-[#351d0d]/80 px-3.5 py-2.5 text-sm font-bold text-[#fefae0] shadow transition hover:border-[#ffd166] hover:bg-[#432512]"
              >
                <span className="text-xl">🛖</span>
                <span className="flex-1">Aldeia Velha</span>
              </Link>

              <Link
                to="/minha-conta"
                onClick={onClose}
                className="flex items-center gap-3 rounded-xl border border-[#8d5b2d]/40 bg-[#351d0d]/80 px-3.5 py-2.5 text-sm font-bold text-[#fefae0] shadow transition hover:border-[#ffd166] hover:bg-[#432512]"
              >
                <span className="text-xl">🏆</span>
                <span className="flex-1">Meu Perfil & Medalhas</span>
              </Link>
            </nav>

            <div className="pt-3">
              <Link
                to="/adulto"
                onClick={onClose}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#d4a373] bg-gradient-to-r from-[#4a2e18] to-[#251408] px-4 py-2.5 text-xs font-black uppercase text-[#ffd166] shadow transition hover:brightness-110 active:scale-95"
              >
                <span>🏹 Trocar para Área Adulto</span>
              </Link>
            </div>
          </div>

          {/* Footer of Drawer */}
          <div className="mt-5 border-t border-[#8d5b2d]/40 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#d4a373]">Idioma:</span>
              <LanguageSwitcher compact />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[99999] flex text-foreground">
      {/* Backdrop blur */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
        aria-hidden="true"
      />

      {/* Drawer slide-over */}
      <div className="relative z-50 flex h-full w-full max-w-sm flex-col border-r border-gold/30 bg-[oklch(0.14_0.04_145)] p-5 shadow-2xl overflow-y-auto animate-in slide-in-from-left duration-300">
        <div className="flex items-center justify-between pb-4 border-b border-gold/20">
          <Logo mode="adulto" />
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full border border-gold/40 bg-card/60 text-gold hover:bg-gold/20 hover:rotate-90 transition-all duration-200"
            aria-label="Fechar Menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="my-3 flex items-center justify-between rounded-xl border border-gold/20 bg-forest-deep/30 px-3 py-2">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-gold/80">
            {t("common.idioma")}
          </span>
          <LanguageSwitcher compact />
        </div>

        <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
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
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-gold/20 pt-3 flex flex-col gap-1 mt-auto">
          {isAdmin && (
            <Link
              to="/admin"
              onClick={onClose}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gold hover:bg-gold/15"
            >
              <Settings className="h-4 w-4" /> {t("nav.painel")}
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
              <LogOut className="h-4 w-4 text-gold" /> {t("nav.sair")}
            </button>
          ) : (
            <Link
              to="/auth"
              onClick={onClose}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold to-amber-600 px-4 py-2.5 text-sm font-bold text-black shadow"
            >
              <LogIn className="h-4 w-4" /> {t("nav.entrar")}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

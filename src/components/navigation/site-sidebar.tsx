import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  Home,
  Compass,
  Music,
  Gamepad2,
  BookOpen,
  Sparkles,
  Heart,
  GraduationCap,
  Library,
  Languages,
  Sun,
  ScrollText,
  Play,
  Video,
  TreePine,
  Globe,
  Award,
  UserCircle2,
  Download,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  LogIn,
  Star,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Logo } from "@/components/home/logo";

interface SidebarContextValue {
  isCollapsed: boolean;
  toggleCollapsed: () => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

const SidebarContext = createContext<SidebarContextValue>({
  isCollapsed: false,
  toggleCollapsed: () => {},
  isMobileOpen: false,
  setIsMobileOpen: () => {},
});

export function useSidebar() {
  return useContext(SidebarContext);
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("awa_sidebar_collapsed");
      if (saved !== null) {
        setIsCollapsed(saved === "true");
      }
    } catch {}
  }, []);

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("awa_sidebar_collapsed", String(next));
      } catch {}
      return next;
    });
  };

  // Close mobile sidebar on route change
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Handle ESC key to close mobile drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileOpen) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileOpen]);

  return (
    <SidebarContext.Provider
      value={{ isCollapsed, toggleCollapsed, isMobileOpen, setIsMobileOpen }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

type NavEntry = {
  label: string;
  href: string;
  icon: LucideIcon;
  emoji?: string;
  badge?: string;
  search?: Record<string, string>;
};

type NavSection = {
  title?: string;
  items: NavEntry[];
};

export function SiteSidebar() {
  const { isCollapsed, toggleCollapsed, isMobileOpen, setIsMobileOpen } = useSidebar();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const search = useRouterState({ select: (s) => s.location.search }) as Record<string, unknown>;
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Detect whether current location belongs to the Kids section
  const isKids = useMemo(() => {
    if (pathname.startsWith("/infantil")) return true;
    if (pathname.includes("-infantil")) return true;
    if (pathname === "/amizade") return true;
    if (pathname === "/aprender-numeros" && search?.area !== "adulto") return true;
    if (pathname.startsWith("/trilhas") && search?.area === "infantil") return true;
    return false;
  }, [pathname, search]);

  const kidsSections: NavSection[] = [
    {
      title: "Aprender",
      items: [
        { label: "Início", href: "/infantil", icon: Home },
        { label: "Trilhas", href: "/trilhas-infantil", icon: Compass, badge: "5" },
        { label: "Músicas", href: "/musicas-infantil", icon: Music },
        { label: "Histórias", href: "/historias-infantil", icon: BookOpen },
        { label: "Jogos", href: "/jogos-infantil", icon: Gamepad2 },
        { label: "Números", href: "/aprender-numeros", icon: Sparkles, search: { area: "infantil" } },
        { label: "Amizade Awã", href: "/amizade", icon: Heart },
        { label: "Professor Awã", href: "/professor-infantil", icon: GraduationCap },
      ],
    },
    {
      title: "Meu Aprendizado",
      items: [
        { label: "Meu Progresso", href: "/infantil#progresso", icon: Star },
        { label: "Conquistas", href: "/infantil#conquistas", icon: Award },
      ],
    },
  ];

  const adultSections: NavSection[] = [
    {
      title: "Língua & Conhecimento",
      items: [
        { label: "Início", href: "/adulto", icon: Home },
        { label: "Trilhas de Estudo", href: "/trilhas", icon: Compass },
        { label: "Dicionário Patxôhã", href: "/dicionario", icon: Library },
        { label: "Tradutor Patxôhã", href: "/traduzir", icon: Languages },
        { label: "Espaço do Professor", href: "/professor", icon: Sparkles },
        { label: "Saudações", href: "/saudacoes", icon: Sun },
      ],
    },
    {
      title: "Cultura & Tradição",
      items: [
        { label: "Histórias Ancestrais", href: "/historias", icon: ScrollText },
        { label: "Músicas & Cânticos", href: "/musicas", icon: Play },
        { label: "Vídeos & Registros", href: "/videos", icon: Video },
        { label: "Aldeia Velha", href: "/aldeia-velha", icon: TreePine },
        { label: "Intercâmbio Cultural", href: "/intercambio", icon: Globe },
      ],
    },
    {
      title: "Minha Conta & App",
      items: [
        { label: "Planos & Assinatura", href: "/planos", icon: Award },
        { label: "Minha Conta", href: "/minha-conta", icon: UserCircle2 },
        { label: "Instalar App", href: "/instalar", icon: Download },
      ],
    },
  ];

  const activeSections = isKids ? kidsSections : adultSections;

  const isCurrent = (item: NavEntry) => {
    if (item.href.includes("#")) {
      return false;
    }
    if (item.href === "/" || item.href === "/adulto" || item.href === "/infantil") {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  // Sidebar styling tokens depending on mode (subtle border, no heavy neon glow)
  const sidebarStyles = isKids
    ? {
        bg: "bg-[#180e07]/95 backdrop-blur-md",
        border: "border-r border-[#633916]/50 shadow-lg",
        activeItem: "bg-[#331c0e] text-[#ffd166] border-l-2 border-[#ffd166] font-semibold",
        idleItem: "text-[#fefae0]/75 hover:bg-[#251408] hover:text-[#ffd166] transition-colors",
        sectionTitle: "text-[#d4a373]/80",
        switchButton: "border border-[#633916]/60 bg-[#251408] text-[#fefae0]/90 hover:border-[#ffd166]/60 hover:text-[#ffd166]",
        iconColor: "text-[#ffd166]",
      }
    : {
        bg: "bg-[#ffffff]/98 backdrop-blur-md",
        border: "border-r border-[#e8e4dc] shadow-[2px_0_12px_rgba(0,0,0,0.03)]",
        activeItem: "bg-[#1b4332]/10 text-[#1b4332] border-l-4 border-[#1b4332] font-bold shadow-xs",
        idleItem: "text-[#4b5563] hover:bg-[#f4f2ec] hover:text-[#111827] transition-colors font-medium",
        sectionTitle: "text-[#6b7280] font-bold tracking-wider",
        switchButton: "border border-[#e2ded5] bg-[#fbfaf7] text-[#1b4332] hover:bg-[#1b4332]/10 hover:border-[#1b4332]",
        iconColor: "text-[#1b4332]",
      };

  const renderContent = (isMobileView = false) => {
    const collapsed = !isMobileView && isCollapsed;

    return (
      <div className="flex h-full flex-col justify-between overflow-hidden">
        {/* Top Header & Branding */}
        <div>
          <div className={`flex items-center gap-3 px-4 py-4 ${isKids ? "border-b border-[#8d5b2d]/50" : "border-b border-[#e8e4dc]"}`}>
            {isMobileView && (
              <button
                onClick={() => setIsMobileOpen(false)}
                className={`mr-1 grid h-9 w-9 place-items-center rounded-xl border ${
                  isKids ? "border-white/20 text-white/80 hover:bg-white/10" : "border-[#e2ded5] text-[#1f2937] hover:bg-[#f3f4f6]"
                }`}
                aria-label="Fechar menu"
              >
                <X className="h-5 w-5" />
              </button>
            )}

            <Link to={isKids ? "/infantil" : "/adulto"} className="flex items-center gap-2.5 min-w-0 flex-1">
              <Logo mode={isKids ? "infantil" : "adulto"} />
            </Link>

            {!isMobileView && (
              <button
                onClick={toggleCollapsed}
                title={collapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border transition hover:scale-105 active:scale-95 ${
                  isKids
                    ? "border-[#8d5b2d] bg-[#2a160a] text-[#ffd166] hover:bg-[#3d2210]"
                    : "border-[#e2ded5] bg-[#fbfaf7] text-[#1b4332] hover:border-[#1b4332]"
                }`}
              >
                {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </button>
            )}
          </div>

          {/* Mode Switcher Banner (Compact or Full) */}
          <div className="px-3 pt-3">
            {collapsed ? (
              <Link
                to={isKids ? "/adulto" : "/infantil"}
                title={isKids ? "Mudar para Modo Adulto" : "Mudar para Modo Infantil"}
                className={`flex h-11 w-full items-center justify-center rounded-xl border transition ${sidebarStyles.switchButton}`}
              >
                <span className="text-xl">{isKids ? "🌿" : "🧒🏽"}</span>
              </Link>
            ) : (
              <Link
                to={isKids ? "/adulto" : "/infantil"}
                className={`flex items-center justify-between gap-2 rounded-xl px-3.5 py-2.5 text-xs font-black uppercase tracking-wider transition ${sidebarStyles.switchButton}`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-base">{isKids ? "🌿" : "🧒🏽"}</span>
                  <span>{isKids ? "Ir para Modo Adulto" : "Ir para Modo Infantil"}</span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 opacity-60" />
              </Link>
            )}
          </div>
        </div>

        {/* Scrollable Navigation Items */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-3 scrollbar-thin scrollbar-thumb-white/10">
          {activeSections.map((sec, idx) => (
            <div key={idx} className="mb-4">
              {sec.title && !collapsed && (
                <div className={`mb-1.5 px-3 text-[10px] font-black uppercase tracking-[0.18em] ${sidebarStyles.sectionTitle}`}>
                  {sec.title}
                </div>
              )}
              {collapsed && idx > 0 && <div className="my-2 border-t border-white/10" />}

              <nav className="flex flex-col gap-1">
                {sec.items.map((item) => {
                  const active = isCurrent(item);
                  const Icon = item.icon;

                  if (collapsed) {
                    return (
                      <Link
                        key={item.href}
                        to={item.href as any}
                        search={item.search}
                        title={item.label}
                        aria-label={item.label}
                        className={`group relative flex h-10 w-10 mx-auto items-center justify-center rounded-xl border transition hover:scale-105 active:scale-95 ${
                          active
                            ? isKids
                              ? "border-[#ffd166] bg-[#331c0e] text-[#ffd166]"
                              : "border-[#1b4332] bg-[#1b4332]/10 text-[#1b4332]"
                            : isKids
                              ? "border-[#633916]/40 bg-[#251408]/80 text-[#fefae0]/70 hover:border-[#ffd166]/60 hover:text-[#ffd166]"
                              : "border-[#e5e7eb] bg-[#fbfaf7] text-[#4b5563] hover:border-[#1b4332]/40 hover:text-[#1b4332]"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {item.badge && (
                          <span className={`absolute -top-1 -right-1 h-2 w-2 rounded-full ${isKids ? "bg-[#2a9d8f] ring-2 ring-[#180e07]" : "bg-[#1b4332] ring-2 ring-white"}`} />
                        )}
                        {/* Tooltip on hover */}
                        <div className={`pointer-events-none absolute left-full ml-2 hidden rounded-md px-2.5 py-1 text-xs font-semibold shadow-xl group-hover:block whitespace-nowrap z-50 border ${
                          isKids ? "bg-[#251408] text-[#fefae0] border-[#633916]" : "bg-white text-[#1f2937] border-[#e5e7eb]"
                        }`}>
                          {item.label}
                        </div>
                      </Link>
                    );
                  }

                  return (
                    <Link
                      key={item.href}
                      to={item.href as any}
                      search={item.search}
                      className={`flex items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-sm font-semibold transition ${
                        active ? sidebarStyles.activeItem : sidebarStyles.idleItem
                      }`}
                    >
                      <Icon className={`h-4 w-4 shrink-0 ${active ? sidebarStyles.iconColor : "opacity-80"}`} />
                      <span className="truncate flex-1">{item.label}</span>
                      {item.badge && (
                        <span className={`rounded-full px-2 py-0.2 text-[10px] font-bold text-white shadow-xs ${
                          isKids ? "bg-[#2a9d8f]/90" : "bg-[#1b4332]"
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}

          {/* Admin panel link if user is administrator */}
          {isAdmin && (
            <div className={`mb-3 pt-2 border-t ${isKids ? "border-white/10" : "border-[#e8e4dc]"}`}>
              <Link
                to="/admin"
                className={`flex items-center gap-3 rounded-xl border px-3 py-2 text-xs font-black uppercase tracking-wider transition ${
                  collapsed
                    ? isKids
                      ? "h-11 w-11 mx-auto justify-center border-gold/40 bg-gold/15 text-gold hover:scale-105"
                      : "h-11 w-11 mx-auto justify-center border-[#e2ded5] bg-[#fbfaf7] text-[#1b4332] hover:scale-105"
                    : isKids
                      ? "border-gold/40 bg-gold/10 text-gold hover:bg-gold/20"
                      : "border-[#e2ded5] bg-[#fbfaf7] text-[#1b4332] hover:border-[#1b4332]"
                }`}
                title="Painel Administrativo"
              >
                <Settings className="h-4 w-4 shrink-0" />
                {!collapsed && <span>Painel Admin</span>}
              </Link>
            </div>
          )}
        </div>

        {/* Bottom Footer Section: Language & Account */}
        <div className={`p-3 ${isKids ? "border-t border-[#8d5b2d]/50 bg-[#1e0f06]/90" : "border-t border-[#e8e4dc] bg-[#faf9f6]"}`}>
          {collapsed ? (
            <div className="flex flex-col items-center gap-2">
              <LanguageSwitcher />
              {user ? (
                <button
                  onClick={handleSignOut}
                  title="Sair da conta"
                  className="grid h-9 w-9 place-items-center rounded-xl border border-red-500/40 text-red-400 hover:bg-red-500/20"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              ) : (
                <Link
                  to="/auth"
                  title="Entrar"
                  className={`grid h-9 w-9 place-items-center rounded-xl border ${
                    isKids ? "border-gold/40 text-gold hover:bg-gold/20" : "border-[#1b4332] text-[#1b4332] hover:bg-[#1b4332]/10"
                  }`}
                >
                  <LogIn className="h-4 w-4" />
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <LanguageSwitcher />
                {user ? (
                  <button
                    onClick={handleSignOut}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 px-2.5 py-1 text-xs font-bold text-red-400 hover:bg-red-500/10"
                    title="Sair"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sair</span>
                  </button>
                ) : (
                  <Link
                    to="/auth"
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold ${
                      isKids
                        ? "border border-gold/40 bg-gold/15 text-gold hover:bg-gold/25"
                        : "border border-[#1b4332] bg-[#1b4332] text-white hover:bg-[#2d6a4f]"
                    }`}
                  >
                    <LogIn className="h-3.5 w-3.5" />
                    <span>Entrar</span>
                  </Link>
                )}
              </div>

              {user && (
                <Link
                  to="/minha-conta"
                  className={`flex items-center gap-2.5 rounded-xl p-2 text-left transition ${
                    isKids
                      ? "border border-white/10 bg-black/20 hover:border-gold/40"
                      : "border border-[#e8e4dc] bg-white hover:border-[#1b4332]/50 shadow-xs"
                  }`}
                >
                  <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-full font-display text-xs font-black ${
                    isKids ? "bg-gold/20 text-gold" : "bg-[#1b4332]/10 text-[#1b4332]"
                  }`}>
                    {user.email?.charAt(0).toUpperCase() ?? "U"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className={`truncate text-xs font-bold ${isKids ? "text-foreground" : "text-[#1f2937]"}`}>
                      {user.email?.split("@")[0]}
                    </div>
                    <div className={`text-[10px] flex items-center gap-1 ${isKids ? "text-foreground/60" : "text-[#6b7280]"}`}>
                      <ShieldCheck className="h-3 w-3 text-emerald-500" /> Membro Awã
                    </div>
                  </div>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* 1. Desktop Fixed Sidebar */}
      <aside
        className={`hidden lg:flex fixed left-0 top-0 bottom-0 z-40 flex-col transition-[width] duration-300 ${
          isCollapsed ? "w-16" : "w-60"
        } ${sidebarStyles.bg} ${sidebarStyles.border}`}
      >
        {renderContent(false)}
      </aside>

      {/* 2. Mobile Off-Canvas Drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            aria-hidden
          />

          {/* Drawer Panel */}
          <div
            className={`relative z-10 w-72 max-w-[85vw] flex-1 flex-col shadow-2xl transition-transform animate-in slide-in-from-left duration-300 ${sidebarStyles.bg} ${sidebarStyles.border}`}
          >
            {renderContent(true)}
          </div>
        </div>
      )}
    </>
  );
}

import { MobileBottomNav } from "@/components/navigation/mobile-bottom-nav";

/**
 * Layout wrapper that offsets main content on desktop when sidebar is rendered,
 * and renders the sticky mobile bottom navigation on smaller screens.
 */
export function SidebarLayoutWrapper({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const search = useRouterState({ select: (s) => s.location.search }) as Record<string, unknown>;

  // Exclude purely isolated routes like auth or standalone portals
  const isAuthRoute =
    pathname === "/auth" ||
    pathname.startsWith("/auth/") ||
    pathname === "/reset-password" ||
    pathname === "/acesso-negado" ||
    pathname === "/unsubscribe";

  const isKids = useMemo(() => {
    if (pathname.startsWith("/infantil")) return true;
    if (pathname.includes("-infantil")) return true;
    if (pathname === "/amizade") return true;
    if (pathname === "/aprender-numeros" && search?.area !== "adulto") return true;
    if (pathname.startsWith("/trilhas") && search?.area === "infantil") return true;
    return false;
  }, [pathname, search]);

  const isAdultMode = !isAuthRoute && !isKids && pathname !== "/";

  useEffect(() => {
    if (typeof document !== "undefined") {
      if (isAdultMode) {
        document.documentElement.classList.add("adulto-theme");
        document.body.classList.add("adulto-theme");
      } else {
        document.documentElement.classList.remove("adulto-theme");
        document.body.classList.remove("adulto-theme");
      }
    }
    return () => {
      if (typeof document !== "undefined") {
        document.documentElement.classList.remove("adulto-theme");
        document.body.classList.remove("adulto-theme");
      }
    };
  }, [isAdultMode]);

  const isLanding = pathname === "/";

  if (isAuthRoute || isLanding) {
    return <>{children}</>;
  }

  return (
    <div className={`min-h-screen ${isAdultMode ? "adulto-theme bg-[#f7f6f2] text-[#1f2937]" : ""}`}>
      <SiteSidebar />
      <div
        className={`min-h-screen pb-16 lg:pb-0 transition-[padding] duration-300 ${
          isCollapsed ? "lg:pl-16" : "lg:pl-60"
        }`}
      >
        {children}
      </div>
      <MobileBottomNav />
    </div>
  );
}

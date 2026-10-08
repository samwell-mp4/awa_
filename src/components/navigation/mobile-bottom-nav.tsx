import React from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home,
  Compass,
  Music,
  Gamepad2,
  Sparkles,
  BookOpen,
  TreePine,
  GraduationCap,
} from "lucide-react";

export function MobileBottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Hide on auth, standalone, or chat input routes to avoid visual conflict
  const isExcluded =
    pathname === "/" ||
    pathname === "/auth" ||
    pathname.startsWith("/auth/") ||
    pathname === "/reset-password" ||
    pathname === "/acesso-negado" ||
    pathname === "/professor-infantil" ||
    pathname === "/professor";

  if (isExcluded) return null;

  // Determine if in infantil mode
  const isInfantil =
    pathname === "/infantil" ||
    pathname.startsWith("/trilhas-infantil") ||
    pathname.startsWith("/musicas-infantil") ||
    pathname.startsWith("/jogos-infantil") ||
    pathname.startsWith("/aprender-numeros") ||
    pathname.startsWith("/historias-infantil") ||
    pathname.startsWith("/amizade") ||
    (pathname.startsWith("/trilhas/") && typeof window !== "undefined" && window.location.search.includes("area=infantil"));

  const navItems = isInfantil
    ? [
        { label: "Início", to: "/infantil", icon: Home },
        { label: "Trilhas", to: "/trilhas-infantil", icon: Compass },
        { label: "Músicas", to: "/musicas-infantil", icon: Music },
        { label: "Jogos", to: "/jogos-infantil", icon: Gamepad2 },
        { label: "Professor", to: "/professor-infantil", icon: Sparkles },
      ]
    : [
        { label: "Início", to: "/adulto", icon: Home },
        { label: "Dicionário", to: "/dicionario", icon: BookOpen },
        { label: "Trilhas", to: "/trilhas/saudacoes", icon: Compass },
        { label: "Cultura", to: "/aldeia-velha", icon: TreePine },
        { label: "Professor", to: "/professor", icon: GraduationCap },
      ];

  return (
    <nav
      aria-label="Navegação móvel inferior"
      className={
        isInfantil
          ? "lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#160c07]/95 border-t border-[#633916]/80 backdrop-blur-lg shadow-[0_-8px_24px_rgba(0,0,0,0.6)] pb-[max(0.35rem,env(safe-area-inset-bottom))]"
          : "lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 border-t border-[#e8e4dc] backdrop-blur-lg shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[max(0.35rem,env(safe-area-inset-bottom))]"
      }
    >
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.to ||
            (item.to === "/trilhas-infantil" && pathname.startsWith("/trilhas")) ||
            (item.to === "/dicionario" && pathname.startsWith("/dicionario"));

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center min-w-[56px] h-12 rounded-xl transition-all duration-150 active:scale-95 ${
                isActive
                  ? isInfantil
                    ? "text-[#ffd166] bg-[#ffd166]/10 font-bold"
                    : "text-[#1b4332] bg-[#1b4332]/10 font-bold"
                  : isInfantil
                    ? "text-[#d4a373]/85 hover:text-[#fefae0] font-medium"
                    : "text-[#6b7280] hover:text-[#111827] font-medium"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`h-5 w-5 transition-transform duration-150 ${
                    isActive ? "scale-110 stroke-[2.2]" : "stroke-[1.8]"
                  }`}
                />
                {isActive && (
                  <span className={`absolute -top-1 -right-1 h-1.5 w-1.5 rounded-full ${
                    isInfantil ? "bg-[#ffd166]" : "bg-[#1b4332]"
                  }`} />
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 leading-none">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

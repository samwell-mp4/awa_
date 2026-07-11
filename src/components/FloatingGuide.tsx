import { Link, useRouterState } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";

export function FloatingGuide() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname.startsWith("/professor") || pathname.startsWith("/auth")) return null;

  return (
    <Link
      to="/professor"
      aria-label="Fale com o Guia Awã"
      className="fixed bottom-5 right-5 z-[60] group flex items-center gap-2"
    >
      <span className="hidden sm:inline-block rounded-full bg-[oklch(0.18_0.04_145/0.9)] border border-gold/30 px-3 py-1.5 text-xs font-semibold text-cream shadow-lg backdrop-blur-md">
        Fale com o Guia Awã
      </span>
      <span className="grid h-14 w-14 place-items-center rounded-full bg-[#972C20] text-white shadow-[0_8px_24px_rgba(0,0,0,0.35)] ring-2 ring-gold/40 transition-transform group-hover:scale-105">
        <MessageCircle className="h-6 w-6" />
      </span>
    </Link>
  );
}

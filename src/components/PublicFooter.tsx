import { Link } from "@tanstack/react-router";

export function PublicFooter() {
  return (
    <footer className="mt-12 border-t border-gold/20 bg-[oklch(0.12_0.03_145/0.8)] py-8">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-semibold">
          <Link to="/planos" className="text-gold hover:underline">
            Planos e preços
          </Link>
          <Link to="/termos" className="text-foreground/75 hover:text-gold">
            Termos de uso
          </Link>
          <Link to="/privacidade" className="text-foreground/75 hover:text-gold">
            Privacidade
          </Link>
          <Link to="/reembolso" className="text-foreground/75 hover:text-gold">
            Reembolso
          </Link>
          <Link to="/biografia" className="text-foreground/75 hover:text-gold">
            Sobre
          </Link>
        </nav>
        <div className="mt-4 text-center text-xs text-foreground/60">
          © {new Date().getFullYear()} AWÃ TECH — Adler Magno Santos. Pagamentos processados por Paddle.com (Merchant of Record).
        </div>
      </div>
    </footer>
  );
}

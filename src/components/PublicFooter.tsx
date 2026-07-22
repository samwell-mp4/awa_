import { Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";

export function PublicFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 border-t border-gold/20 bg-[oklch(0.10_0.03_145/0.9)] backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
        <div className="grid gap-8 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <div className="font-display text-lg font-black uppercase tracking-wide text-cream">
              AWÃ <span className="text-gradient-gold">TECH</span>
            </div>
            <p className="mt-2 max-w-sm text-xs leading-relaxed text-foreground/65">
              Plataforma dedicada ao ensino e preservação de línguas indígenas
              brasileiras, com respeito e curadoria cultural.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-forest-deep/50 px-3 py-1.5 text-[11px] font-semibold text-foreground/75">
              <ShieldCheck className="h-3.5 w-3.5 text-gold" />
              Pagamentos seguros via Paddle (Merchant of Record)
            </div>
          </div>

          <FooterCol title="Produto">
            <FooterLink to="/planos">Planos e preços</FooterLink>
            <FooterLink to="/biografia">Sobre o projeto</FooterLink>
            <FooterLink to="/instalar">Instalar o app</FooterLink>
          </FooterCol>

          <FooterCol title="Legal">
            <FooterLink to="/termos">Termos de uso</FooterLink>
            <FooterLink to="/privacidade">Política de privacidade</FooterLink>
            <FooterLink to="/reembolso">Política de reembolso</FooterLink>
          </FooterCol>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-gold/15 pt-6 text-[11px] text-foreground/55 md:flex-row">
          <span>© {year} AWÃ TECH — Adler Magno Santos. Todos os direitos reservados.</span>
          <span className="tracking-wider uppercase">Feito com respeito e cultura viva</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-gold/90">
        {title}
      </div>
      <ul className="flex flex-col gap-2">{children}</ul>
    </div>
  );
}

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        to={to}
        className="text-xs font-medium text-foreground/75 transition hover:text-gold"
      >
        {children}
      </Link>
    </li>
  );
}

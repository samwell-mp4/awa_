import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ShieldCheck } from "lucide-react";

type FooterDict = {
  desc: string;
  paddle: string;
  produto: string;
  legal: string;
  planos: string;
  sobre: string;
  instalar: string;
  termos: string;
  privacidade: string;
  reembolso: string;
  rights: string;
  motto: string;
};

const FOOTER_I18N: Record<string, FooterDict> = {
  pt: {
    desc: "Plataforma dedicada ao ensino e preservação de línguas indígenas brasileiras, com respeito e curadoria cultural.",
    paddle: "Pagamentos seguros via Paddle (Merchant of Record)",
    produto: "Produto",
    legal: "Legal",
    planos: "Planos e preços",
    sobre: "Sobre o projeto",
    instalar: "Instalar o app",
    termos: "Termos de uso",
    privacidade: "Política de privacidade",
    reembolso: "Política de reembolso",
    rights: "Todos os direitos reservados.",
    motto: "Feito com respeito e cultura viva",
  },
  en: {
    desc: "Platform dedicated to teaching and preserving Brazilian indigenous languages, with respect and cultural curation.",
    paddle: "Secure payments via Paddle (Merchant of Record)",
    produto: "Product",
    legal: "Legal",
    planos: "Plans and pricing",
    sobre: "About the project",
    instalar: "Install the app",
    termos: "Terms of use",
    privacidade: "Privacy policy",
    reembolso: "Refund policy",
    rights: "All rights reserved.",
    motto: "Made with respect and living culture",
  },
  es: {
    desc: "Plataforma dedicada a la enseñanza y preservación de lenguas indígenas brasileñas, con respeto y curaduría cultural.",
    paddle: "Pagos seguros vía Paddle (Merchant of Record)",
    produto: "Producto",
    legal: "Legal",
    planos: "Planes y precios",
    sobre: "Sobre el proyecto",
    instalar: "Instalar la app",
    termos: "Términos de uso",
    privacidade: "Política de privacidad",
    reembolso: "Política de reembolso",
    rights: "Todos los derechos reservados.",
    motto: "Hecho con respeto y cultura viva",
  },
  pat: {
    desc: "Plataforma dedicada ao ensino e preservação de línguas indígenas brasileiras, com respeito e curadoria cultural.",
    paddle: "Pagamentos seguros via Paddle (Merchant of Record)",
    produto: "Produto",
    legal: "Legal",
    planos: "Planos e preços",
    sobre: "Sobre o projeto",
    instalar: "Instalar o app",
    termos: "Termos de uso",
    privacidade: "Política de privacidade",
    reembolso: "Política de reembolso",
    rights: "Todos os direitos reservados.",
    motto: "Feito com respeito e cultura viva",
  },
};

function useFooterDict(): FooterDict {
  const { i18n } = useTranslation();
  const raw = (i18n.language || "pt").toLowerCase();
  const key = raw.startsWith("pat") ? "pat" : raw.slice(0, 2);
  return FOOTER_I18N[key] ?? FOOTER_I18N.pt;
}

export function PublicFooter() {
  const year = new Date().getFullYear();
  const d = useFooterDict();
  return (
    <footer className="mt-16 border-t border-gold/20 bg-[oklch(0.10_0.03_145/0.9)] backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
        <div className="grid gap-8 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <div className="font-display text-lg font-black uppercase tracking-wide text-cream">
              AWÃ <span className="text-gradient-gold">TECH</span>
            </div>
            <p className="mt-2 max-w-sm text-xs leading-relaxed text-foreground/65">
              {d.desc}
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-forest-deep/50 px-3 py-1.5 text-[11px] font-semibold text-foreground/75">
              <ShieldCheck className="h-3.5 w-3.5 text-gold" />
              {d.paddle}
            </div>
          </div>

          <FooterCol title={d.produto}>
            <FooterLink to="/planos">{d.planos}</FooterLink>
            <FooterLink to="/biografia">{d.sobre}</FooterLink>
            <FooterLink to="/instalar">{d.instalar}</FooterLink>
          </FooterCol>

          <FooterCol title={d.legal}>
            <FooterLink to="/termos">{d.termos}</FooterLink>
            <FooterLink to="/privacidade">{d.privacidade}</FooterLink>
            <FooterLink to="/reembolso">{d.reembolso}</FooterLink>
          </FooterCol>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-gold/15 pt-6 text-[11px] text-foreground/55 md:flex-row">
          <span>© {year} AWÃ TECH — Adler Magno Santos. {d.rights}</span>
          <span className="tracking-wider uppercase">{d.motto}</span>
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

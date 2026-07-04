import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, Youtube } from "lucide-react";
import { Logo } from "./logo";

const socialIcons = [
  { Icon: Instagram, label: "Instagram" },
  { Icon: Youtube, label: "YouTube" },
  { Icon: Facebook, label: "Facebook" },
  { Icon: Mail, label: "E-mail" },
];

const columns = [
  {
    title: "Projeto",
    links: [
      { label: "Biografia", href: "/biografia" as const },
      { label: "Instalar app", href: "/instalar" as const },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Termos de uso", href: "/termos" as const },
      { label: "Privacidade", href: "/privacidade" as const },
      { label: "Reembolso", href: "/reembolso" as const },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-gold/25 bg-[oklch(0.12_0.03_145/0.85)]">
      <div className="tribal-border mx-auto max-w-6xl" />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 md:grid-cols-4 md:px-8">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-foreground/70">
            AWÃ TECH é uma iniciativa educacional dedicada à preservação e ao ensino das línguas
            e culturas dos povos indígenas do Brasil — com sabedoria ancestral e tecnologia viva.
          </p>
          <div className="mt-5 flex gap-2">
            {socialIcons.map(({ Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="grid h-10 w-10 place-items-center rounded-full border border-gold/30 bg-card/60 text-gold hover:-translate-y-0.5 hover:bg-gold/15 hover:shadow-[var(--shadow-gold)]"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-gold/80">
              {col.title}
            </div>
            <ul className="mt-4 flex flex-col gap-2">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.href}
                    className="text-sm text-foreground/75 hover:text-cream hover:underline underline-offset-4 decoration-gold/50"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-gold/15">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-1 px-4 py-5 text-center text-xs text-foreground/60 md:flex-row md:justify-between md:text-left md:px-8">
          <div>© {new Date().getFullYear()} AWÃ TECH · Todos os direitos reservados.</div>
          <div className="text-gold/70">Feito com respeito aos povos originários 🌿</div>
        </div>
      </div>
    </footer>
  );
}

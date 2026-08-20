import { Link } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Logo } from "./logo";

const socialIcons = [
  { Icon: () => <span>📸</span>, label: "Instagram" },
  { Icon: () => <span>📺</span>, label: "YouTube" },
  { Icon: () => <span>👥</span>, label: "Facebook" },
  { Icon: Mail, label: "E-mail" },
];

export function SiteFooter() {
  const { t } = useTranslation();

  const columns = [
    {
      title: t("footer.projeto"),
      links: [
        { label: t("footer.biografia"), href: "/biografia" as const },
        { label: t("footer.instalar"), href: "/instalar" as const },
      ],
    },
    {
      title: t("footer.legal"),
      links: [
        { label: t("footer.termos"), href: "/termos" as const },
        { label: t("footer.privacidade"), href: "/privacidade" as const },
        { label: t("footer.reembolso"), href: "/reembolso" as const },
      ],
    },
  ];

  return (
    <footer className="mt-16 border-t border-gold/25 bg-[oklch(0.12_0.03_145/0.85)]">
      <div className="tribal-border mx-auto max-w-6xl" />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 md:grid-cols-4 md:px-8">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-foreground/70">
            {t("footer.tagline")}
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
                <li key={l.href}>
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
          <div>{t("footer.copyright", { year: new Date().getFullYear() })}</div>
          <div className="text-gold/70">{t("footer.respect")}</div>
        </div>
      </div>
    </footer>
  );
}

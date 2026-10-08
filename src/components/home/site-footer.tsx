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

export function SiteFooter({ mode = "all" }: { mode?: "all" | "adulto" | "infantil" } = {}) {
  const { t } = useTranslation();
  const isKids = mode === "infantil";

  const kidsColumns = [
    {
      title: "Aldeia Infantil",
      links: [
        { label: "Trilhas de Aprendizado", href: "/trilhas-infantil" as const },
        { label: "Músicas e Cânticos", href: "/musicas-infantil" as const },
        { label: "Histórias da Aldeia", href: "/historias-infantil" as const },
        { label: "Jogos Educativos", href: "/jogos-infantil" as const },
      ],
    },
    {
      title: "Pais & Família",
      links: [
        { label: "Área Adulto", href: "/adulto" as const },
        { label: "História e Biografia", href: "/biografia" as const },
        { label: "Instalar Aplicativo", href: "/instalar" as const },
      ],
    },
    {
      title: "Segurança & Termos",
      links: [
        { label: "Termos de Uso", href: "/termos" as const },
        { label: "Privacidade da Família", href: "/privacidade" as const },
      ],
    },
  ];

  const standardColumns = [
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

  if (isKids) {
    return (
      <footer className="mt-16 border-t-2 border-[#8d5b2d]/70 bg-gradient-to-b from-[#221206] via-[#1a0d04] to-[#100702] text-[#fefae0]">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 md:grid-cols-4 md:px-8">
          <div>
            <Logo mode="infantil" />
            <p className="mt-3 max-w-sm text-xs leading-relaxed text-[#fefae0]/80">
              Espaço educativo dedicado a conectar crianças com as línguas, cânticos e saberes vivos dos povos indígenas.
            </p>
            <div className="mt-4 flex gap-2">
              {socialIcons.map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="grid h-9 w-9 place-items-center rounded-full border border-[#8d5b2d] bg-[#3a2212] text-[#ffd166] shadow hover:-translate-y-0.5 hover:border-[#ffd166] hover:bg-[#4a2e18] transition-all"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {kidsColumns.map((col) => (
            <div key={col.title}>
              <div className="font-display text-xs font-black uppercase tracking-wider text-[#ffd166]">
                {col.title}
              </div>
              <ul className="mt-3 flex flex-col gap-2">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      to={l.href}
                      className="text-xs font-semibold text-[#fefae0]/75 hover:text-[#ffd166] transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-[#8d5b2d]/40">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-1 px-4 py-4 text-center text-xs text-[#d4a373] md:flex-row md:justify-between md:text-left md:px-8">
            <div>© {new Date().getFullYear()} Awã Tech Infantil — Culturas Vivas</div>
            <div className="text-[11px] text-[#ffd166]">Feito com carinho e respeito aos povos originários</div>
          </div>
        </div>
      </footer>
    );
  }

  const isAdult = mode === "adulto";

  return (
    <footer className={
      isAdult
        ? "mt-16 border-t border-[#e8e4dc] bg-white text-[#1f2937]"
        : "mt-16 border-t border-gold/25 bg-[oklch(0.12_0.03_145/0.85)]"
    }>
      {!isAdult && <div className="tribal-border mx-auto max-w-6xl" />}
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 md:grid-cols-4 md:px-8">
        <div>
          <Logo mode={isAdult ? "adulto" : "adulto"} />
          <p className={`mt-4 max-w-sm text-sm leading-relaxed ${isAdult ? "text-[#4b5563]" : "text-foreground/70"}`}>
            {t("footer.tagline")}
          </p>
          <div className="mt-5 flex gap-2">
            {socialIcons.map(({ Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className={`grid h-10 w-10 place-items-center rounded-full border transition hover:-translate-y-0.5 ${
                  isAdult
                    ? "border-[#e2ded5] bg-[#faf9f6] text-[#1b4332] hover:bg-[#1b4332]/10 hover:border-[#1b4332]/40"
                    : "border-gold/30 bg-card/60 text-gold hover:bg-gold/15 hover:shadow-[var(--shadow-gold)]"
                }`}
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {standardColumns.map((col) => (
          <div key={col.title}>
            <div className={`text-[11px] font-bold uppercase tracking-[0.18em] ${
              isAdult ? "text-[#1b4332]" : "text-gold/80"
            }`}>
              {col.title}
            </div>
            <ul className="mt-4 flex flex-col gap-2">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link
                    to={l.href}
                    className={`text-sm transition ${
                      isAdult
                        ? "text-[#4b5563] hover:text-[#11231b] hover:underline underline-offset-4 decoration-[#1b4332]/50"
                        : "text-foreground/75 hover:text-cream hover:underline underline-offset-4 decoration-gold/50"
                    }`}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className={`border-t ${isAdult ? "border-[#e8e4dc]" : "border-gold/15"}`}>
        <div className={`mx-auto flex max-w-6xl flex-col items-center gap-1 px-4 py-5 text-center text-xs md:flex-row md:justify-between md:text-left md:px-8 ${
          isAdult ? "text-[#6b7280]" : "text-foreground/60"
        }`}>
          <div>{t("footer.copyright", { year: new Date().getFullYear() })}</div>
          <div className={isAdult ? "text-[#b47e28] font-medium" : "text-gold/70"}>{t("footer.respect")}</div>
        </div>
      </div>
    </footer>
  );
}

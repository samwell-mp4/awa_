import { Facebook, Instagram, Mail, Youtube } from "lucide-react";
import { Logo } from "./logo";

const socialIcons = [Instagram, Youtube, Facebook, Mail];

export function SiteFooter() {
  return (
    <footer className="mt-14 border-t border-gold/20 bg-[oklch(0.14_0.03_145/0.8)]">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3 md:px-8">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-3 text-xs leading-relaxed text-foreground/65">
            AWÃ TECH é uma iniciativa educacional dedicada à preservação e ao ensino das línguas
            e culturas dos povos indígenas do Brasil.
          </p>
        </div>
        <div>
          <div className="text-sm font-bold text-cream">Redes sociais</div>
          <div className="mt-3 flex gap-2">
            {socialIcons.map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="grid h-9 w-9 place-items-center rounded-full border border-gold/30 bg-card/60 text-gold transition hover:bg-gold/15"
                aria-label="rede social"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-gold/15">
        <div className="mx-auto max-w-6xl px-4 py-4 text-center text-xs text-foreground/60 md:px-8">
          © {new Date().getFullYear()} AWÃ TECH · Todos os direitos reservados · Feito com
          respeito aos povos originários.
        </div>
      </div>
    </footer>
  );
}

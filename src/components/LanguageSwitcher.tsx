import { useState, useRef, useEffect } from "react";
import { Globe, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGS, type LangCode } from "@/i18n";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const current = SUPPORTED_LANGS.find((l) => l.code === i18n.language) ?? SUPPORTED_LANGS[0];

  function change(code: LangCode) {
    void i18n.changeLanguage(code);
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("common.idioma")}
        title={t("common.idioma")}
        className={
          compact
            ? "inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-card/60 px-3 py-2 text-sm text-cream hover:bg-gold/10"
            : "grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gold/40 bg-card/60 text-gold hover:bg-gold/15"
        }
      >
        <Globe className="h-4 w-4" />
        {compact && <span className="text-xs font-semibold">{current.flag} {current.label}</span>}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-2xl border border-gold/30 bg-forest-deep/95 shadow-[var(--shadow-gold)] backdrop-blur-xl">
          {SUPPORTED_LANGS.map((l) => {
            const active = l.code === i18n.language;
            return (
              <button
                key={l.code}
                onClick={() => change(l.code)}
                className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition ${
                  active ? "bg-gold/20 text-gold" : "text-cream hover:bg-leaf/15"
                } `}
              >
                <span className="text-base">{l.flag}</span>
                <span className="flex-1">{l.label}</span>
                {active && <Check className="h-4 w-4" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

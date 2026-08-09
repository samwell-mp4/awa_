import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { Globe, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGS, type LangCode } from "@/i18n";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; right: number } | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      const t = e.target as Node;
      if (wrapRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useLayoutEffect(() => {
    if (!open || !btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    setCoords({ top: r.bottom + 8, right: window.innerWidth - r.right });
  }, [open]);

  const currentCode = (i18n.language || "pt").split("-")[0].toLowerCase();
  const current = SUPPORTED_LANGS.find((l) => l.code === currentCode) ?? SUPPORTED_LANGS[0];

  async function change(code: LangCode) {
    console.log(`[i18n] Manually changing language to: ${code}`);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("awa_lang", code);
      document.cookie = `awa_lang=${code}; path=/; max-age=31536000; SameSite=Lax`;
      document.documentElement.lang = code;
    }
    await i18n.changeLanguage(code);
    setOpen(false);
    // Force a small delay and re-render if needed, but changeLanguage should handle it.
  }

  return (
    <div ref={wrapRef} className="relative">
      <button
        ref={btnRef}
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
      {open && coords && typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            style={{ position: "fixed", top: coords.top, right: coords.right, zIndex: 2147483647 }}
            className="w-48 overflow-hidden rounded-2xl border border-gold/30 bg-forest-deep shadow-[var(--shadow-gold)]"
          >
            {SUPPORTED_LANGS.map((l) => {
              const active = l.code === currentCode;
              return (
                <button
                  key={l.code}
                  onClick={() => change(l.code)}
                  className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition ${
                    active ? "bg-gold/20 text-gold" : "text-cream hover:bg-leaf/15"
                  }`}
                >
                  <span className="text-base">{l.flag}</span>
                  <span className="flex-1">{l.label}</span>
                  {active && <Check className="h-4 w-4" />}
                </button>
              );
            })}
          </div>,
          document.body,
        )}
    </div>
  );
}

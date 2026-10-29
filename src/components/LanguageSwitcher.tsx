import { useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Globe, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGS, type LangCode } from "@/i18n";

interface MenuCoords {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<MenuCoords | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    const menuWidth = 200; // w-48 is 192px + safety margin
    const menuHeight = 175;
    const margin = 8;

    const next: MenuCoords = {};

    // Vertical placement:
    // Check if there is enough space below the button.
    const spaceBelow = window.innerHeight - r.bottom;
    const spaceAbove = r.top;

    if (spaceBelow < menuHeight + margin && spaceAbove > spaceBelow) {
      // Not enough space below, open ABOVE the button
      next.bottom = Math.max(margin, window.innerHeight - r.top + margin);
    } else {
      // Open BELOW the button
      next.top = Math.max(margin, Math.min(window.innerHeight - menuHeight - margin, r.bottom + margin));
    }

    // Horizontal placement:
    // If the button is on the left half of the screen (e.g. desktop sidebar)
    if (r.left < window.innerWidth / 2) {
      // Align with left edge of button
      const idealLeft = r.left;
      next.left = Math.max(margin, Math.min(idealLeft, window.innerWidth - menuWidth - margin));
    } else {
      // Align with right edge of button
      const idealRight = window.innerWidth - r.right;
      next.right = Math.max(margin, Math.min(idealRight, window.innerWidth - menuWidth - margin));
    }

    setCoords(next);
  }, []);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      const t = e.target as Node;
      if (wrapRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
    const onScrollOrResize = () => updatePosition();
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [open, updatePosition]);

  const currentCode = (i18n.resolvedLanguage || i18n.language || "pt").slice(0, 2).toLowerCase();
  const current = SUPPORTED_LANGS.find((l) => l.code === currentCode) ?? SUPPORTED_LANGS[0];

  function change(code: LangCode) {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("awa_lang", code);
      document.documentElement.lang = code;
    }
    void i18n.changeLanguage(code);
    setOpen(false);
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
            ? "inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-card/60 px-3 py-2 text-sm text-cream hover:bg-gold/10 transition"
            : "grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gold/40 bg-card/60 text-gold hover:bg-gold/15 transition shadow-sm"
        }
      >
        <Globe className="h-4 w-4" />
        {compact && <span className="text-xs font-semibold">{current.flag} {current.label}</span>}
      </button>
      {open && coords && typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: "fixed",
              top: coords.top !== undefined ? `${coords.top}px` : undefined,
              bottom: coords.bottom !== undefined ? `${coords.bottom}px` : undefined,
              left: coords.left !== undefined ? `${coords.left}px` : undefined,
              right: coords.right !== undefined ? `${coords.right}px` : undefined,
              zIndex: 2147483647,
            }}
            className="w-48 overflow-hidden rounded-2xl border border-gold/40 bg-[#14231b] p-1.5 shadow-[0_12px_36px_rgba(0,0,0,0.65),0_0_20px_rgba(212,175,55,0.25)] backdrop-blur-md animate-in fade-in-0 zoom-in-95 duration-150"
          >
            {SUPPORTED_LANGS.map((l) => {
              const active = l.code === currentCode;
              return (
                <button
                  key={l.code}
                  onClick={() => change(l.code)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition font-medium ${
                    active ? "bg-gold/20 text-gold font-bold" : "text-cream hover:bg-gold/10 hover:text-gold"
                  }`}
                >
                  <span className="text-base">{l.flag}</span>
                  <span className="flex-1">{l.label}</span>
                  {active && <Check className="h-4 w-4 text-gold shrink-0" />}
                </button>
              );
            })}
          </div>,
          document.body,
        )}
    </div>
  );
}

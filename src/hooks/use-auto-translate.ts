import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { translateI18n } from "@/lib/i18n-translate.functions";
import { staticTranslate } from "@/lib/static-glossary";

const LS_PREFIX = "awa_i18n_";

function loadCache(lang: string): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(LS_PREFIX + lang) ?? "{}");
  } catch {
    return {};
  }
}

function saveCache(lang: string, cache: Record<string, string>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LS_PREFIX + lang, JSON.stringify(cache));
  } catch {
    /* ignore quota */
  }
}

/**
 * Translate arbitrary (DB-sourced) Portuguese text to the current UI language.
 * - Returns originals immediately for pt/pat and while loading.
 * - Caches per language in localStorage.
 */
export function useAutoTranslate(texts: (string | null | undefined)[]): string[] {
  const { i18n } = useTranslation();
  const lang = (i18n.language || "pt").slice(0, 2).toLowerCase();
  const key = texts.map((t) => (t ?? "").toString()).join("\u0001");
  const normalized = useMemo(() => texts.map((t) => (t ?? "").toString()), [key]);
  const [out, setOut] = useState<string[]>(normalized);

  useEffect(() => {
    if (lang === "pt" || lang === "pat" || normalized.every((s) => !s.trim())) {
      setOut(normalized);
      return;
    }
    const cache = loadCache(lang);
    // Glossário estático primeiro (instantâneo, funciona offline), depois cache.
    const resolve = (s: string) =>
      staticTranslate(s, lang) ?? cache[s.trim()] ?? s;
    setOut(normalized.map(resolve));

    const missing = Array.from(
      new Set(
        normalized
          .map((s) => s.trim())
          .filter((s) => s && !staticTranslate(s, lang) && !(s in cache)),
      ),
    );
    if (missing.length === 0) return;

    let cancelled = false;
    translateI18n({ data: { texts: missing, lang } })
      .then((res) => {
        if (cancelled) return;
        const next = { ...cache };
        missing.forEach((src, i) => {
          const value = res.translations?.[i];
          if (value) next[src] = value;
        });
        saveCache(lang, next);
        setOut(normalized.map((s) => staticTranslate(s, lang) ?? next[s.trim()] ?? s));
      })
      .catch(() => {
        /* keep originals */
      });

    return () => {
      cancelled = true;
    };
  }, [key, lang, normalized]);

  return out;
}

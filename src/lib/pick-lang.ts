import { useTranslation } from "react-i18next";

export type Lang = "pt" | "en" | "es" | "pat";

export function currentContentLang(raw: string | undefined): Lang {
  const l = (raw || "pt").slice(0, 2).toLowerCase();
  if (l === "en") return "en";
  if (l === "es") return "es";
  if (l === "pat") return "pat";
  return "pt";
}

/**
 * Picks the localized value for a row, falling back to the original field.
 * Convention: DB has `field_en` and `field_es` columns; original `field` stays for pt/patxôhã.
 */
export function pickLang<T extends Record<string, unknown>>(
  row: T | null | undefined,
  field: keyof T & string,
  lang: Lang,
): string {
  if (!row) return "";
  if (lang === "pt" || lang === "pat") return (row[field] as string) ?? "";
  const key = `${field}_${lang}` as keyof T & string;
  const value = row[key];
  if (typeof value === "string" && value.trim()) return value;
  return (row[field] as string) ?? "";
}

/** Hook variant: reads current i18n language and returns a bound picker. */
export function useLang(): Lang {
  const { i18n } = useTranslation();
  return currentContentLang(i18n.language);
}

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import pt from "./locales/pt";
import en from "./locales/en";
import es from "./locales/es";
import pat from "./locales/pat";

export const SUPPORTED_LANGS = [
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
] as const;

export type LangCode = (typeof SUPPORTED_LANGS)[number]["code"];

const isBrowser = typeof window !== "undefined";

if (!i18n.isInitialized) {
  const chain = i18n.use(initReactI18next);
  if (isBrowser) chain.use(LanguageDetector);

  void chain.init({
    resources: {
      pt: { translation: pt },
      en: { translation: en },
      es: { translation: es },
      pat: { translation: pat },
    },
    lng: isBrowser ? undefined : "pt",
    fallbackLng: "pt",
    supportedLngs: ["pt", "en", "es"],
    load: "languageOnly",
    nonExplicitSupportedLngs: true,
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "awa_lang",
      caches: ["localStorage"],
    },
  });
}

// Ensure the client picks up the stored/detected language even if SSR
// initialised with the fallback ("pt") first.
if (isBrowser) {
  const stored = window.localStorage.getItem("awa_lang");
  const target = stored && ["pt", "en", "es"].includes(stored) ? stored : undefined;
  document.documentElement.lang = target || (i18n.resolvedLanguage || i18n.language || "pt").slice(0, 2);
  if (target && i18n.language !== target) {
    void i18n.changeLanguage(target);
  }
  i18n.on("languageChanged", (lng) => {
    const code = (lng || "pt").slice(0, 2).toLowerCase();
    if (["pt", "en", "es"].includes(code)) {
      window.localStorage.setItem("awa_lang", code);
      document.documentElement.lang = code;
    }
  });
}

export default i18n;

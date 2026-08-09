import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import pt from "./locales/pt";
import en from "./locales/en";
import es from "./locales/es";
import pat from "./locales/pat";

export const SUPPORTED_LANGS = [
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "pat", label: "Patxôhã", flag: "🏹" },
] as const;

export type LangCode = (typeof SUPPORTED_LANGS)[number]["code"];

const isBrowser = typeof window !== "undefined";

if (!i18n.isInitialized) {
  // Sync initialization
  void i18n.use(initReactI18next).init({
    resources: {
      pt: { translation: pt },
      en: { translation: en },
      es: { translation: es },
      pat: { translation: pat },
    },
    lng: "pt",
    fallbackLng: "pt",
    supportedLngs: ["pt", "en", "es", "pat"],
    load: "languageOnly",
    nonExplicitSupportedLngs: true,
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });
  
  // Basic initialization
  i18n.language = "pt";
}

// Persist language changes to localStorage and cookies (browser only).
if (isBrowser) {
  i18n.on("languageChanged", (lng) => {
    if (!lng) return;
    const code = lng.split("-")[0].toLowerCase();
    if (["pt", "en", "es", "pat"].includes(code)) {
      try {
        window.localStorage.setItem("awa_lang", code);
        // Add a cookie for better SSR sync if needed
        document.cookie = `awa_lang=${code}; path=/; max-age=31536000; SameSite=Lax`;
        document.documentElement.lang = code;
      } catch (e) {
        console.warn("Failed to persist language:", e);
      }
    }
  });
}

export default i18n;


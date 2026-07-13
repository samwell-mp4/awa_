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
] as const;

export type LangCode = (typeof SUPPORTED_LANGS)[number]["code"];

const isBrowser = typeof window !== "undefined";

if (!i18n.isInitialized) {
  // Init synchronously with "pt" on BOTH server and client so the first
  // client render matches SSR HTML exactly. Language switching happens
  // post-hydration in LanguageHydrator (__root.tsx) via useEffect.
  void i18n.use(initReactI18next).init({
    resources: {
      pt: { translation: pt },
      en: { translation: en },
      es: { translation: es },
      pat: { translation: pat },
    },
    lng: "pt",
    fallbackLng: "pt",
    supportedLngs: ["pt", "en", "es"],
    load: "languageOnly",
    nonExplicitSupportedLngs: true,
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
    initImmediate: false,
  });
  // Belt-and-suspenders: guarantee language is "pt" for first render on both
  // server and client. Prevents any detector/cached-language race from causing
  // hydration mismatches on translated strings.
  i18n.language = "pt";
}


// Persist language changes to localStorage (browser only, post-init).
if (isBrowser) {
  i18n.on("languageChanged", (lng) => {
    const code = (lng || "pt").slice(0, 2).toLowerCase();
    if (["pt", "en", "es"].includes(code)) {
      try {
        window.localStorage.setItem("awa_lang", code);
      } catch {
        /* ignore quota */
      }
      document.documentElement.lang = code;
    }
  });
}

export default i18n;


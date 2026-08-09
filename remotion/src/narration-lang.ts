export function getNarrationLang(): string {
  if (typeof window === "undefined") return "pt";
  const stored = window.localStorage.getItem("awa_lang");
  if (stored) return stored.slice(0, 2).toLowerCase();
  
  // Se não houver nada no localStorage, tentamos o idioma do navegador
  const navLang = window.navigator.language.slice(0, 2).toLowerCase();
  return ["pt", "en", "es"].includes(navLang) ? navLang : "pt";
}

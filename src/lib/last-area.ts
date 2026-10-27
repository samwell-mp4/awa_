import { useEffect, useState } from "react";

export type AreaPath = "/adulto" | "/infantil" | "/aprender-numeros" | "/";
const KEY = "awa:lastArea";

export function setLastArea(path: "/adulto" | "/infantil" | "/aprender-numeros") {
  try {
    sessionStorage.setItem(KEY, path);
  } catch {
    // ignore
  }
}

export function getLastArea(): AreaPath {
  if (typeof window !== "undefined") {
    const p = window.location.pathname;
    const s = window.location.search;
    // Explicit kids indicators
    if (
      s.includes("area=infantil") ||
      p.startsWith("/infantil") ||
      p.includes("-infantil") ||
      p === "/amizade"
    ) {
      return "/infantil";
    }
    // Explicit adult indicators
    if (
      s.includes("area=adulto") ||
      p.startsWith("/adulto") ||
      p.startsWith("/trilhas") ||
      p.startsWith("/dicionario") ||
      p.startsWith("/traduzir") ||
      p.startsWith("/musicas") ||
      p.startsWith("/historias") ||
      p.startsWith("/videos") ||
      p.startsWith("/professor") ||
      p.startsWith("/aldeia-velha") ||
      p.startsWith("/saudacoes") ||
      p.startsWith("/biografia") ||
      p.startsWith("/jogos")
    ) {
      return "/adulto";
    }
  }
  try {
    const v = sessionStorage.getItem(KEY);
    if (v === "/adulto" || v === "/infantil" || v === "/aprender-numeros") return v;
  } catch {
    // ignore
  }
  return "/adulto";
}

export function useLastArea(): AreaPath {
  const [area, setArea] = useState<AreaPath>(() => getLastArea());
  useEffect(() => {
    setArea(getLastArea());
  }, []);
  return area;
}

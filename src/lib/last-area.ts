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
  try {
    const v = sessionStorage.getItem(KEY);
    if (v === "/adulto" || v === "/infantil" || v === "/aprender-numeros") return v;
  } catch {
    // ignore
  }
  return "/";
}

export function useLastArea(): AreaPath {
  const [area, setArea] = useState<AreaPath>("/");
  useEffect(() => {
    setArea(getLastArea());
  }, []);
  return area;
}

import { useEffect, useState } from "react";

/**
 * `true` somente depois que o React terminou de hidratar no navegador.
 * Use para ler informações que só existem no cliente (localStorage, hora atual,
 * navigator) sem provocar divergência entre o HTML do servidor e o do cliente.
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}

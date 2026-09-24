import { useEffect } from "react";

// Verifica se há uma nova versão publicada e recarrega sozinho (celular e PC).
function scriptsSignature(html: string) {
  const m = html.match(/<script[^>]+src="[^"]+"/g) || [];
  return m.sort().join("|");
}

export function AutoUpdater() {
  useEffect(() => {
    if (import.meta.env.DEV) return;
    // Remove service workers/caches antigos que prendem versões velhas
    navigator.serviceWorker?.getRegistrations?.().then((rs) => rs.forEach((r) => r.unregister())).catch(() => {});
    if ("caches" in window) caches.keys().then((ks) => ks.forEach((k) => caches.delete(k))).catch(() => {});

    let base: string | null = null;
    let pending = false;
    const check = async () => {
      try {
        const res = await fetch(`/?v=${Date.now()}`, { cache: "no-store" });
        const sig = scriptsSignature(await res.text());
        if (!sig) return;
        if (base === null) base = sig;
        else if (sig !== base) pending = true;
        if (pending && document.visibilityState === "hidden") window.location.reload();
      } catch {
        /* sem internet: tenta depois */
      }
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        if (pending) window.location.reload();
        else void check();
      } else if (pending) window.location.reload();
    };
    void check();
    const id = window.setInterval(check, 60_000);
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, []);
  return null;
}

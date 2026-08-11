/**
 * Runs a callback only after the page is fully loaded and React has finished
 * hydrating (including streamed Suspense boundaries).
 *
 * Language switching and DOM text rewriting must never happen while React is
 * still hydrating — doing so produces "Hydration failed because the server
 * rendered text didn't match the client" errors and visible text flicker.
 *
 * Returns a cleanup function that cancels the pending callback.
 */
export function runAfterHydration(callback: () => void, extraDelayMs = 120): () => void {
  if (typeof window === "undefined") return () => {};

  let cancelled = false;
  let timer: number | null = null;
  let raf1: number | null = null;
  let raf2: number | null = null;

  const start = () => {
    if (cancelled) return;
    // Two animation frames guarantee at least one committed paint after the
    // load event, which is past hydration for streamed markup.
    raf1 = window.requestAnimationFrame(() => {
      if (cancelled) return;
      raf2 = window.requestAnimationFrame(() => {
        if (cancelled) return;
        timer = window.setTimeout(() => {
          if (!cancelled) callback();
        }, extraDelayMs);
      });
    });
  };

  if (document.readyState === "complete") {
    start();
  } else {
    window.addEventListener("load", start, { once: true });
  }

  return () => {
    cancelled = true;
    window.removeEventListener("load", start);
    if (raf1 !== null) window.cancelAnimationFrame(raf1);
    if (raf2 !== null) window.cancelAnimationFrame(raf2);
    if (timer !== null) window.clearTimeout(timer);
  };
}

let hydrationDone = false;
let hydrationPromise: Promise<void> | null = null;

/**
 * Resolves once the initial page load / hydration pass is over (or after a
 * safety timeout). Route guards that redirect based on browser-only state must
 * await this, otherwise the redirect happens mid-hydration and React reports
 * "server rendered HTML didn't match the client".
 */
export function waitForHydration(timeoutMs = 1500): Promise<void> {
  if (typeof window === "undefined" || hydrationDone) return Promise.resolve();
  if (hydrationPromise) return hydrationPromise;

  hydrationPromise = new Promise<void>((resolve) => {
    const done = () => {
      hydrationDone = true;
      resolve();
    };
    const timer = window.setTimeout(done, timeoutMs);
    runAfterHydration(() => {
      window.clearTimeout(timer);
      done();
    }, 0);
  });

  return hydrationPromise;
}

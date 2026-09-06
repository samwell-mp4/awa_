import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AppLanguageAutoTranslator } from "@/components/AppLanguageAutoTranslator";
import { PlanExpiryBanner } from "@/components/PlanExpiryBanner";
import { supabase } from "@/integrations/supabase/client";
import { checkMyLoginAllowed } from "@/lib/admin-access.functions";
import { RealtimeContentSync } from "@/hooks/use-realtime-content";

import { toast } from "sonner";
import "@/i18n";


function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "AWÃ TECH — Línguas Indígenas, Culturas Vivas" },
      { name: "description", content: "Aprenda línguas indígenas brasileiras com vídeos, histórias, músicas e desafios. Uma plataforma educativa que preserva culturas vivas." },
      { name: "author", content: "AWÃ TECH" },
      { property: "og:title", content: "AWÃ TECH — Línguas Indígenas, Culturas Vivas" },
      { property: "og:description", content: "Aprenda línguas indígenas brasileiras com vídeos, histórias, músicas e desafios. Uma plataforma educativa que preserva culturas vivas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#1B5E20" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "AWÃ TECH" },
      { name: "twitter:title", content: "AWÃ TECH — Línguas Indígenas, Culturas Vivas" },
      { name: "twitter:description", content: "Aprenda línguas indígenas brasileiras com vídeos, histórias, músicas e desafios. Uma plataforma educativa que preserva culturas vivas." },
      { property: "og:image", content: "https://awa-tech.store/og-awa-tech.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Logo AWÃ TECH" },
      { name: "twitter:image", content: "https://awa-tech.store/og-awa-tech.png" },
    ],
    links: [
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png", sizes: "180x180" },
      { rel: "icon", href: "/favicon.ico", sizes: "any" },
      { rel: "icon", type: "image/png", href: "/favicon.png", sizes: "64x64" },
      { rel: "icon", href: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://pxabkwabefkajiggcmjq.supabase.co", crossOrigin: "anonymous" },
      { rel: "dns-prefetch", href: "https://pxabkwabefkajiggcmjq.supabase.co" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "preload",
        as: "style",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:wght@600;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Archivo+Black&family=Baloo+2:wght@500;700;800&family=Fredoka:wght@500;600;700&family=Hind:wght@400;600;700&display=swap",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:wght@600;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Archivo+Black&family=Baloo+2:wght@500;700;800&family=Fredoka:wght@500;600;700&family=Hind:wght@400;600;700&display=swap",
        media: "all",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <head suppressHydrationWarning>
        <HeadContent />
      </head>
      <body suppressHydrationWarning>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    // Limpa qualquer "selo" (badge) fantasma no ícone do app instalado (PWA)
    const nav = navigator as Navigator & {
      clearAppBadge?: () => Promise<void>;
      setAppBadge?: (n?: number) => Promise<void>;
    };
    const clear = () => {
      nav.clearAppBadge?.().catch(() => {});
      // Alguns SOs só limpam ao explicitamente setar 0
      nav.setAppBadge?.(0).catch(() => {});
    };
    clear();
    const onVisible = () => document.visibilityState === "visible" && clear();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", clear);
    const id = window.setInterval(clear, 30000);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", clear);
      window.clearInterval(id);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function verify() {
      try {
        const { data: sess } = await supabase.auth.getSession();
        if (!sess.session) return;
        const res = await checkMyLoginAllowed();
        if (cancelled) return;
        if (!res.allowed) {
          toast.error("Acesso não liberado. Contate o administrador do AWÃ TECH.");
          await supabase.auth.signOut();
          window.location.replace("/acesso-negado");
        }
      } catch {
        // silencioso — se falhar, mantém sessão para não travar por erro de rede
      }
    }
    verify();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") verify();
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);


  return (
    <QueryClientProvider client={queryClient}>
      <LanguageHydrator />
      <RealtimeContentSync />
      <AppLanguageAutoTranslator />
      <PlanExpiryBanner />

      <Outlet />

      <Toaster theme="dark" position="top-right" richColors />
    </QueryClientProvider>
  );
}

function LanguageHydrator() {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Only run on client
    if (typeof window === "undefined") return;

    const valid = ["pt", "en", "es"];
    const stored = window.localStorage.getItem("awa_lang")?.slice(0, 2).toLowerCase();
    const detected = navigator.language?.slice(0, 2).toLowerCase();
    const target = valid.includes(stored || "")
      ? stored
      : valid.includes(detected || "")
        ? detected
        : "pt";

    if (!target || target === "pt") {
      document.documentElement.lang = "pt";
      return;
    }

    let cancelled = false;
    const apply = () => {
      if (cancelled) return;
      document.documentElement.lang = target;
      window.localStorage.setItem("awa_lang", target);
      if ((i18n.resolvedLanguage || i18n.language || "pt").slice(0, 2).toLowerCase() !== target) {
        void i18n.changeLanguage(target);
      }
    };

    // Aguarda o fim do carregamento (inclui os trechos de página carregados
    // sob demanda) para que a troca de idioma nunca conflite com a hidratação.
    if (document.readyState === "complete") {
      const id = window.setTimeout(apply, 0);
      return () => {
        cancelled = true;
        window.clearTimeout(id);
      };
    }
    window.addEventListener("load", apply, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener("load", apply);
    };
  }, [i18n]);


  return null;
}



import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";

const REDIRECT_KEY = "awa_post_login_redirect";

/**
 * O login com Google volta para a origem do site. Se o usuário tinha um
 * destino pendente (ex.: /planos?need=adulto), levamos ele para lá.
 */
export function PostLoginRedirect() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading || !user) return;
    const target = sessionStorage.getItem(REDIRECT_KEY);
    if (!target) return;
    sessionStorage.removeItem(REDIRECT_KEY);
    if (!target.startsWith("/") || target.startsWith("//")) return;
    if (target === window.location.pathname + window.location.search) return;
    navigate({ to: target, replace: true });
  }, [user, loading, navigate]);

  return null;
}

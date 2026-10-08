import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const DEV_MOCK_USER = {
  id: "00000000-0000-0000-0000-000000000001",
  app_metadata: { provider: "email", providers: ["email"] },
  user_metadata: { name: "Usuário Teste", full_name: "Usuário Teste (Acesso Completo)" },
  aud: "authenticated",
  confirmation_sent_at: "",
  recovery_sent_at: "",
  email_change_sent_at: "",
  new_email: "",
  invited_at: "",
  action_link: "",
  email: "teste@awatech.local",
  phone: "",
  created_at: new Date().toISOString(),
  confirmed_at: new Date().toISOString(),
  email_confirmed_at: new Date().toISOString(),
  phone_confirmed_at: "",
  last_sign_in_at: new Date().toISOString(),
  role: "authenticated",
  updated_at: new Date().toISOString(),
  identities: [],
  factors: [],
} as unknown as User;

export const DEV_MOCK_SESSION = {
  access_token: "dev-mock-access-token",
  refresh_token: "dev-mock-refresh-token",
  expires_in: 86400,
  token_type: "bearer",
  user: DEV_MOCK_USER,
} as unknown as Session;

export function isTestModeActive(): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem("awa_logged_out") !== "true";
}

export function loginAsTestUser() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem("awa_logged_out");
    window.localStorage.setItem("awa_test_session", "true");
    window.dispatchEvent(new Event("awa:auth-change"));
  }
}

export function logoutTestUser() {
  if (typeof window !== "undefined") {
    window.localStorage.setItem("awa_logged_out", "true");
    window.localStorage.removeItem("awa_test_session");
    window.dispatchEvent(new Event("awa:auth-change"));
  }
}

export function useAuth() {
  const isTest = isTestModeActive();
  const [session, setSession] = useState<Session | null>(isTest ? DEV_MOCK_SESSION : null);
  const [user, setUser] = useState<User | null>(isTest ? DEV_MOCK_USER : null);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(isTest ? true : false);

  useEffect(() => {
    const handleAuthChange = () => {
      const active = isTestModeActive();
      if (active) {
        setSession(DEV_MOCK_SESSION);
        setUser(DEV_MOCK_USER);
        setIsAdmin(true);
      } else {
        setSession(null);
        setUser(null);
        setIsAdmin(false);
      }
    };
    window.addEventListener("awa:auth-change", handleAuthChange);
    return () => window.removeEventListener("awa:auth-change", handleAuthChange);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (cancelled) return;
      if (s) {
        setSession(s);
        setUser(s.user ?? null);
      } else if (isTestModeActive()) {
        setSession(DEV_MOCK_SESSION);
        setUser(DEV_MOCK_USER);
        setIsAdmin(true);
      } else {
        setSession(null);
        setUser(null);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      if (data.session) {
        setSession(data.session);
        setUser(data.session?.user ?? null);
      } else if (isTestModeActive()) {
        setSession(DEV_MOCK_SESSION);
        setUser(DEV_MOCK_USER);
        setIsAdmin(true);
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }
    if (user.id === DEV_MOCK_USER.id) {
      setIsAdmin(true);
      return;
    }
    let cancelled = false;
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setIsAdmin(!!data);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  return { session, user, loading, isAdmin };
}

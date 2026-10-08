import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

const DEV_MOCK_USER = {
  id: "00000000-0000-0000-0000-000000000001",
  app_metadata: { provider: "email", providers: ["email"] },
  user_metadata: { name: "Desenvolvedor Local", full_name: "Desenvolvedor Local" },
  aud: "authenticated",
  confirmation_sent_at: "",
  recovery_sent_at: "",
  email_change_sent_at: "",
  new_email: "",
  invited_at: "",
  action_link: "",
  email: "dev@awatech.local",
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

const DEV_MOCK_SESSION = {
  access_token: "dev-mock-access-token",
  refresh_token: "dev-mock-refresh-token",
  expires_in: 86400,
  token_type: "bearer",
  user: DEV_MOCK_USER,
} as unknown as Session;

export function useAuth() {
  const [session, setSession] = useState<Session | null>(import.meta.env.DEV ? DEV_MOCK_SESSION : null);
  const [user, setUser] = useState<User | null>(import.meta.env.DEV ? DEV_MOCK_USER : null);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(import.meta.env.DEV ? true : false);

  useEffect(() => {
    let cancelled = false;
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (cancelled) return;
      if (s) {
        setSession(s);
        setUser(s.user ?? null);
      } else if (import.meta.env.DEV) {
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
      } else if (import.meta.env.DEV) {
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
    if (import.meta.env.DEV && user.id === DEV_MOCK_USER.id) {
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


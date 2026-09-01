import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

/**
 * Estado de sessão compartilhado por TODA a aplicação.
 *
 * Antes cada componente que usava `useAuth` abria seu próprio listener de auth
 * e disparava uma consulta a `user_roles` — dezenas de requisições repetidas
 * por página. Agora existe um único listener e um único cache de role.
 */
type AuthState = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
};

let state: AuthState = { session: null, user: null, loading: true, isAdmin: false };
const listeners = new Set<(s: AuthState) => void>();
let started = false;
let adminCheckedFor: string | null = null;

function emit(next: Partial<AuthState>) {
  state = { ...state, ...next };
  for (const l of listeners) l(state);
}

async function checkAdmin(userId: string) {
  if (adminCheckedFor === userId) return;
  adminCheckedFor = userId;
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (adminCheckedFor === userId) emit({ isAdmin: !!data });
}

function start() {
  if (started || typeof window === "undefined") return;
  started = true;

  supabase.auth.onAuthStateChange((_e, s) => {
    const user = s?.user ?? null;
    if (user?.id !== state.user?.id) {
      adminCheckedFor = null;
      emit({ session: s, user, isAdmin: false, loading: false });
      if (user) void checkAdmin(user.id);
    } else {
      emit({ session: s, user, loading: false });
    }
  });

  void supabase.auth.getSession().then(({ data }) => {
    const user = data.session?.user ?? null;
    emit({ session: data.session, user, loading: false });
    if (user) void checkAdmin(user.id);
  });
}

export function useAuth() {
  const [local, setLocal] = useState(state);

  useEffect(() => {
    start();
    listeners.add(setLocal);
    setLocal(state);
    return () => {
      listeners.delete(setLocal);
    };
  }, []);

  return local;
}

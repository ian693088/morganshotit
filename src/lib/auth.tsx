import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AuthState = {
  user: User | null;
  isAdmin: boolean;
  isApprover: boolean;
  loading: boolean;
};

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({ user: null, isAdmin: false, isApprover: false, loading: true });

  useEffect(() => {
    let active = true;
    const load = async (user: User | null) => {
      if (!user) {
        if (active) setState({ user: null, isAdmin: false, isApprover: false, loading: false });
        return;
      }
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      const roles = (data ?? []).map((r) => r.role);
      if (active)
        setState({ user, isAdmin: roles.includes("admin"), isApprover: roles.includes("approver"), loading: false });
    };
    supabase.auth.getSession().then(({ data }) => load(data.session?.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") load(session?.user ?? null);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}

import type { ReactNode } from "react";

import { supabase } from "@/lib/supabase";
import { useAuthClaims } from "@/features/auth/useAuthClaims";
import { AuthContext } from "@/features/auth/AuthContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const { claims, loading } = useAuthClaims();

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  return (
    <AuthContext.Provider value={{ claims, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

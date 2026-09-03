import { useEffect, useState } from "react";
import type { JwtPayload } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export function useAuthClaims() {
  const [claims, setClaims] = useState<JwtPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadClaims() {
      const { data } = await supabase.auth.getClaims();

      setClaims(data?.claims ?? null);
      setLoading(false);
    }

    loadClaims();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadClaims();
    });

    return () => subscription.unsubscribe();
  }, []);

  return { claims, loading };
}

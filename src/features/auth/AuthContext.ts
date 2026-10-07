import { useContext } from "react";
import { createContext } from "react";
import type { AuthContextType } from "@/features/auth/auth.types";

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  function isOwner(ownerId: string): boolean {
    return (
      context !== null &&
      !context.loading &&
      context.claims !== null &&
      context.claims.sub === ownerId
    );
  }

  return { ...context, isOwner };
}

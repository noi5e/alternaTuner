import { Link, useNavigate } from "react-router";

import { toast } from "sonner";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";

import { useAuth } from "@/features/auth/AuthContext";

export function SiteNav() {
  const { claims, loading, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await signOut();
      navigate("/login");
    } catch (error) {
      toast.error("Couldn't log out.", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    }
  }

  return (
    <NavigationMenu className="sticky top-0 z-20 h-(--nav-height) w-full bg-gray-400 p-4 text-white [&>div]:w-full">
      {/* Shadcn inserts a div wrapper for NavigationMenuList, so target the div wrapper with [&>div]:w-full */}
      <NavigationMenuList className="w-full">
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link
              className="text-3xl font-bold tracking-wide italic text-shadow-lg"
              to="/"
            >
              alternaTuner
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem className="ml-auto">
          {!loading && !claims && (
            <NavigationMenuLink asChild>
              <Link to="/login">Login</Link>
            </NavigationMenuLink>
          )}

          {!loading && claims && (
            <NavigationMenuLink asChild>
              <button type="button" onClick={handleLogout}>
                Logout
              </button>
            </NavigationMenuLink>
          )}
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

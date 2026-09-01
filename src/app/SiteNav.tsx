import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Link, useNavigate } from "react-router";

import { useAuthClaims, signOut } from "@/features/auth/useAuthClaims";

export function SiteNav() {
  const { claims, loading } = useAuthClaims();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut();
    navigate("/login");
  }

  return (
    <NavigationMenu className="bg-gray-400 text-white p-4 w-full [&>div]:w-full h-(--nav-height) sticky top-0 z-20">
      {/* Shadcn inserts a div wrapper for NavigationMenuList, so target the div wrapper with [&>div]:w-full */}
      <NavigationMenuList className="w-full">
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link
              className="text-shadow-lg text-3xl italic font-bold tracking-wide"
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

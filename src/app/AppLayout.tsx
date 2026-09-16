import { Outlet } from "react-router";
import { SiteNav } from "@/app/SiteNav";
import { Toaster } from "@/components/ui/sonner";

export function AppLayout() {
  return (
    <>
      <SiteNav />
      <main>
        <Outlet />
      </main>
      <Toaster position="bottom-right" closeButton />
    </>
  );
}

import { Outlet } from "react-router";
import { SiteNav } from "@/app/SiteNav";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

export function AppLayout() {
  return (
    <TooltipProvider delayDuration={300}>
      <SiteNav />
      <main>
        <Outlet />
      </main>
      <Toaster position="bottom-right" closeButton />
    </TooltipProvider>
  );
}

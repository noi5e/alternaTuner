import { NavLink } from "react-router";

import { useSidebar } from "@/components/ui/sidebar";

import ScaleList from "@/features/scales/ScaleList";

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

import { ArrowsClockwiseIcon, PlusIcon } from "@phosphor-icons/react";
import type { ScaleSideBarProps } from "./scale.types";

export function ScaleSideBar({
  userScales,
  hasLoadedScales,
  isLoading,
  isRefreshing,
  error,
  onRetry,
  favorites,
  hasLoadedFavorites,
  favoritesRefreshing,
  favoritesError,
  onRetryFavorites,
}: ScaleSideBarProps) {
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar className="top-(--nav-height) z-10 h-[calc(100dvh-var(--nav-height))]">
      <SidebarHeader className="flex-row items-center justify-between px-5 py-4">
        <h2 className="text-sm font-semibold">Your Library</h2>
        <RefreshIndicator isRefreshing={isRefreshing || favoritesRefreshing} />
      </SidebarHeader>
      <SidebarContent className="gap-0">
        <ScaleList
          label="Saved Scales"
          contentClassName="data-[state=open]:[&>:last-child]:mb-2"
          scales={userScales}
          hasLoaded={hasLoadedScales}
          isLoading={isLoading}
          error={error}
          onRetry={onRetry}
          emptyTitle="No saved scales yet"
          emptyDescription="Create a new scale to get started."
          onNavigate={() => setOpenMobile(false)}
        />
        <ScaleList
          label="Favorite Scales"
          scales={favorites}
          hasLoaded={hasLoadedFavorites}
          isLoading={!hasLoadedFavorites && favoritesRefreshing}
          error={favoritesError}
          onRetry={onRetryFavorites}
          emptyTitle="No favorite scales yet"
          emptyDescription="Favorite a scale to find it here."
          onNavigate={() => setOpenMobile(false)}
        />
      </SidebarContent>

      <SidebarFooter className="mt-4 flex shrink-0 items-center justify-center">
        <Button asChild variant="outline" className="flex w-3/4 justify-center">
          <NavLink to="/scales/new" onClick={() => setOpenMobile(false)}>
            <PlusIcon className="size-4" />
            <span>New Scale</span>
          </NavLink>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

function RefreshIndicator({ isRefreshing }: { isRefreshing: boolean }) {
  return (
    <span role="status" className="inline-flex size-4 shrink-0">
      {isRefreshing && (
        <>
          <ArrowsClockwiseIcon
            aria-hidden="true"
            className="size-4 text-muted-foreground motion-safe:animate-spin"
          />
          <span className="sr-only">Refreshing scales</span>
        </>
      )}
    </span>
  );
}

import { useState } from "react";
import { Outlet } from "react-router";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

import { ScaleSideBar } from "@/features/scales/ScaleSideBar";

import { SidebarSimpleIcon } from "@phosphor-icons/react";

import { useAuth } from "@/features/auth/AuthContext";
import { useScalesList } from "@/features/scales/useScalesList";
import { listUserScales, listUserFavorites } from "@/features/scales/api";

import type {
  DatabaseScaleRowWithNotes,
  SideBarScale,
} from "@/features/scales/scale.types";

function getSideBarScales(
  databaseRows: DatabaseScaleRowWithNotes[],
): SideBarScale[] {
  return databaseRows.map((row) => ({
    id: row.id,
    title: row.title,
    noteCount: row.scale_notes.length,
  }));
}

export function ScalesLayout() {
  const { claims, loading } = useAuth();
  const userId = claims?.sub ?? null;

  const isSideBarVisible = !loading && userId !== null; // depend on userId for state rather than claims. userId is stable, whereas Supabase's claims changes on browser refocus, causing unnecessary re-renders of the sidebar.

  // reads shadcn cookie to determine default sidebar open state.
  const [defaultSidebarOpen] = useState(() => {
    const saved = document.cookie
      .split("; ")
      .find((cookie) => cookie.startsWith("sidebar_state="))
      ?.split("=")[1];

    return saved !== "false"; // expanded when no preference exists.
  });

  // effects for fetching myScales + favorites are basically the same, so DRY with a custom hook (useScalesList).
  const {
    scales: userScales,
    hasLoadedScales: hasLoadedUserScales,
    scalesRefreshing: userScalesRefreshing,
    scalesError,
    refreshScales: refreshUserScales,
  } = useScalesList({
    userId,
    apiMethod: listUserScales,
    authLoading: loading,
  });

  const {
    scales: favorites,
    hasLoadedScales: hasLoadedFavorites,
    scalesRefreshing: favoritesRefreshing,
    scalesError: favoritesError,
    refreshScales: refreshFavorites,
  } = useScalesList({
    userId,
    apiMethod: listUserFavorites,
    authLoading: loading,
  });

  return (
    <SidebarProvider
      className="min-h-[calc(100dvh-var(--nav-height))]"
      defaultOpen={defaultSidebarOpen}
    >
      {isSideBarVisible && (
        <ScaleSideBar
          userScales={getSideBarScales(userScales)}
          hasLoadedScales={hasLoadedUserScales}
          isLoading={!hasLoadedUserScales && userScalesRefreshing}
          isRefreshing={hasLoadedUserScales && userScalesRefreshing}
          error={scalesError}
          onRetry={() => void refreshUserScales()}
          favorites={getSideBarScales(favorites)}
          hasLoadedFavorites={hasLoadedFavorites}
          favoritesRefreshing={favoritesRefreshing}
          favoritesError={favoritesError}
          onRetryFavorites={() => void refreshFavorites()}
        />
      )}
      <div className="min-w-0 flex-1">
        {isSideBarVisible && (
          <div className="pt-4 pl-4 sm:pl-4 lg:pl-8">
            <SidebarTrigger className="cursor-pointer text-muted-foreground">
              <SidebarSimpleIcon
                aria-hidden="true"
                className="size-5"
                weight="light"
              />
            </SidebarTrigger>
          </div>
        )}
        <Outlet
          context={{ refreshScales: refreshUserScales, refreshFavorites }}
        />
      </div>
    </SidebarProvider>
  );
}

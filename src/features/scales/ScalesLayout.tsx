import { Outlet } from "react-router";

import { ScaleSideBar } from "@/features/scales/ScaleSideBar";

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
    <div className="grid min-h-[calc(100dvh-var(--nav-height))] grid-cols-1 grid-rows-[auto_1fr] lg:grid-cols-[16rem_minmax(0,1fr)] lg:grid-rows-1">
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
      <Outlet
        context={{ refreshScales: refreshUserScales, refreshFavorites }}
      />
    </div>
  );
}

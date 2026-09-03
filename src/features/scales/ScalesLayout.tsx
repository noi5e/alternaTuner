import { useState, useCallback, useEffect } from "react";
import { Outlet } from "react-router";

import { ScaleSideBar } from "@/features/scales/ScaleSideBar";

import { useAuth } from "@/features/auth/AuthContext";
import { listScales } from "@/features/scales/api";

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

  const [userScales, setUserScales] = useState<DatabaseScaleRowWithNotes[]>([]);
  const [scalesLoading, setScalesLoading] = useState(true);
  const [scalesError, setScalesError] = useState<string | null>(null);

  const refreshScales = useCallback(async () => {
    if (!userId) {
      setUserScales([]);
      setScalesLoading(false);
      return;
    }

    try {
      setScalesLoading(true);
      setScalesError(null);
      const scales = await listScales();
      setUserScales(scales);
    } catch (error) {
      console.error("Error refreshing scales:", error);

      setScalesError(
        error instanceof Error ? error.message : "Failed to refresh scales",
      );
    } finally {
      setScalesLoading(false);
    }
  }, [userId]);

  // fetch user's scales from database, and list them in ScaleSideBar.
  useEffect(() => {
    if (loading) return;
    void refreshScales(); // fire-and-forget async function, because React doesn't allow useEffect to return a Promise. however, we still want to fetch data from server, which is inherently async.
  }, [loading, refreshScales]);

  return (
    <div className="grid min-h-[calc(100dvh-var(--nav-height))] grid-cols-1 lg:grid-cols-[16rem_minmax(0,1fr)]">
      {isSideBarVisible && (
        <ScaleSideBar
          userScales={getSideBarScales(userScales)}
          isLoading={scalesLoading}
          error={scalesError}
        />
      )}
      <Outlet context={{ refreshScales }} />
    </div>
  );
}

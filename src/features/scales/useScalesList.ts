import { useState, useCallback, useEffect, useRef } from "react";

import type {
  DatabaseScaleRowWithNotes,
  UseScalesListProps,
} from "@/features/scales/scale.types";

export function useScalesList({
  userId,
  apiMethod,
  authLoading,
}: UseScalesListProps) {
  const [scales, setScales] = useState<DatabaseScaleRowWithNotes[]>([]);
  const requestId = useRef(0); // keep track of the latest request ID to prevent race conditions when multiple requests are made.

  const [hasLoadedScales, setHasLoadedScales] = useState(false); // track whether the scales have been successfully loaded at least once, to handle loading errors + empty scalesLists.
  const [scalesRefreshing, setScalesRefreshing] = useState(false); // tracks refresh status, which runs on initial load and thereafter with every user action on scales.
  const [scalesError, setScalesError] = useState<string | null>(null); // tracks any error that occurs while fetching scales.

  const refreshScales = useCallback(async () => {
    const currentRequest = ++requestId.current; // increment the request ID for this request and store it as the current request.

    if (!userId) return;

    setScalesRefreshing(true);
    setScalesError(null);

    try {
      const nextScales = await apiMethod(userId);

      if (currentRequest !== requestId.current) return;

      setScales(nextScales);
      setHasLoadedScales(true);
    } catch (error) {
      if (currentRequest !== requestId.current) return;

      setScalesError(
        error instanceof Error ? error.message : "Failed to refresh scales.",
      );
    } finally {
      if (currentRequest === requestId.current) {
        setScalesRefreshing(false);
      }
    }
  }, [userId, apiMethod]);

  useEffect(() => {
    setScales([]);
    setHasLoadedScales(false);
    setScalesError(null);
    setScalesRefreshing(false);

    if (!authLoading && userId) {
      // initial load of scales after user login
      void refreshScales(); // fire-and-forget async function, because React doesn't allow useEffect to return a Promise. however, we still want to fetch data from server, which is inherently async.
    }

    return () => {
      // cancel any pending requests to null race conditions, so that further refreshes do not interfere with the current state.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      ++requestId.current;
    };
  }, [authLoading, refreshScales, userId]);

  return {
    scales,
    hasLoadedScales,
    scalesRefreshing,
    scalesError,
    refreshScales,
  };
}

import { useCallback, useEffect, useRef } from "react";
import { useBlocker } from "react-router";

export function useUnsavedChanges(isDirty: boolean) {
  const allowNavigationRef = useRef(false); // bypass blocker to allow navigation, so that successful creation / deletion can navigate to a different page without triggering dirty state warnings.

  // track whether user has accepted departure in DirtyStateDialog.
  const hasAcceptedDeparture = useRef(false); // by default, save is async and navigates to createdScale on success. if user has accepted departure, set this to true to prevent automatic navigation.

  const blocker = useBlocker(() => isDirty && !allowNavigationRef.current); // use react router to block SPA navigation if there are unsaved changes.

  // give default browser warning before user leaves the page with unsaved changes. covers cases that can't be handled by the single-page app's DirtyStateDialog, like closing the browser tab or refreshing the page.
  useEffect(() => {
    if (!isDirty) return;

    function warnBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault(); // this prevents the browser's default behavior of unloading the page, and instead triggers a confirmation dialog to warn the user.
      // this is to give the user a chance to confirm before leaving the page with unsaved changes.
    }

    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", warnBeforeUnload);
    };
  }, [isDirty]);

  const confirmDeparture = useCallback(() => {
    if (blocker.state !== "blocked") return; // only do this if a departure was previously blocked by DirtyStateDialog.

    hasAcceptedDeparture.current = true;
    blocker.proceed();
  }, [blocker]);

  useEffect(() => {
    // when the state becomes clean (no unsaved changes), and a departure was previously blocked, confirm it.
    if (isDirty) return;

    confirmDeparture();
  }, [isDirty, confirmDeparture]);

  function cancelDeparture() {
    if (blocker.state !== "blocked") return;

    blocker.reset();
  }

  const allowNavigation = useCallback(() => {
    allowNavigationRef.current = true;
  }, []);

  const blockNavigation = useCallback(() => {
    allowNavigationRef.current = false;
  }, []);

  return {
    isNavigationBlocked: blocker.state === "blocked",
    hasAcceptedDeparture,
    blockerState: blocker.state,
    confirmDeparture,
    cancelDeparture,
    allowNavigation,
    blockNavigation,
  };
}

import { useState, useEffect, useRef, useCallback } from "react";
import type { UseEditorRedirectsOptions } from "./editor.types";
import { useNavigate, useNavigation } from "react-router";
import { routeSlugTranslator } from "@/lib/routeSlug";

export function useEditorRedirects({
  createdScaleId,
  hasAcceptedDeparture,
  allowNavigation,
  blockNavigation,
  isDirty,
  isMounted,
  blockerState,
}: UseEditorRedirectsOptions) {
  const navigate = useNavigate();

  const [redirectError, setRedirectError] = useState<string | null>(null);
  const [isOpeningSavedScale, setIsOpeningSavedScale] = useState(false);

  const creationRedirectStarted = useRef(false);

  // keep track of the latest navigation object to ensure that async operations like scale creation use the most recent navigation reference.
  const navigation = useNavigation();
  const latestNavigation = useRef(navigation);
  useEffect(() => {
    latestNavigation.current = navigation;
  }, [navigation]);

  // after user creates a scale, redirect user to newly created scale's page.
  const openSavedScale = useCallback(async () => {
    if (createdScaleId === null) return;
    setRedirectError(null);
    setIsOpeningSavedScale(true);
    allowNavigation();

    try {
      await navigate(
        `/scales/${routeSlugTranslator.fromUUID(createdScaleId)}`,
        { replace: true },
      );
    } catch {
      // handles errors if scale is saved successfully, but its page can't be opened.

      if (!isMounted.current) return; // if the component isn't mounted, user has navigated away. so abort error signaling.

      // otherwise, Editor is still mounted, but navigation failed. so we...
      blockNavigation();

      // and then display error:
      setRedirectError(
        "Your scale was saved, but its page could not be opened.",
      );
    } finally {
      if (isMounted.current) {
        setIsOpeningSavedScale(false); // reset opening state.
      }
    }
  }, [createdScaleId, navigate, allowNavigation, blockNavigation, isMounted]);

  // Open the newly created scale once the editor is clean,
  // unless the user is already leaving or a redirect has started.
  useEffect(() => {
    if (isDirty) return; // if the scale is somehow dirty, or user manages to edit, we don't allow navigation.

    if (
      createdScaleId === null || // check if new scale has been created
      blockerState !== "unblocked" ||
      hasAcceptedDeparture.current || // user has accepted departure in DirtyStateDialog
      creationRedirectStarted.current // a redirect for the creation of a new scale has already started
    ) {
      return;
    }

    creationRedirectStarted.current = true;
    void openSavedScale();
  }, [
    isDirty,
    blockerState,
    openSavedScale,
    createdScaleId,
    hasAcceptedDeparture,
  ]);

  // after deletion, the user needs to be redirected, as the deleted scale is no longer accessible via Editor component.
  const leaveDeletedScale = useCallback(() => {
    if (
      isMounted.current && // user didn't leave while scale was deleting
      !hasAcceptedDeparture.current && // user didn't click "Leave scale" in DirtyStateDialog
      latestNavigation.current.state === "idle" // react router has no pending navigation
    ) {
      allowNavigation();
      navigate("/scales/new", { replace: true });
    }
  }, [allowNavigation, hasAcceptedDeparture, navigate, isMounted]);

  return {
    redirectError,
    isOpeningSavedScale,
    openSavedScale,
    leaveDeletedScale,
  };
}

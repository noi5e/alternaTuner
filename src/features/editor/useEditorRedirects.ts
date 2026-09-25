import { useEffect, useRef, useCallback } from "react";
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
  saveStatus,
  dispatchSaveStatus,
}: UseEditorRedirectsOptions) {
  const navigate = useNavigate();

  const redirectError =
    saveStatus.state === "redirectError" ? saveStatus.message : null;
  const isOpeningSavedScale = saveStatus.state === "redirecting";

  // keep track of the latest navigation object to ensure that async operations like scale creation use the most recent navigation reference.
  const navigation = useNavigation();
  const latestNavigation = useRef(navigation);
  useEffect(() => {
    latestNavigation.current = navigation;
  }, [navigation]);

  // after user creates a scale, redirect user to newly created scale's page.
  const openSavedScale = useCallback(async () => {
    if (
      (saveStatus.state !== "created" &&
        saveStatus.state !== "redirectError") ||
      !createdScaleId
    )
      return;

    dispatchSaveStatus({
      type: "redirecting",
      payload: { scaleId: createdScaleId },
    });

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
      dispatchSaveStatus({
        type: "redirectError",
        payload: {
          scaleId: createdScaleId,
          message: "Your scale was saved, but its page could not be opened.",
        },
      });
    }
  }, [
    createdScaleId,
    navigate,
    allowNavigation,
    blockNavigation,
    isMounted,
    dispatchSaveStatus,
    saveStatus,
  ]);

  // Effect to open the newly created scale once the editor is clean, unless the user is already leaving or a redirect has started.
  useEffect(() => {
    // guards to prevent redirect if any of the following conditions are met:
    if (
      isDirty || // if the scale somehow got dirty again.
      saveStatus.state !== "created" || // if a new scale hasn't been successfully created/saved.
      blockerState !== "unblocked" || // if react router is blocking navigation.
      hasAcceptedDeparture.current || // if user has accepted departure in DirtyStateDialog
      !createdScaleId // if there is no created scale ID
    ) {
      return;
    }

    void openSavedScale();
  }, [
    isDirty,
    blockerState,
    openSavedScale,
    createdScaleId,
    hasAcceptedDeparture,
    saveStatus,
    dispatchSaveStatus,
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

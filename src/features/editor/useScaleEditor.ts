import { useState } from "react";
import { toast } from "sonner";

import { PLAYABLE_KEYS, getPlayableNotes } from "@/features/editor/keyBindings";

import type {
  CreateNoteResult,
  Note,
  ScaleDraftNote,
  UseScaleEditorProps,
} from "@/features/editor/editor.types";

// get a JSON string representing current scale-in-editor, to compare to last-known database save.
// used for deriving dirty save state (i.e., whether the current scale has unsaved changes)
function getEditorScaleSnapshot(title: string, notes: ScaleDraftNote[]) {
  const trimmedTitle = title.trim() ? title.trim() : "Untitled Scale"; // make sure we're comparing Editor's title with database's consistently, given that db trims whitespace and defaults to "Untitled Scale" if the title is empty.

  return JSON.stringify({
    title: trimmedTitle,
    frequencies: notes.map((note) => note.hertz).sort((a, b) => a - b),
  });
}

export function useScaleEditor({
  initialScale,
  editorMode,
  isMounted,
  onSave,
  saveStatus,
  dispatchSaveStatus,
}: UseScaleEditorProps) {
  const [notes, setNotes] = useState<Note[]>(
    () =>
      // state for notes that user enters/deletes, visible in UI as NoteButtons
      getPlayableNotes(initialScale.notes || []), // once notes are initialized (either as an empty array, or from a scale loaded from the database), assign key bindings so that they can be played via keyboard.
  );

  const [scaleTitle, setScaleTitle] = useState<string>(
    initialScale.title || "Untitled Scale",
  ); // title of scale, editable by user

  const createdScaleId = "scaleId" in saveStatus ? saveStatus.scaleId : null;

  const [savedSnapshot, setSavedSnapshot] = useState(() =>
    // track dirty state by storing a snapshot of the last saved scale
    getEditorScaleSnapshot(scaleTitle, notes),
  );
  const isSaving = saveStatus.state === "saving";
  const saveError =
    saveStatus.state === "saveError" ? saveStatus.message : null;

  const isEditingAllowed = !isSaving && createdScaleId === null; // if the editor just created a new scale, then navigation to createdScale is pending. therefore disable editing until navigation completes.

  // get user input, create NoteButton component in UI
  function createNote(hertz: number): CreateNoteResult {
    if (notes.length >= PLAYABLE_KEYS.length) {
      return {
        success: false,
        message: `Cannot add more than ${PLAYABLE_KEYS.length} notes.`,
      }; // prevent adding more notes than there are playable keys
    }

    if (notes.some((note) => note.hertz === hertz)) {
      return {
        success: false,
        message: `${hertz} Hz is already in this scale.`,
      }; // allow only unique notes
    }

    setNotes((prev) => {
      return getPlayableNotes([...prev, { hertz }]);
    });

    return { success: true };
  }

  function deleteNote(hertzToDelete: number) {
    setNotes((prev) =>
      getPlayableNotes(prev.filter((note) => note.hertz !== hertzToDelete)),
    );
  }

  async function saveScale() {
    if (isSaving || createdScaleId !== null) return;

    dispatchSaveStatus({ type: "saving" });

    try {
      const savedScale = await onSave({ title: scaleTitle, notes });

      if (!isMounted.current) return; // let's say the user saved, then navigated away from this scale. that means we abort the redirection to createdScale that typically happens.

      setSavedSnapshot(
        getEditorScaleSnapshot(savedScale.title, savedScale.scale_notes),
      );

      if (editorMode === "create") {
        // scale was created, ie. saved for the first time
        dispatchSaveStatus({
          type: "created",
          payload: { scaleId: savedScale.id },
        });
      } else {
        // scale was not new, ie. it was an existing scale being updated
        dispatchSaveStatus({ type: "idle" });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Could not save the scale.";

      if (isMounted.current) {
        dispatchSaveStatus({
          type: "saveError",
          payload: { message: errorMessage },
        });
      } else {
        toast.error("Couldn't save the scale.", {
          description: errorMessage,
        });
      }
    }
  }

  const isDirty = savedSnapshot !== getEditorScaleSnapshot(scaleTitle, notes);

  function dismissSaveError() {
    if (saveStatus.state === "saveError") {
      dispatchSaveStatus({ type: "idle" });
    }
  }

  return {
    createNote,
    createdScaleId,
    deleteNote,
    saveScale,
    isEditingAllowed,
    isSaving,
    saveError,
    setScaleTitle,
    scaleTitle,
    isDirty,
    dismissSaveError,
    notes,
  };
}

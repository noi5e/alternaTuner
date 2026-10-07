import { useRef, useEffect, useReducer } from "react";

// import types
import type { ScaleEditorProps } from "@/features/editor/editor.types";

// import editor components
import { ScaleHeader } from "@/features/scales/ScaleHeader";
import { NoteForm } from "@/features/editor/NoteForm";
import { NotesList } from "@/features/editor/NotesList";
import { DirtyStateDialog } from "@/features/editor/DirtyStateDialog";

// import shadcn components
import { Button } from "@/components/ui/button";

// import custom hooks + reducers
import { useEditorRedirects } from "@/features/editor/useEditorRedirects";
import { useUnsavedChanges } from "@/features/editor/useUnsavedChanges";
import { useNotePlayer } from "@/features/editor/useNotePlayer";
import { useScaleEditor } from "@/features/editor/useScaleEditor";

import { saveStatusReducer } from "@/features/editor/saveStatusReducer";

export function Editor({
  canManageScale,
  editorMode,
  initialScale,
  onDelete: handleDelete,
  onSave,
  isFavorite,
  isPublic,
  isUpdatingVisibility,
  onVisibilityChange,
  isUpdatingFavorite,
  onFavorite,
}: ScaleEditorProps) {
  const isMounted = useRef(false);
  // keep isMounted ref up-to-date.
  // if we don't, async app flows like saveScale → redirectToSavedScale will trigger, even if the user has navigated away from the editor.
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const [saveStatus, dispatchSaveStatus] = useReducer(saveStatusReducer, {
    state: "idle",
  });

  const {
    createNote,
    deleteNote,
    saveScale,
    isEditingAllowed,
    isSaving,
    saveError,
    setScaleTitle,
    scaleTitle,
    isDirty,
    notes,
    dismissSaveError,
    createdScaleId,
  } = useScaleEditor({
    canManageScale,
    initialScale,
    editorMode,
    isMounted,
    onSave,
    saveStatus,
    dispatchSaveStatus,
  });

  const {
    blockerState,
    allowNavigation,
    blockNavigation,
    hasAcceptedDeparture,
    confirmDeparture,
    cancelDeparture,
    isNavigationBlocked,
  } = useUnsavedChanges(isDirty);

  const {
    openSavedScale,
    leaveDeletedScale,
    redirectError,
    isOpeningSavedScale,
  } = useEditorRedirects({
    blockerState,
    hasAcceptedDeparture,
    allowNavigation,
    blockNavigation,
    isDirty,
    isMounted,
    createdScaleId,
    saveStatus,
    dispatchSaveStatus,
  });

  const { playingHertz, startNote, stopNote, stopAllNotes } = useNotePlayer({
    notes,
  });

  function handleCreateNote(hertz: number) {
    const result = createNote(hertz);

    if (result.success) {
      stopAllNotes();
    }

    return result;
  }

  function handleDeleteNote(hertz: number) {
    stopAllNotes(); // prevents stuck playingNotes if user simultaneously holds a note, and deletes it or another note.
    deleteNote(hertz);
  }

  async function deleteScale(scaleTitle: string) {
    if (!handleDelete) return;
    await handleDelete(scaleTitle);
    leaveDeletedScale();
  }

  return (
    <main className="min-w-0 p-4 sm:p-6 lg:p-8">
      <ScaleHeader
        scaleTitle={scaleTitle}
        editorMode={editorMode}
        notesCount={notes.length}
        onDelete={handleDelete ? deleteScale : undefined}
        onSave={onSave ? saveScale : undefined}
        setScaleTitle={setScaleTitle}
        isDirty={isDirty}
        isEditingAllowed={isEditingAllowed}
        isOpeningSavedScale={isOpeningSavedScale}
        isPublic={isPublic}
        isSaving={isSaving}
        saveError={saveError}
        onDismissSaveError={dismissSaveError}
        isFavorite={isFavorite}
        onFavorite={onFavorite}
        isUpdatingFavorite={isUpdatingFavorite}
        onVisibilityChange={onVisibilityChange}
        isUpdatingVisibility={isUpdatingVisibility}
      />
      {redirectError && (
        <div role="alert">
          <p>{redirectError}</p>
          <Button
            onClick={() => void openSavedScale()}
            disabled={isOpeningSavedScale}
          >
            Open saved scale
          </Button>
        </div>
      )}
      {canManageScale && (
        <NoteForm
          isEditingAllowed={isEditingAllowed}
          onCreateNote={handleCreateNote}
        />
      )}
      <NotesList
        canManageScale={canManageScale}
        isEditingAllowed={isEditingAllowed}
        notes={notes}
        onDelete={handleDeleteNote}
        playingHertz={playingHertz}
        startNote={startNote}
        stopNote={stopNote}
      />
      <DirtyStateDialog
        isOpen={isNavigationBlocked}
        isSaving={isSaving}
        onConfirm={confirmDeparture}
        onCancel={cancelDeparture}
      />
    </main>
  );
}

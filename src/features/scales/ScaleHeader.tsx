import { useState } from "react";
import { HeartIcon, MusicNoteSimpleIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { DeleteScaleDialog } from "@/features/scales/DeleteScaleDialog";
import { EditableScaleTitle } from "@/features/scales/EditableScaleTitle";
import { SaveScaleButton } from "@/features/scales/SaveScaleButton";
import { ScaleActionError } from "@/features/scales/ScaleActionError";
import type { ScaleHeaderProps } from "@/features/scales/scale.types";

export function ScaleHeader({
  scaleTitle,
  notesCount,
  isDirty,
  editorMode,
  isEditingAllowed,
  isOpeningSavedScale,
  onDelete,
  onSave,
  isSaving,
  saveError,
  onDismissSaveError,
  setScaleTitle,
}: ScaleHeaderProps) {
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const displayedTitle = scaleTitle || "Untitled Scale";

  async function handleDelete(title: string) {
    if (!onDelete) return;

    setDeleteError(null);
    try {
      await onDelete(title);
    } catch (error) {
      setDeleteError(
        error instanceof Error
          ? error.message
          : "Could not delete the scale. Please try again.",
      );
      // Let the dialog finish its failure flow after the header records the error.
      throw error;
    }
  }

  return (
    <div className="flex w-full flex-col gap-3 p-4">
      <div className="flex w-full flex-col items-center gap-4 md:flex-row">
        <div className="flex w-full max-w-md min-w-0 flex-col items-center justify-center gap-1 md:flex-1 md:items-start md:justify-start">
          <EditableScaleTitle
            value={scaleTitle}
            isEditingAllowed={isEditingAllowed}
            onChange={setScaleTitle}
          />
          <span className="inline-flex items-center gap-1.5 px-2 text-sm font-normal text-muted-foreground not-italic">
            <MusicNoteSimpleIcon
              aria-hidden="true"
              className="size-4 shrink-0"
            />
            <span>
              {notesCount} {notesCount === 1 ? "note" : "notes"}
            </span>
          </span>
        </div>

        <div className="flex w-full max-w-full shrink-0 flex-wrap items-center justify-center gap-2 md:ml-auto md:w-auto md:justify-end">
          {editorMode === "edit" && (
            <Button variant="ghost" className="cursor-pointer">
              <HeartIcon />
              Favorite
            </Button>
          )}
          {editorMode === "edit" && onDelete && (
            <DeleteScaleDialog
              scaleTitle={displayedTitle}
              onConfirm={handleDelete}
              isSaving={isSaving}
            />
          )}
          <SaveScaleButton
            editorMode={editorMode}
            isDirty={isDirty}
            isSaving={isSaving}
            isOpeningSavedScale={isOpeningSavedScale}
            isEditingAllowed={isEditingAllowed}
            onSave={onSave}
          />
        </div>
      </div>
      {(saveError || deleteError) && (
        <div className="flex flex-col gap-2">
          <ScaleActionError
            action="save"
            message={saveError}
            onDismiss={onDismissSaveError}
          />
          <ScaleActionError
            action="delete"
            message={deleteError}
            onDismiss={() => setDeleteError(null)}
          />
        </div>
      )}
    </div>
  );
}

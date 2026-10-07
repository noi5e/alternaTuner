import { useState } from "react";
import { MusicNoteSimpleIcon } from "@phosphor-icons/react";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

import { DeleteScaleDialog } from "@/features/scales/DeleteScaleDialog";
import { EditableScaleTitle } from "@/features/scales/EditableScaleTitle";
import { SaveScaleButton } from "@/features/scales/SaveScaleButton";
import { ScaleActionError } from "@/features/scales/ScaleActionError";
import { FavoriteButton } from "@/features/scales/FavoriteButton";

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
  isFavorite = false,
  onFavorite,
  isUpdatingFavorite,
  isPublic,
  isUpdatingVisibility,
  onVisibilityChange,
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
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 px-2 text-sm text-muted-foreground md:justify-start">
            <span className="inline-flex items-center gap-1.5 text-sm font-normal text-muted-foreground not-italic">
              <MusicNoteSimpleIcon
                aria-hidden="true"
                className="size-4 shrink-0"
              />
              <span>
                {notesCount} {notesCount === 1 ? "note" : "notes"}
              </span>
            </span>
            {editorMode === "edit" && onVisibilityChange && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor="scale-public"
                      className="text-sm font-normal"
                    >
                      Public
                    </Label>
                    <Switch
                      checked={isPublic}
                      id="scale-public"
                      onCheckedChange={onVisibilityChange}
                      disabled={isUpdatingVisibility}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  Public scales can be viewed by other signed-in users. Private
                  scales are visible only to you.
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
        <div className="flex w-full max-w-full shrink-0 flex-wrap items-center justify-center gap-2 md:ml-auto md:w-auto md:justify-end">
          {editorMode === "edit" && onFavorite && (
            <FavoriteButton
              isFavorite={isFavorite}
              onFavorite={onFavorite}
              isUpdatingFavorite={isUpdatingFavorite}
            />
          )}
          {editorMode === "edit" && onDelete && (
            <DeleteScaleDialog
              scaleTitle={displayedTitle}
              onConfirm={handleDelete}
              isSaving={isSaving}
            />
          )}
          {onSave && (
            <SaveScaleButton
              editorMode={editorMode}
              isDirty={isDirty}
              isSaving={isSaving}
              isOpeningSavedScale={isOpeningSavedScale}
              isEditingAllowed={isEditingAllowed}
              onSave={onSave}
            />
          )}
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

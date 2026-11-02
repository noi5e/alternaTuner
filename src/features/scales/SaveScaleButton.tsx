import { CheckIcon, CircleIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import type { SaveScaleButtonProps } from "@/features/scales/scale.types";

export function SaveScaleButton({
  editorMode,
  isDirty,
  isSaving,
  isEditingAllowed,
  isOpeningSavedScale,
  onSave,
  notesCount,
}: SaveScaleButtonProps) {
  const showEmptyNotesHint =
    notesCount === 0 && isEditingAllowed && !isSaving && !isOpeningSavedScale;
  const isSaved = editorMode === "edit" && !isDirty;
  const label = isOpeningSavedScale
    ? "Opening saved scale…"
    : isSaving
      ? "Saving…"
      : isSaved
        ? "Saved"
        : editorMode === "create"
          ? "Save scale"
          : "Save changes";

  const button = (
    <Button
      className="cursor-pointer"
      disabled={
        isSaving ||
        isSaved ||
        !isEditingAllowed ||
        isOpeningSavedScale ||
        notesCount === 0
      }
      onClick={onSave}
    >
      {isSaved && !isSaving ? (
        <CheckIcon aria-hidden="true" />
      ) : notesCount > 0 ? (
        <CircleIcon
          weight="fill"
          aria-hidden="true"
          className="size-2! text-amber-400 dark:text-amber-700"
        />
      ) : null}
      {label}
    </Button>
  );

  if (!showEmptyNotesHint) return button;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          tabIndex={0}
          role="button"
          aria-disabled="true"
          aria-label={label}
          className="inline-flex rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {button}
        </span>
      </TooltipTrigger>
      <TooltipContent sideOffset={6}>
        Add a note to enable saving.
      </TooltipContent>
    </Tooltip>
  );
}

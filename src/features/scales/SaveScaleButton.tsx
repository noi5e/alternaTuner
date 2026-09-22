import { CheckIcon, CircleIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

import type { SaveScaleButtonProps } from "@/features/scales/scale.types";

export function SaveScaleButton({
  editorMode,
  isDirty,
  isSaving,
  isEditingAllowed,
  isOpeningSavedScale,
  onSave,
}: SaveScaleButtonProps) {
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

  return (
    <Button
      className="cursor-pointer"
      disabled={isSaving || isSaved || !isEditingAllowed || isOpeningSavedScale}
      onClick={onSave}
    >
      {isSaved && !isSaving ? (
        <CheckIcon aria-hidden="true" />
      ) : (
        <CircleIcon
          weight="fill"
          aria-hidden="true"
          className="size-2! text-amber-400 dark:text-amber-700"
        />
      )}
      {label}
    </Button>
  );
}

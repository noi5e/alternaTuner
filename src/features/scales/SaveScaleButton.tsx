import { CheckIcon, CircleIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import type { ScaleEditorMode } from "@/features/editor/editor.types";

type SaveScaleButtonProps = {
  editorMode: ScaleEditorMode;
  isDirty: boolean;
  isSaving: boolean;
  onSave: () => void;
};

export function SaveScaleButton({
  editorMode,
  isDirty,
  isSaving,
  onSave,
}: SaveScaleButtonProps) {
  const isSaved = editorMode === "edit" && !isDirty;
  const label = isSaving
    ? "Saving…"
    : isSaved
      ? "Saved"
      : editorMode === "create"
        ? "Save scale"
        : "Save changes";

  return (
    <Button
      className="cursor-pointer"
      disabled={isSaving || isSaved}
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

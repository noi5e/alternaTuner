import type { DirtyStateDialogProps } from "@/features/editor/editor.types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { WarningIcon } from "@phosphor-icons/react";

export function DirtyStateDialog({
  isOpen,
  isSaving,
  onConfirm,
  onCancel,
}: DirtyStateDialogProps) {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent
        onEscapeKeyDown={() => {
          onCancel?.();
        }}
      >
        <AlertDialogHeader className="justify-around">
          <AlertDialogMedia
            className={
              isSaving
                ? ""
                : "bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive"
            }
          >
            <WarningIcon />
          </AlertDialogMedia>
          <AlertDialogTitle>
            {isSaving ? "Leave while saving?" : "Discard unsaved changes?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isSaving
              ? "Your scale is still saving. Leaving this page won’t cancel the save."
              : "You have unsaved changes to this scale. Leaving will discard them."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel} variant="outline">
            {isSaving ? "Stay here" : "Continue editing"}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            variant={isSaving ? "default" : "destructive"}
          >
            {isSaving ? "Leave page" : "Discard changes"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

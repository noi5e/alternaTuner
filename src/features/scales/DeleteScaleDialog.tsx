import { useState } from "react";

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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "#components/ui/button";

import { TrashIcon } from "@phosphor-icons/react";

import type { DeleteScaleDialogProps } from "@/features/scales/scale.types";

export function DeleteScaleDialog({
  scaleTitle,
  onConfirm,
}: DeleteScaleDialogProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleConfirm() {
    setIsDeleting(true);

    try {
      await onConfirm(scaleTitle);
      setOpen(false);
    } catch (error) {
      console.error("Failed to delete scale:", error);
      // Return focus to the header, where the failure is displayed.
      setOpen(false);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isDeleting) setOpen(nextOpen);
      }}
    >
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          className="cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <TrashIcon />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent
        aria-busy={isDeleting}
        onEscapeKeyDown={(event) => {
          if (isDeleting) event.preventDefault();
        }}
      >
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
            <TrashIcon />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete "{scaleTitle}"?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete this scale. This can’t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting} variant="outline">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault();
              void handleConfirm();
            }}
            variant="destructive"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete scale"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

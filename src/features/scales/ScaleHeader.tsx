import { useEffect, useRef, useState } from "react";

import {
  HeartIcon,
  PencilSimpleIcon,
  MusicNoteSimpleIcon,
  CheckIcon,
  CircleIcon,
  WarningCircleIcon,
  XIcon,
} from "@phosphor-icons/react";

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { DeleteScaleDialog } from "@/features/scales/DeleteScaleDialog";

import type { ScaleHeaderProps } from "@/features/scales/scale.types";

// Keep the measuring span and visible button geometrically identical.
const titleLayoutClasses =
  "inline-flex min-w-0 items-center gap-2 px-2 py-1 text-3xl font-light italic";
const titleTextClasses = "min-w-0 truncate pr-1";

function EditTitlePencilIcon() {
  return (
    <PencilSimpleIcon
      className="size-5 shrink-0 cursor-pointer text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
      aria-hidden="true"
    />
  );
}

function DirtyStateIcon() {
  return (
    <CircleIcon
      weight="fill"
      aria-hidden="true"
      className="size-2! text-amber-400 dark:text-amber-700"
    />
  );
}

export function ScaleHeader({
  scaleTitle,
  notesCount,
  isDirty,
  editorMode,
  onDelete,
  onSave,
  isSaving,
  saveError,
  onDismissSaveError,
  setScaleTitle,
}: ScaleHeaderProps) {
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInputValue, setTitleInputValue] = useState("");
  const titleButtonRef = useRef<HTMLButtonElement>(null);
  const restoreTitleFocusRef = useRef(false);

  useEffect(() => {
    if (!isEditingTitle && restoreTitleFocusRef.current) {
      restoreTitleFocusRef.current = false;
      titleButtonRef.current?.focus();
    }
  }, [isEditingTitle]);

  const displayedTitle = scaleTitle || "Untitled Scale";

  const isSaved = editorMode === "edit" && !isDirty;

  return (
    <div className="flex w-full flex-col gap-3 p-4">
      <div className="flex w-full flex-col items-center gap-4 md:flex-row">
        <div className="flex w-full max-w-md min-w-0 flex-col items-center justify-center gap-1 md:flex-1 md:items-start md:justify-start">
          <span
            className={cn(
              "relative inline-block max-w-full min-w-0",
              isEditingTitle && "w-full",
            )}
          >
            {/* Invisible element that determines width, height, and baseline of the scale title (both button and input) */}
            <span
              aria-hidden="true"
              className={cn(
                titleLayoutClasses,
                "invisible max-w-full overflow-hidden",
              )}
            >
              <span className={titleTextClasses}>{displayedTitle}</span>
              <EditTitlePencilIcon />
            </span>

            {isEditingTitle ? (
              <Input
                autoFocus
                aria-label="Scale Title"
                placeholder={scaleTitle ?? "Untitled Scale"}
                onChange={(event) => setTitleInputValue(event.target.value)}
                onBlur={() => {
                  setIsEditingTitle(false);
                  if (
                    titleInputValue.length > 0 &&
                    titleInputValue.trim() !== scaleTitle
                  ) {
                    setScaleTitle(titleInputValue.trim());
                  }
                }}
                onKeyDown={(event) => {
                  if (event.nativeEvent.isComposing) return;

                  if (event.key === "Enter") {
                    event.preventDefault();
                    restoreTitleFocusRef.current = true;
                    event.currentTarget.blur();
                  } else if (event.key === "Escape") {
                    event.preventDefault();
                    restoreTitleFocusRef.current = true;
                    setIsEditingTitle(false);
                  }
                }}
                className="absolute inset-0 h-full w-full min-w-0 rounded-none border-0 border-b border-border bg-muted px-2 py-0 text-3xl font-light text-foreground italic shadow-none focus-visible:border-ring focus-visible:ring-ring/25 md:text-3xl"
                value={titleInputValue}
              />
            ) : (
              <button
                ref={titleButtonRef}
                type="button"
                aria-label={`Edit scale title: ${displayedTitle}`}
                onClick={() => {
                  setTitleInputValue(scaleTitle ?? "Untitled Scale");
                  setIsEditingTitle(true);
                }}
                className={cn(
                  titleLayoutClasses,
                  "group absolute inset-0 h-full w-full cursor-text rounded-sm border-0 bg-transparent text-left text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                )}
              >
                <span className={titleTextClasses}>{displayedTitle}</span>
                <EditTitlePencilIcon />
              </button>
            )}
          </span>
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
          {editorMode === "edit" &&
            onDelete && ( // only render delete button on editors for updating scales, not on new scale creation
              <DeleteScaleDialog
                scaleTitle={displayedTitle}
                onConfirm={async (title) => {
                  setDeleteError(null);
                  try {
                    await onDelete(title);
                  } catch (error) {
                    setDeleteError(
                      error instanceof Error
                        ? error.message
                        : "Could not delete the scale. Please try again.",
                    );
                    throw error;
                  }
                }}
              />
            )}
          <Button
            className="cursor-pointer"
            disabled={isSaving || isSaved}
            onClick={onSave}
          >
            {isSaved && !isSaving ? (
              <CheckIcon aria-hidden="true" />
            ) : isDirty && !isSaving ? (
              <DirtyStateIcon />
            ) : (
              <DirtyStateIcon />
            )}
            {isSaving
              ? "Saving…"
              : isSaved
                ? "Saved"
                : editorMode === "create"
                  ? "Save scale"
                  : "Save changes"}
          </Button>
        </div>
      </div>
      {(saveError || deleteError) && (
        <div className="flex flex-col gap-2">
          {[
            {
              action: "save",
              message: saveError,
              onDismiss: onDismissSaveError,
            },
            {
              action: "delete",
              message: deleteError,
              onDismiss: () => setDeleteError(null),
            },
          ].map(({ action, message, onDismiss }) =>
            message ? (
              <Alert key={action} variant="destructive">
                <WarningCircleIcon aria-hidden="true" />
                <AlertTitle>Couldn’t {action} scale.</AlertTitle>
                <AlertDescription>{message}</AlertDescription>
                <AlertAction>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    className="cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive"
                    aria-label={`Dismiss ${action} error`}
                    onClick={onDismiss}
                  >
                    <XIcon aria-hidden="true" />
                  </Button>
                </AlertAction>
              </Alert>
            ) : null,
          )}
        </div>
      )}
    </div>
  );
}

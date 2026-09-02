import { useState } from "react";

import { FileIcon, HeartIcon, TrashIcon } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { ScaleHeaderProps } from "@/features/scales/scale.types";

export function ScaleHeader({
  scaleTitle,
  notesCount,
  onDelete,
  onSave,
  isSaving,
  setScaleTitle,
}: ScaleHeaderProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInputValue, setTitleInputValue] = useState("");

  const displayedTitle = scaleTitle || "Untitled Scale";

  return (
    <div className="flex w-full flex-col items-end gap-4 p-4 sm:flex-row sm:items-center">
      <div className="flex w-full items-baseline justify-center gap-4 sm:basis-1/2 sm:justify-start">
        <span className="relative inline-block min-w-0">
          {/* Invisible element that determines width, height, and baseline of the scale title (both button and input) */}
          <span
            aria-hidden="true"
            className="invisible block px-2 text-3xl font-thin whitespace-pre italic"
          >
            {displayedTitle}
          </span>

          {isEditingTitle ? (
            <Input
              autoFocus
              aria-label="Scale title"
              placeholder={scaleTitle ?? "Untitled Scale"}
              onChange={(event) => setTitleInputValue(event.target.value)}
              onBlur={() => {
                setIsEditingTitle(false);
                if (titleInputValue.length > 0) {
                  setScaleTitle(titleInputValue);
                }
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.currentTarget.blur();
                }

                if (event.key === "Escape" && titleInputValue === "") {
                  setIsEditingTitle(false);
                }

                if (event.key === "Escape") {
                  setScaleTitle(titleInputValue);
                }
              }}
              className="absolute inset-0 h-full w-full min-w-0 rounded-none border-0 border-b border-gray-400 bg-gray-50/70 px-1 py-0 text-3xl font-thin text-gray-500 italic shadow-none focus-visible:border-gray-500 focus-visible:ring-2 focus-visible:ring-gray-400/25 md:text-3xl"
            />
          ) : (
            <button
              type="button"
              onClick={() => {
                setIsEditingTitle(true);
              }}
              className="absolute inset-0 h-full w-full cursor-text appearance-none border-0 bg-transparent px-1 py-0 text-left text-3xl font-thin whitespace-nowrap text-gray-500 italic hover:bg-transparent hover:text-gray-500 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-400"
            >
              {displayedTitle}
            </button>
          )}
        </span>

        {/* <div className="basis-auto whitespace-nowrap text-3xl font-thin italic text-gray-500 cursor-text">
          {scaleTitle ?? "Untitled Scale"}
        </div> */}

        <div className="cursor-default items-end text-xl font-thin whitespace-nowrap text-gray-400 italic sm:items-center">
          ( {notesCount > 0 ? notesCount : 0}{" "}
          {notesCount === 1 ? "Note" : "Notes"} )
        </div>
      </div>

      <div className="m-auto flex basis-1/2 sm:justify-end">
        <Button className="mr-2 max-w-fit cursor-pointer">
          <HeartIcon />
          Favorite
        </Button>
        <Button
          className="mr-2 max-w-fit cursor-pointer"
          disabled={isSaving}
          onClick={onSave}
        >
          <FileIcon />
          {isSaving ? "Saving..." : "Save"}
        </Button>
        {typeof onDelete === "function" && ( // only render delete button on editors for updating scales, not on new scale creation
          <Button
            variant="destructive"
            className="max-w-fit cursor-pointer"
            onClick={() => onDelete()}
          >
            <TrashIcon />
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}

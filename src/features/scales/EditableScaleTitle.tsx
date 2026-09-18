import { useEffect, useRef, useState } from "react";
import { PencilSimpleIcon } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type EditableScaleTitleProps = {
  value: string;
  onChange: (value: string) => void;
};

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

export function EditableScaleTitle({
  value,
  onChange,
}: EditableScaleTitleProps) {
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

  const displayedTitle = value || "Untitled Scale";

  return (
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
          placeholder={displayedTitle}
          onChange={(event) => setTitleInputValue(event.target.value)}
          onBlur={() => {
            const nextTitle = titleInputValue.trim();
            setIsEditingTitle(false);
            if (nextTitle.length > 0 && nextTitle !== value) {
              onChange(nextTitle);
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
            setTitleInputValue(displayedTitle);
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
  );
}

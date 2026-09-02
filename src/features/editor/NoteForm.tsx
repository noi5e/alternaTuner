import type { NoteFormProps } from "@/features/editor/editor.types";

import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@phosphor-icons/react";

export function NoteForm({ onCreateNote }: NoteFormProps) {
  return (
    <form
      className="w-full border-y border-gray-200 bg-muted/20 p-4"
      action={onCreateNote}
    >
      <FieldGroup>
        <Field className="mx-auto w-full max-w-xl gap-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <FieldLabel
              className="min-w-fit text-xs font-medium tracking-wide text-muted-foreground uppercase"
              htmlFor="hertz"
            >
              Add note
            </FieldLabel>
            <div className="flex w-full items-center gap-2">
              <Input
                id="hertz"
                className="flex-1 rounded-none text-lg font-semibold tabular-nums"
                name="hertz"
                type="number"
                placeholder="Enter frequency in Hz..."
                required
              />
              <Button
                aria-label="Add note"
                className="shrink-0 cursor-pointer rounded-none"
                size="icon"
                type="submit"
              >
                <PlusIcon weight="bold" />
              </Button>
            </div>
          </div>
        </Field>
      </FieldGroup>
    </form>
  );
}

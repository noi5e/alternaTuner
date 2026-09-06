import { useState } from "react";

import type {
  NoteFormProps,
  ParseHertzResult,
} from "@/features/editor/editor.types";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@phosphor-icons/react";

const MIN_HERTZ = 10;

function parseHertz(value: FormDataEntryValue | null): ParseHertzResult {
  if (typeof value !== "string" || value.trim() === "") {
    return {
      success: false,
      message: "Enter a number representing a hertz value.",
    };
  }

  const hertz = Number(value);

  if (!Number.isFinite(hertz) || hertz <= MIN_HERTZ) {
    return {
      success: false,
      message: `Frequency must be a finite number greater than ${MIN_HERTZ}.`,
    };
  }

  return { success: true, value: hertz };
}

export function NoteForm({ onCreateNote }: NoteFormProps) {
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const input = form.elements.namedItem("hertz");

    if (!(input instanceof HTMLInputElement)) {
      return;
    }

    const parsed = parseHertz(input.value);

    if (!parsed.success) {
      setError(parsed.message);
      input.focus();
      return;
    }

    const result = onCreateNote(parsed.value);

    if (!result.success) {
      setError(result.message);
      input.focus();
      return;
    }

    setError(null);
    form.reset();
  }

  return (
    <form
      className="w-full border-y border-gray-200 bg-muted/20 p-4"
      onSubmit={handleSubmit}
      noValidate
    >
      <FieldGroup>
        <Field
          className="mx-auto w-full max-w-xl gap-2"
          {...(error ? { "data-invalid": "true" } : {})}
        >
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
                className="flex-1 rounded-none text-lg tabular-nums md:font-semibold"
                name="hertz"
                min={MIN_HERTZ}
                step="any"
                type="number"
                placeholder="Enter frequency in Hz..."
                required
                {...(error ? { "aria-invalid": "true" } : {})}
                aria-describedby={error ? "hertz-error" : undefined}
                onChange={() => {
                  if (error) setError(null);
                }}
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
          <FieldError id="hertz-error" className="w-full text-center">
            {error}
          </FieldError>
        </Field>
      </FieldGroup>
    </form>
  );
}

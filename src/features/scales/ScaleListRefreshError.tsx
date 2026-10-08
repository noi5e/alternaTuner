import { WarningCircleIcon } from "@phosphor-icons/react";

export function ScaleListRefreshError() {
  return (
    <div
      role="alert"
      className="mb-2 flex items-start gap-2 px-2 py-2 text-sm text-muted-foreground"
    >
      <WarningCircleIcon
        aria-hidden="true"
        className="mt-0.5 size-4 shrink-0"
      />
      <p>Couldn’t refresh scales. Showing the last loaded list.</p>
    </div>
  );
}

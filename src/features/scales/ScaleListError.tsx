import { WarningCircleIcon } from "@phosphor-icons/react";
import type { ScaleListErrorProps } from "./scale.types";

function ScaleListError({ message }: ScaleListErrorProps) {
  return (
    <div role="alert" className="space-y-3 px-3 py-4">
      <div className="flex gap-2 text-sm text-destructive">
        <WarningCircleIcon className="mt-0.5 size-4 shrink-0" />
        <p>{message}</p>
      </div>
    </div>
  );
}

export default ScaleListError;

import { WarningCircleIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import type { ScaleListErrorProps } from "./scale.types";

function ScaleListError({ message, onRetry }: ScaleListErrorProps) {
  return (
    <Empty className="min-h-48 px-4 py-6" role="alert">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <WarningCircleIcon aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle className="text-base">Couldn’t load scales.</EmptyTitle>
        <EmptyDescription>{message}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      </EmptyContent>
    </Empty>
  );
}

export default ScaleListError;

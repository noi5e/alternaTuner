import { WarningCircleIcon } from "@phosphor-icons/react";
import { useRevalidator } from "react-router";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export function ScaleLoadError() {
  const revalidator = useRevalidator();
  const isRetrying = revalidator.state === "loading";

  return (
    <main className="min-w-0 p-4 sm:p-6 lg:p-8">
      <Empty className="my-8" aria-busy={isRetrying}>
        <EmptyHeader role="alert">
          <EmptyMedia
            variant="icon"
            className="bg-destructive/10 text-destructive"
          >
            <WarningCircleIcon aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>Couldn’t load this scale</EmptyTitle>
          <EmptyDescription>Please try again.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button
            disabled={isRetrying}
            onClick={() => void revalidator.revalidate()}
          >
            {isRetrying ? "Trying again…" : "Try again"}
          </Button>
        </EmptyContent>
      </Empty>
    </main>
  );
}

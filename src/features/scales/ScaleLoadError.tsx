import { WarningCircleIcon } from "@phosphor-icons/react";
import {
  useRevalidator,
  useRouteError,
  isRouteErrorResponse,
  Link,
} from "react-router";

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

  const routeError = useRouteError();

  const isBadRequest =
    isRouteErrorResponse(routeError) && routeError.status === 400;
  const isNotFound =
    isRouteErrorResponse(routeError) && routeError.status === 404;
  const shouldNavigateAway = isBadRequest || isNotFound;

  let title = "Couldn’t load this scale";
  let description = "Please try again.";

  if (isBadRequest) {
    switch (routeError.data?.code) {
      case "MISSING_SCALE_IDENTIFIER":
        title = "No scale specified";
        description = "Choose a scale to open.";
        break;
      case "INVALID_SCALE_IDENTIFIER":
        title = "Invalid scale link";
        description = "Check that you copied the full link.";
        break;
      default:
        title = "Invalid scale request";
        description = "Check the link or choose another scale.";
    }
  }

  if (isNotFound) {
    title = "Scale not found or unavailable";
    description =
      "This scale may have been deleted, or you may not have access.";
  }

  return (
    <div className="min-w-0 p-4 sm:p-6 lg:p-8">
      <Empty className="my-8" aria-busy={isRetrying}>
        <EmptyHeader role="alert">
          <EmptyMedia
            variant="icon"
            className="bg-destructive/10 text-destructive"
          >
            <WarningCircleIcon aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>{title}</EmptyTitle>
          <EmptyDescription>{description}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          {shouldNavigateAway ? ( // user error, slug is missing or invalid.
            <Button asChild>
              <Link to="/scales/new">Create a scale</Link>
            </Button>
          ) : (
            // else, server error, requested scale probably exists, but is unavailable. give user option to retry.
            <Button
              disabled={isRetrying}
              onClick={() => void revalidator.revalidate()}
            >
              {isRetrying ? "Trying again…" : "Try again"}
            </Button>
          )}
        </EmptyContent>
      </Empty>
    </div>
  );
}

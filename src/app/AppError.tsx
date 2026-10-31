import { useRouteError, isRouteErrorResponse, Link } from "react-router";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

import { WarningCircleIcon } from "@phosphor-icons/react";

export function AppError() {
  const routeError = useRouteError();

  const isNotFound =
    isRouteErrorResponse(routeError) && routeError.status === 404;

  return (
    <div className="min-w-0 p-4 sm:p-6 lg:p-8">
      <Empty className="my-8">
        <EmptyHeader role="alert">
          <EmptyMedia
            variant="icon"
            className="bg-destructive/10 text-destructive"
          >
            <WarningCircleIcon aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>
            {isNotFound
              ? "Oops, couldn't find that page"
              : "Something went wrong"}
            .
          </EmptyTitle>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild>
            <Link to="/" replace>
              Go back home
            </Link>
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  );
}

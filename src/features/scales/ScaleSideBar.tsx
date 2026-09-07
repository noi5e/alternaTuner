import { useState } from "react";
import { NavLink } from "react-router";

import ScaleSideBarLink from "./ScaleSideBarLink";
import ScaleListError from "./ScaleListError";
import ScaleListSkeleton from "./ScaleListSkeleton";
import ScaleListEmpty from "./ScaleListEmpty";

import {
  ArrowsClockwiseIcon,
  CaretDownIcon,
  PlusIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

import type { ScaleSideBarProps } from "./scale.types";
import { cn } from "@/lib/utils";

export function ScaleSideBar({
  userScales,
  hasLoadedScales,
  isLoading,
  isRefreshing,
  error,
}: ScaleSideBarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <aside className="sticky top-(--nav-height) z-10 flex max-h-[50dvh] w-full flex-col border-b border-sidebar-border bg-sidebar p-4 text-sidebar-foreground lg:h-[calc(100dvh-var(--nav-height))] lg:max-h-none lg:border-r lg:border-b-0">
      <header className="shrink-0 lg:mb-4">
        <button
          type="button"
          className="flex min-h-11 w-full items-center justify-between px-4 focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-none lg:hidden"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          aria-controls="scale-navigation"
        >
          <span className="flex items-center gap-2 text-lg font-medium">
            My Scales <RefreshIndicator isRefreshing={isRefreshing} />
          </span>
          <CaretDownIcon
            className={cn("transition-transform", isOpen && "rotate-180")}
          />
        </button>

        <h2 className="hidden items-center gap-2 text-base font-medium tracking-tight lg:flex">
          My Scales
          <RefreshIndicator isRefreshing={isRefreshing} />
        </h2>
      </header>
      <nav
        id="scale-navigation"
        aria-label="Scale navigation"
        className={cn(
          "min-h-0 w-full overflow-y-auto lg:block lg:max-h-none lg:flex-1",
          isOpen ? "block" : "hidden",
        )}
      >
        {isLoading ? (
          <ScaleListSkeleton />
        ) : error && !hasLoadedScales ? (
          <ScaleListError message={error} />
        ) : userScales.length === 0 ? (
          <ScaleListEmpty />
        ) : error && hasLoadedScales ? (
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
        ) : (
          <ul className="w-full min-w-0 space-y-1">
            {userScales.map((scale) => {
              return (
                <ScaleSideBarLink
                  key={scale.id}
                  id={scale.id}
                  title={scale.title}
                  noteCount={scale.noteCount}
                  onNavigate={() => setIsOpen(false)}
                />
              );
            })}
          </ul>
        )}
      </nav>

      <footer
        className={cn(
          "mt-4 shrink-0 justify-center",
          isOpen ? "flex" : "hidden",
          "lg:flex",
        )}
      >
        <Button asChild variant="outline" className="flex w-3/4 justify-center">
          <NavLink to="/scales/new" onClick={() => setIsOpen(false)}>
            <PlusIcon className="size-4" />
            <span>New Scale</span>
          </NavLink>
        </Button>
      </footer>
    </aside>
  );
}

function RefreshIndicator({ isRefreshing }: { isRefreshing: boolean }) {
  return (
    <span role="status" className="inline-flex size-4 shrink-0">
      {isRefreshing && (
        <>
          <ArrowsClockwiseIcon
            aria-hidden="true"
            className="size-4 text-muted-foreground motion-safe:animate-spin"
          />
          <span className="sr-only">Refreshing scales</span>
        </>
      )}
    </span>
  );
}

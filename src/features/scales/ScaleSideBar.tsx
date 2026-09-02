import { useState } from "react";
import { NavLink } from "react-router";

import { routeSlugTranslator } from "@/lib/routeSlug";

import {
  CaretDownIcon,
  PlusIcon,
  WarningCircleIcon,
  MusicNoteSimpleIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import type { ScaleSideBarProps, ScaleListErrorProps } from "./scale.types";
import { cn } from "@/lib/utils";

export function ScaleSideBar({
  userScales,
  isLoading,
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
          <span className="text-lg font-medium">My Scales</span>
          <CaretDownIcon
            className={cn("transition-transform", isOpen && "rotate-180")}
          />
        </button>

        <h2 className="hidden text-base font-medium tracking-tight lg:block">
          My Scales
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
        ) : error ? (
          <ScaleListError message={error} />
        ) : userScales.length === 0 ? (
          <ScaleListEmpty />
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

function ScaleSideBarLink({
  noteCount,
  title,
  id,
  onNavigate,
}: {
  noteCount: number;
  title: string;
  id: string;
  onNavigate: () => void;
}) {
  return (
    <li key={id}>
      <NavLink
        to={`/scales/${routeSlugTranslator.fromUUID(id)}`}
        className={({ isActive }) =>
          cn(
            "flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-sidebar-foreground",
            "transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            "focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-none",
            isActive &&
              "bg-sidebar-accent font-medium text-sidebar-accent-foreground",
          )
        }
        onClick={onNavigate}
      >
        <Badge variant="secondary" className="shrink-0">
          <MusicNoteSimpleIcon data-icon="inline-start" weight="fill" />
          <span className="text-xs">{noteCount}</span>
        </Badge>

        <span className="min-w-0 flex-1 truncate">{title}</span>
      </NavLink>
    </li>
  );
}

function ScaleListSkeleton() {
  return (
    <div className="space-y-1" aria-label="Loading scales" aria-busy="true">
      {Array.from({ length: 3 }, (_, index) => (
        <div
          key={index}
          className="flex h-9 items-center gap-2 rounded-md px-2"
        >
          <div className="h-6 w-12 shrink-0 animate-pulse rounded-full bg-sidebar-accent" />
          <div
            className={[
              "h-4 animate-pulse rounded bg-sidebar-accent",
              index === 0 ? "w-2/3" : index === 1 ? "w-1/2" : "w-3/4",
            ].join(" ")}
          />
        </div>
      ))}
    </div>
  );
}

function ScaleListEmpty() {
  return (
    <p className="px-3 py-6 text-center text-sm text-muted-foreground">
      No saved scales yet.
    </p>
  );
}

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

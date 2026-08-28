import { NavLink } from "react-router";

import { routeSlugTranslator } from "@/lib/routeSlug";

import {
  PlusIcon,
  WarningCircleIcon,
  MusicNoteSimpleIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import type { ScaleSideBarProps, ScaleListErrorProps } from "./scale.types";
import { cn } from "#lib/utils";

export function ScaleSideBar({
  userScales,
  isLoading,
  error,
}: ScaleSideBarProps) {
  return (
    <aside
      className="sticky top-[--nav-height]
    hidden h-[calc(100dvh-var(--nav-height))] flex-col
    border-r border-sidebar-border
    bg-sidebar text-sidebar-foreground
    p-4 lg:flex"
    >
      <header className="mb-4">
        <h2 className="text-base font-medium tracking-tight">My Scales</h2>
      </header>
      <nav
        className="min-h-0 flex-1 overflow-y-auto"
        aria-label="Scale Navigation"
      >
        {isLoading ? (
          <ScaleListSkeleton />
        ) : error ? (
          <ScaleListError message={error} />
        ) : userScales.length === 0 ? (
          <ScaleListEmpty />
        ) : (
          <ul className="space-y-1">
            {userScales.map((scale) => {
              return (
                <ScaleSideBarLink
                  key={scale.id}
                  id={scale.id}
                  title={scale.title}
                  noteCount={scale.noteCount}
                />
              );
            })}
          </ul>
        )}
      </nav>

      <footer className="mt-4 flex justify-center ">
        <Button asChild variant="outline" className="w-3/4 flex justify-center">
          <NavLink to="/scales/new">
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
}: {
  noteCount: number;
  title: string;
  id: string;
}) {
  return (
    <li key={id}>
      <NavLink
        to={`/scales/${routeSlugTranslator.fromUUID(id)}`}
        className={({ isActive }) =>
          cn(
            "flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-sidebar-foreground",
            "transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
            isActive &&
              "bg-sidebar-accent font-medium text-sidebar-accent-foreground",
          )
        }
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

import type { ScaleListProps } from "@/features/scales/scale.types";
import { cn } from "@/lib/utils";

import ScaleListSkeleton from "@/features/scales/ScaleListSkeleton";
import ScaleListError from "@/features/scales/ScaleListError";
import ScaleListEmpty from "@/features/scales/ScaleListEmpty";
import ScaleListRefreshError from "@/features/scales/ScaleListRefreshError";

import ScaleSideBarLink from "@/features/scales/ScaleSideBarLink";

import { CaretRightIcon } from "@phosphor-icons/react";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export default function ScaleList({
  contentClassName,
  label,
  scales,
  hasLoaded,
  isLoading,
  error,
  onRetry,
  emptyTitle,
  emptyDescription,
  onNavigate,
}: ScaleListProps) {
  return (
    <Collapsible defaultOpen className="group/scale-list">
      <SidebarGroup className="py-0">
        <SidebarGroupLabel asChild>
          <CollapsibleTrigger className="w-full cursor-pointer hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
            {label}
            <CaretRightIcon
              aria-hidden="true"
              className="ml-auto transition-transform group-data-[state=open]/scale-list:rotate-90"
            />
          </CollapsibleTrigger>
        </SidebarGroupLabel>

        <CollapsibleContent
          className={cn(
            "ml-3 border-l border-sidebar-border/50 pl-2",
            contentClassName,
          )}
        >
          {isLoading ? (
            <ScaleListSkeleton />
          ) : error && !hasLoaded ? (
            <ScaleListError message={error} onRetry={onRetry} />
          ) : (
            <>
              {error && hasLoaded && (
                <ScaleListRefreshError onRetry={onRetry} />
              )}
              {scales.length === 0 ? (
                <ScaleListEmpty
                  title={emptyTitle}
                  description={emptyDescription}
                />
              ) : (
                <SidebarMenu>
                  {scales.map((scale) => (
                    <ScaleSideBarLink
                      key={scale.id}
                      {...scale}
                      onNavigate={onNavigate}
                    />
                  ))}
                </SidebarMenu>
              )}
            </>
          )}
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}

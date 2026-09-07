import { NavLink } from "react-router";

import type { ScaleSideBarLinkProps } from "./scale.types";

import { Badge } from "@/components/ui/badge";
import { MusicNoteSimpleIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { routeSlugTranslator } from "@/lib/routeSlug";

function ScaleSideBarLink({
  noteCount,
  title,
  id,
  onNavigate,
}: ScaleSideBarLinkProps) {
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

export default ScaleSideBarLink;

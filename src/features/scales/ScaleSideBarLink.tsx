import { useId } from "react";
import { NavLink, useMatch } from "react-router";

import type { ScaleSideBarLinkProps } from "./scale.types";

import {
  SidebarMenuItem,
  SidebarMenuBadge,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

import { MusicNoteSimpleIcon } from "@phosphor-icons/react";
import { routeSlugTranslator } from "@/lib/routeSlug";

function ScaleSideBarLink({
  noteCount,
  title,
  id,
  onNavigate,
}: ScaleSideBarLinkProps) {
  const to = `/scales/${routeSlugTranslator.fromUUID(id)}`;
  const match = useMatch({ path: to, end: true });

  const htmlId = useId();

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        aria-describedby={`scale-link-note-count-${htmlId}`}
        asChild
        isActive={match !== null}
        className="pr-16"
      >
        <NavLink to={to} onClick={onNavigate}>
          <span>{title}</span>
        </NavLink>
      </SidebarMenuButton>

      <SidebarMenuBadge
        id={`scale-link-note-count-${htmlId}`}
        className="min-w-10 gap-1 rounded-full border border-sidebar-border px-1.5 text-muted-foreground"
      >
        <MusicNoteSimpleIcon
          aria-hidden="true"
          className="size-3 shrink-0"
          weight="fill"
        />
        <span>{noteCount}</span>
        <span className="sr-only">notes</span>
      </SidebarMenuBadge>
    </SidebarMenuItem>
  );
}

export default ScaleSideBarLink;

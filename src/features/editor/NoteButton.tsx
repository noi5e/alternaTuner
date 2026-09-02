import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrashIcon } from "@phosphor-icons/react";

import type { NoteButtonProps } from "@/features/editor/editor.types";

function releasePointerCapture(event: React.PointerEvent<HTMLElement>) {
  if (event.currentTarget.hasPointerCapture(event.pointerId)) {
    event.currentTarget.releasePointerCapture(event.pointerId);
  }
}

export function NoteButton({
  hertz,
  label,
  isPlaying,
  onDelete,
  startNote,
  stopNote,
}: NoteButtonProps) {
  return (
    <Card
      data-playing={isPlaying}
      className="relative h-32 w-28 cursor-pointer rounded-none transition-colors duration-100 data-[playing=true]:bg-primary data-[playing=true]:text-primary-foreground"
      onPointerDown={(event) => {
        if (event.button !== 0) return; // only respond to left mouse button or primary touch
        event.currentTarget.setPointerCapture(event.pointerId); // ensures that the pointerup event is fired even if the user moves their pointer outside of the button, while holding down
        startNote(`pointer:${event.pointerId}`, hertz);
      }}
      onPointerUp={(event) => {
        releasePointerCapture(event);
        stopNote(`pointer:${event.pointerId}`);
      }}
      onPointerCancel={(event) => {
        releasePointerCapture(event);
        stopNote(`pointer:${event.pointerId}`);
      }}
      onLostPointerCapture={(event) => {
        // by definition, pointerCapture has been released, so no need to call releasePointerCapture
        stopNote(`pointer:${event.pointerId}`); // handles edge cases where note needs to stop
      }}
    >
      <CardHeader className="absolute inset-0 z-10 rounded-none p-2">
        <div className="flex items-center justify-around">
          {label && (
            <Badge className="cursor-default bg-transparent text-gray-400">
              {label}
            </Badge>
          )}
          <Button
            className="cursor-pointer text-gray-400 opacity-0 transition-opacity group-hover/card:opacity-100 focus-visible:opacity-100"
            aria-label={`Delete ${hertz} Hz note`}
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(hertz);
            }}
            onPointerDown={(e) => e.stopPropagation()} // prevents note from playing when user clicks delete button
            onPointerUp={(e) => e.stopPropagation()} // also prevents rare edge-case where note plays when user clicks delete button
          >
            <TrashIcon />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="absolute inset-0 flex items-center justify-center gap-1 p-0">
        <span className="text-2xl font-extrabold">{hertz}</span>
        <span className="text-xs text-gray-400">Hz</span>
      </CardContent>
    </Card>
  );
}

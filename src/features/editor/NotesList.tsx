import type { NotesListProps } from "@/features/editor/editor.types";
import { NoteButton } from "@/features/editor/NoteButton";

export function NotesList({
  canManageScale,
  notes,
  onDelete,
  playingHertz,
  isEditingAllowed,
  startNote,
  stopNote,
}: NotesListProps) {
  return (
    <div className="my-8 flex flex-wrap justify-center gap-2 lg:justify-start">
      {notes.map((note) => (
        <NoteButton
          key={note.hertz}
          hertz={note.hertz}
          label={note.label}
          onDelete={canManageScale ? onDelete : undefined}
          startNote={startNote}
          stopNote={stopNote}
          isPlaying={playingHertz.has(note.hertz)}
          isEditingAllowed={isEditingAllowed}
        />
      ))}
    </div>
  );
}

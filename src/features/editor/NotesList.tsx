import type { NotesListProps } from "@/features/editor/editor.types";
import { NoteButton } from "@/features/editor/NoteButton";

export function NotesList({
  notes,
  onDelete,
  playingHertz,
  startNote,
  stopNote,
}: NotesListProps) {
  return (
    <div className="my-8 flex flex-wrap gap-2">
      {notes.map((note) => (
        <NoteButton
          key={note.hertz}
          hertz={note.hertz}
          label={note.label}
          onDelete={onDelete}
          startNote={startNote}
          stopNote={stopNote}
          isPlaying={playingHertz.has(note.hertz)}
        />
      ))}
    </div>
  );
}

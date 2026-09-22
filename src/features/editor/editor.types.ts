import type { DatabaseScaleRowWithNotes } from "@/features/scales/scale.types";

type StartNoteHandler = (id: string, hertz: number) => void;
type StopNoteHandler = (id: string) => void;

export type DeleteScaleHandler = (scaleTitle: string) => Promise<void>;

export type ScaleDraftNote = {
  hertz: number;
};

// A scale that is editable/visible in the UI and used for audio playback.
export type ScaleDraft = {
  title: string;
  notes: ScaleDraftNote[];
};

export type ScaleEditorMode = "create" | "edit";

export type ScaleEditorProps = {
  key?: string;
  initialScale: ScaleDraft;
  editorMode: ScaleEditorMode;
  onDelete?: DeleteScaleHandler;
  onSave(scale: ScaleDraft): Promise<DatabaseScaleRowWithNotes>;
};

export type NoteButtonProps = {
  hertz: number;
  label?: string;
  isPlaying: boolean;
  isEditingAllowed: boolean;
  onDelete: (hertz: number) => void;
  startNote: StartNoteHandler;
  stopNote: StopNoteHandler;
};

export type CreateNoteResult =
  { success: true } | { success: false; message: string };

export type NoteFormProps = {
  isEditingAllowed: boolean;
  onCreateNote: (hertz: number) => CreateNoteResult;
};

export type DirtyStateDialogProps = {
  isOpen: boolean;
  onConfirm: (() => void) | undefined;
  isSaving: boolean;
  onCancel: (() => void) | undefined;
};

export type ParseHertzResult =
  { success: true; value: number } | { success: false; message: string };

export type NotesListProps = {
  notes: Note[];
  isEditingAllowed: boolean;
  onDelete: (hertz: number) => void;
  playingHertz: Set<number>;
  startNote: StartNoteHandler;
  stopNote: StopNoteHandler;
};

// prop for rendering NoteButton component, visible in the UI, with code + label for keyboard events
export type Note = {
  hertz: number;
  code?: string;
  label?: string;
};

// associated with a playable audio object, and its built-in stop function
export type PlayingNote = {
  hertz: number;
  stop: () => void;
};

export type Key = {
  code: string; // for keyPress events, eg. KeyboardEvent.code
  label: string; // for UX display, eg. "a", "b", "c"
};

import { useState, useRef, useEffect, useCallback } from "react";
import { useBlocker, useNavigate, useNavigation } from "react-router";
import { toast } from "sonner";

import type {
  ScaleEditorProps,
  Note,
  CreateNoteResult,
  PlayingNote,
} from "@/features/editor/editor.types";

import { ScaleHeader } from "@/features/scales/ScaleHeader";
import { NoteForm } from "@/features/editor/NoteForm";
import { NotesList } from "@/features/editor/NotesList";
import { DirtyStateDialog } from "@/features/editor/DirtyStateDialog";

import { getPlayingNote } from "@/features/editor/audio";
import { getKeyboardRange, PLAYABLE_KEYS } from "@/features/editor/keyBindings";
import { routeSlugTranslator } from "@/lib/routeSlug";
import { Button } from "#components/ui/button";

const MIN_HIGHLIGHT_MS = 100; // minimum time to highlight a NoteButton after stopNote() is called, to ensure that short pointer taps are visually registered in the UI.

// sort keys by hertz, assign keyDown codes so they're playable via keyboard
function getPlayableNotes(notes: Note[]) {
  const sortedNotes = [...notes].sort((a, b) => a.hertz - b.hertz);

  const keys = getKeyboardRange(sortedNotes.length);
  if (keys.length !== sortedNotes.length)
    throw new Error("Keyboard range does not match note count.");

  return sortedNotes.map((note, i) => ({ ...note, ...keys[i] }));
}

// get a JSON string representing current scale-in-editor, to compare to last-known database save.
// used for deriving dirty save state (i.e., whether the current scale has unsaved changes)
function getEditorScaleSnapshot(title: string, notes: Note[]) {
  const trimmedTitle = title.trim() ? title.trim() : "Untitled Scale"; // make sure we're comparing Editor's title with database's consistently, given that db trims whitespace and defaults to "Untitled Scale" if the title is empty.

  return JSON.stringify({
    title: trimmedTitle,
    frequencies: notes.map((note) => note.hertz).sort((a, b) => a - b),
  });
}

export function Editor({
  editorMode,
  initialScale,
  onDelete: handleDelete,
  onSave,
}: ScaleEditorProps) {
  const navigate = useNavigate();

  const navigation = useNavigation();
  const latestNavigation = useRef(navigation);
  useEffect(() => {
    // keep track of the latest navigation object to ensure that async operations like scale creation use the most recent navigation reference.
    latestNavigation.current = navigation;
  }, [navigation]);

  // we need to track whether the component is mounted because of async operations like scale creation.
  // this prevents odd UX behavior, as scale creation auto-navigates to the created scale, whereas the user might have already navigated away from the editor.
  const isMounted = useRef(false);

  // track whether user has accepted departure in DirtyStateDialog.
  // this is so a user save, then user departure in succession doesn't trigger automatic navigation to saved scale, after the async save completes.
  // instead the browser navigates to user's intended destination.
  const hasAcceptedDeparture = useRef(false);

  function confirmDeparture() {
    if (blocker.state !== "blocked") return;

    hasAcceptedDeparture.current = true;
    blocker.proceed();
  }

  // track successful creation of a new scale, so that we can redirect to it once the creation is complete.
  // because creation is asynchronous, we need to track its progress, along with various user navigation states, like whether the user has moved to a different page, or accepted departure in the dirty state dialog.
  const [createdScaleId, setCreatedScaleId] = useState<string | null>(null);
  const creationRedirectStarted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const [redirectError, setRedirectError] = useState<string | null>(null);
  const [isOpeningSavedScale, setIsOpeningSavedScale] = useState(false);

  const openSavedScale = useCallback(async () => {
    if (createdScaleId === null) return;

    setRedirectError(null);
    setIsOpeningSavedScale(true);
    allowNavigation.current = true;

    try {
      await navigate(
        `/scales/${routeSlugTranslator.fromUUID(createdScaleId)}`,
        { replace: true },
      );
    } catch {
      if (!isMounted.current) return; // let's say the user saved, then navigated away from this scale. that means we abort the redirection to createdScale that typically happens.

      allowNavigation.current = false;
      setRedirectError(
        "Your scale was saved, but its page could not be opened.",
      );
    } finally {
      if (isMounted.current) {
        setIsOpeningSavedScale(false);
      }
    }
  }, [createdScaleId, navigate]);

  const [notes, setNotes] = useState<Note[]>(
    () =>
      // state for notes that user enters/deletes, visible in UI as NoteButtons
      getPlayableNotes(initialScale.notes || []), // once notes are initialized (either as an empty array, or from a scale loaded from the database), assign key bindings so that they can be played via keyboard.
  );
  const [scaleTitle, setScaleTitle] = useState<string>(
    initialScale.title || "Untitled Scale",
  ); // title of scale, editable by user

  const [playingHertz, setPlayingHertz] = useState<Set<number>>(new Set()); // set of hertz values, sync'ed with  playingNotes, used to highlight actively playing notes in UI.
  const playingNotes = useRef<Map<string, PlayingNote>>(new Map()); // live PlayingNote objects, with built-in stop functions, that user is currently playing via keyboard, or pointer (mouse or touch). key is either "keyboard:${event.code}" or "pointer:${pointerId}"
  const audioContextRef = useRef<AudioContext | null>(null); // reuse audio context; avoid creating new audioCtx for each note, and allow sustained, overlapping notes

  const [savedSnapshot, setSavedSnapshot] = useState(() =>
    // track dirty state by storing a snapshot of the last saved scale
    getEditorScaleSnapshot(scaleTitle, notes),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const allowNavigation = useRef(false); // bypass to allow navigation, so that successful creation / deletion can navigate to a different page without triggering dirty state warnings.

  const getAudioContext = useCallback(() => {
    // reuse audioContext if one currently exists, otherwise create a new one.
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    return audioContextRef.current;
  }, []);

  const syncPlayingHertz = useCallback(() => {
    setPlayingHertz(
      new Set(Array.from(playingNotes.current.values(), ({ hertz }) => hertz)),
    );
  }, []);

  const startNote = useCallback(
    (id: string, hertz: number) => {
      playingNotes.current.get(id)?.stop(); // stop any existing note keyed to id before starting new one
      const playingNote = getPlayingNote(getAudioContext(), hertz);
      playingNotes.current.set(id, playingNote);
      syncPlayingHertz();
    },
    [getAudioContext, syncPlayingHertz],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.repeat) return; // ignore repeated keydown events if user holds down key

      const target = event.target as HTMLElement | null;

      if (
        // don't trigger for keydown in input fields, textareas, or contentEditable elements
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable
      ) {
        return;
      }

      const note = notes.find((note) => note.code === event.code); // check to see if key that's pressed corresponds to a note in set

      if (!note) return;

      event.preventDefault(); // prevent default browser behavior for keydown events that correspond to notes
      startNote(`keyboard:${event.code}`, note.hertz);
    },
    [notes, startNote],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  const stopNote = useCallback(async (id: string) => {
    // don't trigger if there are no playingNotes tied to this eventCode or pointerId.
    const playingNote = playingNotes.current.get(id);
    if (!playingNote) return;

    // remove any audio objects so that a new audio object with this same input can safely be created, without wating for previous one to finish playing
    playingNotes.current.delete(id);

    playingNote.stop(); // immediately stop the the audio output...

    // ... but delay any visual UI changes, otherwise NoteButton doesn't register a highlight on short pointer taps, due to being too short for React framerate.
    await new Promise((resolve) => {
      window.setTimeout(resolve, MIN_HIGHLIGHT_MS);
    });

    const frequencyStillPlaying = Array.from(
      playingNotes.current.values(),
    ).some((note) => note.hertz === playingNote.hertz);

    if (!frequencyStillPlaying) {
      setPlayingHertz((previous) => {
        const next = new Set(previous);
        next.delete(playingNote.hertz);
        return next;
      });
    }
  }, []);

  const stopAllNotes = useCallback(() => {
    playingNotes.current.forEach((playingNote) => playingNote.stop());
    playingNotes.current.clear();
    setPlayingHertz(new Set());
  }, []);

  const handleKeyUp = useCallback(
    (event: KeyboardEvent) => {
      if (playingNotes.current.has(`keyboard:${event.code}`)) {
        event.preventDefault();
        stopNote(`keyboard:${event.code}`);
      }
    },
    [stopNote],
  );

  useEffect(() => {
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyUp]);

  useEffect(() => {
    return () => {
      stopAllNotes();
    };
  }, [stopAllNotes]);

  // get user input, create NoteButton component in UI
  function createNote(hertz: number): CreateNoteResult {
    if (notes.length >= PLAYABLE_KEYS.length) {
      return {
        success: false,
        message: `Cannot add more than ${PLAYABLE_KEYS.length} notes.`,
      }; // prevent adding more notes than there are playable keys
    }

    if (notes.some((note) => note.hertz === hertz)) {
      return {
        success: false,
        message: `${hertz} Hz is already in this scale.`,
      }; // allow only unique notes
    }

    stopAllNotes();

    setNotes((prev) => {
      return getPlayableNotes([...prev, { hertz }]);
    });

    return { success: true };
  }

  function deleteNote(hertzToDelete: number) {
    stopAllNotes(); // prevents stuck playingNotes if user simultaneously holds a note, and deletes it or another note.

    setNotes((prev) =>
      getPlayableNotes(prev.filter((note) => note.hertz !== hertzToDelete)),
    );
  }

  async function saveScale() {
    if (isSaving || createdScaleId !== null) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      const savedScale = await onSave({ title: scaleTitle, notes });

      if (!isMounted.current) return; // let's say the user saved, then navigated away from this scale. that means we abort the redirection to createdScale that typically happens.

      setSavedSnapshot(
        getEditorScaleSnapshot(savedScale.title, savedScale.scale_notes),
      );

      if (editorMode === "create") {
        setCreatedScaleId(savedScale.id);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Could not save the scale.";

      if (isMounted.current) {
        setSaveError(errorMessage);
      } else {
        toast.error("Couldn't save the scale.", {
          description: errorMessage,
        });
      }
    } finally {
      if (isMounted.current) {
        setIsSaving(false);
      }
    }
  }

  async function deleteScale(scaleTitle: string) {
    if (!handleDelete) return;
    await handleDelete(scaleTitle);

    if (
      isMounted.current &&
      !hasAcceptedDeparture.current &&
      latestNavigation.current.state === "idle"
    ) {
      // only do this if the current Editor is still mounted, ie. user hasn't navigated away while scale was being deleted.
      // also, only auto-navigate if user hasn't accepted departure in the dirty state dialog.
      allowNavigation.current = true;
      navigate("/scales/new", { replace: true }); // The current route now points at a deleted database record, so navigate away
    }
  }

  const isDirty = savedSnapshot !== getEditorScaleSnapshot(scaleTitle, notes);

  useEffect(() => {
    if (!isDirty) return;

    function warnBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault(); // prevents the browser's default behavior of unloading the page, and instead triggers a confirmation dialog to warn the user
      // this is to give the user a chance to confirm before leaving the page with unsaved changes.
      // there is no way of changing the text in the confirmation dialog; the browser will display a default message.
    }

    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", warnBeforeUnload);
    };
  }, [isDirty]);

  const blocker = useBlocker(() => isDirty && !allowNavigation.current); // block SPA navigation if there are unsaved changes.

  // clean-state handling for newly created scales.
  // handles the case where the user saves scale, then tries to navigate away immediately afterwards, bringing up dirty state dialog warning.
  // once the save resolves and the scale is no longer dirty, the navigation can proceed automatically.
  useEffect(() => {
    if (isDirty) return; // if the scale is, or becomes dirty, we don't enable navigation.

    if (blocker.state === "blocked") {
      hasAcceptedDeparture.current = true; // state is clean, eg. scale has successfully saved.
      blocker.proceed(); // therefore, unblock navigation.
      return;
    }

    if (
      createdScaleId === null || // check if a new scale has been created
      blocker.state !== "unblocked" ||
      hasAcceptedDeparture.current || // user has accepted departure in DirtyStateDialog
      creationRedirectStarted.current // a redirect for the creation of a new scale has already started
    ) {
      return;
    }

    creationRedirectStarted.current = true;
    void openSavedScale();
  }, [blocker, isDirty, createdScaleId, navigate, openSavedScale]);

  const isEditingAllowed = !isSaving && createdScaleId === null; // if the editor just created a new scale, then navigation to createdScale is pending. therefore disable editing until navigation completes.

  return (
    <main className="min-w-0 p-4 sm:p-6 lg:p-8">
      <ScaleHeader
        scaleTitle={scaleTitle}
        editorMode={editorMode}
        notesCount={notes.length}
        onDelete={handleDelete ? deleteScale : undefined}
        onSave={saveScale}
        setScaleTitle={setScaleTitle}
        isDirty={isDirty}
        isEditingAllowed={isEditingAllowed}
        isOpeningSavedScale={isOpeningSavedScale}
        isSaving={isSaving}
        saveError={saveError}
        onDismissSaveError={() => setSaveError(null)}
      />
      {redirectError && (
        <div role="alert">
          <p>{redirectError}</p>
          <Button
            onClick={() => void openSavedScale()}
            disabled={isOpeningSavedScale}
          >
            Open saved scale
          </Button>
        </div>
      )}
      <NoteForm isEditingAllowed={isEditingAllowed} onCreateNote={createNote} />
      <NotesList
        isEditingAllowed={isEditingAllowed}
        notes={notes}
        onDelete={deleteNote}
        playingHertz={playingHertz}
        startNote={startNote}
        stopNote={stopNote}
      />
      <DirtyStateDialog
        isOpen={blocker.state === "blocked"}
        isSaving={isSaving}
        onConfirm={confirmDeparture}
        onCancel={blocker.reset}
      />
    </main>
  );
}

import type { Key, Note } from "@/features/editor/editor.types";

function getAlphaNumericKey(char: string) {
  if (/^\d$/.test(char)) {
    // test if char is a digit
    return { code: `Digit${char}`, label: char };
  }

  // for letters, the code is "Key" + uppercase letter
  return { code: `Key${char.toUpperCase()}`, label: char.toLowerCase() };
}

export const PLAYABLE_KEYS: Key[] = [
  // These punctuation keys are included because they are commonly adjacent
  // to the main letter cluster on US-style keyboards.
  ..."1234567890".split("").map(getAlphaNumericKey),
  ..."QWERTYUIOP".split("").map(getAlphaNumericKey),
  ..."ASDFGHJKL".split("").map(getAlphaNumericKey),
  { code: "Semicolon", label: ";" },
  { code: "Quote", label: "'" },
  ..."ZXCVBNM".split("").map(getAlphaNumericKey),
  { code: "Comma", label: "," },
  { code: "Period", label: "." },
  { code: "Slash", label: "/" },
];

const G_INDEX = PLAYABLE_KEYS.findIndex((key) => key.label === "g");
const H_INDEX = PLAYABLE_KEYS.findIndex((key) => key.label === "h");

// centerIndex is between G and H, otherwise A would be centered.
const centerIndex = (G_INDEX + H_INDEX) / 2;

export function getKeyboardRange(noteCount: number): Key[] {
  if (noteCount > PLAYABLE_KEYS.length) {
    throw new Error("Too many notes for available keys");
  }

  const centeredStartIndex = Math.round(centerIndex - (noteCount - 1) / 2); // centers notes around G & H keys, not the true center of PLAYABLE_KEYS, for ergonomic reasons
  const maxStartIndex = PLAYABLE_KEYS.length - noteCount; // greatest valid start index, so last note doesn't go out of bounds
  const startIndex = Math.min(Math.max(centeredStartIndex, 0), maxStartIndex); // clamp to valid range, so higher note counts don't go out of bounds

  return PLAYABLE_KEYS.slice(startIndex, startIndex + noteCount);
}

// sort keys by hertz, assign keyDown codes so they're playable via keyboard
export function getPlayableNotes(notes: Note[]) {
  const sortedNotes = [...notes].sort((a, b) => a.hertz - b.hertz);

  const keys = getKeyboardRange(sortedNotes.length);
  if (keys.length !== sortedNotes.length)
    throw new Error("Keyboard range does not match note count.");

  return sortedNotes.map((note, i) => ({ ...note, ...keys[i] }));
}

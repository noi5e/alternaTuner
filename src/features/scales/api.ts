import { supabase } from "@/lib/supabase";
import type { ScaleDraft } from "@/features/editor/editor.types";
import type {
  DatabaseScaleRowWithNotes,
  DatabaseScaleRowWithNotesAndDetails,
  DatabaseScaleRowWithNoteCount,
} from "@/features/scales/scale.types";

function stripScaleDraftNotes(notes: ScaleDraft["notes"]): number[] {
  return notes.map(({ hertz }) => hertz);
}

export async function listUserScales(
  ownerId: string,
): Promise<DatabaseScaleRowWithNoteCount[]> {
  const { data, error } = await supabase
    .from("scales")
    .select(
      "id, title, created_at, updated_at, owner_id, note_count:scale_notes(count)",
    )
    .eq("owner_id", ownerId)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data.map(({ note_count, ...scale }) => ({
    ...scale,
    noteCount: note_count[0]?.count ?? 0,
  }));
}

export async function listUserFavorites(
  userId: string,
): Promise<DatabaseScaleRowWithNoteCount[]> {
  const { data, error } = await supabase
    .from("scales")
    .select(
      `
      id, title, created_at, updated_at, owner_id,
      note_count:scale_notes(count),
      scale_favorites!inner(user_id)
    `,
    )
    .eq("scale_favorites.user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) throw error;

  return data.map(({ scale_favorites, note_count, ...scale }) => {
    void scale_favorites;
    return { ...scale, noteCount: note_count[0]?.count ?? 0 };
  });
}

export async function getScaleById(
  scaleId: string,
): Promise<DatabaseScaleRowWithNotesAndDetails | null> {
  const { data, error } = await supabase
    .from("scales")
    .select(
      "id, title, created_at, updated_at, owner_id, scale_notes(*), is_public, scale_favorites(user_id)",
    )
    .eq("id", scaleId)
    .maybeSingle();

  if (error) throw error;
  if (data === null) return null;

  const { scale_favorites, is_public, ...scale } = data;

  return {
    ...scale,
    isFavorite: scale_favorites.length > 0,
    isPublic: is_public,
  };
}

export async function createScale({
  title = "Untitled Scale",
  notes,
}: ScaleDraft): Promise<DatabaseScaleRowWithNotes> {
  const p_notes = stripScaleDraftNotes(notes);

  const { data, error } = await supabase.rpc("create_scale_with_notes", {
    p_title: title,
    p_notes,
  });

  if (error) throw error;
  // The RPC returns data without notes, so fetch the full scale by ID.
  const scale = await getScaleById(data.id);
  if (scale === null) throw new Error("Could not load the created scale");
  return scale;
}

export async function updateScale(
  id: string,
  { title, notes }: ScaleDraft,
): Promise<DatabaseScaleRowWithNotes> {
  const { error } = await supabase.rpc("update_scale_with_notes", {
    p_scale_id: id,
    p_title: title,
    p_notes: stripScaleDraftNotes(notes),
  });

  if (error) throw error;

  const scale = await getScaleById(id);
  if (scale === null) throw new Error("Could not load the updated scale");
  return scale;
}

export async function deleteScale(id: string) {
  const { error } = await supabase.from("scales").delete().eq("id", id);
  if (error) throw error;
}

export async function setScaleFavorite(id: string, isFavorite: boolean) {
  const { error } = await supabase.rpc("set_scale_favorite", {
    p_scale_id: id,
    p_is_favorite: isFavorite,
  });

  if (error) throw error;
}

export async function setScaleVisibility(id: string, isPublic: boolean) {
  const { error } = await supabase.rpc("set_scale_visibility", {
    p_scale_id: id,
    p_is_public: isPublic,
  });

  if (error) throw error;
}

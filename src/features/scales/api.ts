import { supabase } from "@/lib/supabase";
import type { ScaleDraft } from "@/features/editor/editor.types";
import type { DatabaseScaleRowWithNotes } from "@/features/scales/scale.types";

function stripScaleDraftNotes(notes: ScaleDraft["notes"]): number[] {
  return notes.map(({ hertz }) => hertz);
}

export async function listScales(): Promise<DatabaseScaleRowWithNotes[]> {
  const { data, error } = await supabase
    .from("scales")
    .select("id, title, created_at, updated_at, scale_notes(*)")
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getScaleById(
  scaleId: string,
): Promise<DatabaseScaleRowWithNotes> {
  const { data, error } = await supabase
    .from("scales")
    .select("id, title, created_at, updated_at, scale_notes(*)")
    .eq("id", scaleId)
    .single();

  if (error) throw error;
  return data;
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
  return getScaleById(data.id); // the RPC function returns data without the associated notes, so we fetch the full scale by ID.
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

  return getScaleById(id);
}

export async function deleteScale(id: string) {
  const { error } = await supabase.from("scales").delete().eq("id", id);
  if (error) throw error;
}

import { useLoaderData, useNavigate } from "react-router";
import { useScalesContext } from "@/features/scales/useScalesContext";

import { Editor } from "@/features/editor/Editor";
import type { ScaleDraft } from "@/features/editor/editor.types";
import { updateScale, deleteScale } from "@/features/scales/api.ts";
import type { DatabaseScaleRowWithNotes } from "@/features/scales/scale.types";

function getEditableScale(
  scale: DatabaseScaleRowWithNotes,
): ScaleDraft["notes"] {
  return [...scale.scale_notes]
    .sort((a, b) => a.position - b.position)
    .map(({ hertz }) => ({ hertz }));
}

export function ScalePage() {
  const { scale } = useLoaderData() as { scale: DatabaseScaleRowWithNotes };

  const navigate = useNavigate();
  const { refreshScales } = useScalesContext();

  async function handleUpdate(draft: ScaleDraft) {
    const saved = await updateScale(scale.id, draft);
    await refreshScales();
    return saved;
  }

  async function handleDelete() {
    await deleteScale(scale.id);
    await refreshScales();

    // The current route now points at a deleted database record.
    navigate("/scales/new", { replace: true });
  }

  return (
    <Editor
      key={scale.id}
      initialScale={{ title: scale.title, notes: getEditableScale(scale) }}
      editorMode="edit"
      onDelete={handleDelete}
      onSave={handleUpdate}
    />
  );
}

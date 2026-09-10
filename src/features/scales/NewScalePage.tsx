import { Editor } from "@/features/editor/Editor";
import type { ScaleDraft } from "@/features/editor/editor.types";
import { createScale } from "@/features/scales/api";
import { useNavigate } from "react-router";
import { useScalesContext } from "@/features/scales/useScalesContext";
import { routeSlugTranslator } from "@/lib/routeSlug";

export function NewScalePage() {
  const navigate = useNavigate();
  const { refreshScales } = useScalesContext();

  async function handleCreate(draft: ScaleDraft) {
    const created = await createScale({
      title: draft.title,
      notes: draft.notes.map(({ hertz }) => ({ hertz })),
    });

    await refreshScales();

    // after scale is created, navigate to its dedicated /scales/scaleSlug page, so that onSave becomes updateScale() instead of createScale().
    navigate(`/scales/${routeSlugTranslator.fromUUID(created.id)}`, {
      replace: true,
    });

    return created;
  }

  return (
    <Editor
      initialScale={{ title: "Untitled Scale", notes: [] }}
      editorMode="create"
      onSave={handleCreate}
    />
  );
}

import { useNavigate } from "react-router";

import { Editor } from "@/features/editor/Editor";

import { createScale } from "@/features/scales/api";
import { useScalesContext } from "@/features/scales/useScalesContext";
import { routeSlugTranslator } from "@/lib/routeSlug";

import { toast } from "sonner";

import type { ScaleDraft } from "@/features/editor/editor.types";

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

    toast.success(`Saved scale: ${created.title}`);

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

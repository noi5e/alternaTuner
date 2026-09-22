import { Editor } from "@/features/editor/Editor";

import { createScale } from "@/features/scales/api";
import { useScalesContext } from "@/features/scales/useScalesContext";

import { toast } from "sonner";

import type { ScaleDraft } from "@/features/editor/editor.types";

export function NewScalePage() {
  const { refreshScales } = useScalesContext();

  async function handleCreate(draft: ScaleDraft) {
    const created = await createScale({
      title: draft.title,
      notes: draft.notes.map(({ hertz }) => ({ hertz })),
    });

    await refreshScales();

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

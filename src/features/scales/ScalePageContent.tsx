import { useState } from "react";
import { toast } from "sonner";
import { useScalesContext } from "@/features/scales/useScalesContext";

import { Editor } from "@/features/editor/Editor";

import {
  updateScale,
  deleteScale,
  setScaleFavorite,
  setScaleVisibility,
} from "@/features/scales/api.ts";

import { useAuth } from "@/features/auth/AuthContext";

import type {
  DatabaseScaleRowWithNotesAndDetails,
  ScalePageContentProps,
} from "@/features/scales/scale.types";
import type { ScaleDraft } from "@/features/editor/editor.types";

function getEditableScale(
  scale: DatabaseScaleRowWithNotesAndDetails,
): ScaleDraft["notes"] {
  return [...scale.scale_notes]
    .sort((a, b) => a.position - b.position)
    .map(({ hertz }) => ({ hertz }));
}

export function ScalePageContent({ scale }: ScalePageContentProps) {
  const [isFavorite, setIsFavorite] = useState<boolean>(scale.isFavorite);
  const [isUpdatingFavorite, setIsUpdatingFavorite] = useState<boolean>(false);

  const [isPublic, setIsPublic] = useState<boolean>(scale.isPublic);
  const [isUpdatingVisibility, setIsUpdatingVisibility] =
    useState<boolean>(false);

  const { isOwner } = useAuth();
  const canManageScale = isOwner(scale.owner_id);

  const { refreshScales } = useScalesContext();

  async function handleUpdate(draft: ScaleDraft) {
    const saved = await updateScale(scale.id, draft);
    await refreshScales();
    return saved;
  }

  async function handleDelete(scaleTitle: string) {
    await deleteScale(scale.id);
    await refreshScales();
    toast.success(`Scale deleted: ${scaleTitle}`);
  }

  async function handleFavorite(nextIsFavorite: boolean) {
    setIsUpdatingFavorite(true);
    try {
      await setScaleFavorite(scale.id, nextIsFavorite);
      setIsFavorite(nextIsFavorite);
      toast.success(
        nextIsFavorite ? "Added to favorites" : "Removed from favorites",
      );
    } catch (error) {
      console.error("Failed to update favorite status", error);
      toast.error(
        nextIsFavorite
          ? "Couldn’t add to favorites. Please try again."
          : "Couldn’t remove from favorites. Please try again.",
      );
    } finally {
      setIsUpdatingFavorite(false);
    }
  }

  async function handleVisibilityChange(nextIsPublic: boolean) {
    setIsUpdatingVisibility(true);
    try {
      await setScaleVisibility(scale.id, nextIsPublic);
      setIsPublic(nextIsPublic);
      toast.success(
        nextIsPublic ? "Scale set to public" : "Scale set to private",
      );
    } catch (error) {
      console.error("Failed to update visibility", error);
      toast.error("There was an error updating the visibility of the scale");
    } finally {
      setIsUpdatingVisibility(false);
    }
  }

  return (
    <Editor
      initialScale={{
        title: scale.title,
        notes: getEditableScale(scale),
      }}
      canManageScale={canManageScale}
      editorMode="edit"
      onDelete={canManageScale ? handleDelete : undefined}
      onSave={canManageScale ? handleUpdate : undefined}
      isFavorite={isFavorite}
      isPublic={isPublic}
      isUpdatingFavorite={isUpdatingFavorite}
      isUpdatingVisibility={isUpdatingVisibility}
      onVisibilityChange={canManageScale ? handleVisibilityChange : undefined}
      onFavorite={handleFavorite}
    />
  );
}

import type { SaveStatus, SaveAction } from "@/features/editor/editor.types";

export function saveStatusReducer(
  state: SaveStatus,
  action: SaveAction,
): SaveStatus {
  switch (action.type) {
    case "idle":
      return { state: "idle" };
    case "saving":
      return { state: "saving" };
    case "saveError":
      return { state: "saveError", message: action.payload.message };
    case "created":
      return { state: "created", scaleId: action.payload.scaleId };
    case "redirecting":
      return { state: "redirecting", scaleId: action.payload.scaleId };
    case "redirectError":
      return {
        state: "redirectError",
        scaleId: action.payload.scaleId,
        message: action.payload.message,
      };
    default:
      return state;
  }
}

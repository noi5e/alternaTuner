import { useLoaderData } from "react-router";

import { ScalePageContent } from "@/features/scales/ScalePageContent";

import type { DatabaseScaleRowWithNotesAndDetails } from "@/features/scales/scale.types";

export function ScalePage() {
  const { scale } = useLoaderData() as {
    scale: DatabaseScaleRowWithNotesAndDetails;
  };

  return <ScalePageContent key={scale.id} scale={scale} />;
}

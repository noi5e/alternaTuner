import { data } from "react-router";

import { getScaleById } from "@/features/scales/api";
import { routeSlugTranslator } from "@/lib/routeSlug";

import type { LoaderFunctionArgs } from "react-router";

export async function scaleLoader({ params }: LoaderFunctionArgs) {
  const { scaleSlug } = params;

  if (!scaleSlug) {
    throw data({ code: "MISSING_SCALE_IDENTIFIER" }, { status: 400 });
  }

  let scaleId: string;

  try {
    scaleId = routeSlugTranslator.toUUID(scaleSlug);
  } catch {
    throw data({ code: "INVALID_SCALE_IDENTIFIER" }, { status: 400 });
  }

  const scale = await getScaleById(scaleId);

  if (scale === null) {
    throw data({ code: "SCALE_UNAVAILABLE" }, { status: 404 });
  }

  return { scale };
}

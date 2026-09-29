import { Button } from "@/components/ui/button";
import { HeartIcon } from "@phosphor-icons/react";

import type { FavoriteButtonProps } from "./scale.types";

export function FavoriteButton({
  isFavorite,
  onFavorite,
  isUpdatingFavorite,
}: FavoriteButtonProps) {
  return (
    <Button
      variant="ghost"
      className="cursor-pointer"
      disabled={isUpdatingFavorite}
      onClick={() => onFavorite(!isFavorite)}
    >
      <HeartIcon
        weight={isFavorite ? "fill" : "regular"}
        className={isFavorite ? "text-red-500" : "text-muted-foreground"}
      />
      {isFavorite ? "Remove from Favorites" : "Favorite"}
    </Button>
  );
}

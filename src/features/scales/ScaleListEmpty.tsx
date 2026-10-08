import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";

import type { ScaleListEmptyProps } from "@/features/scales/scale.types";

function ScaleListEmpty({ title, description }: ScaleListEmptyProps) {
  return (
    <Empty className="min-h-48 px-4 py-6">
      <EmptyHeader>
        <EmptyTitle className="text-base">{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

export default ScaleListEmpty;

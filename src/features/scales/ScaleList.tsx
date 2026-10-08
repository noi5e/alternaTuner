import type { ScaleListProps } from "@/features/scales/scale.types";
import ScaleSideBarLink from "@/features/scales/ScaleSideBarLink";

export default function ScaleList({ userScales, setIsOpen }: ScaleListProps) {
  return (
    <ul className="w-full min-w-0 space-y-1">
      {userScales.map((scale) => (
        <ScaleSideBarLink
          key={scale.id}
          id={scale.id}
          title={scale.title}
          noteCount={scale.noteCount}
          onNavigate={() => setIsOpen(false)}
        />
      ))}
    </ul>
  );
}

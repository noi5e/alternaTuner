import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";

function ScaleListEmpty() {
  return (
    <Empty className="min-h-48 px-4 py-6">
      <EmptyHeader>
        <EmptyTitle className="text-base">No saved scales yet</EmptyTitle>
        <EmptyDescription>Create a new scale to get started.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

export default ScaleListEmpty;

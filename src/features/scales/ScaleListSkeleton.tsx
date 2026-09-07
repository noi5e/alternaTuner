function ScaleListSkeleton() {
  return (
    <div className="space-y-1" aria-label="Loading scales" aria-busy="true">
      {Array.from({ length: 3 }, (_, index) => (
        <div
          key={index}
          className="flex h-9 items-center gap-2 rounded-md px-2"
        >
          <div className="h-6 w-12 shrink-0 animate-pulse rounded-full bg-sidebar-accent" />
          <div
            className={[
              "h-4 animate-pulse rounded bg-sidebar-accent",
              index === 0 ? "w-2/3" : index === 1 ? "w-1/2" : "w-3/4",
            ].join(" ")}
          />
        </div>
      ))}
    </div>
  );
}

export default ScaleListSkeleton;

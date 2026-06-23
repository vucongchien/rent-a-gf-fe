export default function CompanionsLoading() {
  return (
    <div className="flex-1 p-8 space-y-6">
      <div className="h-10 w-72 bg-neutral-200 rounded-md animate-pulse" />
      <div className="border border-border rounded-lg bg-surface overflow-hidden">
        <div className="h-12 bg-neutral-50 border-b border-border" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-14 border-b border-border last:border-b-0 px-4 flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-full bg-neutral-200 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-1/3 bg-neutral-200 rounded animate-pulse" />
              <div className="h-2 w-1/5 bg-neutral-100 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CompanionDetailLoading() {
  return (
    <div className="flex-1 p-8 space-y-6">
      <div className="h-4 w-32 bg-neutral-200 rounded animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          <div className="border border-border rounded-lg bg-surface p-6 flex items-start gap-5">
            <div className="w-[88px] h-[88px] rounded-full bg-neutral-200 animate-pulse" />
            <div className="flex-1 space-y-3">
              <div className="h-5 w-1/3 bg-neutral-200 rounded animate-pulse" />
              <div className="h-3 w-1/4 bg-neutral-100 rounded animate-pulse" />
              <div className="h-4 w-full bg-neutral-100 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-neutral-100 rounded animate-pulse" />
            </div>
          </div>
          <div className="h-40 border border-border rounded-lg bg-surface animate-pulse" />
          <div className="h-40 border border-border rounded-lg bg-surface animate-pulse" />
        </div>
        <div className="h-60 border border-border rounded-lg bg-surface animate-pulse" />
      </div>
    </div>
  );
}

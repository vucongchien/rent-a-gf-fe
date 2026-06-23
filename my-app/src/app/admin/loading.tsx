export default function AdminLoading() {
  return (
    <div className="flex-1 p-8">
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-48 bg-neutral-200 rounded" />
        <div className="h-4 w-72 bg-neutral-200 rounded" />
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 bg-neutral-100 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

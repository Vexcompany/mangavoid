export function CardSkeleton() {
  return (
    <div className="bg-ink-800 rounded-lg overflow-hidden border border-ink-600">
      <div className="aspect-[2/3] shimmer" />
      <div className="p-3 space-y-2">
        <div className="h-3 shimmer rounded w-full" />
        <div className="h-3 shimmer rounded w-2/3" />
        <div className="h-4 shimmer rounded w-1/3 mt-3" />
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 animate-fade-in">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="shrink-0 w-48 md:w-56">
          <div className="aspect-[2/3] shimmer rounded-lg" />
        </div>
        <div className="flex-1 space-y-4">
          <div className="h-8 shimmer rounded w-3/4" />
          <div className="h-4 shimmer rounded w-1/2" />
          <div className="flex gap-2 mt-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-6 w-16 shimmer rounded-full" />
            ))}
          </div>
          <div className="space-y-2 mt-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-3 shimmer rounded" style={{ width: `${90 - i * 10}%` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

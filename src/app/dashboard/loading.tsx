export default function DashboardLoading() {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-8 animate-pulse">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-4 space-y-2">
            <div className="h-3 w-16 rounded bg-muted" />
            <div className="h-6 w-10 rounded bg-muted" />
          </div>
        ))}
      </div>

      {/* Collections */}
      <div className="space-y-3">
        <div className="h-4 w-28 rounded bg-muted" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-4 space-y-2">
              <div className="h-4 w-3/4 rounded bg-muted" />
              <div className="h-3 w-full rounded bg-muted" />
              <div className="h-3 w-1/2 rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>

      {/* Items */}
      <div className="space-y-3">
        <div className="h-4 w-24 rounded bg-muted" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3">
              <div className="mt-0.5 size-7 shrink-0 rounded-md bg-muted" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-2/5 rounded bg-muted" />
                <div className="h-3 w-3/5 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

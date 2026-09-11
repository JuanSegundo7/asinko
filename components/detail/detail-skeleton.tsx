export function DetailSkeleton() {
  return (
    <div className="mx-auto w-full max-w-2xl animate-pulse px-4 py-6">
      <div className="h-4 w-40 rounded bg-muted" />
      <div className="mt-6 h-3.5 w-32 rounded bg-muted" />
      <div className="mt-4 h-5 w-full rounded bg-muted" />
      <div className="mt-2 h-5 w-5/6 rounded bg-muted" />
      <div className="mt-2 h-5 w-2/3 rounded bg-muted" />
      <div className="mt-6 h-24 w-full rounded bg-muted" />
    </div>
  )
}

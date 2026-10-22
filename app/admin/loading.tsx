// lets each admin page read cookies behind a Suspense boundary. shaped like a page so nothing jumps
export default function Loading() {
  return (
    <div role="status" aria-busy="true" className="motion-safe:animate-pulse">
      <span className="sr-only">Loading</span>
      <div className="mb-8 flex items-center gap-3 border-b border-line pb-5">
        <span className="h-7 w-16 -skew-x-12 bg-surface-2" />
        <span className="h-7 w-48 bg-surface-2" />
      </div>
      <div className="border border-line bg-surface">
        <div className="h-11 border-b border-line bg-surface-2" />
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex h-11 items-center gap-4 border-b border-line px-4 last:border-0">
            <span className="h-3 w-10 bg-surface-2" />
            <span className="h-3 w-1/3 bg-surface-2" />
          </div>
        ))}
      </div>
    </div>
  );
}

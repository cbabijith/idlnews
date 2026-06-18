export function ShimmerBox({ className = '' }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-surface-container rounded-lg ${className}`}>
      <div className="shimmer-effect absolute inset-0" />
    </div>
  )
}

export function NewsCardShimmer() {
  return (
    <div className="flex gap-4 p-3 rounded-xl border border-outline-variant bg-surface-container-lowest">
      <ShimmerBox className="w-24 h-24 flex-shrink-0 rounded-lg" />
      <div className="flex flex-col justify-between flex-1 min-w-0 gap-2">
        <ShimmerBox className="h-3 w-20 rounded" />
        <ShimmerBox className="h-4 w-full rounded" />
        <ShimmerBox className="h-3 w-32 rounded" />
      </div>
    </div>
  )
}

export function FeaturedNewsShimmer() {
  return (
    <div className="rounded-2xl overflow-hidden border border-outline-variant bg-surface-container-lowest shadow-lg">
      <ShimmerBox className="w-full h-56" />
      <div className="p-5 flex flex-col gap-3">
        <ShimmerBox className="h-3 w-24 rounded" />
        <ShimmerBox className="h-6 w-full rounded" />
        <ShimmerBox className="h-6 w-3/4 rounded" />
        <ShimmerBox className="h-3 w-40 rounded" />
        <ShimmerBox className="h-10 w-full rounded-xl mt-2" />
      </div>
    </div>
  )
}

export function DesktopFeaturedShimmer() {
  return (
    <div className="rounded-2xl overflow-hidden border border-outline-variant bg-surface-container-lowest shadow-lg">
      <ShimmerBox className="w-full h-96" />
      <div className="p-6 flex flex-col gap-3">
        <ShimmerBox className="h-3 w-28 rounded" />
        <ShimmerBox className="h-8 w-full rounded" />
        <ShimmerBox className="h-8 w-2/3 rounded" />
        <ShimmerBox className="h-4 w-48 rounded" />
        <ShimmerBox className="h-3 w-full rounded" />
        <ShimmerBox className="h-3 w-5/6 rounded" />
        <ShimmerBox className="h-12 w-40 rounded-xl mt-2" />
      </div>
    </div>
  )
}

export function SidebarNewsShimmer() {
  return (
    <div className="p-4 rounded-xl border border-outline-variant bg-surface-container-lowest">
      <ShimmerBox className="h-3 w-20 rounded mb-2" />
      <ShimmerBox className="h-4 w-full rounded mb-1" />
      <ShimmerBox className="h-4 w-4/5 rounded mb-2" />
      <ShimmerBox className="h-3 w-32 rounded" />
    </div>
  )
}

export function TrendingCardShimmer() {
  return (
    <div className="rounded-xl overflow-hidden border border-outline-variant bg-surface-container-lowest">
      <ShimmerBox className="w-full h-32" />
      <div className="p-3 flex flex-col gap-2">
        <ShimmerBox className="h-3 w-20 rounded" />
        <ShimmerBox className="h-4 w-full rounded" />
        <ShimmerBox className="h-3 w-28 rounded" />
      </div>
    </div>
  )
}

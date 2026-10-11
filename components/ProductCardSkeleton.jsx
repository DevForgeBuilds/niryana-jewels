// Shimmer placeholder matching ProductCard's exact layout, shown while
// products are being fetched — replaces the plain "Loading products…" text
// with something that feels like the real grid is about to appear.
export default function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
      <div className="aspect-[4/5] bg-charcoal/10" />
      <div className="p-4">
        <div className="h-4 bg-charcoal/10 rounded w-3/4 mb-2" />
        <div className="h-3 bg-charcoal/10 rounded w-1/3 mb-3" />
        <div className="flex items-center justify-between mt-3">
          <div className="h-4 bg-charcoal/10 rounded w-1/4" />
          <div className="h-7 bg-charcoal/10 rounded-full w-16" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

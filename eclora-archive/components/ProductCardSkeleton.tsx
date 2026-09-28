export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[4/5] rounded-md bg-stone-200" />
      <div className="mt-3 space-y-2">
        <div className="h-2.5 w-1/3 rounded bg-stone-200" />
        <div className="h-3.5 w-4/5 rounded bg-stone-200" />
        <div className="h-3.5 w-1/2 rounded bg-stone-200" />
      </div>
    </div>
  );
}

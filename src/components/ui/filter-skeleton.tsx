import { Skeleton } from "@/components/ui/skeleton";

export function FilterSkeleton() {
  return (
    <div className="space-y-6">
      {/* Search skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Sort skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Experience Level skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-8 w-12 rounded-full" />
          <Skeleton className="h-8 w-20 rounded-full" />
          <Skeleton className="h-8 w-16 rounded-full" />
          <Skeleton className="h-8 w-14 rounded-full" />
        </div>
      </div>

      {/* Hourly Rate skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-28" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-8 w-12 rounded-full" />
          <Skeleton className="h-8 w-16 rounded-full" />
          <Skeleton className="h-8 w-20 rounded-full" />
          <Skeleton className="h-8 w-18 rounded-full" />
        </div>
      </div>

      {/* Skills skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-16" />
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center space-x-3 w-full py-3 px-4">
                <Skeleton className="h-4 w-4 flex-shrink-0" />
                <Skeleton className="h-4 w-24 flex-1" />
                <Skeleton className="h-4 w-4 flex-shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

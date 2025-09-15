import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function FreelancerCardSkeleton() {
  return (
    <Card className="border-border">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header Section - Compact */}
          <div className="flex items-start gap-3">
            {/* Avatar skeleton */}
            <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />

            <div className="flex-1 min-w-0">
              {/* Name and Rating skeleton */}
              <div className="flex items-center gap-2 mb-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-12" />
              </div>

              {/* Key Info Row skeleton */}
              <div className="flex items-center gap-3 mb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16 rounded-full" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
          </div>

          {/* Skills skeleton - Compact */}
          <div className="flex flex-wrap gap-1">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>

          {/* Bio skeleton - Compact */}
          <div className="space-y-1">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>

          {/* Footer Info skeleton - Compact */}
          <div className="flex items-center justify-between pt-2 border-t border-border/30">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

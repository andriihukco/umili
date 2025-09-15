import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function TaskCardSkeleton() {
  return (
    <Card className="border-border">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header Section - Compact */}
          <div>
            {/* Title skeleton */}
            <Skeleton className="h-5 w-3/4 mb-2" />
            {/* Budget and Task Type Row skeleton */}
            <div className="flex items-center gap-3 mb-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-16 rounded-full" />
            </div>
          </div>

          {/* Skills skeleton - Compact */}
          <div className="flex flex-wrap gap-1">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>

          {/* Description skeleton - Compact */}
          <div className="space-y-1">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
            <Skeleton className="h-3 w-2/3" />
          </div>

          {/* Client Info skeleton - Compact */}
          <div>
            <Skeleton className="h-3 w-32 mb-1" />
            <Skeleton className="h-3 w-16" />
          </div>

          {/* Footer Info skeleton - Compact */}
          <div className="pt-2 border-t border-border/30">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-3">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

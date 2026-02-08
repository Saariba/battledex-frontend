"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function PunchlineCardSkeleton() {
  return (
    <Card className="overflow-hidden border-border/50 bg-card/40 backdrop-blur-sm shadow-md">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center gap-2.5 mb-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="h-4 w-3/4" />
      </CardHeader>

      <CardContent className="p-4 pt-0">
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="pl-4 border-l-2 border-muted mb-4 space-y-2">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-4/5" />
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex justify-between gap-3 border-t border-border/20 mt-2">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-24" />
      </CardFooter>
    </Card>
  )
}

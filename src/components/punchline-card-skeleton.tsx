"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function PunchlineCardSkeleton() {
  return (
    <Card className="overflow-hidden border-border/50 bg-card/55 shadow-xl shadow-black/20 backdrop-blur-md">
      <CardHeader className="p-5 pb-3">
        <div className="mb-3 flex items-center gap-2.5">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-28 rounded-full" />
        </div>
        <Skeleton className="h-3 w-2/3" />
      </CardHeader>

      <CardContent className="p-5 pt-0">
        <div className="mb-4 flex items-center gap-2">
          <Skeleton className="h-7 w-7 rounded-full" />
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="mb-4 rounded-2xl border border-border/30 p-4 space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-7 w-full" />
          <Skeleton className="h-7 w-4/5" />
        </div>
      </CardContent>

      <CardFooter className="mt-2 flex justify-between gap-3 border-t border-border/20 p-5 pt-4">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-24" />
      </CardFooter>
    </Card>
  )
}

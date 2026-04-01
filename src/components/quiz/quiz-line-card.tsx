"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface QuizLineCardProps {
  dayLabel: string
  line: string
  contextBefore?: string | null
  contextAfter?: string | null
  showContextBefore?: boolean
  showContextAfter?: boolean
}

export function QuizLineCard({
  dayLabel,
  line,
  contextBefore,
  contextAfter,
  showContextBefore = false,
  showContextAfter = false,
}: QuizLineCardProps) {
  return (
    <Card className="animate-fade-in-up overflow-hidden border-border/40 bg-card/45 shadow-xl shadow-black/20 backdrop-blur-md">
      <CardHeader className="pb-3">
        <Badge variant="outline" className="w-fit border-primary/30 bg-primary/10 uppercase tracking-[0.22em] text-primary">
          {dayLabel}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="relative rounded-[28px] border border-border/30 bg-black/20 p-6 sm:p-8">
          <span className="pointer-events-none absolute -top-2 left-4 select-none text-6xl font-black leading-none text-primary/15 sm:left-6 sm:text-7xl" aria-hidden="true">
            &ldquo;
          </span>
          {showContextBefore && contextBefore ? (
            <p className="mb-2 text-sm font-mono leading-tight text-muted-foreground/60">
              {contextBefore}
            </p>
          ) : null}
          <p className="text-2xl font-black leading-tight text-foreground sm:text-3xl">
            &ldquo;{line}&rdquo;
          </p>
          {showContextAfter && contextAfter ? (
            <p className="mt-2 text-sm font-mono leading-tight text-muted-foreground/60">
              {contextAfter}
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}

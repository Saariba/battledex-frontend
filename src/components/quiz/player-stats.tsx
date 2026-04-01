"use client"

import { BarChart3 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useStats } from "@/hooks/use-stats"
import { useStreak } from "@/hooks/use-streak"

export function PlayerStatsDialog() {
  const { gamesPlayed, gamesWon, guessDistribution, winRate } = useStats()
  const { currentStreak, bestStreak } = useStreak()
  const stats = { gamesPlayed, gamesWon, guessDistribution }
  const maxDistribution = Math.max(...stats.guessDistribution, 1)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
          <BarChart3 className="h-4 w-4" />
          <span className="sr-only">Statistiken</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm rounded-3xl border-border/40 bg-card/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black uppercase tracking-tight">
            Statistiken
          </DialogTitle>
          <DialogDescription>
            Deine bisherige Quiz-Bilanz
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-4 gap-3 text-center">
          <StatBox value={stats.gamesPlayed} label="Gespielt" />
          <StatBox value={`${winRate}%`} label="Gewonnen" />
          <StatBox value={currentStreak} label="Streak" />
          <StatBox value={bestStreak} label="Bester" />
        </div>

        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Verteilung der Versuche
          </p>
          {stats.guessDistribution.map((count, index) => {
            const width = count > 0 ? Math.max((count / maxDistribution) * 100, 8) : 8
            return (
              <div key={index} className="flex items-center gap-2">
                <span className="w-4 text-right text-sm font-semibold text-muted-foreground">
                  {index + 1}
                </span>
                <div
                  className="flex h-7 items-center justify-end rounded-lg bg-primary/80 px-2 text-xs font-bold text-primary-foreground transition-all duration-500"
                  style={{ width: `${width}%` }}
                >
                  {count}
                </div>
              </div>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function StatBox({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="rounded-2xl border border-border/30 bg-background/30 p-3">
      <p className="text-2xl font-black text-foreground">{value}</p>
      <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </p>
    </div>
  )
}

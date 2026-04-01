"use client"

import { Lock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface QuizHintsProps {
  activeHintCount: number
  year: number | null
  opponent: string | null
}

const HINT_LABELS = [
  "Jahr",
  "Line davor",
  "Gegner",
  "Line danach",
]

export function QuizHints({
  activeHintCount,
  year,
  opponent,
}: QuizHintsProps) {
  return (
    <Card className="border-border/40 bg-card/35 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="text-lg">Hinweise</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3" aria-live="polite">
        {HINT_LABELS.map((label, index) => {
          const isUnlocked = activeHintCount > index

          let content: React.ReactNode = (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground/50">
              <Lock className="h-3 w-3" />
              Gesperrt
            </p>
          )
          if (isUnlocked) {
            if (index === 0) {
              content = <p className="mt-1 text-base font-semibold text-foreground">{year ? String(year) : "Unbekannt"}</p>
            } else if (index === 1) {
              content = <p className="mt-1 text-base font-semibold text-foreground">Siehe Zitat-Karte</p>
            } else if (index === 2) {
              content = <p className="mt-1 text-base font-semibold text-foreground">{opponent || "Unbekannt"}</p>
            } else {
              content = <p className="mt-1 text-base font-semibold text-foreground">Siehe Zitat-Karte</p>
            }
          }

          return (
            <div
              key={label}
              className={`rounded-2xl border px-4 py-3 transition-all duration-300 ${
                isUnlocked
                  ? 'animate-hint-reveal border-primary/30 bg-primary/10'
                  : 'border-border/25 bg-background/25'
              }`}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Hinweis {index + 1} · {label}
              </p>
              {content}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

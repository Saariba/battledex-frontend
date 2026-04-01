"use client"

import { CheckCircle2, MessageSquareDashed, XCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface QuizHistoryProps {
  guesses: string[]
  correctRapperName: string | null
}

export function QuizHistory({ guesses, correctRapperName }: QuizHistoryProps) {
  return (
    <Card className="border-border/40 bg-card/35 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="text-lg">Versuchsverlauf</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2" aria-live="polite">
        {guesses.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-4 text-center">
            <MessageSquareDashed className="h-6 w-6 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground/60">Noch keine Versuche</p>
          </div>
        ) : (
          guesses.map((guess, index) => {
            const isCorrect = Boolean(correctRapperName) && guess === correctRapperName
            return (
              <div
                key={`${guess}-${index}`}
                className={`flex items-center justify-between rounded-2xl border px-4 py-3 ${
                  isCorrect
                    ? 'animate-pulse-success border-emerald-500/30 bg-emerald-500/10'
                    : 'animate-shake border-border/25 bg-background/25'
                }`}
              >
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    Versuch {index + 1}
                  </p>
                  <p className="text-base font-semibold text-foreground">{guess}</p>
                </div>
                {isCorrect ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                ) : (
                  <XCircle className="h-5 w-5 text-primary" />
                )}
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}

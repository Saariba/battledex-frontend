"use client"

import { Check, X } from "lucide-react"

interface GuessProgressProps {
  maxGuesses: number
  guesses: string[]
  correctRapperName: string | null
}

export function GuessProgress({
  maxGuesses,
  guesses,
  correctRapperName,
}: GuessProgressProps) {
  return (
    <div className="flex items-center gap-2" role="img" aria-label={`${guesses.length} von ${maxGuesses} Versuchen genutzt`}>
      {Array.from({ length: maxGuesses }, (_, i) => {
        const guess = guesses[i]
        if (!guess) {
          return (
            <div
              key={i}
              className="flex h-4 w-4 items-center justify-center rounded-full border border-border/40 bg-background/30"
            />
          )
        }
        const isCorrect = Boolean(correctRapperName) && guess === correctRapperName
        return (
          <div
            key={i}
            className={`flex h-4 w-4 items-center justify-center rounded-full ${
              isCorrect ? "bg-emerald-500 shadow-[0_0_6px_rgba(52,211,153,0.5)]" : "bg-primary shadow-[0_0_6px_rgba(239,68,68,0.4)]"
            }`}
          >
            {isCorrect ? (
              <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
            ) : (
              <X className="h-2.5 w-2.5 text-white" strokeWidth={3} />
            )}
          </div>
        )
      })}
    </div>
  )
}

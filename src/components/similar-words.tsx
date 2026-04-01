'use client'

import { SimilarWord } from '@/lib/api/types'

interface SimilarWordsProps {
  words: SimilarWord[]
  onWordClick: (word: string) => void
  isLoading?: boolean
}

export function SimilarWords({ words, onWordClick, isLoading }: SimilarWordsProps) {
  if (isLoading || words.length === 0) return null

  return (
    <div className="mt-4 rounded-2xl border border-border/40 bg-card/35 p-3 backdrop-blur-sm">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
        Verwandte Begriffe
      </p>
      <div className="flex flex-wrap gap-1.5">
      {words.map(({ word, count }) => (
        <button
          key={word}
          onClick={() => onWordClick(word)}
          className="rounded-full border border-border/30 bg-background/40 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all duration-300 hover:border-primary/40 hover:bg-primary hover:text-primary-foreground"
        >
          {word} <span className="opacity-50">({count})</span>
        </button>
      ))}
      </div>
    </div>
  )
}

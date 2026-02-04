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
    <div className="flex flex-wrap gap-1.5 mt-3">
      {words.map(({ word, count }) => (
        <button
          key={word}
          onClick={() => onWordClick(word)}
          className="px-2 py-1 rounded text-xs font-medium transition-all bg-card/50 text-muted-foreground hover:bg-primary hover:text-primary-foreground border border-border/30"
        >
          {word} <span className="opacity-50">({count})</span>
        </button>
      ))}
    </div>
  )
}

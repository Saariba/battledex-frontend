"use client"

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react"
import { Search, Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { QuizRapperSuggestion } from "@/lib/api/types"

interface QuizGuessInputProps {
  value: string
  selectedGuess: QuizRapperSuggestion | null
  suggestions: QuizRapperSuggestion[]
  disabled?: boolean
  canSubmit: boolean
  submissionInFlight?: boolean
  onValueChange: (value: string) => void
  onSelect: (suggestion: QuizRapperSuggestion) => void
  onSubmit: () => void
}

export function QuizGuessInput({
  value,
  selectedGuess,
  suggestions,
  disabled,
  canSubmit,
  submissionInFlight,
  onValueChange,
  onSelect,
  onSubmit,
}: QuizGuessInputProps) {
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const prevValueRef = useRef(value)

  useEffect(() => {
    if (prevValueRef.current !== "" && value === "" && !disabled) {
      inputRef.current?.focus()
    }
    prevValueRef.current = value
  }, [value, disabled])

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (canSubmit) {
      inputRef.current?.blur()
      onSubmit()
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (suggestions.length === 0) {
      setHighlightedIndex(-1)
      return
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault()
        setHighlightedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        )
        break
      case "ArrowUp":
        event.preventDefault()
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        )
        break
      case "Enter":
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          event.preventDefault()
          onSelect(suggestions[highlightedIndex])
          setHighlightedIndex(-1)
        }
        break
      case "Escape":
        event.preventDefault()
        setHighlightedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  const showSuggestions = !disabled && suggestions.length > 0

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="relative">
        <div className="absolute inset-y-0 left-4 flex items-center text-muted-foreground">
          <Search className="h-4 w-4" />
        </div>
        <Input
          ref={inputRef}
          value={value}
          onChange={(event) => {
            onValueChange(event.target.value)
            setHighlightedIndex(-1)
          }}
          onKeyDown={handleKeyDown}
          placeholder="Rapper eingeben..."
          disabled={disabled}
          className="h-12 rounded-2xl border-border/40 bg-background/50 pl-11 pr-36"
          role="combobox"
          aria-expanded={showSuggestions}
          aria-autocomplete="list"
          aria-controls={showSuggestions ? "rapper-suggestions" : undefined}
          aria-activedescendant={
            highlightedIndex >= 0 ? `suggestion-${highlightedIndex}` : undefined
          }
          autoComplete="off"
        />
        <div className="absolute inset-y-1.5 right-1.5">
          <Button
            type="submit"
            disabled={!canSubmit || disabled}
            className="h-full rounded-xl px-4"
          >
            {submissionInFlight ? "Wird geprüft..." : (
              <>
                Abschicken
                <kbd className="ml-1 hidden rounded border border-primary-foreground/20 bg-primary-foreground/10 px-1 py-0.5 font-mono text-[10px] leading-none sm:inline-block">
                  ↵
                </kbd>
              </>
            )}
          </Button>
        </div>
      </form>

      {selectedGuess && (
        <div
          className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary"
          role="status"
          aria-live="polite"
        >
          <Check className="h-3.5 w-3.5" />
          Ausgewählt: {selectedGuess.name}
        </div>
      )}

      {showSuggestions && (
        <div
          ref={listRef}
          id="rapper-suggestions"
          role="listbox"
          aria-label="Rapper-Vorschläge"
          className="max-h-60 overflow-y-auto rounded-2xl border border-border/40 bg-card/65 shadow-lg shadow-black/15 backdrop-blur-sm"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.id}
              id={`suggestion-${index}`}
              type="button"
              role="option"
              aria-selected={index === highlightedIndex}
              onClick={() => {
                onSelect(suggestion)
                setHighlightedIndex(-1)
              }}
              className={`flex w-full items-center justify-between border-b border-border/20 px-4 py-3.5 text-left text-sm transition-colors last:border-b-0 ${
                index === highlightedIndex
                  ? "bg-primary/15 text-primary"
                  : "hover:bg-primary/10 hover:text-primary"
              }`}
            >
              <span>{suggestion.name}</span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Wählen
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}


"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, FlaskConical } from "lucide-react"
import { useAutocomplete } from "@/hooks/use-autocomplete"

type SearchMode = 'keyword' | 'semantic'

interface SearchControlsProps {
  onSearch: (query: string, mode: 'semantic' | 'keyword' | 'hybrid') => void
  isLoading?: boolean
  value?: string
  onValueChange?: (value: string) => void
  inputRef?: React.RefObject<HTMLInputElement | null>
  compact?: boolean
  /** Hide the mode toggle (e.g. when shown in the active search console) */
  hideMode?: boolean
  /** Controlled search mode */
  searchMode?: SearchMode
  onSearchModeChange?: (mode: SearchMode) => void
}

function highlightMatch(text: unknown, query: unknown) {
  const safeText = typeof text === "string" ? text : String(text ?? "")
  const safeQuery = typeof query === "string" ? query : String(query ?? "")

  if (!safeQuery.trim()) return safeText
  const idx = safeText.toLowerCase().indexOf(safeQuery.toLowerCase())
  if (idx === -1) return safeText
  return (
    <>
      {safeText.slice(0, idx)}
      <span className="text-primary font-bold">{safeText.slice(idx, idx + safeQuery.length)}</span>
      {safeText.slice(idx + safeQuery.length)}
    </>
  )
}

export function SearchControls({ onSearch, isLoading, value, onValueChange, inputRef, compact = false, hideMode = false, searchMode: controlledMode, onSearchModeChange }: SearchControlsProps) {
  const [internalQuery, setInternalQuery] = useState("")
  const [internalMode, setInternalMode] = useState<SearchMode>('keyword')
  const [isFocused, setIsFocused] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const query = value !== undefined ? value : internalQuery
  const setQuery = onValueChange || setInternalQuery
  const mode = controlledMode ?? internalMode
  const setMode = onSearchModeChange ?? setInternalMode

  const {
    suggestions,
    isOpen,
    activeIndex,
    fetchSuggestions,
    close,
    moveUp,
    moveDown,
    getActiveSuggestion,
  } = useAutocomplete()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    close()
    if (!query.trim()) return
    onSearch(query, mode)
  }

  const handleSelect = (suggestion: string) => {
    setQuery(suggestion)
    close()
    onSearch(suggestion, mode)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        moveDown()
        break
      case 'ArrowUp':
        e.preventDefault()
        moveUp()
        break
      case 'Enter': {
        const active = getActiveSuggestion()
        if (active) {
          e.preventDefault()
          handleSelect(active)
        }
        break
      }
      case 'Escape':
        e.preventDefault()
        close()
        break
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setQuery(newValue)
    fetchSuggestions(newValue)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        close()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [close])

  return (
    <div className="w-full relative" ref={dropdownRef}>
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute inset-y-0 left-3 sm:left-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
          <Search className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <Input
          ref={inputRef}
          placeholder="Punchlines suchen..."
          className={`pl-10 sm:pl-12 pr-24 sm:pr-32 bg-card/70 border-border/50 rounded-2xl focus:ring-primary focus:border-primary transition-all duration-300 shadow-lg ${
            compact ? 'h-11 sm:h-12 text-sm sm:text-base' : 'h-12 sm:h-14 text-base sm:text-lg'
          }`}
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls="autocomplete-list"
          aria-activedescendant={activeIndex >= 0 ? `autocomplete-item-${activeIndex}` : undefined}
        />
        <div className="absolute inset-y-2 right-2 flex items-center">
          <Button
            type="submit"
            className={`h-full rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs sm:text-sm ${compact ? 'px-3 sm:px-4' : 'px-4 sm:px-6'}`}
            disabled={isLoading || !query.trim()}
          >
            {isLoading ? "Suche..." : compact ? "Suchen" : "Bars finden"}
          </Button>
        </div>
      </form>

      {/* Search mode toggle */}
      {!hideMode && (
        <div className="mt-2 flex items-center gap-1.5">
          {([
            { key: 'keyword' as const, label: 'Stichwort' },
            { key: 'semantic' as const, label: 'Semantisch' },
          ]).map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setMode(key)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                mode === key
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                  : 'border border-border/30 bg-background/35 text-muted-foreground hover:border-primary/40 hover:text-primary'
              }`}
            >
              {key === 'semantic' && <FlaskConical className="w-3 h-3" />}
              {label}
              {key === 'semantic' && (
                <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold leading-none ${
                  mode === 'semantic'
                    ? 'bg-primary-foreground/20 text-primary-foreground'
                    : 'bg-yellow-500/15 text-yellow-500'
                }`}>
                  Beta
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Autocomplete dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div
          id="autocomplete-list"
          role="listbox"
          className="absolute z-50 w-full mt-1 bg-card border border-border/50 rounded-xl shadow-xl overflow-hidden backdrop-blur-sm"
          style={{ maxWidth: dropdownRef.current?.offsetWidth }}
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion}-${index}`}
              id={`autocomplete-item-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              className={`w-full px-4 py-3 text-left text-sm font-mono flex items-center gap-3 transition-colors ${
                index === activeIndex
                  ? 'bg-primary/10 text-primary'
                  : 'text-foreground hover:bg-muted/50'
              }`}
              onMouseDown={(e) => {
                e.preventDefault()
                handleSelect(suggestion)
              }}
              onMouseEnter={() => {
                // We don't manage hover state since keyboard takes priority
              }}
            >
              <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <span>{highlightMatch(suggestion, query)}</span>
            </button>
          ))}
        </div>
      )}

    </div>
  )
}


"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { useAutocomplete } from "@/hooks/use-autocomplete"

interface SearchControlsProps {
  onSearch: (query: string, mode: 'semantic' | 'keyword') => void
  isLoading?: boolean
  value?: string
  onValueChange?: (value: string) => void
  inputRef?: React.RefObject<HTMLInputElement | null>
}

function highlightMatch(text: string, query: string) {
  if (!query.trim()) return text
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <span className="text-primary font-bold">{text.slice(idx, idx + query.length)}</span>
      {text.slice(idx + query.length)}
    </>
  )
}

export function SearchControls({ onSearch, isLoading, value, onValueChange, inputRef }: SearchControlsProps) {
  const [internalQuery, setInternalQuery] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const query = value !== undefined ? value : internalQuery
  const setQuery = onValueChange || setInternalQuery

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
    onSearch(query, 'semantic')
  }

  const handleSelect = (suggestion: string) => {
    setQuery(suggestion)
    close()
    onSearch(suggestion, 'semantic')
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
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
          <Search className="w-5 h-5" />
        </div>
        <Input
          ref={inputRef}
          placeholder="Search for punchlines (e.g. 'bars about boxing' or 'chess metaphors')"
          className="pl-12 h-14 bg-card/60 border-border/50 text-lg rounded-2xl focus:ring-primary focus:border-primary transition-all duration-300 shadow-lg"
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
            className="h-full px-6 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold"
            disabled={isLoading || !query.trim()}
          >
            {isLoading ? "Searching..." : "Find Bars"}
          </Button>
        </div>
      </form>

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
              key={suggestion}
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

      {!isFocused && !query && !isOpen && (
        <p className="text-xs text-muted-foreground mt-2 font-mono">
          Press <kbd className="px-1.5 py-0.5 rounded border border-border/60 bg-muted/50 text-[10px] font-semibold">/</kbd> to search
        </p>
      )}
    </div>
  )
}

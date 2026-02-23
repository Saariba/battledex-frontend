import { useState, useRef, useCallback, useEffect } from 'react'
import { searchService } from '@/lib/api/search'

export function useAutocomplete() {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastQueryRef = useRef('')

  const fetchSuggestions = useCallback((query: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (!query.trim() || query.trim().length < 2) {
      setSuggestions([])
      setIsOpen(false)
      setActiveIndex(-1)
      return
    }

    debounceRef.current = setTimeout(async () => {
      try {
        lastQueryRef.current = query
        const results = await searchService.autocomplete(query)
        // Only update if this is still the latest query
        if (lastQueryRef.current === query) {
          setSuggestions(results.slice(0, 8))
          setIsOpen(results.length > 0)
          setActiveIndex(-1)
        }
      } catch {
        // Silently fail
      }
    }, 300)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    setActiveIndex(-1)
  }, [])

  const moveUp = useCallback(() => {
    setActiveIndex(prev => (prev <= 0 ? suggestions.length - 1 : prev - 1))
  }, [suggestions.length])

  const moveDown = useCallback(() => {
    setActiveIndex(prev => (prev >= suggestions.length - 1 ? 0 : prev + 1))
  }, [suggestions.length])

  const getActiveSuggestion = useCallback(() => {
    if (activeIndex >= 0 && activeIndex < suggestions.length) {
      return suggestions[activeIndex]
    }
    return null
  }, [activeIndex, suggestions])

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  return {
    suggestions,
    isOpen,
    activeIndex,
    fetchSuggestions,
    close,
    moveUp,
    moveDown,
    getActiveSuggestion,
    setIsOpen,
  }
}

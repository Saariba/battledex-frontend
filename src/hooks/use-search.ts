/**
 * Custom React hook for search functionality
 * Encapsulates search state and API calls
 */

import { useState } from 'react'
import { toast } from 'sonner'
import type { SearchResult } from '@/lib/types'
import { searchService } from '@/lib/api/search'
import { ApiError } from '@/lib/api/types'

export function useSearch() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [currentQuery, setCurrentQuery] = useState('')

  const performSearch = async (
    query: string,
    mode: 'semantic' | 'keyword' = 'semantic'
  ) => {
    // Validate query
    if (!query.trim()) {
      toast.error('Please enter a search query')
      return
    }

    setIsLoading(true)
    setCurrentQuery(query)

    try {
      // Note: mode parameter is kept for UI compatibility
      // Backend always performs hybrid search
      const searchResults = await searchService.search(query, 100)

      setResults(searchResults)

      if (searchResults.length === 0) {
        // Don't show toast for empty results, let UI handle it
        console.log('No results found for query:', query)
      }
    } catch (error) {
      console.error('Search error:', error)

      // Handle specific error types
      if (error instanceof ApiError) {
        if (error.statusCode === 404) {
          toast.error('Search service unavailable')
        } else if (error.statusCode && error.statusCode >= 500) {
          toast.error('Server error occurred. Try again later')
        } else {
          toast.error(error.message)
        }
      } else if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          toast.error('Search timed out. Please try again')
        } else if (error.message.includes('Network')) {
          toast.error('Network error. Check your connection')
        } else {
          toast.error('An error occurred while searching')
        }
      } else {
        toast.error('Unexpected error occurred')
      }

      // Clear results on error
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    results,
    currentQuery,
    performSearch,
    setResults,
  }
}

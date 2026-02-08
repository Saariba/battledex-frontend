/**
 * Custom React hook for search functionality
 * Encapsulates search state and API calls
 */

import { useState } from 'react'
import { toast } from 'sonner'
import type { SearchResult } from '@/lib/types'
import { searchService } from '@/lib/api/search'
import { similarWordsService } from '@/lib/api/similar-words'
import { ApiError, type SimilarWord } from '@/lib/api/types'
import { searchCache, similarWordsCache, generateCacheKey } from '@/lib/cache'

export function useSearch() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [totalResults, setTotalResults] = useState(0)
  const [similarWords, setSimilarWords] = useState<SimilarWord[]>([])
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
      // Generate cache keys
      const searchKey = generateCacheKey('search', query, mode)
      const similarWordsKey = generateCacheKey('similar', query)

      // Try to get from cache first
      const cachedSearch = searchCache.get<{ results: SearchResult[], total: number }>(searchKey)
      const cachedSimilar = similarWordsCache.get<{ query: string, similar_words: SimilarWord[] }>(similarWordsKey)

      // If both cached, return immediately
      if (cachedSearch && cachedSimilar) {
        setResults(cachedSearch.results)
        setTotalResults(cachedSearch.total)
        setSimilarWords(cachedSimilar.similar_words)
        setIsLoading(false)
        return
      }

      // Fetch missing data (only if not cached)
      const promises: Promise<any>[] = []

      if (!cachedSearch) {
        promises.push(searchService.search(query, 500))
      } else {
        promises.push(Promise.resolve(cachedSearch))
      }

      if (!cachedSimilar) {
        promises.push(similarWordsService.getSimilarWords(query, 10).catch(() => ({
          query,
          similar_words: []
        })))
      } else {
        promises.push(Promise.resolve(cachedSimilar))
      }

      const [searchResults, similarWordsData] = await Promise.all(promises)

      // Cache the results (only if they weren't cached before)
      if (!cachedSearch) {
        searchCache.set(searchKey, searchResults)
      }
      if (!cachedSimilar) {
        similarWordsCache.set(similarWordsKey, similarWordsData)
      }

      setResults(searchResults.results)
      setTotalResults(searchResults.total)
      setSimilarWords(similarWordsData.similar_words)

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

      // Clear results and similar words on error
      setResults([])
      setTotalResults(0)
      setSimilarWords([])
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    results,
    totalResults,
    similarWords,
    currentQuery,
    performSearch,
    setResults,
  }
}

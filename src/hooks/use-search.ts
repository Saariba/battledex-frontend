/**
 * Custom React hook for search functionality
 * Encapsulates search state and API calls
 */

import { useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'
import type { SearchResult } from '@/lib/types'
import { searchService } from '@/lib/api/search'
import { similarWordsService } from '@/lib/api/similar-words'
import { ApiError, type SimilarWord } from '@/lib/api/types'
import { searchCache, similarWordsCache, generateCacheKey } from '@/lib/cache'

const PAGE_SIZE = 50

export function useSearch() {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [totalResults, setTotalResults] = useState(0)
  const [similarWords, setSimilarWords] = useState<SimilarWord[]>([])
  const [rapperCounts, setRapperCounts] = useState<Record<string, number>>({})
  const [currentQuery, setCurrentQuery] = useState('')
  const [hasMore, setHasMore] = useState(false)

  // Abort controller ref — used to cancel in-flight requests when a new search starts
  const abortControllerRef = useRef<AbortController | null>(null)
  const currentModeRef = useRef<'semantic' | 'keyword'>('semantic')
  const currentFilterRef = useRef<string | null>(null)

  const performSearch = useCallback(async (
    query: string,
    mode: 'semantic' | 'keyword' = 'semantic',
    rapperFilter?: string | null,
  ) => {
    // Validate query
    if (!query.trim()) {
      toast.error('Please enter a search query')
      return
    }

    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    const controller = new AbortController()
    abortControllerRef.current = controller

    setIsLoading(true)
    setCurrentQuery(query)

    const startTime = performance.now()

    try {
      currentModeRef.current = mode
      currentFilterRef.current = rapperFilter || null
      const filterObj = rapperFilter ? { rapper_name: rapperFilter } : undefined

      // Generate cache keys
      const searchKey = generateCacheKey('search', query, mode, rapperFilter || '')
      const similarWordsKey = generateCacheKey('similar', query)

      // Try to get from cache first
      const cachedSearch = searchCache.get<{ results: SearchResult[], total: number, rapperCounts: Record<string, number> }>(searchKey)
      const cachedSimilar = similarWordsCache.get<{ query: string, similar_words: SimilarWord[] }>(similarWordsKey)

      // If both cached, return immediately
      if (cachedSearch && cachedSimilar) {
        setResults(cachedSearch.results)
        setTotalResults(cachedSearch.total)
        setRapperCounts(cachedSearch.rapperCounts || {})
        setSimilarWords(cachedSimilar.similar_words)
        setIsLoading(false)
        return
      }

      // If search is cached but similar words is not, only fetch similar words
      if (cachedSearch) {
        setResults(cachedSearch.results)
        setTotalResults(cachedSearch.total)
        if (!rapperFilter) {
          setRapperCounts(cachedSearch.rapperCounts || {})
        }

        const similarWordsData = await similarWordsService.getSimilarWords(query, 10, controller.signal).catch(() => ({
          query,
          similar_words: [] as SimilarWord[],
        }))
        similarWordsCache.set(similarWordsKey, similarWordsData)
        setSimilarWords(similarWordsData.similar_words)
        setIsLoading(false)
        return
      }

      // Fetch search results and similar words in parallel using Promise.allSettled
      const searchPromise = (async () => {
        try {
          return await searchService.search(query, PAGE_SIZE, mode, filterObj, controller.signal)
        } catch (error) {
          const shouldFallback =
            mode === 'semantic' &&
            (error instanceof ApiError
              ? (error.statusCode === undefined || error.statusCode >= 500)
              : true)

          // Re-throw cancellations immediately
          if (error instanceof ApiError && error.message === 'Request was cancelled') {
            throw error
          }

          if (!shouldFallback) {
            throw error
          }

          const fallbackResult = await searchService.search(query, PAGE_SIZE, 'keyword', filterObj, controller.signal)
          toast.warning('Semantic search is temporarily unavailable. Showing keyword matches.')
          return fallbackResult
        }
      })()

      const similarPromise = cachedSimilar
        ? Promise.resolve(cachedSimilar)
        : similarWordsService.getSimilarWords(query, 10, controller.signal).catch(() => ({
            query,
            similar_words: [] as SimilarWord[],
          }))

      const [searchSettled, similarSettled] = await Promise.allSettled([
        searchPromise,
        similarPromise,
      ])

      // If the request was cancelled while in-flight, bail silently
      if (controller.signal.aborted) {
        return
      }

      // Handle search results (critical — if rejected, re-throw)
      if (searchSettled.status === 'rejected') {
        throw searchSettled.reason
      }

      const searchResults = searchSettled.value

      // Fire-and-forget analytics logging
      const responseTimeMs = Math.round(performance.now() - startTime)
      searchService.logSearchEvent({
        query,
        search_mode: mode,
        result_count: searchResults.total,
        response_time_ms: responseTimeMs,
      })

      if (!cachedSearch) {
        searchCache.set(searchKey, searchResults)
      }

      setResults(searchResults.results)
      setTotalResults(searchResults.total)
      setHasMore(searchResults.results.length < searchResults.total)
      // Only update rapper counts from unfiltered searches
      if (!rapperFilter) {
        setRapperCounts(searchResults.rapperCounts || {})
      }

      // Handle similar words (non-critical — use empty array on failure)
      const similarWordsData =
        similarSettled.status === 'fulfilled'
          ? similarSettled.value
          : { query, similar_words: [] as SimilarWord[] }

      if (!cachedSimilar) {
        similarWordsCache.set(similarWordsKey, similarWordsData)
      }

      setSimilarWords(similarWordsData.similar_words)
    } catch (error) {
      // Silently ignore cancelled requests (superseded by a newer search)
      if (
        error instanceof ApiError && error.message === 'Request was cancelled' ||
        controller.signal.aborted
      ) {
        return
      }

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
      setRapperCounts({})
      setSimilarWords([])
    } finally {
      // Only clear loading if this controller is still the active one
      if (abortControllerRef.current === controller) {
        setIsLoading(false)
      }
    }
  }, [])

  const loadMore = useCallback(async () => {
    if (!currentQuery || isLoadingMore || !hasMore) return

    setIsLoadingMore(true)
    try {
      const mode = currentModeRef.current
      const rapperFilter = currentFilterRef.current
      const filterObj = rapperFilter ? { rapper_name: rapperFilter } : undefined
      const backendMode = mode === 'keyword' ? 'text' : 'hybrid'

      const offset = results.length
      const response = await searchService.search(
        currentQuery, PAGE_SIZE, mode, filterObj, undefined, offset
      )

      setResults(prev => {
        const existingIds = new Set(prev.map(r => r.id))
        const newResults = response.results.filter(r => !existingIds.has(r.id))
        return [...prev, ...newResults]
      })
      setHasMore(offset + response.results.length < response.total)
    } catch (error) {
      console.error('Load more error:', error)
    } finally {
      setIsLoadingMore(false)
    }
  }, [currentQuery, isLoadingMore, hasMore, results.length])

  const resetSearch = useCallback(() => {
    // Cancel any in-flight request on reset
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setIsLoading(false)
    setIsLoadingMore(false)
    setResults([])
    setTotalResults(0)
    setHasMore(false)
    setSimilarWords([])
    setRapperCounts({})
    setCurrentQuery('')
  }, [])

  return {
    isLoading,
    isLoadingMore,
    results,
    totalResults,
    hasMore,
    rapperCounts,
    similarWords,
    currentQuery,
    performSearch,
    loadMore,
    resetSearch,
    setResults,
  }
}

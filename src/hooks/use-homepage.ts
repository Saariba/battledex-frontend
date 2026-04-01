import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { SearchResult } from "@/lib/types"
import { useSearch } from "@/hooks/use-search"
import { searchService } from "@/lib/api/search"

const RECENT_SEARCHES_KEY = 'battledex_recent_searches'
const MAX_RECENT = 5
const TOP_RAPPERS_COUNT = 5

function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveRecentSearch(query: string) {
  try {
    const recent = getRecentSearches().filter(q => q !== query)
    recent.unshift(query)
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)))
  } catch {
    // Silently fail
  }
}

function removeRecentSearch(query: string) {
  try {
    const recent = getRecentSearches().filter(q => q !== query)
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent))
  } catch {
    // Silently fail
  }
}

export function useHomepage() {
  const [resultTypeFilter, setResultTypeFilter] = useState<'all' | 'keyword' | 'semantic'>('all')
  const [selectedVideo, setSelectedVideo] = useState<SearchResult | null>(null)
  const [correctionResult, setCorrectionResult] = useState<SearchResult | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [selectedRapper, setSelectedRapper] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [copiedSearchLink, setCopiedSearchLink] = useState(false)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isLoading, isLoadingMore, results, totalResults, hasMore: searchHasMore, rapperCounts: backendRapperCounts, similarWords, currentQuery, performSearch, loadMore, resetSearch } = useSearch()
  const hasRunInitialSearch = useRef(false)
  const [featuredBars, setFeaturedBars] = useState<SearchResult[]>([])
  const [featuredLoading, setFeaturedLoading] = useState(true)
  const [isShuffling, setIsShuffling] = useState(false)
  const [popularQueries, setPopularQueries] = useState<{ query: string, count: number }[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [trendingRappers, setTrendingRappers] = useState<{ name: string, search_count: number, battle_count: number }[]>([])

  const loadFeaturedBars = useCallback(async () => {
    try {
      setIsShuffling(true)
      const lines = await searchService.getRandomLines(5)
      setFeaturedBars(lines)
    } catch {
      // Silently fail - featured bars are non-critical
    } finally {
      setFeaturedLoading(false)
      setIsShuffling(false)
    }
  }, [])

  useEffect(() => {
    loadFeaturedBars()
    searchService.getPopularQueries(8).then(setPopularQueries).catch(() => {})
    searchService.getTrendingRappers(6).then(setTrendingRappers).catch(() => {})
    setRecentSearches(getRecentSearches())
  }, [loadFeaturedBars])

  const handleSimilarWordClick = useCallback((word: string) => {
    setSearchQuery(word)
    router.push(`?q=${encodeURIComponent(word)}`, { scroll: false })
    performSearch(word, 'semantic')
  }, [router, performSearch])

  useEffect(() => {
    const q = searchParams.get("q")
    if (q) {
      if (!hasRunInitialSearch.current || q !== currentQuery) {
        hasRunInitialSearch.current = true
        setSearchQuery(q)
        performSearch(q, "semantic")
      }
    } else {
      hasRunInitialSearch.current = false
      setSearchQuery("")
      setSelectedRapper(null)
      resetSearch()
    }
  }, [searchParams, performSearch, currentQuery, resetSearch])

  useEffect(() => {
    if (currentQuery) {
      document.title = `${currentQuery} - BattleDex`
    } else {
      document.title = "BattleDex"
    }
    return () => { document.title = "BattleDex" }
  }, [currentQuery])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  const handleSearch = useCallback((query: string, mode: 'semantic' | 'keyword') => {
    setSelectedRapper(null)
    router.push(`?q=${encodeURIComponent(query)}`, { scroll: false })
    performSearch(query, mode)
    if (query.trim()) {
      saveRecentSearch(query.trim())
      setRecentSearches(getRecentSearches())
    }
  }, [router, performSearch])

  const handleRapperFilter = useCallback((rapperName: string | null) => {
    setSelectedRapper(rapperName)
    if (currentQuery) {
      performSearch(currentQuery, 'semantic', rapperName)
    }
  }, [currentQuery, performSearch])

  const handleCopySearchLink = useCallback(async () => {
    if (typeof window === 'undefined' || !currentQuery) return

    const url = `${window.location.origin}/?q=${encodeURIComponent(currentQuery)}`

    try {
      await navigator.clipboard.writeText(url)
      setCopiedSearchLink(true)
      window.setTimeout(() => setCopiedSearchLink(false), 1800)
    } catch {
      setCopiedSearchLink(false)
    }
  }, [currentQuery])

  const handleRemoveRecentSearch = useCallback((query: string) => {
    removeRecentSearch(query)
    setRecentSearches(getRecentSearches())
  }, [])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    setResultTypeFilter('all')
    setCopiedSearchLink(false)
  }, [currentQuery, selectedRapper])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && !isLoadingMore) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => observer.disconnect()
  }, [isLoading, isLoadingMore, loadMore])

  const filteredResults = useMemo(() => {
    if (resultTypeFilter === 'all') {
      return results
    }

    return results.filter((result) =>
      resultTypeFilter === 'keyword'
        ? result.type === 'exact'
        : result.type === 'semantic'
    )
  }, [resultTypeFilter, results])

  const displayedResults = filteredResults
  const hasMore = searchHasMore
  const hasActiveSearch = Boolean(currentQuery || isLoading)

  const rapperCounts = useMemo(() => {
    return Object.entries(backendRapperCounts)
      .filter(([name]) => name.trim().toUpperCase() !== 'HOST')
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  }, [backendRapperCounts])

  const topRappers = rapperCounts.slice(0, TOP_RAPPERS_COUNT)
  const remainingRappers = rapperCounts.slice(TOP_RAPPERS_COUNT)

  return {
    // State
    resultTypeFilter,
    setResultTypeFilter,
    selectedVideo,
    setSelectedVideo,
    correctionResult,
    setCorrectionResult,
    isMounted,
    selectedRapper,
    searchQuery,
    setSearchQuery,
    copiedSearchLink,
    loadMoreRef,
    searchInputRef,
    isLoading,
    isLoadingMore,
    results,
    totalResults,
    similarWords,
    currentQuery,
    featuredBars,
    featuredLoading,
    isShuffling,
    popularQueries,
    recentSearches,
    trendingRappers,

    // Derived
    filteredResults,
    displayedResults,
    hasMore,
    hasActiveSearch,
    rapperCounts,
    topRappers,
    remainingRappers,

    // Handlers
    handleSearch,
    handleRapperFilter,
    handleCopySearchLink,
    handleSimilarWordClick,
    handleRemoveRecentSearch,
    loadFeaturedBars,
  }
}

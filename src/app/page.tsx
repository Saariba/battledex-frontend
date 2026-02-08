"use client"

import React, { Suspense, useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { SearchControls } from "@/components/search-controls"
import { SimilarWords } from "@/components/similar-words"
import { PunchlineCard } from "@/components/punchline-card"
import { PunchlineCardSkeleton } from "@/components/punchline-card-skeleton"
import { VideoModal } from "@/components/video-modal"
import { CorrectionModal } from "@/components/correction-modal"
import { RapperFilterDropdown } from "@/components/rapper-filter-dropdown"
import { SearchResult } from "@/lib/types"
import { useSearch } from "@/hooks/use-search"
import { Search, ExternalLink } from "lucide-react"

export default function RapBattleApp() {
  return (
    <Suspense>
      <RapBattleAppInner />
    </Suspense>
  )
}

function RapBattleAppInner() {
  const [selectedVideo, setSelectedVideo] = useState<SearchResult | null>(null)
  const [correctionResult, setCorrectionResult] = useState<SearchResult | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [selectedRapper, setSelectedRapper] = useState<string | null>(null)
  const [displayCount, setDisplayCount] = useState(25)
  const [searchQuery, setSearchQuery] = useState("")
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isLoading, results, totalResults, rapperCounts: backendRapperCounts, similarWords, currentQuery, performSearch } = useSearch()
  const hasRunInitialSearch = useRef(false)

  const handleSimilarWordClick = (word: string) => {
    setSearchQuery(word)
    router.push(`?q=${encodeURIComponent(word)}`, { scroll: false })
    performSearch(word, 'semantic')
  }

  // Sync URL query param to state and auto-trigger search on load
  useEffect(() => {
    const q = searchParams.get("q")
    if (q && !hasRunInitialSearch.current) {
      hasRunInitialSearch.current = true
      setSearchQuery(q)
      performSearch(q, "semantic")
    }
  }, [searchParams, performSearch])

  // Update document.title based on search state
  useEffect(() => {
    if (currentQuery) {
      document.title = `${currentQuery} - BattleDex`
    } else {
      document.title = "BattleDex"
    }
    return () => { document.title = "BattleDex" }
  }, [currentQuery])

  // Keyboard shortcut: "/" to focus search input
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

  // Wrap performSearch to also update URL
  const handleSearch = useCallback((query: string, mode: 'semantic' | 'keyword') => {
    setSelectedRapper(null)
    router.push(`?q=${encodeURIComponent(query)}`, { scroll: false })
    performSearch(query, mode)
  }, [router, performSearch])

  // Handle rapper filter: re-fetch from backend with filter applied
  const handleRapperFilter = useCallback((rapperName: string | null) => {
    setSelectedRapper(rapperName)
    if (currentQuery) {
      performSearch(currentQuery, 'semantic', rapperName)
    }
  }, [currentQuery, performSearch])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Reset display count when results change
  useEffect(() => {
    setDisplayCount(25)
  }, [results])

  // Infinite scroll: load more results when scrolling near bottom
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          setDisplayCount(prev => prev + 25)
        }
      },
      { threshold: 0.1 }
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => observer.disconnect()
  }, [isLoading])

  // Slice results for progressive rendering
  const displayedResults = results.slice(0, displayCount)
  const hasMore = displayCount < results.length

  // Get rapper counts from backend (accurate across all matches, not just loaded results)
  const rapperCounts = React.useMemo(() => {
    return Object.entries(backendRapperCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  }, [backendRapperCounts])

  // Split rappers into top N and rest
  const TOP_RAPPERS_COUNT = 5
  const topRappers = rapperCounts.slice(0, TOP_RAPPERS_COUNT)
  const remainingRappers = rapperCounts.slice(TOP_RAPPERS_COUNT)

  if (!isMounted) return null

  return (
    <>
      <main className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="max-w-5xl mx-auto space-y-12">
          <section className="text-center space-y-6 py-10">
            <h2 className="text-5xl md:text-7xl font-black font-headline tracking-tight max-w-4xl mx-auto leading-none">
              SEARCH FOR THE <span className="text-primary underline decoration-primary/30 underline-offset-8">HARDEST BARS</span> IN BATTLE RAP
            </h2>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto font-mono">
              Neural database indexing bars by meaning, context, and style.
            </p>
            <div className="pt-6">
              <SearchControls
                onSearch={handleSearch}
                isLoading={isLoading}
                value={searchQuery}
                onValueChange={setSearchQuery}
                inputRef={searchInputRef}
              />
              {!isLoading && currentQuery && (
                <SimilarWords
                  words={similarWords.slice(0, 3)}
                  onWordClick={handleSimilarWordClick}
                  isLoading={isLoading}
                />
              )}
            </div>
          </section>

          {(currentQuery || isLoading) && (
          <section className="space-y-8">
            <div className="border-b border-border/40 pb-6 bg-card/20 rounded-t-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold font-headline flex items-center gap-2">
                    <span className="text-primary">#</span>
                    {totalResults} Results Found
                    {selectedRapper && (
                      <span className="text-base font-normal text-muted-foreground">
                        • Filtered by {selectedRapper}
                      </span>
                    )}
                  </h3>
                  {results.length < totalResults && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Showing {results.length} of {totalResults} results
                    </p>
                  )}
                </div>
              </div>

              {results.length > 0 && (
                <>

                  {rapperCounts.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                          Filter by Rapper
                        </h4>
                        {selectedRapper && (
                          <button
                            onClick={() => handleRapperFilter(null)}
                            className="text-xs text-primary hover:text-primary/80 font-semibold"
                          >
                            Clear
                          </button>
                        )}
                      </div>

                      <div className="space-y-2">
                        {/* Top rappers as buttons */}
                        <div className="flex flex-wrap gap-2">
                          {topRappers.map(({ name, count }) => (
                            <div key={name} className="flex items-center gap-1">
                              <button
                                onClick={() => handleRapperFilter(selectedRapper === name ? null : name)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                                  selectedRapper === name
                                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-105'
                                    : 'bg-card/50 text-foreground hover:bg-card hover:scale-102 border border-border/30'
                                }`}
                              >
                                {name} ({count})
                              </button>
                              <Link
                                href={`/rappers/${encodeURIComponent(name)}`}
                                className="text-muted-foreground/40 hover:text-primary transition-colors p-1"
                                title={`View ${name}'s profile`}
                              >
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                            </div>
                          ))}

                          {/* Dropdown for remaining rappers */}
                          {remainingRappers.length > 0 && (
                            <RapperFilterDropdown
                              rappers={remainingRappers}
                              selectedRapper={selectedRapper}
                              onSelect={(name) => handleRapperFilter(selectedRapper === name ? null : name)}
                            />
                          )}
                        </div>

                        {/* Show which rapper is selected from dropdown */}
                        {selectedRapper && !topRappers.find(r => r.name === selectedRapper) && (
                          <div className="text-xs text-muted-foreground">
                            Filtered by: <span className="font-semibold text-primary">{selectedRapper}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {[1, 2, 3, 4].map(i => (
                  <PunchlineCardSkeleton key={i} />
                ))}
              </div>
            ) : results.length > 0 ? (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {displayedResults.map((result) => (
                    <PunchlineCard
                      key={result.id}
                      result={result}
                      searchQuery={currentQuery}
                      onPlayVideo={setSelectedVideo}
                      onRapperClick={(rapperName) => handleRapperFilter(rapperName)}
                      onCorrection={(result) => setCorrectionResult(result)}
                    />
                  ))}
                </div>
                {hasMore && (
                  <div ref={loadMoreRef} className="py-8 text-center">
                    <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent shadow-lg shadow-primary/20"></div>
                    <p className="mt-3 text-sm text-muted-foreground font-medium">Loading more results...</p>
                  </div>
                )}
                {!hasMore && results.length > 25 && (
                  <div className="py-8 text-center">
                    <p className="text-sm text-muted-foreground">
                      Showing all {results.length} results
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-24 bg-card/20 rounded-3xl border border-dashed border-border/40 backdrop-blur-sm">
                <div className="bg-secondary/20 p-8 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-6">
                  <Search className="w-16 h-16 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-muted-foreground">No bars matched your search.</h3>
                <p className="text-muted-foreground max-w-sm mx-auto mt-3">
                  Try searching for broader terms like "boxing" or "animal" or check your spelling.
                </p>
              </div>
            )}
          </section>
          )}
        </div>
      </main>

      <VideoModal
        result={selectedVideo}
        searchQuery={currentQuery}
        onClose={() => setSelectedVideo(null)}
        onCorrection={(result) => {
          setSelectedVideo(null)
          setCorrectionResult(result)
        }}
      />
      <CorrectionModal result={correctionResult} onClose={() => setCorrectionResult(null)} />
    </>
  )
}

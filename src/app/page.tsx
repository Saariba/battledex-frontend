"use client"

import React, { useState, useEffect } from "react"
import { SearchControls } from "@/components/search-controls"
import { PunchlineCard } from "@/components/punchline-card"
import { VideoModal } from "@/components/video-modal"
import { CorrectionModal } from "@/components/correction-modal"
import { SearchResult } from "@/lib/types"
import { useSearch } from "@/hooks/use-search"
import { Search } from "lucide-react"

type ResultTab = 'exact' | 'semantic'

export default function RapBattleApp() {
  const [selectedVideo, setSelectedVideo] = useState<SearchResult | null>(null)
  const [correctionResult, setCorrectionResult] = useState<SearchResult | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<ResultTab>('exact')
  const [selectedRapper, setSelectedRapper] = useState<string | null>(null)
  const [displayCount, setDisplayCount] = useState(20) // Number of results to display
  const loadMoreRef = React.useRef<HTMLDivElement>(null)
  const { isLoading, results, currentQuery, performSearch } = useSearch()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Reset tab and rapper filter when new results come in
  useEffect(() => {
    setActiveTab('exact')
    setSelectedRapper(null)
    setDisplayCount(20) // Reset display count on new search
  }, [results])

  // Infinite scroll: load more results when scrolling near bottom
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          setDisplayCount(prev => prev + 20)
        }
      },
      { threshold: 0.1 }
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => observer.disconnect()
  }, [isLoading])

  // Count results by type from ALL results (so tabs don't disappear)
  const semanticCount = results.filter(r => r.type === 'semantic').length
  const exactCount = results.filter(r => r.type === 'exact').length

  // Filter by tab first
  const tabFilteredResults = results.filter(r => r.type === activeTab)

  // Then filter by rapper if selected
  const filteredResults = selectedRapper
    ? tabFilteredResults.filter(r => r.rapper.name === selectedRapper)
    : tabFilteredResults

  // Slice results for progressive rendering
  const displayedResults = filteredResults.slice(0, displayCount)
  const hasMore = displayCount < filteredResults.length

  // Get rapper counts from current tab-filtered results
  const rapperCounts = React.useMemo(() => {
    const counts = new Map<string, number>()
    tabFilteredResults.forEach(result => {
      const name = result.rapper.name
      counts.set(name, (counts.get(name) || 0) + 1)
    })
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count) // Sort by count descending
  }, [tabFilteredResults])

  if (!isMounted) return null

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      <header className="h-20 flex items-center px-6 md:px-10 border-b border-border/20 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <img
            src="/battledex-logo.png"
            alt="BattleDex"
            className="h-12 w-auto object-contain"
          />
        </div>
      </header>

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
              <SearchControls onSearch={performSearch} isLoading={isLoading} />
            </div>
          </section>

          <section className="space-y-8">
            <div className="border-b border-border/40 pb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold font-headline flex items-center gap-2">
                  <span className="text-primary">#</span>
                  {results.length} Results Found
                  {selectedRapper && (
                    <span className="text-base font-normal text-muted-foreground">
                      • Filtered by {selectedRapper}
                    </span>
                  )}
                </h3>
              </div>

              {results.length > 0 && (
                <>
                  <div className="flex gap-2 mb-4">
                    {exactCount > 0 && (
                      <button
                        onClick={() => setActiveTab('exact')}
                        className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-1.5 ${
                          activeTab === 'exact'
                            ? 'bg-accent text-accent-foreground'
                            : 'bg-card/50 text-muted-foreground hover:bg-card hover:text-foreground'
                        }`}
                      >
                        🔍 Keyword ({exactCount})
                      </button>
                    )}

                    {semanticCount > 0 && (
                      <button
                        onClick={() => setActiveTab('semantic')}
                        className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-1.5 ${
                          activeTab === 'semantic'
                            ? 'bg-purple-600 text-white'
                            : 'bg-card/50 text-muted-foreground hover:bg-card hover:text-foreground'
                        }`}
                      >
                        🧠 Semantic ({semanticCount})
                      </button>
                    )}
                  </div>

                  {rapperCounts.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                          Filter by Rapper
                        </h4>
                        {selectedRapper && (
                          <button
                            onClick={() => setSelectedRapper(null)}
                            className="text-xs text-primary hover:text-primary/80 font-semibold"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {rapperCounts.map(({ name, count }) => (
                          <button
                            key={name}
                            onClick={() => setSelectedRapper(selectedRapper === name ? null : name)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                              selectedRapper === name
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-card/50 text-foreground hover:bg-card border border-border/30'
                            }`}
                          >
                            {name} ({count})
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 opacity-50">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-64 rounded-2xl bg-card/50 animate-pulse border border-border/20" />
                ))}
              </div>
            ) : filteredResults.length > 0 ? (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" key={`results-${activeTab}`}>
                  {displayedResults.map((result) => (
                    <PunchlineCard
                      key={result.id}
                      result={result}
                      searchQuery={currentQuery}
                      onPlayVideo={setSelectedVideo}
                      onRapperClick={(rapperName) => setSelectedRapper(rapperName)}
                      onCorrection={(result) => setCorrectionResult(result)}
                    />
                  ))}
                </div>
                {hasMore && (
                  <div ref={loadMoreRef} className="py-8 text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Loading more results...</p>
                  </div>
                )}
                {!hasMore && filteredResults.length > 20 && (
                  <div className="py-8 text-center">
                    <p className="text-sm text-muted-foreground">
                      Showing all {filteredResults.length} results
                    </p>
                  </div>
                )}
              </>
            ) : results.length > 0 ? (
              <div className="text-center py-24 bg-card/20 rounded-3xl border border-dashed border-border/40 backdrop-blur-sm">
                <div className="bg-secondary/20 p-8 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                  <Search className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-muted-foreground">
                  No {activeTab === 'exact' ? 'keyword' : 'semantic'} results.
                </h3>
                <p className="text-muted-foreground max-w-sm mx-auto mt-3">
                  Try switching to a different tab to see other results.
                </p>
              </div>
            ) : (
              <div className="text-center py-24 bg-card/20 rounded-3xl border border-dashed border-border/40 backdrop-blur-sm">
                <div className="bg-secondary/20 p-8 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                  <Search className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-muted-foreground">No bars matched your search.</h3>
                <p className="text-muted-foreground max-w-sm mx-auto mt-3">
                  Try searching for broader terms like "boxing" or "animal" or check your spelling.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>

      <footer className="p-8 text-center border-t border-border/20 text-muted-foreground text-[10px] font-mono uppercase tracking-[0.2em]">
        BATTLEDEX • Neural Punchline Database
      </footer>

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
    </div>
  )
}

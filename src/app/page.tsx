"use client"

import React, { Suspense, useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { SearchControls } from "@/components/search-controls"
import { SimilarWords } from "@/components/similar-words"
import { PunchlineCard } from "@/components/punchline-card"
import { PunchlineCardSkeleton } from "@/components/punchline-card-skeleton"
import { RapperFilterDropdown } from "@/components/rapper-filter-dropdown"
import { EmptyState } from "@/components/empty-state"

const VideoModal = dynamic(() => import('@/components/video-modal').then(m => ({ default: m.VideoModal })), { ssr: false })
const CorrectionModal = dynamic(() => import('@/components/correction-modal').then(m => ({ default: m.CorrectionModal })), { ssr: false })
import { useHomepage, type SortOption } from "@/hooks/use-homepage"
import { Search, Shuffle, X, Copy, Check, FlaskConical, SlidersHorizontal, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"

const SEMANTIC_BETA_DISMISSED_KEY = 'battledex_semantic_beta_dismissed'

const EXAMPLE_SEARCHES = [
  "Tiervergleiche",
  "Mutter-Angle",
  "Boxen",
  "Wortspiel",
  "Essen",
]

export default function RapBattleApp() {
  return (
    <Suspense>
      <RapBattleAppInner />
    </Suspense>
  )
}

function RapBattleAppInner() {
  const {
    sortBy,
    setSortBy,
    resultTypeFilter,
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
    results,
    totalResults,
    similarWords,
    currentQuery,
    featuredBars,
    featuredLoading,
    isShuffling,
    recentSearches,
    filteredResults,
    displayedResults,
    hasMore,
    hasActiveSearch,
    rapperCounts,
    topRappers,
    remainingRappers,
    handleSearch,
    handleRapperFilter,
    handleResultTypeFilter,
    handleCopySearchLink,
    handleSimilarWordClick,
    handleRemoveRecentSearch,
    loadFeaturedBars,
  } = useHomepage()

  const [showRapperFilter, setShowRapperFilter] = useState(false)
  const [semanticBetaDismissed, setSemanticBetaDismissed] = useState(true) // default true to avoid flash
  useEffect(() => {
    try {
      setSemanticBetaDismissed(localStorage.getItem(SEMANTIC_BETA_DISMISSED_KEY) === 'true')
    } catch { /* ignore */ }
  }, [])
  const dismissSemanticBeta = () => {
    setSemanticBetaDismissed(true)
    try { localStorage.setItem(SEMANTIC_BETA_DISMISSED_KEY, 'true') } catch { /* ignore */ }
  }

  if (!isMounted) return null

  return (
    <>
      <main className="relative flex-1 overflow-x-hidden px-3 py-4 sm:px-4 sm:py-6 md:px-8 md:py-10">
        <div className="relative mx-auto flex max-w-6xl flex-col gap-8">
          {hasActiveSearch ? (
            <section className="sticky top-14 sm:top-4 z-20 overflow-hidden rounded-2xl sm:rounded-3xl border border-border/50 bg-background/90 p-3 backdrop-blur-xl sm:p-4 md:p-5">
              <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-lg font-black tracking-tight sm:text-2xl md:text-3xl">
                    {currentQuery ? `„${currentQuery}"` : "Punchlines durchsuchen"}
                  </h2>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {!isLoading && totalResults > 0
                      ? `${totalResults.toLocaleString()} Treffer`
                      : 'Suche nach Stichwörtern oder wechsle zur semantischen Suche.'}
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopySearchLink}
                  disabled={!currentQuery}
                  className="gap-2 self-start text-muted-foreground"
                >
                  {copiedSearchLink ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedSearchLink ? "Kopiert" : "Link kopieren"}
                </Button>
              </div>

              <SearchControls
                onSearch={handleSearch}
                isLoading={isLoading}
                value={searchQuery}
                onValueChange={setSearchQuery}
                inputRef={searchInputRef}
                compact
                hideMode
              />

              {!isLoading && currentQuery && (
                <SimilarWords
                  words={similarWords.slice(0, 4)}
                  onWordClick={handleSimilarWordClick}
                  isLoading={isLoading}
                />
              )}
            </section>
          ) : (
            <section className="space-y-8 px-1 py-8 sm:py-12 md:py-16">
              <div className="space-y-5">
                <h1 className="max-w-3xl text-3xl font-black leading-[0.95] tracking-tight sm:text-5xl md:text-6xl">
                  Finde jede <span className="text-primary">Punchline</span>
                </h1>
                <p className="max-w-xl text-muted-foreground sm:text-lg">
                  Durchsuche deutsches Battlerap nach Angle, Inhalt und Sprache — auch wenn du den genauen Wortlaut nicht kennst.
                </p>
              </div>

              <div className="max-w-2xl space-y-4">
                <SearchControls
                  onSearch={handleSearch}
                  isLoading={isLoading}
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                  inputRef={searchInputRef}
                />

                {!currentQuery && !isLoading && recentSearches.length === 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted-foreground/60">z.B.</span>
                    {EXAMPLE_SEARCHES.map((q) => (
                      <button
                        key={q}
                        onClick={() => {
                          setSearchQuery(q)
                          handleSearch(q, 'keyword')
                        }}
                        className="rounded-full border border-border/30 px-3 py-1 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}

                {!currentQuery && !isLoading && recentSearches.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted-foreground/60">Zuletzt</span>
                    {recentSearches.map((q) => (
                      <span
                        key={q}
                        className="inline-flex items-center gap-1 rounded-full border border-border/30 px-3 py-1 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary focus-within:ring-2 focus-within:ring-primary"
                      >
                        <button
                          onClick={() => {
                            setSearchQuery(q)
                            handleSearch(q, 'keyword')
                          }}
                        >
                          {q}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveRecentSearch(q)
                          }}
                          className="ml-0.5 text-muted-foreground/50 hover:text-foreground"
                          aria-label={`Suche „${q}" entfernen`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          {!hasActiveSearch && (
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">
                  Zufällige Bars
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadFeaturedBars}
                  disabled={isShuffling}
                  className="gap-2 rounded-full border-border/50 bg-background/40"
                >
                  <Shuffle className={`h-4 w-4 ${isShuffling ? 'animate-spin' : ''}`} />
                  Neue Bars
                </Button>
              </div>

              {featuredLoading ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <PunchlineCardSkeleton key={i} />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {featuredBars.map((result) => (
                    <PunchlineCard
                      key={result.id}
                      result={result}
                      searchQuery=""
                      onPlayVideo={setSelectedVideo}

                      onCorrection={(result) => setCorrectionResult(result)}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {hasActiveSearch && (
            <section className="space-y-6">
              <div className="rounded-2xl border border-border/30 bg-card/30 p-4">
                <div className="mb-3 text-xs font-medium text-muted-foreground">Filter & Sortierung</div>

                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: 'keyword', label: 'Stichwort' },
                      { key: 'semantic', label: 'Semantisch' },
                    ].map(({ key, label }) => (
                      <button
                        key={key}
                        onClick={() => handleResultTypeFilter(key as 'keyword' | 'semantic')}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 inline-flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                          resultTypeFilter === key
                            ? 'bg-primary text-primary-foreground '
                            : 'border border-border/30 bg-background/35 text-foreground hover:border-primary/40 hover:text-primary'
                        }`}
                      >
                        {label}
                        {key === 'semantic' && (
                          <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none ${
                            resultTypeFilter === 'semantic'
                              ? 'bg-primary-foreground/20 text-primary-foreground'
                              : 'bg-yellow-500/15 text-yellow-500'
                          }`}>
                            <FlaskConical className="w-2.5 h-2.5" />
                            Beta
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {resultTypeFilter === 'semantic' && !semanticBetaDismissed && (
                    <div className="flex items-start gap-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-4 py-3">
                      <FlaskConical className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-muted-foreground flex-1">
                        <span className="font-semibold text-yellow-500">Semantische Suche (Beta)</span> — Ergebnisse basieren auf KI-Embeddings und werden laufend verbessert. Für exakte Treffer nutze die Stichwort-Suche.
                      </p>
                      <button
                        onClick={dismissSemanticBeta}
                        className="text-muted-foreground/50 hover:text-foreground transition-colors flex-shrink-0"
                        aria-label="Hinweis schließen"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted-foreground/60 mr-1">
                      Sortierung
                    </span>
                    {([
                      { key: 'relevance', label: 'Relevanz' },
                      { key: 'views', label: 'Views' },
                      { key: 'rapper', label: 'Rapper (A-Z)' },
                    ] as const).map(({ key, label }) => (
                      <button
                        key={key}
                        onClick={() => setSortBy(key)}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                          sortBy === key
                            ? 'bg-primary text-primary-foreground '
                            : 'border border-border/30 bg-background/35 text-foreground hover:border-primary/40 hover:text-primary'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  {rapperCounts.length > 0 && (
                    <div className="space-y-3">
                      <button
                        onClick={() => setShowRapperFilter(!showRapperFilter)}
                        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                          showRapperFilter || selectedRapper
                            ? 'border border-primary/30 bg-primary/10 text-primary'
                            : 'border border-border/30 bg-background/35 text-foreground hover:border-primary/40 hover:text-primary'
                        }`}
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        Rapper filtern
                        {selectedRapper && (
                          <span className="rounded-full bg-primary text-primary-foreground px-2 py-0.5 text-[10px] font-bold">
                            {selectedRapper}
                          </span>
                        )}
                      </button>
                      {showRapperFilter && (
                        <div className="flex flex-wrap gap-2 animate-in slide-in-from-top-2 duration-200">
                          {topRappers.map(({ name }) => (
                            <button
                              key={name}
                              onClick={() => handleRapperFilter(selectedRapper === name ? null : name)}
                              className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                                selectedRapper === name
                                  ? 'bg-primary text-primary-foreground '
                                  : 'border border-border/30 bg-background/35 text-foreground hover:border-primary/40 hover:text-primary'
                              }`}
                            >
                              {name}
                            </button>
                          ))}

                          {remainingRappers.length > 0 && (
                            <RapperFilterDropdown
                              rappers={remainingRappers}
                              selectedRapper={selectedRapper}
                              onSelect={(name) => handleRapperFilter(selectedRapper === name ? null : name)}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {[1, 2, 3, 4].map(i => (
                    <PunchlineCardSkeleton key={i} />
                  ))}
                </div>
              ) : filteredResults.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {displayedResults.map((result) => (
                      <PunchlineCard
                        key={result.id}
                        result={result}
                        searchQuery={currentQuery}
                        onPlayVideo={setSelectedVideo}

                        onCorrection={(result) => setCorrectionResult(result)}
                      />
                    ))}
                  </div>

                  {hasMore && (
                    <div ref={loadMoreRef} className="py-8 text-center">
                      <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent shadow-lg shadow-primary/20" />
                      <p className="mt-3 text-sm font-medium text-muted-foreground">Weitere Ergebnisse laden...</p>
                    </div>
                  )}
                </>
              ) : results.length > 0 ? (
                <EmptyState
                  icon={Search}
                  title={`Keine ${resultTypeFilter === 'keyword' ? 'Stichwort' : 'semantischen'}-Ergebnisse in diesem Set.`}
                  description="Wechsle den Filter oder erweitere die Suchanfrage."
                />
              ) : (
                <EmptyState
                  icon={Search}
                  title="Keine Treffer gefunden."
                  description='Versuche breitere Begriffe wie „Boxen", „Mutter-Angle" oder „Tiervergleiche" — die semantische Suche findet auch verwandte Inhalte.'
                />
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

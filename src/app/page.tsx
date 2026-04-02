"use client"

import React, { Suspense, useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { SearchControls } from "@/components/search-controls"
import { SimilarWords } from "@/components/similar-words"
import { PunchlineCard } from "@/components/punchline-card"
import { PunchlineCardSkeleton } from "@/components/punchline-card-skeleton"
import { RapperFilterDropdown } from "@/components/rapper-filter-dropdown"

const VideoModal = dynamic(() => import('@/components/video-modal').then(m => ({ default: m.VideoModal })), { ssr: false })
const CorrectionModal = dynamic(() => import('@/components/correction-modal').then(m => ({ default: m.CorrectionModal })), { ssr: false })
import { useHomepage, type SortOption } from "@/hooks/use-homepage"
import { Search, Shuffle, Sparkles, X, Clock, Copy, Check, FlaskConical, SlidersHorizontal, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"

const SEMANTIC_BETA_DISMISSED_KEY = 'battledex_semantic_beta_dismissed'

const LEAGUE_MARKS = [
  { name: "DLTLLY", logo: "/league-dltlly.png" },
  { name: "FOB", logo: "/league-fob.png" },
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
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] grid-fade opacity-50" />

        <div className="relative mx-auto flex max-w-6xl flex-col gap-8">
          {hasActiveSearch ? (
            <section className="sticky top-14 sm:top-4 z-20 overflow-hidden rounded-2xl sm:rounded-[28px] border border-border/50 bg-background/75 p-3 shadow-2xl shadow-black/35 backdrop-blur-xl sm:p-4 md:p-5">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
              <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
                    <Search className="h-3.5 w-3.5" />
                    Suchkonsole
                  </div>
                  <div>
                    <h2 className="text-lg font-black uppercase tracking-tight sm:text-2xl md:text-3xl">
                      {currentQuery || "Punchlines durchsuchen"}
                    </h2>
                    <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                      {!isLoading && totalResults > 0
                        ? `${totalResults.toLocaleString()} Treffer gefunden`
                        : 'Suche nach Bedeutung, dann filtere mit Stichwort- oder Semantik-Filter und Rapper-Auswahl.'}
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopySearchLink}
                  disabled={!currentQuery}
                  className="gap-2 self-start rounded-full border-border/50 bg-background/40"
                >
                  {copiedSearchLink ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
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
            <section className="relative overflow-hidden rounded-2xl sm:rounded-[36px] border border-border/50 bg-card/40 px-4 py-6 shadow-2xl shadow-black/25 backdrop-blur-md sm:px-6 sm:py-8 md:px-10 md:py-12">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
              <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
              <div className="absolute left-0 top-24 h-40 w-40 rounded-full bg-accent/10 blur-3xl" />

              <div className="relative space-y-8">
                <div className="space-y-5 text-center">
                  <div className="space-y-4">
                    <h1 className="mx-auto max-w-4xl text-3xl font-black uppercase leading-[0.95] tracking-tight sm:text-5xl md:text-7xl">
                      Finde
                      <span className="block text-primary">Punchlines</span>
                    </h1>
                    <p className="mx-auto max-w-2xl text-sm text-muted-foreground sm:text-base md:text-lg">
                      BattleDex durchsucht Bars nach Angle, Inhalt und Sprache — auch wenn du den genauen Wortlaut nicht kennst.
                    </p>
                  </div>
                </div>

                <div className="mx-auto max-w-3xl space-y-5">
                  <SearchControls
                    onSearch={handleSearch}
                    isLoading={isLoading}
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                    inputRef={searchInputRef}
                  />

                  <div className="flex items-center justify-center gap-4">
                    {LEAGUE_MARKS.map((league) => (
                      <div
                        key={league.name}
                        className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-border/40 bg-background/40"
                      >
                        {league.logo ? (
                          <img src={league.logo} alt={league.name} className="h-12 w-12 object-cover" />
                        ) : (
                          <span className="text-xs font-black uppercase tracking-[0.2em] text-foreground">
                            {league.name}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {!currentQuery && !isLoading && recentSearches.length > 0 && (
                  <div className="mx-auto max-w-3xl">
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        Zuletzt gesucht
                      </span>
                      {recentSearches.map((q) => (
                        <span
                          key={q}
                          className="inline-flex items-center gap-1 rounded-full border border-border/40 bg-background/35 px-3 py-1 text-sm text-muted-foreground transition-all duration-200 hover:border-primary/40 hover:text-primary"
                        >
                          <button
                            onClick={() => {
                              setSearchQuery(q)
                              handleSearch(q, 'hybrid')
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
                  </div>
                )}
              </div>
            </section>
          )}

          {!hasActiveSearch && (
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-2xl font-bold font-headline">
                  <Sparkles className="h-5 w-5 text-primary" />
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
              <div className="rounded-[28px] border border-border/40 bg-card/35 p-5 backdrop-blur-md">
                <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h3 className="text-2xl font-bold font-headline">Ergebnisse filtern</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Wechsle zwischen allen Treffern, exaktem Wortlaut und semantischen Ergebnissen.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: 'all', label: 'Alle' },
                      { key: 'keyword', label: 'Stichwort' },
                      { key: 'semantic', label: 'Semantisch' },
                    ].map(({ key, label }) => (
                      <button
                        key={key}
                        onClick={() => handleResultTypeFilter(key as 'all' | 'keyword' | 'semantic')}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 inline-flex items-center gap-1.5 ${
                          resultTypeFilter === key
                            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
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

                  {(resultTypeFilter === 'semantic' || resultTypeFilter === 'all') && !semanticBetaDismissed && (
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
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mr-1">
                      <ArrowUpDown className="w-3 h-3 inline mr-1" />
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
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-300 ${
                          sortBy === key
                            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
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
                                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
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
                <div className="rounded-[28px] border border-dashed border-border/40 bg-card/20 py-24 text-center backdrop-blur-sm">
                  <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-secondary/20 p-8">
                    <Search className="h-16 w-16 text-muted-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold text-muted-foreground">Keine {resultTypeFilter === 'keyword' ? 'Stichwort' : 'semantischen'}-Ergebnisse in diesem Set.</h3>
                  <p className="mx-auto mt-3 max-w-sm text-muted-foreground">
                    Wechsle den Filter oder erweitere die Suchanfrage.
                  </p>
                </div>
              ) : (
                <div className="rounded-[28px] border border-dashed border-border/40 bg-card/20 py-24 text-center backdrop-blur-sm">
                  <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-secondary/20 p-8">
                    <Search className="h-16 w-16 text-muted-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold text-muted-foreground">Keine Treffer gefunden.</h3>
                  <p className="mx-auto mt-3 max-w-sm text-muted-foreground">
                    Versuche breitere Begriffe wie „Boxen", „Mutter-Angle" oder „Tiervergleiche" — die semantische Suche findet auch verwandte Inhalte.
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

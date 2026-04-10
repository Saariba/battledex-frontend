"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Search, Hash, Users } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { wordStatsService, type WordStat, type WordRapperEntry } from "@/lib/api/word-stats"
import { RapperMultiSelect } from "@/components/rapper-multi-select"
import { WordLookupChart, type WordChartEntry } from "@/components/word-lookup-chart"

export default function WordStatsPage() {
  // --- Search state ---
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [wordResults, setWordResults] = useState<WordStat[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedWord, setSelectedWord] = useState<WordStat | null>(null)

  // --- Chart state ---
  const [rapperData, setRapperData] = useState<WordRapperEntry[]>([])
  const [rapperCount, setRapperCount] = useState(0)
  const [isLoadingChart, setIsLoadingChart] = useState(false)
  const [mode, setMode] = useState<"absolute" | "normalized" | "perBattle">("absolute")
  const [selectedRappers, setSelectedRappers] = useState<string[]>([])

  // --- Rapper totals (for normalization) ---
  const [rapperTotals, setRapperTotals] = useState<Map<string, number>>(new Map())
  const [rapperBattles, setRapperBattles] = useState<Map<string, number>>(new Map())
  const totalsLoaded = useRef(false)

  // Debounce search query
  useEffect(() => {
    if (query.length < 2) {
      setDebouncedQuery("")
      setWordResults([])
      return
    }
    const timer = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(timer)
  }, [query])

  // Search words
  useEffect(() => {
    if (!debouncedQuery) return
    const controller = new AbortController()
    setIsSearching(true)

    wordStatsService
      .searchWords(debouncedQuery, { limit: 30, signal: controller.signal })
      .then((res) => setWordResults(res.words))
      .catch((err) => {
        if (err?.message !== "Request was cancelled") {
          toast.error("Fehler beim Suchen")
        }
      })
      .finally(() => setIsSearching(false))

    return () => controller.abort()
  }, [debouncedQuery])

  // Load rapper totals for normalization (once, lazily)
  useEffect(() => {
    if (totalsLoaded.current || mode === "absolute") return
    totalsLoaded.current = true
    wordStatsService
      .getRapperTotals()
      .then((res) => {
        const wordMap = new Map<string, number>()
        const battleMap = new Map<string, number>()
        for (const r of res.rappers) {
          wordMap.set(r.rapper_name, r.total_words)
          battleMap.set(r.rapper_name, r.total_battles)
        }
        setRapperTotals(wordMap)
        setRapperBattles(battleMap)
      })
      .catch(() => {})
  }, [mode])

  // Fetch per-rapper data when a word is selected
  useEffect(() => {
    if (!selectedWord) return
    const controller = new AbortController()
    setIsLoadingChart(true)

    wordStatsService
      .getWordRappers(selectedWord.id, 100, controller.signal)
      .then((res) => {
        setRapperData(res.rappers)
        setRapperCount(res.total)
      })
      .catch((err) => {
        if (err?.message !== "Request was cancelled") {
          toast.error("Fehler beim Laden der Rapper-Daten")
        }
      })
      .finally(() => setIsLoadingChart(false))

    return () => controller.abort()
  }, [selectedWord])

  // Build chart data
  const chartData: WordChartEntry[] = (() => {
    const toEntry = (name: string, count: number): WordChartEntry => {
      const total = rapperTotals.get(name)
      const battles = rapperBattles.get(name)
      return {
        rapper_name: name,
        count,
        per1k: total && total > 0 ? (count / total) * 1000 : undefined,
        perBattle: battles && battles > 0 ? count / battles : undefined,
      }
    }

    if (selectedRappers.length > 0) {
      const countMap = new Map(rapperData.map((r) => [r.rapper_name, r.count]))
      return selectedRappers.map((name) => toEntry(name, countMap.get(name) ?? 0))
    }

    return rapperData.map((r) => toEntry(r.rapper_name, r.count))
  })()

  // Sort by active mode
  const sortedChartData = [...chartData].sort((a, b) => {
    if (mode === "perBattle") {
      return (b.perBattle ?? 0) - (a.perBattle ?? 0)
    }
    if (mode === "normalized") {
      return (b.per1k ?? 0) - (a.per1k ?? 0)
    }
    return b.count - a.count
  })

  const selectWord = useCallback((word: WordStat) => {
    setSelectedWord(word)
  }, [])

  const totalUses = selectedWord?.total_count ?? 0

  return (
    <main className="flex-1 overflow-x-hidden px-3 py-4 sm:px-4 sm:py-6 md:px-8 md:py-10">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <header className="space-y-3 pt-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-headline tracking-tight">
            Wort-<span className="text-primary">Statistiken</span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-xl">
            Durchsuche den Wortschatz der deutschen Battlerap-Szene.
            Finde heraus, wer welches Wort am meisten benutzt.
          </p>
        </header>

        {/* Tabs */}
        <Tabs defaultValue="lookup" className="w-full">
          <TabsList className="overflow-x-auto">
            <TabsTrigger value="lookup">Wort-Suche</TabsTrigger>
            <TabsTrigger value="duel" disabled className="opacity-40">
              Vokabel-Duell
            </TabsTrigger>
            <TabsTrigger value="dna" disabled className="opacity-40">
              Wortschatz-DNA
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lookup" className="mt-6 space-y-4 animate-in fade-in duration-300">
            {/* Search input */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Wort suchen..."
                className="h-12 w-full rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm pl-11 pr-4 text-base outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
              />
            </div>

            {/* Word chips */}
            {isSearching ? (
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-24 rounded-full" />
                ))}
              </div>
            ) : wordResults.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {wordResults.slice(0, 3).map((word) => (
                  <button
                    key={word.id}
                    onClick={() => selectWord(word)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors cursor-pointer",
                      selectedWord?.id === word.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border/40 bg-card/50 hover:border-primary/40"
                    )}
                  >
                    <span className="font-semibold">{word.lemma}</span>
                    <span className="text-xs font-mono text-muted-foreground ml-1">
                      {word.total_count.toLocaleString("de-DE")}
                    </span>
                  </button>
                ))}
              </div>
            ) : query.length >= 2 && !isSearching ? (
              <p className="text-sm text-muted-foreground">
                Keine Ergebnisse für &ldquo;{query}&rdquo; &mdash; versuche einen anderen Suchbegriff.
              </p>
            ) : null}

            {/* Filters + mode toggle */}
            {selectedWord && (
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <RapperMultiSelect
                  selected={selectedRappers}
                  onChange={setSelectedRappers}
                  max={8}
                  className="w-full sm:w-72"
                />
                <Tabs
                  value={mode}
                  onValueChange={(v) => setMode(v as "absolute" | "normalized" | "perBattle")}
                  className="shrink-0"
                >
                  <TabsList className="h-8">
                    <TabsTrigger value="absolute" className="text-xs px-3 h-7">
                      Absolut
                    </TabsTrigger>
                    <TabsTrigger value="normalized" className="text-xs px-3 h-7">
                      Pro 1k
                    </TabsTrigger>
                    <TabsTrigger value="perBattle" className="text-xs px-3 h-7">
                      Pro Battle
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            )}

            {/* Metadata cards */}
            {selectedWord && (
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border/40 bg-card/50 backdrop-blur-sm p-4 text-center">
                  <Hash className="h-4 w-4 mx-auto text-muted-foreground/60 mb-1" />
                  <div className="text-2xl sm:text-3xl font-black font-headline tabular-nums">
                    {totalUses.toLocaleString("de-DE")}
                  </div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide font-semibold mt-1">
                    Gesamt-Nutzungen
                  </div>
                </div>
                <div className="rounded-lg border border-border/40 bg-card/50 backdrop-blur-sm p-4 text-center">
                  <Users className="h-4 w-4 mx-auto text-muted-foreground/60 mb-1" />
                  <div className="text-2xl sm:text-3xl font-black font-headline tabular-nums">
                    {rapperCount.toLocaleString("de-DE")}
                  </div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide font-semibold mt-1">
                    Rapper
                  </div>
                </div>
              </div>
            )}

            {/* Chart */}
            {isLoadingChart && sortedChartData.length === 0 ? (
              <Skeleton className="h-64 sm:h-80 w-full rounded-xl mt-6" />
            ) : selectedWord && sortedChartData.length > 0 ? (
              <div className={cn("transition-opacity duration-200", isLoadingChart && "opacity-40")}>
                <WordLookupChart data={sortedChartData} mode={mode} />
              </div>
            ) : !selectedWord ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Search className="w-16 h-16 text-muted-foreground/20 mb-4" />
                <p className="text-muted-foreground text-sm max-w-xs">
                  Suche ein Wort, um zu sehen, welche Rapper es am meisten verwenden.
                </p>
              </div>
            ) : null}
          </TabsContent>

          <TabsContent value="duel">
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-muted-foreground text-sm">
                Vokabel-Duell kommt bald.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="dna">
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-muted-foreground text-sm">
                Wortschatz-DNA kommt bald.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}

"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Search, Hash, Users, Swords, Percent, Fingerprint, BookOpen, Info } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { wordStatsService, type WordStat, type WordRapperEntry, type VocabDuelResponse, type WortschatzDnaResponse } from "@/lib/api/word-stats"
import { rappersService } from "@/lib/api/rappers"
import { RapperMultiSelect } from "@/components/rapper-multi-select"
import { RapperSingleSelect } from "@/components/rapper-single-select"
import { WordLookupChart, type WordChartEntry } from "@/components/word-lookup-chart"
import { VocabDuelChart } from "@/components/vocab-duel-chart"
import { SignatureWordsChart } from "@/components/signature-words-chart"

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

  // --- Shared rapper list ---
  const [allRappers, setAllRappers] = useState<string[]>([])
  const [rappersLoading, setRappersLoading] = useState(false)
  const rappersFetched = useRef(false)

  // --- Duel state ---
  const [duelRapperA, setDuelRapperA] = useState<string | null>(null)
  const [duelRapperB, setDuelRapperB] = useState<string | null>(null)
  const [duelResult, setDuelResult] = useState<VocabDuelResponse | null>(null)
  const [isDuelLoading, setIsDuelLoading] = useState(false)
  const [duelMode, setDuelMode] = useState<"absolute" | "normalized" | "perBattle">("normalized")
  const [duelPos, setDuelPos] = useState<string>("all")

  // --- DNA state ---
  const [dnaRapper, setDnaRapper] = useState<string | null>(null)
  const [dnaResult, setDnaResult] = useState<WortschatzDnaResponse | null>(null)
  const [isDnaLoading, setIsDnaLoading] = useState(false)
  const [dnaPos, setDnaPos] = useState<string>("all")

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
    if (totalsLoaded.current || (mode === "absolute" && duelMode === "absolute")) return
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
  }, [mode, duelMode])

  // Fetch all rapper names (shared across tabs, lazy)
  const loadAllRappers = useCallback(() => {
    if (rappersFetched.current) return
    rappersFetched.current = true
    setRappersLoading(true)
    async function fetchAll() {
      const allNames: string[] = []
      let offset = 0
      const pageSize = 1000
      while (true) {
        const res = await rappersService.listRappers(pageSize, offset)
        allNames.push(...res.rappers.map((r) => r.name))
        if (allNames.length >= res.total || res.rappers.length < pageSize) break
        offset += pageSize
      }
      return allNames
    }
    fetchAll()
      .then(setAllRappers)
      .catch(() => {})
      .finally(() => setRappersLoading(false))
  }, [])

  // Fetch duel data when both rappers are selected
  useEffect(() => {
    if (!duelRapperA || !duelRapperB || duelRapperA === duelRapperB) {
      setDuelResult(null)
      return
    }
    const controller = new AbortController()
    setIsDuelLoading(true)
    const posFilter = duelPos === "all" ? undefined : duelPos
    wordStatsService
      .getVocabDuel(duelRapperA, duelRapperB, posFilter, controller.signal)
      .then(setDuelResult)
      .catch((err) => {
        if (err?.message !== "Request was cancelled") {
          toast.error("Fehler beim Laden des Vokabel-Duells")
        }
      })
      .finally(() => setIsDuelLoading(false))
    return () => controller.abort()
  }, [duelRapperA, duelRapperB, duelPos])

  // Fetch DNA data when a rapper is selected
  useEffect(() => {
    if (!dnaRapper) {
      setDnaResult(null)
      return
    }
    const controller = new AbortController()
    setIsDnaLoading(true)
    const posFilter = dnaPos === "all" ? undefined : dnaPos
    wordStatsService
      .getWortschatzDna(dnaRapper, posFilter, controller.signal)
      .then(setDnaResult)
      .catch((err) => {
        if (err?.message !== "Request was cancelled") {
          toast.error("Fehler beim Laden der Wortschatz-DNA")
        }
      })
      .finally(() => setIsDnaLoading(false))
    return () => controller.abort()
  }, [dnaRapper, dnaPos])

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
            <TabsTrigger value="duel" onClick={loadAllRappers}>
              Vokabel-Duell
            </TabsTrigger>
            <TabsTrigger value="dna" onClick={loadAllRappers}>
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

          <TabsContent value="duel" className="mt-6 space-y-4 animate-in fade-in duration-300">
            {/* Rapper selectors */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <RapperSingleSelect
                rappers={allRappers}
                loading={rappersLoading}
                selected={duelRapperA}
                onChange={setDuelRapperA}
                exclude={duelRapperB ?? undefined}
                placeholder="Rapper A..."
                className="w-full sm:flex-1"
              />
              <Badge
                variant="outline"
                className="text-lg font-black px-3 py-1 shrink-0 border-border/40"
              >
                VS
              </Badge>
              <RapperSingleSelect
                rappers={allRappers}
                loading={rappersLoading}
                selected={duelRapperB}
                onChange={setDuelRapperB}
                exclude={duelRapperA ?? undefined}
                placeholder="Rapper B..."
                className="w-full sm:flex-1"
              />
            </div>

            {/* POS filter */}
            {(duelRapperA && duelRapperB && duelRapperA !== duelRapperB) && (
              <Tabs
                value={duelPos}
                onValueChange={setDuelPos}
                className="shrink-0"
              >
                <TabsList className="h-8">
                  <TabsTrigger value="all" className="text-xs px-3 h-7">
                    Alle
                  </TabsTrigger>
                  <TabsTrigger value="NOUN" className="text-xs px-3 h-7">
                    Nomen
                  </TabsTrigger>
                  <TabsTrigger value="ADJ" className="text-xs px-3 h-7">
                    Adjektive
                  </TabsTrigger>
                  <TabsTrigger value="VERB" className="text-xs px-3 h-7">
                    Verben
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}

            {/* Same rapper warning */}
            {duelRapperA && duelRapperB && duelRapperA === duelRapperB && (
              <p className="text-sm text-muted-foreground text-center">
                Wähle zwei verschiedene Rapper.
              </p>
            )}

            {/* KPI cards */}
            {isDuelLoading && !duelResult ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-lg" />
                ))}
              </div>
            ) : duelResult ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-lg border border-border/40 bg-card/50 backdrop-blur-sm p-4 text-center">
                  <Percent className="h-4 w-4 mx-auto text-muted-foreground/60 mb-1" />
                  <div className="text-2xl sm:text-3xl font-black font-headline tabular-nums">
                    {duelResult.jaccard_percent.toFixed(1)}%
                  </div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide font-semibold mt-1">
                    Vokabel-Overlap
                  </div>
                </div>
                <div className="rounded-lg border border-border/40 bg-card/50 backdrop-blur-sm p-4 text-center">
                  <Users className="h-4 w-4 mx-auto text-muted-foreground/60 mb-1" />
                  <div className="text-2xl sm:text-3xl font-black font-headline tabular-nums">
                    {duelResult.shared_count.toLocaleString("de-DE")}
                  </div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide font-semibold mt-1">
                    Gemeinsame Wörter
                  </div>
                </div>
                <div className="rounded-lg border border-border/40 bg-card/50 backdrop-blur-sm p-4 text-center">
                  <div className="h-4 w-4 mx-auto text-[hsl(217_91%_60%)] mb-1 text-xs font-bold">A</div>
                  <div className="text-2xl sm:text-3xl font-black font-headline tabular-nums">
                    {duelResult.only_a_count.toLocaleString("de-DE")}
                  </div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide font-semibold mt-1 truncate">
                    Nur {duelRapperA}
                  </div>
                </div>
                <div className="rounded-lg border border-border/40 bg-card/50 backdrop-blur-sm p-4 text-center">
                  <div className="h-4 w-4 mx-auto text-primary mb-1 text-xs font-bold">B</div>
                  <div className="text-2xl sm:text-3xl font-black font-headline tabular-nums">
                    {duelResult.only_b_count.toLocaleString("de-DE")}
                  </div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide font-semibold mt-1 truncate">
                    Nur {duelRapperB}
                  </div>
                </div>
              </div>
            ) : null}

            {/* Exclusive words */}
            {duelResult && (duelResult.top_only_a?.length > 0 || duelResult.top_only_b?.length > 0) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: duelRapperA!, words: duelResult.top_only_a, color: "hsl(217 91% 60%)" },
                  { label: duelRapperB!, words: duelResult.top_only_b, color: "hsl(0 84% 60%)" },
                ].map(({ label, words, color }) => (
                  <div
                    key={label}
                    className="rounded-lg border border-border/40 bg-card/50 backdrop-blur-sm p-4"
                  >
                    <p className="text-xs text-muted-foreground mb-3">
                      Top-Wörter nur bei{" "}
                      <span className="font-semibold" style={{ color }}>{label}</span>
                    </p>
                    {words.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {words.map((w) => (
                          <span
                            key={w.lemma}
                            className="inline-flex items-center gap-1.5 rounded-full border border-border/40 bg-card/60 px-2.5 py-1 text-sm"
                          >
                            <span className="font-semibold">{w.lemma}</span>
                            <span className="text-xs font-mono text-muted-foreground">
                              {w.count.toLocaleString("de-DE")}×
                            </span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground/60">Keine exklusiven Wörter</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Butterfly chart */}
            {isDuelLoading && !duelResult ? (
              <Skeleton className="h-64 sm:h-80 w-full rounded-xl mt-6" />
            ) : duelResult && duelResult.top_diff.length > 0 ? (
              <div className={cn("transition-opacity duration-200", isDuelLoading && "opacity-40")}>
                <VocabDuelChart
                  data={duelResult.top_diff}
                  rapperAName={duelRapperA!}
                  rapperBName={duelRapperB!}
                  mode={duelMode}
                  onModeChange={setDuelMode}
                  rapperATotalBattles={rapperBattles.get(duelRapperA!)}
                  rapperBTotalBattles={rapperBattles.get(duelRapperB!)}
                />
              </div>
            ) : duelResult && duelResult.top_diff.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground text-sm">
                  Keine gemeinsamen Wörter gefunden.
                </p>
              </div>
            ) : !duelRapperA || !duelRapperB ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Swords className="w-16 h-16 text-muted-foreground/20 mb-4" />
                <p className="text-muted-foreground text-sm max-w-xs">
                  Wähle zwei Rapper, um ihre Vokabulare zu vergleichen.
                </p>
              </div>
            ) : null}
          </TabsContent>

          <TabsContent value="dna" className="mt-6 space-y-4 animate-in fade-in duration-300">
            {/* Rapper selector */}
            <RapperSingleSelect
              rappers={allRappers}
              loading={rappersLoading}
              selected={dnaRapper}
              onChange={setDnaRapper}
              placeholder="Rapper wählen..."
              className="w-full sm:w-72"
            />

            {/* POS filter */}
            {dnaRapper && (
              <Tabs
                value={dnaPos}
                onValueChange={setDnaPos}
                className="shrink-0"
              >
                <TabsList className="h-8">
                  <TabsTrigger value="all" className="text-xs px-3 h-7">
                    Alle
                  </TabsTrigger>
                  <TabsTrigger value="NOUN" className="text-xs px-3 h-7">
                    Nomen
                  </TabsTrigger>
                  <TabsTrigger value="ADJ" className="text-xs px-3 h-7">
                    Adjektive
                  </TabsTrigger>
                  <TabsTrigger value="VERB" className="text-xs px-3 h-7">
                    Verben
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}

            {/* Explanation */}
            {dnaRapper && (
              <div className="flex gap-3 rounded-lg border border-border/30 bg-card/30 backdrop-blur-sm px-4 py-3">
                <Info className="h-4 w-4 text-muted-foreground/60 shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-foreground">Signatur-Wörter</span> sind Wörter, die ein Rapper besonders häufig nutzt,
                  während sie bei anderen selten vorkommen. Der <span className="font-semibold text-foreground">Score</span> (TF-IDF)
                  kombiniert die Häufigkeit beim Rapper mit der Seltenheit in der Szene — je höher, desto
                  charakteristischer das Wort.{" "}
                  <span className="font-semibold text-foreground">Exklusive Wörter</span> kommen in der gesamten
                  Datenbank nur bei diesem einen Rapper vor.
                </p>
              </div>
            )}

            {/* KPI cards */}
            {isDnaLoading && !dnaResult ? (
              <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-lg" />
                ))}
              </div>
            ) : dnaResult ? (
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border border-border/40 bg-card/50 backdrop-blur-sm p-4 text-center">
                  <BookOpen className="h-4 w-4 mx-auto text-muted-foreground/60 mb-1" />
                  <div className="text-2xl sm:text-3xl font-black font-headline tabular-nums">
                    {dnaResult.rapper.vocab_size.toLocaleString("de-DE")}
                  </div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide font-semibold mt-1">
                    Vokabular
                  </div>
                </div>
                <div className="rounded-lg border border-border/40 bg-card/50 backdrop-blur-sm p-4 text-center">
                  <Fingerprint className="h-4 w-4 mx-auto text-muted-foreground/60 mb-1" />
                  <div className="text-2xl sm:text-3xl font-black font-headline tabular-nums">
                    {dnaResult.signature_words.length > 0
                      ? dnaResult.signature_words[0].tfidf.toFixed(4)
                      : "—"}
                  </div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide font-semibold mt-1">
                    Top-Score
                  </div>
                </div>
                <div className="rounded-lg border border-border/40 bg-card/50 backdrop-blur-sm p-4 text-center">
                  <Hash className="h-4 w-4 mx-auto text-muted-foreground/60 mb-1" />
                  <div className="text-2xl sm:text-3xl font-black font-headline tabular-nums">
                    {dnaResult.total_exclusive_count.toLocaleString("de-DE")}
                  </div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide font-semibold mt-1">
                    Exklusive Wörter
                  </div>
                </div>
              </div>
            ) : null}

            {/* Main content: chart + exclusive words */}
            {isDnaLoading && !dnaResult ? (
              <Skeleton className="h-64 sm:h-80 w-full rounded-xl" />
            ) : dnaResult && dnaResult.signature_words.length > 0 ? (
              <div className={cn("grid grid-cols-1 sm:grid-cols-[2fr_1fr] gap-4 transition-opacity duration-200", isDnaLoading && "opacity-40")}>
                <SignatureWordsChart
                  data={dnaResult.signature_words}
                  rapperName={dnaRapper!}
                  totalRappers={dnaResult.total_rappers}
                />
                <div className="rounded-xl border border-border/40 bg-card/30 backdrop-blur-sm p-4 sm:p-6">
                  <p className="text-xs text-muted-foreground mb-3">
                    Exklusive Wörter — nur bei{" "}
                    <span className="font-semibold text-foreground">{dnaRapper}</span>
                  </p>
                  {dnaResult.exclusive_words.length > 0 ? (
                    <>
                      <div className="flex flex-wrap gap-2">
                        {dnaResult.exclusive_words.map((w) => (
                          <span
                            key={w.lemma}
                            className="inline-flex items-center gap-1.5 rounded-full border border-border/40 bg-card/60 px-2.5 py-1 text-sm"
                          >
                            <span className="font-semibold">{w.lemma}</span>
                            <span className="text-[10px] font-mono text-muted-foreground">
                              {w.count}×
                            </span>
                          </span>
                        ))}
                      </div>
                      <p className="mt-3 text-xs text-muted-foreground">
                        {dnaRapper} hat{" "}
                        <span className="font-semibold text-foreground">
                          {dnaResult.total_exclusive_count.toLocaleString("de-DE")}
                        </span>{" "}
                        exklusive Wörter.
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground/60">
                      Keine exklusiven Wörter gefunden.
                    </p>
                  )}
                </div>
              </div>
            ) : dnaResult && dnaResult.signature_words.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground text-sm">
                  Keine Signatur-Wörter gefunden.
                </p>
              </div>
            ) : !dnaRapper ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Fingerprint className="w-16 h-16 text-muted-foreground/20 mb-4" />
                <p className="text-muted-foreground text-sm max-w-xs">
                  Wähle einen Rapper, um seine Wortschatz-DNA zu sehen.
                </p>
              </div>
            ) : null}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}

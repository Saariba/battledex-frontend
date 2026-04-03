'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { battlesService } from '@/lib/api/battles'
import type { Battle } from '@/lib/types'
import { extractYouTubeId } from '@/lib/api/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Play, Search, X, Swords, FileText, CalendarDays, Eye, Loader2 } from 'lucide-react'
import { EmptyState } from '@/components/empty-state'
import { toast } from 'sonner'

const BATTLES_PER_PAGE = 20

export default function BattlesPage() {
  const [battles, setBattles] = useState<Battle[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortValue, setSortValue] = useState('date_desc')
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Debounce search input
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    debounceTimerRef.current = setTimeout(() => {
      setSearchQuery(searchInput)
    }, 400)
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    }
  }, [searchInput])

  // Reset and load when search or sort changes
  useEffect(() => {
    if (!isMounted) return
    // Cancel any in-flight request
    if (abortRef.current) abortRef.current.abort()
    setBattles([])
    setTotal(0)
    setHasMore(true)
    loadBattles(0, true)
  }, [searchQuery, sortValue, isMounted])

  const loadBattles = async (offset: number, isInitial: boolean) => {
    if (isInitial) {
      setIsLoading(true)
    } else {
      setIsLoadingMore(true)
    }

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const response = await battlesService.listBattles(
        BATTLES_PER_PAGE,
        offset,
        searchQuery || undefined,
        sortValue
      )

      if (controller.signal.aborted) return

      const newBattles = response.battles || []
      const totalCount = response.total

      if (isInitial) {
        setBattles(newBattles)
      } else {
        setBattles(prev => {
          const existingIds = new Set(prev.map(b => b.id))
          const unique = newBattles.filter(b => !existingIds.has(b.id))
          return [...prev, ...unique]
        })
      }

      setTotal(totalCount)
      setHasMore(offset + newBattles.length < totalCount)
    } catch (error) {
      if (controller.signal.aborted) return
      console.error('Failed to load battles:', error)
      toast.error('Battles konnten nicht geladen werden. Bitte erneut versuchen.')
      if (isInitial) {
        setBattles([])
        setTotal(0)
      }
      setHasMore(false)
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false)
        setIsLoadingMore(false)
      }
    }
  }

  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore || isLoading) return
    loadBattles(battles.length, false)
  }, [isLoadingMore, hasMore, isLoading, battles.length, searchQuery, sortValue])

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    let debounceTimer: ReturnType<typeof setTimeout> | null = null

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && !isLoadingMore) {
          if (debounceTimer) clearTimeout(debounceTimer)
          debounceTimer = setTimeout(() => loadMore(), 200)
        }
      },
      { rootMargin: '400px' }
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => {
      observer.disconnect()
      if (debounceTimer) clearTimeout(debounceTimer)
    }
  }, [isLoading, isLoadingMore, loadMore])

  const clearSearch = useCallback(() => {
    setSearchInput('')
    setSearchQuery('')
  }, [])

  if (!isMounted) return null

  return (
    <main className="flex-1 overflow-x-hidden px-3 py-4 sm:px-4 sm:py-6 md:px-8 md:py-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="space-y-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tight">
              Alle <span className="text-primary">Battles</span>
            </h1>
            <p className="text-muted-foreground text-lg mt-2">
              {searchQuery
                ? `${total.toLocaleString()} Battle${total !== 1 ? 's' : ''} gefunden für „${searchQuery}"`
                : total > 0
                  ? `${total.toLocaleString()} Battles in der Datenbank`
                  : isLoading
                    ? 'Battles werden geladen...'
                    : 'Keine Battles gefunden'}
            </p>
          </div>

          {/* Search Input & Sort */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Battles suchen..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9 pr-9 bg-card/60 border-border/50 focus:border-primary/50"
              />
              {searchInput && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <Select value={sortValue} onValueChange={(value) => setSortValue(value)}>
              <SelectTrigger className="w-full sm:w-[220px] bg-card/60 border-border/50">
                <SelectValue placeholder="Sortierung" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date_desc">Neueste zuerst</SelectItem>
                <SelectItem value="date_asc">Älteste zuerst</SelectItem>
                <SelectItem value="views_desc">Meiste Views</SelectItem>
                <SelectItem value="views_asc">Wenigste Views</SelectItem>
                <SelectItem value="title_asc">Titel A-Z</SelectItem>
                <SelectItem value="title_desc">Titel Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Count Info */}
        {!isLoading && battles.length > 0 && total > 0 && (
          <div className="border-b border-border/40 pb-4">
            <p className="text-sm text-muted-foreground">
              {battles.length} von {total.toLocaleString()} Battles angezeigt
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-80 rounded-2xl bg-card/50 animate-pulse border border-border/20" />
            ))}
          </div>
        ) : battles.length > 0 ? (
          <>
            {/* Battles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {battles.map((battle) => (
                <BattleCard key={battle.id} battle={battle} />
              ))}
            </div>

            {/* Infinite scroll trigger */}
            <div ref={loadMoreRef} className="h-1" />

            {/* Loading more indicator */}
            {isLoadingMore && (
              <div className="flex items-center justify-center py-8 gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Weitere Battles laden...</span>
              </div>
            )}

            {/* End of list */}
            {!hasMore && battles.length >= total && battles.length > BATTLES_PER_PAGE && (
              <p className="text-center text-sm text-muted-foreground py-6">
                Alle {total.toLocaleString()} Battles geladen
              </p>
            )}
          </>
        ) : (
          <EmptyState
            icon={Swords}
            title="Keine Battles gefunden"
            description={searchQuery
              ? `Keine Ergebnisse für „${searchQuery}". Versuche einen anderen Suchbegriff.`
              : 'Schau später nochmal vorbei'}
            action={searchQuery ? { label: 'Suche zurücksetzen', onClick: clearSearch } : undefined}
          />
        )}
      </div>
    </main>
  )
}

interface BattleCardProps {
  battle: Battle
}

function formatGermanDate(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch {
    return dateStr
  }
}

function BattleCard({ battle }: BattleCardProps) {
  const videoId = battle.youtubeUrl ? extractYouTubeId(battle.youtubeUrl) : null
  const thumbnailUrl = videoId
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : null

  return (
    <Card className="overflow-hidden border-border/50 bg-card/40 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 group shadow-md">
      <CardHeader className="p-0">
        {/* Thumbnail */}
        {battle.youtubeUrl ? (
          <a
            href={battle.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block relative aspect-video bg-gradient-to-br from-card to-background overflow-hidden cursor-pointer"
          >
            {thumbnailUrl ? (
              <Image
                src={thumbnailUrl}
                alt={battle.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Swords className="w-12 h-12 text-muted-foreground/20" />
              </div>
            )}
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
              <Play className="w-16 h-16 text-white drop-shadow-lg" />
            </div>
          </a>
        ) : (
          <div className="relative aspect-video bg-gradient-to-br from-card to-background overflow-hidden">
            {thumbnailUrl ? (
              <Image
                src={thumbnailUrl}
                alt={battle.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Swords className="w-12 h-12 text-muted-foreground/20" />
              </div>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        {/* Title */}
        <Link href={`/battles/${battle.id}`}>
          <h3 className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors cursor-pointer">
            {battle.title}
          </h3>
        </Link>

        {/* League Badge & Year */}
        <div className="flex items-center gap-2">
          {battle.league === 'DLTLLY' ? (
            <img src="/league-dltlly.png" alt="DLTLLY" className="w-6 h-6 rounded-full object-cover" />
          ) : battle.league === 'FOB' ? (
            <img src="/league-fob.png" alt="FOB" className="w-6 h-6 rounded-full object-cover" />
          ) : (
            <Badge variant="outline" className="text-[10px] font-code border-primary/30 text-primary">
              <Swords className="w-3 h-3 mr-1" />
              {battle.league}
            </Badge>
          )}
          {battle.date && (
            <span className="text-xs text-muted-foreground">
              {new Date(battle.date).getFullYear()}
            </span>
          )}
        </div>

        {/* Upload Date & Views */}
        <div className="flex items-center gap-2 flex-wrap">
          {battle.uploadDate && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarDays className="w-3 h-3" />
              {formatGermanDate(battle.uploadDate)}
            </span>
          )}
          {battle.youtubeViews != null && (
            <Badge variant="outline" className="text-[10px] font-code border-red-500/30 text-red-500">
              <Eye className="w-3 h-3 mr-1" />
              {battle.youtubeViews.toLocaleString('de-DE')} Views
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 gap-2">
        <Link href={`/battles/${battle.id}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full">
            <FileText className="w-4 h-4 mr-2" />
            Details ansehen
          </Button>
        </Link>
        {battle.youtubeUrl && (
          <a
            href={battle.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <Button
              variant="outline"
              size="sm"
              className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all"
            >
              <Play className="w-4 h-4 mr-2" />
              YouTube
            </Button>
          </a>
        )}
      </CardFooter>
    </Card>
  )
}

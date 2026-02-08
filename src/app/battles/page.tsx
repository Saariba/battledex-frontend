'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { battlesService } from '@/lib/api/battles'
import type { Battle } from '@/lib/types'
import { extractYouTubeId } from '@/lib/api/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Play, Swords } from 'lucide-react'
import { toast } from 'sonner'
import { battlesCache, generateCacheKey } from '@/lib/cache'

const BATTLES_PER_PAGE = 20

export default function BattlesPage() {
  const [battles, setBattles] = useState<Battle[]>([])
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return
    loadBattles()
  }, [currentPage, isMounted])

  const loadBattles = async () => {
    try {
      setIsLoading(true)
      const offset = (currentPage - 1) * BATTLES_PER_PAGE

      // Try cache first
      const cacheKey = generateCacheKey('battles', currentPage, BATTLES_PER_PAGE, offset)
      const cached = battlesCache.get<{ battles: Battle[], total: number }>(cacheKey)

      if (cached) {
        setBattles(cached.battles)
        setTotal(cached.total)
        setIsLoading(false)
        return
      }

      // Fetch if not cached
      const response = await battlesService.listBattles(BATTLES_PER_PAGE, offset)

      // Debug: Log the response to see its structure
      console.log('Battles API Response:', response)

      const battlesList = response.battles || []
      let totalCount = 0

      // If API provides total, use it. Otherwise, estimate based on results
      if (response.total !== undefined) {
        totalCount = response.total
      } else {
        // If we got a full page, assume there might be more
        // This is a fallback for APIs that don't return total count
        if (battlesList.length === BATTLES_PER_PAGE) {
          totalCount = (currentPage * BATTLES_PER_PAGE) + 1 // At least one more page
        } else {
          totalCount = (currentPage - 1) * BATTLES_PER_PAGE + battlesList.length
        }
      }

      // Cache the result
      battlesCache.set(cacheKey, { battles: battlesList, total: totalCount })

      setBattles(battlesList)
      setTotal(totalCount)
    } catch (error) {
      console.error('Failed to load battles:', error)
      toast.error('Failed to load battles. Please try again.')
      setBattles([])
      setTotal(0)
    } finally {
      setIsLoading(false)
    }
  }

  const totalPages = total > 0 ? Math.ceil(total / BATTLES_PER_PAGE) : 1

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  if (!isMounted) return null

  return (
      <main className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Page Header */}
          <div className="space-y-4">
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              ← Back to Search
            </Link>
            <div>
              <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tight">
                All <span className="text-primary">Battles</span>
              </h1>
              <p className="text-muted-foreground text-lg mt-2">
                {total > 0 ? `Browse ${total.toLocaleString()} battles available in the database` : 'Loading battles...'}
              </p>
            </div>
          </div>

          {/* Pagination Info */}
          {!isLoading && battles.length > 0 && total > 0 && (
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
              <p className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * BATTLES_PER_PAGE) + 1} - {Math.min(currentPage * BATTLES_PER_PAGE, total)} of {total.toLocaleString()} battles
              </p>
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
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

              {/* Pagination Controls */}
              <div className="flex items-center justify-center gap-4 pt-8">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="gap-2 transition-all duration-300"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>

                <div className="flex items-center gap-2">
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => {
                          setCurrentPage(pageNum)
                          window.scrollTo({ top: 0, behavior: 'smooth' })
                        }}
                        className={`w-10 transition-all duration-300 ${
                          currentPage === pageNum ? 'shadow-lg shadow-primary/30 scale-110' : ''
                        }`}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="gap-2 transition-all duration-300"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-24 bg-card/20 rounded-3xl border border-dashed border-border/40">
              <Swords className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-muted-foreground">No battles found</h3>
              <p className="text-muted-foreground mt-2">Check back later for updates</p>
            </div>
          )}
        </div>
      </main>
  )
}

interface BattleCardProps {
  battle: Battle
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
              <img
                src={thumbnailUrl}
                alt={battle.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
              <img
                src={thumbnailUrl}
                alt={battle.title}
                className="w-full h-full object-cover"
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
        {/* League Badge */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] font-code border-primary/30 text-primary">
            {battle.league === 'DLTLLY' ? (
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQSXFzUaStqCCDaBO5wh6nUz6bp7IfaLAUO3Q&s"
                alt="DLTLLY"
                className="w-3 h-3 mr-1 object-contain"
              />
            ) : (
              <Swords className="w-3 h-3 mr-1" />
            )}
            {battle.league}
          </Badge>
          {battle.date && (
            <span className="text-xs text-muted-foreground">
              {new Date(battle.date).getFullYear()}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          {battle.title}
        </h3>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        {battle.youtubeUrl ? (
          <a
            href={battle.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full"
          >
            <Button
              variant="outline"
              size="sm"
              className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all"
            >
              <Play className="w-4 h-4 mr-2" />
              Watch on YouTube
            </Button>
          </a>
        ) : (
          <Button
            variant="outline"
            size="sm"
            disabled
            className="w-full"
          >
            No video available
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

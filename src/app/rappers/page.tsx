'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { rappersService, type RapperListItem } from '@/lib/api/rappers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ChevronLeft,
  ChevronRight,
  Mic2,
  Search,
  Swords,
  X,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'

const RAPPERS_PER_PAGE = 48

export default function RappersPage() {
  const [rappers, setRappers] = useState<RapperListItem[]>([])
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Debounce search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setSearchQuery(searchInput)
      setCurrentPage(1)
    }, 400)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [searchInput])

  useEffect(() => {
    if (!isMounted) return
    loadRappers()
  }, [currentPage, searchQuery, isMounted])

  const clearSearch = useCallback(() => {
    setSearchInput('')
    setSearchQuery('')
    setCurrentPage(1)
  }, [])

  const loadRappers = async () => {
    try {
      setIsLoading(true)
      const offset = (currentPage - 1) * RAPPERS_PER_PAGE
      const response = await rappersService.listRappers(
        RAPPERS_PER_PAGE,
        offset,
        searchQuery || undefined
      )
      setRappers(response.rappers)
      setTotal(response.total)
    } catch (error) {
      console.error('Failed to load rappers:', error)
      toast.error('Failed to load rappers')
      setRappers([])
      setTotal(0)
    } finally {
      setIsLoading(false)
    }
  }

  const totalPages = total > 0 ? Math.ceil(total / RAPPERS_PER_PAGE) : 1

  if (!isMounted) return null

  return (
    <main className="flex-1 overflow-y-auto p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Users className="w-10 h-10 text-primary" />
            <div>
              <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tight">
                All <span className="text-primary">Rappers</span>
              </h1>
              <p className="text-muted-foreground text-lg mt-1">
                {searchQuery
                  ? `Found ${total.toLocaleString()} rapper${total !== 1 ? 's' : ''} matching "${searchQuery}"`
                  : total > 0
                    ? `Browse ${total.toLocaleString()} rappers in the database`
                    : 'Loading rappers...'}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Search rappers..."
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
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="h-28 rounded-xl bg-card/50 animate-pulse border border-border/20" />
            ))}
          </div>
        ) : rappers.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {rappers.map((rapper) => (
                <Link key={rapper.name} href={`/rappers/${encodeURIComponent(rapper.name)}`}>
                  <Card className="border-border/40 bg-card/40 backdrop-blur-sm hover:border-primary/40 hover:bg-card/60 transition-all duration-200 cursor-pointer group h-full">
                    <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                      <div className="bg-primary/10 p-2.5 rounded-full group-hover:bg-primary/20 transition-colors">
                        <Mic2 className="w-5 h-5 text-primary" />
                      </div>
                      <span className="font-bold text-sm leading-tight group-hover:text-primary transition-colors line-clamp-2">
                        {rapper.name}
                      </span>
                      {rapper.battleCount > 0 && (
                        <Badge variant="outline" className="text-[10px] border-border/40 text-muted-foreground">
                          <Swords className="w-2.5 h-2.5 mr-1" />
                          {rapper.battleCount}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCurrentPage(p => p - 1)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  disabled={currentPage === 1}
                  className="gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCurrentPage(p => p + 1)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  disabled={currentPage === totalPages}
                  className="gap-1"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-24 bg-card/20 rounded-3xl border border-dashed border-border/40">
            <Mic2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-muted-foreground">No rappers found</h3>
            <p className="text-muted-foreground mt-2">
              {searchQuery
                ? `No results for "${searchQuery}". Try a different name.`
                : 'Check back later for updates'}
            </p>
            {searchQuery && (
              <Button variant="outline" size="sm" className="mt-4" onClick={clearSearch}>
                Clear search
              </Button>
            )}
          </div>
        )}
      </div>
    </main>
  )
}

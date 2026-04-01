'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import { rappersService, type RapperListItem } from '@/lib/api/rappers'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Search,
  Swords,
  Users,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

export default function RappersPage() {
  const [allRappers, setAllRappers] = useState<RapperListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchInput, setSearchInput] = useState('')
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map())

  useEffect(() => {
    loadAllRappers()
  }, [])

  const loadAllRappers = async () => {
    try {
      setIsLoading(true)
      const response = await rappersService.listRappers(2000, 0)
      setAllRappers(response.rappers)
    } catch (error) {
      console.error('Failed to load rappers:', error)
      toast.error('Rapper konnten nicht geladen werden')
    } finally {
      setIsLoading(false)
    }
  }

  const withBattles = useMemo(() => allRappers.filter(r => r.battleCount > 0), [allRappers])

  const filtered = useMemo(() => {
    if (!searchInput.trim()) return withBattles
    const q = searchInput.toLowerCase()
    return withBattles.filter(r => r.name.toLowerCase().includes(q))
  }, [withBattles, searchInput])

  const grouped = useMemo(() => {
    const map = new Map<string, RapperListItem[]>()
    for (const r of filtered) {
      const first = r.name[0]?.toUpperCase() ?? '#'
      const key = /[A-Z]/.test(first) ? first : '#'
      const arr = map.get(key)
      if (arr) arr.push(r)
      else map.set(key, [r])
    }
    return [...map.entries()].sort(([a], [b]) => {
      if (a === '#') return 1
      if (b === '#') return -1
      return a.localeCompare(b)
    })
  }, [filtered])

  const letters = useMemo(() => grouped.map(([letter]) => letter), [grouped])

  const scrollToLetter = (letter: string) => {
    sectionRefs.current.get(letter)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <main className="flex-1 overflow-y-auto p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl md:text-4xl font-black font-headline tracking-tight">
                Alle <span className="text-primary">Rapper</span>
              </h1>
              <p className="text-muted-foreground text-sm mt-0.5">
                {isLoading
                  ? 'Wird geladen...'
                  : searchInput
                    ? `${filtered.length} von ${withBattles.length} Rappern`
                    : `${withBattles.length} Rapper in der Datenbank`}
              </p>
            </div>
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Rapper suchen..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 pr-9 bg-card/60 border-border/50 focus:border-primary/50"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Letter quick-nav */}
        {!isLoading && !searchInput && (
          <div className="flex flex-wrap gap-1">
            {letters.map((letter) => (
              <button
                key={letter}
                onClick={() => scrollToLetter(letter)}
                className="w-8 h-8 rounded-lg text-xs font-bold text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors flex items-center justify-center"
              >
                {letter}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-5 w-8 rounded" />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {Array.from({ length: 8 }).map((_, j) => (
                    <Skeleton key={j} className="h-10 rounded-xl" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="space-y-8">
            {grouped.map(([letter, rappers]) => (
              <section
                key={letter}
                ref={(el) => { if (el) sectionRefs.current.set(letter, el) }}
                className="scroll-mt-24"
              >
                <div className="sticky top-0 z-10 backdrop-blur-md bg-background/80 -mx-2 px-2 py-1.5 mb-3 border-b border-border/20">
                  <span className="text-lg font-black text-primary">{letter}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{rappers.length}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5">
                  {rappers.map((rapper) => (
                    <Link
                      key={rapper.name}
                      href={`/rappers/${encodeURIComponent(rapper.name)}`}
                      className="group flex items-center justify-between rounded-xl px-3.5 py-2.5 bg-card/30 border border-border/20 hover:border-primary/40 hover:bg-card/60 transition-all duration-150"
                    >
                      <span className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                        {rapper.name}
                      </span>
                      {rapper.battleCount > 0 && (
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground shrink-0 ml-2">
                          <Swords className="w-3 h-3" />
                          {rapper.battleCount}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-card/20 rounded-3xl border border-dashed border-border/40">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-xl font-bold text-muted-foreground">Keine Rapper gefunden</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Keine Ergebnisse für &bdquo;{searchInput}&ldquo;
            </p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => setSearchInput('')}>
              Suche zurücksetzen
            </Button>
          </div>
        )}
      </div>
    </main>
  )
}

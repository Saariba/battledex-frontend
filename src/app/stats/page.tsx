'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { statsService } from '@/lib/api/stats'
import type { StatsResponse } from '@/lib/api/stats'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { Swords, Users, FileText, Database } from 'lucide-react'

export default function StatsPage() {
  const [stats, setStats] = useState<StatsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const hasFetched = useRef(false)

  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true

    statsService.getStats().then(setStats).catch(() => {
      toast.error('Statistiken konnten nicht geladen werden')
    }).finally(() => setIsLoading(false))
  }, [])

  return (
    <main className="flex-1 overflow-x-hidden px-3 py-4 sm:px-4 sm:py-6 md:px-8 md:py-10">
      <div className="max-w-3xl mx-auto space-y-12">
        <header className="space-y-3 pt-6">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Die Datenbank in Zahlen
          </h1>
          <p className="text-muted-foreground max-w-xl">
            BattleDex transkribiert und indexiert deutsches Battlerap —
            durchsuchbar nach Bedeutung, Kontext und Stil.
          </p>
        </header>

        {isLoading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-10 w-24 rounded" />
                  <Skeleton className="h-4 w-16 rounded" />
                </div>
              ))}
            </div>
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        ) : stats ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              {[
                { icon: Swords, value: stats.total_battles, label: 'Battles' },
                { icon: Users, value: stats.total_rappers, label: 'Rapper' },
                { icon: FileText, value: stats.total_lines, label: 'Transkript-Zeilen' },
                { icon: Database, value: stats.total_chunks, label: 'Suchbare Abschnitte' },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="rounded-xl border border-border/30 bg-card/40 p-4 space-y-3">
                  <Icon className="h-5 w-5 text-muted-foreground/60" />
                  <div>
                    <div className="text-2xl sm:text-3xl font-black tabular-nums text-foreground">
                      {value.toLocaleString('de-DE')}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{label}</div>
                  </div>
                </div>
              ))}
            </div>

            <hr className="border-border/30" />

            {/* Prose section — reads like editorial, not a dashboard */}
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Jedes Battle wird per KI transkribiert, in Abschnitte zerlegt und als Vektor-Embedding gespeichert.
                Die Stichwort-Suche nutzt <span className="text-foreground">PostgreSQL-Fuzzy-Matching</span>,
                die semantische Suche findet Lines nach Bedeutung — auch wenn kein einziges Wort übereinstimmt.
              </p>
              <p>
                Aktuell sind Battles von{' '}
                <Link href="/battles" className="text-foreground underline decoration-border hover:decoration-primary transition-colors">
                  DLTLLY, Future of Battlerap und weiteren Ligen
                </Link>{' '}
                indexiert. Neue Battles werden laufend ergänzt.
              </p>
            </div>

            {/* Quick links instead of just restating numbers */}
            <div className="flex flex-wrap gap-3">
              <Link
                href="/battles"
                className="rounded-xl border border-border/40 bg-card/40 px-4 py-3 text-sm font-medium hover:border-primary/40 hover:text-primary transition-colors"
              >
                Alle {stats.total_battles.toLocaleString('de-DE')} Battles ansehen
              </Link>
              <Link
                href="/rappers"
                className="rounded-xl border border-border/40 bg-card/40 px-4 py-3 text-sm font-medium hover:border-primary/40 hover:text-primary transition-colors"
              >
                Alle {stats.total_rappers.toLocaleString('de-DE')} Rapper ansehen
              </Link>
              <Link
                href="/"
                className="rounded-xl border border-border/40 bg-card/40 px-4 py-3 text-sm font-medium hover:border-primary/40 hover:text-primary transition-colors"
              >
                Punchlines durchsuchen
              </Link>
            </div>
          </>
        ) : null}
      </div>
    </main>
  )
}

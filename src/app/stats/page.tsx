'use client'

import React, { useState, useEffect, useRef } from 'react'
import { statsService } from '@/lib/api/stats'
import type { StatsResponse } from '@/lib/api/stats'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, Users, Swords, FileText, Database } from 'lucide-react'
import { toast } from 'sonner'

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

  const statCards = stats ? [
    {
      title: 'Battles',
      value: stats.total_battles.toLocaleString(),
      icon: Swords,
      description: 'Indexierte Battles',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Rapper',
      value: stats.total_rappers.toLocaleString(),
      icon: Users,
      description: 'Einzelne Rapper',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Zeilen',
      value: stats.total_lines.toLocaleString(),
      icon: FileText,
      description: 'Transkript-Zeilen',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Chunks',
      value: stats.total_chunks.toLocaleString(),
      icon: Database,
      description: 'Durchsuchbare Abschnitte',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ] : []

  return (
    <main className="flex-1 overflow-x-hidden px-3 py-4 sm:px-4 sm:py-6 md:px-8 md:py-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Page Header */}
        <section className="text-center space-y-4 py-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BarChart3 className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black font-headline tracking-tight">
            DATENBANK-<span className="text-primary">STATISTIK</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Übersicht über die BattleDex-Datenbank
          </p>
        </section>

        {/* Stats Cards */}
        <section>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-48 rounded-2xl bg-card/50 animate-pulse border border-border/20" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statCards.map((stat) => {
                const Icon = stat.icon
                return (
                  <Card
                    key={stat.title}
                    className="border-border/40 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  >
                    <CardHeader className="pb-3">
                      <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center mb-4`}>
                        <Icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                      <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        {stat.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1">
                      <div className={`text-4xl font-black font-headline ${stat.color}`}>
                        {stat.value}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {stat.description}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </section>

        {/* About */}
        {stats && !isLoading && (
          <section className="bg-card/30 rounded-2xl border border-border/40 p-8 backdrop-blur-sm">
            <h2 className="text-2xl font-bold font-headline mb-4 flex items-center gap-2">
              <Database className="w-6 h-6 text-primary" />
              Über die Datenbank
            </h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                BattleDex indexiert <span className="font-semibold text-foreground">{stats.total_battles.toLocaleString()} Battles</span> mit{' '}
                <span className="font-semibold text-foreground">{stats.total_rappers.toLocaleString()} Rappern</span>.
              </p>
              <p>
                Die Datenbank enthält <span className="font-semibold text-foreground">{stats.total_lines.toLocaleString()} Transkript-Zeilen</span>, aufgeteilt in{' '}
                <span className="font-semibold text-foreground">{stats.total_chunks.toLocaleString()} durchsuchbare Abschnitte</span>.
              </p>
              <p className="text-sm pt-2 border-t border-border/30 mt-4">
                Die Suche funktioniert nach Bedeutung, Kontext und Stil — nicht nur nach Stichwörtern.
              </p>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

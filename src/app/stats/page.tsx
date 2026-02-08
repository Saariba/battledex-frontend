'use client'

import React, { useState, useEffect } from 'react'
import { statsService } from '@/lib/api/stats'
import type { StatsResponse } from '@/lib/api/stats'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, Users, Swords, FileText, Database } from 'lucide-react'
import { toast } from 'sonner'

export default function StatsPage() {
  const [stats, setStats] = useState<StatsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return
    loadStats()
  }, [isMounted])

  const loadStats = async () => {
    try {
      setIsLoading(true)
      const response = await statsService.getStats()
      setStats(response)
    } catch (error) {
      console.error('Failed to load stats:', error)
      toast.error('Failed to load database statistics')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isMounted) return null

  const statCards = stats ? [
    {
      title: 'Total Battles',
      value: stats.total_battles.toLocaleString(),
      icon: Swords,
      description: 'Rap battles indexed',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Total Rappers',
      value: stats.total_rappers.toLocaleString(),
      icon: Users,
      description: 'Unique battle rappers',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Total Lines',
      value: stats.total_lines.toLocaleString(),
      icon: FileText,
      description: 'Transcript lines',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Total Chunks',
      value: stats.total_chunks.toLocaleString(),
      icon: Database,
      description: 'Searchable chunks',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ] : []

  return (
      <main className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Page Header */}
          <section className="text-center space-y-4 py-10">
            <div className="flex items-center justify-center gap-3 mb-4">
              <BarChart3 className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-5xl md:text-6xl font-black font-headline tracking-tight">
              DATABASE <span className="text-primary">STATISTICS</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Overview of the BattleDex neural database
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
                {statCards.map((stat, index) => {
                  const Icon = stat.icon
                  return (
                    <Card
                      key={stat.title}
                      className="border-border/40 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:scale-105 hover:shadow-xl"
                      style={{
                        animationDelay: `${index * 100}ms`,
                      }}
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

          {/* Additional Info */}
          {stats && !isLoading && (
            <section className="bg-card/30 rounded-2xl border border-border/40 p-8 backdrop-blur-sm">
              <h2 className="text-2xl font-bold font-headline mb-4 flex items-center gap-2">
                <Database className="w-6 h-6 text-primary" />
                About the Database
              </h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  BattleDex indexes <span className="font-semibold text-foreground">{stats.total_battles.toLocaleString()} battles</span> featuring{' '}
                  <span className="font-semibold text-foreground">{stats.total_rappers.toLocaleString()} rappers</span>.
                </p>
                <p>
                  The database contains <span className="font-semibold text-foreground">{stats.total_lines.toLocaleString()} transcript lines</span> broken down into{' '}
                  <span className="font-semibold text-foreground">{stats.total_chunks.toLocaleString()} searchable chunks</span> for semantic search.
                </p>
                <p className="text-sm pt-2 border-t border-border/30 mt-4">
                  Neural embeddings enable searching by meaning, context, and style - not just keywords.
                </p>
              </div>
            </section>
          )}
        </div>
      </main>
  )
}

'use client'

import React, { useState, useEffect } from 'react'
import { statsService } from '@/lib/api/stats'
import type { StatsResponse, NounStat } from '@/lib/api/stats'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, Users, Swords, FileText, Database, MessageSquare } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { toast } from 'sonner'

const COMMON_WORDS = new Set([
  'man', 'time', 'way', 'thing', 'people', 'day', 'part', 'lot', 'type',
  'place', 'point', 'year', 'hand', 'end', 'side', 'world', 'kind',
  'case', 'number', 'fact', 'something', 'nothing', 'anything', 'everything',
])

export default function StatsPage() {
  const [stats, setStats] = useState<StatsResponse | null>(null)
  const [nounStats, setNounStats] = useState<NounStat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [nounsLoading, setNounsLoading] = useState(true)
  const [filterCommon, setFilterCommon] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    statsService.getStats().then(setStats).catch(() => {
      toast.error('Failed to load database statistics')
    }).finally(() => setIsLoading(false))

    statsService.getNounStats(30).then(res => {
      setNounStats(res.nouns)
    }).catch(() => {
      // Silently fail
    }).finally(() => setNounsLoading(false))
  }, [isMounted])

  if (!isMounted) return null

  const filteredNouns = filterCommon
    ? nounStats.filter(n => !COMMON_WORDS.has(n.noun.toLowerCase())).slice(0, 20)
    : nounStats.slice(0, 20)

  const BAR_COLORS = [
    'hsl(var(--primary))',
    'hsl(262, 83%, 58%)',
    'hsl(142, 71%, 45%)',
    'hsl(217, 91%, 60%)',
  ]

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

        {/* Noun Stats Chart */}
        <section className="bg-card/30 rounded-2xl border border-border/40 p-6 md:p-8 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold font-headline flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-primary" />
              Most Used Words in Battles
            </h2>
            <button
              onClick={() => setFilterCommon(!filterCommon)}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                filterCommon
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card/50 text-muted-foreground border border-border/40 hover:text-foreground'
              }`}
            >
              {filterCommon ? 'Showing filtered' : 'Hide common words'}
            </button>
          </div>

          {nounsLoading ? (
            <div className="h-[400px] bg-card/20 rounded-xl animate-pulse" />
          ) : filteredNouns.length > 0 ? (
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={filteredNouns}
                  layout="vertical"
                  margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
                >
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis
                    dataKey="noun"
                    type="category"
                    width={100}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tick={{ fill: 'hsl(var(--foreground))' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '13px',
                    }}
                    formatter={(value: number, _name: string, props: { payload?: NounStat }) => {
                      const noun = props.payload
                      if (!noun) return [value, 'Count']
                      return [
                        `${value.toLocaleString()} uses (${noun.battles_count} battles, ${noun.rappers_count} rappers)`,
                        'Occurrences'
                      ]
                    }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {filteredNouns.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={BAR_COLORS[index % BAR_COLORS.length]}
                        fillOpacity={0.8}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-12">No noun statistics available.</p>
          )}
        </section>

        {/* About */}
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

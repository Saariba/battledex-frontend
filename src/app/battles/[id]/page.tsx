'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { battlesService, type BattleDetail, type TranscriptLine } from '@/lib/api/battles'
import { extractYouTubeId } from '@/lib/api/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Play, Swords, Mic2, FileText, ScrollText, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

const SPEAKER_COLORS = [
  'text-primary',
  'text-green-400',
  'text-purple-400',
  'text-orange-400',
  'text-cyan-400',
  'text-pink-400',
]

const SPEAKER_BG_COLORS = [
  'bg-primary/5 border-l-primary/40',
  'bg-green-400/5 border-l-green-400/40',
  'bg-purple-400/5 border-l-purple-400/40',
  'bg-orange-400/5 border-l-orange-400/40',
  'bg-cyan-400/5 border-l-cyan-400/40',
  'bg-pink-400/5 border-l-pink-400/40',
]

export default function BattleDetailPage() {
  const params = useParams()
  const battleId = params.id as string
  const [battle, setBattle] = useState<BattleDetail | null>(null)
  const [transcripts, setTranscripts] = useState<TranscriptLine[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isTranscriptLoading, setIsTranscriptLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted || !battleId) return
    loadBattle()
    loadTranscripts()
  }, [isMounted, battleId])

  useEffect(() => {
    if (battle) {
      document.title = `${battle.title} - BattleDex`
    }
    return () => { document.title = 'BattleDex' }
  }, [battle])

  const loadBattle = async () => {
    try {
      setIsLoading(true)
      const data = await battlesService.getBattleDetail(battleId)
      setBattle(data)
    } catch (error) {
      console.error('Failed to load battle:', error)
      toast.error('Failed to load battle details')
    } finally {
      setIsLoading(false)
    }
  }

  const loadTranscripts = async () => {
    try {
      setIsTranscriptLoading(true)
      const data = await battlesService.getTranscripts(battleId)
      setTranscripts(data)
    } catch (error) {
      console.error('Failed to load transcripts:', error)
      toast.error('Failed to load transcript')
    } finally {
      setIsTranscriptLoading(false)
    }
  }

  // Use battle.rappers for deterministic color ordering, fall back to transcript order
  const speakerColorMap = useMemo(() => {
    const map = new Map<string, number>()
    if (battle?.rappers) {
      battle.rappers.forEach((r, i) => {
        map.set(r.name, i % SPEAKER_COLORS.length)
      })
    }
    // Pick up any speakers from transcripts not in the rappers array
    const transcriptSpeakers = [...new Set(transcripts.map(t => t.speakerLabel).filter(Boolean))]
    transcriptSpeakers.forEach((speaker) => {
      if (speaker && !map.has(speaker)) {
        map.set(speaker, map.size % SPEAKER_COLORS.length)
      }
    })
    return map
  }, [battle, transcripts])

  // Group consecutive lines by the same speaker into segments
  const segments = useMemo(() => {
    const result: { speaker: string | undefined; lines: TranscriptLine[] }[] = []
    for (const line of transcripts) {
      const lastSegment = result[result.length - 1]
      if (lastSegment && lastSegment.speaker === line.speakerLabel) {
        lastSegment.lines.push(line)
      } else {
        result.push({ speaker: line.speakerLabel, lines: [line] })
      }
    }
    return result
  }, [transcripts])

  if (!isMounted) return null

  const videoId = battle?.videoUrl ? extractYouTubeId(battle.videoUrl) : null
  const year = battle?.eventDate ? new Date(battle.eventDate).getFullYear() : null

  return (
    <main className="flex-1 overflow-y-auto p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link
          href="/battles"
          className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Battles
        </Link>

        {isLoading ? (
          <BattleDetailSkeleton />
        ) : battle ? (
          <>
            {/* Header */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-[10px] font-code border-primary/30 text-primary">
                  <Swords className="w-3 h-3 mr-1" />
                  {battle.league}
                </Badge>
                {year && (
                  <Badge variant="outline" className="text-[10px] font-code border-border/50 text-muted-foreground">
                    {year}
                  </Badge>
                )}
                <Badge variant="outline" className="text-[10px] font-code border-green-500/30 text-green-500">
                  <ScrollText className="w-3 h-3 mr-1" />
                  {battle.totalLines} lines
                </Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-black font-headline tracking-tight">
                {battle.title}
              </h1>
            </div>

            {/* Video thumbnail + Watch button */}
            {battle.videoUrl && videoId && (
              <a
                href={battle.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block relative aspect-video rounded-2xl overflow-hidden border border-border/40 group"
              >
                <img
                  src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                  alt={battle.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/50 group-hover:bg-black/60 transition-all duration-300 flex items-center justify-center">
                  <div className="bg-primary/90 rounded-full p-4 group-hover:scale-110 transition-transform duration-300">
                    <Play className="w-10 h-10 text-primary-foreground" />
                  </div>
                </div>
                <div className="absolute bottom-4 right-4">
                  <Badge className="bg-black/70 text-white border-0 gap-1">
                    <ExternalLink className="w-3 h-3" />
                    Watch on YouTube
                  </Badge>
                </div>
              </a>
            )}

            {/* Participating Rappers */}
            {battle.rappers.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-bold font-headline flex items-center gap-2">
                  <span className="text-primary">#</span>
                  Rappers
                </h2>
                <div className="flex gap-3 flex-wrap">
                  {battle.rappers.map((rapper, i) => (
                    <Link key={rapper.rapperId} href={`/rappers/${encodeURIComponent(rapper.name)}`}>
                      <Card className="border-border/40 bg-card/40 hover:border-primary/40 transition-all cursor-pointer">
                        <CardContent className="p-4 flex items-center gap-3">
                          <div className={`p-2 rounded-xl ${i === 0 ? 'bg-primary/10' : 'bg-green-500/10'}`}>
                            <Mic2 className={`w-5 h-5 ${i === 0 ? 'text-primary' : 'text-green-500'}`} />
                          </div>
                          <span className="font-semibold">{rapper.name}</span>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Transcript */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold font-headline flex items-center gap-2">
                <span className="text-primary">#</span>
                Transcript
                {!isTranscriptLoading && (
                  <span className="text-sm font-normal text-muted-foreground">
                    ({transcripts.length} lines)
                  </span>
                )}
              </h2>

              {isTranscriptLoading ? (
                <TranscriptSkeleton />
              ) : transcripts.length > 0 ? (
                <div className="space-y-0.5">
                  {transcripts.map((line) => {
                    const colorIdx = line.speakerLabel
                      ? speakerColorMap.get(line.speakerLabel) ?? 0
                      : 0

                    return (
                      <div
                        key={line.id}
                        className={`flex gap-3 py-2 px-3 rounded-sm border-l-2 ${SPEAKER_BG_COLORS[colorIdx]}`}
                      >
                        <span className="text-xs text-muted-foreground/50 font-code w-8 text-right flex-shrink-0 pt-0.5">
                          {line.sequenceIndex}
                        </span>
                        {line.speakerLabel && (
                          <span className={`text-xs font-semibold w-24 flex-shrink-0 pt-0.5 truncate ${SPEAKER_COLORS[colorIdx]}`}>
                            {line.speakerLabel}
                          </span>
                        )}
                        <span className="text-sm leading-relaxed flex-1">
                          {line.content}
                        </span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-16 bg-card/20 rounded-2xl border border-dashed border-border/40">
                  <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">No transcript available for this battle.</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-24 bg-card/20 rounded-3xl border border-dashed border-border/40">
            <Swords className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-muted-foreground">Battle not found</h3>
            <p className="text-muted-foreground mt-2">
              Could not find this battle.
            </p>
            <Link href="/battles" className="mt-6 inline-block">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Battles
              </Button>
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}

function BattleDetailSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-24" />
        </div>
        <Skeleton className="h-10 w-3/4" />
      </div>
      <Skeleton className="aspect-video w-full rounded-2xl" />
      <div className="space-y-3">
        <Skeleton className="h-6 w-32" />
        <div className="flex gap-3">
          <Skeleton className="h-16 w-40 rounded-xl" />
          <Skeleton className="h-16 w-40 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

function TranscriptSkeleton() {
  return (
    <div className="space-y-1">
      {Array.from({ length: 12 }, (_, i) => (
        <div key={i} className="flex gap-3 py-2 px-3">
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 flex-1" />
        </div>
      ))}
    </div>
  )
}

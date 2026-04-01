
"use client"

import React, { useState } from "react"
import Link from "next/link"
import { SearchResult } from "@/lib/types"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShareButton } from "@/components/share-button"
import { Play, ChevronDown, ChevronUp, Mic2, Swords, Waves } from "lucide-react"
import { cn } from "@/lib/utils"
import { highlightKeywords } from "@/lib/highlight"

interface PunchlineCardProps {
  result: SearchResult
  searchQuery: string
  onPlayVideo: (result: SearchResult) => void
  onCorrection?: (result: SearchResult) => void
}

export function PunchlineCard({ result, searchQuery, onPlayVideo, onCorrection }: PunchlineCardProps) {
  const [showFullContext, setShowFullContext] = useState(false)

  // Highlight keywords only for exact/keyword matches
  const shouldHighlight = result.type === 'exact'
  const displayLine = shouldHighlight
    ? highlightKeywords(result.line, searchQuery)
    : result.line

  // Find core line index in context to show surrounding lines
  const coreLineIndex = result.context.findIndex(line => line === result.line)
  const hasContext = result.context.length > 1
  const lineAbove = coreLineIndex > 0 ? result.context[coreLineIndex - 1] : null
  const lineBelow = coreLineIndex >= 0 && coreLineIndex < result.context.length - 1
    ? result.context[coreLineIndex + 1]
    : null
  const hasMoreContext = result.context.length > 3
  const scoreLabel = result.type === 'random'
    ? 'Zufällig'
    : `${result.type === 'exact' ? 'Stichwort' : 'Semantisch'}-Konfidenz`

  return (
    <Card className="card-hover-effect relative overflow-hidden border-border/50 bg-card/55 shadow-xl shadow-black/20 backdrop-blur-md">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
      <CardHeader className="p-3 sm:p-5 pb-2 sm:pb-3">
        {onCorrection && (
          <button
            onClick={() => onCorrection(result)}
            className="absolute top-3 right-3 group flex items-center gap-2 transition-all duration-300 hover:pr-3 z-10"
            title="Korrektur einreichen"
            aria-label="Fehler melden"
          >
            <span className="text-xs font-semibold text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              Fehler gefunden?
            </span>
            <div className="w-5 h-5 rounded-full bg-red-500 group-hover:bg-red-600 transition-colors flex-shrink-0 flex items-center justify-center">
              <span className="text-white text-xs font-bold">!</span>
            </div>
          </button>
        )}
        <div className="mb-3 flex flex-wrap items-center gap-2.5 pr-10">
          <Badge variant="outline" className="rounded-full border-primary/30 bg-background/40 px-2.5 py-1 text-[10px] font-code uppercase tracking-[0.2em] text-primary">
              {result.battle.league === 'DLTLLY' ? (
                <img
                  src="/league-dltlly.png"
                  alt="DLTLLY"
                  className="mr-1 h-3 w-3 object-contain"
                />
              ) : (
                <Swords className="mr-1 h-3 w-3" />
              )}
              {result.battle.league}
            </Badge>
            {result.type && (
              <Badge
                variant={result.type === 'exact' ? 'default' : 'outline'}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[10px] font-code uppercase tracking-[0.18em]",
                  result.type === 'exact'
                    ? "bg-accent text-accent-foreground"
                    : result.type === 'random'
                    ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                    : "border-primary/30 bg-primary/10 text-primary"
                )}
              >
                {result.type === 'exact' ? 'Stichwort' : result.type === 'random' ? 'Zufällig' : 'Semantisch'}
              </Badge>
            )}
          {typeof result.score === 'number' && result.type !== 'random' && (
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border/30 bg-background/40 px-2.5 py-1 text-[10px] font-code uppercase tracking-[0.18em] text-muted-foreground">
              <Waves className="h-3 w-3 text-primary" />
              <span>{scoreLabel}</span>
              <span className="text-foreground">{(result.score * 100).toFixed(0)}%</span>
            </div>
          )}
        </div>
        <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground/80">
          {result.battle.title}
        </h3>
      </CardHeader>

      <CardContent className="p-3 sm:p-5 pt-0">
        <div className="mb-4 flex items-center gap-2">
          <div className="rounded-full bg-primary/15 p-1.5 text-primary">
            <Mic2 className="h-3.5 w-3.5" />
          </div>
          <Link
            href={`/rappers/${encodeURIComponent(result.rapper.name)}`}
            className="rounded px-2 py-0.5 text-sm font-bold uppercase tracking-[0.16em] text-primary transition-all duration-300 hover:bg-primary/10 hover:text-primary/80"
          >
            {result.rapper.name}
          </Link>
        </div>
        <div className="relative mb-5 overflow-hidden rounded-2xl border border-border/40 bg-black/20 p-4">
          <div className="pointer-events-none absolute left-3 top-3 text-5xl leading-none text-primary/20">"</div>
          {hasContext && lineAbove && !showFullContext && (
            <p className="mb-2 pl-4 sm:pl-5 text-xs sm:text-sm font-mono leading-tight text-muted-foreground/55">
              {shouldHighlight ? highlightKeywords(lineAbove, searchQuery) : lineAbove}
            </p>
          )}
          <p className="pl-4 sm:pl-5 text-base font-bold font-mono leading-snug text-foreground sm:text-xl md:text-2xl">
            "{displayLine}"
          </p>
          {hasContext && lineBelow && !showFullContext && (
            <p className="mt-2 pl-4 sm:pl-5 text-xs sm:text-sm font-mono leading-tight text-muted-foreground/55">
              {shouldHighlight ? highlightKeywords(lineBelow, searchQuery) : lineBelow}
            </p>
          )}
        </div>

        {showFullContext && (
          <div className="mb-4 space-y-2 rounded-2xl border border-border/30 bg-background/35 p-4 animate-in slide-in-from-top-2 duration-300">
            {result.context.map((line, idx) => {
              const isCoreLine = line === result.line
              const contextDisplay = shouldHighlight ? highlightKeywords(line, searchQuery) : line

              return (
                <p
                  key={idx}
                  className={cn(
                    "text-sm font-mono leading-relaxed",
                    isCoreLine ? "text-foreground font-bold" : "text-muted-foreground opacity-60"
                  )}
                >
                  <span className="mr-3 opacity-30 select-none">{idx + 1}</span>
                  {contextDisplay}
                </p>
              )
            })}
          </div>
        )}
      </CardContent>

      <CardFooter className="mt-2 flex flex-wrap items-center gap-2 border-t border-border/20 p-3 sm:p-5 pt-3 sm:pt-4">
        {hasMoreContext ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFullContext(!showFullContext)}
            className="text-xs text-muted-foreground transition-all duration-300 hover:text-foreground"
          >
            {showFullContext ? (
              <>Kontext ausblenden <ChevronUp className="ml-1 w-3 h-3" /></>
            ) : (
              <>Kontext <ChevronDown className="ml-1 w-3 h-3" /></>
            )}
          </Button>
        ) : (
          <div />
        )}
        <div className="ml-auto flex items-center gap-2">
          <ShareButton result={result} />
          <Button
            size="sm"
            className="bg-accent hover:bg-accent/80 text-white font-semibold transition-all duration-300 hover:scale-105 text-xs sm:text-sm"
            onClick={() => onPlayVideo(result)}
          >
            <Play className="mr-1 sm:mr-1.5 w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
            <span className="hidden sm:inline">Video abspielen</span>
            <span className="sm:hidden">Video</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

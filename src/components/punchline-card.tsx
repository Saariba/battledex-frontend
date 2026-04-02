
"use client"

import React, { useState } from "react"
import Link from "next/link"
import { SearchResult } from "@/lib/types"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShareButton } from "@/components/share-button"
import { Play, ChevronDown, ChevronUp } from "lucide-react"
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

  return (
    <Card className="card-hover-effect relative overflow-hidden border-border/50 bg-card/55 backdrop-blur-md">
      <CardHeader className="p-3 sm:p-5 pb-2 sm:pb-3">
        {onCorrection && (
          <button
            onClick={() => onCorrection(result)}
            className="absolute top-3 right-3 group flex items-center gap-1.5 transition-all duration-300 z-10 opacity-30 hover:opacity-100"
            title="Korrektur einreichen"
            aria-label="Fehler melden"
          >
            <span className="hidden sm:inline text-[10px] font-medium text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              Fehler melden
            </span>
            <div className="w-4 h-4 rounded-full border border-muted-foreground/40 group-hover:border-muted-foreground transition-colors flex-shrink-0 flex items-center justify-center">
              <span className="text-muted-foreground text-[9px] font-medium">!</span>
            </div>
          </button>
        )}
        <div className="mb-2 flex items-center gap-2 pr-10 text-xs text-muted-foreground">
          <span className="font-medium text-muted-foreground/70">{result.battle.league}</span>
          <span className="text-border">·</span>
          {result.battleUuid ? (
            <Link href={`/battles/${result.battleUuid}`} className="truncate hover:text-primary transition-colors">
              {result.battle.title}
            </Link>
          ) : (
            <span className="truncate">{result.battle.title}</span>
          )}
          {typeof result.score === 'number' && result.type === 'semantic' && (
            <>
              <span className="text-border">·</span>
              <span>{(result.score * 100).toFixed(0)}%</span>
            </>
          )}
        </div>
        <Link
          href={`/rappers/${encodeURIComponent(result.rapper.name)}`}
          className="text-sm font-bold text-primary hover:text-primary/80 transition-colors"
        >
          {result.rapper.name}
        </Link>
      </CardHeader>

      <CardContent className="p-3 sm:p-5 pt-0">
        <div className="relative mb-4 overflow-hidden rounded-xl border border-border/30 bg-black/20 p-4">
          {hasContext && lineAbove && !showFullContext && (
            <p className="mb-2 pl-4 sm:pl-5 text-xs sm:text-sm font-mono leading-tight text-muted-foreground/70">
              {shouldHighlight ? highlightKeywords(lineAbove, searchQuery) : lineAbove}
            </p>
          )}
          <p className="pl-4 sm:pl-5 text-base font-bold font-mono leading-snug text-foreground sm:text-xl md:text-2xl">
            "{displayLine}"
          </p>
          {hasContext && lineBelow && !showFullContext && (
            <p className="mt-2 pl-4 sm:pl-5 text-xs sm:text-sm font-mono leading-tight text-muted-foreground/70">
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
            variant="outline"
            className="text-xs sm:text-sm"
            onClick={() => onPlayVideo(result)}
          >
            <Play className="mr-1 sm:mr-1.5 w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
            Video
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

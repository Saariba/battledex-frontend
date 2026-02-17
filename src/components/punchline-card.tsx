
"use client"

import React, { useState } from "react"
import Link from "next/link"
import { SearchResult } from "@/lib/types"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShareButton } from "@/components/share-button"
import { Play, ChevronDown, ChevronUp, Mic2, Swords, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

interface PunchlineCardProps {
  result: SearchResult
  searchQuery: string
  onPlayVideo: (result: SearchResult) => void
  onRapperClick?: (rapperName: string) => void
  onCorrection?: (result: SearchResult) => void
}

/**
 * Highlight matching keywords in text for exact/keyword matches
 */
function highlightKeywords(text: string, query: string): React.ReactNode {
  if (!query || !text) return text

  const queryWords = query
    .toLocaleLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 0)

  if (queryWords.length === 0) return text

  const regex = /[\p{L}\p{N}_]+/gu

  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  let didHighlight = false

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index))
    }

    const token = match[0]
    const tokenLower = token.toLocaleLowerCase()
    const shouldHighlight = queryWords.some((word) => tokenLower.includes(word))

    if (shouldHighlight) {
      parts.push(
        <span key={match.index} className="text-yellow-500 font-bold">
          {token}
        </span>
      )
      didHighlight = true
    } else {
      parts.push(token)
    }

    lastIndex = match.index + token.length
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex))
  }

  return didHighlight ? parts : text
}

export function PunchlineCard({ result, searchQuery, onPlayVideo, onRapperClick, onCorrection }: PunchlineCardProps) {
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
    <Card className="card-hover-effect overflow-hidden border-border/50 bg-card/40 backdrop-blur-sm relative shadow-md">
      <CardHeader className="p-4 pb-2">
        {onCorrection && (
          <button
            onClick={() => onCorrection(result)}
            className="absolute top-3 right-3 group flex items-center gap-2 transition-all duration-300 hover:pr-3 z-10"
            title="Submit correction"
          >
            <span className="text-xs font-semibold text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              Spotted an error?
            </span>
            <div className="w-5 h-5 rounded-full bg-red-500 group-hover:bg-red-600 transition-colors flex-shrink-0 flex items-center justify-center">
              <span className="text-white text-xs font-bold">!</span>
            </div>
          </button>
        )}
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2.5">
            <Badge variant="outline" className="text-[10px] font-code border-primary/30 text-primary">
              {result.battle.league === 'DLTLLY' ? (
                <img
                  src="/league-dltlly.svg"
                  alt="DLTLLY"
                  className="w-3 h-3 mr-1 object-contain"
                />
              ) : (
                <Swords className="w-3 h-3 mr-1" />
              )}
              {result.battle.league}
            </Badge>
            {result.type && (
              <Badge
                variant={result.type === 'exact' ? 'default' : 'outline'}
                className={cn(
                  "text-[10px] font-code",
                  result.type === 'exact'
                    ? "bg-accent text-accent-foreground"
                    : result.type === 'random'
                    ? "border-emerald-500/50 text-emerald-400"
                    : "border-purple-500/50 text-purple-400"
                )}
              >
                {result.type === 'exact'
                  ? '🔍 Keyword'
                  : result.type === 'random'
                  ? '🎲 Random'
                  : '🧠 Semantic'}
              </Badge>
            )}
            {result.score && (
              <Badge variant="secondary" className="text-[10px] bg-secondary/50">
                Match: {(result.score * 100).toFixed(0)}%
              </Badge>
            )}
          </div>
        </div>
        <h3 className="text-sm font-semibold text-muted-foreground truncate">{result.battle.title}</h3>
      </CardHeader>

      <CardContent className="p-4 pt-0">
        <div className="flex items-center gap-2 mb-2">
          <div className="bg-primary text-primary-foreground p-1 rounded-full">
            <Mic2 className="w-3 h-3" />
          </div>
          <button
            onClick={() => onRapperClick?.(result.rapper.name)}
            className="text-sm font-bold text-primary uppercase tracking-wide hover:text-primary/80 hover:bg-primary/10 transition-all duration-300 cursor-pointer px-2 py-0.5 rounded"
          >
            {result.rapper.name}
          </button>
          <Link
            href={`/rappers/${encodeURIComponent(result.rapper.name)}`}
            className="text-muted-foreground/50 hover:text-primary transition-colors"
            title={`View ${result.rapper.name}'s profile`}
          >
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
        <div className="relative pl-4 border-l-2 border-primary mb-4">
          {hasContext && lineAbove && !showFullContext && (
            <p className="text-sm font-mono leading-tight text-muted-foreground/60 mb-1">
              {shouldHighlight ? highlightKeywords(lineAbove, searchQuery) : lineAbove}
            </p>
          )}
          <p className="text-lg font-bold font-mono leading-tight text-foreground text-glow">
            "{displayLine}"
          </p>
          {hasContext && lineBelow && !showFullContext && (
            <p className="text-sm font-mono leading-tight text-muted-foreground/60 mt-1">
              {shouldHighlight ? highlightKeywords(lineBelow, searchQuery) : lineBelow}
            </p>
          )}
        </div>

        {showFullContext && (
          <div className="space-y-2 mb-4 animate-in slide-in-from-top-2 duration-300">
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

      <CardFooter className="p-4 pt-0 flex justify-between gap-3 border-t border-border/20 mt-2">
        {hasMoreContext ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFullContext(!showFullContext)}
            className="text-xs text-muted-foreground hover:text-foreground transition-all duration-300"
          >
            {showFullContext ? (
              <>Hide Context <ChevronUp className="ml-1 w-3 h-3" /></>
            ) : (
              <>Full Context <ChevronDown className="ml-1 w-3 h-3" /></>
            )}
          </Button>
        ) : (
          <div />
        )}
        <ShareButton result={result} />
        <Button
          size="sm"
          className="bg-accent hover:bg-accent/80 text-white font-semibold transition-all duration-300 hover:scale-105"
          onClick={() => onPlayVideo(result)}
        >
          <Play className="mr-1.5 w-3.5 h-3.5 fill-current" />
          Play Video
        </Button>
      </CardFooter>
    </Card>
  )
}

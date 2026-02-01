
"use client"

import React, { useState } from "react"
import { SearchResult } from "@/lib/types"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, ChevronDown, ChevronUp, Mic2, Swords } from "lucide-react"
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

  // Split query into individual words
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 0)

  // Create regex pattern for fuzzy matching (find words that contain the query)
  const pattern = queryWords.map(word =>
    word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Escape special chars
  ).join('|')

  const regex = new RegExp(`\\b(\\w*(?:${pattern})\\w*)\\b`, 'gi')

  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index))
    }

    // Add highlighted match
    parts.push(
      <span key={match.index} className="text-yellow-500 font-bold">
        {match[0]}
      </span>
    )

    lastIndex = match.index + match[0].length
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex))
  }

  return parts.length > 0 ? parts : text
}

export function PunchlineCard({ result, searchQuery, onPlayVideo, onRapperClick, onCorrection }: PunchlineCardProps) {
  const [showContext, setShowContext] = useState(false)

  // Highlight keywords only for exact/keyword matches
  const shouldHighlight = result.type === 'exact'
  const displayLine = shouldHighlight
    ? highlightKeywords(result.line, searchQuery)
    : result.line

  return (
    <Card className="card-hover-effect overflow-hidden border-border/50 bg-card/40 backdrop-blur-sm relative">
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
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] font-code border-primary/30 text-primary">
              {result.battle.league === 'DLTLLY' ? (
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQSXFzUaStqCCDaBO5wh6nUz6bp7IfaLAUO3Q&s"
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
                    : "border-purple-500/50 text-purple-400"
                )}
              >
                {result.type === 'exact' ? '🔍 Keyword' : '🧠 Semantic'}
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
            className="text-sm font-bold text-primary uppercase tracking-wide hover:text-primary/80 transition-colors cursor-pointer"
          >
            {result.rapper.name}
          </button>
        </div>
        <div className="relative pl-4 border-l-2 border-primary mb-4">
          <p className="text-xl font-bold font-headline leading-tight tracking-tight text-foreground text-glow italic">
            "{displayLine}"
          </p>
        </div>

        {showContext && (
          <div className="space-y-2 mb-4 animate-in slide-in-from-top-2 duration-300">
            {result.context.map((line, idx) => {
              const isCoreLine = line === result.line
              const contextDisplay = shouldHighlight ? highlightKeywords(line, searchQuery) : line

              return (
                <p
                  key={idx}
                  className={cn(
                    "text-sm font-code leading-relaxed",
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

      <CardFooter className="p-4 pt-0 flex justify-between gap-3 border-t border-border/20 mt-2 bg-black/20">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowContext(!showContext)}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          {showContext ? (
            <>Hide Context <ChevronUp className="ml-1 w-3 h-3" /></>
          ) : (
            <>View Context <ChevronDown className="ml-1 w-3 h-3" /></>
          )}
        </Button>
        <Button
          size="sm"
          className="bg-accent hover:bg-accent/80 text-white font-semibold transition-all hover:scale-105"
          onClick={() => onPlayVideo(result)}
        >
          <Play className="mr-1.5 w-3.5 h-3.5 fill-current" />
          Play Video
        </Button>
      </CardFooter>
    </Card>
  )
}

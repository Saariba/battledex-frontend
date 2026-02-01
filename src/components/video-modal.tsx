
"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RotateCcw, Swords } from "lucide-react"
import { SearchResult } from "@/lib/types"

interface VideoModalProps {
  result: SearchResult | null
  searchQuery?: string
  onClose: () => void
  onCorrection?: (result: SearchResult) => void
}

/**
 * Highlight matching keywords in text for exact/keyword matches
 */
function highlightKeywords(text: string, query: string): React.ReactNode {
  if (!query || !text) return text

  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 0)
  const pattern = queryWords.map(word =>
    word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  ).join('|')

  const regex = new RegExp(`\\b(\\w*(?:${pattern})\\w*)\\b`, 'gi')

  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index))
    }
    parts.push(
      <span key={match.index} className="text-yellow-500 font-bold">
        {match[0]}
      </span>
    )
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex))
  }

  return parts.length > 0 ? parts : text
}

export function VideoModal({ result, searchQuery = '', onClose, onCorrection }: VideoModalProps) {
  const [reloadKey, setReloadKey] = React.useState(0)

  if (!result) return null

  // Extract video ID from youtube URL
  const videoId = result.battle.youtubeUrl.includes('v=')
    ? result.battle.youtubeUrl.split('v=')[1].split('&')[0]
    : '';

  const embedUrl = `https://www.youtube.com/embed/${videoId}?start=${result.timestamp}&autoplay=1&key=${reloadKey}`;

  const shouldHighlight = result.type === 'exact'
  const displayLine = shouldHighlight ? highlightKeywords(result.line, searchQuery) : result.line

  return (
    <Dialog open={!!result} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl bg-background border-primary/20 p-0 overflow-hidden">
        <DialogHeader className="p-4 bg-card/50 relative">
          {onCorrection && (
            <button
              onClick={() => onCorrection(result)}
              className="absolute top-4 right-4 group flex items-center gap-2 transition-all duration-300 hover:pr-3 z-50"
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
          <DialogTitle className="text-primary font-headline flex items-center gap-2">
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
            {result.battle.title}
          </DialogTitle>
        </DialogHeader>
        <div className="aspect-video w-full bg-black">
          <iframe
            key={reloadKey}
            width="100%"
            height="100%"
            src={embedUrl}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <p className="text-lg font-bold text-foreground mb-2 italic">"{displayLine}"</p>
            <p className="text-sm text-muted-foreground">— {result.rapper.name} in {result.battle.league}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setReloadKey(k => k + 1)}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Rewind to Line
            </Button>
            <span className="text-xs text-muted-foreground">
              {Math.floor(result.timestamp / 60)}:{(result.timestamp % 60).toString().padStart(2, '0')}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

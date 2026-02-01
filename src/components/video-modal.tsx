
"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { SearchResult } from "@/lib/types"

interface VideoModalProps {
  result: SearchResult | null
  onClose: () => void
}

export function VideoModal({ result, onClose }: VideoModalProps) {
  if (!result) return null

  // Extract video ID from youtube URL
  const videoId = result.battle.youtubeUrl.includes('v=') 
    ? result.battle.youtubeUrl.split('v=')[1].split('&')[0]
    : '';

  const embedUrl = `https://www.youtube.com/embed/${videoId}?start=${result.timestamp}&autoplay=1`;

  return (
    <Dialog open={!!result} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl bg-background border-primary/20 p-0 overflow-hidden">
        <DialogHeader className="p-4 bg-card/50">
          <DialogTitle className="text-primary font-headline flex items-center gap-2">
            <span className="text-sm font-code text-muted-foreground bg-secondary px-2 py-0.5 rounded">
              {Math.floor(result.timestamp / 60)}:{(result.timestamp % 60).toString().padStart(2, '0')}
            </span>
            {result.battle.title}
          </DialogTitle>
        </DialogHeader>
        <div className="aspect-video w-full bg-black">
          <iframe
            width="100%"
            height="100%"
            src={embedUrl}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        </div>
        <div className="p-6">
          <p className="text-lg font-bold text-foreground mb-2">"{result.line}"</p>
          <p className="text-sm text-muted-foreground">— {result.rapper.name} in {result.battle.league}</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

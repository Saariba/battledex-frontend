
"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RotateCcw, Swords } from "lucide-react"
import { SearchResult } from "@/lib/types"
import { useYouTubePlayer } from "@/hooks/useYouTubePlayer"
import { transcriptService } from "@/lib/api/transcripts"
import { KaraokeLyrics } from "./karaoke-lyrics"
import { toast } from "@/hooks/use-toast"
import type { TranscriptLine } from "@/lib/api/types"
import { transcriptCache, generateCacheKey } from "@/lib/cache"
import { highlightKeywords } from "@/lib/highlight"

interface VideoModalProps {
  result: SearchResult | null
  searchQuery?: string
  onClose: () => void
  onCorrection?: (result: SearchResult) => void
}

export function VideoModal({ result, searchQuery = '', onClose, onCorrection }: VideoModalProps) {
  // Early return before any hooks to avoid conditional hook calls
  if (!result) return null

  return <VideoModalContent result={result} searchQuery={searchQuery} onClose={onClose} onCorrection={onCorrection} />
}

function VideoModalContent({ result, searchQuery = '', onClose, onCorrection }: VideoModalProps & { result: SearchResult }) {
  const [transcript, setTranscript] = React.useState<TranscriptLine[]>([])
  const [isLoadingTranscript, setIsLoadingTranscript] = React.useState(false)
  const transcriptBattleId = result.battleUuid && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(result.battleUuid)
    ? result.battleUuid
    : null

  // Extract video ID from youtube URL
  const videoId = result.battle.youtubeUrl.includes('v=')
    ? result.battle.youtubeUrl.split('v=')[1].split('&')[0]
    : '';

  const playerId = `youtube-player-${result.id}`

  // YouTube player integration
  const { player, isReady, isPlaying, currentTime } = useYouTubePlayer(
    playerId,
    videoId,
    result.timestamp
  )

  // Keyboard controls for video playback
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't interfere with inputs
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return
      if (!player || !isReady) return

      switch (e.key) {
        case ' ':
          e.preventDefault()
          if (isPlaying) {
            player.pauseVideo()
          } else {
            player.playVideo()
          }
          break
        case 'ArrowLeft':
          e.preventDefault()
          player.seekTo(Math.max(0, player.getCurrentTime() - 5), true)
          break
        case 'ArrowRight':
          e.preventDefault()
          player.seekTo(player.getCurrentTime() + 5, true)
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [player, isReady, isPlaying])

  // Fetch transcript when modal opens
  React.useEffect(() => {
    if (transcriptBattleId) {
      // Try cache first
      const cacheKey = generateCacheKey('transcript', transcriptBattleId)
      const cached = transcriptCache.get<TranscriptLine[]>(cacheKey)

      if (cached) {
        setTranscript(cached)
        return
      }

      // Fetch if not cached
      setIsLoadingTranscript(true)
      transcriptService
        .getTranscript(transcriptBattleId)
        .then((data) => {
          transcriptCache.set(cacheKey, data) // Cache the result
          setTranscript(data)
        })
        .catch((err) => {
          console.error('Failed to load transcript:', err)
          toast({
            title: "Lyrics konnten nicht geladen werden",
            description: "Lyrics sind für dieses Battle nicht verfügbar",
            variant: "destructive",
          })
        })
        .finally(() => setIsLoadingTranscript(false))
    }
  }, [transcriptBattleId])

  const shouldHighlight = result.type === 'exact'
  const displayLine = shouldHighlight ? highlightKeywords(result.line, searchQuery) : result.line

  return (
    <Dialog open={!!result} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="video-modal-content max-w-4xl bg-background border-primary/20 p-0 !flex !flex-col gap-0 overflow-y-auto overflow-x-hidden sm:rounded-lg">
        <DialogHeader className="p-4 sm:p-6 bg-card/50 relative">
          {onCorrection && (
            <button
              onClick={() => onCorrection(result)}
              className="absolute top-3 sm:top-4 right-3 sm:right-4 group flex items-center gap-2 transition-all duration-300 hover:pr-3 z-50"
              title="Korrektur einreichen"
              aria-label="Fehler melden"
            >
              <span className="hidden sm:inline text-xs font-semibold text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                Fehler gefunden?
              </span>
              <div className="w-5 h-5 rounded-full bg-red-500 group-hover:bg-red-600 transition-colors flex-shrink-0 flex items-center justify-center">
                <span className="text-white text-xs font-bold">!</span>
              </div>
            </button>
          )}
          <DialogTitle className="text-primary font-headline flex items-center gap-2 pr-10 text-sm sm:text-base min-w-0 overflow-hidden">
            <Badge variant="outline" className="text-[10px] font-code border-primary/30 text-primary flex-shrink-0">
              {result.battle.league === 'DLTLLY' ? (
                <img
                  src="/league-dltlly.png"
                  alt="DLTLLY"
                  className="w-3 h-3 mr-1 object-contain"
                />
              ) : (
                <Swords className="w-3 h-3 mr-1" />
              )}
              {result.battle.league}
            </Badge>
            <span className="truncate min-w-0">{result.battle.title}</span>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Battle-Video mit synchronisierten Lyrics ansehen
          </DialogDescription>
        </DialogHeader>
        <div className="aspect-video w-full max-w-full bg-black overflow-hidden">
          <div id={playerId} className="w-full h-full" />
        </div>

        {/* Rewind button + keyboard hints */}
        <div className="px-4 sm:px-6 pt-3 pb-2 bg-card/30 border-b border-border/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => player?.seekTo(result.timestamp, true)}
                disabled={!isReady}
                className="gap-1.5 h-8 text-xs transition-all duration-300"
              >
                <RotateCcw className="w-3 h-3" />
                Zur Zeile spulen
              </Button>
              <span className="text-xs text-muted-foreground">
                {Math.floor(result.timestamp / 60)}:{(result.timestamp % 60).toString().padStart(2, '0')}
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-3 text-[10px] text-muted-foreground/60">
              <span><kbd className="px-1 py-0.5 rounded border border-border/40 bg-muted/30 font-mono">Space</kbd> Play/Pause</span>
              <span><kbd className="px-1 py-0.5 rounded border border-border/40 bg-muted/30 font-mono">←→</kbd> 5s spulen</span>
              <span><kbd className="px-1 py-0.5 rounded border border-border/40 bg-muted/30 font-mono">Esc</kbd> Schließen</span>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-hidden">
          <div className="min-w-0">
            <p className="text-base sm:text-lg font-bold text-foreground mb-2 italic break-words [overflow-wrap:anywhere]">"{displayLine}"</p>
            <p className="text-xs sm:text-sm text-muted-foreground">— {result.rapper.name} in {result.battle.league}</p>
          </div>

          {/* Live karaoke lyrics */}
          {transcript.length > 0 ? (
            <div className="border-t border-border/30 pt-4 sm:pt-6">
              <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                Live-Lyrics
              </h4>
              <KaraokeLyrics
                transcript={transcript}
                currentTime={currentTime}
                isPlaying={isPlaying}
              />
            </div>
          ) : isLoadingTranscript ? (
            <div className="text-center py-6 sm:py-8 border-t border-border/30 pt-4 sm:pt-6">
              <div className="animate-pulse text-sm text-muted-foreground">
                Lyrics werden geladen...
              </div>
            </div>
          ) : !transcriptBattleId ? (
            <div className="text-center py-6 sm:py-8 border-t border-border/30 pt-4 sm:pt-6">
              <div className="text-sm text-muted-foreground">
                Lyrics sind für dieses Ergebnis nicht verfügbar.
              </div>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}

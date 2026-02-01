/**
 * Karaoke Lyrics Component
 * Displays real-time synced lyrics with current line highlighting
 */

"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import type { TranscriptLine } from "@/lib/api/types"

interface KaraokeLyricsProps {
  transcript: TranscriptLine[]
  currentTime: number
  isPlaying: boolean
  className?: string
}

/**
 * Find the index of the active line based on current playback time
 */
function getActiveLineIndex(
  transcript: TranscriptLine[],
  currentTime: number
): number {
  if (transcript.length === 0) return -1

  // Find the line that contains the current time
  const index = transcript.findIndex((line, idx) => {
    const nextLine = transcript[idx + 1]
    const lineStart = line.start_time
    const lineEnd = nextLine?.start_time ?? Infinity

    return lineStart <= currentTime && currentTime < lineEnd
  })

  return index
}

/**
 * Get visible lines (current + context)
 */
function getVisibleLines(
  transcript: TranscriptLine[],
  activeIndex: number,
  contextBefore: number = 0,
  contextAfter: number = 2
): TranscriptLine[] {
  if (activeIndex === -1) {
    // No active line yet, show first few lines
    return transcript.slice(0, contextAfter + 1)
  }

  const startIndex = Math.max(0, activeIndex - contextBefore)
  const endIndex = Math.min(transcript.length, activeIndex + contextAfter + 1)

  return transcript.slice(startIndex, endIndex)
}

export function KaraokeLyrics({
  transcript,
  currentTime,
  isPlaying,
  className,
}: KaraokeLyricsProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const activeLineRef = React.useRef<HTMLDivElement>(null)

  const activeIndex = React.useMemo(
    () => getActiveLineIndex(transcript, currentTime),
    [transcript, currentTime]
  )

  const visibleLines = React.useMemo(
    () => getVisibleLines(transcript, activeIndex, 0, 2),
    [transcript, activeIndex]
  )

  // Auto-scroll to keep active line centered
  React.useEffect(() => {
    if (activeLineRef.current && containerRef.current && isPlaying) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }, [activeIndex, isPlaying])

  if (transcript.length === 0) {
    return (
      <div className={cn("text-center py-8", className)}>
        <p className="text-sm text-muted-foreground">
          No lyrics available for this battle
        </p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={cn("space-y-2 sm:space-y-3 py-2 sm:py-4 max-h-48 sm:max-h-64 overflow-y-auto", className)}
    >
      {visibleLines.map((line) => {
        const isActive = transcript[activeIndex]?.id === line.id
        const isPast = activeIndex !== -1 && line.sequence_index < transcript[activeIndex].sequence_index

        return (
          <div
            key={line.id}
            ref={isActive ? activeLineRef : null}
            className={cn(
              "transition-all duration-300 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg break-words",
              isActive && "text-sm sm:text-base font-bold text-primary bg-primary/10 shadow-sm",
              !isActive && !isPast && "text-xs sm:text-sm text-muted-foreground",
              isPast && "text-xs sm:text-sm text-muted-foreground/50"
            )}
          >
            {line.speaker_label && (
              <span className="text-[10px] sm:text-xs uppercase font-semibold mr-1 sm:mr-2 tracking-wider">
                {line.speaker_label}:
              </span>
            )}
            <span>{line.content}</span>
          </div>
        )
      })}
    </div>
  )
}

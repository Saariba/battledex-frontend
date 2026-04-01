"use client"

import { Trophy, CircleOff, RotateCcw, PlayCircle, Share2, Clock, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShareCardContent, type ShareCardQuizData } from "@/components/quiz/share-card"
import { extractYouTubeId } from "@/lib/api/utils"
import { useCountdownToMidnight } from "@/hooks/use-countdown"
import { useShareCard } from "@/hooks/use-share-card"

interface QuizResultProps {
  solved: boolean
  correctRapperName: string
  attemptsUsed: number
  battleId: string
  battleTitle: string | null
  videoUrl: string
  timestamp: number
  autoPlayVideo?: boolean
  resultMessage?: string
  shareText?: string
  showCountdown?: boolean
  guesses?: string[]
  maxGuesses?: number
  streak?: number
  formattedDate?: string
}

export function QuizResult({
  solved,
  correctRapperName,
  attemptsUsed,
  battleId,
  battleTitle,
  videoUrl,
  timestamp,
  autoPlayVideo = false,
  resultMessage,
  shareText,
  showCountdown = false,
  guesses,
  maxGuesses = 5,
  streak = 0,
  formattedDate,
}: QuizResultProps) {
  const countdown = useCountdownToMidnight()
  const { cardRef, isCapturing, shareAsImage } = useShareCard()

  const shareCardData: ShareCardQuizData | null =
    guesses && formattedDate
      ? {
          mode: "quiz",
          date: formattedDate,
          guesses,
          correctRapperName,
          maxGuesses,
          streak,
          solved,
        }
      : null

  const handleShare = async () => {
    if (!shareText) return
    await shareAsImage(shareText)
  }

  const videoId = extractYouTubeId(videoUrl)
  const embedUrl = videoId
    ? `https://www.youtube.com/embed/${videoId}?start=${Math.max(0, Math.floor(timestamp))}&rel=0&autoplay=${autoPlayVideo ? 1 : 0}`
    : null

  return (
    <Card className="animate-fade-in-up border-border/40 bg-card/45 shadow-xl shadow-black/20 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          {solved ? (
            <>
              <Trophy className="h-6 w-6 text-emerald-400" />
              Richtig!
            </>
          ) : (
            <>
              <CircleOff className="h-6 w-6 text-primary" />
              Keine Versuche mehr
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-3xl border border-border/30 bg-background/30 p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Richtiger Rapper
          </p>
          <p className="mt-2 text-3xl font-black uppercase tracking-tight text-foreground">
            {correctRapperName}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {resultMessage || (
              solved
                ? attemptsUsed === 1 ? 'Beim ersten Versuch gelöst!' : `In ${attemptsUsed} Versuchen gelöst.`
                : 'Morgen gibt es eine neue Line. Komm wieder!'
            )}
          </p>
          {battleTitle && (
            <p className="mt-3 text-sm text-muted-foreground">
              Battle: <span className="font-semibold text-foreground">{battleTitle}</span>
            </p>
          )}
        </div>

        <div className="flex gap-3">
          {shareText && (
            <Button onClick={handleShare} disabled={isCapturing} variant="outline" className="rounded-full">
              {isCapturing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
              Teilen
            </Button>
          )}
          <Button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="rounded-full"
          >
            <RotateCcw className="h-4 w-4" />
            Zurück nach oben
          </Button>
        </div>

        {shareCardData && (
          <div style={{ position: "absolute", left: "-9999px", top: 0 }} aria-hidden="true">
            <div ref={cardRef}>
              <ShareCardContent data={shareCardData} />
            </div>
          </div>
        )}

        {showCountdown && (
          <div className="flex items-center gap-3 rounded-2xl border border-border/30 bg-background/30 px-4 py-3">
            <Clock className="h-4 w-4 text-primary" />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Nächstes Quiz in
              </p>
              <p className="font-mono text-lg font-bold text-foreground">{countdown}</p>
            </div>
          </div>
        )}

        {embedUrl && (
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              <PlayCircle className="h-4 w-4 text-primary" />
              Line im Video ansehen
            </div>
            <div className="overflow-hidden rounded-3xl border border-border/30 bg-black shadow-lg shadow-black/20">
              <div className="aspect-video">
                <iframe
                  src={embedUrl}
                  title={`Quiz reveal video for ${correctRapperName}`}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

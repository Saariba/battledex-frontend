"use client"

import { Trophy, CircleOff, Hash, RotateCcw, Share2, Clock, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShareCardContent, type ShareCardChallengeData } from "@/components/quiz/share-card"
import { QuizResult } from "@/components/quiz/quiz-result"
import { useCountdownToMidnight } from "@/hooks/use-countdown"
import { useShareCard } from "@/hooks/use-share-card"

interface ChallengeResultProps {
  completed: boolean
  solvedLineCount: number
  totalLines: number
  totalHintsUsed: number
  correctRapperName: string
  battleId: string
  battleTitle: string | null
  videoUrl: string
  timestamp: number
  autoPlayVideo?: boolean
  shareText?: string
  formattedDate?: string
}

export function ChallengeResult({
  completed,
  solvedLineCount,
  totalLines,
  totalHintsUsed,
  correctRapperName,
  battleId,
  battleTitle,
  videoUrl,
  timestamp,
  autoPlayVideo = false,
  shareText,
  formattedDate,
}: ChallengeResultProps) {
  const countdown = useCountdownToMidnight()
  const { cardRef, isCapturing, shareAsImage } = useShareCard()

  const shareCardData: ShareCardChallengeData | null = formattedDate
    ? {
        mode: "challenge",
        date: formattedDate,
        solvedLineCount,
        totalLines,
        totalHintsUsed,
        completed,
      }
    : null

  const handleShare = async () => {
    if (!shareText) return
    await shareAsImage(shareText)
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/40 bg-card/45 shadow-xl shadow-black/20 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            {completed ? (
              <>
                <Trophy className="h-6 w-6 text-emerald-400" />
                Challenge geschafft!
              </>
            ) : (
              <>
                <CircleOff className="h-6 w-6 text-primary" />
                Challenge vorbei
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl border border-border/30 bg-background/30 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                Score
              </p>
              <p className="mt-2 text-3xl font-black uppercase tracking-tight text-foreground">
                {solvedLineCount} / {totalLines}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Lines gelöst, bevor der Run endete.
              </p>
            </div>
            <div className="rounded-3xl border border-border/30 bg-background/30 p-5">
              <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                <Hash className="h-3.5 w-3.5" />
                Hinweise genutzt
              </p>
              <p className="mt-2 text-3xl font-black uppercase tracking-tight text-foreground">
                {totalHintsUsed}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Fehlversuche über den gesamten Run.
              </p>
            </div>
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

          <div className="flex items-center gap-3 rounded-2xl border border-border/30 bg-background/30 px-4 py-3">
            <Clock className="h-4 w-4 text-primary" />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Nächste Challenge in
              </p>
              <p className="font-mono text-lg font-bold text-foreground">{countdown}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <QuizResult
        solved={completed}
        correctRapperName={correctRapperName}
        attemptsUsed={1}
        battleId={battleId}
        battleTitle={battleTitle}
        videoUrl={videoUrl}
        timestamp={timestamp}
        autoPlayVideo={autoPlayVideo}
        resultMessage={completed ? "Auflösung der letzten gelösten Line." : "Auflösung der Line, die deinen Run beendet hat."}
      />
    </div>
  )
}

"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import { BadgeHelp, Brain, Flame, Layers3, RefreshCw, Star, Zap } from "lucide-react"
import { useDailyQuiz } from "@/hooks/use-daily-quiz"
import { useDailyChallenge } from "@/hooks/use-daily-challenge"
import { useChallengeStats } from "@/hooks/use-challenge-stats"
import { useStats } from "@/hooks/use-stats"
import { useStreak } from "@/hooks/use-streak"
import { ChallengeResult } from "@/components/quiz/challenge-result"
import { Confetti } from "@/components/quiz/confetti"
import { GuessProgress } from "@/components/quiz/guess-progress"
import { QuizGuessInput } from "@/components/quiz/quiz-guess-input"
import { QuizHints } from "@/components/quiz/quiz-hints"
import { QuizHistory } from "@/components/quiz/quiz-history"
import { QuizLineCard } from "@/components/quiz/quiz-line-card"
import { QuizResult } from "@/components/quiz/quiz-result"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

function QuizSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="border-border/40 bg-card/45 backdrop-blur-md">
        <CardHeader>
          <Skeleton className="h-6 w-36 rounded-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full rounded-[28px]" />
        </CardContent>
      </Card>
      <Card className="border-border/40 bg-card/35 backdrop-blur-md">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-12 w-full rounded-2xl" />
          <Skeleton className="h-14 w-full rounded-2xl" />
          <Skeleton className="h-14 w-full rounded-2xl" />
        </CardContent>
      </Card>
    </div>
  )
}

function ErrorState({
  title,
  message,
  onRetry,
}: {
  title: string
  message: string
  onRetry: () => void
}) {
  return (
    <Card className="border-border/40 bg-card/40 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">{message}</p>
        <Button onClick={onRetry} className="rounded-full">
          <RefreshCw className="h-4 w-4" />
          Nochmal versuchen
        </Button>
      </CardContent>
    </Card>
  )
}

function DailyQuizPanel() {
  const {
    quiz,
    status,
    guesses,
    selectedGuess,
    inputValue,
    suggestions,
    activeHintCount,
    submissionInFlight,
    errorMessage,
    correctRapperName,
    battleTitle,
    shouldAutoplayReveal,
    canSubmit,
    guessesRemaining,
    setInput,
    selectSuggestion,
    submitGuess,
    retry,
  } = useDailyQuiz()

  const isComplete = status === "solved" || status === "failed"
  const isSolved = status === "solved"
  const resultRef = useRef<HTMLDivElement>(null)
  const prevGuessCountRef = useRef(guesses.length)
  const [wrongFlash, setWrongFlash] = useState(false)
  const { currentStreak, bestStreak, recordPlay } = useStreak()
  const { recordGame } = useStats()

  useEffect(() => {
    if (guesses.length > prevGuessCountRef.current && !isSolved) {
      setWrongFlash(true)
      const timer = setTimeout(() => setWrongFlash(false), 600)
      prevGuessCountRef.current = guesses.length
      return () => clearTimeout(timer)
    }
    prevGuessCountRef.current = guesses.length
  }, [guesses.length, isSolved])

  const shareText = useMemo(() => {
    if (!isComplete || !quiz) return undefined
    const shortDate = format(new Date(`${quiz.day_key}T12:00:00Z`), "dd.MM.yyyy")
    const emojis = guesses.map((_g, i) =>
      isSolved && i === guesses.length - 1 ? "\u{1F7E9}" : "\u{1F7E5}"
    ).join("")
    const score = isSolved ? `${guesses.length}/5` : "X/5"
    const streakSuffix = currentStreak > 1 ? `\n\u{1F525} ${currentStreak} Tage Streak` : ""
    return `BattleDex Quiz ${shortDate} \u{1F3A4}\n${emojis} (${score})${streakSuffix}\nbattledex.app`
  }, [isComplete, isSolved, guesses, quiz, currentStreak])

  useEffect(() => {
    if (isComplete && shouldAutoplayReveal) {
      recordPlay()
      recordGame(isSolved, guesses.length)
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [isComplete, shouldAutoplayReveal, recordPlay, recordGame, isSolved, guesses.length])

  if (status === "loading") {
    return <QuizSkeleton />
  }

  if (status === "error" || !quiz) {
    return (
      <ErrorState
        title="Tägliches Quiz nicht verfügbar"
        message={errorMessage || "Das tägliche Quiz konnte gerade nicht geladen werden."}
        onRetry={retry}
      />
    )
  }

  const formattedDay = format(new Date(`${quiz.day_key}T12:00:00Z`), "d. MMMM yyyy", { locale: de })

  return (
    <>
    <Confetti active={isSolved && shouldAutoplayReveal} />
    {wrongFlash && (
      <div className="animate-wrong-flash pointer-events-none fixed inset-0 z-40 rounded-3xl border-4 border-primary/60" />
    )}
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
      <div className="space-y-6">
        <QuizLineCard
          dayLabel={`Tägliches Quiz · ${formattedDay}`}
          line={quiz.line}
          contextBefore={quiz.hint_3_context_before}
          contextAfter={quiz.hint_3_context_after}
          showContextBefore={activeHintCount > 1}
          showContextAfter={activeHintCount > 3}
        />

        {!isComplete && (
          <Card className="border-border/40 bg-card/35 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-xl">Dein Tipp</CardTitle>
              <p className="text-sm text-muted-foreground">
                Versuch {guesses.length + 1} von 5. Wähle einen Rapper aus der Liste.
              </p>
            </CardHeader>
            <CardContent>
              <QuizGuessInput
                value={inputValue}
                selectedGuess={selectedGuess}
                suggestions={suggestions}
                disabled={isComplete}
                canSubmit={canSubmit}
                submissionInFlight={submissionInFlight}
                onValueChange={setInput}
                onSelect={selectSuggestion}
                onSubmit={submitGuess}
              />
            </CardContent>
          </Card>
        )}

        {isComplete && correctRapperName && (
          <div ref={resultRef}>
            <QuizResult
              solved={status === "solved"}
              correctRapperName={correctRapperName}
              attemptsUsed={guesses.length}
              battleId={quiz.battle_id}
              battleTitle={battleTitle}
              videoUrl={quiz.video_url}
              timestamp={quiz.timestamp}
              autoPlayVideo={shouldAutoplayReveal}
              shareText={shareText}
              showCountdown
              guesses={guesses}
              maxGuesses={5}
              streak={currentStreak}
              formattedDate={format(new Date(`${quiz.day_key}T12:00:00Z`), "dd.MM.yyyy")}
            />
          </div>
        )}
      </div>

      <div className="space-y-6">
        <Card className="border-border/40 bg-card/35 backdrop-blur-md">
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-center gap-3">
              <GuessProgress maxGuesses={5} guesses={guesses} correctRapperName={correctRapperName} />
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {guessesRemaining} übrig
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/40 bg-background/35 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <Flame className="h-3.5 w-3.5 text-primary" />
                {formattedDay}
              </div>
              {currentStreak > 0 && (
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-amber-400">
                  <Zap className="h-3.5 w-3.5" />
                  {currentStreak} Tage Streak
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <QuizHints
          activeHintCount={activeHintCount}
          year={quiz.hint_2_year}
          opponent={quiz.hint_4_opponent}
        />
        <QuizHistory guesses={guesses} correctRapperName={correctRapperName} />
      </div>
    </div>
    </>
  )
}

function DailyChallengePanel() {
  const {
    challenge,
    status,
    guesses,
    selectedGuess,
    inputValue,
    suggestions,
    activeHintCount,
    submissionInFlight,
    errorMessage,
    correctRapperName,
    battleTitle,
    shouldAutoplayReveal,
    canSubmit,
    guessesRemaining,
    currentLineIndex,
    solvedLineCount,
    totalHintsUsed,
    totalLines,
    setInput,
    selectSuggestion,
    submitGuess,
    retry,
  } = useDailyChallenge()

  const isComplete = status === "completed" || status === "failed"
  const challengeResultRef = useRef<HTMLDivElement>(null)
  const { bestScore, yesterdayScore, recordChallenge } = useChallengeStats()

  useEffect(() => {
    if (isComplete && shouldAutoplayReveal) {
      recordChallenge(solvedLineCount, totalLines)
    }
  }, [isComplete, shouldAutoplayReveal, recordChallenge, solvedLineCount, totalLines])

  const challengeShareText = useMemo(() => {
    if (!isComplete || !challenge) return undefined
    const shortDate = format(new Date(`${challenge.day_key}T12:00:00Z`), "dd.MM.yyyy")
    const completed = status === "completed"
    return `BattleDex Challenge ${shortDate} \u{1F525}\nScore: ${solvedLineCount}/${totalLines} | Hinweise: ${totalHintsUsed}\n${completed ? "\u{1F3C6} Geschafft!" : "\u{274C} Vorbei"}\nbattledex.app`
  }, [isComplete, status, solvedLineCount, totalLines, totalHintsUsed, challenge])

  useEffect(() => {
    if (isComplete && shouldAutoplayReveal && challengeResultRef.current) {
      challengeResultRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [isComplete, shouldAutoplayReveal])

  if (status === "loading") {
    return <QuizSkeleton />
  }

  if (status === "error" || !challenge) {
    return (
      <ErrorState
        title="Tägliche Challenge nicht verfügbar"
        message={errorMessage || "Die tägliche Challenge konnte gerade nicht geladen werden."}
        onRetry={retry}
      />
    )
  }

  const formattedDay = format(new Date(`${challenge.day_key}T12:00:00Z`), "d. MMMM yyyy", { locale: de })

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
      <div className="space-y-6">
        <QuizLineCard
          dayLabel={`Challenge · Zeile ${currentLineIndex + 1} von ${totalLines}`}
          line={challenge.line}
          contextBefore={challenge.hint_3_context_before}
          contextAfter={challenge.hint_3_context_after}
          showContextBefore={activeHintCount > 1}
          showContextAfter={activeHintCount > 3}
        />

        {!isComplete && (
          <Card className="border-border/40 bg-card/35 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-xl">Bleib drin</CardTitle>
              <p className="text-sm text-muted-foreground">
                Errate die Line, um weiterzukommen. Jeder Fehler schaltet einen Hinweis frei. Fünf Fehler beenden den Run.
              </p>
            </CardHeader>
            <CardContent>
              <QuizGuessInput
                value={inputValue}
                selectedGuess={selectedGuess}
                suggestions={suggestions}
                disabled={isComplete}
                canSubmit={canSubmit}
                submissionInFlight={submissionInFlight}
                onValueChange={setInput}
                onSelect={selectSuggestion}
                onSubmit={submitGuess}
              />
            </CardContent>
          </Card>
        )}

        {isComplete && correctRapperName && (
          <div ref={challengeResultRef}>
            <ChallengeResult
              completed={status === "completed"}
              solvedLineCount={solvedLineCount}
              totalLines={totalLines}
              totalHintsUsed={totalHintsUsed}
              correctRapperName={correctRapperName}
              battleId={challenge.battle_id}
              battleTitle={battleTitle}
              videoUrl={challenge.video_url}
              timestamp={challenge.timestamp}
              autoPlayVideo={shouldAutoplayReveal}
              shareText={challengeShareText}
              formattedDate={format(new Date(`${challenge.day_key}T12:00:00Z`), "dd.MM.yyyy")}
            />
          </div>
        )}
      </div>

      <div className="space-y-6">
        <Card className="border-border/40 bg-card/35 backdrop-blur-md">
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-center gap-3">
              <GuessProgress maxGuesses={5} guesses={guesses} correctRapperName={correctRapperName} />
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {guessesRemaining} übrig
              </span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/40 bg-background/35 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <Flame className="h-3.5 w-3.5 text-primary" />
                {formattedDay}
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border/40 bg-background/35 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <Layers3 className="h-3.5 w-3.5 text-primary" />
                Zeile {currentLineIndex + 1} / {totalLines}
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border/40 bg-background/35 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <Brain className="h-3.5 w-3.5 text-primary" />
                {solvedLineCount} gelöst
              </div>
              {bestScore > 0 && (
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-amber-400">
                  <Star className="h-3.5 w-3.5" />
                  Rekord: {bestScore}
                </div>
              )}
              {yesterdayScore !== null && (
                <div className="inline-flex items-center gap-2 rounded-full border border-border/40 bg-background/35 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  <Flame className="h-3.5 w-3.5 text-primary" />
                  Gestern: {yesterdayScore}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <QuizHints
          activeHintCount={activeHintCount}
          year={challenge.hint_2_year}
          opponent={challenge.hint_4_opponent}
        />
        <QuizHistory guesses={guesses} correctRapperName={correctRapperName} />

        <Card className="border-border/40 bg-card/35 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-lg">Zusammenfassung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span>Fortschritt</span>
                <span className="font-semibold text-foreground">{solvedLineCount} / {totalLines}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-background/40" role="progressbar" aria-valuenow={solvedLineCount} aria-valuemin={0} aria-valuemax={totalLines} aria-label="Challenge-Fortschritt">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${totalLines > 0 ? (solvedLineCount / totalLines) * 100 : 0}%` }}
                />
              </div>
            </div>
            <p>Bisher genutzte Hinweise: <span className="font-semibold text-foreground">{totalHintsUsed}</span></p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function QuizPage() {
  const [activeTab, setActiveTab] = useState("quiz")

  useEffect(() => {
    if (window.location.hash === "#challenge") {
      setActiveTab("challenge")
    }
  }, [])

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value)
    window.history.replaceState(null, "", value === "challenge" ? "#challenge" : "#")
  }, [])

  return (
    <main className="relative flex-1 px-4 py-8 md:px-8 md:py-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] grid-fade opacity-50" />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-6">
        <section className="overflow-hidden rounded-3xl border border-border/40 bg-card/40 px-5 py-5 shadow-2xl shadow-black/20 backdrop-blur-md sm:rounded-[36px] sm:px-6 sm:py-8 md:px-8">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="inline-flex items-center gap-2 self-start rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
              <BadgeHelp className="h-3.5 w-3.5" />
              Täglich neu
            </div>
            <div className="space-y-1 sm:space-y-2">
              <h1 className="text-3xl font-black uppercase tracking-tight sm:text-5xl">
                Errate den Rapper
              </h1>
              <p className="max-w-3xl text-sm text-muted-foreground sm:text-base">
                Eine Line. Fünf Versuche. Wer hat&apos;s gesagt?
              </p>
            </div>
          </div>
        </section>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="h-auto rounded-[24px] border border-border/30 bg-card/40 p-1.5">
            <TabsTrigger value="quiz" className="gap-2 rounded-[18px] px-4 py-2.5 data-[state=active]:bg-background/90">
              <Brain className="h-4 w-4" />
              Tägliches Quiz
            </TabsTrigger>
            <TabsTrigger value="challenge" className="gap-2 rounded-[18px] px-4 py-2.5 data-[state=active]:bg-background/90">
              <Flame className="h-4 w-4" />
              Tägliche Challenge
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quiz" className="mt-0 animate-tab-fade-in">
            <DailyQuizPanel />
          </TabsContent>

          <TabsContent value="challenge" className="mt-0 animate-tab-fade-in">
            <DailyChallengePanel />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}

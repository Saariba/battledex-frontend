"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import { quizService } from "@/lib/api/quiz"
import type {
  DailyChallengeGuessResponse,
  DailyChallengeLinePayload,
  QuizRapperSuggestion,
} from "@/lib/api/types"

const MAX_GUESSES = 5

type ChallengeStatus = "loading" | "ready" | "completed" | "failed" | "error"

interface StoredChallengeState {
  challenge_id: string
  day_key: string
  current_line_index: number
  solved_line_count: number
  total_hints_used: number
  guesses: string[]
  completed: boolean
  failed: boolean
  completed_at?: string
  correct_rapper_name?: string | null
  battle_title?: string | null
}

function getStorageKey(challengeId: string): string {
  return `battledex_quiz_challenge_state:${challengeId}`
}

function readStoredState(challengeId: string): StoredChallengeState | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(getStorageKey(challengeId))
    return raw ? (JSON.parse(raw) as StoredChallengeState) : null
  } catch {
    return null
  }
}

function writeStoredState(state: StoredChallengeState): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(getStorageKey(state.challenge_id), JSON.stringify(state))
  } catch {
    // Ignore persistence errors.
  }
}

export function useDailyChallenge() {
  const [challenge, setChallenge] = useState<DailyChallengeLinePayload | null>(null)
  const [status, setStatus] = useState<ChallengeStatus>("loading")
  const [guesses, setGuesses] = useState<string[]>([])
  const [selectedGuess, setSelectedGuess] = useState<QuizRapperSuggestion | null>(null)
  const [inputValue, setInputValue] = useState("")
  const [suggestions, setSuggestions] = useState<QuizRapperSuggestion[]>([])
  const [submissionInFlight, setSubmissionInFlight] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [correctRapperName, setCorrectRapperName] = useState<string | null>(null)
  const [battleTitle, setBattleTitle] = useState<string | null>(null)
  const [shouldAutoplayReveal, setShouldAutoplayReveal] = useState(false)
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const [solvedLineCount, setSolvedLineCount] = useState(0)
  const [totalHintsUsed, setTotalHintsUsed] = useState(0)
  const requestIdRef = useRef(0)

  const loadLine = useCallback(async (lineIndex: number) => {
    const payload = await quizService.getDailyChallenge(lineIndex)
    setChallenge(payload)
    setCurrentLineIndex(payload.line_index)
    return payload
  }, [])

  const loadChallenge = useCallback(async () => {
    setStatus("loading")
    setErrorMessage(null)
    setInputValue("")
    setSelectedGuess(null)
    setSuggestions([])

    try {
      const firstLine = await loadLine(0)
      const stored = readStoredState(firstLine.challenge_id)

      if (stored && stored.day_key === firstLine.day_key) {
        setSolvedLineCount(stored.solved_line_count)
        setTotalHintsUsed(stored.total_hints_used)
        setGuesses(stored.guesses)
        setCorrectRapperName(stored.correct_rapper_name ?? null)
        setBattleTitle(stored.battle_title ?? null)
        setShouldAutoplayReveal(false)

        if (stored.completed) {
          await loadLine(Math.min(stored.current_line_index, firstLine.total_lines - 1))
          setCurrentLineIndex(stored.current_line_index)
          setStatus("completed")
          return
        }

        if (stored.failed) {
          await loadLine(Math.min(stored.current_line_index, firstLine.total_lines - 1))
          setCurrentLineIndex(stored.current_line_index)
          setStatus("failed")
          return
        }

        if (stored.current_line_index > 0) {
          await loadLine(Math.min(stored.current_line_index, firstLine.total_lines - 1))
        }
        setCurrentLineIndex(stored.current_line_index)
        setStatus("ready")
        return
      }

      setSolvedLineCount(0)
      setTotalHintsUsed(0)
      setGuesses([])
      setCorrectRapperName(null)
      setBattleTitle(null)
      setShouldAutoplayReveal(false)
      setCurrentLineIndex(firstLine.line_index)
      setStatus("ready")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Die heutige Challenge konnte nicht geladen werden"
      setErrorMessage(message)
      setStatus("error")
    }
  }, [loadLine])

  useEffect(() => {
    loadChallenge()
  }, [loadChallenge])

  useEffect(() => {
    if (!challenge) return

    writeStoredState({
      challenge_id: challenge.challenge_id,
      day_key: challenge.day_key,
      current_line_index: currentLineIndex,
      solved_line_count: solvedLineCount,
      total_hints_used: totalHintsUsed,
      guesses,
      completed: status === "completed",
      failed: status === "failed",
      completed_at: new Date().toISOString(),
      correct_rapper_name: correctRapperName,
      battle_title: battleTitle,
    })
  }, [
    challenge,
    currentLineIndex,
    solvedLineCount,
    totalHintsUsed,
    guesses,
    status,
    correctRapperName,
    battleTitle,
  ])

  useEffect(() => {
    if (!challenge || status === "completed" || status === "failed") {
      setSuggestions([])
      return
    }

    const query = inputValue.trim()
    if (query.length < 1) {
      setSuggestions([])
      return
    }

    const currentRequestId = ++requestIdRef.current
    const timeout = window.setTimeout(async () => {
      try {
        const nextSuggestions = await quizService.searchQuizRappers(query)
        if (requestIdRef.current === currentRequestId) {
          setSuggestions(nextSuggestions)
        }
      } catch {
        if (requestIdRef.current === currentRequestId) {
          setSuggestions([])
        }
      }
    }, 180)

    return () => window.clearTimeout(timeout)
  }, [inputValue, status, challenge])

  const activeHintCount = useMemo(() => {
    return Math.min(guesses.length, MAX_GUESSES)
  }, [guesses.length])

  const setInput = useCallback((value: string) => {
    setInputValue(value)
    if (selectedGuess && selectedGuess.name !== value) {
      setSelectedGuess(null)
    }
  }, [selectedGuess])

  const selectSuggestion = useCallback((suggestion: QuizRapperSuggestion) => {
    setSelectedGuess(suggestion)
    setInputValue(suggestion.name)
    setSuggestions([])
  }, [])

  const submitGuess = useCallback(async () => {
    if (!challenge || !selectedGuess || submissionInFlight) return
    if (status === "completed" || status === "failed") return

    if (guesses.some((guess) => guess.toLocaleLowerCase() === selectedGuess.name.toLocaleLowerCase())) {
      toast.error("Diesen Rapper hast du schon getippt")
      return
    }

    // Backend already revealed the answer (its max < ours) — check locally
    if (correctRapperName) {
      const nextGuesses = [...guesses, selectedGuess.name]
      setGuesses(nextGuesses)
      setInputValue("")
      setSelectedGuess(null)
      setSuggestions([])

      const isCorrect = selectedGuess.name.toLocaleLowerCase() === correctRapperName.toLocaleLowerCase()

      if (isCorrect) {
        const usedHintsForLine = Math.max(0, nextGuesses.length - 1)
        setSolvedLineCount((prev) => prev + 1)
        setTotalHintsUsed((current) => current + usedHintsForLine)
        setShouldAutoplayReveal(true)

        if (challenge.line_index + 1 >= challenge.total_lines) {
          setStatus("completed")
          return
        }

        toast.success(`Richtig! Weiter zu Zeile ${challenge.line_index + 2}.`)
        const nextLine = await loadLine(challenge.line_index + 1)
        setCurrentLineIndex(nextLine.line_index)
        setGuesses([])
        setCorrectRapperName(null)
        setBattleTitle(null)
        setShouldAutoplayReveal(false)
        setStatus("ready")
      } else if (nextGuesses.length >= MAX_GUESSES) {
        setTotalHintsUsed((current) => current + nextGuesses.length)
        setShouldAutoplayReveal(true)
        setStatus("failed")
      }
      return
    }

    setSubmissionInFlight(true)
    try {
      const result: DailyChallengeGuessResponse = await quizService.submitChallengeGuess({
        challenge_id: challenge.challenge_id,
        line_index: challenge.line_index,
        guess_name: selectedGuess.name,
        prior_guesses: guesses,
      })

      const nextGuesses = [...guesses, selectedGuess.name]
      setGuesses(nextGuesses)
      setInputValue("")
      setSelectedGuess(null)
      setSuggestions([])

      if (result.correct) {
        const usedHintsForLine = Math.max(0, result.guesses_used - 1)
        const nextSolvedCount = solvedLineCount + 1
        setSolvedLineCount(nextSolvedCount)
        setTotalHintsUsed((current) => current + usedHintsForLine)
        setCorrectRapperName(result.correct_rapper_name)
        setBattleTitle(result.battle_title)
        setShouldAutoplayReveal(true)

        if (result.challenge_complete) {
          setStatus("completed")
          return
        }

        toast.success(`Richtig! Weiter zu Zeile ${challenge.line_index + 2}.`)
        const nextLine = await loadLine(challenge.line_index + 1)
        setCurrentLineIndex(nextLine.line_index)
        setGuesses([])
        setCorrectRapperName(null)
        setBattleTitle(null)
        setShouldAutoplayReveal(false)
        setStatus("ready")
        return
      }

      if (result.failed_run) {
        setCorrectRapperName(result.correct_rapper_name)
        setBattleTitle(result.battle_title)
        if (nextGuesses.length >= MAX_GUESSES) {
          setTotalHintsUsed((current) => current + result.guesses_used)
          setShouldAutoplayReveal(true)
          setStatus("failed")
        } else {
          // Backend done but we still have guesses — continue
          setShouldAutoplayReveal(false)
        }
        return
      }

      setShouldAutoplayReveal(false)
      setStatus("ready")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Tipp konnte nicht gesendet werden"
      toast.error(message)
    } finally {
      setSubmissionInFlight(false)
    }
  }, [challenge, selectedGuess, submissionInFlight, status, guesses, solvedLineCount, loadLine, correctRapperName])

  return {
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
    canSubmit: Boolean(selectedGuess) && status === "ready" && !submissionInFlight,
    guessesRemaining: Math.max(0, MAX_GUESSES - guesses.length),
    currentLineIndex,
    solvedLineCount,
    totalHintsUsed,
    totalLines: challenge?.total_lines ?? 0,
    setInput,
    selectSuggestion,
    submitGuess,
    retry: loadChallenge,
  }
}

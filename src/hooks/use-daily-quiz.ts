"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { quizService } from '@/lib/api/quiz'
import type {
  DailyQuizPayload,
  DailyQuizGuessResponse,
  QuizRapperSuggestion,
} from '@/lib/api/types'

const MAX_GUESSES = 5

type QuizStatus = 'loading' | 'ready' | 'solved' | 'failed' | 'error'

interface StoredQuizState {
  quiz_id: string
  day_key: string
  guesses: string[]
  solved: boolean
  failed: boolean
  completed_at?: string
  correct_rapper_name?: string | null
  battle_title?: string | null
}

function getStorageKey(quizId: string): string {
  return `battledex_quiz_state:${quizId}`
}

function readStoredState(quizId: string): StoredQuizState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(getStorageKey(quizId))
    return raw ? JSON.parse(raw) as StoredQuizState : null
  } catch {
    return null
  }
}

function writeStoredState(state: StoredQuizState): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(getStorageKey(state.quiz_id), JSON.stringify(state))
  } catch {
    // Silently ignore persistence issues.
  }
}

export function useDailyQuiz() {
  const [quiz, setQuiz] = useState<DailyQuizPayload | null>(null)
  const [status, setStatus] = useState<QuizStatus>('loading')
  const [guesses, setGuesses] = useState<string[]>([])
  const [selectedGuess, setSelectedGuess] = useState<QuizRapperSuggestion | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [suggestions, setSuggestions] = useState<QuizRapperSuggestion[]>([])
  const [submissionInFlight, setSubmissionInFlight] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [correctRapperName, setCorrectRapperName] = useState<string | null>(null)
  const [battleTitle, setBattleTitle] = useState<string | null>(null)
  const [shouldAutoplayReveal, setShouldAutoplayReveal] = useState(false)
  const requestIdRef = useRef(0)

  const hydratedStatus = useMemo<QuizStatus>(() => {
    if (status === 'error' || status === 'loading') {
      return status
    }
    if (correctRapperName && guesses.length > 0 && guesses[guesses.length - 1] === correctRapperName) {
      return 'solved'
    }
    if (guesses.length >= MAX_GUESSES) {
      return 'failed'
    }
    return 'ready'
  }, [status, guesses, correctRapperName])

  const activeHintCount = useMemo(() => {
    if (hydratedStatus === 'solved') {
      return Math.max(0, guesses.length - 1)
    }
    return Math.min(guesses.length, MAX_GUESSES)
  }, [hydratedStatus, guesses.length])

  const loadQuiz = useCallback(async () => {
    setStatus('loading')
    setErrorMessage(null)

    try {
      const payload = await quizService.getDailyQuiz()
      setQuiz(payload)

      const stored = readStoredState(payload.quiz_id)
      if (stored && stored.day_key === payload.day_key) {
        setGuesses(stored.guesses)
        setCorrectRapperName(stored.correct_rapper_name ?? null)
        setBattleTitle(stored.battle_title ?? null)
        setShouldAutoplayReveal(false)
        if (stored.solved) {
          setStatus('solved')
        } else if (stored.failed) {
          setStatus('failed')
        } else {
          setStatus('ready')
        }
      } else {
        setGuesses([])
        setCorrectRapperName(null)
        setBattleTitle(null)
        setShouldAutoplayReveal(false)
        setStatus('ready')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Das heutige Quiz konnte nicht geladen werden'
      setErrorMessage(message)
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    loadQuiz()
  }, [loadQuiz])

  useEffect(() => {
    if (!quiz) return

    writeStoredState({
      quiz_id: quiz.quiz_id,
      day_key: quiz.day_key,
      guesses,
      solved: hydratedStatus === 'solved',
      failed: hydratedStatus === 'failed',
      completed_at: new Date().toISOString(),
      correct_rapper_name: correctRapperName,
      battle_title: battleTitle,
    })
  }, [quiz, guesses, hydratedStatus, correctRapperName, battleTitle])

  useEffect(() => {
    if (!quiz || hydratedStatus === 'solved' || hydratedStatus === 'failed') {
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
  }, [inputValue, hydratedStatus, quiz])

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
    if (!quiz || !selectedGuess || submissionInFlight) return
    if (hydratedStatus === 'solved' || hydratedStatus === 'failed') return

    if (guesses.some((guess) => guess.toLocaleLowerCase() === selectedGuess.name.toLocaleLowerCase())) {
      toast.error('Diesen Rapper hast du schon getippt')
      return
    }

    // Backend already revealed the answer (its max < ours) — check locally
    if (correctRapperName) {
      const nextGuesses = [...guesses, selectedGuess.name]
      setGuesses(nextGuesses)
      setInputValue('')
      setSelectedGuess(null)
      setSuggestions([])
      setShouldAutoplayReveal(true)
      // hydratedStatus will derive solved/failed from guesses + correctRapperName
      return
    }

    setSubmissionInFlight(true)
    try {
      const result: DailyQuizGuessResponse = await quizService.submitGuess({
        quiz_id: quiz.quiz_id,
        guess_name: selectedGuess.name,
        prior_guesses: guesses,
      })

      const nextGuesses = [...guesses, selectedGuess.name]
      setGuesses(nextGuesses)
      setInputValue('')
      setSelectedGuess(null)
      setSuggestions([])

      if (result.completed) {
        setCorrectRapperName(result.correct_rapper_name)
        setBattleTitle(result.battle_title)
        if (result.correct || nextGuesses.length >= MAX_GUESSES) {
          setShouldAutoplayReveal(true)
          setStatus(result.correct ? 'solved' : 'failed')
        } else {
          // Backend done but we still have guesses — continue
          setShouldAutoplayReveal(false)
          setStatus('ready')
        }
      } else {
        setShouldAutoplayReveal(false)
        setStatus('ready')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Tipp konnte nicht gesendet werden'
      toast.error(message)
    } finally {
      setSubmissionInFlight(false)
    }
  }, [quiz, selectedGuess, submissionInFlight, hydratedStatus, guesses, correctRapperName])

  return {
    quiz,
    status: hydratedStatus,
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
    canSubmit: Boolean(selectedGuess) && hydratedStatus === 'ready' && !submissionInFlight,
    guessesRemaining: Math.max(0, MAX_GUESSES - guesses.length),
    setInput,
    selectSuggestion,
    submitGuess,
    retry: loadQuiz,
  }
}

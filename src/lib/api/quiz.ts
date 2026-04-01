import { config } from '@/lib/config'
import { apiRequest } from './client'
import type {
  DailyChallengeGuessRequest,
  DailyChallengeGuessResponse,
  DailyChallengeLinePayload,
  DailyQuizPayload,
  DailyQuizGuessRequest,
  DailyQuizGuessResponse,
  QuizRapperSuggestion,
  QuizRapperSuggestionsResponse,
} from './types'

const DOUBLE_SLASH_SUFFIX_REGEX = /\s*\/\/.*$/
const DOUBLE_PIPE_SUFFIX_REGEX = /\s*\|\|.*$/
const RAP_BATTLE_SUFFIX_REGEX = /\s*(?:\/\/|[-_/|])\s*rap\s*battle.*$|\s+rap\s*battle.*$/i

function canonicalizeRapperName(name: string): string {
  const trimmed = name
    .trim()
    .replace(DOUBLE_SLASH_SUFFIX_REGEX, '')
    .replace(DOUBLE_PIPE_SUFFIX_REGEX, '')
    .replace(RAP_BATTLE_SUFFIX_REGEX, '')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/^[\s\-_\/|]+|[\s\-_\/|]+$/g, '')
  const mcMatch = /^mc\s+(.+)$/i.exec(trimmed)
  if (mcMatch) {
    return `MC ${mcMatch[1].trim()}`
  }
  return trimmed
}

function normalizeRapperKey(name: string): string {
  return canonicalizeRapperName(name)
    .toLocaleLowerCase('en-US')
    .normalize('NFKD')
    .replace(/[^\p{L}\p{N}]+/gu, '')
}

export const quizService = {
  async getDailyQuiz(): Promise<DailyQuizPayload> {
    return apiRequest<DailyQuizPayload>(config.endpoints.quizDaily, {
      method: 'GET',
    })
  },

  async submitGuess(request: DailyQuizGuessRequest): Promise<DailyQuizGuessResponse> {
    return apiRequest<DailyQuizGuessResponse>(config.endpoints.quizGuess, {
      method: 'POST',
      body: request,
    })
  },

  async getDailyChallenge(lineIndex: number): Promise<DailyChallengeLinePayload> {
    return apiRequest<DailyChallengeLinePayload>(
      `${config.endpoints.quizChallengeDaily}?line_index=${lineIndex}`,
      { method: 'GET' }
    )
  },

  async submitChallengeGuess(request: DailyChallengeGuessRequest): Promise<DailyChallengeGuessResponse> {
    return apiRequest<DailyChallengeGuessResponse>(config.endpoints.quizChallengeGuess, {
      method: 'POST',
      body: request,
    })
  },

  async searchQuizRappers(query: string): Promise<QuizRapperSuggestion[]> {
    const response = await apiRequest<QuizRapperSuggestionsResponse>(
      `${config.endpoints.quizRappers}?q=${encodeURIComponent(query)}`,
      { method: 'GET' }
    )

    const deduped = new Map<string, QuizRapperSuggestion>()
    for (const entry of response.suggestions ?? []) {
      if (!entry?.id || !entry?.name) continue
      const canonicalName = canonicalizeRapperName(entry.name)
      const key = normalizeRapperKey(canonicalName)
      if (!key || key === 'host') continue

      const existing = deduped.get(key)
      if (!existing) {
        deduped.set(key, { id: entry.id, name: canonicalName })
        continue
      }

      const preferNew =
        (canonicalName.startsWith('MC ') && !existing.name.startsWith('MC ')) ||
        canonicalName.length < existing.name.length
      if (preferNew) {
        deduped.set(key, { id: entry.id, name: canonicalName })
      }
    }

    return Array.from(deduped.values())
  },
}

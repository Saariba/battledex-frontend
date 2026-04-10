/**
 * Application configuration
 * Manages environment variables and API endpoints
 */

export const config = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  endpoints: {
    search: '/api/v1/search',
    similarWords: '/api/v1/similar-words',
    battles: '/api/v1/battles',
    rappers: '/api/v1/rappers',
    corrections: '/api/v1/corrections',
    stats: '/api/v1/stats',
    randomLines: '/api/v1/random-lines',
    autocomplete: '/api/v1/autocomplete',
    quizDaily: '/api/v1/quiz/daily',
    quizGuess: '/api/v1/quiz/daily/guess',
    quizChallengeDaily: '/api/v1/quiz/challenge/daily',
    quizChallengeGuess: '/api/v1/quiz/challenge/daily/guess',
    quizRappers: '/api/v1/quiz/rappers',
    analyticsSearch: '/api/v1/analytics/search',
    analyticsPopular: '/api/v1/analytics/popular',
    nounStats: '/api/v1/noun-stats',
    trendingRappers: '/api/v1/trending-rappers',
    wordStats: '/api/v1/word-stats',
    wordStatsTopRappers: '/api/v1/word-stats/top-rappers',
    rappersTotals: '/api/v1/rappers/totals',
    vocabDuel: '/api/v1/vocab-duel',
  },
} as const

export type Config = typeof config

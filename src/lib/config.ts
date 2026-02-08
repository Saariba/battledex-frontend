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
  },
} as const

export type Config = typeof config

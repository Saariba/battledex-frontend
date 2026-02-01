/**
 * Application configuration
 * Manages environment variables and API endpoints
 */

export const config = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  endpoints: {
    search: '/api/v1/search',
    battles: '/api/v1/battles',
    rappers: '/api/v1/rappers',
  },
} as const

export type Config = typeof config

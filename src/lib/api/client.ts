/**
 * Base HTTP client for API requests
 * Provides type-safe requests with error handling
 */

import { config } from '@/lib/config'
import { ApiError } from './types'

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
  headers?: Record<string, string>
}

/**
 * Make a type-safe API request
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, headers = {} } = options

  const url = `${config.apiBaseUrl}${endpoint}`

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  }

  try {
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage = `API request failed: ${response.status}`

      try {
        const errorJson = JSON.parse(errorText)
        errorMessage = errorJson.detail || errorJson.message || errorMessage
      } catch {
        // If parsing fails, use status text
        errorMessage = response.statusText || errorMessage
      }

      throw new ApiError(errorMessage, response.status, errorText)
    }

    const data = await response.json()
    return data as T
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    if (error instanceof Error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new ApiError('Unable to connect to search service')
      }
      throw new ApiError(error.message)
    }

    throw new ApiError('An unexpected error occurred')
  }
}

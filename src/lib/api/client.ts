/**
 * Base HTTP client for API requests
 * Provides type-safe requests with error handling,
 * timeout via AbortController, and retry with exponential backoff.
 */

import { config } from '@/lib/config'
import { ApiError } from './types'

const DEFAULT_TIMEOUT_MS = 15_000
const MAX_RETRIES = 3
const BASE_DELAY_MS = 500

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
  headers?: Record<string, string>
  /** AbortSignal for caller-driven cancellation (e.g. superseded searches) */
  signal?: AbortSignal
  /** Request timeout in ms (default 15 000) */
  timeoutMs?: number
}

/** Returns true for errors that are worth retrying */
function isRetryable(error: unknown): boolean {
  // Network / fetch failures are retryable
  if (error instanceof TypeError) return true

  // 5xx server errors are retryable; 4xx are not
  if (error instanceof ApiError) {
    return error.statusCode !== undefined && error.statusCode >= 500
  }

  return false
}

/**
 * Make a type-safe API request with timeout and automatic retry
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    method = 'GET',
    body,
    headers = {},
    signal: externalSignal,
    timeoutMs = DEFAULT_TIMEOUT_MS,
  } = options

  const url = `${config.apiBaseUrl}${endpoint}`

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  }

  let lastError: unknown

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    // Wait before retrying (skip on first attempt)
    if (attempt > 0) {
      const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1)
      await new Promise((r) => setTimeout(r, delay))
    }

    // If the caller already aborted, bail out immediately
    if (externalSignal?.aborted) {
      throw new ApiError('Request was cancelled')
    }

    // Create a timeout controller and combine with external signal
    const timeoutController = new AbortController()
    const timeoutId = setTimeout(() => timeoutController.abort(), timeoutMs)

    // If an external signal is provided, propagate its abort
    let onExternalAbort: (() => void) | undefined
    if (externalSignal) {
      onExternalAbort = () => timeoutController.abort()
      externalSignal.addEventListener('abort', onExternalAbort, { once: true })
    }

    try {
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        signal: timeoutController.signal,
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
      lastError = error

      // Surface abort/cancellation immediately (no retry)
      if (externalSignal?.aborted) {
        throw new ApiError('Request was cancelled')
      }

      if (
        error instanceof DOMException &&
        error.name === 'AbortError'
      ) {
        throw new ApiError('Request timed out', undefined, undefined)
      }

      // Only retry on retryable errors and if we have attempts left
      if (!isRetryable(error) || attempt === MAX_RETRIES) {
        break
      }
      // Otherwise loop for next attempt
    } finally {
      clearTimeout(timeoutId)
      if (onExternalAbort && externalSignal) {
        externalSignal.removeEventListener('abort', onExternalAbort)
      }
    }
  }

  // Exhausted retries (or non-retryable error) — throw the last error
  if (lastError instanceof ApiError) {
    throw lastError
  }

  if (lastError instanceof Error) {
    if (lastError.name === 'TypeError' && lastError.message.includes('fetch')) {
      throw new ApiError('Unable to connect to search service')
    }
    throw new ApiError(lastError.message)
  }

  throw new ApiError('An unexpected error occurred')
}

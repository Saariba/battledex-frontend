/**
 * Similar Words API service
 * Handles requests for semantically related words
 */

import type { SimilarWordsResponse } from './types'
import { config } from '@/lib/config'
import { apiRequest } from './client'

export const similarWordsService = {
  /**
   * Get similar words for a given query
   * @param query - The word to find similar terms for
   * @param limit - Maximum number of similar words to return (default: 10)
   * @returns Promise with similar words and their occurrence counts
   */
  async getSimilarWords(
    query: string,
    limit: number = 10,
    signal?: AbortSignal,
  ): Promise<SimilarWordsResponse> {
    const url = `${config.endpoints.similarWords}?query=${encodeURIComponent(query)}&limit=${limit}`

    return apiRequest<SimilarWordsResponse>(url, {
      method: 'GET',
      signal,
    })
  },
}

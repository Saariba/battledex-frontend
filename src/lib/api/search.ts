/**
 * Search API service
 * Handles search requests to the backend
 */

import type { SearchResult } from '@/lib/types'
import { config } from '@/lib/config'
import { apiRequest } from './client'
import { adaptBackendResults } from './adapter'
import type { BackendSearchRequest, BackendSearchResponse } from './types'

export const searchService = {
  /**
   * Perform a search query
   * @param query - Search query string
   * @param topK - Number of results to return (default: 20)
   * @param filters - Optional filters for rapper name, league, etc.
   * @returns Array of search results
   */
  async search(
    query: string,
    topK: number = 20,
    filters?: { rapper_name?: string }
  ): Promise<SearchResult[]> {
    const requestBody: BackendSearchRequest = {
      query,
      top_k: topK,
      filters,
    }

    const response = await apiRequest<BackendSearchResponse>(
      config.endpoints.search,
      {
        method: 'POST',
        body: requestBody,
      }
    )

    return adaptBackendResults(response.results)
  },
}

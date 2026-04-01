/**
 * Search API service
 * Handles search requests to the backend
 */

import type { SearchResult } from '@/lib/types'
import { config } from '@/lib/config'
import { apiRequest } from './client'
import { adaptBackendResults } from './adapter'
import type { BackendSearchRequest, BackendSearchResponse, BackendSearchResultItem } from './types'

export const searchService = {
  /**
   * Perform a search query
   */
  async search(
    query: string,
    topK: number = 20,
    mode: 'semantic' | 'keyword' | 'hybrid' = 'hybrid',
    filters?: { rapper_name?: string },
    signal?: AbortSignal,
    offset: number = 0,
  ): Promise<{ results: SearchResult[], total: number, rapperCounts: Record<string, number> }> {
    const backendSearchMode = mode === 'keyword' ? 'text' : mode === 'semantic' ? 'semantic' : 'hybrid'

    const requestBody: BackendSearchRequest = {
      query,
      top_k: topK,
      search_mode: backendSearchMode,
      filters,
      offset,
    }

    const response = await apiRequest<BackendSearchResponse>(
      config.endpoints.search,
      {
        method: 'POST',
        body: requestBody,
        signal,
      }
    )

    return {
      results: adaptBackendResults(response.results),
      total: response.total,
      rapperCounts: response.rapper_counts || {},
    }
  },

  /**
   * Fetch random punchlines for homepage showcase
   */
  async getRandomLines(count: number = 5): Promise<SearchResult[]> {
    const response = await apiRequest<{ lines: BackendSearchResultItem[], count: number }>(
      `${config.endpoints.randomLines}?count=${count}`
    )
    return adaptBackendResults(response.lines)
  },

  /**
   * Fetch autocomplete suggestions
   */
  async autocomplete(query: string): Promise<string[]> {
    const response = await apiRequest<{ suggestions: unknown[], query: string }>(
      `${config.endpoints.autocomplete}?q=${encodeURIComponent(query)}`
    )
    return response.suggestions
      .map((suggestion) => {
        if (typeof suggestion === 'string') {
          return suggestion
        }
        if (
          suggestion &&
          typeof suggestion === 'object' &&
          'text' in suggestion &&
          typeof (suggestion as { text: unknown }).text === 'string'
        ) {
          return (suggestion as { text: string }).text
        }
        return ''
      })
      .filter((text) => text.length > 0)
  },

  /**
   * Log a search event (fire-and-forget)
   */
  logSearchEvent(data: {
    query: string
    search_mode: string
    result_count: number
    response_time_ms: number
  }): void {
    apiRequest(config.endpoints.analyticsSearch, {
      method: 'POST',
      body: data,
    }).catch(() => {
      // Silently ignore analytics errors
    })
  },

  /**
   * Fetch popular/trending queries
   */
  async getPopularQueries(limit: number = 8): Promise<{ query: string, count: number }[]> {
    const response = await apiRequest<{ queries: { query: string, count: number }[], total: number }>(
      `${config.endpoints.analyticsPopular}?limit=${limit}`
    )
    return response.queries
  },

  /**
   * Fetch trending rappers
   */
  async getTrendingRappers(limit: number = 6): Promise<{ name: string, search_count: number, battle_count: number }[]> {
    const response = await apiRequest<{
      rappers: { name: string, search_count: number, battle_count: number }[]
      source: string
    }>(
      `${config.endpoints.trendingRappers}?limit=${limit}`
    )
    return response.rappers
  },
}

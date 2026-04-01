/**
 * Stats API service
 * Handles requests for database statistics
 */

import { config } from '@/lib/config'
import { apiRequest } from './client'

export interface StatsResponse {
  total_battles: number
  total_rappers: number
  total_lines: number
  total_chunks: number
}

export interface NounStat {
  noun: string
  count: number
}

export interface NounStatsResponse {
  most_common: NounStat[]
  least_common: NounStat[]
  total_unique_nouns: number
}

export const statsService = {
  async getStats(signal?: AbortSignal): Promise<StatsResponse> {
    return await apiRequest<StatsResponse>(config.endpoints.stats, {
      method: 'GET',
      signal,
    })
  },

  async getNounStats(limit: number = 20, signal?: AbortSignal): Promise<NounStatsResponse> {
    return await apiRequest<NounStatsResponse>(
      `${config.endpoints.nounStats}?limit=${limit}`,
      { signal }
    )
  },
}

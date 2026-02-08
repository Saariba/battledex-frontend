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

export const statsService = {
  /**
   * Get database statistics
   * @returns Promise with database stats
   */
  async getStats(): Promise<StatsResponse> {
    return await apiRequest<StatsResponse>(config.endpoints.stats, {
      method: 'GET',
    })
  },
}

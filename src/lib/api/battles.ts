/**
 * Battles API service
 * Handles requests for battle listings
 */

import type { Battle } from '@/lib/types'
import { config } from '@/lib/config'
import { apiRequest } from './client'
import { extractYouTubeThumbnail, extractLeague } from './utils'

interface BackendBattle {
  id: string
  title: string
  league?: string
  video_url: string
  date?: string
}

interface BackendBattlesResponse {
  battles: BackendBattle[]
  total: number
  limit: number
  offset: number
}

export interface BattlesResponse {
  battles: Battle[]
  total: number
  limit: number
  offset: number
}

function adaptBattle(backendBattle: BackendBattle): Battle {
  return {
    id: backendBattle.id,
    title: backendBattle.title,
    league: backendBattle.league || extractLeague(backendBattle.title),
    youtubeUrl: backendBattle.video_url,
    thumbnailUrl: extractYouTubeThumbnail(backendBattle.video_url),
    date: backendBattle.date,
  }
}

export const battlesService = {
  /**
   * Get list of battles with pagination
   * @param limit - Maximum number of battles to return (default: 20)
   * @param offset - Number of battles to skip (default: 0)
   * @returns Promise with battles list and pagination info
   */
  async listBattles(
    limit: number = 20,
    offset: number = 0
  ): Promise<BattlesResponse> {
    const url = `${config.endpoints.battles}?limit=${limit}&offset=${offset}`

    const response = await apiRequest<BackendBattlesResponse>(url, {
      method: 'GET',
    })

    return {
      battles: response.battles.map(adaptBattle),
      total: response.total,
      limit: response.limit,
      offset: response.offset,
    }
  },
}

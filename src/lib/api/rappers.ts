/**
 * Rappers API service
 * Handles requests for rapper profiles
 */

import { config } from '@/lib/config'
import { apiRequest } from './client'

interface BackendRapperBattle {
  battle_id: string
  title: string
  video_url: string
  event_date?: string
}

interface BackendRapperProfile {
  name: string
  aka?: string[]
  total_battles: number
  total_lines: number
  battles: BackendRapperBattle[]
}

export interface RapperBattle {
  id: string
  title: string
  videoUrl: string
  date?: string
}

export interface RapperProfile {
  name: string
  aliases: string[]
  totalBattles: number
  totalLines: number
  battles: RapperBattle[]
}

function adaptRapperProfile(backend: BackendRapperProfile): RapperProfile {
  return {
    name: backend.name,
    aliases: backend.aka || [],
    totalBattles: backend.total_battles,
    totalLines: backend.total_lines,
    battles: backend.battles.map(b => ({
      id: b.battle_id,
      title: b.title,
      videoUrl: b.video_url,
      date: b.event_date,
    })),
  }
}

interface BackendRapperListItem {
  name: string
  battle_count?: number
}

interface BackendRappersListResponse {
  rappers: BackendRapperListItem[]
  count?: number
  total?: number
  limit?: number
  offset?: number
}

export interface RapperListItem {
  name: string
  battleCount: number
}

export interface RappersListResponse {
  rappers: RapperListItem[]
  total: number
  limit: number
  offset: number
}

export const rappersService = {
  async getProfile(name: string): Promise<RapperProfile> {
    const response = await apiRequest<BackendRapperProfile>(
      `${config.endpoints.rappers}/${encodeURIComponent(name)}`,
      { method: 'GET' }
    )
    return adaptRapperProfile(response)
  },

  async listRappers(
    limit: number = 50,
    offset: number = 0,
    search?: string
  ): Promise<RappersListResponse> {
    const params = new URLSearchParams({ limit: String(limit), offset: String(offset) })
    if (search) params.set('search', search)
    const url = `${config.endpoints.rappers}?${params.toString()}`

    const response = await apiRequest<BackendRappersListResponse>(url, {
      method: 'GET',
    })

    return {
      rappers: response.rappers.map(r => ({
        name: r.name,
        battleCount: r.battle_count ?? 0,
      })),
      total: response.total ?? response.count ?? response.rappers.length,
      limit: response.limit ?? limit,
      offset: response.offset ?? offset,
    }
  },
}

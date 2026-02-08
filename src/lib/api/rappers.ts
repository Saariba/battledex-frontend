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

export const rappersService = {
  async getProfile(name: string): Promise<RapperProfile> {
    const response = await apiRequest<BackendRapperProfile>(
      `${config.endpoints.rappers}/${encodeURIComponent(name)}`,
      { method: 'GET' }
    )
    return adaptRapperProfile(response)
  },
}

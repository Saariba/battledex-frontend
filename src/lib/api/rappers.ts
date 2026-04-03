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
  upload_date?: string
  opponent_names?: string[]
  line_count?: number
  youtube_views?: number
}

interface BackendRapperTopWord {
  lemma: string
  pos: string
  count: number
}

interface BackendRapperProfile {
  name: string
  aka?: string[]
  total_battles: number
  total_lines: number
  total_youtube_views: number
  avg_youtube_views: number
  total_words: number
  avg_words_per_line: number
  first_battle_date?: string
  latest_battle_date?: string
  vocabulary_size: number
  vocabulary_richness: number
  top_words: BackendRapperTopWord[]
  battles: BackendRapperBattle[]
}

export interface RapperBattle {
  id: string
  title: string
  videoUrl: string
  date?: string
  uploadDate?: string
  opponentNames: string[]
  lineCount: number
  youtubeViews?: number
}

export interface RapperTopWord {
  lemma: string
  pos: string
  count: number
}

export interface RapperProfile {
  name: string
  aliases: string[]
  totalBattles: number
  totalLines: number
  totalYoutubeViews: number
  avgYoutubeViews: number
  totalWords: number
  avgWordsPerLine: number
  firstBattleDate?: string
  latestBattleDate?: string
  vocabularySize: number
  vocabularyRichness: number
  topWords: RapperTopWord[]
  battles: RapperBattle[]
}

function adaptRapperProfile(backend: BackendRapperProfile): RapperProfile {
  return {
    name: backend.name,
    aliases: backend.aka || [],
    totalBattles: backend.total_battles,
    totalLines: backend.total_lines,
    totalYoutubeViews: backend.total_youtube_views,
    avgYoutubeViews: backend.avg_youtube_views,
    totalWords: backend.total_words ?? 0,
    avgWordsPerLine: backend.avg_words_per_line ?? 0,
    firstBattleDate: backend.first_battle_date,
    latestBattleDate: backend.latest_battle_date,
    vocabularySize: backend.vocabulary_size ?? 0,
    vocabularyRichness: backend.vocabulary_richness ?? 0,
    topWords: backend.top_words ?? [],
    battles: backend.battles.map(b => ({
      id: b.battle_id,
      title: b.title,
      videoUrl: b.video_url,
      date: b.event_date,
      uploadDate: b.upload_date,
      opponentNames: b.opponent_names ?? [],
      lineCount: b.line_count ?? 0,
      youtubeViews: b.youtube_views,
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

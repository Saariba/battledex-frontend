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
  event_date?: string
  date?: string
}

interface BackendBattlesResponse {
  battles: BackendBattle[]
  total?: number
  limit?: number
  offset?: number
  count?: number
}

interface BackendBattleDetailRapper {
  name: string
  rapper_id: string
}

interface BackendBattleDetail {
  id: string
  title: string
  video_url: string
  event_date?: string
  video_duration?: number
  thumbnail_url?: string
  total_lines: number
  rappers: BackendBattleDetailRapper[]
}

interface BackendTranscriptLine {
  id: string
  content: string
  start_time?: number
  end_time?: number
  sequence_index: number
  speaker_label?: string
}

interface BackendTranscriptsResponse {
  transcripts: BackendTranscriptLine[]
  count: number
}

export interface BattleDetailRapper {
  name: string
  rapperId: string
}

export interface BattleDetail {
  id: string
  title: string
  videoUrl: string
  eventDate?: string
  videoDuration?: number
  thumbnailUrl?: string
  totalLines: number
  league: string
  rappers: BattleDetailRapper[]
}

export interface TranscriptLine {
  id: string
  content: string
  startTime?: number
  endTime?: number
  sequenceIndex: number
  speakerLabel?: string
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
    date: backendBattle.event_date || backendBattle.date,
  }
}

export const battlesService = {
  async listBattles(
    limit: number = 20,
    offset: number = 0,
    search?: string
  ): Promise<BattlesResponse> {
    const params = new URLSearchParams({ limit: String(limit), offset: String(offset) })
    if (search) params.set('search', search)
    const url = `${config.endpoints.battles}?${params.toString()}`

    const response = await apiRequest<BackendBattlesResponse>(url, {
      method: 'GET',
    })

    return {
      battles: response.battles.map(adaptBattle),
      total: response.total ?? response.count ?? response.battles.length,
      limit: response.limit ?? limit,
      offset: response.offset ?? offset,
    }
  },

  async getBattleDetail(battleId: string): Promise<BattleDetail> {
    const response = await apiRequest<BackendBattleDetail>(
      `${config.endpoints.battles}/${battleId}`,
      { method: 'GET' }
    )

    return {
      id: response.id,
      title: response.title,
      videoUrl: response.video_url,
      eventDate: response.event_date,
      videoDuration: response.video_duration,
      thumbnailUrl: response.thumbnail_url,
      totalLines: response.total_lines,
      league: extractLeague(response.title),
      rappers: response.rappers.map(r => ({
        name: r.name,
        rapperId: r.rapper_id,
      })),
    }
  },

  async getTranscripts(battleId: string): Promise<TranscriptLine[]> {
    const response = await apiRequest<BackendTranscriptsResponse>(
      `${config.endpoints.battles}/${battleId}/transcripts`,
      { method: 'GET' }
    )

    return response.transcripts.map(t => ({
      id: t.id,
      content: t.content,
      startTime: t.start_time,
      endTime: t.end_time,
      sequenceIndex: t.sequence_index,
      speakerLabel: t.speaker_label,
    }))
  },
}

/**
 * Word Stats API service
 * Handles requests for word frequency analytics
 */

import { config } from '@/lib/config'
import { apiRequest } from './client'

// --- Backend response types ---

export interface WordStat {
  id: number
  lemma: string
  pos: string
  total_count: number
  rapper_count?: number // present when filtered by rapper
}

export interface WordStatsResponse {
  words: WordStat[]
  total: number
}

export interface WordRapperEntry {
  rapper_name: string
  count: number
}

export interface WordRappersResponse {
  rappers: WordRapperEntry[]
  total: number
}

export interface RapperTotal {
  rapper_name: string
  total_words: number
  total_battles: number
}

export interface RapperTotalsResponse {
  rappers: RapperTotal[]
}

// --- Vocab Duel types ---

export interface VocabDuelRapper {
  name: string
  total_words: number
  vocab_size: number
}

export interface VocabDuelWord {
  lemma: string
  count_a: number
  count_b: number
  rate_a: number
  rate_b: number
}

export interface VocabDuelExclusiveWord {
  lemma: string
  count: number
}

export interface VocabDuelResponse {
  rapper_a: VocabDuelRapper
  rapper_b: VocabDuelRapper
  jaccard_percent: number
  shared_count: number
  only_a_count: number
  only_b_count: number
  top_diff: VocabDuelWord[]
  top_only_a: VocabDuelExclusiveWord[]
  top_only_b: VocabDuelExclusiveWord[]
}

// --- Service ---

export const wordStatsService = {
  async searchWords(
    search: string,
    options?: {
      pos?: string
      rapper?: string
      limit?: number
      offset?: number
      signal?: AbortSignal
    }
  ): Promise<WordStatsResponse> {
    const params = new URLSearchParams({ search, limit: String(options?.limit ?? 20) })
    if (options?.pos) params.set('pos', options.pos)
    if (options?.rapper) params.set('rapper', options.rapper)
    if (options?.offset) params.set('offset', String(options.offset))

    return apiRequest<WordStatsResponse>(
      `${config.endpoints.wordStats}?${params}`,
      { signal: options?.signal }
    )
  },

  async getWordRappers(
    wordId: number,
    limit: number = 50,
    signal?: AbortSignal
  ): Promise<WordRappersResponse> {
    return apiRequest<WordRappersResponse>(
      `${config.endpoints.wordStats}/${wordId}/rappers?limit=${limit}`,
      { signal }
    )
  },

  async getRapperTotals(signal?: AbortSignal): Promise<RapperTotalsResponse> {
    return apiRequest<RapperTotalsResponse>(
      config.endpoints.rappersTotals,
      { signal }
    )
  },

  async getVocabDuel(
    rapperA: string,
    rapperB: string,
    pos?: string,
    signal?: AbortSignal
  ): Promise<VocabDuelResponse> {
    const params = new URLSearchParams({ rapper_a: rapperA, rapper_b: rapperB })
    if (pos) params.set("pos", pos)
    return apiRequest<VocabDuelResponse>(
      `${config.endpoints.vocabDuel}?${params}`,
      { signal }
    )
  },
}

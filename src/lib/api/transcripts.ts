/**
 * Transcript API Service
 * Handles fetching transcript data for battles
 */

import { apiRequest } from './client'
import type { TranscriptLine, TranscriptsResponse } from './types'
import { config } from '@/lib/config'

export const transcriptService = {
  /**
   * Fetch transcript for a battle
   * @param battleId - UUID of the battle
   * @returns Array of transcript lines sorted by sequence
   */
  async getTranscript(battleId: string): Promise<TranscriptLine[]> {
    const response = await apiRequest<TranscriptsResponse>(
      `${config.endpoints.battles}/${battleId}/transcripts`
    )

    // Sort by sequence_index to ensure correct order
    return response.transcripts.sort((a, b) => a.sequence_index - b.sequence_index)
  },
}

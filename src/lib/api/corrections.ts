/**
 * Corrections API service
 * Handles lyric correction submissions
 */

import { config } from '@/lib/config'
import { apiRequest } from './client'
import type { CorrectionSubmitRequest, CorrectionSubmitResponse } from './types'

export const correctionsService = {
  /**
   * Submit a correction for a transcript line
   * @param transcriptId - ID of the transcript line to correct
   * @param suggestedContent - The corrected text
   * @returns Correction submission response
   */
  async submitCorrection(
    transcriptId: number,
    suggestedContent: string
  ): Promise<CorrectionSubmitResponse> {
    const requestBody: CorrectionSubmitRequest = {
      transcript_id: transcriptId,
      suggested_content: suggestedContent,
    }

    return await apiRequest<CorrectionSubmitResponse>(
      config.endpoints.corrections || '/api/v1/corrections',
      {
        method: 'POST',
        body: requestBody,
      }
    )
  },
}

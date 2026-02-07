'use client'

import { useState } from 'react'
import { Share2, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import type { SearchResult } from '@/lib/types'
import { downloadShareImage } from '@/lib/share-image-generator'

interface ShareButtonProps {
  result: SearchResult
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  showLabel?: boolean
}

export function ShareButton({
  result,
  variant = 'ghost',
  size = 'sm',
  showLabel = false,
}: ShareButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleShare = async () => {
    try {
      setIsGenerating(true)
      await downloadShareImage(result)
      toast.success('Image downloaded successfully!')
    } catch (error) {
      console.error('Failed to generate share image:', error)
      toast.error('Failed to generate image. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleShare}
      disabled={isGenerating}
      className="transition-all"
    >
      {isGenerating ? (
        <Download className="w-4 h-4 animate-bounce" />
      ) : (
        <Share2 className="w-4 h-4" />
      )}
      {showLabel && (
        <span className="ml-2">{isGenerating ? 'Generating...' : 'Share'}</span>
      )}
    </Button>
  )
}

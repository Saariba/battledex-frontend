/**
 * Share Image Generator
 * Creates downloadable Genius-style lyric card images
 */

import type { SearchResult } from '@/lib/types'
import { extractYouTubeId } from '@/lib/api/utils'

interface ShareImageOptions {
  result: SearchResult
  format?: 'png' | 'jpeg'
  quality?: number
}

export async function generateShareImage({
  result,
  format = 'png',
  quality = 0.95,
}: ShareImageOptions): Promise<Blob> {
  // 1. Get YouTube thumbnail URL (high quality)
  const videoId = extractYouTubeId(result.battle.youtubeUrl)
  const thumbnailUrl = videoId
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : null

  // 2. Create hidden container with share card design
  const container = createShareCardElement(result, thumbnailUrl)
  document.body.appendChild(container)

  // 3. Wait for images to load
  await waitForImagesToLoad(container)

  // 4. Dynamically import html2canvas to avoid bundling it in the main chunk
  const { default: html2canvas } = await import('html2canvas')

  // 5. Generate canvas from HTML
  const canvas = await html2canvas(container, {
    width: 1080,
    height: 1080,
    scale: 2, // 2x for retina quality
    backgroundColor: null,
    logging: false,
    useCORS: true, // Allow cross-origin images
  })

  // 6. Remove hidden element
  document.body.removeChild(container)

  // 7. Convert canvas to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Failed to generate image'))
      },
      `image/${format}`,
      quality
    )
  })
}

function createShareCardElement(
  result: SearchResult,
  thumbnailUrl: string | null
): HTMLElement {
  const container = document.createElement('div')
  container.style.cssText = `
    position: fixed;
    left: -9999px;
    top: 0;
    width: 1080px;
    height: 1080px;
  `

  container.innerHTML = `
    <div style="
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%);
    ">
      ${
        thumbnailUrl
          ? `<img
              crossorigin="anonymous"
              src="${thumbnailUrl}"
              style="
                position: absolute;
                width: 100%;
                height: 100%;
                object-fit: cover;
              "
            />`
          : ''
      }

      <!-- Dark overlay -->
      <div style="
        position: absolute;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
      "></div>

      <!-- Content container -->
      <div style="
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 80px 60px;
      ">
        <!-- Punchline text -->
        <div style="
          font-family: 'JetBrains Mono', monospace;
          font-size: ${getPunchlineFontSize(result.line)}px;
          font-weight: 700;
          color: #FFFFFF;
          text-align: center;
          max-width: 90%;
          line-height: 1.4;
          text-shadow: 0 4px 12px rgba(0, 0, 0, 0.8);
        ">
          "${escapeHtml(result.line)}"
        </div>

        <!-- Bottom section -->
        <div style="
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 32px 40px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        ">
          <!-- Battle title (bottom-left) -->
          <div style="
            font-family: 'Inter', sans-serif;
            font-size: 14px;
            color: rgba(255, 255, 255, 0.8);
            max-width: 50%;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
          ">
            ${escapeHtml(result.battle.title)}
          </div>

          <!-- Rapper name (bottom-right) -->
          <div style="
            font-family: 'Inter', sans-serif;
            font-size: 20px;
            font-weight: 700;
            color: #EF4444;
            text-transform: uppercase;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
          ">
            ${escapeHtml(result.rapper.name)}
          </div>
        </div>

        <!-- Watermark (bottom-center) -->
        <div style="
          position: absolute;
          bottom: 12px;
          left: 50%;
          transform: translateX(-50%);
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.4);
          letter-spacing: 2px;
        ">
          BATTLEDEX
        </div>
      </div>
    </div>
  `

  return container
}

function getPunchlineFontSize(text: string): number {
  const length = text.length
  if (length < 50) return 42
  if (length < 100) return 36
  if (length < 150) return 32
  return 28
}

function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

function waitForImagesToLoad(container: HTMLElement): Promise<void> {
  const images = container.getElementsByTagName('img')
  if (images.length === 0) return Promise.resolve()

  const promises = Array.from(images).map(
    (img) =>
      new Promise<void>((resolve) => {
        if (img.complete) {
          resolve()
        } else {
          img.onload = () => resolve()
          img.onerror = () => resolve() // Continue even if image fails
        }
      })
  )

  return Promise.all(promises).then(() => {})
}

export async function downloadShareImage(
  result: SearchResult,
  filename?: string
): Promise<void> {
  const blob = await generateShareImage({ result })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename || `battledex-${result.rapper.name.toLowerCase().replace(/\s+/g, '-')}.png`
  link.click()
  URL.revokeObjectURL(url)
}

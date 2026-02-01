/**
 * YouTube iframe API Hook
 * Manages YouTube player state and provides real-time playback information
 */

import { useEffect, useRef, useState } from 'react'

// YouTube iframe API types
interface YTNamespace {
  Player: new (elementId: string, config: YTPlayerConfig) => YTPlayer
  PlayerState: {
    UNSTARTED: -1
    ENDED: 0
    PLAYING: 1
    PAUSED: 2
    BUFFERING: 3
    CUED: 5
  }
  ready: (callback: () => void) => void
}

declare global {
  interface Window {
    YT: YTNamespace
    onYouTubeIframeAPIReady: () => void
  }
}

interface YTPlayerConfig {
  videoId: string
  playerVars?: {
    start?: number
    autoplay?: number
    controls?: number
    modestbranding?: number
    rel?: number
  }
  events?: {
    onReady?: (event: YTPlayerEvent) => void
    onStateChange?: (event: YTPlayerEvent) => void
    onError?: (event: YTPlayerEvent) => void
  }
}

interface YTPlayerEvent {
  target: YTPlayer
  data?: number
}

interface YTPlayer {
  playVideo: () => void
  pauseVideo: () => void
  seekTo: (seconds: number, allowSeekAhead: boolean) => void
  getCurrentTime: () => number
  getDuration: () => number
  getPlayerState: () => number
  destroy: () => void
}

interface YouTubePlayerState {
  player: YTPlayer | null
  isReady: boolean
  isPlaying: boolean
  currentTime: number
  duration: number
  error: string | null
}

/**
 * Load YouTube iframe API script
 */
function loadYouTubeAPI(): Promise<void> {
  return new Promise((resolve) => {
    // Already loaded
    if (window.YT && window.YT.Player) {
      resolve()
      return
    }

    // Already loading
    if (document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      window.onYouTubeIframeAPIReady = () => resolve()
      return
    }

    // Load script
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    const firstScriptTag = document.getElementsByTagName('script')[0]
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

    window.onYouTubeIframeAPIReady = () => resolve()
  })
}

/**
 * Custom hook for YouTube player management
 *
 * @param elementId - ID of the div element to render player in
 * @param videoId - YouTube video ID
 * @param startTime - Start time in seconds
 * @param onReady - Callback when player is ready
 * @returns Player state object
 */
export function useYouTubePlayer(
  elementId: string,
  videoId: string,
  startTime: number = 0,
  onReady?: () => void
): YouTubePlayerState {
  const [isReady, setIsReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(startTime)
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const playerRef = useRef<YTPlayer | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize player
  useEffect(() => {
    let mounted = true

    const initPlayer = async () => {
      try {
        await loadYouTubeAPI()

        if (!mounted) return

        // Wait for YT to be ready
        window.YT.ready(() => {
          if (!mounted) return

          const player = new window.YT.Player(elementId, {
            videoId,
            playerVars: {
              start: startTime,
              autoplay: 1,
              controls: 1,
              modestbranding: 1,
              rel: 0,
            },
            events: {
              onReady: (event: YTPlayerEvent) => {
                if (!mounted) return
                playerRef.current = event.target
                setIsReady(true)
                setDuration(event.target.getDuration())

                // Force play after a short delay to ensure player is fully ready
                setTimeout(() => {
                  if (playerRef.current && mounted) {
                    try {
                      playerRef.current.playVideo()
                    } catch (err) {
                      console.error('Error starting video playback:', err)
                    }
                  }
                }, 500)

                onReady?.()
              },
              onStateChange: (event: YTPlayerEvent) => {
                if (!mounted) return
                const state = event.data
                const playing = state === window.YT.PlayerState.PLAYING
                setIsPlaying(playing)

                // Update current time immediately when state changes
                if (playing && event.target.getCurrentTime) {
                  try {
                    setCurrentTime(event.target.getCurrentTime())
                  } catch (err) {
                    console.warn('Could not get current time:', err)
                  }
                }

                // Update duration when available
                if (event.target.getDuration) {
                  setDuration(event.target.getDuration())
                }
              },
              onError: (event: YTPlayerEvent) => {
                if (!mounted) return
                setError(`YouTube player error: ${event.data}`)
                console.error('YouTube player error:', event.data)
              },
            },
          })
        })
      } catch (err) {
        if (!mounted) return
        const message = err instanceof Error ? err.message : 'Failed to load YouTube player'
        setError(message)
        console.error('YouTube API error:', err)
      }
    }

    initPlayer()

    return () => {
      mounted = false
      if (playerRef.current) {
        try {
          playerRef.current.destroy()
        } catch (err) {
          console.error('Error destroying player:', err)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elementId, videoId, startTime])
  // Note: onReady intentionally excluded to prevent re-initialization

  // Periodically check player state in case onStateChange doesn't fire
  useEffect(() => {
    if (!isReady || !playerRef.current) return

    const checkInterval = setInterval(() => {
      if (playerRef.current) {
        try {
          const state = playerRef.current.getPlayerState()
          const playing = state === window.YT.PlayerState.PLAYING

          if (playing !== isPlaying) {
            setIsPlaying(playing)
          }
        } catch (err) {
          // Silently handle errors
        }
      }
    }, 1000) // Check every second

    return () => clearInterval(checkInterval)
  }, [isReady, isPlaying])

  // Poll current time when playing
  useEffect(() => {
    if (isPlaying && playerRef.current) {
      intervalRef.current = setInterval(() => {
        if (playerRef.current) {
          const time = playerRef.current.getCurrentTime()
          setCurrentTime(time)
        }
      }, 200) // Poll every 200ms (5 fps)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying])

  return {
    player: playerRef.current,
    isReady,
    isPlaying,
    currentTime,
    duration,
    error,
  }
}

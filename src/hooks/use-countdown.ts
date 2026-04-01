"use client"

import { useEffect, useState } from "react"

function getMidnightMs(): number {
  const now = new Date()
  const midnight = new Date(now)
  midnight.setHours(24, 0, 0, 0)
  return midnight.getTime() - now.getTime()
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "00:00:00"
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}

export function useCountdownToMidnight() {
  const [remaining, setRemaining] = useState(getMidnightMs)

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(getMidnightMs())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return formatCountdown(remaining)
}

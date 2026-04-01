"use client"

import { useCallback, useEffect, useState } from "react"

export interface ChallengeStats {
  totalPlayed: number
  bestScore: number
  lastScore: number | null
  lastPlayedDate: string | null
}

const STORAGE_KEY = "battledex_challenge_stats"

function readStats(): ChallengeStats {
  if (typeof window === "undefined") {
    return { totalPlayed: 0, bestScore: 0, lastScore: null, lastPlayedDate: null }
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { totalPlayed: 0, bestScore: 0, lastScore: null, lastPlayedDate: null }
    return JSON.parse(raw) as ChallengeStats
  } catch {
    return { totalPlayed: 0, bestScore: 0, lastScore: null, lastPlayedDate: null }
  }
}

function writeStats(data: ChallengeStats): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Silently ignore
  }
}

function isYesterday(dateStr: string): boolean {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return yesterday.toISOString().slice(0, 10) === dateStr
}

export function useChallengeStats() {
  const [stats, setStats] = useState<ChallengeStats>(() => readStats())

  useEffect(() => {
    setStats(readStats())
  }, [])

  const recordChallenge = useCallback((solvedCount: number, totalLines: number) => {
    const today = new Date().toISOString().slice(0, 10)
    const current = readStats()

    if (current.lastPlayedDate === today) return

    const updated: ChallengeStats = {
      totalPlayed: current.totalPlayed + 1,
      bestScore: Math.max(current.bestScore, solvedCount),
      lastScore: solvedCount,
      lastPlayedDate: today,
    }
    writeStats(updated)
    setStats(updated)
  }, [])

  const yesterdayScore = stats.lastPlayedDate && isYesterday(stats.lastPlayedDate)
    ? stats.lastScore
    : null

  return { ...stats, yesterdayScore, recordChallenge }
}

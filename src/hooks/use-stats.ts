"use client"

import { useCallback, useEffect, useState } from "react"

export interface PlayerStats {
  gamesPlayed: number
  gamesWon: number
  guessDistribution: [number, number, number, number]
}

const STORAGE_KEY = "battledex_stats"

function readStats(): PlayerStats {
  if (typeof window === "undefined") {
    return { gamesPlayed: 0, gamesWon: 0, guessDistribution: [0, 0, 0, 0] }
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { gamesPlayed: 0, gamesWon: 0, guessDistribution: [0, 0, 0, 0] }
    return JSON.parse(raw) as PlayerStats
  } catch {
    return { gamesPlayed: 0, gamesWon: 0, guessDistribution: [0, 0, 0, 0] }
  }
}

function writeStats(data: PlayerStats): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Silently ignore
  }
}

export function useStats() {
  const [stats, setStats] = useState<PlayerStats>(() => readStats())

  useEffect(() => {
    setStats(readStats())
  }, [])

  const recordGame = useCallback((solved: boolean, guessCount: number) => {
    const current = readStats()
    const updated: PlayerStats = {
      gamesPlayed: current.gamesPlayed + 1,
      gamesWon: current.gamesWon + (solved ? 1 : 0),
      guessDistribution: [...current.guessDistribution] as [number, number, number, number],
    }
    if (solved && guessCount >= 1 && guessCount <= 4) {
      updated.guessDistribution[guessCount - 1]++
    }
    writeStats(updated)
    setStats(updated)
  }, [])

  const winRate = stats.gamesPlayed > 0
    ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
    : 0

  return { ...stats, winRate, recordGame }
}

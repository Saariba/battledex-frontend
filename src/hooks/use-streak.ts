"use client"

import { useCallback, useEffect, useState } from "react"

interface StreakData {
  currentStreak: number
  bestStreak: number
  lastPlayedDate: string | null
}

const STORAGE_KEY = "battledex_streak"

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

function readStreak(): StreakData {
  if (typeof window === "undefined") {
    return { currentStreak: 0, bestStreak: 0, lastPlayedDate: null }
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { currentStreak: 0, bestStreak: 0, lastPlayedDate: null }
    return JSON.parse(raw) as StreakData
  } catch {
    return { currentStreak: 0, bestStreak: 0, lastPlayedDate: null }
  }
}

function writeStreak(data: StreakData): void {
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

export function useStreak() {
  const [streak, setStreak] = useState<StreakData>(() => readStreak())

  useEffect(() => {
    setStreak(readStreak())
  }, [])

  const recordPlay = useCallback(() => {
    const today = getTodayKey()
    const current = readStreak()

    if (current.lastPlayedDate === today) {
      return
    }

    let newStreak: number
    if (current.lastPlayedDate && (isYesterday(current.lastPlayedDate) || current.lastPlayedDate === today)) {
      newStreak = current.currentStreak + 1
    } else {
      newStreak = 1
    }

    const updated: StreakData = {
      currentStreak: newStreak,
      bestStreak: Math.max(current.bestStreak, newStreak),
      lastPlayedDate: today,
    }

    writeStreak(updated)
    setStreak(updated)
  }, [])

  return { ...streak, recordPlay }
}

"use client"

export interface ShareCardQuizData {
  mode: "quiz"
  date: string
  guesses: string[]
  correctRapperName: string | null
  maxGuesses: number
  streak: number
  solved: boolean
}

export interface ShareCardChallengeData {
  mode: "challenge"
  date: string
  solvedLineCount: number
  totalLines: number
  totalHintsUsed: number
  completed: boolean
}

export type ShareCardData = ShareCardQuizData | ShareCardChallengeData

const COLORS = {
  bg: "#0a0a0a",
  card: "#141414",
  text: "#fafafa",
  muted: "#a3a3a3",
  border: "#262626",
  red: "#e54545",
  emerald: "#34d399",
  amber: "#f59e0b",
} as const

export function ShareCardContent({ data }: { data: ShareCardData }) {
  const isQuiz = data.mode === "quiz"
  const isSolved = isQuiz ? data.solved : data.completed

  return (
    <div
      style={{
        width: 480,
        height: 580,
        background: `linear-gradient(180deg, ${COLORS.bg} 0%, #0d0d0d 100%)`,
        color: COLORS.text,
        fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Top accent line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, transparent, ${COLORS.red}, transparent)`,
        }}
      />

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "32px 36px 0",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/battledex-logo.png"
          alt=""
          width={44}
          height={44}
          crossOrigin="anonymous"
          style={{ borderRadius: 10 }}
        />
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.24em",
              textTransform: "uppercase" as const,
              color: COLORS.muted,
            }}
          >
            BattleDex
          </div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>
            {isQuiz ? "Tägliches Quiz" : "Tägliche Challenge"}
          </div>
        </div>
      </div>

      {/* Date */}
      <div
        style={{
          padding: "20px 36px 0",
          fontSize: 13,
          fontWeight: 600,
          color: COLORS.muted,
          letterSpacing: "0.06em",
        }}
      >
        {data.date}
      </div>

      {/* Main content area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
          padding: "0 36px",
        }}
      >
        {isQuiz ? (
          <QuizCardBody data={data} />
        ) : (
          <ChallengeCardBody data={data} />
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "0 36px 28px",
          borderTop: `1px solid ${COLORS.border}`,
          marginLeft: 36,
          marginRight: 36,
          paddingTop: 16,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: COLORS.muted,
            letterSpacing: "0.08em",
          }}
        >
          battledex.app
        </span>
      </div>
    </div>
  )
}

function QuizCardBody({ data }: { data: ShareCardQuizData }) {
  const { guesses, correctRapperName, maxGuesses, streak, solved } = data
  const score = solved ? `${guesses.length}/${maxGuesses}` : `X/${maxGuesses}`

  return (
    <>
      {/* Result dots */}
      <div style={{ display: "flex", gap: 12 }}>
        {Array.from({ length: maxGuesses }, (_, i) => {
          const guess = guesses[i]
          if (!guess) {
            return (
              <div
                key={i}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  border: `2px solid ${COLORS.border}`,
                  background: "transparent",
                }}
              />
            )
          }
          const isCorrect = Boolean(correctRapperName) && guess === correctRapperName
          return (
            <div
              key={i}
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: isCorrect ? COLORS.emerald : COLORS.red,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: isCorrect
                  ? `0 0 12px ${COLORS.emerald}66`
                  : `0 0 12px ${COLORS.red}44`,
              }}
            >
              {isCorrect ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              )}
            </div>
          )
        })}
      </div>

      {/* Score */}
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontSize: 56,
            fontWeight: 900,
            letterSpacing: "-0.02em",
            lineHeight: 1,
            color: solved ? COLORS.emerald : COLORS.red,
          }}
        >
          {score}
        </div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: COLORS.muted,
            marginTop: 8,
          }}
        >
          {solved
            ? guesses.length === 1
              ? "Beim ersten Versuch!"
              : `In ${guesses.length} Versuchen gelöst`
            : "Nicht gelöst"}
        </div>
      </div>

      {/* Streak */}
      {streak > 1 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: `${COLORS.amber}18`,
            border: `1px solid ${COLORS.amber}40`,
            borderRadius: 999,
            padding: "8px 20px",
            fontSize: 14,
            fontWeight: 700,
            color: COLORS.amber,
          }}
        >
          🔥 {streak} Tage Streak
        </div>
      )}
    </>
  )
}

function ChallengeCardBody({ data }: { data: ShareCardChallengeData }) {
  const { solvedLineCount, totalLines, totalHintsUsed, completed } = data

  return (
    <>
      {/* Score */}
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontSize: 64,
            fontWeight: 900,
            letterSpacing: "-0.02em",
            lineHeight: 1,
            color: completed ? COLORS.emerald : COLORS.red,
          }}
        >
          {solvedLineCount}/{totalLines}
        </div>
        <div
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: COLORS.muted,
            marginTop: 10,
          }}
        >
          Lines gelöst
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", gap: 16 }}>
        <div
          style={{
            background: COLORS.card,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 16,
            padding: "14px 24px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 24, fontWeight: 800 }}>{totalHintsUsed}</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: COLORS.muted, letterSpacing: "0.12em", textTransform: "uppercase" as const, marginTop: 2 }}>
            Hinweise
          </div>
        </div>
        <div
          style={{
            background: COLORS.card,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 16,
            padding: "14px 24px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: completed ? COLORS.emerald : COLORS.red,
            }}
          >
            {completed ? "Geschafft" : "Vorbei"}
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, color: COLORS.muted, letterSpacing: "0.12em", textTransform: "uppercase" as const, marginTop: 2 }}>
            Status
          </div>
        </div>
      </div>
    </>
  )
}

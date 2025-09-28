"use client"

import { useState, useEffect, useRef } from "react"

interface UseQuizTimerProps {
  initialTime: number // in seconds
  onTimeUp: () => void
  onWindowBlur?: () => void
}

export function useQuizTimer({ initialTime, onTimeUp, onWindowBlur }: UseQuizTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialTime)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const blurTimeRef = useRef<number | null>(null)

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User left the window
        setIsPaused(true)
        blurTimeRef.current = Date.now()
        onWindowBlur?.()
      } else {
        // User returned to the window
        if (blurTimeRef.current) {
          const blurDuration = Date.now() - blurTimeRef.current
          if (blurDuration > 60000) {
            // 60 seconds
            // End quiz if user was away for more than 60 seconds
            onTimeUp()
            return
          }
        }
        setIsPaused(false)
        blurTimeRef.current = null
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [onTimeUp, onWindowBlur])

  useEffect(() => {
    if (isRunning && !isPaused && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            onTimeUp()
            return 0
          }
          return prev - 1
        })
      }, 1000)
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
  }, [isRunning, isPaused, timeLeft, onTimeUp])

  const start = () => setIsRunning(true)
  const pause = () => setIsPaused(true)
  const resume = () => setIsPaused(false)
  const stop = () => {
    setIsRunning(false)
    setIsPaused(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`
  }

  return {
    timeLeft,
    isRunning,
    isPaused,
    start,
    pause,
    resume,
    stop,
    formatTime: formatTime(timeLeft),
  }
}

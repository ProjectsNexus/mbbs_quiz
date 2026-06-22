"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { AuthPage } from "@/components/auth/auth-page"
import { Dashboard } from "@/components/dashboard/dashboard"
import { QuizSelectionWizard, type QuizConfig } from "@/components/quiz/quiz-selection-wizard"
import { QuizInterface, type QuizResults } from "@/components/quiz/quiz-interface"
import { QuizResults as QuizResultsComponent } from "@/components/quiz/quiz-results"
import { TutorProvider } from "@/hooks/use-tutor"
import { TutorDashboard } from "@/components/tutor/tutor-dashboard"
import { UserSettings } from "@/components/setting/user-setting"

type AppState = "dashboard" | "quiz-selection" | "quiz-active" | "quiz-results" 
export default function Home() {
  const { user, userProfile, loading, isTutor } = useAuth()
  const [appState, setAppState] = useState<AppState>("dashboard")
  const [quizConfig, setQuizConfig] = useState<QuizConfig | null>(null)
  const [quizResults, setQuizResults] = useState<QuizResults | null>(null)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading Quiz App...</p>
        </div>
      </div>
    )
  }

  if (!user || !userProfile) {
    return <AuthPage />
  }

  if (isTutor) {
    return (
      <TutorProvider>
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
          <TutorDashboard />
        </div>
      </TutorProvider>
    )
  }

  const handleStartQuizSelection = () => {
    setAppState("quiz-selection")
  }

  const handleStartQuiz = (config: QuizConfig) => {
    setQuizConfig(config)
    setAppState("quiz-active")
  }

  const handleQuizComplete = (results: QuizResults) => {
    setQuizResults(results)
    setAppState("quiz-results")
  }

  const handleBackToDashboard = () => {
    setAppState("dashboard")
    setQuizConfig(null)
    setQuizResults(null)
  }

  const handleRetakeQuiz = () => {
    if (quizConfig) {
      setAppState("quiz-active")
      setQuizResults(null)
    }
  }

  const handleBackToSelection = () => {
    setAppState("quiz-selection")
    setQuizConfig(null)
  }

  const handleUserSetting = () => {
    if (userProfile) {
      setAppState("user-settings")
    }
  }
  switch (appState) {
    case "dashboard":
      return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
          <Dashboard onStartQuiz={handleStartQuizSelection} onOpenSettings={() => setAppState("user-settings")} />
        </div>
      )

    case "quiz-selection":
      return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
          <QuizSelectionWizard onStartQuiz={handleStartQuiz} onBack={handleBackToDashboard} />
        </div>
      )

    case "quiz-active":
      return quizConfig ? (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
          <QuizInterface config={quizConfig} onComplete={handleQuizComplete} onExit={handleBackToSelection} />
        </div>
      ) : null

    case "quiz-results":
      return quizResults ? (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
          <QuizResultsComponent
            results={quizResults}
            questions={[]} // Would be passed from quiz interface in real app
            onRetakeQuiz={handleRetakeQuiz}
            onBackToDashboard={handleBackToDashboard}
          />
        </div>
      ) : null

    default:
      return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
          <Dashboard onStartQuiz={handleStartQuizSelection}/>
        </div>
      )
  }
}

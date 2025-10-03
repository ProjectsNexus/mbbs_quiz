"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useQuizTimer } from "@/hooks/use-quiz-timer"
import { useAuth } from "@/hooks/use-auth"
import { FirebaseService } from "@/lib/firebase-service"
import type { QuizConfig } from "./quiz-selection-wizard"
import type { Question } from "@/lib/quiz-data"
import { Clock, AlertTriangle, CheckCircle, XCircle, ChevronLeft, ChevronRight, Flag } from "lucide-react"
import { firebaseErrorMessages, getFirebaseErrorMessage } from "@/lib/firebase-error"
import { StatusDialog } from "../ui/statusAlert"

interface QuizInterfaceProps {
  config: QuizConfig
  onComplete: (results: QuizResults) => void
  onExit: () => void
}

export interface QuizResults {
  config: QuizConfig
  answers: (number | null)[]
  score: number
  totalQuestions: number
  timeSpent: number
  status: "completed" | "failed"
}

// Mock questions - in real app, these would come from Firebase
const generateMockQuestions = (count: number): any => {
  const questions = (
    <div>
      <p>Sorry! we don't have Questions</p>
    </div>
  )
  return questions
}

export function QuizInterface({ config, onComplete, onExit }: QuizInterfaceProps) {
  const { user } = useAuth()
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [showExplanation, setShowExplanation] = useState(false)
  const [windowBlurWarning, setWindowBlurWarning] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true)
      try {
        const fetchedQuestions = await FirebaseService.getQuestions(
          config.year,
          config.block,
          config.subject,
          config.testTopic,
          config.questionCount,
        )

        if (fetchedQuestions.length === 0) {
          // Fallback to mock questions if no questions found in Firestore
          const mockQuestions = generateMockQuestions(config.questionCount)
          setQuestions(mockQuestions)
        } else {
          setQuestions(fetchedQuestions || [])
        }

        setAnswers(new Array(fetchedQuestions.length || config.questionCount).fill(null))
      } catch (error) {
        setError(getFirebaseErrorMessage((error as any).code) || "Failed to load questions. Please try again.")
        
        console.error("Error loading questions:", error)
        // Fallback to mock questions on error
        const mockQuestions = generateMockQuestions(config.questionCount)
        setQuestions(mockQuestions)
        setAnswers(new Array(config.questionCount).fill(null))
      } finally {
        setLoading(false)
      }
    }

    loadQuestions()
  }, [config])

  const handleTimeUp = async () => {
    const timeSpent = config.timeLimit * 60 - timeLeft
    const score = calculateScore()
    const results = {
      config,
      answers,
      score,
      totalQuestions: config.questionCount,
      timeSpent,
      status: "failed" as const,
    }

    try {
      await saveQuizResults(results, timeSpent)
    } catch (error) {
      setError(getFirebaseErrorMessage((error as any).code) || "Failed to save results. Please try again.")
    }
    onComplete(results)
  }

  const handleWindowBlur = () => {
    setWindowBlurWarning(true)
    setTimeout(() => setWindowBlurWarning(false), 5000)
  }

  const { timeLeft, isRunning, isPaused, start, formatTime } = useQuizTimer({
    initialTime: config.timeLimit * 60,
    onTimeUp: handleTimeUp,
    onWindowBlur: handleWindowBlur,
  })

  useEffect(() => {
    if (!loading && questions.length > 0) {
      start()
    }
  }, [start, loading, questions.length])

  const calculateScore = () => {
    let correct = 0
    answers.forEach((answer, index) => {
      if (answer === questions[index].correctAnswer) {
        correct++
      }
    })
    return Math.round((correct / config.questionCount) * 100)
  }

  const saveQuizResults = async (results: QuizResults, timeSpent: number) => {
    if (!user) return

    setSaving(true)
    try {
      const detailedAnswers = answers.map((selectedAnswer, index) => ({
        questionId: questions[index].id,
        selectedAnswer: selectedAnswer || -1,
        isCorrect: selectedAnswer === questions[index].correctAnswer,
        timeSpent: Math.floor(timeSpent / questions.length), // Approximate time per question
      }))

      await FirebaseService.saveQuizResult({
        userId: user.uid,
        quizId: `${config.year}-${config.block}-${config.subject}-${config.testTopic}`,
        score: results.score,
        totalMarks: config.questionCount,
        percentage: results.score,
        timeSpent,
        answers: detailedAnswers,
        mode: config.mode,
        year: config.year,
        block: config.block,
        subject: config.subject,
        topic: config.testTopic,
      })

      const notification: Partial<Notification> = {
        type: "result_published",
        title: "Quiz Result Updated",
        quizId: `${config.year}-${config.block}-${config.subject}-${config.testTopic}`,
        studentId: user.uid,
        student: user.displayName || user.email || "A student",
        score: results.score,
        totalMarks: config.questionCount,
        percentage: results.score,
        timeSpent,
        quizTitle: `${config.subject} - ${config.testTopic}`,
        createdAt: new Date(),
        recipients: ['mN2DT6kY6xN4nmTmHNpqJq2USHq1', user.uid],
        batch: config.year || "General",
      }

      await FirebaseService.sendNotification(notification, user.uid, )
      
    } catch (error) {
      setError(getFirebaseErrorMessage((error as any).code) || "Failed to save results. Please try again.")
      console.error("Error saving quiz results:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = answerIndex
    setAnswers(newAnswers)

    if (config.mode === "practice") {
      setShowExplanation(true)
    }
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setShowExplanation(false)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
      setShowExplanation(false)
    }
  }

  const handleSubmit = async () => {
    const timeSpent = config.timeLimit * 60 - timeLeft
    const score = calculateScore()
    const results = {
      config,
      answers,
      score,
      totalQuestions: config.questionCount,
      timeSpent,
      status: "completed" as const,
    }

    await saveQuizResults(results, timeSpent)
    onComplete(results)
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100
  const answeredCount = answers.filter((answer) => answer !== null).length
  const currentQuestionData = questions[currentQuestion]
  const selectedAnswer = answers[currentQuestion]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <h2 className="text-lg font-semibold mb-2">Loading Quiz Questions</h2>
              <p className="text-muted-foreground">
                Fetching {config.questionCount} questions from {config.subject} - {config.testTopic}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-lg font-semibold mb-2">No Questions Available</h2>
              <p className="text-muted-foreground mb-4">
                No questions found for {config.subject} - {config.testTopic}
              </p>
              <Button onClick={onExit}>Back to Quiz Selection</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-lg font-semibold">{config.subject}</h1>
                  <p className="text-sm text-muted-foreground">
                    {config.year} - Block {config.block} - {config.testTopic}
                  </p>
                </div>
                <Badge variant={config.mode === "practice" ? "default" : "secondary"}>
                  {config.mode === "practice" ? "Practice" : "Exam"} Mode
                </Badge>
                {saving && (
                  <Badge variant="outline" className="animate-pulse">
                    Saving...
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className={`font-mono text-lg ${timeLeft < 300 ? "text-destructive" : ""}`}>{formatTime}</span>
                </div>
                <Button variant="outline" onClick={onExit}>
                  Exit Quiz
                </Button>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>
                  Question {currentQuestion + 1} of {questions.length}
                </span>
                <span>{answeredCount} answered</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Window Blur Warning */}
      {windowBlurWarning && (
        <div className="max-w-4xl mx-auto mb-4">
          <Alert className="border-destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Warning: You left the quiz window. If you stay away for more than 60 seconds, the quiz will end
              automatically.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Timer Paused Warning */}
      {isPaused && (
        <div className="max-w-4xl mx-auto mb-4">
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>Timer is paused. Return to the quiz window to continue.</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Error Message */}
      {error && (<StatusDialog status={error} onClose={() => setError(null)} />)}

      {/* Question */}
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl leading-relaxed">{currentQuestionData.question}</CardTitle>
            <CardDescription>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize">
                  {currentQuestionData.difficulty}
                </Badge>
                <span>Select the best answer</span>
              </div>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <RadioGroup
              value={selectedAnswer?.toString() || ""}
              onValueChange={(value) => handleAnswerSelect(Number.parseInt(value))}
            >
              {currentQuestionData.options.map((option, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} className="mt-1" />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer leading-relaxed">
                    <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            {/* Practice Mode Explanation */}
            {config.mode === "practice" && selectedAnswer !== null && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {selectedAnswer === currentQuestionData.correctAnswer ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        Correct Answer!
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-red-600" />
                        Incorrect Answer
                      </>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p>
                      <span className="font-medium">Correct Answer: </span>
                      <span className="font-medium text-green-600">
                        {String.fromCharCode(65 + currentQuestionData.correctAnswer)}.{" "}
                        {currentQuestionData.options[currentQuestionData.correctAnswer]}
                      </span>
                    </p>
                    <div>
                      <h4 className="font-medium mb-2">Explanation:</h4>
                      <p className="text-muted-foreground leading-relaxed">{currentQuestionData.explanation}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="flex items-center gap-2 bg-transparent"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {answeredCount} of {questions.length} answered
            </span>
          </div>

          {currentQuestion === questions.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2 bg-accent hover:bg-accent/90"
            >
              <Flag className="h-4 w-4" />
              {saving ? "Submitting..." : "Submit Quiz"}
            </Button>
          ) : (
            <Button onClick={handleNext} className="flex items-center gap-2">
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

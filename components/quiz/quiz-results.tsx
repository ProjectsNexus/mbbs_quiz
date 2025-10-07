"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { QuizResults as QuizResultsType } from "./quiz-interface"
import type { Question } from "@/lib/quiz-data"
import { Trophy, Target, BarChart3, CheckCircle, XCircle, AlertCircle, Home, RotateCcw, Share } from "lucide-react"

interface QuizResultsProps {
  results: QuizResultsType
  questions: Question[]
  onRetakeQuiz: () => void
  onBackToDashboard: () => void
}

// Mock questions for demo - in real app, these would be passed from the quiz
const generateMockQuestions = (count: number): Question[] => {
  const questions: Question[] = []
  for (let i = 0; i < count; i++) {
    questions.push({
      id: `q${i + 1}`,
      question: `This is a sample MBBS question ${i + 1}. Which of the following is the correct answer for this medical scenario?`,
      options: [
        "Option A - This is the first possible answer",
        "Option B - This is the second possible answer",
        "Option C - This is the third possible answer",
        "Option D - This is the fourth possible answer",
      ],
      correctAnswer: Math.floor(Math.random() * 4),
      explanation: `This is the detailed explanation for question ${i + 1}. In medical practice, this concept is important because it relates to patient care and diagnosis.`,
      difficulty: ["easy", "medium", "hard"][Math.floor(Math.random() * 3)] as "easy" | "medium" | "hard",
      marks: 0
    })
  }
  return questions
}

export function QuizResults({ results, onRetakeQuiz, onBackToDashboard }: QuizResultsProps) {
  const [questions] = useState<Question[]>(results.question)
 
  const correctAnswers = results.answers.filter((answer, index) => answer === questions[index]?.correctAnswer).length

  const incorrectAnswers = results.answers.filter(
    (answer, index) => answer !== null && answer !== questions[index]?.correctAnswer,
  ).length

  const unansweredQuestions = results.answers.filter((answer) => answer === null).length

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return "default"
    if (score >= 60) return "secondary"
    return "destructive"
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, "0")}`
  }

  const getPerformanceMessage = () => {
    if (results.status === "failed") {
      return {
        title: "Quiz Incomplete",
        message: "The quiz ended due to time limit or window focus loss. Review your answers and try again.",
        icon: AlertCircle,
        color: "text-red-600",
      }
    }

    if (results.score >= 80) {
      return {
        title: "Excellent Performance!",
        message: "Outstanding work! You have a strong understanding of this topic.",
        icon: Trophy,
        color: "text-green-600",
      }
    }

    if (results.score >= 60) {
      return {
        title: "Good Performance",
        message: "Well done! Review the incorrect answers to improve further.",
        icon: Target,
        color: "text-yellow-600",
      }
    }

    return {
      title: "Needs Improvement",
      message: "Keep studying! Review the explanations and try again.",
      icon: AlertCircle,
      color: "text-red-600",
    }
  }

  const performance = getPerformanceMessage()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className={`bg-primary/10 p-4 rounded-full`}>
              <performance.icon className={`h-12 w-12 ${performance.color}`} />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold">{performance.title}</h1>
            <p className="text-muted-foreground text-lg">{performance.message}</p>
          </div>
        </div>

        {/* Score Overview */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-bold">
              <span className={getScoreColor(results.score)}>{results.score}%</span>
            </CardTitle>
            <CardDescription>
              {correctAnswers} out of {results.totalQuestions} questions correct
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={results.score} className="w-full h-3" />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
                  <div className="text-sm text-muted-foreground">Correct</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{incorrectAnswers}</div>
                  <div className="text-sm text-muted-foreground">Incorrect</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">{unansweredQuestions}</div>
                  <div className="text-sm text-muted-foreground">Unanswered</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{formatTime(results.timeSpent)}</div>
                  <div className="text-sm text-muted-foreground">Time Spent</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quiz Details */}
        <Card>
          <CardHeader>
            <CardTitle>Quiz Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Subject:</span> {results.config.subject}
              </div>
              <div>
                <span className="font-medium">Year:</span> {results.config.year}
              </div>
              <div>
                <span className="font-medium">Block:</span> {results.config.block}
              </div>
              <div>
                <span className="font-medium">Topic:</span> {results.config.testTopic}
              </div>
              <div>
                <span className="font-medium">Mode:</span>
                <Badge variant="outline" className="ml-2">
                  {results.config.mode === "practice" ? "Practice" : "Exam"}
                </Badge>
              </div>
              <div>
                <span className="font-medium">Status:</span>
                <Badge variant={results.status === "completed" ? "default" : "destructive"} className="ml-2">
                  {results.status === "completed" ? "Completed" : "Failed"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Review */}
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="review">Question Review</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Performance Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
                      <div className="text-sm text-muted-foreground">Correct Answers</div>
                      <Progress value={(correctAnswers / results.totalQuestions) * 100} className="mt-2" />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-red-600">{incorrectAnswers}</div>
                      <div className="text-sm text-muted-foreground">Incorrect Answers</div>
                      <Progress value={(incorrectAnswers / results.totalQuestions) * 100} className="mt-2" />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-gray-600">{unansweredQuestions}</div>
                      <div className="text-sm text-muted-foreground">Unanswered</div>
                      <Progress value={(unansweredQuestions / results.totalQuestions) * 100} className="mt-2" />
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Recommendations:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {results.score >= 80 && (
                      <>
                        <li>• Excellent performance! Consider moving to more advanced topics.</li>
                        <li>• Review any incorrect answers to maintain your strong understanding.</li>
                      </>
                    )}
                    {results.score >= 60 && results.score < 80 && (
                      <>
                        <li>• Good foundation! Focus on reviewing incorrect answers.</li>
                        <li>• Practice more questions in areas where you struggled.</li>
                      </>
                    )}
                    {results.score < 60 && (
                      <>
                        <li>• Review the fundamental concepts for this topic.</li>
                        <li>• Study the explanations carefully and retake the quiz.</li>
                        <li>• Consider additional study materials or resources.</li>
                      </>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="review" className="space-y-4 p-3 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400/50 scrollbar-track-transparent hover:scrollbar-thumb-gray-600/70">
            {questions.map((question, index) => {
              const userAnswer = results.answers[index]
              const isCorrect = userAnswer === question.correctAnswer
              const wasAnswered = userAnswer !== null

              return (
                <Card key={question.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <span>Question {index + 1}</span>
                      {wasAnswered ? (
                        isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )
                      ) : (
                        <AlertCircle className="h-5 w-5 text-gray-600" />
                      )}
                      <Badge variant="outline" className="capitalize">
                        {question.difficulty}
                            {/* 🟡 Skipped badge at top-right */}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{question.question}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {question.options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className={`p-3 rounded-lg border ${
                            optionIndex === question.correctAnswer
                              ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                              : optionIndex === userAnswer && !isCorrect
                                ? "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800"
                                : "bg-muted/50"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{String.fromCharCode(65 + optionIndex)}.</span>
                            <span>{option}</span>
                            {optionIndex === question.correctAnswer && (
                              <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />
                            )}
                            {optionIndex === userAnswer && !isCorrect && (
                              <XCircle className="h-4 w-4 text-red-600 ml-auto" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {!wasAnswered && (
                      <div className="text-sm text-muted-foreground bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                        This question was not answered.
                      </div>
                    )}

                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Explanation:</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{question.explanation}</p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={onBackToDashboard} variant="outline" className="flex items-center gap-2 bg-transparent">
            <Home className="h-4 w-4" />
            Back to Dashboard
          </Button>

          <Button onClick={onRetakeQuiz} className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            Retake Quiz
          </Button>

          <Button variant="outline" className="flex items-center gap-2 bg-transparent" disabled>
            <Share className="h-4 w-4" />
            Share Results
          </Button>
        </div>
      </div>
    </div>
  )
}

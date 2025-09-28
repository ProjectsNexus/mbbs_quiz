"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { useTheme } from "@/hooks/use-theme"
import { FirebaseService } from "@/lib/firebase-service"
import {
  GraduationCap,
  Play,
  BookOpen,
  Trophy,
  Clock,
  Target,
  Moon,
  Sun,
  LogOut,
  User,
  BarChart3,
} from "lucide-react"

interface DashboardProps {
  onStartQuiz: () => void
}

export function Dashboard({ onStartQuiz }: DashboardProps) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()

  const [stats, setStats] = useState([
    { label: "Quizzes Taken", value: "-", icon: Target },
    { label: "Average Score", value: "-", icon: BarChart3 },
    { label: "Study Streak", value: "-", icon: Clock },
    { label: "Rank", value: "-", icon: Trophy },
  ])

  const [recentQuizzes, setRecentQuizzes] = useState<
    { subject: string; score: number; date: string}[]
  >([])

  useEffect(() => {
    const fetchData = async () => {
      console.log(user?.uid);
      
      if (!user?.uid) return
      try {
        const fetchedStats = await FirebaseService.getUserStats(user.uid)
        const fetchedHistory = await FirebaseService.getUserQuizHistory(user.uid)

       if (fetchedStats) {
        setStats([
          { label: "Quizzes Taken", value: String(fetchedStats.totalQuizzes || 0), icon: Target },
          { label: "Average Score", value: `${fetchedStats.averageScore || 0}%`, icon: BarChart3 },
          { label: "Best Score", value: `${fetchedStats.bestScore || 0}`, icon: Clock },
          // { label: "Time Spent", value: `#${fetchedStats.totalTimeSpent || "-"}`, icon: Trophy },
        ])
      }


        if (fetchedHistory) {
          setRecentQuizzes(
            fetchedHistory.map((quiz) => ({
              subject: quiz.subject,
              score: quiz.score,
              date: quiz.date ? quiz.date.toString() : "", // 👈 ensure string
            }))
          )
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err)
      }
    }

    fetchData()
  }, [user?.uid])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary">MBBS Quiz</h1>
              <p className="text-sm text-muted-foreground">Medical Education Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full bg-transparent"
            >
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>

            <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-full">
              <User className="h-4 w-4" />
              <span className="text-sm font-medium">{user?.email?.split("@")[0] || "Student"}</span>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={logout}
              className="rounded-full bg-transparent"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Welcome Section */}
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">
            Welcome back, {user?.email?.split("@")[0] || "Student"}!
          </h2>
          <p className="text-muted-foreground text-lg">
            Ready to continue your medical education journey?
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10" />
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Start New Quiz
              </CardTitle>
              <CardDescription>
                Choose from thousands of MBBS questions across all years
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <Button
                onClick={onStartQuiz}
                className="w-full bg-primary hover:bg-primary/90"
                size="lg"
              >
                <Play className="mr-2 h-4 w-4" />
                Begin Quiz Setup
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Study Resources
              </CardTitle>
              <CardDescription>Access study materials and reference guides</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full bg-transparent" size="lg" disabled>
                <BookOpen className="mr-2 h-4 w-4" />
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-4 text-center">
                <div className="flex justify-center mb-2">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        {/* <Card>
          <CardHeader>
            <CardTitle>Recent Quiz Activity</CardTitle>
            <CardDescription>Your latest quiz attempts and scores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentQuizzes.length > 0 ? (
                recentQuizzes.map((quiz, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <BookOpen className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{quiz.subject}</div>
                        <div className="text-sm text-muted-foreground">{quiz.date}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          quiz.score >= 80
                            ? "default"
                            : quiz.score >= 60
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {quiz.score}%
                      </Badge>
                      <Badge variant="outline">{quiz.status}</Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">No recent quizzes yet.</p>
              )}
            </div>
          </CardContent>
        </Card> */}
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Quiz Activity</CardTitle>
            <CardDescription>Your latest quiz attempts and scores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentQuizzes.length > 0 ? (
                recentQuizzes.map((quiz, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <BookOpen className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{quiz.subject}</div>
                        <div className="text-sm text-muted-foreground">
                          {quiz.date
                            ? new Date(quiz.date).toLocaleDateString("en-US", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "N/A"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          quiz.score >= 80
                            ? "default"
                            : quiz.score >= 60
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {quiz.score}%
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">No recent quizzes yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}

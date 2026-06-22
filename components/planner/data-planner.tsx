"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuth } from "@/hooks/use-auth"
import { useTutor } from "@/hooks/use-tutor"
import { FirebaseService } from "@/lib/firebase-service"
import { TrendingUp, BookOpen, Clock, Award, Target, BarChart3 } from "lucide-react"
import type { StudentPerformance } from "@/lib/types"

export function DataPlanner() {
  const { user, isTutor } = useAuth()
  const { students, quizzes } = useTutor()
  const [performances, setPerformances] = useState<StudentPerformance[]>([])
  const [userStats, setUserStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      if (!user) return

      try {
        if (isTutor) {
          // Load all quiz results for tutor view
          const allPerformances = await FirebaseService.getAllQuizResults()
          setPerformances(allPerformances)
        } else {
          // Load user's quiz history and stats
          const history = await FirebaseService.getUserQuizHistory(user.uid, 50)
          const stats = await FirebaseService.getUserStats(user.uid)
          setUserStats(stats)

          // Convert quiz sessions to performances format
          const userPerformances = history.map((session) => ({
            // studentId: session.userId,
            // quizId: session.quizId || "unknown",
            score: session.score || 0,
            // totalMarks: session.totalQuestions || 0,
            // percentage: session.score ? Math.round((session.score / (session.totalQuestions || 1)) * 100) : 0,
            // timeSpent: session.timeSpent || 0,
            // completedAt: session.endTime || new Date(),
            // answers: session.answers || [],
          })) as StudentPerformance[]

          setPerformances(userPerformances)
        }
      } catch (error) {
        console.error("[v0] Error loading planner data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user, isTutor])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading data...</p>
        </div>
      </div>
    )
  }

  const getSubjectStats = () => {
    const subjectMap = new Map()
    performances.forEach((perf) => {
      const quiz = quizzes.find((q) => q.id === perf.quizId)
      const subject = quiz?.subject || "Unknown"

      if (!subjectMap.has(subject)) {
        subjectMap.set(subject, { count: 0, totalScore: 0, totalMarks: 0 })
      }

      const stats = subjectMap.get(subject)
      stats.count++
      stats.totalScore += perf.score
      stats.totalMarks += perf.totalMarks
    })

    return Array.from(subjectMap.entries()).map(([subject, stats]) => ({
      subject,
      quizzes: stats.count,
      averageScore: stats.totalMarks > 0 ? Math.round((stats.totalScore / stats.totalMarks) * 100) : 0,
      totalAttempts: stats.count,
    }))
  }

  const getRecentActivity = () => {
    return performances
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
      .slice(0, 10)
      .map((perf) => {
        const quiz = quizzes.find((q) => q.id === perf.quizId)
        return {
          ...perf,
          quizTitle: quiz?.title || "Unknown Quiz",
          subject: quiz?.subject || "Unknown",
        }
      })
  }

  const subjectStats = getSubjectStats()
  const recentActivity = getRecentActivity()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Data Planner</h2>
        <Badge variant="outline">{isTutor ? "Tutor View" : "Student View"}</Badge>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Quizzes</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performances.length}</div>
                <p className="text-xs text-muted-foreground">{isTutor ? "All student attempts" : "Your attempts"}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {performances.length > 0
                    ? Math.round(performances.reduce((sum, p) => sum + p.percentage, 0) / performances.length)
                    : 0}
                  %
                </div>
                <p className="text-xs text-muted-foreground">Overall performance</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Best Score</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {performances.length > 0 ? Math.max(...performances.map((p) => p.percentage)) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">Highest achievement</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Time Spent</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(performances.reduce((sum, p) => sum + (p.timeSpent || 0), 0) / 60)}m
                </div>
                <p className="text-xs text-muted-foreground">Total study time</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>Track progress over time</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Quiz</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentActivity.map((activity, index) => (
                    <TableRow key={index}>
                      <TableCell>{new Date(activity.completedAt).toLocaleDateString()}</TableCell>
                      <TableCell>{activity.quizTitle}</TableCell>
                      <TableCell>
                        {activity.score}/{activity.totalMarks}
                      </TableCell>
                      <TableCell>
                        <Badge variant={activity.percentage >= 70 ? "default" : "destructive"}>
                          {activity.percentage}%
                        </Badge>
                      </TableCell>
                      <TableCell>{Math.round((activity.timeSpent || 0) / 60)}m</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subjects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subject Performance</CardTitle>
              <CardDescription>Performance breakdown by subject</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Quizzes</TableHead>
                    <TableHead>Average Score</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjectStats.map((stat, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{stat.subject}</TableCell>
                      <TableCell>{stat.quizzes}</TableCell>
                      <TableCell>
                        <Badge variant={stat.averageScore >= 70 ? "default" : "destructive"}>
                          {stat.averageScore}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-muted-foreground" />
                          {stat.averageScore >= 80
                            ? "Excellent"
                            : stat.averageScore >= 70
                              ? "Good"
                              : stat.averageScore >= 60
                                ? "Average"
                                : "Needs Improvement"}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest quiz attempts and results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{activity.quizTitle}</p>
                        <p className="text-sm text-muted-foreground">
                          {activity.subject} • {new Date(activity.completedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={activity.percentage >= 70 ? "default" : "destructive"}>
                        {activity.percentage}%
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        {activity.score}/{activity.totalMarks} points
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

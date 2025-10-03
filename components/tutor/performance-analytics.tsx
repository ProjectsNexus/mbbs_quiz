"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useTutor } from "@/hooks/use-tutor"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { TrendingUp, TrendingDown, Users, BookOpen, Target, Award, AlertTriangle } from "lucide-react"

export function PerformanceAnalytics() {
  const { students, quizzes, performances, getQuizAnalytics, getStudentPerformance } = useTutor()
  const [selectedQuiz, setSelectedQuiz] = useState("all")
  const [selectedBatch, setSelectedBatch] = useState("all")

  const batches = ["Batch A", "Batch B", "Batch C", "Batch D"]

  // Overall Statistics
  const totalStudents = students.length
  const totalQuizzes = quizzes.filter((q) => q.isPublished).length
  const totalAttempts = performances.length
  const overallAverage =
    totalAttempts > 0 ? Math.round(performances.reduce((sum, p) => sum + p.percentage, 0) / totalAttempts) : 0

  // Performance Distribution
  const performanceDistribution = [
    { range: "90-100%", count: performances.filter((p) => p.percentage >= 90).length, color: "#22c55e" },
    {
      range: "80-89%",
      count: performances.filter((p) => p.percentage >= 80 && p.percentage < 90).length,
      color: "#3b82f6",
    },
    {
      range: "70-79%",
      count: performances.filter((p) => p.percentage >= 70 && p.percentage < 80).length,
      color: "#f59e0b",
    },
    {
      range: "60-69%",
      count: performances.filter((p) => p.percentage >= 60 && p.percentage < 70).length,
      color: "#ef4444",
    },
    { range: "Below 60%", count: performances.filter((p) => p.percentage < 60).length, color: "#dc2626" },
  ]

  // Subject-wise Performance
  const subjectPerformance = performances.reduce((acc, quiz) => {
    const quizPerformances = performances.filter((p) => p.studentId === quiz.studentId && p.quizId === quiz.quizId)
    if (quizPerformances.length > 0) {
      const avgScore = Math.round(quizPerformances.reduce((sum, p) => sum + p.percentage, 0) / quizPerformances.length)
      acc.push({
        subject: quiz.quizId.trim().trimStart().split("-")[2], // assuming subject is the first word in quiz title
        averageScore: avgScore,
        attempts: quizPerformances.length,
      })
    }
    
    return acc
  }, [] as any[])

  // Top and Low Performers
  const studentPerformances = students
    .map((student) => {
      const studentAttempts = performances.filter((p) => p.studentId === student.userID)
     
      const avgScore =
        studentAttempts.length > 0
          ? Math.round(studentAttempts.reduce((sum, p) => sum + p.percentage, 0) / studentAttempts.length)
          : 0
      return {
        ...student,
        avgScore,
        totalAttempts: studentAttempts.length,
      }
    })
    .sort((a, b) => b.avgScore - a.avgScore)

  const topPerformers = studentPerformances.slice(0, 5)
  const lowPerformers = studentPerformances.filter((s) => s.avgScore < 60 && s.totalAttempts > 0)

  // Quiz Analytics for Selected Quiz
  const selectedQuizAnalytics = selectedQuiz !== "all" ? getQuizAnalytics(selectedQuiz) : null
  

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Performance Analytics</h2>
          <p className="text-muted-foreground">Analyze student performance and identify trends</p>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{totalStudents}</p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Active learners
                </p>
              </div>
              <div className="bg-primary/10 p-3 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Published Quizzes</p>
                <p className="text-2xl font-bold">{totalQuizzes}</p>
                <p className="text-xs text-blue-600 flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  Available for students
                </p>
              </div>
              <div className="bg-primary/10 p-3 rounded-lg">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Attempts</p>
                <p className="text-2xl font-bold">{totalAttempts}</p>
                <p className="text-xs text-purple-600 flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  Quiz submissions
                </p>
              </div>
              <div className="bg-primary/10 p-3 rounded-lg">
                <Target className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overall Average</p>
                <p className="text-2xl font-bold">{overallAverage}%</p>
                <p
                  className={`text-xs flex items-center gap-1 ${
                    overallAverage >= 75 ? "text-green-600" : overallAverage >= 60 ? "text-yellow-600" : "text-red-600"
                  }`}
                >
                  {overallAverage >= 75 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  Class performance
                </p>
              </div>
              <div className="bg-primary/10 p-3 rounded-lg">
                <Award className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Distribution</CardTitle>
            <CardDescription>Score ranges across all quiz attempts</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={performanceDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ range, count }) => `${range}: ${count}`}
                >
                  {performanceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Subject Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Subject-wise Performance</CardTitle>
            <CardDescription>Average scores by subject</CardDescription>
          </CardHeader>
          <CardContent>
            {subjectPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={subjectPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" />
                  <YAxis domain={[0, 100]} /> {/* keep scores bounded */}
                  <Tooltip />
                  <Bar dataKey="averageScore" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">No subject performance data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Top Performers
            </CardTitle>
            <CardDescription>Students with highest average scores</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Avg Score</TableHead>
                  <TableHead>Attempts</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topPerformers.map((student, index) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <Badge variant={index === 0 ? "default" : "secondary"}>#{index + 1}</Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{student.name}</div>
                        <div className="text-sm text-muted-foreground">{student.batch}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        {student.avgScore}%
                      </Badge>
                    </TableCell>
                    <TableCell>{student.totalAttempts}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Students Needing Attention */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Students Needing Attention
            </CardTitle>
            <CardDescription>Students with scores below 60%</CardDescription>
          </CardHeader>
          <CardContent>
            {lowPerformers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Avg Score</TableHead>
                    <TableHead>Attempts</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowPerformers.slice(0, 5).map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{student.name}</div>
                          <div className="text-sm text-muted-foreground">{student.batch}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="destructive">{student.avgScore}%</Badge>
                      </TableCell>
                      <TableCell>{student.totalAttempts}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          Needs Support
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Award className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <p>Great job! All students are performing well.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quiz-specific Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Quiz-specific Analytics</CardTitle>
          <CardDescription>Detailed analysis for individual quizzes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Select value={selectedQuiz} onValueChange={setSelectedQuiz}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select a quiz" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Quizzes</SelectItem>
                {quizzes
                  .filter((q) => q.isPublished)
                  .map((quiz) => (
                    <SelectItem key={quiz.id} value={quiz.topic || quiz.id}>
                      {quiz.topic} - {quiz.title}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {selectedQuizAnalytics && (
            <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">{selectedQuizAnalytics.totalAttempts}</div>
                  <div className="text-sm text-muted-foreground">Total Attempts</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">{Math.round(selectedQuizAnalytics.averageScore)}%</div>
                  <div className="text-sm text-muted-foreground">Average Score</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">{Math.round(selectedQuizAnalytics.passRate)}%</div>
                  <div className="text-sm text-muted-foreground">Pass Rate</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">{selectedQuizAnalytics.topPerformers.length}</div>
                  <div className="text-sm text-muted-foreground">Top Performers</div>
                </CardContent>
              </Card>
            </div>
              <div>
                <h3 className="text-lg font-medium mt-4 mb-2">Top Performers</h3>
                {selectedQuizAnalytics.topPerformers.length > 0 ? (
                  <Table className="w-full ">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Precentage</TableHead>
                        <TableHead>Total Questions</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedQuizAnalytics.topPerformers.map((perf, index) => {
                        const student = students.find((s) => s.userID === perf.userID);
                        
                        return (
                          <TableRow key={index}>
                            <TableCell>
                              <div className="font-medium">
                                {student ? student.name : "Unknown Student"}
                              </div>
                              <div className="text-sm text-muted-foreground">{perf.email}</div>
                            </TableCell>
                            <TableCell>
                                {perf.score}
                            </TableCell>
                            <TableCell>
                              <Badge variant="default">
                                {perf.percentage.toFixed(2)}%
                              </Badge>
                            </TableCell>
                            <TableCell>
                                {perf.totalMarks}
                            </TableCell>
                            <TableCell>
                              {perf.completedAt
                                ? new Date(perf.completedAt.seconds * 1000 + perf.completedAt.nanoseconds / 1000000)
                                    .toLocaleString("en-US", {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                : "N/A"}
                            </TableCell>


                          </TableRow>
                        )})}
                        </TableBody>
                      </Table>
                      ) : null}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

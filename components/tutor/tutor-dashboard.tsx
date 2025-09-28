"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/use-auth"
import { useTheme } from "@/hooks/use-theme"
import { useTutor } from "@/hooks/use-tutor"
import {
  GraduationCap,
  Users,
  BookOpen,
  Calendar,
  BarChart3,
  Bell,
  Plus,
  Moon,
  Sun,
  LogOut,
  User,
  TrendingUp,
  Clock,
  Target,
} from "lucide-react"
import { StudentManagement } from "./student-management"
import { QuizManagement } from "./quiz-management"
import { PerformanceAnalytics } from "./performance-analytics"
import { NotificationCenter } from "./notification-center"

export function TutorDashboard() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { students, quizzes, assignments, performances, loading } = useTutor()
  const [activeTab, setActiveTab] = useState("overview")

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading Tutor Dashboard...</p>
        </div>
      </div>
    )
  }

  const stats = [
    {
      label: "Total Students",
      value: students.length.toString(),
      icon: Users,
      change: "+12%",
      changeType: "positive" as const,
    },
    {
      label: "Active Quizzes",
      value: quizzes.filter((q) => q.isPublished).length.toString(),
      icon: BookOpen,
      change: "+5%",
      changeType: "positive" as const,
    },
    {
      label: "Assignments",
      value: assignments.filter((a) => a.isActive).length.toString(),
      icon: Calendar,
      change: "+8%",
      changeType: "positive" as const,
    },
    {
      label: "Avg Performance",
      value:
        performances.length > 0
          ? `${Math.round(performances.reduce((sum, p) => sum + p.percentage, 0) / performances.length)}%`
          : "0%",
      icon: TrendingUp,
      change: "+3%",
      changeType: "positive" as const,
    },
  ]

  const recentActivity = [
    { type: "quiz_completed", student: "John Doe", quiz: "Anatomy Basics", score: 85, time: "2 hours ago" },
    { type: "quiz_assigned", quiz: "Physiology Advanced", batch: "Batch A", time: "4 hours ago" },
    { type: "student_joined", student: "Jane Smith", batch: "Batch B", time: "1 day ago" },
    { type: "quiz_created", quiz: "Biochemistry Fundamentals", time: "2 days ago" },
  ]

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
              <h1 className="text-xl font-bold text-primary">MBBS Tutor Portal</h1>
              <p className="text-sm text-muted-foreground">Student & Quiz Management</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={toggleTheme} className="rounded-full bg-transparent">
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>

            <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-full">
              <User className="h-4 w-4" />
              <span className="text-sm font-medium">Dr. {user?.email?.split("@")[0] || "Tutor"}</span>
              <Badge variant="secondary" className="text-xs">
                Tutor
              </Badge>
            </div>

            <Button variant="outline" size="icon" onClick={logout} className="rounded-full bg-transparent">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-muted/50">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="students" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Students
            </TabsTrigger>
            <TabsTrigger value="quizzes" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Quizzes
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Welcome Section */}
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">Welcome back, Dr. {user?.email?.split("@")[0] || "Tutor"}!</h2>
              <p className="text-muted-foreground text-lg">Manage your students and track their progress</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p
                          className={`text-xs flex items-center gap-1 ${
                            stat.changeType === "positive" ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          <TrendingUp className="h-3 w-3" />
                          {stat.change} from last month
                        </p>
                      </div>
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <stat.icon className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10" />
                <CardHeader className="relative">
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Create New Quiz
                  </CardTitle>
                  <CardDescription>Design and publish new quizzes for your students</CardDescription>
                </CardHeader>
                <CardContent className="relative">
                  <Button onClick={() => setActiveTab("quizzes")} className="w-full bg-primary hover:bg-primary/90">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Quiz
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Manage Students
                  </CardTitle>
                  <CardDescription>Add, organize, and track student progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" onClick={() => setActiveTab("students")} className="w-full bg-transparent">
                    <Users className="mr-2 h-4 w-4" />
                    View Students
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    View Analytics
                  </CardTitle>
                  <CardDescription>Analyze performance and identify trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" onClick={() => setActiveTab("analytics")} className="w-full bg-transparent">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    View Reports
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates from your classes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-lg">
                          {activity.type === "quiz_completed" && <Target className="h-4 w-4 text-primary" />}
                          {activity.type === "quiz_assigned" && <Calendar className="h-4 w-4 text-primary" />}
                          {activity.type === "student_joined" && <Users className="h-4 w-4 text-primary" />}
                          {activity.type === "quiz_created" && <BookOpen className="h-4 w-4 text-primary" />}
                        </div>
                        <div>
                          <div className="font-medium">
                            {activity.type === "quiz_completed" && `${activity.student} completed ${activity.quiz}`}
                            {activity.type === "quiz_assigned" && `${activity.quiz} assigned to ${activity.batch}`}
                            {activity.type === "student_joined" && `${activity.student} joined ${activity.batch}`}
                            {activity.type === "quiz_created" && `Created ${activity.quiz}`}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            {activity.time}
                          </div>
                        </div>
                      </div>
                      {activity.type === "quiz_completed" && (
                        <Badge
                          variant={
                            activity.score! >= 80 ? "default" : activity.score! >= 60 ? "secondary" : "destructive"
                          }
                        >
                          {activity.score}%
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students">
            <StudentManagement />
          </TabsContent>

          <TabsContent value="quizzes">
            <QuizManagement />
          </TabsContent>

          <TabsContent value="analytics">
            <PerformanceAnalytics />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationCenter />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

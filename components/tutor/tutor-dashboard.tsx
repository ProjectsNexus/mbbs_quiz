"use client"

import { useEffect, useState } from "react"
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
import { Logo, LogoTitle } from "../ui/logo"
import { Dialog, DialogContent, DialogOverlay } from "../ui/dialog"
import { UserSettings } from "../setting/user-setting"
import { StatusDialog } from "../ui/statusAlert"
import { FirebaseService } from "@/lib/firebase-service"
import { log } from "node:console"
import { formatNotificationMessage, formatNotificationTime } from "@/lib/notification-formatter"
import NotificationDrawer from "../ui/notificationdrawer"

export function TutorDashboard() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { students, quizzes, assignments, performances, loading } = useTutor()
  const [activeTab, setActiveTab] = useState("overview")
  const [error, setError] = useState<string | null>(null);
  const [isOpenSettingDialog, setIsOpenSettingDialog] = useState(false)
  const [isNotificationsRead, setIsNotificationsRead] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<
    {
      id: string
      title: string
      message: string
      type: string
      time: string // already formatted
      isRead: boolean
    }[]
  >([])

  const [recentActivity, setRecentActivity] = useState<any[]>([
    { type: "", student: "", quiz: "", score: '', time: "" }
  ]);

   useEffect(() => {
      fetchNotifications()
    }, [user?.uid])
  
    const fetchNotifications = async () => {
      if (!user?.uid) return;
  
      try {
        const fetchedNotifications = await FirebaseService.getUserNotifications(user.uid);
  
        if (fetchedNotifications) {
          setNotifications(
            fetchedNotifications.map((n: any) => ({
              id: n.id,
              title: n.title,
              // 👇 dynamic message based on type, quiz, student, etc.
              message: formatNotificationMessage({
                id: n.id,
                type: n.type,
                title: n.title,
                student: n.student,
                quizTitle: n.quizTitle,
                score: n.score,
                totalMarks: n.totalMarks,
                percentage: n.percentage,
                batch: n.batch,
                timeSpent: n.timeSpent,
                isRead: n.isRead,
              }),
              type: n.type,
              time: n.sentAt
                ? formatNotificationTime(n.sentAt)
                : "",
              isRead: n.isRead,
            }))
          );
  
          // ✅ keep track if all notifications are read
          setIsNotificationsRead(fetchedNotifications.every((n: any) => n.isRead));
        }
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };
  
    const handleMarkAsRead = async (id: string) => {
      // 🔹 update Firestore
      await FirebaseService.markNotificationAsRead(id);
  
      // 🔹 update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    };
  
  
  useEffect(() => {
  const getRecentActivity = async () => {
    try {
      const activity = await FirebaseService.getUserNotifications(user?.uid || "" );

      setRecentActivity(
        activity.map((act: any) => {
          // convert Firestore Timestamp → JS Date
          const date = act.sentAt?.toDate
            ? act.sentAt.toDate() // if Firestore Timestamp
            : new Date(
                act.sentAt.seconds * 1000 +
                  act.sentAt.nanoseconds / 1000000
              ); // if plain JSON

          return {
            type:
              act.type === "result_published"
                ? "quiz_completed"
                : act.type === "quiz_add"
                ? "quiz_created"
                : act.type === "quiz_assigned"
                ? "quiz_assigned"
                : act.type === "user_add"
                ? "student_joined"
                : "announcement",
            title: act.title,
            student: act.student,
            quiz: act.quizTitle,
            score: act.type === "result_published" ? act.score : undefined,
            batch: act.batch,
            time: date.toLocaleString("en-US", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
          };
        })
      );
    } catch (err) {
      console.error("Error fetching activity:", err);
    }
  };

  getRecentActivity();
}, [user?.uid, !loading]);

  
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">

      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              {/* <GraduationCap className="h-6 w-6 text-primary" /> */}
              <Logo size={'md'} src="/logo.png" alt="SilvRx Logo" className="h-12 w-12 text-primary" />
            </div>
            <div>
              <LogoTitle className="text-3xl">SilvRx</LogoTitle>
              <p className="text-sm text-muted-foreground">Medical Education Platform</p>
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

            <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-full cursor-pointer" onClick={()=> setIsOpen(true)}>
                <Bell className="h-4 w-4" />
            </div>


            <Button variant="outline" size="icon" onClick={logout} className="rounded-full bg-transparent">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {error && (<StatusDialog status={error} onClose={() => setError(null)} />)}

      <NotificationDrawer notifications={notifications} isOpen={isOpen} onClose={() => setIsOpen(false)} onClose={() => setIsOpen(false)} />
        
      {/*setting Dialog */}
      <Dialog open={isOpenSettingDialog} onOpenChange={setIsOpenSettingDialog}>
        <DialogOverlay className="fixed inset-0 bg-black/50" />
        <DialogContent className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-background p-6 rounded-lg shadow-lg w-full max-w-7xl max-h-[90vh] overflow-y-auto">
          <UserSettings />
        </DialogContent>
      </Dialog>

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <div className="grid grid-cols-1 md:grid-cols-3  gap-6">
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
                  {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
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
                  )) : <p className="text-center text-sm text-muted-foreground">No recent activity available.</p>}  
                  {/* {recentActivity.map((activity, index) => (
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
                  ))} */}
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

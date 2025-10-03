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
  Settings,
  Bell,
} from "lucide-react"
import { Logo, LogoTitle } from "../ui/logo"
import { Dialog } from "@radix-ui/react-dialog"
import { DialogContent, DialogOverlay } from "../ui/dialog"
import { UserSettings } from "../setting/user-setting"
import { getFirebaseErrorMessage } from "@/lib/firebase-error"
import { StatusDialog } from "../ui/statusAlert"
import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartTooltip } from "../ui/chart"
import NotificationDrawer from "../ui/notificationdrawer"
import { formatNotificationMessage, formatNotificationTime } from "@/lib/notification-formatter";


interface DashboardProps {
  onStartQuiz: () => void
}

export function Dashboard({ onStartQuiz }: DashboardProps) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [isOpenSettingDialog, setIsOpenSettingDialog] = useState(false)
  const [error, setError] = useState<string | null>(null)
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

// Dashboard stats

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
        setError(getFirebaseErrorMessage((err as { code: string }).code))
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
              {/* <GraduationCap className="h-6 w-6 text-primary" /> */}
              <Logo size={'md'} src="/logo.png" alt="SilvRx Logo" className="h-12 w-12 text-primary" />
            </div>
            <div>
              <LogoTitle className="text-3xl">SilvRx</LogoTitle>
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

            <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-full cursor-pointer" >
              <User className="h-4 w-4" />
              <span className="text-sm font-medium">{user?.email?.split("@")[0] || "Student"}</span>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-full cursor-pointer" onClick={()=> setIsOpenSettingDialog(true)}>
              <Settings className="h-4 w-4" />
            </div>

            <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-full cursor-pointer" onClick={()=> setIsOpen(true)}>
                <Bell className="h-4 w-4" />
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

      {error && (<StatusDialog status={error} onClose={() => setError(null)} />)}

      {/*setting Dialog */}
      <Dialog open={isOpenSettingDialog} onOpenChange={setIsOpenSettingDialog}>
        <DialogOverlay className="fixed inset-0 bg-black/50" />
        <DialogContent className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-background p-6 rounded-lg shadow-lg w-full max-w-7xl max-h-[90vh] overflow-y-auto">
          <UserSettings />
        </DialogContent>
      </Dialog>

      {/* Main Content */}

      <NotificationDrawer notifications={notifications} isOpen={isOpen} onClose={() => setIsOpen(false)} onClose={() => setIsOpen(false)}
        onMarkAsRead={handleMarkAsRead}/>
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

        {/* Quiz Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Over Time</CardTitle>
            <CardDescription>Your quiz scores across attempts</CardDescription>
          </CardHeader>
          <CardContent>
            {recentQuizzes.length > 0 ? (
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={recentQuizzes.map((entry) => ({
                      ...entry,
                      date: entry.date
                        ? new Date(entry.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "2-digit",
                          })
                        : "N/A",
                    }))}
                    margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <ChartTooltip />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#8884d8"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No quiz history available yet.</p>
            )}
          </CardContent>
        </Card>

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
                        <div className="font-medium">{quiz.subject.trim().trimStart().split('-')[3]} - {quiz.subject.trim().trimStart().split("-")[2]}</div>
                        <div className="text-sm text-muted-foreground"> 
                          {quiz.date}
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

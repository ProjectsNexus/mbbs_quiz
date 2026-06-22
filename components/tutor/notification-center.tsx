"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useTutor } from "@/hooks/use-tutor"
import { useAuth } from "@/hooks/use-auth"
import { Plus, Send, Bell, Clock, Users, BookOpen, CheckCircle, MessageSquare, Calendar } from "lucide-react"

export function NotificationCenter() {
  const { user } = useAuth()
  const { notifications, students, sendNotification, markNotificationRead } = useTutor()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newNotification, setNewNotification] = useState({
    type: "announcement" as const,
    title: "",
    message: "",
    recipients: [] as string[],
  })

  const batches = ["1st Year", "2nd  Year", "3rd Year C", "4th Year D", "Final Year"]
  const notificationTypes = [
    { value: "quiz_assigned", label: "Quiz Assignment", icon: BookOpen },
    { value: "quiz_reminder", label: "Quiz Reminder", icon: Clock },
    { value: "result_published", label: "Result Published", icon: CheckCircle },
    { value: "announcement", label: "General Announcement", icon: MessageSquare },
  ]

  const handleSendNotification = async () => {
    if (newNotification.title && newNotification.message && newNotification.recipients.length > 0) {
      await sendNotification({
        ...newNotification,
        sentBy: user?.uid || "",
        sentAt: new Date(),
        isRead: false,
      })
      setNewNotification({
        type: "announcement",
        title: "",
        message: "",
        recipients: [],
      })
      setIsCreateDialogOpen(false)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "quiz_assigned":
        return <BookOpen className="h-4 w-4" />
      case "quiz_reminder":
        return <Clock className="h-4 w-4" />
      case "result_published":
        return <CheckCircle className="h-4 w-4" />
      case "announcement":
        return <MessageSquare className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "quiz_add":
        return "bg-blue-100 text-blue-800"
      case "user_add":
        return "bg-yellow-100 text-yellow-800"
      case "result_published":
        return "bg-green-100 text-green-800"
      case "announcement":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Quick notification templates
  const quickTemplates = [
    {
      title: "Quiz Added",
      message: "Dear Students, a new quiz has been added. Please check your dashboard for details.",
      type: "quiz_add" as const,
    },
    {
      title: "New Quiz Available",
      message: "A new quiz has been assigned to your batch. Please check your dashboard.",
      type: "quiz_assigned" as const,
    },
    {
      title: "Results Published",
      message: "Your quiz results are now available. Check your performance dashboard.",
      type: "result_published" as const,
    },
    {
      title: "Class Update",
      message: "Important update regarding upcoming classes and schedules.",
      type: "announcement" as const,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Notification Center</h2>
          <p className="text-muted-foreground">Send notifications and announcements to your students</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Send Notification
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Send Notification</DialogTitle>
              <DialogDescription>Create and send a notification to your students</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Notification Type</Label>
                  <Select
                    value={newNotification.type}
                    onValueChange={(value: any) => setNewNotification({ ...newNotification, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {notificationTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="h-4 w-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Recipients</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="all-students"
                        checked={newNotification.recipients.includes("all")}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewNotification({
                              ...newNotification,
                              recipients: ["all"],
                            })
                          } else {
                            setNewNotification({
                              ...newNotification,
                              recipients: [],
                            })
                          }
                        }}
                      />
                      <Label htmlFor="all-students">All Students</Label>
                    </div>
                    {!newNotification.recipients.includes("all") &&
                      batches.map((batch) => (
                        <div key={batch} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={batch}
                            checked={newNotification.recipients.includes(batch)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewNotification({
                                  ...newNotification,
                                  recipients: [...newNotification.recipients, batch],
                                })
                              } else {
                                setNewNotification({
                                  ...newNotification,
                                  recipients: newNotification.recipients.filter((item) => item !== batch),
                                })
                              }
                            }}
                          />
                          <Label htmlFor={batch}>{batch}</Label>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newNotification.title}
                  onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                  placeholder="Enter notification title"
                />
              </div>

              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={newNotification.message}
                  onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                  placeholder="Enter your message"
                  rows={4}
                />
              </div>

              {/* Quick Templates */}
              <div>
                <Label>Quick Templates</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {quickTemplates.map((template, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setNewNotification({
                          ...newNotification,
                          title: template.title,
                          message: template.message,
                          // type: template.type,
                        })
                      }
                    >
                      {template.title}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSendNotification}
                  disabled={
                    !newNotification.title || !newNotification.message || newNotification.recipients.length === 0
                  }
                >
                  <Send className="mr-2 h-4 w-4" />
                  Send Notification
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Notification Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sent</p>
                <p className="text-2xl font-bold">{notifications.length}</p>
              </div>
              <div className="bg-primary/10 p-2 rounded-lg">
                <Send className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold">
                  {
                    notifications.filter((n) => {
                      const weekAgo = new Date()
                      weekAgo.setDate(weekAgo.getDate() - 7)
                      return new Date(n.sentAt) > weekAgo
                    }).length                  
                  }
                </p>
              </div>
              <div className="bg-primary/10 p-2 rounded-lg">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Quiz Reminders</p>
                <p className="text-2xl font-bold">{notifications.filter((n) => n.type === "quiz_reminder").length}</p>
              </div>
              <div className="bg-primary/10 p-2 rounded-lg">
                <Clock className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Announcements</p>
                <p className="text-2xl font-bold">{notifications.filter((n) => n.type === "announcement").length}</p>
              </div>
              <div className="bg-primary/10 p-2 rounded-lg">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications History */}
      <Card>
        <CardHeader>
          <CardTitle>Notification History</CardTitle>
          <CardDescription>All sent notifications and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Sent Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications.length > 0 && (
                notifications .slice() .reverse() .map((notification) => (
                  <TableRow key={notification.id}>
                    <TableCell>
                      <div
                        className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs ${getNotificationColor(notification.type)}`}
                      >
                        {getNotificationIcon(notification.type)}
                        {notification.type.replace("_", " ")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{notification.title}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-xs">{notification.message}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {notification.recipients.includes("all")
                            ? "All Students"
                            : `${notification.recipients.length} Years`}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {notification.sentAt && "seconds" in notification.sentAt
                            ? new Date(notification.sentAt.seconds * 1000).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : "N/A"}{" "}
                          {notification.sentAt && "seconds" in notification.sentAt
                            ? new Date(notification.sentAt.seconds * 1000).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : ""}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Delivered
                      </Badge>
                    </TableCell>
                  </TableRow>)
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useAuth } from "@/hooks/use-auth"
import { FirebaseService } from "@/lib/firebase-service"
import { deleteUser } from "firebase/auth"
import { Trash2, AlertTriangle, Settings, User, Bell, Shield } from "lucide-react"

export function UserSettings() {
  const { user, userProfile, logout } = useAuth()
  const [loading, setLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: false,
    darkMode: false,
    autoSave: true,
  })

  const handleDeleteAccount = async () => {
    if (!user) return

    setDeleteLoading(true)
    try {
      // Delete all user data from Firestore
      const dataDeleted = await FirebaseService.deleteUserData(user.uid)

      if (dataDeleted) {
        // Delete the Firebase Auth user
        await deleteUser(user)
        console.log("[v0] User account and all data deleted successfully")
      } else {
        throw new Error("Failed to delete user data")
      }
    } catch (error) {
      console.error("[v0] Error deleting account:", error)
      alert("Failed to delete account. Please try again.")
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    if (!user) return

    setLoading(true)
    try {
      await FirebaseService.saveUserSettings(user.uid, settings)
      console.log("[v0] Settings saved successfully")
    } catch (error) {
      console.error("[v0] Error saving settings:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Settings</h2>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>Manage your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={userProfile?.name || ""} disabled />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={userProfile?.email || ""} disabled />
            </div>
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <Input id="role" value={userProfile?.role || ""} disabled />
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>Configure your notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifications">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive notifications about quiz assignments</p>
            </div>
            <Switch
              id="notifications"
              checked={settings.notifications}
              onCheckedChange={(checked) => setSettings({ ...settings, notifications: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="emailUpdates">Email Updates</Label>
              <p className="text-sm text-muted-foreground">Receive email updates about your progress</p>
            </div>
            <Switch
              id="emailUpdates"
              checked={settings.emailUpdates}
              onCheckedChange={(checked) => setSettings({ ...settings, emailUpdates: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy & Security
          </CardTitle>
          <CardDescription>Manage your account security and data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="autoSave">Auto-save Progress</Label>
              <p className="text-sm text-muted-foreground">Automatically save your quiz progress</p>
            </div>
            <Switch
              id="autoSave"
              checked={settings.autoSave}
              onCheckedChange={(checked) => setSettings({ ...settings, autoSave: checked })}
            />
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-destructive">Danger Zone</h4>
                <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      Delete Account
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-y-2">
                      <p>
                        This action cannot be undone. This will permanently delete your account and remove all your data
                        from our servers, including:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Your profile and account information</li>
                        <li>All quiz results and performance history</li>
                        <li>Your settings and preferences</li>
                        <li>Any quizzes you created (if you're a tutor)</li>
                        <li>All notifications and assignments</li>
                      </ul>
                      <p className="font-medium text-destructive">
                        Are you absolutely sure you want to delete your account?
                      </p>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      disabled={deleteLoading}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      {deleteLoading ? "Deleting..." : "Yes, delete my account"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={loading}>
          {loading ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  )
}

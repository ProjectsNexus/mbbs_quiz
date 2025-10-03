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
import { deleteUser, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth"
import { Trash2, AlertTriangle, Settings, User, Bell, Shield, Cylinder, EyeOff, Eye } from "lucide-react"
import { Dialog } from "@radix-ui/react-dialog"
import { DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { auth } from "@/lib/firebase"
import { getFirebaseErrorMessage } from "@/lib/firebase-error"
import { StatusDialog } from "../ui/statusAlert"

export function UserSettings() {
  const { user, userProfile, logout } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showpassword, setShowPassword] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [ischangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false)
  const [Status , setStatus] = useState('')
  const [password, setPassword] = useState({oldpassword : '', newpassword : ''})
  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: false,
    darkMode: false,
    autoSave: true,
  })

  const handlePasswordChange = async () => {
    const user = auth.currentUser;
    if (!user || !user.email) {
      setStatus("❌ No user is logged in.");
      return;
    }

    if (password.newpassword === password.oldpassword) {
      setStatus("❌ New password must be different from the old password.");
      return;
    }

    setLoading(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, password.oldpassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, password.newpassword);

      setStatus("✅ Password updated successfully!");
      setPassword({ oldpassword: "", newpassword: "" });
      setIsChangePasswordDialogOpen(false); // optional: auto-close dialog
    } catch (error: any) {
      console.error(error);
      setStatus(getFirebaseErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return

    setDeleteLoading(true)
    try {
      // Delete all user data from Firestore
      const dataDeleted = await FirebaseService.deleteUserData(user.uid)

      if (dataDeleted) {
        // Delete the Firebase Auth user
        await deleteUser(user)
        console.log("User account and all data deleted successfully")
      } else {
        throw new Error("Failed to delete user data")
      }
    } catch (error) {
      console.error("Error deleting account:", error)
      setStatus(getFirebaseErrorMessage((error as any).code));
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
      console.log("Settings saved successfully")
    } catch (error) {
      setStatus(getFirebaseErrorMessage((error as any).code));
      console.error("Error saving settings:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
      <div className="space-y-6">
      {/* Status Alert Dialog */}
      { Status ? (<StatusDialog status={Status} onClose={() => setStatus('')} />) : null}
      {/* Change Password Dialog */}
          <Dialog open={ischangePasswordDialogOpen} onOpenChange={setIsChangePasswordDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Change Password</DialogTitle>
                <DialogDescription>
                  Enter your new password below to update your account password.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="relative">
                  <Input id="password" type={showpassword ? "text" : "password"} placeholder="Enter Old password" value={password.oldpassword} onChange={(e) => {setPassword({...password, oldpassword: e.target.value})}} required disabled={loading} />
                  <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowPassword(!showpassword)} disabled={loading} >
                    {showpassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="relative">
                  <Input id="password" type={showpassword ? "text" : "password"} placeholder="Enter New password" value={password.newpassword} onChange={(e) => {setPassword({...password, newpassword: e.target.value})}} required disabled={loading} />
                  <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowPassword(!showpassword)} disabled={loading} >
                    {showpassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button onClick={() => { handlePasswordChange() }} disabled={!password.newpassword || !password.oldpassword || loading}>
                    {loading ? 'Updating...' : 'Update Password'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
      {/* Header */}
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Settings</h2>
      </div>
      
      {/* Profile Settings */}
      <Card>
        <CardHeader className="flex items-between">
          <div> 
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>Manage your account details</CardDescription>
          </div>
          <div>
            <Button variant="outline" className="bg-transparent" onClick={() => {setIsChangePasswordDialogOpen(true)}}>
              <Cylinder className="mr-2 h-4 w-4"/>
                Change Password
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={userProfile?.name || "user"} disabled/>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={userProfile?.email || ""} disabled />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Input id="role" value={userProfile?.role || ""} disabled />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Input id="role" value={userProfile?.year || ""} disabled />
            </div>
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

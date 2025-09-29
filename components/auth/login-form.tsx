"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/use-auth"
import { Loader2, Eye, EyeOff, GraduationCap, Users } from "lucide-react"

interface LoginFormProps {
  onToggleMode: () => void
}

export function LoginForm({ onToggleMode }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { signIn } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await signIn(email, password)
    } catch (error: any) {
      setError(error.message || "Failed to sign in")
    } finally {
      setLoading(false)
    }
  }

  const handleDemoStudentLogin = async () => {
    setLoading(true)
    setError("")

    try {
      await signIn("student@demo.com", "password")
    } catch (error: any) {
      setError("Demo student login failed. Please try manual login.")
    } finally {
      setLoading(false)
    }
  }

  const handleDemoTutorLogin = async () => {
    setLoading(true)
    setError("")

    try {
      await signIn("tutor@demo.com", "password")
    } catch (error: any) {
      setError("Demo tutor login failed. Please try manual login.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-primary">Welcome Back</CardTitle>
        <CardDescription>Sign in to access your MBBS quizzes</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        {/* <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or try demo</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="bg-transparent flex items-center gap-2"
            onClick={handleDemoStudentLogin}
            disabled={loading}
          >
            <GraduationCap className="h-4 w-4" />
            Student Demo
          </Button>
          <Button
            variant="outline"
            className="bg-transparent flex items-center gap-2"
            onClick={handleDemoTutorLogin}
            disabled={loading}
          >
            <Users className="h-4 w-4" />
            Tutor Demo
          </Button>
        </div>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">Don't have an account? </span>
          <Button variant="link" className="p-0 h-auto" onClick={onToggleMode}>
            Sign up
          </Button>
        </div>

        <div className="text-center text-xs text-muted-foreground border-t pt-4">
          <p className="mb-2">Demo Credentials:</p>
          <p>Student: student@demo.com / password</p>
          <p>Tutor: tutor@demo.com / password</p>
        </div> */}
      </CardContent>
    </Card>
  )
}

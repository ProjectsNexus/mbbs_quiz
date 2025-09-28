"use client"

import { useState } from "react"
import { LoginForm } from "./login-form"
import { SignupForm } from "./signup-form"
import { useTheme } from "@/hooks/use-theme"
import { Button } from "@/components/ui/button"
import { Moon, Sun, GraduationCap } from "lucide-react"

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="absolute top-4 right-4">
        <Button variant="outline" size="icon" onClick={toggleTheme} className="rounded-full bg-transparent">
          {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </Button>
      </div>

      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-primary/10 p-4 rounded-full">
              <GraduationCap className="h-12 w-12 text-primary" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-primary">MBBS Quiz</h1>
            <p className="text-muted-foreground mt-2">Master your medical knowledge with comprehensive quizzes</p>
          </div>
        </div>

        {isLogin ? (
          <LoginForm onToggleMode={() => setIsLogin(false)} />
        ) : (
          <SignupForm onToggleMode={() => setIsLogin(true)} />
        )}
      </div>
    </div>
  )
}

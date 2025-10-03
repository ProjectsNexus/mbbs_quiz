export interface User {
  id: string
  email: string
  name: string
  year: string | ''
  role: "student" | "tutor"
  createdAt: Date
  updatedAt: Date
}

export interface Student {
  id: string
  userID: string
  name: string
  email: string
  batch: string
  year: string
  joinedAt: Date
  performance: {
    totalQuizzes: number
    averageScore: number
    lastActive: Date
  }
}

export interface Quiz {
  id: string
  title: string
  description: string
  subject: string
  topic: string
  difficulty: "easy" | "medium" | "hard" | string
  year: string
  block: string
  questions: Question[]
  timeLimit: number
  totalMarks: number
  createdBy: string
  createdAt: Date
  isPublished: boolean
  tags: string[]
}

export interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  marks: number
  difficulty: "easy" | "medium" | "hard"
}

export interface QuizAssignment {
  id: string
  quizId: string
  assignedTo: string[] // student IDs or batch names
  assignedBy: string
  instructions: string
  isActive: boolean
}

export interface StudentPerformance {
  studentId: string
  quizId: string
  quizDetails?: {
    subject: string
    topic: string
    year: string
    block: string
    mode: "exam" | "practice"
  }
  score: number
  totalMarks: number
  percentage: number
  timeSpent: number
  completedAt: Date
  answers: {
    questionId: string
    selectedAnswer: number
    isCorrect: boolean
    timeSpent: number
  }[]
}

export interface Notification {
  id: string
  type: "user_add"  | "quiz_add" | "result_published" | "announcement" | string
  title: string
  message: string
  recipients: string[]
  sentBy: string
  sentAt: Date
  isRead: boolean
}

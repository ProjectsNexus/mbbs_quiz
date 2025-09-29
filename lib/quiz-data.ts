// MBBS Course Structure based on provided requirements
export const MBBS_STRUCTURE = {
  "1st Year": {
    blocks: ["A", "B", "C"],
    subjects: {
      A: [],
      B: [],
      C: [],
    },
  },
  "2nd Year": {
    blocks: ["D", "E", "F"],
    subjects: {
      D: [],
      E: ["Minor Subjects", "Embryology", "Histology", "Anatomy", "Biochemistry", "Physiology"],
      F: [,],
    },
  },
  "3rd Year": {
    blocks: ["G", "H", "I"],
    subjects: {
      G: [],
      H: [],
      I: [],
    },
  },
  "4th Year": {
    blocks: ["J", "K", "L", "M1", "M2"],
    subjects: {
      J: [],
      K: [],
      L: [],
      M1: [],
      M2: [],
    },
  },
  "Final Year": {
    blocks: ["N", "O", "P", "Q"],
    subjects: {
      N: [],
      O: [],
      P: [],
      Q: [],
    },
  },
}


export interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  difficulty: "easy" | "medium" | "hard"
  marks: number
}

export interface QuizSession {
  id: string
  userId: string
  year: string
  block: string
  subject: string
  testTopic: string
  mode: "exam" | "practice"
  timeLimit: number
  totalQuestions: number
  questions: Question[]
  answers: (number | null)[]
  startTime: Date
  endTime?: Date
  score?: number
  status: "in-progress" | "completed" | "failed"
}

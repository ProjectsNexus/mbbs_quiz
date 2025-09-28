"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { collection, query, addDoc, updateDoc, deleteDoc, doc, onSnapshot, getDoc, writeBatch } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Student, Quiz, QuizAssignment, StudentPerformance, Notification } from "@/lib/types"
import { useAuth } from "@/hooks/use-auth"

interface TutorContextType {
  students: Student[]
  quizzes: Quiz[]
  assignments: QuizAssignment[]
  performances: StudentPerformance[]
  notifications: Notification[]
  loading: boolean

  // Student Management
  addStudent: (student: Omit<Student, "id">) => Promise<void>
  removeStudent: (studentId: string) => Promise<void>
  updateStudent: (studentId: string, updates: Partial<Student>) => Promise<void>
  getStudentsByBatch: (batch: string) => Student[]

  // Quiz Management
  createQuiz: (quiz: Omit<Quiz, "id">) => Promise<string>
  updateQuiz: (quizId: string, updates: Partial<Quiz>) => Promise<void>
  bulkUpdatedQuiz: (quizId: string, update: Partial<Quiz>) => Promise<void>
  deleteQuiz: (quizId: string) => Promise<void>
  publishQuiz: (quizId: string) => Promise<void>

  // Assignment Management
  assignQuiz: (assignment: Omit<QuizAssignment, "id">) => Promise<void>
  updateAssignment: (assignmentId: string, updates: Partial<QuizAssignment>) => Promise<void>

  // Analytics
  getStudentPerformance: (studentId: string) => StudentPerformance[]
  getQuizAnalytics: (quizId: string) => {
    totalAttempts: number
    averageScore: number
    passRate: number
    topPerformers: Student[]
    lowPerformers: Student[]
  }

  // Communication
  sendNotification: (notification: Omit<Notification, "id">) => Promise<void>
  markNotificationRead: (notificationId: string) => Promise<void>
}

const TutorContext = createContext<TutorContextType | undefined>(undefined)

export function TutorProvider({ children }: { children: React.ReactNode }) {
  const [students, setStudents] = useState<Student[]>([])
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [assignments, setAssignments] = useState<QuizAssignment[]>([])
  const [performances, setPerformances] = useState<StudentPerformance[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const { signUp, deleteUserAccount } = useAuth()

  useEffect(() => {
    // Set up real-time listeners for all collections
    const unsubscribes: (() => void)[] = []

    const loadingTimeout = setTimeout(() => {
      console.log("Tutor dashboard loading timeout - setting loading to false")
      setLoading(false)
    }, 5000)

    // Students listener
    const studentsQuery = query(collection(db, "students"))
    unsubscribes.push(
      onSnapshot(
        studentsQuery,
        (snapshot) => {
          const studentsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Student)
          setStudents(studentsData)
          console.log(`Loaded ${studentsData.length} students`)
        },
        (error) => {
          console.error("Error loading students:", error)
        },
      ),
    )

    // Quizzes listener
    const quizzesQuery = query(collection(db, "quizzes"))
    unsubscribes.push(
      onSnapshot(
        quizzesQuery,
        (snapshot) => {
          const quizzesData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Quiz)
          setQuizzes(quizzesData)
          console.log(`Loaded ${quizzesData.length} quizzes`)
        },
        (error) => {
          console.error("Error loading quizzes:", error)
        },
      ),
    )

    // Assignments listener
    const assignmentsQuery = query(collection(db, "assignments"))
    unsubscribes.push(
      onSnapshot(
        assignmentsQuery,
        (snapshot) => {
          const assignmentsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as QuizAssignment)
          setAssignments(assignmentsData)
          console.log(`Loaded ${assignmentsData.length} assignments`)
        },
        (error) => {
          console.error("Error loading assignments:", error)
        },
      ),
    )

    // Performances listener
    const performancesQuery = query(collection(db, "performances"))
    unsubscribes.push(
      onSnapshot(
        performancesQuery,
        (snapshot) => {
          const performancesData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as StudentPerformance)
          setPerformances(performancesData)
          console.log(`Loaded ${performancesData.length} performances`)
        },
        (error) => {
          console.error("Error loading performances:", error)
        },
      ),
    )

    // Notifications listener
    const notificationsQuery = query(collection(db, "notifications"))
    unsubscribes.push(
      onSnapshot(
        notificationsQuery,
        (snapshot) => {
          const notificationsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Notification)
          setNotifications(notificationsData)
          console.log(`Loaded ${notificationsData.length} notifications`)
          clearTimeout(loadingTimeout)
          setLoading(false)
        },
        (error) => {
          console.error("Error loading notifications:", error)
          clearTimeout(loadingTimeout)
          setLoading(false)
        },
      ),
    )

    return () => {
      clearTimeout(loadingTimeout)
      unsubscribes.forEach((unsubscribe) => unsubscribe())
    }
  }, [])

  // Student Management Functions
  const addStudent = async (student: Omit<Student, "id">) => {
    const addStudent = addDoc(collection(db, "students"), student)
    await addStudent

    //get student id
    const studentId = (await addStudent).id 
    await signUp(student.email, "Student@"+student.year , student.name, 'student', "tutor", studentId, student.year)
  }

  const removeStudent = async (studentId: string) => {
    try {
      // 1️⃣ Get student doc to find linked user ID
      const studentRef = doc(db, "students", studentId)
      const studentSnap = await getDoc(studentRef)

      if (!studentSnap.exists()) {
        throw new Error(`Student document (${studentId}) not found.`)
      }

      const studentData = studentSnap.data()
      const userId = studentData.userID
      console.log(` Found linked userID: ${userId}`)

      if (userId != undefined) {
        await deleteUserAccount(userId);
      }
      console.log(userId + ' Delete User and there data')
      await deleteDoc(doc(db, "students", studentId))
    } catch (error) {
      console.error(" Error removing student:", error)
      throw error
    }
  }

  const updateStudent = async (studentId: string, updates: Partial<Student>) => {
    await updateDoc(doc(db, "students", studentId), updates)
  }

  const getStudentsByBatch = (batch: string) => {
    return students.filter((student) => student.batch === batch)
  }

  // Quiz Management Functions
  const createQuiz = async (quiz: Omit<Quiz, "id">) => {
    const docRef = await addDoc(collection(db, "quizzes"), quiz)
    return docRef.id
  }

  const updateQuiz = async (quizId: string, updates: Partial<Quiz>) => {
    await updateDoc(doc(db, "quizzes", quizId), updates)
  }

  const  bulkUpdatedQuiz = async ( quizIds: string[], updates: { year?: string; block?: string; subject?: string, difficulty: string }, userId: string): Promise<void>  => {
      try {
        if (quizIds.length === 0) {
          throw new Error("No quiz IDs provided.")
        }
  
        const batch = writeBatch(db)
  
        quizIds.forEach((id) => {
          const quizRef = doc(db, "quizzes", id)
          batch.update(quizRef, {
            ...updates,
            updatedBy: userId,
            updatedAt: new Date(),
          })
        })
  
        await batch.commit()
        console.log(`✅ Bulk updated ${quizIds.length} quizzes.`)
      } catch (error) {
        console.error("Error bulk updating quizzes:", error)
        throw error
      }
    }
  

  const deleteQuiz = async (quizId: string) => {
    await deleteDoc(doc(db, "quizzes", quizId))
  }

  const publishQuiz = async (quizId: string) => {
    await updateDoc(doc(db, "quizzes", quizId), { isPublished: true })
  }

  // Assignment Management Functions
  const assignQuiz = async (assignment: Omit<QuizAssignment, "id">) => {
    await addDoc(collection(db, "assignments"), assignment)
  }

  const updateAssignment = async (assignmentId: string, updates: Partial<QuizAssignment>) => {
    await updateDoc(doc(db, "assignments", assignmentId), updates)
  }

  // Analytics Functions
  const getStudentPerformance = (studentId: string) => {
    return performances.filter((perf) => perf.studentId === studentId)
  }

  const getQuizAnalytics = (quizId: string) => {
    const quizPerformances = performances.filter((perf) => perf.quizId === quizId)
    const totalAttempts = quizPerformances.length
    const averageScore =
      totalAttempts > 0 ? quizPerformances.reduce((sum, perf) => sum + perf.percentage, 0) / totalAttempts : 0
    const passRate =
      totalAttempts > 0 ? (quizPerformances.filter((perf) => perf.percentage >= 60).length / totalAttempts) * 100 : 0

    const sortedPerformances = quizPerformances.sort((a, b) => b.percentage - a.percentage)
    const topPerformers = sortedPerformances
      .slice(0, 5)
      .map((perf) => students.find((student) => student.id === perf.studentId)!)
      .filter(Boolean)
    const lowPerformers = sortedPerformances
      .slice(-5)
      .map((perf) => students.find((student) => student.id === perf.studentId)!)
      .filter(Boolean)

    return {
      totalAttempts,
      averageScore,
      passRate,
      topPerformers,
      lowPerformers,
    }
  }

  // Communication Functions
  const sendNotification = async (notification: Omit<Notification, "id">) => {
    await addDoc(collection(db, "notifications"), notification)
  }

  const markNotificationRead = async (notificationId: string) => {
    await updateDoc(doc(db, "notifications", notificationId), { isRead: true })
  }

  const value = {
    students,
    quizzes,
    assignments,
    performances,
    notifications,
    loading,
    addStudent,
    removeStudent,
    updateStudent,
    getStudentsByBatch,
    createQuiz,
    updateQuiz,
    bulkUpdatedQuiz,
    deleteQuiz,
    publishQuiz,
    assignQuiz,
    updateAssignment,
    getStudentPerformance,
    getQuizAnalytics,
    sendNotification,
    markNotificationRead,
  }

  return <TutorContext.Provider value={value}>{children}</TutorContext.Provider>
}

export function useTutor() {
  const context = useContext(TutorContext)
  if (context === undefined) {
    throw new Error("useTutor must be used within a TutorProvider")
  }
  return context
}

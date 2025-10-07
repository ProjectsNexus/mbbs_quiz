import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  updateDoc,
  setDoc,
  serverTimestamp,
  deleteDoc,
  writeBatch,
} from "firebase/firestore"
import { auth, db } from "./firebase"
import { MBBS_STRUCTURE, type Question, type QuizSession } from "./quiz-data"
import type { Student, Quiz, QuizAssignment, StudentPerformance, Notification } from "./types"

export class FirebaseService {
   // Get questions for a specific quiz configuration
    static async getQuestions(
    year: string,
    block: string,
    subject: string,
    testTopic: string,
    questionRange: [number, number] // e.g. [5, 20]
  ): Promise<Question[]> {
    try {
      // Reference to Firestore collection
      const questionsRef = collection(db, "quizzes");

      // Filter by fields
      const q = query(
        questionsRef,
        where("year", "==", year),
        where("block", "==", block),
        where("subject", "==", subject),
        where("topic", "==", testTopic),
        where("isPublished", "==", true)
      );

      const querySnapshot = await getDocs(q);

      let questions: Question[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const questionArray = data.questions || [];

        // Optional: shuffle for randomization
        // const shuffled = [...questionArray].sort(() => Math.random() - 0.5);
        
        // Determine slice indices from range
        const startIndex = Math.max(0, questionRange[0] - 1); // user starts from 1
        const endIndex = Math.min(questionArray.length, questionRange[1]);

        
        // Slice based on the selected range
        const selected = questionArray.slice(startIndex, endIndex);

        // Map and push into final array
        selected.forEach((q, idx) => {
          questions.push({
            id: q.id || `${doc.id}-${idx}`,
            question: q.question,
            options: q.options || [],
            correctAnswer: q.correctAnswer,
            explanation: q.explanation || "",
            difficulty: q.difficulty || "medium",
            marks: q.marks || 1,
          });
        });
      });

      return questions;
    } catch (error) {
      console.error("❌ Error fetching questions from Firestore:", error);
      return [];
    }
  }

  // static async getQuestions(
  //   year: string,
  //   block: string,
  //   subject: string,
  //   testTopic: string,
  //   questionCount: []
  //   ): Promise<Question[]> {
  //   try {

  //     // point to quizzes collection
  //     const questionsRef = collection(db, "quizzes");

  //     // filter by fields
  //     const q = query(
  //       questionsRef,
  //       where("year", "==", year),
  //       where("block", "==", block),
  //       where("subject", "==", subject),
  //       where("topic", "==", testTopic)
  //     );

  //     const querySnapshot = await getDocs(q);

  //     let questions: Question[] = [];

  //     querySnapshot.forEach((doc) => {
  //       const data = doc.data();
  //       const questionArray = data.questions || [];

  //       // shuffle the array
  //       const shuffled = [...questionArray].sort(() => Math.random() - 0.5);

  //       // pick only N
  //       const limited = shuffled.slice(0, questionCount);

  //       limited.forEach((q, idx) => {
  //         questions.push({
  //           id: q.id || `${doc.id}-${idx}`,
  //           question: q.question,
  //           options: q.options || [],
  //           correctAnswer: q.correctAnswer,
  //           explanation: q.explanation || "",
  //           difficulty: q.difficulty || "medium",
  //           marks: q.marks || 1,
  //         });
  //       });

        
  //     });

  //     return questions;
  //   } catch (error) {
  //     console.error("❌ Error fetching questions from Firestore:", error);
  //     return [];
  //   }
  // }



  // Save quiz session
  static async saveQuizSession(session: Omit<QuizSession, "id">): Promise<string | null> {
    try {
      const docRef = await addDoc(collection(db, "quiz_sessions"), {
        ...session,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      return docRef.id
    } catch (error) {
      console.error("Error saving quiz session:", error)
      return null
    }
  }

  // Get user's quiz history
  static async getUserQuizHistory(
    userId: string,
    limitCount = 5
  ): Promise<{ subject: string; score: number; date: Date | null }[]> {
    try {
      const sessionsRef = collection(db, "student_performances")
      const q = query(
        sessionsRef,
        where("studentId", "==", userId),
        orderBy("completedAt", "desc"),
        limit(limitCount)
      )

      const querySnapshot = await getDocs(q)
      const sessions: { subject: string; score: number; date: Date | null }[] = []

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data()
        sessions.push({
          subject: data.quizId ?? "",
          score: data.score ?? 0,
          date: data.completedAt?.toDate?.() || null,
        })
      })

      return sessions
    } catch (error) {
      console.error("Error fetching quiz history:", error)
      return []
    }
  }

  // Update quiz session
  static async updateQuizSession(sessionId: string, updates: Partial<QuizSession>): Promise<boolean> {
    try {
      const sessionRef = doc(db, "quiz_sessions", sessionId)
      await updateDoc(sessionRef, {
        ...updates,
        updatedAt: new Date(),
      })
      return true
    } catch (error) {
      console.error("Error updating quiz session:", error)
      return false
    }
  }

  // Check Year allow to Student
  static async checkStudentAllow(year: string): Promise<boolean> {
    try {
      const user = auth.currentUser
      if (!user) throw new Error("No logged-in user")

      const userRef = doc(db, "users", user.uid)
      const userSnap = await getDoc(userRef)

      if (!userSnap.exists()) {
        console.warn("User not found in Firestore")
        return false
      }

      const userData = userSnap.data()
      
      return userData.year === year
    } catch (error) {
      console.error("Error checking student year:", error)
      return false
    }
  }

  // Get available test topics for a subject
  static async getTestTopics(
    year: string | undefined,
    blocks: string[],
    subjects: string[]
  ): Promise<Array<{ topic: string; NumberQuestions: number }>> {
    try {
      const ref = collection(db, "quizzes");

      // Firestore `where` does not accept arrays directly; use `in` for multiple values
      const q = query(
        ref,
        where("year", "==", year),
        where("block", "==", blocks),
        where("subject", "==", subjects)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        console.warn("No topics found for given filters");
        return [];
      }

      // Map documents to topic details
      const topicDetails = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          topic: data.topic,
          NumberQuestions: Array.isArray(data.questions)
            ? data.questions.length
            : 0, // safeguard in case questions is not an array
        };
      });

      return topicDetails;
    } catch (error) {
      console.error("Error fetching topics:", error);
      return [];
    }
  }


  // Get number of Questions in a Quiz
  static async getQuestionsNumber(
    year: string,
    block: string,
    subject: string,
    testTopic: string,
  ) {
    try {
      // point to quizzes collection
      const questionsRef = collection(db, "quizzes");

      // filter by fields
      const q = query(
        questionsRef,
        where("year", "==", year),
        where("block", "==", block),
        where("subject", "==", subject),
        where("topic", "==", testTopic)
      );

      const querySnapshot = await getDocs(q);

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const questionCount = data.questions.length || 60;
                
        return  questionCount;

      });
    } catch (error) {
      console.error("❌ Error fetching questions from Firestore:", error);
      return [];
    }
  }


  // Get user statistics
  static async getUserStats(userId: string): Promise<{
    totalQuizzes: number
    averageScore: number
    bestScore: number
    totalTimeSpent: number
  }> {
    try {
      const userStatsRef = doc(db, "user_stats", userId)
      const userStatsDoc = await getDoc(userStatsRef)

      if (userStatsDoc.exists()) {
        const data = userStatsDoc.data()

        // Use serverTimestamp for lastQuizDate but keep createdAt for calculation
        const createdAt = data.createdAt?.toDate?.() || new Date()
        const lastQuizDate = data.lastQuizDate?.toDate?.() || new Date()
        const totalTimeSpent = Math.floor(
          (lastQuizDate.getTime() - createdAt.getTime()) / 1000 
        )
          
        return {
          totalQuizzes: data.totalQuizzes || 0,
          averageScore: data.averageScore || 0,
          bestScore: data.bestScore || 0,
          totalTimeSpent: totalTimeSpent || 0, // if you plan to track this later
        }
      } else {
        return {
          totalQuizzes: 0,
          averageScore: 0,
          bestScore: 0,
          totalTimeSpent: 0,
        }
      }
    } catch (error) {
      console.error("Error fetching user stats:", error)
      return {
        totalQuizzes: 0,
        averageScore: 0,
        bestScore: 0,
        totalTimeSpent: 0,
      }
    }
  }


  static async saveQuizResult(result: {
    userId: string
    quizId: string
    score: number
    totalMarks: number
    percentage: number
    timeSpent: number
    answers: {
      questionId: string
      selectedAnswer: number
      isCorrect: boolean
      timeSpent: number
    }[]
    mode: "exam" | "practice"
    year: string
    block: string
    subject: string
    topic: string
  }): Promise<string | null> {
    try {
      //console.log(
      //   ` Saving quiz result for user ${result.userId}: ${result.score}/${result.totalMarks} (${result.percentage}%)`,
      // )

      const performance: StudentPerformance = {
        studentId: result.userId,
        quizId: result.quizId,
        score: result.score,
        totalMarks: result.totalMarks,
        percentage: result.percentage,
        timeSpent: result.timeSpent,
        completedAt: new Date(),
        answers: result.answers,
      }

      const docRef = await addDoc(collection(db, "student_performances"), performance)
      // await addDoc(collection(db, "performances"), performance)
      //console.log(` Quiz result saved with ID: ${docRef.id}`)

      await this.updateUserStats(result.userId, result.score, result.percentage)
      //console.log(` User stats updated for ${result.userId}`)

      return docRef.id
    } catch (error) {
      console.error("Error saving quiz result to Firestore:", error)
      return null
    }
  }

  static async updateUserStats(userId: string, score: number, percentage: number): Promise<void> {
    try {
      const userStatsRef = doc(db, "user_stats", userId)
      const userStatsDoc = await getDoc(userStatsRef)

      if (userStatsDoc.exists()) {
        const currentStats = userStatsDoc.data()
        const newTotalQuizzes = currentStats.totalQuizzes + 1
        const newAverageScore = (currentStats.averageScore * currentStats.totalQuizzes + percentage) / newTotalQuizzes

        await updateDoc(userStatsRef, {
          totalQuizzes: newTotalQuizzes,
          averageScore: Math.round(newAverageScore),
          bestScore: Math.max(currentStats.bestScore, percentage),
          lastQuizDate: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      } else {
        await setDoc(userStatsRef, {
          totalQuizzes: 1,
          averageScore: Math.round(percentage),
          bestScore: percentage,
          lastQuizDate: serverTimestamp(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      }
    } catch (error) {
      console.error("Error updating user stats:", error)
    }
  }

  static async getStudentsByBatch(batch: string): Promise<Student[]> {
    try {
      const studentsRef = collection(db, "students")
      const q = query(studentsRef, where("batch", "==", batch))
      const querySnapshot = await getDocs(q)

      const students: Student[] = []
      querySnapshot.forEach((doc) => {
        students.push({ id: doc.id, ...doc.data() } as Student)
      })

      return students
    } catch (error) {
      console.error("Error fetching students:", error)
      return []
    }
  }

  static async createQuiz(quiz: Omit<Quiz, "id" | "createdAt">): Promise<string | null> {
    try {
      const docRef = await addDoc(collection(db, "quizzes"), {
        ...quiz,
        createdAt: serverTimestamp(),
      })
      return docRef.id
    } catch (error) {
      console.error("Error creating quiz:", error)
      return null
    }
  }

  
// Bulk update quizzes with year, block, and subject
  

async bulkUpdateQuizzesSelection ( quizIds: string[], updates: { year?: string; block?: string; subject?: string }, userId: string): Promise<void> {
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
      //console.log(`✅ Bulk updated ${quizIds.length} quizzes.`)
    } catch (error) {
      console.error("Error bulk updating quizzes:", error)
      throw error
    }
  }

  static async getQuizzesByTutor(tutorId: string): Promise<Quiz[]> {
    try {
      const quizzesRef = collection(db, "quizzes")
      const q = query(quizzesRef, where("createdBy", "==", tutorId), orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(q)

      const quizzes: Quiz[] = []
      querySnapshot.forEach((doc) => {
        quizzes.push({ id: doc.id, ...doc.data() } as Quiz)
      })

      return quizzes
    } catch (error) {
      console.error("Error fetching tutor quizzes:", error)
      return []
    }
  }

  static async assignQuiz(assignment: Omit<QuizAssignment, "id">): Promise<string | null> {
    try {
      const docRef = await addDoc(collection(db, "quiz_assignments"), assignment)

      
      await this.sendNotification({
        type: "quiz_assigned",
        title: "New Quiz Assigned",
        message: `A new quiz has been assigned to you. Due date: `,
        recipients: assignment.assignedTo,
        sentBy: assignment.assignedBy,
      })

      return docRef.id
    } catch (error) {
      console.error("Error assigning quiz:", error)
      return null
    }
  }

  static async getStudentPerformances(studentIds: string[]): Promise<StudentPerformance[]> {
    try {
      const performancesRef = collection(db, "student_performances")
      const q = query(performancesRef, where("studentId", "in", studentIds), orderBy("completedAt", "desc"))
      const querySnapshot = await getDocs(q)

      const performances: StudentPerformance[] = []
      querySnapshot.forEach((doc) => {
        performances.push({ ...doc.data() } as StudentPerformance)
      })

      return performances
    } catch (error) {
      console.error("Error fetching student performances:", error)
      return []
    }
  }

  static async sendNotification(notification: Omit<Notification, "id" | "sentAt" | "isRead">): Promise<string | null> {
    try {
      const docRef = await addDoc(collection(db, "notifications"), {
        ...notification,
        sentAt: serverTimestamp(),
        isRead: false,
      })
      return docRef.id
    } catch (error) {
      console.error("Error sending notification:", error)
      return null
    }
  }

  static async markNotificationAsRead(id: string): Promise<boolean> {
    try {
      const docRef = doc(db, "notifications", id);
      await updateDoc(docRef, { isRead: true });
      return true;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return false;
    }
  }
  
  static async getUserNotifications(userId: string): Promise<Notification[]> {
    try {
      const notificationsRef = collection(db, "notifications")
      
      const q = query(
        notificationsRef,
        where("recipients", "array-contains", userId),
        orderBy("sentAt", "desc"),
        limit(20),
      )
      const querySnapshot = await getDocs(q)

      const notifications: Notification[] = []
      querySnapshot.forEach((doc) => {
        notifications.push({ id: doc.id, ...doc.data() } as Notification)
      })

      return notifications
    } catch (error) {
      console.error("Error fetching notifications:", error)
      return []
    }
  }

  static async saveUserSettings(userId: string, settings: any): Promise<boolean> {
    try {
      await setDoc(
        doc(db, "user_settings", userId),
        {
          ...settings,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      )
      return true
    } catch (error) {
      console.error("Error saving user settings:", error)
      return false
    }
  }

  static async getUserSettings(userId: string): Promise<any> {
    try {
      const settingsDoc = await getDoc(doc(db, "user_settings", userId))
      return settingsDoc.exists() ? settingsDoc.data() : {}
    } catch (error) {
      console.error("Error fetching user settings:", error)
      return {}
    }
  }

  static async getAllQuizResults(): Promise<StudentPerformance[]> {
    try {
      const performancesRef = collection(db, "student_performances")
      const q = query(performancesRef, orderBy("completedAt", "desc"))
      const querySnapshot = await getDocs(q)

      const performances: StudentPerformance[] = []
      querySnapshot.forEach((doc) => {
        performances.push({ ...doc.data() } as StudentPerformance)
      })

      //console.log(` Loaded ${performances.length} quiz results for tutor view`)
      return performances
    } catch (error) {
      console.error("Error fetching all quiz results:", error)
      return []
    }
  }

  //delete user data by tutor
  static async deleteUserData(userId: string): Promise<boolean> {
    try {
      //console.log(`[Starting deletion of all data for user ${userId}`)

      // Delete user profile
      await deleteDoc(doc(db, "users", userId))
      //console.log(`[Deleted user profile for ${userId}`)

      // Delete user stats
      await deleteDoc(doc(db, "user_stats", userId))
      //console.log(`[Deleted user stats for ${userId}`)

      // Delete user settings
      await deleteDoc(doc(db, "user_settings", userId))
      //console.log(`[Deleted user settings for ${userId}`)

      // Delete quiz sessions
      const sessionsRef = collection(db, "quiz_sessions")
      const sessionsQuery = query(sessionsRef, where("userId", "==", userId))
      const sessionsSnapshot = await getDocs(sessionsQuery)

      const batch = writeBatch(db)
      sessionsSnapshot.forEach((doc) => {
        batch.delete(doc.ref)
      })

      // Delete student performances
      const performancesRef = collection(db, "student_performances")
      const performancesQuery = query(performancesRef, where("studentId", "==", userId))
      const performancesSnapshot = await getDocs(performancesQuery)

      performancesSnapshot.forEach((doc) => {
        batch.delete(doc.ref)
      })

      // Delete performances (duplicate collection)
      const performances2Ref = collection(db, "performances")
      const performances2Query = query(performances2Ref, where("studentId", "==", userId))
      const performances2Snapshot = await getDocs(performances2Query)

      performances2Snapshot.forEach((doc) => {
        batch.delete(doc.ref)
      })

      // Delete notifications where user is recipient
      const notificationsRef = collection(db, "notifications")
      const notificationsQuery = query(notificationsRef, where("recipients", "array-contains", userId))
      const notificationsSnapshot = await getDocs(notificationsQuery)

      notificationsSnapshot.forEach((doc) => {
        batch.delete(doc.ref)
      })

      // If user is a tutor, delete their quizzes and assignments
      const quizzesRef = collection(db, "quizzes")
      const quizzesQuery = query(quizzesRef, where("createdBy", "==", userId))
      const quizzesSnapshot = await getDocs(quizzesQuery)

      quizzesSnapshot.forEach((doc) => {
        batch.delete(doc.ref)
      })

      const assignmentsRef = collection(db, "quiz_assignments")
      const assignmentsQuery = query(assignmentsRef, where("assignedBy", "==", userId))
      const assignmentsSnapshot = await getDocs(assignmentsQuery)

      assignmentsSnapshot.forEach((doc) => {
        batch.delete(doc.ref)
      })

      await batch.commit()
      //console.log(`[Successfully deleted all data for user ${userId}`)

      return true
    } catch (error) {
      console.error(`[Error deleting user data for ${userId}:`, error)
      return false
    }
  }
}

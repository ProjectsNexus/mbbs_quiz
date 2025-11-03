"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import {
  type User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  deleteUser,
  sendSignInLinkToEmail,
} from "firebase/auth"
import { addDoc, collection, deleteDoc, doc, getDoc, setDoc, updateDoc } from "firebase/firestore"
import { auth, db, secondaryAuth, secondaryDb } from "@/lib/firebase"
import type { User } from "@/lib/types"
import { is } from "date-fns/locale"

interface AuthContextType {
  user: FirebaseUser | null
  userProfile: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string, role?: "student" | "tutor", studentYear?: string, createdBy?: 'tutor' | 'self') => Promise<void>
  createStudentByTutor: (email: string, password: string, name: string, studentYear: string, studentId:string) => Promise<void>
  sendStudentInvite: (studentEmail: string, studentName: string, studentYear: string, createdBy?: "tutor" | "self") => Promise<void>
  logout: () => Promise<void>
  deleteUserAccount: (sudentID: string) => Promise<void>
  isTutor: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [userProfile, setUserProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const isTutor =
    userProfile?.role === "tutor" ||
    user?.email?.includes("tutor") ||
    user?.email?.includes("teacher") ||
    user?.email?.includes("admin") ||
    false

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)

      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
          if (userDoc.exists()) {
            setUserProfile(userDoc.data() as User)
          } else {
            const defaultRole =
              firebaseUser.email?.includes("tutor") ||
              firebaseUser.email?.includes("teacher") ||
              firebaseUser.email?.includes("admin")
                ? "tutor"
                : "student"

            const newProfile: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email || "",
              name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
              role: defaultRole,
              year: '2nd Year',
              createdAt: new Date(),
              updatedAt: new Date(),
            }

            await setDoc(doc(db, "users", firebaseUser.uid), newProfile)
            setUserProfile(newProfile)
          }
        } catch (error) {
          console.error("Error fetching user profile:", error)
        }
      } else {
        setUserProfile(null)
      }

      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
    
  }

  const signUp = async (
    email: string,
    password: string,
    name: string,
    role: "student" | "tutor" = "student",
    createdBy: "self" | "tutor",
    studentYear: string
  ) => {
    try {
      //console.log(`Creating account for ${email} with role ${role}`)

      // Save the current logged-in tutor user
      const currentUser = auth.currentUser
      //console.log(` Current user before signup: ${currentUser?.email || "None"}`);
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)

      const detectedRole =
        email.includes("tutor") || email.includes("teacher") || email.includes("admin")
          ? "tutor"
          : role

      const userProfile: User = {
        id: userCredential.user.uid,
        email,
        name,
        role: detectedRole,
        year: studentYear || "",
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // Create Firestore profile
      await setDoc(doc(db, "users", userCredential.user.uid), userProfile)
      //console.log(`User profile created in Firestore for ${email}`)

      await setDoc(doc(db, "user_stats", userCredential.user.uid), {
        totalQuizzes: 0,
        averageScore: 0,
        bestScore: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      //console.log(`User stats initialized for ${email}`)

      if (createdBy === "self") {
        // Student signs up themselves → sign them out
        await signOut(auth)
        //console.log("Student signed out after signup (no auto-login).")
      } else if (createdBy === "tutor" && currentUser) {
        // Student created by tutor → restore tutor session
        await signInWithEmailAndPassword(auth, currentUser.email!, "password") // Assuming tutor's password is known or managed securely
        //console.log("Tutor session restored after creating student.")
      }

    } catch (error: any) {
      console.error("Error in signUp:", error)
      throw error
    }
  }

  const createStudentByTutor = async (
    email: string,
    password: string,
    name: string,
    studentYear: string,
    studentId: string
  ) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth,
        email,
        password
      );

      
      const userProfile = {
        id: userCredential.user.uid,
        email,
        name,
        role: "student",
        year: studentYear || "",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Save profile in Firestore
      await setDoc(doc(secondaryDb, "users", userCredential.user.uid), userProfile);

      // Initialize stats
      await setDoc(doc(secondaryDb, "user_stats", userCredential.user.uid), {
        totalQuizzes: 0,
        averageScore: 0,
        bestScore: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await updateDoc(doc(db, "students", studentId), {
        userID: userCredential.user.uid,
      });   

      //console.log("Student created successfully. Tutor remains logged in.");
    } catch (error) {
      console.error("Error creating student:", error);
    }
  };

  const sendStudentInvite = async (
    studentEmail: string,
    studentName: string,
    studentYear: string,
    createdBy: "self" | "tutor" = "tutor"
  ) => {
    try {
      // 1️⃣ Create a Firestore student doc (pending)
      const studentDocRef = collection(db, "students")
      await addDoc(studentDocRef, {
        name: studentName || studentEmail.split("@")[0],
        email: studentEmail,
        batch: studentYear,
        year: studentYear,
        joinedAt: new Date(),
        performance: { totalQuizzes: 0, averageScore: 0, lastActive: new Date() },
        pending: true,
        createdBy,
      })
      //console.log(`Student doc created (pending): ${studentEmail}`)

      // 2️⃣ Send magic sign-in link (passwordless)
      const actionCodeSettings = {
        url: "https://your-app.com/complete-signup", // Page where student completes signup
        handleCodeInApp: true,
      }

      await sendSignInLinkToEmail(auth, studentEmail, actionCodeSettings)
      //console.log(`Invite link sent to student: ${studentEmail}`)

      // Store email locally so student can retrieve it on signup page
      window.localStorage.setItem("studentEmail", studentEmail)
    } catch (error) {
      console.error("Error sending student invite:", error)
      throw error
    }
  }


  const logout = async () => {
    await signOut(auth)
  }
  
  const deleteUserAccount = async (uid?: string) => {
    try {
      // Determine target UID
      const targetUid = uid || auth.currentUser?.uid;
      if (!targetUid) throw new Error("No user ID provided.");

      // Get current user's role
      const currentUserDoc = await getDoc(doc(db, "users", auth.currentUser!.uid));
      const currentUserRole = currentUserDoc.data()?.role;

      
      // If current user is a tutor deleting a student
      if (uid && currentUserRole === "tutor") {
        // Delete Firestore student data
        await deleteDoc(doc(db, "users", targetUid));
        //console.log('user doc delete!');
        
        await deleteDoc(doc(db, "user_stats", targetUid));
        //console.log('user_stats doc delete!');
        // await deleteDoc(doc(db, "students", targetUid));
        //console.log(`Tutor deleted Firestore data for student UID: ${targetUid}`);
        //console.log("To delete Auth account, use Admin SDK or Cloud Function.");
        return;
      }

      // If user is deleting self
      if (!uid && auth.currentUser) {
        // Delete Firestore data
        await deleteDoc(doc(db, "users", targetUid));
        await deleteDoc(doc(db, "user_stats", targetUid));
        await deleteDoc(doc(db, "students", targetUid));
        //console.log(`User deleted Firestore data for UID: ${targetUid}`);

        // Delete Firebase Auth account
        await deleteUser(auth.currentUser);
        //console.log("User deleted from Firebase Auth.");
        return;
      }

      // If none of the above
      throw new Error("You do not have permission to delete this user.");
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signIn, signUp, createStudentByTutor, sendStudentInvite, logout, isTutor, deleteUserAccount }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

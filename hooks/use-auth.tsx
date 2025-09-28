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
} from "firebase/auth"
import { addDoc, collection, deleteDoc, doc, getDoc, setDoc, updateDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import type { User } from "@/lib/types"

interface AuthContextType {
  user: FirebaseUser | null
  userProfile: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string, role?: "student" | "tutor", createdBy?: "self" | "tutor", studentId: string, studentYear: string) => Promise<void>
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

  const signUp = async (email: string, password: string, name: string, role: "student" | "tutor" = "student", createdBy: "self" | "tutor" = "self", studentId: string, studentYear: string) => {
    try {
      console.log(` Creating account for ${email} with role ${role}`)
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)

      const detectedRole =
        email.includes("tutor") || email.includes("teacher") || email.includes("admin") ? "tutor" : role

      const userProfile: User = {
        id: userCredential.user.uid,
        email,
        name,
        role: detectedRole,
        year: studentYear || '',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      try {
        await setDoc(doc(db, "users", userCredential.user.uid), userProfile)
        console.log(` User profile created in Firestore for ${email}`)
        setUserProfile(userProfile)

        await setDoc(doc(db, "user_stats", userCredential.user.uid), {
          totalQuizzes: 0,
          averageScore: 0,
          bestScore: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        console.log(` User stats initialized for ${email}`)

        // 🔑 Sign the user out immediately after signup
       // Behavior based on creator
        if (createdBy === "self") {
          await signOut(auth)
          console.log(" Student signed out after signup (no auto-login).")
        } else {
          if (!studentId) {
            throw new Error("studentId is required when tutor creates a student.")
          }
          await updateDoc(doc(db, "students", studentId), {
            userID: userCredential.user.uid,
          })
          console.log(` Student doc (${studentId}) updated with userID.`)
        }   
      } catch (firestoreError) {
        console.error(" Error creating user profile in Firestore:", firestoreError)
        throw new Error("Failed to create user profile. Please try again.")
      }
    } catch (error: any) {
      console.error(" Error in signUp:", error)
      throw error
    }
  }
  
  const logout = async () => {
    await signOut(auth)
  }
  
  const deleteUserAccount = async (uid?: string) => {
    try {
      let targetUid = uid || auth.currentUser?.uid

      if (!targetUid) throw new Error("No user ID provided.")

      // Delete Firestore user profile
      await deleteDoc(doc(db, "users", targetUid))
      await deleteDoc(doc(db, "user_stats", targetUid))
      console.log(` User Firestore data deleted for UID: ${targetUid}`)

      // If deleting self, also remove from Firebase Auth
      if (!uid && auth.currentUser) {
        await deleteUser(auth.currentUser)
        console.log(" User deleted from Firebase Auth.")
      } else {
        console.log(" Firestore user deleted, but Auth deletion requires Admin SDK.")
      }

    } catch (error) {
      console.error(" Error deleting user:", error)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signIn, signUp, logout, isTutor, deleteUserAccount }}>
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

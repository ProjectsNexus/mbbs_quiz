import { initializeApp } from "firebase/app"
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth"
import { getFirestore, doc, setDoc, collection, addDoc } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

async function setupDemoAccounts() {
  console.log("Setting up demo accounts...")

  try {
    let studentCredential, tutorCredential

    try {
      // Create demo student account
      studentCredential = await createUserWithEmailAndPassword(auth, "student@demo.com", "password")
      console.log("✅ Demo student account created")
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        console.log("ℹ️ Demo student account already exists")
        // Get existing user for profile creation
        studentCredential = await signInWithEmailAndPassword(auth, "student@demo.com", "password")
      } else {
        throw error
      }
    }

    await setDoc(doc(db, "users", studentCredential.user.uid), {
      id: studentCredential.user.uid,
      email: "student@demo.com",
      name: "Demo Student",
      role: "student",
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    try {
      // Create demo tutor account
      tutorCredential = await createUserWithEmailAndPassword(auth, "tutor@demo.com", "password")
      console.log("✅ Demo tutor account created")
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        console.log("ℹ️ Demo tutor account already exists")
        const { signInWithEmailAndPassword } = await import("firebase/auth")
        tutorCredential = await signInWithEmailAndPassword(auth, "tutor@demo.com", "password")
      } else {
        throw error
      }
    }

    await setDoc(doc(db, "users", tutorCredential.user.uid), {
      id: tutorCredential.user.uid,
      email: "tutor@demo.com",
      name: "Dr. Demo Tutor",
      role: "tutor",
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Add sample students to database
    const sampleStudents = [
      { name: "John Doe", email: "john@student.com", batch: "Batch A", year: "1st Year MBBS" },
      { name: "Jane Smith", email: "jane@student.com", batch: "Batch A", year: "1st Year MBBS" },
      { name: "Mike Johnson", email: "mike@student.com", batch: "Batch B", year: "2nd Year MBBS" },
      { name: "Sarah Wilson", email: "sarah@student.com", batch: "Batch B", year: "2nd Year MBBS" },
    ]

    for (const student of sampleStudents) {
      await addDoc(collection(db, "students"), {
        ...student,
        joinedAt: new Date(),
        performance: {
          totalQuizzes: Math.floor(Math.random() * 10) + 1,
          averageScore: Math.floor(Math.random() * 40) + 60,
          lastActive: new Date(),
        },
      })
    }
    console.log("✅ Sample students added")

    // Add sample quiz data
    const sampleQuiz = {
      title: "Anatomy Basics",
      description: "Basic anatomy concepts for 1st year MBBS students",
      subject: "Anatomy",
      topic: "Basic Concepts",
      difficulty: "easy",
      year: "1st Year MBBS",
      block: "A",
      questions: [
        {
          id: "q1",
          question: "Which of the following is the largest organ in the human body?",
          options: ["Heart", "Liver", "Skin", "Brain"],
          correctAnswer: 2,
          explanation:
            "The skin is the largest organ in the human body, covering the entire surface and serving as a protective barrier.",
          marks: 1,
          difficulty: "easy",
        },
      ],
      timeLimit: 30,
      totalMarks: 10,
      createdBy: tutorCredential.user.uid,
      isPublished: true,
      tags: ["anatomy", "basic", "1st-year"],
    }

    await addDoc(collection(db, "quizzes"), sampleQuiz)
    console.log("✅ Sample quiz added")

    // Add sample MBBS question structure
    const mbbsStructure = {
      "1st Year MBBS": {
        blocks: ["A", "B", "C", "D"],
        subjects: ["Anatomy", "Physiology", "Biochemistry"],
      },
      "2nd Year MBBS": {
        blocks: ["E", "F", "G", "H"],
        subjects: ["Pathology", "Microbiology", "Pharmacology"],
      },
      "3rd Year MBBS": {
        blocks: ["I", "J", "K", "L"],
        subjects: ["Medicine", "Surgery", "Pediatrics"],
      },
      "4th Year MBBS": {
        blocks: ["M", "N", "O", "P"],
        subjects: ["Obstetrics & Gynecology", "Orthopedics", "ENT"],
      },
      "Final Year MBBS": {
        blocks: ["Q"],
        subjects: ["Community Medicine", "Forensic Medicine", "Ophthalmology"],
      },
    }

    await setDoc(doc(db, "app_config", "mbbs_structure"), mbbsStructure)
    console.log("✅ MBBS structure added")

    console.log("🎉 Demo setup completed successfully!")
    console.log("Demo accounts:")
    console.log("Student: student@demo.com / password")
    console.log("Tutor: tutor@demo.com / password")
  } catch (error) {
    console.error("❌ Error setting up demo accounts:", error)
  }
}

setupDemoAccounts()

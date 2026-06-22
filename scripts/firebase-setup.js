// Firebase setup script for MBBS Quiz data structure
// This script would populate Firebase with the quiz structure

const admin = require("firebase-admin")

// Initialize Firebase Admin (you would need to add your service account key) 
admin.initializeApp({
  credential: admin.credential.applicationDefault()
  databaseURL: 'https://quiz-database-28b3e-default-rtdb.asia-southeast1.firebasedatabase.app'
  });

const db = admin.firestore()

// MBBS Quiz Data Structure
const MBBS_STRUCTURE = {
  "1st Year MBBS Topicwise Tests": {
    blocks: ["A", "B", "C"],
    subjects: {
      A: ["Anatomy", "Physiology", "Biochemistry"],
      B: ["Anatomy", "Physiology", "Biochemistry"],
      C: ["Anatomy", "Physiology", "Biochemistry"],
    },
  },
  "2nd Year MBBS Topicwise Tests": {
    blocks: ["D", "E", "F"],
    subjects: {
      D: ["Pathology", "Pharmacology", "Microbiology"],
      E: ["Pathology", "Pharmacology", "Microbiology"],
      F: ["Pathology", "Pharmacology", "Microbiology"],
    },
  },
  "3rd Year MBBS Topicwise Tests": {
    blocks: ["G", "H", "I"],
    subjects: {
      G: ["Medicine", "Surgery", "Pediatrics"],
      H: ["Medicine", "Surgery", "Pediatrics"],
      I: ["Medicine", "Surgery", "Pediatrics"],
    },
  },
  "4th Year MBBS Topic Tests": {
    blocks: ["J", "K", "L", "M1", "M2"],
    subjects: {
      J: ["Medicine", "Surgery", "Obstetrics"],
      K: ["Medicine", "Surgery", "Obstetrics"],
      L: ["Medicine", "Surgery", "Obstetrics"],
      M1: ["ENT"],
      M2: ["Ophthalmology"],
    },
  },
  "Final Year MBBS Topicwise Tests": {
    blocks: ["N", "O", "P", "Q"],
    subjects: {
      N: ["Medicine", "Surgery", "Community Medicine"],
      O: ["Medicine", "Surgery", "Community Medicine"],
      P: ["Medicine", "Surgery", "Community Medicine"],
      Q: ["Medicine", "Surgery", "Community Medicine"],
    },
  },
}

// Sample questions for each subject
const sampleQuestions = [
  {
    question: "Which of the following is the primary function of the heart?",
    options: ["To filter blood", "To pump blood throughout the body", "To produce red blood cells", "To store oxygen"],
    correctAnswer: 1,
    explanation:
      "The heart's primary function is to pump blood throughout the body, delivering oxygen and nutrients to tissues and removing waste products.",
    difficulty: "easy",
  },
  {
    question: "What is the normal range for human body temperature?",
    options: ["35.5-36.5°C", "36.1-37.2°C", "37.5-38.5°C", "38.1-39.2°C"],
    correctAnswer: 1,
    explanation:
      "The normal human body temperature ranges from 36.1°C to 37.2°C (97°F to 99°F), with an average of 37°C (98.6°F).",
    difficulty: "easy",
  },
]

async function setupFirebaseData() {
  try {
    console.log("Setting up MBBS Quiz data structure...")

    // Create the main structure
    for (const [year, yearData] of Object.entries(MBBS_STRUCTURE)) {
      for (const block of yearData.blocks) {
        const subjects = yearData.subjects[block] || []

        for (const subject of subjects) {
          // Create test topics for each subject
          const testTopics = [
            "Basic Concepts",
            "Advanced Topics",
            "Clinical Applications",
            "Case Studies",
            "Review Questions",
          ]

          for (const testTopic of testTopics) {
            // Create path: /MBBS/{year}/{block}/{subject}/{testTopic}
            const path = `MBBS/${year}/${block}/${subject}/${testTopic}`

            // Add sample questions
            for (let i = 0; i < sampleQuestions.length; i++) {
              const questionPath = `${path}/question_${i + 1}`
              await db.doc(questionPath).set({
                ...sampleQuestions[i],
                id: `${year}_${block}_${subject}_${testTopic}_${i + 1}`,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
              })
            }
          }
        }
      }
    }

    console.log("Firebase data setup completed successfully!")
  } catch (error) {
    console.error("Error setting up Firebase data:", error)
  }
}

// Uncomment to run the setup
// setupFirebaseData();

module.exports = { setupFirebaseData, MBBS_STRUCTURE }

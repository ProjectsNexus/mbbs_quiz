import { initializeApp } from "firebase/app"
import { getFirestore, doc, writeBatch } from "firebase/firestore"

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
const db = getFirestore(app)

async function setupFirebaseDatabase() {
  console.log("🚀 Setting up Firebase database structure...")

  try {
    const batch = writeBatch(db)

    // 1. Setup MBBS curriculum structure
    const mbbsStructure = {
      "1st Year MBBS": {
        blocks: ["A", "B", "C", "D"],
        subjects: {
          Anatomy: {
            topics: [
              "Basic Concepts",
              "Musculoskeletal System",
              "Cardiovascular System",
              "Nervous System",
              "Respiratory System",
            ],
            description: "Study of human body structure",
          },
          Physiology: {
            topics: [
              "Cell Physiology",
              "Blood",
              "Cardiovascular Physiology",
              "Respiratory Physiology",
              "Renal Physiology",
            ],
            description: "Study of body functions",
          },
          Biochemistry: {
            topics: ["Biomolecules", "Enzymes", "Metabolism", "Molecular Biology", "Clinical Biochemistry"],
            description: "Chemical processes in living organisms",
          },
        },
      },
      "2nd Year MBBS": {
        blocks: ["E", "F", "G", "H"],
        subjects: {
          Pathology: {
            topics: ["General Pathology", "Systemic Pathology", "Clinical Pathology", "Hematology", "Immunology"],
            description: "Study of disease processes",
          },
          Microbiology: {
            topics: ["Bacteriology", "Virology", "Mycology", "Parasitology", "Immunology"],
            description: "Study of microorganisms",
          },
          Pharmacology: {
            topics: ["General Pharmacology", "Autonomic Drugs", "CNS Drugs", "Cardiovascular Drugs", "Antimicrobials"],
            description: "Study of drugs and their effects",
          },
        },
      },
      "3rd Year MBBS": {
        blocks: ["I", "J", "K", "L"],
        subjects: {
          Medicine: {
            topics: ["General Medicine", "Cardiology", "Pulmonology", "Gastroenterology", "Endocrinology"],
            description: "Internal medicine and clinical practice",
          },
          Surgery: {
            topics: ["General Surgery", "Orthopedics", "Neurosurgery", "Plastic Surgery", "Surgical Techniques"],
            description: "Surgical procedures and techniques",
          },
          Pediatrics: {
            topics: ["Neonatology", "Growth & Development", "Pediatric Diseases", "Immunization", "Nutrition"],
            description: "Medical care of children",
          },
        },
      },
      "4th Year MBBS": {
        blocks: ["M", "N", "O", "P"],
        subjects: {
          "Obstetrics & Gynecology": {
            topics: ["Obstetrics", "Gynecology", "Family Planning", "Reproductive Health", "Maternal Care"],
            description: "Women's health and childbirth",
          },
          Orthopedics: {
            topics: ["Fractures", "Joint Diseases", "Spine Disorders", "Sports Medicine", "Rehabilitation"],
            description: "Musculoskeletal system disorders",
          },
          ENT: {
            topics: ["Ear Diseases", "Nose & Sinus", "Throat Disorders", "Head & Neck Surgery", "Audiology"],
            description: "Ear, nose, and throat medicine",
          },
        },
      },
      "Final Year MBBS": {
        blocks: ["Q"],
        subjects: {
          "Community Medicine": {
            topics: ["Epidemiology", "Biostatistics", "Health Promotion", "Environmental Health", "Public Health"],
            description: "Population health and preventive medicine",
          },
          "Forensic Medicine": {
            topics: ["Medical Jurisprudence", "Autopsy", "Toxicology", "Identity", "Medical Ethics"],
            description: "Legal aspects of medicine",
          },
          Ophthalmology: {
            topics: ["Refractive Errors", "Glaucoma", "Cataract", "Retinal Diseases", "Eye Trauma"],
            description: "Eye diseases and vision care",
          },
        },
      },
    }

    batch.set(doc(db, "app_config", "mbbs_structure"), mbbsStructure)
    console.log("✅ MBBS curriculum structure added")

    // 2. Add sample questions for each subject
    const sampleQuestions = [
      // Anatomy Questions
      {
        subject: "Anatomy",
        year: "1st Year MBBS",
        block: "A",
        topic: "Basic Concepts",
        questions: [
          {
            id: "anat_001",
            question: "Which of the following is the largest organ in the human body?",
            options: ["Heart", "Liver", "Skin", "Brain"],
            correctAnswer: 2,
            explanation:
              "The skin is the largest organ in the human body, covering approximately 16% of total body weight and serving as the primary barrier against external environment.",
            difficulty: "easy",
            marks: 1,
          },
          {
            id: "anat_002",
            question: "The anatomical position is characterized by:",
            options: [
              "Body erect, arms at sides, palms facing backward",
              "Body erect, arms at sides, palms facing forward",
              "Body lying down, arms crossed",
              "Body sitting, arms raised",
            ],
            correctAnswer: 1,
            explanation:
              "The anatomical position is the standard reference position where the body is erect, arms at sides, and palms facing forward (anterior).",
            difficulty: "easy",
            marks: 1,
          },
        ],
      },
      // Physiology Questions
      {
        subject: "Physiology",
        year: "1st Year MBBS",
        block: "A",
        topic: "Cell Physiology",
        questions: [
          {
            id: "phys_001",
            question: "The resting membrane potential of a typical neuron is approximately:",
            options: ["-70 mV", "-90 mV", "+30 mV", "0 mV"],
            correctAnswer: 0,
            explanation:
              "The resting membrane potential of a typical neuron is approximately -70 mV, maintained by the sodium-potassium pump and selective membrane permeability.",
            difficulty: "medium",
            marks: 1,
          },
        ],
      },
      // Pathology Questions
      {
        subject: "Pathology",
        year: "2nd Year MBBS",
        block: "E",
        topic: "General Pathology",
        questions: [
          {
            id: "path_001",
            question: "Which of the following is NOT a cardinal sign of inflammation?",
            options: ["Rubor (redness)", "Tumor (swelling)", "Calor (heat)", "Pallor (paleness)"],
            correctAnswer: 3,
            explanation:
              "The cardinal signs of inflammation are rubor (redness), tumor (swelling), calor (heat), dolor (pain), and functio laesa (loss of function). Pallor is not a sign of inflammation.",
            difficulty: "medium",
            marks: 1,
          },
        ],
      },
    ]

    // Add questions to Firebase structure
    for (const subjectData of sampleQuestions) {
      const questionsPath = `MBBS/${subjectData.year}/${subjectData.block}/${subjectData.subject}/${subjectData.topic}`

      for (const question of subjectData.questions) {
        batch.set(doc(db, questionsPath, question.id), question)
      }
    }
    console.log("✅ Sample questions added")

    // 3. Add app settings
    const appSettings = {
      quiz_settings: {
        default_time_limit: 30, // minutes
        questions_per_quiz: 10,
        passing_score: 60, // percentage
        max_attempts: 3,
        show_results_immediately: true,
      },
      notification_settings: {
        email_notifications: true,
        quiz_reminders: true,
        result_notifications: true,
      },
      ui_settings: {
        theme: "system",
        language: "en",
        timezone: "UTC",
      },
    }

    batch.set(doc(db, "app_config", "settings"), appSettings)
    console.log("✅ App settings added")

    // 4. Add user roles and permissions
    const userRoles = {
      student: {
        permissions: ["take_quiz", "view_results", "view_profile", "update_profile"],
      },
      tutor: {
        permissions: [
          "create_quiz",
          "edit_quiz",
          "delete_quiz",
          "assign_quiz",
          "view_student_results",
          "manage_students",
          "send_notifications",
          "view_analytics",
        ],
      },
      admin: {
        permissions: ["all_permissions", "manage_users", "system_settings", "backup_data"],
      },
    }

    batch.set(doc(db, "app_config", "user_roles"), userRoles)
    console.log("✅ User roles and permissions added")

    // Commit all changes
    await batch.commit()
    console.log("🎉 Firebase database setup completed successfully!")

    // 5. Create indexes info (for manual setup in Firebase Console)
    console.log("\n📋 Manual Index Setup Required in Firebase Console:")
    console.log("Collection: quiz_sessions")
    console.log("  - userId (Ascending), createdAt (Descending)")
    console.log("Collection: student_performances")
    console.log("  - studentId (Ascending), completedAt (Descending)")
    console.log("Collection: notifications")
    console.log("  - recipients (Array), sentAt (Descending)")
    console.log("Collection: quizzes")
    console.log("  - createdBy (Ascending), createdAt (Descending)")
    console.log("  - isPublished (Ascending), subject (Ascending)")
  } catch (error) {
    console.error("❌ Error setting up Firebase database:", error)
  }
}

setupFirebaseDatabase()

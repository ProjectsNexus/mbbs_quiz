# MBBS Quiz Application

A comprehensive medical education platform for MBBS students with interactive quizzes, progress tracking, and detailed analytics.

## Features

### 🎓 Educational Features
- **Multi-Year Support**: Covers all 5 years of MBBS curriculum
- **Block-Based Organization**: Questions organized by blocks (A-Q) as per medical curriculum
- **Subject-Wise Quizzes**: Comprehensive coverage of all medical subjects
- **Two Quiz Modes**: 
  - **Practice Mode**: Immediate explanations after each question
  - **Exam Mode**: Results shown only at the end

### 🔐 Authentication & Security
- Firebase Authentication integration
- Secure user sessions
- Demo account for testing
- Password visibility toggle

### ⏱️ Advanced Timer System
- Customizable time limits (15-90 minutes)
- Window focus detection
- Auto-pause when user leaves window
- Auto-fail after 60 seconds of inactivity
- Real-time countdown display

### 📊 Analytics & Progress Tracking
- Detailed performance analysis
- Question-by-question review
- Score tracking and history
- Time spent analytics
- Difficulty-based categorization

### 🎨 User Experience
- **Responsive Design**: Works on all devices
- **Dark/Light Mode**: Toggle between themes
- **100vh Layout**: No scrolling, full-screen experience
- **Multi-Step Selection**: Intuitive quiz setup wizard
- **Professional Medical Theme**: Navy blue and coral color scheme

### 🔧 Technical Features
- **Firebase Integration**: Real-time database for questions and results
- **Next.js 15**: Latest React framework with App Router
- **TypeScript**: Full type safety
- **Tailwind CSS v4**: Modern styling with design tokens
- **shadcn/ui**: High-quality UI components

## Project Structure

\`\`\`
├── app/
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Main application entry point
│   └── globals.css         # Global styles and theme tokens
├── components/
│   ├── auth/               # Authentication components
│   ├── dashboard/          # Dashboard and navigation
│   ├── quiz/               # Quiz-related components
│   └── ui/                 # Reusable UI components
├── hooks/
│   ├── use-auth.tsx        # Authentication hook
│   ├── use-theme.tsx       # Theme management
│   └── use-quiz-timer.tsx  # Quiz timer with window detection
├── lib/
│   ├── firebase.ts         # Firebase configuration
│   ├── firebase-service.ts # Firebase data operations
│   └── quiz-data.ts        # Data types and structures
└── scripts/
    └── firebase-setup.js   # Database initialization script
\`\`\`

## Firebase Data Structure

Questions are stored in Firebase following this path structure:
\`\`\`
/MBBS/{year}/{block}/{subject}/{test topic}/{question number}/
\`\`\`

Example:
\`\`\`
/MBBS/1st Year MBBS Topicwise Tests/A/Anatomy/Basic Concepts/question_1/
\`\`\`

## Getting Started

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd mbbs-quiz-app
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up Firebase**
   - Create a new Firebase project
   - Enable Authentication and Firestore
   - Copy your Firebase config to `.env.local`
   - Run the setup script to populate initial data

4. **Configure environment variables**
   \`\`\`bash
   cp .env.example .env.local
   # Add your Firebase configuration
   \`\`\`

5. **Run the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

6. **Access the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

## Demo Account

For testing purposes, use:
- **Email**: demo@mbbsquiz.com
- **Password**: demo123456

## Quiz Flow

1. **Authentication**: Login or create account
2. **Dashboard**: View stats and start new quiz
3. **Quiz Selection**: 5-step wizard to configure quiz
   - Select Year (1st-Final Year MBBS)
   - Choose Block (A-Q based on year)
   - Pick Subject (varies by block)
   - Select Test Topic
   - Configure settings (mode, time, questions)
4. **Quiz Taking**: Answer questions with timer
5. **Results**: Detailed analysis and review

## Key Features Implementation

### Window Focus Detection
- Automatically pauses timer when user leaves window
- Shows warning message
- Ends quiz if away for more than 60 seconds

### Responsive Timer
- Real-time countdown display
- Color changes when time is running low
- Automatic submission when time expires

### Practice vs Exam Mode
- **Practice**: Shows explanations immediately
- **Exam**: No explanations until final results

### Multi-Step Selection
- Progressive disclosure of options
- Validation at each step
- Summary before starting quiz

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
# mbbs-quiz

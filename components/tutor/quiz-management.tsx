"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTutor } from "@/hooks/use-tutor"
import { useAuth } from "@/hooks/use-auth"
import { Plus, Search, Filter, Edit, Trash2, Eye, Send, BookOpen, Calendar, CheckCircle, XCircle, FileWarningIcon } from "lucide-react"
import type { Quiz, Question } from "@/lib/types"
import { MBBS_STRUCTURE } from "@/lib/quiz-data"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"
import { TooltipProvider } from "@radix-ui/react-tooltip"

interface QuizDetails {
  year?: keyof typeof MBBS_STRUCTURE
  block?: string
  subject?: string
  title?: string
  description?: string
  topic?: string
  difficulty?: "easy" | "medium" | "hard"
  timeLimit?: number
}

export function QuizManagement() {
  const { user } = useAuth()
  const { quizzes, createQuiz, updateQuiz, bulkUpdatedQuiz, deleteQuiz, publishQuiz, DraftQuiz, students } = useTutor()
  const [searchTerm, setSearchTerm] = useState("")
  const [isDisable, setisDisable] = useState(false)
  const [isFlterShow, setisFilerShow] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isUpadateDialogOpen, setIsUpadateDialogOpen] = useState(false)
  const [isBulkUpadateDialogOpen, setIsBulkUpadateDialogOpen] = useState(false)
  const [viewQuiz, setViewQuiz] = useState<Quiz | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDraftDialogOpen, setIsDraftDialogOpen] = useState(false)
  const [isJsonUploadDialogOpen, setIsJsonUploadDialogOpen] = useState(false)
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)
  const [selectedQuizzes, setSelectedQuizzes] = useState<string[]>([])

  const [newQuiz, setNewQuiz] = useState({
    title: "Test ",
    description: "",
    subject: "",
    topic: "",
    difficulty: "medium" as const,
    year: "3nd Year",
    block: "H",
    timeLimit: 60,
    questions: [] as Question[],
  })

  const [updatedQuiz, setUpdatedQuiz] = useState({
    id: "",
    title: "",
    description: "",
    subject: "",
    topic: "",
    difficulty: "",
    year: "",
    block: "",
    timeLimit: 0,
    questions: [] as Question[],
  })

  const [bulkUpdateQuiz, setbulkUpdateQuiz] = useState({
    id: "",
    subject: "",
    difficulty: "",
    year: "",
    block: "",
  })

  const [FilterBy, setFilerBy] = useState({
    year: "all",
    subject: "all",
    difficulty: "all",
    block: "all",
    status: "all",
    from: "",
    to: "",
  })

  const [newQuestion, setNewQuestion] = useState({
    question: "",
    options: ["", "", "", ""],
    answer: 0,
    explanation: "",
    marks: 1,
    difficulty: "medium" as const,
  })

  const [assignment, setAssignment] = useState({
    assignedTo: [] as string[],
    instructions: "",
  })

  // ✅ Fixed jsonUpload state
  const [jsonUpload, setJsonUpload] = useState({
    file: null as File | null,
    mapping: {
      questionField: "statement",
      optionsField: "options",
      answerField: "answer",
      explanationField: "explanation",
      marksField: "marks",
      difficultyField: "difficulty",
    },
    quizDetails: {
      title: "",
      description: "",
      subject: "",
      topic: "",
      difficulty: "medium" as const,
      year: "",
      block: "",
      timeLimit: 60,
    },
  })

  const yearData = MBBS_STRUCTURE
  const difficulties = ["easy", "medium", "hard"]
  const batches = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Final Year"]

  const filteredQuizzes = quizzes.filter((quiz) => {
    const matchesSearch =
      quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.topic.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesYear = FilterBy.year === "all" || quiz.year === FilterBy.year
    const matchesBlock = FilterBy.block === "all" || quiz.block === FilterBy.block
    const matchesSubject = FilterBy.subject === "all" || quiz.subject === FilterBy.subject
    const matchesDifficulty = FilterBy.difficulty === "all" || quiz.difficulty === FilterBy.difficulty
    const matchesStatus =
      FilterBy.status === "all" ||
      (FilterBy.status === "published" && quiz.isPublished) ||
      (FilterBy.status === "draft" && !quiz.isPublished)

    // ✅ Fixed createdAt handling
    const created =
      quiz.createdAt instanceof Date
        ? Math.floor(quiz.createdAt.getTime() / 1000)
        : quiz.createdAt && "seconds" in quiz.createdAt
        ? quiz.createdAt
        : 0

    let matchesCreatedAt = true
    if (FilterBy.from) {
      const fromTimestamp = new Date(FilterBy.from).getTime() / 1000
      matchesCreatedAt = created >= fromTimestamp
    }
    if (FilterBy.to) {
      const toTimestamp = new Date(FilterBy.to).getTime() / 1000
      matchesCreatedAt = matchesCreatedAt && created <= toTimestamp
    }

    return (
      matchesSearch &&
      matchesSubject &&
      matchesDifficulty &&
      matchesYear &&
      matchesBlock &&
      matchesCreatedAt &&
      matchesStatus
    )
  })

  const handleCreateQuiz = async () => {
    if (newQuiz.title && newQuiz.subject && newQuiz.questions.length > 0) {
      await createQuiz({
        ...newQuiz,
        totalMarks: newQuiz.questions.reduce((sum, q) => sum + q.marks, 0),
        createdBy: user?.uid || "",
        createdAt: new Date(),
        isPublished: false,
        tags: [newQuiz.subject, newQuiz.difficulty, newQuiz.year],
      })
      setNewQuiz({
        title: "",
        description: "",
        subject: "",
        topic: "",
        difficulty: "medium",
        year: "",
        block: "",
        timeLimit: 60,
        questions: [],
      })
      setIsCreateDialogOpen(false)
    }
  }

  const handleOpenUpdate = (quiz: Quiz) => {
    setUpdatedQuiz({
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      subject: quiz.subject,
      topic: quiz.topic,
      difficulty: quiz.difficulty,
      year: quiz.year,
      block: quiz.block,
      timeLimit: quiz.timeLimit,
      questions: quiz.questions || [],
    })
    setIsUpadateDialogOpen(true)
  }

  const handleUpdateQuiz = async () => {
    if (
      updatedQuiz.title &&
      updatedQuiz.subject &&
      updatedQuiz.year &&
      updatedQuiz.block &&
      updatedQuiz.questions.length > 0
    ) {
      await updateQuiz(updatedQuiz.id, {
        ...updatedQuiz,
        totalMarks: updatedQuiz.questions.reduce((sum, q) => sum + q.marks, 0),
        createdBy: user?.uid || "",
        createdAt: new Date(),
      })

      setUpdatedQuiz({
        id: "",
        title: "",
        description: "",
        subject: "",
        topic: "",
        difficulty: "",
        year: "",
        block: "",
        timeLimit: 0,
        questions: [],
      })

      setIsUpadateDialogOpen(false)
    }
  }

  const handleBulkUpdate = async () => {
    if (
      bulkUpdateQuiz.year &&
      bulkUpdateQuiz.block &&
      bulkUpdateQuiz.subject &&
      bulkUpdateQuiz.difficulty &&
      selectedQuizzes.length > 0
    ) {
      try {
        // Call your service function once with all quiz IDs
        await bulkUpdatedQuiz(
          selectedQuizzes.toString(), // ✅ array of quiz IDs
          {
            year: bulkUpdateQuiz.year,
            block: bulkUpdateQuiz.block,
            subject: bulkUpdateQuiz.subject,
            difficulty: bulkUpdateQuiz.difficulty
          }
        )

        console.log("✅ Bulk update completed")

        // Reset state
        setbulkUpdateQuiz({
          id: "",
          subject: "",
          difficulty: "",
          year: "",
          block: "",
        })

        setIsBulkUpadateDialogOpen(false)
      } catch (error) {
        console.error("❌ Error in bulk update:", error)
      }
    } else {
      
    }
  }


  const handleViewQuiz = (quiz: Quiz) => {
    setViewQuiz(quiz)
    setIsViewDialogOpen(true)
  }

  const handleAddQuestion = () => {
    if (newQuestion.question && newQuestion.options.every((opt) => opt.trim())) {
      setNewQuiz({
        ...newQuiz,
        questions: [...newQuiz.questions, { ...newQuestion, id: Date.now().toString() }],
      })
      setNewQuestion({
        question: "",
        options: ["", "", "", ""],
        answer: 0,
        explanation: "",
        marks: 1,
        difficulty: "medium",
      })
    }
  }

  const handleDraftQuiz = async () => {
    if (selectedQuiz && assignment.assignedTo.length > 0) {
      await assignQuiz({
        quizId: selectedQuiz.id,
        assignedTo: assignment.assignedTo,
        assignedBy: user?.uid || "",
        instructions: assignment.instructions,
        isActive: true,
      })
      setIsDraftDialogOpen(false)
      setSelectedQuiz(null)
      setAssignment({
        assignedTo: [],
        instructions: "",
      })
    }
  }

  const handleJsonUpload = async () => {
    if (!jsonUpload.file || !jsonUpload.quizDetails.title || !jsonUpload.quizDetails.year || !jsonUpload.quizDetails.subject ) return
    setisDisable(true);

    try {
      const fileContent = await jsonUpload.file.text()
      const jsonData = JSON.parse(fileContent)

    const questions: Question[] = jsonData.map((item: any, index: number) => {
        // Handle the specific format: { id, statement, options: {A, B, C, D, E}, answer, explanation }
        const optionsArray = item.options ? (Object.values(item.options) as string[]) : []

        // Convert answer letter (A, B, C, D, E) to index (0, 1, 2, 3, 4)
        const answerIndex = item.answer ? item.answer.charCodeAt(0) - "A".charCodeAt(0) : 0

        return {
          id: item.id || `q${index + 1}`,
          question: item.statement || item.question || "",
          options: optionsArray,
          answer: answerIndex,
          explanation: item.explanation || "",
          marks: 1,
          difficulty: "medium" as const,
        }
      })

      
      await createQuiz({
        ...jsonUpload.quizDetails,
        questions,
        totalMarks: questions.reduce((sum, q) => sum + q.marks, 0),
        createdBy: user?.uid || "",
        createdAt: new Date(),
        isPublished: false,
        tags: [jsonUpload.quizDetails.subject, jsonUpload.quizDetails.difficulty, jsonUpload.quizDetails.year],
      })

      // console.log(`Created quiz from JSON with ${questions.length} questions`)
      setIsJsonUploadDialogOpen(false)
      setisDisable(false);
      setJsonUpload({
        file: null,
        mapping: {
          questionField: "statement",
          optionsField: "options",
          answerField: "answer",
          explanationField: "explanation",
          marksField: "marks",
          difficultyField: "difficulty",
        },
        quizDetails: {
          title: "",
          description: "",
          subject: "",
          topic: "",
          difficulty: "medium",
          year: "2nd Year",
          block: "D",
          timeLimit: 60,
        },
      })
    } catch (error) {
      console.error("Error uploading JSON quiz:", error)
    }
  }

 
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Quiz Management</h2>
          <p className="text-muted-foreground">Create, edit, and manage your quizzes</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isJsonUploadDialogOpen} onOpenChange={setIsJsonUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-transparent">
                <Plus className="mr-2 h-4 w-4" />
                Upload JSON Quiz
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Upload Quiz from JSON</DialogTitle>
                <DialogDescription>
                  Upload a JSON file with quiz questions and customize field mapping
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Uploading Json File */}
                <div>
                  <Label htmlFor="  jsonFile">JSON File</Label>
                  <Input
                    id="jsonFile"
                    type="file"
                    accept=".json"
                    onChange={(e) => setJsonUpload({ ...jsonUpload, file: e.target.files?.[0] || null })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                {/* Quiz Title */}
                  <div>
                    <Label htmlFor="uploadTitle">Quiz Title</Label>
                    <Input
                      id="uploadTitle"
                      value={jsonUpload.quizDetails.title}
                      onChange={(e) =>
                        setJsonUpload({
                          ...jsonUpload,
                          quizDetails: { ...jsonUpload.quizDetails, title: e.target.value },
                        })
                      }
                      placeholder="Enter quiz title"
                    />
                  </div>

                  {/* Topic */}
                  <div>
                    <Label>Topic</Label>
                    <Input
                      value={jsonUpload.quizDetails.topic}
                      onChange={(e) =>
                        setJsonUpload({
                          ...jsonUpload,
                          quizDetails: {
                            ...jsonUpload.quizDetails,
                            topic: e.target.value,
                          },
                        })
                      }
                      placeholder="Enter topic"
                    />
                  </div>

                  {/* Year */}
                  <div>
                    <Label>Year</Label>
                    <Select
                      value={jsonUpload.quizDetails.year}
                      onValueChange={(value) =>
                        setJsonUpload({
                          ...jsonUpload,
                          quizDetails: {
                            ...jsonUpload.quizDetails,
                            year: value,
                            block: "",
                            subject: "",
                          },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(yearData).map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Block */}
                  
                    <div>
                      <Label>Block</Label>
                      <Select
                        value={jsonUpload.quizDetails.block}
                        onValueChange={(value) =>
                          setJsonUpload({
                            ...jsonUpload,
                            quizDetails: {
                              ...jsonUpload.quizDetails,
                              block: value,
                              subject: "",
                            },
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Block" />
                        </SelectTrigger>
                        {jsonUpload.quizDetails.year && yearData[jsonUpload.quizDetails.year as keyof typeof yearData] && (
                          <SelectContent>
                            {yearData[jsonUpload.quizDetails.year].blocks.map((block: string) => (
                              <SelectItem key={block} value={block}>
                                {block}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        )}
                      </Select>
                    </div>

                  {/* Subject */}
                  
                      <div>
                        <Label>Subject</Label>
                        <Select
                          value={jsonUpload.quizDetails.subject}
                          onValueChange={(value) =>
                            setJsonUpload({
                              ...jsonUpload,
                              quizDetails: {
                                ...jsonUpload.quizDetails,
                                subject: value,
                              },
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Subject" />
                          </SelectTrigger>
                          {jsonUpload.quizDetails.year &&
                          jsonUpload.quizDetails.block &&
                          yearData[jsonUpload.quizDetails.year]?.subjects[
                            jsonUpload.quizDetails.block
                          ] && (
                            <SelectContent>
                              {yearData[jsonUpload.quizDetails.year].subjects[
                                jsonUpload.quizDetails.block
                              ].map((subject: string) => (
                                <SelectItem key={subject} value={subject}>
                                  {subject}
                                </SelectItem>
                              ))}
                            </SelectContent>
                         )}
                        </Select>
                      </div>

                  {/* Difficulty */}
                      <div>
                        <Label>Difficulty</Label>
                        <Select
                          value={jsonUpload.quizDetails.difficulty}
                          onValueChange={(value) =>
                            setJsonUpload({
                              ...jsonUpload,
                              quizDetails: {
                                ...jsonUpload.quizDetails,
                                difficulty: value,
                              },
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Difficulty" />
                          </SelectTrigger>
                            <SelectContent>
                              {difficulties.map((difficulty: string) => (
                                <SelectItem key={difficulty} value={difficulty}>
                                  {difficulty}
                                </SelectItem>
                              ))}
                            </SelectContent>
                        </Select>
                      </div>

                  {/* Description */}
                  <div className="w-100">
                    <Label>Description</Label>
                    <Textarea
                      value={jsonUpload.quizDetails.description}
                      onChange={(e) =>
                        setJsonUpload({
                          ...jsonUpload,
                          quizDetails: {
                            ...jsonUpload.quizDetails,
                            description: e.target.value,
                          },
                        })
                      }
                      placeholder="Enter quiz description"
                    />
                  </div>
                </div>

                {/* JSON Mapping */}
                <div>
                  <Label>Field Mapping</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <Label htmlFor="questionField">Question Field</Label>
                      <Input
                        id="questionField"
                        value={jsonUpload.mapping.questionField}
                        onChange={(e) =>
                          setJsonUpload({
                            ...jsonUpload,
                            mapping: { ...jsonUpload.mapping, questionField: e.target.value },
                          })
                        }
                        placeholder="question"
                      />
                    </div>
                    <div>
                      <Label htmlFor="optionsField">Options Field</Label>
                      <Input
                        id="optionsField"
                        value={jsonUpload.mapping.optionsField}
                        onChange={(e) =>
                          setJsonUpload({
                            ...jsonUpload,
                            mapping: { ...jsonUpload.mapping, optionsField: e.target.value },
                          })
                        }
                        placeholder="options"
                      />
                    </div>
                    <div>
                      <Label htmlFor="answerField">Correct Answer Field</Label>
                      <Input
                        id="answerField"
                        value={jsonUpload.mapping.answerField}
                        onChange={(e) =>
                          setJsonUpload({
                            ...jsonUpload,
                            mapping: { ...jsonUpload.mapping, answerField: e.target.value },
                          })
                        }
                        placeholder="answer"
                      />
                    </div>
                    <div>
                      <Label htmlFor="explanationField">Explanation Field</Label>
                      <Input
                        id="explanationField"
                        value={jsonUpload.mapping.explanationField}
                        onChange={(e) =>
                          setJsonUpload({
                            ...jsonUpload,
                            mapping: { ...jsonUpload.mapping, explanationField: e.target.value },
                          })
                        }
                        placeholder="explanation"
                      />
                    </div>
                  </div>
                 </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsJsonUploadDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button id="upload_quiz_btn" onClick={handleJsonUpload} disabled={!jsonUpload.file || !jsonUpload.quizDetails.title || !jsonUpload.quizDetails.year || !jsonUpload.quizDetails.block || !jsonUpload.quizDetails.subject || isDisable}>
                    Upload Quiz
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                Create Quiz
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Quiz</DialogTitle>
                <DialogDescription>Design a new quiz for your students</DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="details" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="details">Quiz Details</TabsTrigger>
                  <TabsTrigger value="questions">Questions ({newQuiz.questions.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Title */}
                    <div>
                      <Label htmlFor="title">Quiz Title</Label>
                      <Input
                        id="title"
                        value={newQuiz.title}
                        onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })}
                        placeholder="Enter quiz title"
                      />
                    </div>
                    {/*Year */}
                    <div className="grid grid-cols-2 gap-4">
                      <Label htmlFor="year">Academic Year</Label>
                      <Select value={newQuiz.year} onValueChange={(value) => setNewQuiz({ ...newQuiz, year: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(yearData).map((year) => (
                            <SelectItem key={year} value={year}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {/*Topic */}
                    <div className="grid grid-cols-2 gap-4">
                      <Label htmlFor="topic">Topic</Label>
                      <Input
                        id="topic"
                        value={newQuiz.topic}
                        onChange={(e) => setNewQuiz({ ...newQuiz, topic: e.target.value })}
                        placeholder="Enter topic"
                      />
                    </div>
                    {/*Block */}
                    <div className="grid grid-cols-2 gap-4">
                      <Label htmlFor="block">Block</Label>
                      <Select value={newQuiz.block} onValueChange={(value) => setNewQuiz({ ...newQuiz, block: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select block" />
                        </SelectTrigger>
                        <SelectContent>
                          {newQuiz.year && yearData[newQuiz.year] && (
                            yearData[newQuiz.year].blocks.map((block: string) => (
                              <SelectItem key={block} value={block}>
                                {block}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/*Difficulty */}
                    <div className="grid grid-cols-2 gap-4">
                      <Label htmlFor="difficulty">Difficulty</Label>
                      <Select
                        value={newQuiz.difficulty}
                        onValueChange={(value: any) => setNewQuiz({ ...newQuiz, difficulty: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          {difficulties.map((diff) => (
                            <SelectItem key={diff} value={diff}>
                              {diff.charAt(0).toUpperCase() + diff.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {/*Subject */}
                    <div className="grid grid-cols-2 gap-4">
                      <Label htmlFor="subject">Subject</Label>
                      <Select
                        value={newQuiz.subject}
                        onValueChange={(value) => setNewQuiz({ ...newQuiz, subject: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                        {newQuiz.year &&
                          newQuiz.block &&
                          yearData[newQuiz.year]?.subjects[
                            newQuiz.block
                          ] && (
                              yearData[newQuiz.year].subjects[
                                newQuiz.block
                              ].map((subject: string) => (
                                <SelectItem key={subject} value={subject}>
                                  {subject}
                                </SelectItem>
                              ))
                         )}
                        </SelectContent>
                      </Select>
                    </div>
                    
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newQuiz.description}
                      onChange={(e) => setNewQuiz({ ...newQuiz, description: e.target.value })}
                      placeholder="Enter quiz description"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                    <Input
                      id="timeLimit"
                      type="number"
                      value={newQuiz.timeLimit}
                      onChange={(e) => setNewQuiz({ ...newQuiz, timeLimit: Number.parseInt(e.target.value) })}
                      min="1"
                      max="180"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="questions" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Add Question</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="question">Question</Label>
                        <Textarea
                          id="question"
                          value={newQuestion.question}
                          onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                          placeholder="Enter your question"
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {newQuestion.options.map((option, index) => (
                          <div key={index}>
                            <Label htmlFor={`option-${index}`}>Option {index + 1}</Label>
                            <Input
                              id={`option-${index}`}
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...newQuestion.options]
                                newOptions[index] = e.target.value
                                setNewQuestion({ ...newQuestion, options: newOptions })
                              }}
                              placeholder={`Enter option ${index + 1}`}
                            />
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="answer">Correct Answer</Label>
                          <Select
                            value={newQuestion.answer.toString()}
                            onValueChange={(value) =>
                              setNewQuestion({ ...newQuestion, answer: Number.parseInt(value) })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select correct option" />
                            </SelectTrigger>
                            <SelectContent>
                              {newQuestion.options.map((_, index) => (
                                <SelectItem key={index} value={index.toString()}>
                                  Option {index + 1}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="marks">Marks</Label>
                          <Input
                            id="marks"
                            type="number"
                            value={newQuestion.marks}
                            onChange={(e) => setNewQuestion({ ...newQuestion, marks: Number.parseInt(e.target.value) })}
                            min="1"
                            max="10"
                          />
                        </div>
                        <div>
                          <Label htmlFor="questionDifficulty">Difficulty</Label>
                          <Select
                            value={newQuestion.difficulty}
                            onValueChange={(value: any) => setNewQuestion({ ...newQuestion, difficulty: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select difficulty" />
                            </SelectTrigger>
                            <SelectContent>
                              {difficulties.map((diff) => (
                                <SelectItem key={diff} value={diff}>
                                  {diff.charAt(0).toUpperCase() + diff.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="explanation">Explanation (Optional)</Label>
                        <Textarea
                          id="explanation"
                          value={newQuestion.explanation}
                          onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
                          placeholder="Explain the correct answer"
                          rows={2}
                        />
                      </div>
                      <Button onClick={handleAddQuestion} className="w-full">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Question
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Questions List */}
                  {newQuiz.questions.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Questions ({newQuiz.questions.length})</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {newQuiz.questions.map((question, index) => (
                            <div key={question.id} className="p-4 border rounded-lg">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="font-medium">
                                    Q{index + 1}: {question.question}
                                  </p>
                                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                                    {question.options.map((option, optIndex) => (
                                      <div
                                        key={optIndex}
                                        className={`p-2 rounded ${optIndex === question.answer ? "bg-green-100 text-green-800" : "bg-muted"}`}
                                      >
                                        {optIndex + 1}. {option}
                                      </div>
                                    ))}
                                  </div>
                                  <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                                    <span>Marks: {question.marks}</span>
                                    <span>Difficulty: {question.difficulty}</span>
                                  </div>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const updatedQuestions = newQuiz.questions.filter((q) => q.id !== question.id)
                                    setNewQuiz({ ...newQuiz, questions: updatedQuestions })
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateQuiz}
                  disabled={!newQuiz.title || !newQuiz.subject || newQuiz.questions.length === 0}
                >
                  Create Quiz
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isUpadateDialogOpen} onOpenChange={setIsUpadateDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Update Quiz</DialogTitle>
                <DialogDescription>Update a quiz for your students</DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="details" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="details">Quiz Details</TabsTrigger>
                  <TabsTrigger value="questions">Questions ({updatedQuiz.questions.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Title */}
                    <div>
                      <Label htmlFor="title">Quiz Title</Label>
                      <Input
                        id="title"
                        value={updatedQuiz.title}
                        onChange={(e) => setUpdatedQuiz({ ...updatedQuiz, title: e.target.value })}
                        placeholder="Enter quiz title"
                      />
                    </div>
                    {/*Year */}
                    <div className="grid grid-cols-2 gap-4">
                      <Label htmlFor="year">Academic Year</Label>
                      <Select value={updatedQuiz.year} onValueChange={(value) => setUpdatedQuiz({ ...updatedQuiz, year: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(yearData).map((year) => (
                            <SelectItem key={year} value={year}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {/*Topic */}
                    <div className="grid grid-cols-2 gap-4">
                      <Label htmlFor="topic">Topic</Label>
                      <Input
                        id="topic"
                        value={updatedQuiz.topic}
                        onChange={(e) => setUpdatedQuiz({ ...updatedQuiz, topic: e.target.value })}
                        placeholder="Enter topic"
                      />
                    </div>
                    {/*Block */}
                    <div className="grid grid-cols-2 gap-4">
                      <Label htmlFor="block">Block</Label>
                      <Select value={updatedQuiz.block} onValueChange={(value) => setUpdatedQuiz({ ...updatedQuiz, block: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select block" />
                        </SelectTrigger>
                        <SelectContent>
                          {updatedQuiz.year && yearData[updatedQuiz.year] && (
                            yearData[updatedQuiz.year].blocks.map((block: string) => (
                              <SelectItem key={block} value={block}>
                                {block}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/*Difficulty */}
                    <div className="grid grid-cols-2 gap-4">
                      <Label htmlFor="difficulty">Difficulty</Label>
                      <Select
                        value={updatedQuiz.difficulty}
                        onValueChange={(value: any) => setUpdatedQuiz({ ...updatedQuiz, difficulty: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          {difficulties.map((diff) => (
                            <SelectItem key={diff} value={diff}>
                              {diff.charAt(0).toUpperCase() + diff.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {/*Subject */}
                    <div className="grid grid-cols-2 gap-4">
                      <Label htmlFor="subject">Subject</Label>
                      <Select
                        value={updatedQuiz.subject}
                        onValueChange={(value) => setUpdatedQuiz({ ...updatedQuiz, subject: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                        {updatedQuiz.year &&
                          updatedQuiz.block &&
                          yearData[updatedQuiz.year]?.subjects[
                            updatedQuiz.block
                          ] && (
                              yearData[updatedQuiz.year].subjects[
                                updatedQuiz.block
                              ].map((subject: string) => (
                                <SelectItem key={subject} value={subject}>
                                  {subject}
                                </SelectItem>
                              ))
                         )}
                        </SelectContent>
                      </Select>
                    </div>
                    
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={updatedQuiz.description}
                      onChange={(e) => setUpdatedQuiz({ ...updatedQuiz, description: e.target.value })}
                      placeholder="Enter quiz description"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                    <Input
                      id="timeLimit"
                      type="number"
                      value={updatedQuiz.timeLimit}
                      onChange={(e) => setUpdatedQuiz({ ...updatedQuiz, timeLimit: Number.parseInt(e.target.value) })}
                      min="1"
                      max="180"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="questions" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Add Question</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="question">Question</Label>
                        <Textarea
                          id="question"
                          value={newQuestion.question}
                          onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                          placeholder="Enter your question"
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {newQuestion.options.map((option, index) => (
                          <div key={index}>
                            <Label htmlFor={`option-${index}`}>Option {index + 1}</Label>
                            <Input
                              id={`option-${index}`}
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...newQuestion.options]
                                newOptions[index] = e.target.value
                                setNewQuestion({ ...newQuestion, options: newOptions })
                              }}
                              placeholder={`Enter option ${index + 1}`}
                            />
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="answer">Correct Answer</Label>
                          <Select
                            value={newQuestion.answer.toString()}
                            onValueChange={(value) =>
                              setNewQuestion({ ...newQuestion, answer: Number.parseInt(value) })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select correct option" />
                            </SelectTrigger>
                            <SelectContent>
                              {newQuestion.options.map((_, index) => (
                                <SelectItem key={index} value={index.toString()}>
                                  Option {index + 1}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="marks">Marks</Label>
                          <Input
                            id="marks"
                            type="number"
                            value={newQuestion.marks}
                            onChange={(e) => setNewQuestion({ ...newQuestion, marks: Number.parseInt(e.target.value) })}
                            min="1"
                            max="10"
                          />
                        </div>
                        <div>
                          <Label htmlFor="questionDifficulty">Difficulty</Label>
                          <Select
                            value={newQuestion.difficulty}
                            onValueChange={(value: any) => setNewQuestion({ ...newQuestion, difficulty: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select difficulty" />
                            </SelectTrigger>
                            <SelectContent>
                              {difficulties.map((diff) => (
                                <SelectItem key={diff} value={diff}>
                                  {diff.charAt(0).toUpperCase() + diff.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="explanation">Explanation (Optional)</Label>
                        <Textarea
                          id="explanation"
                          value={newQuestion.explanation}
                          onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
                          placeholder="Explain the correct answer"
                          rows={2}
                        />
                      </div>
                      <Button onClick={handleAddQuestion} className="w-full">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Question
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Questions List */}
                  {newQuiz.questions.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Questions ({updatedQuiz.questions.length})</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {updatedQuiz.questions.map((question, index) => (
                            <div key={question.id} className="p-4 border rounded-lg">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="font-medium">
                                    Q{index + 1}: {question.question}
                                  </p>
                                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                                    {question.options.map((option, optIndex) => (
                                      <div
                                        key={optIndex}
                                        className={`p-2 rounded ${optIndex === question.answer ? "bg-green-100 text-green-800" : "bg-muted"}`}
                                      >
                                        {optIndex + 1}. {option}
                                      </div>
                                    ))}
                                  </div>
                                  <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                                    <span>Marks: {question.marks}</span>
                                    <span>Difficulty: {question.difficulty}</span>
                                  </div>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const updatedQuestions = updatedQuiz.questions.filter((q) => q.id !== question.id)
                                    setUpdatedQuiz({ ...updatedQuiz, questions: updatedQuestions })
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsUpadateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateQuiz}
                  disabled={!updatedQuiz.title || !updatedQuiz.subject || updatedQuiz.questions.length === 0}
                >
                  Update Quiz
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isBulkUpadateDialogOpen} onOpenChange={setIsBulkUpadateDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Update Quiz</DialogTitle>
                <DialogDescription>Update a quiz for your students</DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="details" className="space-y-4"> 
                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    {/*Year */}
                    <div className="grid grid-cols-2 gap-4">
                      <Label htmlFor="year">Academic Year</Label>
                      <Select value={bulkUpdateQuiz.year} onValueChange={(value) => setbulkUpdateQuiz({ ...bulkUpdateQuiz, year: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(yearData).map((year) => (
                            <SelectItem key={year} value={year}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {/*Block */}
                    <div className="grid grid-cols-2 gap-4">
                      <Label htmlFor="block">Block</Label>
                      <Select value={bulkUpdateQuiz.block} onValueChange={(value) => setbulkUpdateQuiz({ ...bulkUpdateQuiz, block: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select block" />
                        </SelectTrigger>
                        <SelectContent>
                          {bulkUpdateQuiz.year && yearData[bulkUpdateQuiz.year] && (
                            yearData[bulkUpdateQuiz.year].blocks.map((block: string) => (
                              <SelectItem key={block} value={block}>
                                {block}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/*Difficulty */}
                    <div className="grid grid-cols-2 gap-4">
                      <Label htmlFor="difficulty">Difficulty</Label>
                      <Select
                        value={bulkUpdateQuiz.difficulty}
                        onValueChange={(value: any) => setbulkUpdateQuiz({ ...bulkUpdateQuiz, difficulty: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          {difficulties.map((diff) => (
                            <SelectItem key={diff} value={diff}>
                              {diff.charAt(0).toUpperCase() + diff.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {/*Subject */}
                    <div className="grid grid-cols-2 gap-4">
                      <Label htmlFor="subject">Subject</Label>
                      <Select
                        value={bulkUpdateQuiz.subject}
                        onValueChange={(value) => setbulkUpdateQuiz({ ...bulkUpdateQuiz, subject: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                        {bulkUpdateQuiz.year &&
                          bulkUpdateQuiz.block &&
                          yearData[bulkUpdateQuiz.year]?.subjects[
                            bulkUpdateQuiz.block
                          ] && (
                              yearData[bulkUpdateQuiz.year].subjects[
                                bulkUpdateQuiz.block
                              ].map((subject: string) => (
                                <SelectItem key={subject} value={subject}>
                                  {subject}
                                </SelectItem>
                              ))
                         )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsBulkUpadateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleBulkUpdate}>
                  Update Quiz
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="max-w-96 max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>{viewQuiz?.title}</DialogTitle>
                <DialogDescription>
                  Subject: {viewQuiz?.subject} | Year: {viewQuiz?.year} | Block: {viewQuiz?.block}
                </DialogDescription>
              </DialogHeader>

              {viewQuiz && (
                <div className="space-y-6 p-3 max-h-[80vh] overflow-auto">
                  <p className="text-muted-foreground">{viewQuiz.description}</p>

                  <div className="space-y-4">
                    {viewQuiz.questions.map((q, index) => (
                      <div key={q.id} className="p-4 border rounded-lg">
                        <p className="font-medium">
                          Q{index + 1}: {q.question}
                        </p>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                          {q.options.map((opt, optIndex) => (
                            <div
                              key={optIndex}
                              className={`p-2 rounded ${
                                optIndex === q.answer
                                  ? "bg-green-100 text-green-800"
                                  : "bg-muted"
                              }`}
                            >
                              {optIndex + 1}. {opt}
                            </div>
                          ))}
                        </div>
                        {q.explanation && (
                          <p className="mt-2 text-sm text-muted-foreground">
                            <strong>Explanation:</strong> {q.explanation}
                          </p>
                        )}
                        <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Marks: {q.marks}</span>
                          <span>Difficulty: {q.difficulty}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Quiz Library</CardTitle>
          <CardDescription>Manage all your created quizzes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search quizzes by Title, Topic & Subject "
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button className="cursor-pointer" onClick={() => {setisFilerShow(!isFlterShow)}}>
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          <div className={isFlterShow ? 'hidden' : 'flex'}>
            {/*by Year */}
            <Select value={FilterBy.year} onValueChange={(value) => setFilerBy({ ...FilterBy, year: value })}>
              <SelectTrigger className="w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Year</SelectItem>
                 {Object.keys(yearData).map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {/*By Block */}
            <Select value={FilterBy.block} onValueChange={(value) => setFilerBy({...FilterBy, block: value})}>
              <SelectTrigger className="w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Blocks</SelectItem>
                {FilterBy.year && yearData[FilterBy.year] && (
                  yearData[FilterBy.year].blocks.map((block: string) => (
                    <SelectItem key={block} value={block}>
                      {block}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {/*By subject */}
            <Select value={FilterBy.subject} onValueChange={(value) => setFilerBy({...FilterBy, subject: value})}>
              <SelectTrigger className="w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                  {FilterBy.year && FilterBy.block && yearData[FilterBy.year]?.subjects[ FilterBy.block ] && ( yearData[FilterBy.year].subjects[FilterBy.block].map((subject: string) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {/*By Difficulty */}
            <Select value={FilterBy.status} onValueChange={(value) => setFilerBy({...FilterBy, status: value})}>
              <SelectTrigger className="w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by S" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>

            {/* difficulty*/}
            <Select value={FilterBy.difficulty} onValueChange={(value) => setFilerBy({...FilterBy, difficulty: value})}>
              <SelectTrigger className="w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulty</SelectItem>
                  {difficulties.map((difficulty: string) => (
                    <SelectItem key={difficulty} value={difficulty}>
                      {difficulty}
                    </SelectItem>))}
              </SelectContent>
            </Select>
            {/*By Date */}
            {/* <div className="flex gap-2 items-center">
              <Label>From</Label>
              <Input
                type="date"
                value={FilterBy.from}
                onChange={(e) => setFilerBy({ ...FilterBy, from: e.target.value })}
              />
              <Label>To</Label>
              <Input
                type="date"
                value={FilterBy.to}
                onChange={(e) => setFilerBy({ ...FilterBy, to: e.target.value })}
              />
            </div> */}

            <Button className=" justify-end" onClick={() => setFilerBy({...FilterBy, year: 'all', block: 'all', subject: 'all', difficulty: 'all', to: '', from: '', status: 'all'})}> Clear Filter</Button>
          </div>

          {selectedQuizzes.length > 0 && (
            <div className="flex items-center gap-2 my-4">
              <span className="text-sm text-muted-foreground">
                {selectedQuizzes.length} quiz(es) selected
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  selectedQuizzes.forEach((id) => publishQuiz(id))
                  setSelectedQuizzes([])
                }}
              >
                Publish Selected
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  selectedQuizzes.forEach((id) => DraftQuiz(id))
                  setSelectedQuizzes([])
                }}
              >
                Unpublish Selected
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  selectedQuizzes.forEach((id) => deleteQuiz(id))
                  setSelectedQuizzes([])
                }}
                className="text-destructive hover:text-destructive"
              >
                Delete Selected
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsDraftDialogOpen(true)
                }}
              >
                Assign Selected
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {setIsBulkUpadateDialogOpen(true)}}
              >
                Update Selected
              </Button>
            </div>
          )}


          {/* Quizzes Table */}
          <Table className="w-full overflow-auto">
            <TableHeader>
              <TableRow>
                <TableHead>
                  <input type="checkbox" className="w-5" checked={selectedQuizzes.length === filteredQuizzes.length && filteredQuizzes.length > 0} 
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedQuizzes(filteredQuizzes.map((quiz) => quiz.id))
                      } else {
                        setSelectedQuizzes([])
                      }
                    }}
                  />
                </TableHead>
                <TableHead>Quiz</TableHead>
                <TableHead>Year / Block / Subject</TableHead>
                <TableHead>Questions</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuizzes.sort((a, b) => a.title.localeCompare(b.title)).map((quiz) => (
                <TableRow key={quiz.id} className="max-w-fit">
                    <TableCell>
                      <input
                        type="checkbox"
                        className="w-5"
                        checked={selectedQuizzes.includes(quiz.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedQuizzes([...selectedQuizzes, quiz.id])
                          } else {
                            setSelectedQuizzes(selectedQuizzes.filter((id) => id !== quiz.id))
                          }
                        }}
                      />
                    </TableCell>
                  {/* <TableCell className="w-16">
                    <div>
                      <div className="font-medium">{quiz.title}</div>
                      <div className="text-sm text-muted-foreground text-ellipsis w-1/2">{quiz.topic}</div>
                    </div>
                  </TableCell> */}
                  <TableCell className="w-64">
                    <div className="flex flex-col">
                      {/* Quiz Title */}
                      <div className="font-medium">{quiz.title}</div>

                      {/* Topic with truncation + tooltip */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className="text-sm text-muted-foreground truncate max-w-64">
                            {quiz.topic}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          {quiz.topic}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{quiz.year} / {quiz.block} / {quiz.subject}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span>{quiz.questions.length}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        quiz.difficulty === "easy"
                          ? "secondary"
                          : quiz.difficulty === "medium"
                            ? "default"
                            : "destructive"
                      }
                    >
                      {quiz.difficulty}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {quiz.isPublished ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-yellow-600" />
                      )}
                      <span className="text-sm">{quiz.isPublished ? "Published" : "Draft"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">  {quiz.createdAt && "seconds" in quiz.createdAt
                          ? new Date(quiz.createdAt.seconds * 1000).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "N/A"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => handleViewQuiz(quiz)}>
                              <Eye className="h-4 w-4" /> 
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View Quiz</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => handleOpenUpdate(quiz)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Edit Quiz</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      {quiz.isPublished ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => DraftQuiz(quiz.id)}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Unpublish Quiz</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => publishQuiz(quiz.id)}>
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Publish Quiz</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteQuiz(quiz.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Delete Quiz</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}


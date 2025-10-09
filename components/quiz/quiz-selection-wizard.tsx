"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
import { MBBS_STRUCTURE } from "@/lib/quiz-data"
import { ChevronLeft, ChevronRight, Clock, FileText, Target } from "lucide-react"
import { FirebaseService } from "@/lib/firebase-service"
import RangeSlider from "../ui/range"
import { StatusDialog } from "../ui/statusAlert"
import { Input } from "../ui/input"
import { Slider } from "../ui/slider"

interface QuizSelectionWizardProps {
  onStartQuiz: (config: QuizConfig) => void
  onBack: () => void
}

export interface QuizConfig {
  year: string
  block: string
  subject: string
  testTopic: string
  mode: "exam" | "practice"
  timeLimit: number | 0
  isTimer: boolean
  questionCountRange: [number, number] | 0
}

export function QuizSelectionWizard({ onStartQuiz, onBack }: QuizSelectionWizardProps) {
  const [step, setStep] = useState(1)
  const [testTopics, setTestTopics] = useState<{ topic: string; NumberQuestions: number; }[] | undefined>([])
  const [errorMessage, setErrorMessage] = useState('')
  const [MaxQuestionsAllow , setMaxQuestionsAllow] = useState(Number || 60)
  const [config, setConfig] = useState<Partial<QuizConfig>>({
    mode: "practice",
    timeLimit: 30,
    questionCountRange: [2, 10],
    isTimer: true
  })

  const totalSteps = 5
  const progress = (step / totalSteps) * 100
  
  const years = Object.keys(MBBS_STRUCTURE)
  const blocks = config.year ? MBBS_STRUCTURE[config.year as keyof typeof MBBS_STRUCTURE].blocks : []
  const subjects =
    config.year && config.block
      ? MBBS_STRUCTURE[config.year as keyof typeof MBBS_STRUCTURE].subjects[
          config.block as keyof (typeof MBBS_STRUCTURE)[keyof typeof MBBS_STRUCTURE]["subjects"]
        ] || []
      : []

  // Mock test topics - in real app, this would come from Firebase
  useEffect(() => {
    const fetchTopics = async () => {
      if (config.year && config.block && config.subject) {
        const topicDatials = await FirebaseService.getTestTopics(
          config.year,
          config.block,   // keep as string if service expects string
          config.subject  // keep as string if service expects string
        ) 
        setTestTopics(topicDatials || []) 
        
      } else {
        setTestTopics([])
      }
    }

    fetchTopics() // <--- call it!
  }, [config.year, config.block, config.subject])

  const canProceed = () => {
    switch (step) {
      case 1:
        return !!config.year
      case 2:
        return !!config.block
      case 3:
        return !!config.subject
      case 4:
        return !!config.testTopic
      case 5:
        return !!config.mode && !!config.timeLimit && !!config.questionCountRange
      default:
        return false
    }
  }

  const handleNext = async () => {
   if (step === 1) {
    if (!config.year) {
      setErrorMessage("Please select a year before continuing.")
      return
    }

    const allowStudent = await FirebaseService.checkStudentAllow(config.year)
    setErrorMessage("")
    if (!allowStudent) {
      setErrorMessage(
        `Access denied! Based on your selection of ${config.year}, this resource is not accessible.`
      )
      return
    }
  }
    //next step
    if (step < totalSteps && canProceed()) {
      setStep(step + 1)
    }     
  }

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleStartQuiz = () => {
    if (canProceed()) {
      onStartQuiz(config as QuizConfig)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-primary">Quiz Setup</h1>
          <Progress value={progress} className="w-full" />
          <p className="text-muted-foreground">
            Step {step} of {totalSteps}
          </p>
        </div>

        {errorMessage && (<StatusDialog status={errorMessage} onClose={() => setErrorMessage('')} />)}

        {/* Step Content */}
        <Card className="min-h-[400px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {step === 1 && (
                <>
                  <Target className="h-5 w-5" />
                  Select Year
                </>
              )}
              {step === 2 && (
                <>
                  <Target className="h-5 w-5" />
                  Select Block
                </>
              )}
              {step === 3 && (
                <>
                  <Target className="h-5 w-5" />
                  Select Subject
                </>
              )}
              {step === 4 && (
                <>
                  <FileText className="h-5 w-5" />
                  Select Test Topic
                </>
              )}
              {step === 5 && (
                <>
                  <Clock className="h-5 w-5" />
                  Quiz Settings
                </>
              )}
            </CardTitle>
            <CardDescription>
              {step === 1 && "Choose your MBBS year to get started"}
              {step === 2 && "Select the block you want to practice"}
              {step === 3 && "Pick the subject for your quiz"}
              {step === 4 && "Choose a specific test topic"}
              {step === 5 && "Configure your quiz preferences"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Step 1: Year Selection */}
            {step === 1 && (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-1">
                {years.map((year) => (
                  <Card
                    key={year}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      config.year === year ? "ring-2 ring-primary bg-primary/5" : ""
                    }`}
                    onClick={() =>
                      setConfig({ ...config, year, block: undefined, subject: undefined, testTopic: undefined })
                    }
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{year} MBBS Topicwise Tests</h3>
                          <p className="text-sm text-muted-foreground">
                            {MBBS_STRUCTURE[year as keyof typeof MBBS_STRUCTURE].blocks.length} blocks available
                          </p>
                        </div>
                        <Badge variant={config.year === year ? "default" : "secondary"}>
                          {MBBS_STRUCTURE[year as keyof typeof MBBS_STRUCTURE].blocks.join(", ")}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Step 2: Block Selection */}
            {step === 2 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {blocks.map((block) => (
                  <Card
                    key={block}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      config.block === block ? "ring-2 ring-primary bg-primary/5" : ""
                    }`}
                    onClick={() => setConfig({ ...config, block, subject: undefined, testTopic: undefined })}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary mb-2">Block {block}</div>
                      <p className="text-sm text-muted-foreground">{subjects.length} subjects</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Step 3: Subject Selection */}
            {step === 3 && (
              <div className="grid grid-cols-1 gap-4 p-3 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400/50 scrollbar-track-transparent hover:scrollbar-thumb-gray-600/70">
                {(subjects.length !== 0) ?
                  subjects.map((subject) => (
                    <Card
                      key={subject}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        config.subject === subject ? "ring-2 ring-primary bg-primary/5" : ""
                      }`}
                      onClick={() => setConfig({ ...config, subject, testTopic: undefined })}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{subject}</h3>
                            <p className="text-sm text-muted-foreground">Multiple test topics available</p>
                          </div>
                          <Badge variant={config.subject === subject ? "default" : "secondary"}>
                            Block {config.block}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  )) : (
                      <p className="text-sm text-muted-foreground italic text-center ">
                        No subject selected yet — add a subject to organize your quiz.
                      </p>
                  ) 
                }
              </div>
            )}

            {/* Step 4: Test Topic Selection */}
            {step === 4 && (
              <div className="grid grid-cols-1 gap-4 p-3 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400/50 scrollbar-track-transparent hover:scrollbar-thumb-gray-600/70">
                {testTopics != undefined && testTopics.length !== 0 ?
                  testTopics.map((topics) => (
                    <Card
                      key={topics.topic}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        config.testTopic === topics.topic ? "ring-2 ring-primary bg-primary/5" : ""
                      }`}
                      onClick={() => {setConfig({ ...config, testTopic: topics.topic }); setMaxQuestionsAllow(topics.NumberQuestions)}}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{topics.topic}</h3>
                            <p className="text-sm text-muted-foreground">
                              {config.subject} - Block {config.block}
                            </p>
                          </div>
                          <Badge variant="outline">{topics.NumberQuestions}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  )) : (
                    <p className="text-sm text-muted-foreground italic text-center ">
                      No Topic selected yet — add a topic to organize your quiz.
                    </p>
                  )
                }
              </div>
            )}

            {/* Step 5: Quiz Settings */}
            {step === 5 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Quiz Mode</Label>
                  <RadioGroup
                    value={config.mode}
                    onValueChange={(value: "exam" | "practice") => setConfig({ ...config, mode: value })}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="practice" id="practice" />
                      <Label htmlFor="practice" className="cursor-pointer">
                        <div>
                          <div className="font-medium">Practice Mode</div>
                          <div className="text-sm text-muted-foreground">See explanations after each question</div>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="exam" id="exam" />
                      <Label htmlFor="exam" className="cursor-pointer">
                        <div>
                          <div className="font-medium">Exam Mode</div>
                          <div className="text-sm text-muted-foreground">No explanations, results at the end</div>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Advence Setting</Label>
                  
                  <div>
                    <Label htmlFor="practice" className="cursor-pointer flex flex-row gap-2">
                      <Input type="checkbox" name="setTimer" id="settimer" className="w-3" checked={!config.isTimer} onClick={(e) => setConfig({ ...config, isTimer: !e.target.checked ? true : false }) }/>
                      <span>No Time Limit</span>
                    </Label>
                  </div>

                  <div>
                    <Label htmlFor="practice" className="cursor-pointer">Timer</Label>
                    <RangeSlider
                      name="timer"
                      min={0}
                      max={MaxQuestionsAllow}
                      disabled={!config.isTimer}
                      value={config.timeLimit != undefined ? config.timeLimit : 0}
                      onChange={(value) =>
                        setConfig({
                          ...config,
                          timeLimit: typeof value === "string" ? parseInt(value, 10) : value,
                        })
                      }
                    />
                  </div>
                
                  <div className="flex flex-col gap-5">
                    <Label htmlFor="questionCountRange" className="cursor-pointer">
                      Number of Questions
                    </Label>

                    <Slider
                      id="questionCountRange"
                      min={1}
                      max={MaxQuestionsAllow}
                      step={1}
                      // ✅ Must be an array for 2 handles
                      value={
                        Array.isArray(config.questionCountRange)
                          ? config.questionCountRange
                          : [1, MaxQuestionsAllow]
                      }
                      // ✅ shadcn/Radix uses onValueChange, not onChange
                      onValueChange={(value: number[]) => {
                        if (Array.isArray(value) && value.length === 2) {
                          setConfig({
                            ...config,
                            questionCountRange: value as [number, number],
                          })
                        }
                      }}
                    />

                    <div className="flex justify-between text-sm text-muted-foreground mt-2">
                      <span>Start: {config.questionCountRange?.[0] ?? 1}</span>
                      <span>End: {config.questionCountRange?.[1] ?? MaxQuestionsAllow}</span>
                    </div>
                  </div>

                </div>


                {/* Quiz Summary */}
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">Quiz Summary</h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="font-medium">Year:</span> {config.year}
                      </p>
                      <p>
                        <span className="font-medium">Block:</span> {config.block}
                      </p>
                      <p>
                        <span className="font-medium">Subject:</span> {config.subject}
                      </p>
                      <p>
                        <span className="font-medium">Topic:</span> {config.testTopic}
                      </p>
                      <p>
                        <span className="font-medium">Mode:</span> {config.mode === "practice" ? "Practice" : "Exam"}
                      </p>
                      <p>
                        <span className="font-medium">Duration:</span> {config.isTimer ? config.timeLimit + "minutes" : "No limit"}
                      </p>
                      <p>
                        <span className="font-medium">Questions:</span> {config.questionCountRange[0]} - {config.questionCountRange[1]}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={step === 1 ? onBack : handlePrevious}
            className="flex items-center gap-2 bg-transparent"
          >
            <ChevronLeft className="h-4 w-4" />
            {step === 1 ? "Back to Dashboard" : "Previous"}
          </Button>

          {step < totalSteps ? (
            <Button onClick={handleNext} disabled={!canProceed()} className="flex items-center gap-2">
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleStartQuiz}
              disabled={!canProceed()}
              className="flex items-center gap-2 bg-accent hover:bg-accent/90"
            >
              Start Quiz
              <Target className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}


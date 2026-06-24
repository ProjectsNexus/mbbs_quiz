"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { MBBS_STRUCTURE } from "@/lib/quiz-data"
import { ChevronLeft, ChevronRight, FileText, Target, Eye, BookOpen } from "lucide-react"
import { FirebaseService } from "@/lib/firebase-service"
import { StatusDialog } from "../ui/statusAlert"
import { NotesPdfViewer } from "./notes-pdf-viewer"
import type { Note } from "@/lib/types"

interface NotesSelectionWizardProps {
  onBack: () => void
}

interface NotesConfig {
  year?: string
  block?: string
  subject?: string
  topic?: string
}

export function NotesSelectionWizard({ onBack }: NotesSelectionWizardProps) {
  const [step, setStep] = useState(1)
  const [config, setConfig] = useState<NotesConfig>({})
  const [noteTopics, setNoteTopics] = useState<{ topic: string; NumberNotes: number }[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [errorMessage, setErrorMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [viewingNote, setViewingNote] = useState<Note | null>(null)

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

  // Fetch note topics once year/block/subject are picked
  useEffect(() => {
    const fetchTopics = async () => {
      if (config.year && config.block && config.subject) {
        setLoading(true)
        const topics = await FirebaseService.getNoteTopics(config.year, config.block, config.subject)
        setNoteTopics(topics || [])
        setLoading(false)
      } else {
        setNoteTopics([])
      }
    }
    fetchTopics()
  }, [config.year, config.block, config.subject])

  // Fetch notes once topic is picked
  useEffect(() => {
    const fetchNotes = async () => {
      if (config.year && config.block && config.subject && config.topic) {
        setLoading(true)
        const result = await FirebaseService.getNotes(config.year, config.block, config.subject, config.topic)
        setNotes(result || [])
        setLoading(false)
      } else {
        setNotes([])
      }
    }
    fetchNotes()
  }, [config.year, config.block, config.subject, config.topic])

  const canProceed = () => {
    switch (step) {
      case 1: return !!config.year
      case 2: return !!config.block
      case 3: return !!config.subject
      case 4: return !!config.topic
      case 5: return true
      default: return false
    }
  }

  const handleNext = async () => {
    if (step === 1 && !config.year) {
      setErrorMessage("Please select a year before continuing.")
      return
    }

    if (step === 1) {
      const allowStudent = await FirebaseService.checkStudentAllow(config.year!)
      setErrorMessage("")
      if (!allowStudent) {
        setErrorMessage(`Access denied! Based on your selection of ${config.year}, this resource is not accessible.`)
        return
      }
    }

    if (step < totalSteps && canProceed()) {
      setStep(step + 1)
    }
  }

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1)
  }

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "—"
    const kb = bytes / 1024
    if (kb < 1024) return `${kb.toFixed(0)} KB`
    return `${(kb / 1024).toFixed(1)} MB`
  }

  const stepTitles = ["Select Year", "Select Block", "Select Subject", "Select Topic", "View Notes"]
  const stepDescriptions = [
    "Choose your MBBS year to browse notes",
    "Select the block you want to study",
    "Pick the subject for your notes",
    "Choose a topic to view its notes",
    `Notes for "${config.topic}"`,
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-primary">Study Notes</h1>
          <Progress value={progress} className="w-full" />
          <p className="text-muted-foreground">
            Step {step} of {totalSteps}
          </p>
        </div>

        {errorMessage && <StatusDialog status={errorMessage} onClose={() => setErrorMessage("")} />}

        <Card className="min-h-[400px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {step === 5 ? <BookOpen className="h-5 w-5" /> : <Target className="h-5 w-5" />}
              {stepTitles[step - 1]}
            </CardTitle>
            <CardDescription>{stepDescriptions[step - 1]}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">

            {/* Step 1: Year */}
            {step === 1 && (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-1">
                {years.map((year) => (
                  <Card
                    key={year}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      config.year === year ? "ring-2 ring-primary bg-primary/5" : ""
                    }`}
                    onClick={() => setConfig({ year, block: undefined, subject: undefined, topic: undefined })}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{year} MBBS Notes</h3>
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

            {/* Step 2: Block */}
            {step === 2 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {blocks.map((block) => (
                  <Card
                    key={block}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      config.block === block ? "ring-2 ring-primary bg-primary/5" : ""
                    }`}
                    onClick={() => setConfig({ ...config, block, subject: undefined, topic: undefined })}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary mb-2">Block {block}</div>
                      <p className="text-sm text-muted-foreground">{subjects.length} subjects</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Step 3: Subject */}
            {step === 3 && (
              <div className="grid grid-cols-1 gap-4 p-3 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400/50 scrollbar-track-transparent hover:scrollbar-thumb-gray-600/70">
                {subjects.length !== 0 ? (
                  subjects.map((subject) => (
                    <Card
                      key={subject}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        config.subject === subject ? "ring-2 ring-primary bg-primary/5" : ""
                      }`}
                      onClick={() => setConfig({ ...config, subject, topic: undefined })}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{subject}</h3>
                            <p className="text-sm text-muted-foreground">Browse notes for this subject</p>
                          </div>
                          <Badge variant={config.subject === subject ? "default" : "secondary"}>
                            Block {config.block}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground italic text-center">
                    No subjects available for this block yet.
                  </p>
                )}
              </div>
            )}

            {/* Step 4: Topic */}
            {step === 4 && (
              <div className="grid grid-cols-1 gap-3 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400/50 scrollbar-track-transparent hover:scrollbar-thumb-gray-600/70">
                {loading ? (
                  <p className="text-sm text-muted-foreground italic text-center">Loading topics...</p>
                ) : noteTopics.length !== 0 ? (
                  noteTopics.map((t) => (
                    <Card
                      key={t.topic}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        config.topic === t.topic ? "ring-2 ring-primary bg-primary/5" : ""
                      }`}
                      onClick={() => setConfig({ ...config, topic: t.topic })}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{t.topic}</h3>
                            <p className="text-sm text-muted-foreground">
                              {config.subject} · Block {config.block}
                            </p>
                          </div>
                          <Badge variant="outline">
                            {t.NumberNotes} {t.NumberNotes === 1 ? "note" : "notes"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground italic text-center">
                    No notes have been uploaded for this subject yet.
                  </p>
                )}
              </div>
            )}

            {/* Step 5: Notes list */}
            {step === 5 && (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400/50 scrollbar-track-transparent hover:scrollbar-thumb-gray-600/70">
                {loading ? (
                  <p className="text-sm text-muted-foreground italic text-center">Loading notes...</p>
                ) : notes.length !== 0 ? (
                  notes.map((note) => (
                    <Card key={note.id}>
                      <CardContent className="p-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <FileText className="h-5 w-5 text-primary shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium truncate">{note.title}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {note.fileName} · {formatFileSize(note.fileSize)}
                            </p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => setViewingNote(note)}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground italic text-center">
                    No files found for this topic.
                  </p>
                )}
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
            <Button onClick={onBack} className="flex items-center gap-2 bg-accent hover:bg-accent/90">
              Done
              <BookOpen className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <NotesPdfViewer note={viewingNote} onClose={() => setViewingNote(null)} />
    </div>
  )
}
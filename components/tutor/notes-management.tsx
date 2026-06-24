"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FileText, Upload, Trash2, FileUp } from "lucide-react"
import { MBBS_STRUCTURE } from "@/lib/quiz-data"
import { FirebaseService } from "@/lib/firebase-service"
import { useAuth } from "@/hooks/use-auth"
import { StatusDialog } from "../ui/statusAlert"
import type { Note } from "@/lib/types"

export function NotesManagement() {
  const { user, userProfile } = useAuth()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [statusMessage, setStatusMessage] = useState("")

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [year, setYear] = useState<string>("")
  const [block, setBlock] = useState<string>("")
  const [subject, setSubject] = useState<string>("")
  const [topic, setTopic] = useState("")
  const [file, setFile] = useState<File | null>(null)

  const years = Object.keys(MBBS_STRUCTURE)
  const blocks = year ? MBBS_STRUCTURE[year as keyof typeof MBBS_STRUCTURE].blocks : []
  const subjects =
    year && block
      ? MBBS_STRUCTURE[year as keyof typeof MBBS_STRUCTURE].subjects[
          block as keyof (typeof MBBS_STRUCTURE)[keyof typeof MBBS_STRUCTURE]["subjects"]
        ] || []
      : []

  useEffect(() => {
    if (user?.uid) fetchNotes()
  }, [user?.uid])

  const fetchNotes = async () => {
    if (!user?.uid) return
    setLoading(true)
    const result = await FirebaseService.getNotesByTutor(user.uid)
    setNotes(result || [])
    setLoading(false)
  }

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setYear("")
    setBlock("")
    setSubject("")
    setTopic("")
    setFile(null)
  }

  const handleUpload = async () => {
    if (!file || !title || !year || !block || !subject || !topic) {
      setStatusMessage("Please fill all fields and choose a PDF file before uploading.")
      return
    }

    if (file.type !== "application/pdf") {
      setStatusMessage("Only PDF files are allowed for notes.")
      return
    }

    if (!user?.uid) {
      setStatusMessage("You must be logged in to upload notes.")
      return
    }

    setUploading(true)
    const noteId = await FirebaseService.uploadNote(file, {
      title,
      description,
      year,
      block,
      subject,
      topic,
      uploadedBy: user.uid,
      uploadedByName: userProfile?.name,
    })
    setUploading(false)

    if (noteId) {
      setStatusMessage("✅ Note uploaded successfully.")
      resetForm()
      fetchNotes()
    } else {
      setStatusMessage("Failed to upload note. Please try again.")
    }
  }

  const handleDelete = async (note: Note) => {
    const confirmed = window.confirm(`Delete "${note.title}"? This cannot be undone.`)
    if (!confirmed) return

    const success = await FirebaseService.deleteNote(note.id, note.filePath)
    if (success) {
      setNotes((prev) => prev.filter((n) => n.id !== note.id))
      setStatusMessage("✅ Note deleted.")
    } else {
      setStatusMessage("Failed to delete note.")
    }
  }

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "—"
    const kb = bytes / 1024
    if (kb < 1024) return `${kb.toFixed(0)} KB`
    return `${(kb / 1024).toFixed(1)} MB`
  }

  return (
    <div className="space-y-6">
      {statusMessage && <StatusDialog status={statusMessage} onClose={() => setStatusMessage("")} />}

      {/* Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileUp className="h-5 w-5" />
            Upload Note (PDF)
          </CardTitle>
          <CardDescription>
            Notes are organized the same way as quizzes — by Year, Block, Subject and Topic.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Cardiac Cycle Notes" />
            </div>
            <div className="space-y-2">
              <Label>Topic</Label>
              <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Basic Concepts" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description (optional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description of this note"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Year</Label>
              <Select value={year} onValueChange={(v) => { setYear(v); setBlock(""); setSubject("") }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={y}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Block</Label>
              <Select value={block} onValueChange={(v) => { setBlock(v); setSubject("") }} disabled={!year}>
                <SelectTrigger>
                  <SelectValue placeholder="Select block" />
                </SelectTrigger>
                <SelectContent>
                  {blocks.map((b) => (
                    <SelectItem key={b} value={b}>
                      Block {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Subject</Label>
              <Select value={subject} onValueChange={setSubject} disabled={!block}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>PDF File</Label>
            <Input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            {file && <p className="text-xs text-muted-foreground">{file.name} ({formatFileSize(file.size)})</p>}
          </div>

          <Button onClick={handleUpload} disabled={uploading} className="w-full">
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? "Uploading..." : "Upload Note"}
          </Button>
        </CardContent>
      </Card>

      {/* Existing Notes List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Uploaded Notes
          </CardTitle>
          <CardDescription>Notes you have uploaded across all years and blocks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 max-h-[50vh] overflow-y-auto">
          {loading ? (
            <p className="text-sm text-muted-foreground italic">Loading notes...</p>
          ) : notes.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No notes uploaded yet.</p>
          ) : (
            notes.map((note) => (
              <div key={note.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="h-5 w-5 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium truncate">{note.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {note.year} · Block {note.block} · {note.subject} · {note.topic}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline">{formatFileSize(note.fileSize)}</Badge>
                  <Button asChild size="sm" variant="outline">
                    <a href={note.fileUrl} target="_blank" rel="noopener noreferrer">
                      View
                    </a>
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(note)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
